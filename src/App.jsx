import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// ─── THEME CONTEXT ───────────────────────────────────────────────────────────
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const themes = {
  dark: {
    bg: "#0a0a0a", surface: "#111111", elevated: "#1a1a1a", border: "#222222",
    text: "#f0f0f0", muted: "#555555", accent: "#e8e8e8", highlight: "#ffffff",
    tag: "#1e1e1e", danger: "#c0392b", success: "#27ae60", warning: "#e67e22",
    chartColors: ["#f0f0f0", "#555555", "#888888", "#333333"],
  },
  light: {
    bg: "#f5f5f5", surface: "#ffffff", elevated: "#ececec", border: "#e0e0e0",
    text: "#111111", muted: "#aaaaaa", accent: "#111111", highlight: "#000000",
    tag: "#efefef", danger: "#e74c3c", success: "#2ecc71", warning: "#f39c12",
    chartColors: ["#111111", "#aaaaaa", "#cccccc", "#888888"],
  },
};

// ─── PRIORITIES & CATEGORIES ─────────────────────────────────────────────────
const PRIORITIES = { high: "High", medium: "Medium", low: "Low" };
const CATEGORIES = ["Work", "Personal", "Design", "Dev", "Research"];
const STATUSES = ["todo", "in-progress", "done"];

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const seedTasks = [
  { id: 1, title: "Redesign landing page", category: "Design", priority: "high", status: "done", created: "2024-01-10", due: "2024-01-20", notes: "Focus on hero section" },
  { id: 2, title: "Implement auth flow", category: "Dev", priority: "high", status: "in-progress", created: "2024-01-12", due: "2024-01-25", notes: "" },
  { id: 3, title: "Write Q1 report", category: "Work", priority: "medium", status: "todo", created: "2024-01-13", due: "2024-01-30", notes: "Include KPIs" },
  { id: 4, title: "Research competitors", category: "Research", priority: "low", status: "done", created: "2024-01-05", due: "2024-01-15", notes: "" },
  { id: 5, title: "Fix mobile nav bug", category: "Dev", priority: "high", status: "done", created: "2024-01-08", due: "2024-01-14", notes: "" },
  { id: 6, title: "Plan team offsite", category: "Personal", priority: "medium", status: "in-progress", created: "2024-01-14", due: "2024-02-01", notes: "" },
  { id: 7, title: "Update dependencies", category: "Dev", priority: "low", status: "todo", created: "2024-01-15", due: "2024-02-10", notes: "" },
  { id: 8, title: "User interviews", category: "Research", priority: "high", status: "todo", created: "2024-01-16", due: "2024-01-28", notes: "5 participants" },
];

// ─── CSS-IN-JS STYLES ─────────────────────────────────────────────────────────
const injectStyles = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; background: ${t.bg}; color: ${t.text}; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }

  .app { display: flex; min-height: 100vh; }

  .sidebar {
    width: 220px; min-height: 100vh; background: ${t.surface};
    border-right: 1px solid ${t.border}; display: flex; flex-direction: column;
    padding: 32px 0; position: sticky; top: 0; flex-shrink: 0;
    transition: background 0.3s;
  }
  .sidebar-logo {
    font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
    color: ${t.highlight}; letter-spacing: 0.15em; padding: 0 24px 40px;
    text-transform: uppercase;
  }
  .sidebar-section { padding: 0 12px; margin-bottom: 8px; }
  .sidebar-label {
    font-size: 10px; color: ${t.muted}; letter-spacing: 0.12em;
    text-transform: uppercase; padding: 0 12px; margin-bottom: 6px;
    font-family: 'DM Mono', monospace;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 6px; cursor: pointer; font-size: 13.5px; font-weight: 400;
    color: ${t.muted}; transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { background: ${t.elevated}; color: ${t.text}; }
  .nav-item.active { background: ${t.elevated}; color: ${t.highlight}; font-weight: 500; }
  .nav-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .nav-count {
    margin-left: auto; font-family: 'DM Mono', monospace; font-size: 11px;
    color: ${t.muted}; background: ${t.tag}; padding: 1px 7px; border-radius: 20px;
  }
  .sidebar-bottom { margin-top: auto; padding: 0 12px; }
  .theme-toggle {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 6px; cursor: pointer; font-size: 13px; color: ${t.muted};
    transition: all 0.15s; user-select: none; border: none; background: none; width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .theme-toggle:hover { background: ${t.elevated}; color: ${t.text}; }

  .main { flex: 1; padding: 48px 56px; overflow-x: hidden; }
  .page-header { margin-bottom: 40px; }
  .page-title { font-size: 28px; font-weight: 600; color: ${t.highlight}; line-height: 1.1; }
  .page-sub { font-size: 13px; color: ${t.muted}; margin-top: 6px; font-family: 'DM Mono', monospace; }

  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
  .stat-card {
    background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 10px;
    padding: 24px; transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: ${t.muted}; }
  .stat-num { font-size: 36px; font-weight: 600; color: ${t.highlight}; font-family: 'DM Mono', monospace; line-height: 1; }
  .stat-label { font-size: 12px; color: ${t.muted}; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
  .stat-bar { height: 2px; background: ${t.border}; border-radius: 1px; margin-top: 16px; overflow: hidden; }
  .stat-bar-fill { height: 100%; border-radius: 1px; transition: width 1s cubic-bezier(0.4,0,0.2,1); }

  .section-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
  .chart-card {
    background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 10px; padding: 28px;
  }
  .chart-title { font-size: 12px; color: ${t.muted}; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 24px; font-family: 'DM Mono', monospace; }

  .toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .search-box {
    flex: 1; min-width: 200px; background: ${t.surface}; border: 1px solid ${t.border};
    border-radius: 8px; padding: 10px 16px; font-size: 13.5px; color: ${t.text};
    font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s;
  }
  .search-box::placeholder { color: ${t.muted}; }
  .search-box:focus { border-color: ${t.muted}; }
  .filter-btn {
    padding: 9px 16px; border-radius: 8px; border: 1px solid ${t.border}; background: ${t.surface};
    color: ${t.muted}; font-size: 12.5px; cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .filter-btn:hover, .filter-btn.active { border-color: ${t.muted}; color: ${t.text}; }
  .add-btn {
    padding: 9px 20px; border-radius: 8px; background: ${t.highlight}; color: ${t.bg};
    font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: opacity 0.15s;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .add-btn:hover { opacity: 0.85; }

  .kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .kanban-col { display: flex; flex-direction: column; gap: 0; }
  .col-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 0 16px; margin-bottom: 0;
  }
  .col-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: ${t.muted}; font-family: 'DM Mono', monospace; }
  .col-count { font-family: 'DM Mono', monospace; font-size: 11px; color: ${t.muted}; }
  .col-line { height: 1px; background: ${t.border}; margin-bottom: 16px; }
  .task-list { display: flex; flex-direction: column; gap: 10px; }

  .task-card {
    background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 8px;
    padding: 16px; cursor: pointer; transition: all 0.15s; position: relative;
    animation: fadeUp 0.3s ease both;
  }
  .task-card:hover { border-color: ${t.muted}; transform: translateY(-1px); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .task-title { font-size: 13.5px; font-weight: 500; color: ${t.text}; line-height: 1.4; margin-bottom: 10px; }
  .task-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .task-cat {
    font-size: 11px; background: ${t.tag}; color: ${t.muted};
    padding: 2px 8px; border-radius: 4px; font-family: 'DM Mono', monospace;
  }
  .priority-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .task-due { font-size: 11px; color: ${t.muted}; margin-left: auto; font-family: 'DM Mono', monospace; }
  .task-actions { display: flex; gap: 6px; margin-top: 12px; }
  .task-action-btn {
    font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid ${t.border};
    background: none; color: ${t.muted}; cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .task-action-btn:hover { border-color: ${t.muted}; color: ${t.text}; }
  .task-action-btn.done { color: ${t.success}; border-color: ${t.success}; }
  .task-action-btn.del { color: ${t.danger}; border-color: ${t.danger}; }

  .empty-col { padding: 40px 0; text-align: center; color: ${t.muted}; font-size: 12px; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.15s ease;
    backdrop-filter: blur(4px);
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .modal {
    background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 12px;
    padding: 36px; width: 480px; max-width: 95vw;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform:translateY(16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .modal-title { font-size: 18px; font-weight: 600; color: ${t.highlight}; margin-bottom: 28px; }
  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: ${t.muted}; margin-bottom: 8px; font-family: 'DM Mono', monospace; }
  .field input, .field select, .field textarea {
    width: 100%; background: ${t.elevated}; border: 1px solid ${t.border}; border-radius: 6px;
    padding: 10px 14px; font-size: 13.5px; color: ${t.text}; outline: none;
    font-family: 'DM Sans', sans-serif; transition: border-color 0.2s;
  }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: ${t.muted}; }
  .field textarea { resize: vertical; min-height: 80px; }
  .field select option { background: ${t.elevated}; }
  .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .modal-actions { display: flex; gap: 10px; margin-top: 28px; justify-content: flex-end; }
  .btn-cancel {
    padding: 10px 20px; border-radius: 6px; border: 1px solid ${t.border}; background: none;
    color: ${t.muted}; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .btn-cancel:hover { border-color: ${t.muted}; color: ${t.text}; }
  .btn-save {
    padding: 10px 24px; border-radius: 6px; border: none; background: ${t.highlight};
    color: ${t.bg}; cursor: pointer; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
  }
  .btn-save:hover { opacity: 0.85; }

  /* TOOLTIP override */
  .recharts-tooltip-wrapper { outline: none !important; }
  .custom-tooltip {
    background: ${t.elevated}; border: 1px solid ${t.border}; border-radius: 6px;
    padding: 10px 14px; font-size: 12px; color: ${t.text}; font-family: 'DM Mono', monospace;
  }

  /* LIST VIEW */
  .list-table { width: 100%; border-collapse: collapse; }
  .list-table th {
    text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
    color: ${t.muted}; padding: 0 12px 12px; font-family: 'DM Mono', monospace; font-weight: 400;
    border-bottom: 1px solid ${t.border};
  }
  .list-table td { padding: 14px 12px; font-size: 13px; border-bottom: 1px solid ${t.border}; vertical-align: middle; }
  .list-table tr:last-child td { border-bottom: none; }
  .list-table tr { transition: background 0.1s; cursor: pointer; }
  .list-table tr:hover td { background: ${t.surface}; }

  .status-badge {
    display: inline-block; font-size: 10px; padding: 3px 9px; border-radius: 4px;
    font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .status-todo { background: ${t.tag}; color: ${t.muted}; }
  .status-in-progress { background: rgba(230,126,34,0.12); color: ${t.warning}; }
  .status-done { background: rgba(39,174,96,0.12); color: ${t.success}; }

  .view-switch { display: flex; border: 1px solid ${t.border}; border-radius: 6px; overflow: hidden; }
  .view-btn {
    padding: 8px 14px; background: none; border: none; color: ${t.muted}; cursor: pointer;
    font-size: 12px; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .view-btn.active { background: ${t.elevated}; color: ${t.text}; }

  @media (max-width: 900px) {
    .sidebar { width: 60px; }
    .sidebar-logo, .nav-item span, .sidebar-label, .nav-count, .theme-toggle span { display: none; }
    .main { padding: 32px 24px; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .section-row, .kanban { grid-template-columns: 1fr; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const priorityColor = (p, t) => p === "high" ? t.danger : p === "medium" ? t.warning : t.success;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return <div className="custom-tooltip">{label}: {payload[0].value}</div>;
  }
  return null;
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function StatCard({ num, label, pct, color }) {
  const { theme } = useTheme();
  const t = themes[theme];
  return (
    <div className="stat-card">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color || t.highlight }} />
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { theme } = useTheme();
  const t = themes[theme];
  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-title">{task.title}</div>
      <div className="task-meta">
        <span className="task-cat">{task.category}</span>
        <span className="priority-dot" style={{ background: priorityColor(task.priority, t) }} />
        <span style={{ fontSize: 11, color: t.muted }}>{task.priority}</span>
        {task.due && <span className="task-due">{task.due}</span>}
      </div>
      <div className="task-actions" onClick={e => e.stopPropagation()}>
        {task.status !== "done" && (
          <button className="task-action-btn done" onClick={() => onStatusChange(task.id, "done")}>✓ Done</button>
        )}
        {task.status === "todo" && (
          <button className="task-action-btn" onClick={() => onStatusChange(task.id, "in-progress")}>→ Start</button>
        )}
        <button className="task-action-btn del" onClick={() => onDelete(task.id)}>✕</button>
      </div>
    </div>
  );
}

function AddEditModal({ task, onSave, onClose }) {
  const { theme } = useTheme();
  const t = themes[theme];
  const [form, setForm] = useState(task || { title: "", category: "Work", priority: "medium", status: "todo", due: "", notes: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{task?.id ? "Edit Task" : "New Task"}</div>
        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title..." autoFocus />
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)}>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Due date</label>
            <input type="date" value={form.due} onChange={e => set("due", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." />
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={() => form.title.trim() && onSave(form)}>
            {task?.id ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────
function DashboardPage({ tasks }) {
  const { theme } = useTheme();
  const t = themes[theme];
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const inP = tasks.filter(t => t.status === "in-progress").length;
  const todo = tasks.filter(t => t.status === "todo").length;

  const byCategory = CATEGORIES.map(c => ({ name: c, value: tasks.filter(t => t.category === c).length })).filter(d => d.value > 0);
  const byPriority = [
    { name: "High", value: tasks.filter(t => t.priority === "high").length },
    { name: "Med", value: tasks.filter(t => t.priority === "medium").length },
    { name: "Low", value: tasks.filter(t => t.priority === "low").length },
  ];
  const weekly = [
    { day: "Mon", done: 2 }, { day: "Tue", done: 1 }, { day: "Wed", done: 3 },
    { day: "Thu", done: 0 }, { day: "Fri", done: 2 }, { day: "Sat", done: 1 }, { day: "Sun", done: 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Overview</div>
        <div className="page-sub">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      <div className="stats-row">
        <StatCard num={total} label="Total Tasks" pct={100} />
        <StatCard num={done} label="Completed" pct={total ? (done / total) * 100 : 0} color={t.success} />
        <StatCard num={inP} label="In Progress" pct={total ? (inP / total) * 100 : 0} color={t.warning} />
        <StatCard num={todo} label="To Do" pct={total ? (todo / total) * 100 : 0} color={t.muted} />
      </div>
      <div className="section-row">
        <div className="chart-card">
          <div className="chart-title">Tasks by category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {byCategory.map((_, i) => <Cell key={i} fill={t.chartColors[i % t.chartColors.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
            {byCategory.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.chartColors[i % t.chartColors.length], display: "inline-block" }} />
                <span style={{ fontSize: 11, color: t.muted, fontFamily: "DM Mono" }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Weekly activity</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barSize={18}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: t.muted, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="done" fill={t.highlight} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="chart-card" style={{ marginBottom: 0 }}>
        <div className="chart-title">Priority breakdown</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={byPriority} layout="vertical" barSize={14}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: t.muted, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}
              fill={t.highlight}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TasksPage({ tasks, onAdd, onEdit, onDelete, onStatusChange, initialCat = "All" }) {
  const { theme } = useTheme();
  const t = themes[theme];
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(initialCat);
  const [filterPri, setFilterPri] = useState("All");
  const [view, setView] = useState("kanban");

  useEffect(() => { setFilterCat(initialCat); }, [initialCat]);

  const filtered = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || task.category === filterCat;
    const matchPri = filterPri === "All" || task.priority === filterPri;
    return matchSearch && matchCat && matchPri;
  });

  const byStatus = (s) => filtered.filter(t => t.status === s);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Tasks</div>
        <div className="page-sub">{filtered.length} of {tasks.length} tasks</div>
      </div>
      <div className="toolbar">
        <input className="search-box" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        {["All", ...CATEGORIES].map(c => (
          <button key={c} className={`filter-btn ${filterCat === c ? "active" : ""}`} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
        <div className="view-switch">
          <button className={`view-btn ${view === "kanban" ? "active" : ""}`} onClick={() => setView("kanban")}>Kanban</button>
          <button className={`view-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>List</button>
        </div>
        <button className="add-btn" onClick={() => onAdd()}>+ New Task</button>
      </div>

      {view === "kanban" ? (
        <div className="kanban">
          {[["todo", "To Do"], ["in-progress", "In Progress"], ["done", "Done"]].map(([status, label]) => (
            <div key={status} className="kanban-col">
              <div className="col-header">
                <span className="col-title">{label}</span>
                <span className="col-count">{byStatus(status).length}</span>
              </div>
              <div className="col-line" />
              <div className="task-list">
                {byStatus(status).length === 0
                  ? <div className="empty-col">No tasks</div>
                  : byStatus(status).map(task => (
                    <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="chart-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="list-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task.id} onClick={() => onEdit(task)}>
                  <td style={{ fontWeight: 500, color: t.text }}>{task.title}</td>
                  <td><span className="task-cat">{task.category}</span></td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="priority-dot" style={{ background: priorityColor(task.priority, t) }} />
                      <span style={{ color: t.muted, fontSize: 12 }}>{task.priority}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${task.status}`}>{task.status}</span>
                  </td>
                  <td style={{ color: t.muted, fontFamily: "DM Mono", fontSize: 12 }}>{task.due || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState(seedTasks);
  const [modal, setModal] = useState(null); // null | { task? }
  const [activeCat, setActiveCat] = useState("All");
  const t = themes[theme];

  const styleRef = useRef(null);
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = injectStyles(t);
  }, [theme]);

  const handleAdd = () => setModal({ task: null });
  const handleEdit = (task) => setModal({ task });
  const handleDelete = (id) => setTasks(ts => ts.filter(t => t.id !== id));
  const handleStatusChange = (id, status) => setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  const handleSave = (form) => {
    if (form.id) {
      setTasks(ts => ts.map(t => t.id === form.id ? { ...t, ...form } : t));
    } else {
      setTasks(ts => [...ts, { ...form, id: Date.now(), created: new Date().toISOString().split("T")[0] }]);
    }
    setModal(null);
  };

  const todoCount = tasks.filter(t => t.status === "todo").length;

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "tasks", label: "Tasks", icon: "◻", count: todoCount, cat: "All" },
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">Taskr</div>
          <div className="sidebar-section">
            <div className="sidebar-label">Menu</div>
            {nav.map(item => (
              <div key={item.id} className={`nav-item ${page === item.id && (item.id !== "tasks" || activeCat === "All") ? "active" : ""}`} onClick={() => { setPage(item.id); setActiveCat("All"); }}>
                <span style={{ fontSize: 14, fontFamily: "DM Mono" }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.count > 0 && <span className="nav-count">{item.count}</span>}
              </div>
            ))}
          </div>
          <div className="sidebar-section" style={{ marginTop: 24 }}>
            <div className="sidebar-label">Categories</div>
            {CATEGORIES.map(c => {
              const count = tasks.filter(t => t.category === c).length;
              return (
                <div key={c} className={`nav-item ${activeCat === c && page === "tasks" ? "active" : ""}`} onClick={() => { setActiveCat(c); setPage("tasks"); }}>
                  <span className="nav-dot" style={{ background: t.muted }} />
                  <span>{c}</span>
                  <span className="nav-count">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="sidebar-bottom">
            <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <span style={{ fontSize: 14 }}>{theme === "dark" ? "○" : "●"}</span>
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>
        </aside>

        <main className="main">
          {page === "dashboard" && <DashboardPage tasks={tasks} />}
          {page === "tasks" && (
            <TasksPage
              tasks={tasks}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              initialCat={activeCat}
            />
          )}
        </main>

        {modal && (
          <AddEditModal
            task={modal.task}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}