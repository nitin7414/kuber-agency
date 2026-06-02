"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  customerName?: string;
  amount?: number;
  cylinders?: number;
  createdAt: string;
}

interface MonthlyPerformance {
  month: string;
  cylinders: number;
  payments: number;
}

const TYPE_COLOR: Record<string, string> = {
  PAYMENT_RECEIVED: "payment",
  CYLINDERS_DELIVERED: "delivery",
  EMPTIES_COLLECTED: "empty",
  CUSTOMER_ADDED: "customer",
  TRANSACTION_ADDED: "delivery",
  TASK_ADDED: "customer",
  TASK_EDITED: "customer",
  STOCK_UPDATED: "empty",
};

function dotClass(type: string) {
  return `activity-dot ${TYPE_COLOR[type] || ""}`;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [performance, setPerformance] = useState<MonthlyPerformance[]>([]);
  const [metric, setMetric] = useState<"cylinders" | "payments">("cylinders");

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/activity");
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs || []);
      setPerformance(data.performance || []);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleExport() {
    const res = await fetch("/api/activity?format=csv");
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ssga-activity-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Calculate max value for scaling the bars safely
  const maxVal = Math.max(...performance.map((p) => p[metric]), 1);

  return (
    <AppShell>
      <div className="page-title-row">
        <span className="page-title" style={{ marginBottom: 0 }}>Recent Activity</span>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleExport}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── Monthly Performance Bar Graph ────────────────── */}
      {performance.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: 0 }}>Monthly Performance</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0 0" }}>Last 6 months comparison</p>
            </div>
            <div style={{ display: "flex", gap: 4, background: "var(--navy-pale)", padding: 3, borderRadius: "var(--radius-sm)" }}>
              <button
                type="button"
                onClick={() => setMetric("cylinders")}
                style={{
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  background: metric === "cylinders" ? "var(--white)" : "transparent",
                  color: metric === "cylinders" ? "var(--navy)" : "var(--text-muted)",
                  boxShadow: metric === "cylinders" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cylinders
              </button>
              <button
                type="button"
                onClick={() => setMetric("payments")}
                style={{
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  background: metric === "payments" ? "var(--white)" : "transparent",
                  color: metric === "payments" ? "var(--navy)" : "var(--text-muted)",
                  boxShadow: metric === "payments" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Payments (₹)
              </button>
            </div>
          </div>

          {/* Graph Container */}
          <div style={{ position: "relative", height: 180, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "10px 10px 0 10px", marginTop: 10 }}>
            {/* Background Grid Lines */}
            <div style={{ position: "absolute", left: 0, right: 0, top: "25%", height: 1, borderTop: "1px dashed var(--navy-border)", opacity: 0.3 }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, borderTop: "1px dashed var(--navy-border)", opacity: 0.3 }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "75%", height: 1, borderTop: "1px dashed var(--navy-border)", opacity: 0.3 }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, borderTop: "1px solid var(--navy-border)" }} />

            {/* Bars */}
            {performance.map((item, idx) => {
              const value = item[metric];
              const heightPct = (value / maxVal) * 80 + 5; // scaled between 5% and 85%
              
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
                  {/* Tooltip on top of bar */}
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginBottom: 6,
                    fontFamily: "var(--font-mono)",
                    background: "var(--navy-pale)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid var(--navy-border)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
                  }}>
                    {metric === "payments" ? `₹${value.toFixed(0)}` : `${value} cyl`}
                  </div>

                  {/* Visual Bar */}
                  <div style={{
                    width: "40%",
                    maxWidth: 40,
                    height: `${heightPct}%`,
                    background: metric === "cylinders" 
                      ? "linear-gradient(to top, var(--success), #4ade80)" 
                      : "linear-gradient(to top, var(--navy), #63b3f0)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease-out, background 0.3s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }} />

                  {/* Month Label */}
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginTop: 10,
                    textAlign: "center"
                  }}>
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state" style={{ background: "var(--white)", border: "1px solid var(--navy-border)", borderRadius: "var(--radius)", padding: "48px 24px" }}>
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No activity recorded yet</div>
        </div>
      ) : (
        <div className="activity-list">
          {logs.map((log) => (
            <div key={log.id} className="activity-item">
              <div className={dotClass(log.type)} />
              <div style={{ flex: 1 }}>
                <div className="activity-text">{log.description}</div>
                {log.customerName && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {log.customerName}
                  </div>
                )}
              </div>
              <div className="activity-time" style={{ whiteSpace: "pre-line" }}>
                {format(new Date(log.createdAt), "dd MMM\nhh:mm a")}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}