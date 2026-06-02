// components/AppShell.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

// ─── SVG Icons ──────────────────────────────────────────────
function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TaskIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ActivityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function SettingsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

// ─── Nav config ─────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/tasks", label: "Tasks", Icon: TaskIcon },
  { href: "/activity", label: "Activity", Icon: ActivityIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

// ─── Brand component ─────────────────────────────────────────
function Brand({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="brand" style={{ padding: "14px 12px", gap: 10, display: "flex", alignItems: "center" }}>
      <div className="brand-logo" style={{ background: "transparent", width: 40, height: 40, flexShrink: 0 }}>
        <Image src={logoUrl || "/logo.png"} alt="logo" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
      </div>
      <span className="brand-name" style={{ fontSize: "13px", fontWeight: 700, lineHeight: "1.3" }}>Agency-demo</span>
    </div>
  );
}

// ─── Sidebar (web) ───────────────────────────────────────────
function Sidebar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Brand logoUrl={logoUrl} />
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-nav-item${pathname.startsWith(href) ? " active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// ─── Footer Nav (mobile) ─────────────────────────────────────
function FooterNav() {
  const pathname = usePathname();
  return (
    <nav className="footer-nav">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`footer-nav-btn${active ? " active" : ""}`}
          >
            <span className="nav-icon">
              <Icon size={20} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Mobile Header ───────────────────────────────────────────
function MobileHeader({ logoUrl }: { logoUrl?: string }) {
  return (
    <header className="mobile-header" style={{ padding: "12px 16px", gap: 12, height: "64px", alignItems: "center" }}>
      <div className="brand-logo" style={{ width: 40, height: 40, background: "transparent", flexShrink: 0 }}>
        <Image src={logoUrl || "/logo.png"} alt="logo" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
      </div>
      <span className="brand-name" style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>Agency-demo</span>
    </header>
  );
}

// ─── AppShell ────────────────────────────────────────────────
export default function AppShell({
  children,
  logoUrl,
}: {
  children: React.ReactNode;
  logoUrl?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // APP LOCK LOGIC
// APP LOCK LOGIC
  useEffect(() => {
    let appListener: any = null;

    const initCapacitorAppLock = async () => {
      try {
        const { App } = await import('@capacitor/app');
        
        appListener = await App.addListener('appStateChange', async ({ isActive }) => {
          if (!isActive && pathname !== "/login") {
            // When app goes to background, instantly hide the UI by navigating to login
            // (This prevents the app switcher from showing sensitive data)
            router.replace("/login");
          } 
          else if (isActive && pathname !== "/login") {
            // When app comes BACK to the foreground, the network is active again.
            // Safely destroy the session so they are forced to enter the PIN.
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
            router.replace("/login");
          }
        });
      } catch (err) {
        console.warn("Capacitor App plugin not loaded.");
      }
    };

    initCapacitorAppLock();

    return () => {
      if (appListener) {
        appListener.remove();
      }
    };
  }, [pathname, router]);

  return (
    <div className="app-layout">
      {/* Web sidebar */}
      <Sidebar logoUrl={logoUrl} />

      {/* Main content */}
      <div className="main-content">
        {/* Mobile header (hidden on desktop via CSS) */}
        <MobileHeader logoUrl={logoUrl} />

        {/* Page content */}
        <div className="mobile-page">
          {children}
        </div>
      </div>

      {/* Mobile footer nav */}
      <FooterNav />
    </div>
  );
}