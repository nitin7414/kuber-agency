"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AddCustomerModal from "@/components/AddCustomerModal";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  pendingBalance: number;
  totalDelivered: number;
  totalEmptyLeft: number;
}

interface TxnWithCustomer {
  id: string;
  customerId: string;
  cylindersDelivered?: number;
  emptiesCollected?: number;
  paymentAmount?: number;
  createdAt: string;
  customer: { name: string };
}

interface CustomerWithEmpties {
  id: string;
  name: string;
  totalEmptyLeft: number;
}

interface DashboardData {
  totalFilled: number;
  totalEmpty: number;
  totalPending: number;
  totalEmptyAtCustomers: number;
  totalDelivered: number;
  paymentHistory: TxnWithCustomer[];
  deliveryHistory: TxnWithCustomer[];
  customersWithEmpties: CustomerWithEmpties[];
  lastBackupDate: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"customers" | "due" | "empty" | "filled">("customers");

  // Backup notification states
  const [exporting, setExporting] = useState(false);
  const [showBackupBanner, setShowBackupBanner] = useState(false);

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
      
      setShowBackupBanner(false);
      toast.success("Database backup downloaded!");
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error("Could not export backup");
    } finally {
      setExporting(false);
    }
  }

  const fetchDashboard = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) setData(await res.json());
  }, []);

  const fetchCustomers = useCallback(async (q = "") => {
    const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
    if (res.ok) setCustomers(await res.json());
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchCustomers();
  }, [fetchDashboard, fetchCustomers]);

  useEffect(() => {
    if (data) {
      const lastBackupStr = data.lastBackupDate;
      const dismissedAtStr = localStorage.getItem("ssga_backup_banner_dismissed_at");
      
      let needsBackup = false;
      if (!lastBackupStr) {
        needsBackup = true;
      } else {
        const lastBackup = new Date(lastBackupStr);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        needsBackup = lastBackup < oneWeekAgo;
      }

      if (needsBackup && dismissedAtStr) {
        const dismissedAt = new Date(dismissedAtStr);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        if (dismissedAt > oneDayAgo) {
          needsBackup = false; // Dismissed within 24 hours, don't show it yet
        }
      }

      setShowBackupBanner(needsBackup);
    }
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(search), 250);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  return (
    <AppShell>
      {/* ── Dashboard Top Welcome & Actions Section ────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 4 }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--navy)", margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>AGency demo</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Add Customer Button */}
          <button
            onClick={() => setShowAddCustomer(true)}
            className="hide-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--navy)",
              border: "1px solid var(--navy)",
              boxShadow: "var(--card-shadow)",
              cursor: "pointer",
              color: "var(--white)",
              fontWeight: 600,
              fontSize: "12px",
              transition: "all 0.15s"
            }}
            title="Add Customer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Customer
          </button>

          {/* Scan & Pay Button */}
          <button
            onClick={() => setShowQRModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--white)",
              border: "1px solid var(--navy-border)",
              boxShadow: "var(--card-shadow)",
              cursor: "pointer",
              color: "var(--navy)",
              fontWeight: 600,
              fontSize: "12px",
              transition: "all 0.15s"
            }}
            className="qr-scan-btn"
            title="Scan QR Code"
          >
            {/* QR Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
              <line x1="17" y1="7" x2="17.01" y2="7" />
              <line x1="17" y1="17" x2="17.01" y2="17" />
              <line x1="7" y1="17" x2="7.01" y2="17" />
            </svg>
            Scan & Pay
          </button>
        </div>
      </div>

      {/* ── Backup Notification Banner ──────────────────────── */}
      {showBackupBanner && (
        <div
          style={{
            background: "var(--navy-pale)",
            border: "1px solid var(--navy-border)",
            borderRadius: "var(--radius)",
            padding: "14px 18px",
            marginBottom: 16,
            boxShadow: "var(--card-shadow)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
            animation: "fadeIn 0.2s ease"
          }}
        >
          {/* Close button in top-right */}
          <button
            onClick={() => {
              localStorage.setItem("ssga_backup_banner_dismissed_at", new Date().toISOString());
              setShowBackupBanner(false);
            }}
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              color: "var(--text-muted)",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
              cursor: "pointer",
              background: "none",
              border: "none"
            }}
            title="Dismiss reminder"
          >
            &times;
          </button>
          
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingRight: 16 }}>
            <span style={{ fontSize: 20, marginTop: 1 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "14px" }}>
                Database Backup Reminder
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text)", margin: "3px 0 0 0", lineHeight: "1.4" }}>
                {data?.lastBackupDate
                  ? `Your last database backup was created on ${format(new Date(data.lastBackupDate), "dd MMM yyyy")}. Backup your records weekly to ensure complete data safety.`
                  : "You have never created a backup copy of your database. Create a local backup now to protect your valuable business records from any accidental loss."
                }
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="btn btn-primary btn-sm"
              style={{ padding: "6px 12px", fontSize: "12px", background: "var(--navy)" }}
            >
              📥 {exporting ? "Downloading..." : "Backup Data Now"}
            </button>
            <button
              onClick={() => {
                localStorage.setItem("ssga_backup_banner_dismissed_at", new Date().toISOString());
                setShowBackupBanner(false);
              }}
              className="btn btn-outline btn-sm"
              style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid var(--navy-border)", color: "var(--text-muted)" }}
            >
              Remind Tomorrow
            </button>
          </div>
        </div>
      )}

      {/* ── Three stat squares ─────────────────────────────── */}
      <div className="stat-squares" style={{ marginTop: 8 }}>
        {/* Due payments */}
        <button
          className={`stat-square${activeTab === "due" ? " active-stat" : ""}`}
          onClick={() => setActiveTab(activeTab === "due" ? "customers" : "due")}
          style={{
            borderColor: activeTab === "due" ? "var(--navy)" : "var(--navy-border)",
            background: activeTab === "due" ? "var(--navy-pale)" : "var(--white)"
          }}
        >
          <div className="stat-square-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 4px rgba(217,119,6,0.15))" }}>
              <path d="M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h14v4" />
              <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" fill="var(--warning)" fillOpacity="0.1" />
            </svg>
          </div>
          <div className="stat-square-value" style={{ fontSize: 16 }}>
            {data ? `₹${Math.abs(data.totalPending).toFixed(0)}` : "—"}
          </div>
          <div className="stat-square-label">Due Payments</div>
        </button>

        {/* Total empty */}
        <button
          className={`stat-square${activeTab === "empty" ? " active-stat" : ""}`}
          onClick={() => setActiveTab(activeTab === "empty" ? "customers" : "empty")}
          style={{
            borderColor: activeTab === "empty" ? "var(--navy)" : "var(--navy-border)",
            background: activeTab === "empty" ? "var(--navy-pale)" : "var(--white)"
          }}
        >
          <div className="stat-square-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 4px rgba(220,38,38,0.15))" }}>
              <path d="M6 9h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
              <path d="M9 5a3 3 0 0 1 6 0" />
              <line x1="6" y1="9" x2="18" y2="9" />
              <line x1="9" y1="5" x2="9" y2="9" />
              <line x1="15" y1="5" x2="15" y2="9" />
            </svg>
          </div>
          <div className="stat-square-value">
            {data ? data.totalEmptyAtCustomers : "—"}
          </div>
          <div className="stat-square-label">Total Empty</div>
        </button>

        {/* Total filled */}
        <button
          className={`stat-square${activeTab === "filled" ? " active-stat" : ""}`}
          onClick={() => setActiveTab(activeTab === "filled" ? "customers" : "filled")}
          style={{
            borderColor: activeTab === "filled" ? "var(--navy)" : "var(--navy-border)",
            background: activeTab === "filled" ? "var(--navy-pale)" : "var(--white)"
          }}
        >
          <div className="stat-square-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 4px rgba(22,163,74,0.15))" }}>
              <path d="M6 9h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" fill="var(--success)" fillOpacity="0.1" />
              <path d="M9 5a3 3 0 0 1 6 0" />
              <line x1="6" y1="9" x2="18" y2="9" />
              <line x1="9" y1="5" x2="9" y2="9" />
              <line x1="15" y1="5" x2="15" y2="9" />
              <circle cx="12" cy="15" r="3" fill="var(--success)" />
            </svg>
          </div>
          <div className="stat-square-value">
            {data ? data.totalDelivered : "—"}
          </div>
          <div className="stat-square-label">Total Filled</div>
        </button>
      </div>



      {activeTab === "customers" && (
        <>
          {/* ── Search + Customer List ──────────────────────────── */}
          <div className="search-bar">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search customers by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">
                {search ? "No customers found" : "No customers yet. Add one below."}
              </div>
            </div>
          ) : (
            <div className="customer-list">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="customer-list-item"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  <div>
                    <div className="customer-name">{c.name}</div>
                    <div className="customer-mobile">{c.mobile}</div>
                  </div>
                  <div
                    className={`pending-badge${c.pendingBalance <= 0 ? " zero" : ""}`}
                  >
                    {c.pendingBalance > 0
                      ? `₹${c.pendingBalance.toFixed(0)}`
                      : "Clear"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

{activeTab === "due" && (
  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
    
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid var(--navy-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--navy)",
          margin: 0
        }}
      >
        Customers With Due Payments
      </h3>

      <button
        onClick={() => setActiveTab("customers")}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--navy)"
        }}
      >
        Back to Customers
      </button>
    </div>

    <div className="customer-list">
      
      {customers.filter((c) => c.pendingBalance > 0).length === 0 ? (
        
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14
          }}
        >
          No customers with pending payments.
        </div>

      ) : (
        
        customers
          .filter((c) => c.pendingBalance > 0)
          .map((c) => (
            <div
              key={c.id}
              className="customer-list-item"
              onClick={() => router.push(`/customers/${c.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div>
                <div className="customer-name">
                  {c.name}
                </div>

                <div className="customer-mobile">
                  {c.mobile}
                </div>
              </div>

              <div
                className="pending-badge"
                style={{
                  fontWeight: 700
                }}
              >
                ₹{c.pendingBalance.toFixed(0)}
              </div>
            </div>
          ))
      )}
    </div>
  </div>
)}

      {activeTab === "filled" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--navy-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: 0 }}>Cylinders Delivered Record</h3>
            <button onClick={() => setActiveTab("customers")} style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>
              Back to Customers
            </button>
          </div>
          <div className="customer-list">
            {(data?.deliveryHistory || []).length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                No recent cylinder deliveries found.
              </div>
            ) : (
              (data?.deliveryHistory || []).map((t) => (
                <div
                  key={t.id}
                  className="customer-list-item"
                  onClick={() => router.push(`/customers/${t.customerId || ""}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <div className="customer-name">{t.customer.name}</div>
                  </div>
                  <div className="pending-badge" style={{ color: "var(--navy)", fontWeight: 700 }}>
                    {t.cylindersDelivered} Cyl
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "empty" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--navy-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: 0 }}>Customers Holding Empties</h3>
            <button onClick={() => setActiveTab("customers")} style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>
              Back to Customers
            </button>
          </div>
          <div className="customer-list">
            {(data?.customersWithEmpties || []).length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                No customers holding empty cylinders.
              </div>
            ) : (
              (data?.customersWithEmpties || []).map((c) => (
                <div
                  key={c.id}
                  className="customer-list-item"
                  onClick={() => router.push(`/customers/${c.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <div className="customer-name">{c.name}</div>
                  </div>
                  <div className="pending-badge" style={{ color: "var(--warning)", fontWeight: 700 }}>
                    {c.totalEmptyLeft} Cyl
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── FAB: Add Customer ───────────────────────────────── */}
      <button className="fab" onClick={() => setShowAddCustomer(true)} title="Add Customer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onAdded={() => {
            fetchCustomers();
            fetchDashboard();
            setShowAddCustomer(false);
          }}
        />
      )}

      {/* ── Scan & Pay QR Code Modal ───────────────────────── */}
      {showQRModal && (
        <div className="overlay center" onClick={() => setShowQRModal(false)}>
          <div
            className="modal center-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "24px", borderRadius: "var(--radius-lg)", width: "92%", maxWidth: "380px", textAlign: "center" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Scan & Pay QR Code</span>
              <button onClick={() => setShowQRModal(false)} style={{ fontSize: 24, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
                &times;
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "var(--radius)", border: "1px solid var(--navy-border)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <img
                src="/qr-code.png"
                alt="Scan and Pay QR Code"
                style={{ width: "100%", height: "auto", borderRadius: "var(--radius-sm)", display: "block" }}
              />
            </div>

            <div style={{ background: "var(--navy-pale)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--navy-border)", fontSize: 13, color: "var(--navy)", fontWeight: 600, fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
              boim-610970700310@boi
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 16 }}
              onClick={() => setShowQRModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}