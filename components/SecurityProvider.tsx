"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Initial mounting check: if not on login page, verify unlock status
    const checkSecurityOnMount = async () => {
      if (pathname !== "/login") {
        const isUnlocked = sessionStorage.getItem("app_unlocked") === "true";
        if (!isUnlocked) {
          // Immediately call logout to clear the server cookie
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          router.replace("/login");
          return;
        }
      }
      setIsReady(true);
    };

    checkSecurityOnMount();
  }, [pathname, router]);

  useEffect(() => {
    // 2. Capacitor App State change listener (foreground/background)
    let appListener: any = null;

    const initCapacitorAppLock = async () => {
      try {
        const { App } = await import('@capacitor/app');

        appListener = await App.addListener('appStateChange', async ({ isActive }) => {
          if (!isActive) {
            // App went to background (locked, minimized, or switched app)
            // Immediately clear sessionStorage
            sessionStorage.removeItem("app_unlocked");
            
            // Call logout to destroy session on the server
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
            
            if (pathname !== "/login") {
              router.replace("/login");
            }
          } else {
            // App came back to foreground
            const isUnlocked = sessionStorage.getItem("app_unlocked") === "true";
            if (!isUnlocked && pathname !== "/login") {
              // Re-verify session destruction and force redirect
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
              router.replace("/login");
            }
          }
        });
      } catch (err) {
        // Safe fallback for standard browser/web environments
        console.warn("Capacitor App plugin not loaded, operating in web mode.");
      }
    };

    initCapacitorAppLock();

    return () => {
      if (appListener) {
        appListener.remove();
      }
    };
  }, [pathname, router]);

  // Prevent flash of content if user is on a protected page but not authenticated yet
  if (!isReady && pathname !== "/login") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Securing session…</div>
      </div>
    );
  }

  return <>{children}</>;
}
