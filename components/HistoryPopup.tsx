"use client";

interface HistoryItem {
  id: string;
  label: string;
  value: string;
  date: string;
  icon: string;
}

interface Props {
  title: string;
  items: HistoryItem[];
  onClose: () => void;
}

export default function HistoryPopup({ title, items, onClose }: Props) {
  return (
    <div className="history-popup" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="history-popup-inner">
        <div className="history-popup-head">
          <span className="history-popup-title">{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              cursor: "pointer",
              border: "1px solid var(--navy-border)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="history-popup-list">
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No history yet</div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="history-popup-item">
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                      {item.label}
                    </div>
                    <div className="history-popup-date">{item.date}</div>
                  </div>
                </div>
                <div className="history-popup-value">{item.value}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}