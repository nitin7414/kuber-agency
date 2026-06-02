"use client";

import { useState } from "react";
import { UploadButton } from "./uploadthing";

interface AddCustomerModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddCustomerModal({ onClose, onAdded }: AddCustomerModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [aadharUrl, setAadharUrl] = useState("");
  const [panUrl, setPanUrl] = useState("");
  const [foodLicenseUrl, setFoodLicenseUrl] = useState("");
  const [gstCertUrl, setGstCertUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      setError("Name and mobile number are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          email: email || null,
          address: address || null,
          aadharUrl: aadharUrl || null,
          panUrl: panUrl || null,
          foodLicenseUrl: foodLicenseUrl || null,
          gstCertUrl: gstCertUrl || null,
        }),
      });

      if (res.ok) {
        onAdded();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add customer");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadSlot = (
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
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "var(--success)" }}>
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
    <div className="overlay center" onClick={onClose}>
      <div
        className="modal center-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "20px 24px", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "480px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: "18px" }}>Add New Customer</h2>
          <button onClick={onClose} style={{ fontSize: 24, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
            &times;
          </button>
        </div>

        {error && (
          <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 14, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. rajesh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-input"
              placeholder="Enter customer shop/home address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              style={{ resize: "none" }}
            />
          </div>



          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--navy)", marginBottom: 10, letterSpacing: "0.04em" }}>
              Documents (PDF or Image)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {renderUploadSlot("Aadhar Card", aadharUrl, setAadharUrl)}
              {renderUploadSlot("PAN Card", panUrl, setPanUrl)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
              {renderUploadSlot("Food License", foodLicenseUrl, setFoodLicenseUrl)}
              {renderUploadSlot("GST Certificate", gstCertUrl, setGstCertUrl)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
