"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/components/ThemeProvider";
import toast from "react-hot-toast";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  logoUrl?: string;
  darkMode: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();

  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSaving, setPinSaving] = useState(false);

  // Stock fields
  const [stockFilled, setStockFilled] = useState("");
  const [stockEmpty, setStockEmpty] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  // Backup & Restore fields
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setProfile(data);
        }
      });

    fetch("/api/stock")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setStockFilled(String(data.totalFilled));
          setStockEmpty(String(data.totalEmpty));
        }
      });
  }, []);

  

  async function handleSaveStock() {
    setStockSaving(true);
    try {
      const res = await fetch("/api/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalFilled: parseInt(stockFilled) || 0,
          totalEmpty: parseInt(stockEmpty) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Stock updated");
    } catch {
      toast.error("Could not update stock");
    } finally {
      setStockSaving(false);
    }
  }
  async function handleChangePin() {
  if (!currentPin || !newPin || !confirmPin) {
    toast.error("Please fill all fields");
    return;
  }

  if (newPin !== confirmPin) {
    toast.error("PINs do not match");
    return;
  }

  if (newPin.length < 4) {
    toast.error("PIN must be at least 4 digits");
    return;
  }

  setPinSaving(true);

  try {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPin,
        newPin,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    toast.success("PIN updated successfully");

    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  } catch (err: any) {
    toast.error(err.message || "Could not update PIN");
  } finally {
    setPinSaving(false);
  }
}

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleExportBackup() {
    setExporting(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = res.headers.get("content-disposition");
      let fileName = `ssga_database_backup_${new Date().toISOString().split("T")[0]}.json`;
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) fileName = matches[1];
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Database backup downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Could not export backup");
    } finally {
      setExporting(false);
    }
  }

  async function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      "WARNING: Restoring a backup will COMPLETELY erase and replace all current customer records, transactions, empty cylinder counts, and notes. This cannot be undone!\n\nAre you absolutely sure you want to proceed?"
    );
    if (!confirmRestore) {
      e.target.value = "";
      return;
    }

    setRestoring(true);
    const loadingToast = toast.loading("Restoring backup...");
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Restoration failed");

      toast.success("Database successfully restored!", { id: loadingToast });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not restore backup", { id: loadingToast });
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  }

  return (
    <AppShell>
      <div className="page-title">Settings</div>

      {/* ── Appearance ───────────────────────────────────────── */}
      <div className="settings-section">
        <div className="settings-section-title">Appearance</div>
        <div className="settings-row">
          <label htmlFor="dark-toggle">Dark Mode</label>
          <label className="toggle">
            <input
              id="dark-toggle"
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* ── Data Safety & Backup ─────────────────────────────── */}
      <div className="settings-section">
        <div className="settings-section-title">Data Safety & Backup</div>
        <div style={{ padding: "14px 16px" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            Protect your valuable agency records. Export a secure backup file of your entire database or restore from an existing backup file.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleExportBackup}
              disabled={exporting}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              📥 {exporting ? "Exporting..." : "Backup Data"}
            </button>
            <label
              className="btn btn-outline"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", margin: 0, textAlign: "center" }}
            >
              📤 {restoring ? "Restoring..." : "Restore Data"}
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={restoring}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <p style={{ fontSize: 11, color: "var(--danger)", margin: 0 }}>
            ⚠️ Restoring a backup will completely replace all existing records. Make sure the backup file is valid.
          </p>
        </div>
      </div>
<div className="settings-section">
  <div className="settings-section-title">
    Security
  </div>

  <div
    style={{
      padding: "18px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "rgba(59,130,246,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        🔐
      </div>

      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Update Security PIN
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          Change your login PIN securely
        </div>
      </div>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 6,
      }}
    >
      <input
        type="password"
        placeholder="Current PIN"
        value={currentPin}
        onChange={(e) =>
          setCurrentPin(e.target.value)
        }
        className="input"
        style={{
          height: 46,
        }}
      />

      <input
        type="password"
        placeholder="New PIN"
        value={newPin}
        onChange={(e) =>
          setNewPin(e.target.value)
        }
        className="input"
        style={{
          height: 46,
        }}
      />

      <input
        type="password"
        placeholder="Confirm New PIN"
        value={confirmPin}
        onChange={(e) =>
          setConfirmPin(e.target.value)
        }
        className="input"
        style={{
          height: 46,
        }}
      />

      <button
        className="btn btn-primary"
        onClick={handleChangePin}
        disabled={pinSaving}
        style={{
          marginTop: 6,
          height: 46,
          fontWeight: 600,
          borderRadius: 12,
        }}
      >
        {pinSaving
          ? "Updating PIN..."
          : "Update PIN"}
      </button>
    </div>
  </div>
</div>
      <div style={{ height: 16 }} />
    </AppShell>
  );
}