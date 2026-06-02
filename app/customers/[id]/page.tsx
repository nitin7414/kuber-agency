"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { UploadButton } from "@/components/uploadthing";

interface Transaction {
  id: string;
  cylindersDelivered?: number;
  emptiesCollected?: number;
  paymentAmount?: number;
  balanceAfter: number;
  totalEmptyAfter: number;
  note?: string;
  createdAt: string;
}

interface CustomerDetail {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  pendingBalance: number;
  totalDelivered: number;
  totalEmptyLeft: number;
  aadharUrl?: string;
  panUrl?: string;
  foodLicenseUrl?: string;
  gstCertUrl?: string;
  transactions: Transaction[];
}

export default function CustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [showNewTxn, setShowNewTxn] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Options menu dropdown, edit details, and delete confirmation states
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New transaction form
  const [delivered, setDelivered] = useState("");
  const [empties, setEmpties] = useState("");
  const [payment, setPayment] = useState("");
  const [txnPendingAmount, setTxnPendingAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePaymentChange = (val: string) => {
    setPayment(val);
    if (customer) {
      const p = parseFloat(val) || 0;
      setTxnPendingAmount(Math.max(0, customer.pendingBalance - p).toString());
    }
  };

  // Edit customer form state
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPendingBalance, setEditPendingBalance] = useState("");

  const [editAadharUrl, setEditAadharUrl] = useState("");
  const [editPanUrl, setEditPanUrl] = useState("");
  const [editFoodLicenseUrl, setEditFoodLicenseUrl] = useState("");
  const [editGstCertUrl, setEditGstCertUrl] = useState("");

  const [updating, setUpdating] = useState(false);

  const openEditModal = () => {
    if (customer) {
      setEditName(customer.name);
      setEditMobile(customer.mobile);
      setEditEmail(customer.email || "");
      setEditAddress(customer.address || "");
      setEditPendingBalance(Math.max(0, customer.pendingBalance).toString());
      setEditAadharUrl(customer.aadharUrl || "");
      setEditPanUrl(customer.panUrl || "");
      setEditFoodLicenseUrl(customer.foodLicenseUrl || "");
      setEditGstCertUrl(customer.gstCertUrl || "");
      setShowEditModal(true);
    }
  };

  const fetchCustomer = useCallback(async () => {
    const res = await fetch(`/api/customers/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setCustomer(data);
    } else {
      router.push("/dashboard");
    }
  }, [params.id, router]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  // Scroll to bottom of feed on load
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [customer]);

  async function handleNewTransaction() {
    const d = parseInt(delivered) || 0;
    const e = parseInt(empties) || 0;
    const p = parseFloat(payment) || 0;
    const pa = txnPendingAmount !== "" ? parseFloat(txnPendingAmount) : undefined;

    if (!d && !e && !p && pa === undefined) {
      toast.error("Fill at least one field");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${params.id}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cylindersDelivered: d || undefined,
          emptiesCollected: e || undefined,
          paymentAmount: p || undefined,
          pendingAmount: pa,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Transaction saved");
      setDelivered(""); setEmpties(""); setPayment(""); setTxnPendingAmount(""); setNote("");
      setShowNewTxn(false);
      fetchCustomer();
    } catch {
      toast.error("Could not save transaction");
    } finally {
      setSaving(false);
    }
  }

  if (!customer) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  // Group transactions by date
  const groups: Record<string, Transaction[]> = {};
  customer.transactions.forEach((t) => {
    const dateKey = format(new Date(t.createdAt), "dd MMM yyyy");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(t);
  });

  const renderEditUploadSlot = (
    label: string,
    url: string,
    setUrl: (val: string) => void
  ) => {
    return (
      <div className="form-group" style={{ marginBottom: 12 }}>
        <span className="form-label" style={{ fontSize: 10, marginBottom: 4 }}>{label}</span>
        {url ? (
          <div className="upload-btn uploaded" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span>✓</span>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "var(--success)", fontSize: 12 }}>
                View Doc
              </a>
            </span>
            <button
              type="button"
              onClick={() => setUrl("")}
              style={{ color: "var(--danger)", fontWeight: 600, fontSize: 11, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <UploadButton
              endpoint="customerDocument"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setUrl(res[0].url);
                }
              }}
              onUploadError={(err) => {
                alert(`Upload failed: ${err.message}`);
              }}
              content={{
                button({ ready, isUploading }) {
                  if (isUploading) return "Uploading...";
                  if (ready) return `Upload ${label.split(" ")[0]}`;
                  return "Preparing...";
                }
              }}
              appearance={{
                button: {
                  background: "var(--bg)",
                  color: "var(--text-muted)",
                  border: "1px dashed var(--navy-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  padding: "6px 8px",
                  width: "100%",
                  height: "36px",
                  cursor: "pointer"
                },
                allowedContent: { display: "none" }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="txn-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="txn-back-btn"
            onClick={() => router.back()}
            aria-label="Go back"
            style={{ padding: 0 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <div className="txn-customer-name" style={{ fontSize: "16px" }}>{customer.name}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{customer.mobile}</div>
          </div>
        </div>

        {/* 3-Dot Options Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ fontSize: 24, padding: "4px 8px", color: "var(--white)", cursor: "pointer", background: "none", border: "none" }}
            title="Options"
          >
            ⋮
          </button>

          {showDropdown && (
            <>
              <div
                onClick={() => setShowDropdown(false)}
                style={{ position: "fixed", inset: 0, zIndex: 240 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 32,
                  right: 0,
                  background: "var(--white)",
                  border: "1px solid var(--navy-border)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--card-shadow-hover)",
                  width: 155,
                  zIndex: 250,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    openEditModal();
                  }}
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                    color: "var(--text)",
                    borderBottom: "1px solid var(--navy-border)",
                    cursor: "pointer",
                    width: "100%",
                    background: "none",
                    border: "none",
                  }}
                >
                  ✏️ Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowDeleteConfirm(true);
                  }}
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                    color: "var(--danger)",
                    cursor: "pointer",
                    width: "100%",
                    background: "none",
                    border: "none",
                  }}
                >
                  🗑️ Delete Customer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Summary card ────────────────────────────────────── */}
      <div className="txn-summary-card">
        <div className="txn-summary-item">
          <div className={`txn-summary-value${customer.pendingBalance > 0 ? " danger" : ""}`}>
            {customer.pendingBalance > 0
              ? `₹${customer.pendingBalance.toFixed(0)}`
              : "Clear"}
          </div>
          <div className="txn-summary-label">Pending</div>
        </div>
        <div className="txn-summary-item">
          <div className="txn-summary-value">{customer.totalDelivered}</div>
          <div className="txn-summary-label">Delivered</div>
        </div>
        <div className="txn-summary-item">
          <div className="txn-summary-value">{customer.totalEmptyLeft}</div>
          <div className="txn-summary-label">Empty Left</div>
        </div>
      </div>

      {/* ── Transaction Feed ─────────────────────────────────── */}
      <div
        className="txn-feed"
        ref={feedRef}
        style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}
      >
        {customer.transactions.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 48 }}>
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No transactions yet</div>
          </div>
        ) : (
          Object.entries(groups).map(([date, txns]) => (
            <div key={date}>
              <div className="txn-date-divider">{date}</div>
              {txns.map((t) => (
                <TransactionBubble key={t.id} txn={t} />
              ))}
            </div>
          ))
        )}
      </div>

      {/* ── New Transaction Footer Button ────────────────────── */}
      <div className="new-txn-footer">
        <button
          className="btn btn-primary btn-full"
          onClick={() => {
            setTxnPendingAmount(customer ? customer.pendingBalance.toString() : "");
            setShowNewTxn(true);
          }}
          style={{ gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Transaction
        </button>
      </div>

      {/* ── New Transaction Modal ────────────────────────────── */}
      {showNewTxn && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowNewTxn(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title">New Transaction</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Fill any combination. All fields are optional.
            </p>

             <div className="form-group">
              <label className="form-label">Cylinders Delivered</label>
              <input
                className="form-input"
                type="number"
                min="0"
                placeholder="0"
                value={delivered}
                onChange={(e) => setDelivered(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Empty Cylinders Collected</label>
              <input
                className="form-input"
                type="number"
                min="0"
                placeholder="0"
                value={empties}
                onChange={(e) => setEmpties(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Received (₹)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={payment}
                onChange={(e) => handlePaymentChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pending Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={txnPendingAmount}
                onChange={(e) => setTxnPendingAmount(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowNewTxn(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleNewTransaction}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Customer Details Modal ───────────────────────── */}
      {showEditModal && (
        <div className="overlay center" onClick={() => setShowEditModal(false)}>
          <div
            className="modal center-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "20px 24px", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "480px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: "18px" }}>Edit Customer Details</h2>
              <button onClick={() => setShowEditModal(false)} style={{ fontSize: 24, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
                &times;
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editName || !editMobile) {
                  toast.error("Name and mobile number are required");
                  return;
                }
                setUpdating(true);
                try {
                  const res = await fetch(`/api/customers/${params.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: editName,
                      mobile: editMobile,
                      email: editEmail || null,
                      address: editAddress || null,
                      pendingBalance: parseFloat(editPendingBalance) || 0,
                      aadharUrl: editAadharUrl || null,
                      panUrl: editPanUrl || null,
                      foodLicenseUrl: editFoodLicenseUrl || null,
                      gstCertUrl: editGstCertUrl || null,
                    }),
                  });
                  if (!res.ok) throw new Error("Failed to update");
                  toast.success("Customer details updated");
                  setShowEditModal(false);
                  fetchCustomer();
                } catch {
                  toast.error("Could not update customer");
                } finally {
                  setUpdating(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  style={{ resize: "none" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Pending Payment (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editPendingBalance}
                  onChange={(e) => setEditPendingBalance(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={{ marginTop: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--navy)", marginBottom: 10, letterSpacing: "0.04em" }}>
                  Documents (PDF or Image)
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {renderEditUploadSlot("Aadhar Card", editAadharUrl, setEditAadharUrl)}
                  {renderEditUploadSlot("PAN Card", editPanUrl, setEditPanUrl)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                  {renderEditUploadSlot("Food License", editFoodLicenseUrl, setEditFoodLicenseUrl)}
                  {renderEditUploadSlot("GST Certificate", editGstCertUrl, setEditGstCertUrl)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={updating}>
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      {showDeleteConfirm && (
        <div className="overlay center" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="modal center-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "24px", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "400px", textAlign: "center" }}
          >
            <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
            <h2 className="modal-title" style={{ margin: "0 0 10px 0", fontSize: "18px", color: "var(--danger)" }}>Delete Customer?</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
              Are you sure you want to delete <strong>{customer.name}</strong>? This action is permanent and will completely erase their transactions history.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={async () => {
                  setUpdating(true);
                  try {
                    const res = await fetch(`/api/customers/${params.id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Delete failed");
                    toast.success("Customer deleted successfully");
                    router.push("/dashboard");
                  } catch {
                    toast.error("Could not delete customer");
                  } finally {
                    setUpdating(false);
                  }
                }}
                disabled={updating}
              >
                {updating ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Transaction Bubble ─────────────────────────────────────────
function TransactionBubble({ txn }: { txn: Transaction }) {
  const time = format(new Date(txn.createdAt), "hh:mm a");
  const lines: { icon: React.ReactNode; text: React.ReactNode }[] = [];

  if (txn.cylindersDelivered) {
    lines.push({
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M6 9h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" fill="var(--success)" fillOpacity="0.1" />
          <path d="M9 5a3 3 0 0 1 6 0" />
          <line x1="6" y1="9" x2="18" y2="9" />
          <line x1="9" y1="5" x2="9" y2="9" />
          <line x1="15" y1="5" x2="15" y2="9" />
        </svg>
      ),
      text: (
        <>
          <strong>{txn.cylindersDelivered}</strong> cylinder(s) delivered
        </>
      ),
    });
  }
  if (txn.emptiesCollected) {
    lines.push({
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M6 9h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
          <path d="M9 5a3 3 0 0 1 6 0" />
          <line x1="6" y1="9" x2="18" y2="9" />
          <line x1="9" y1="5" x2="9" y2="9" />
          <line x1="15" y1="5" x2="15" y2="9" />
        </svg>
      ),
      text: (
        <>
          <strong>{txn.emptiesCollected}</strong> empty cylinder(s) collected
        </>
      ),
    });
  }
  if (txn.paymentAmount) {
    lines.push({
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="2" y="4" width="20" height="16" rx="2" fill="var(--warning)" fillOpacity="0.1" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      text: (
        <>
          Payment of <strong>₹{txn.paymentAmount.toFixed(2)}</strong> received
        </>
      ),
    });
  }

  return (
    <div className="txn-bubble">
      {lines.map((l, i) => (
        <div key={i} className="txn-bubble-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="txn-bubble-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{l.icon}</span>
          <span className="txn-bubble-text">{l.text}</span>
        </div>
      ))}
      {txn.note && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          📝 {txn.note}
        </div>
      )}
      <div className="txn-bubble-meta">
        {time}
      </div>
    </div>
  );
}