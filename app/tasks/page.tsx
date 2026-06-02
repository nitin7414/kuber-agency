"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Task {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditingTask, setIsEditingTask] = useState<null | "new" | Task>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      if (isEditingTask && isEditingTask !== "new") {
        const res = await fetch(`/api/tasks/${isEditingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error();
        toast.success("Note updated");
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error();
        toast.success("Note saved");
      }
      setContent("");
      setIsEditingTask(null);
      fetchTasks();
    } catch {
      toast.error("Could not save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    fetchTasks();
  }

  const openEdit = (t: Task) => {
    setIsEditingTask(t);
    setContent(t.content);
  };

  if (isEditingTask !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
        {/* ── Header (Paytm style like Transactions) ──────────────────── */}
        <div className="txn-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="txn-back-btn"
              onClick={() => { setIsEditingTask(null); setContent(""); }}
              aria-label="Go back"
              style={{ padding: 0 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <div className="txn-customer-name" style={{ fontSize: "16px" }}>
                {isEditingTask === "new" ? "New Note" : "Edit Note"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Notepad/Note Body (Full height minus header/footer) ────── */}
        <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column" }}>
          <textarea
            className="form-input"
            placeholder="Write down something here... (e.g. daily tasks, cylinder tallies, customer requests)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              width: "100%",
              padding: "16px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--navy-border)",
              fontSize: "15px",
              lineHeight: "1.6",
              resize: "none",
              background: "var(--white)",
              color: "var(--text)",
              boxShadow: "var(--card-shadow)",
              outline: "none"
            }}
          />
        </div>

        {/* ── Transaction-style Footer Button Tray ────────────────────── */}
        <div className="new-txn-footer" style={{ display: "flex", gap: 10 }}>
          {isEditingTask !== "new" && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={() => {
                handleDelete(isEditingTask.id);
                setIsEditingTask(null);
                setContent("");
              }}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => {
              setIsEditingTask(null);
              setContent("");
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={handleSave}
            disabled={saving || !content.trim()}
          >
            {saving ? "Saving…" : isEditingTask === "new" ? "Save Note" : "Update Note"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Standard Notes Grid View */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="page-title" style={{ margin: 0 }}>Notes Board</div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state" style={{ background: "var(--white)", border: "1px solid var(--navy-border)", borderRadius: "var(--radius)", padding: "48px 24px" }}>
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text" style={{ fontSize: 14 }}>
            No notes yet. Click the "+" button in bottom right to write down something!
          </div>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="task-card"
              onClick={() => openEdit(t)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", color: "var(--text)" }}>{t.content}</div>
              <div className="task-card-date">
                {format(new Date(t.updatedAt), "dd MMM yyyy, hh:mm a")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plus icon FAB routes to full-page New Note view */}
      <button
        className="fab"
        onClick={() => { setIsEditingTask("new"); setContent(""); }}
        title="Add Note"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </AppShell>
  );
}