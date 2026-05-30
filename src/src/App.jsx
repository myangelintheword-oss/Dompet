import { useState, useEffect, useRef } from "react";

// ── Utility helpers ──────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}Jt`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}rb`;
  return n.toString();
};
const today = () => new Date().toISOString().split("T")[0];
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const CATS = {
  income: ["Gaji", "Freelance", "Investasi", "Bonus", "Transfer Masuk", "Lainnya"],
  expense: ["Makan", "Transport", "Belanja", "Hiburan", "Tagihan", "Kesehatan", "Pendidikan", "Utang", "Lainnya"],
};
const CAT_COLORS = {
  Gaji: "#4ade80", Freelance: "#34d399", Investasi: "#60a5fa", Bonus: "#f472b6", "Transfer Masuk": "#a78bfa", Makan: "#fb923c",
  Transport: "#fbbf24", Belanja: "#f87171", Hiburan: "#e879f9", Tagihan: "#38bdf8", Kesehatan: "#4ade80", Pendidikan: "#818cf8",
  Utang: "#f43f5e", Lainnya: "#94a3b8",
};

const initState = () => ({
  transactions: JSON.parse(localStorage.getItem("fin_tx") || "[]"),
  goals: JSON.parse(localStorage.getItem("fin_goals") || "[]"),
  debts: JSON.parse(localStorage.getItem("fin_debts") || "[]"),
  investments: JSON.parse(localStorage.getItem("fin_inv") || "[]"),
  bills: JSON.parse(localStorage.getItem("fin_bills") || "[]"),
  customCats: JSON.parse(localStorage.getItem("fin_cats") || "[]"),
});

const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── Icons ────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    wallet: "M21 12V7H5a2 2 0 010-4h14v4 M3 5v14a2 2 0 002 2h16v-5 M18 12a1 1 0 000 2h3v-2z",
    target: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8",
    camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8",
    layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    brain: "M12 5C8.5 5 6 7.5 6 10.5c0 1.5.5 2.8 1.4 3.8L6 21h12l-1.4-6.7c.9-1 1.4-2.3 1.4-3.8C18 7.5 15.5 5 12 5z",
    heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    chart: "M18 20V10 M12 20V4 M6 20v-6",
    trash: "M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    x: "M18 6L6 18M6 6l12 12",
    check: "M20 6L9 17l-5-5",
    send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7",
    bot: "M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3v-8a3 3 0 013-3h3V5.73A2 2 0 0110 4a2 2 0 012-2zM9 13a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zm-3 3s-2 0-2-2h4c0 2-2 2-2 2z",
    arrow_up: "M12 19V5M5 12l7-7 7 7",
    arrow_down: "M12 5v14M19 12l-7 7-7-7",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
    menu: "M3 12h18M3 6h18M3 18h18",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    close: "M18 6L6 18M6 6l12 12",
    dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(icons[name] || "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
};

// ── Mini Components ───────────────────────────────────────────────
const Badge = ({ children, color = "#4ade80" }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>
);

const Progress = ({ value, max, color = "#4ade80", height = 8 }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "#ffffff0f", borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .5s ease" }} />
    </div>
  );
};

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{ background: "#1a1f2e", border: "1px solid #ffffff0f", borderRadius: 16, padding: 20, ...style }}>
    {children}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#1a1f2e", border: "1px solid #ffffff15", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#ffffff15", border: "none", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}><Icon name="x" size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>{label}</label>}
    <input {...props} style={{ width: "100%", background: "#0f1420", border: "1px solid #ffffff15", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", ...props.style }} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>{label}</label>}
    <select {...props} style={{ width: "100%", background: "#0f1420", border: "1px solid #ffffff15", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", ...props.style }}>
      {children}
    </select>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg,#4ade80,#22c55e)", color: "#0f1420" },
    secondary: { background: "#ffffff15", color: "#fff" },
    danger: { background: "#f4433620", color: "#f44336", border: "1px solid #f4433640" },
    ghost: { background: "transparent", color: "#94a3b8" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1, ...styles[variant], ...style }}>
      {children}
    </button>
  );
};

// ── AI Chat (uses Anthropic API) ─────────────────────────────────
function AIAdvisor({ transactions, goals, debts }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Halo! Saya AI Advisor keuangan kamu 24/7 🤖\n\nTanya apa aja soal keuanganmu — analisa pengeluaran, tips menabung, atau cara lunasi utang lebih cepat!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const expByCat = {};
  transactions.filter(t => t.type === "expense").forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + t.amount; });

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const systemPrompt = `Kamu adalah AI Advisor keuangan pribadi yang berbicara Bahasa Indonesia secara santai dan helpful. Data keuangan user saat ini:
- Total Pemasukan: Rp ${totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")}
- Sisa: Rp ${(totalIncome - totalExpense).toLocaleString("id-ID")}
- Pengeluaran per kategori: ${JSON.stringify(expByCat)}
- Goals: ${goals.length} goals aktif
- Utang: ${debts.length} utang
Berikan saran yang konkret, personal, dan actionable. Singkat tapi berbobot. Gunakan emoji secukupnya.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "Maaf, ada error. Coba lagi ya!";
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "❌ Koneksi gagal. Pastikan API key aktif ya!" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 400 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", background: m.role === "user" ? "linear-gradient(135deg,#4ade80,#22c55e)" : "#ffffff0f", color: m.role === "user" ? "#0f1420" : "#e2e8f0", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ background: "#ffffff0f", borderRadius: "16px 16px 16px 4px", padding: "10px 16px" }}>
              <span style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #ffffff0f" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Tanya soal keuanganmu..." style={{ flex: 1, background: "#0f1420", border: "1px solid #ffffff15", borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
        <Btn onClick={send} disabled={loading || !input.trim()}><Icon name="send" size={16} /></Btn>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(initState);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState({ month: monthKey(), search: "" });
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const updateState = (key, val) => {
    setState(s => ({ ...s, [key]: val }));
    save(`fin_${key === "transactions" ? "tx" : key === "customCats" ? "cats" : key}`, val);
  };

  const addTx = () => {
    if (!form.amount || !form.category || !form.type) return;
    const tx = { id: Date.now(), ...form, amount: parseFloat(form.amount), date: form.date || today(), note: form.note || "" };
    const newTxs = [tx, ...state.transactions];
    updateState("transactions", newTxs);
    setModal(null); setForm({});
  };

  const deleteTx = (id) => updateState("transactions", state.transactions.filter(t => t.id !== id));

  const addGoal = () => {
    if (!form.name || !form.target) return;
    const goal = { id: Date.now(), name: form.name, target: parseFloat(form.target), saved: parseFloat(form.saved || 0), color: form.color || "#4ade80", deadline: form.deadline || "" };
    updateState("goals", [...state.goals, goal]);
    setModal(null); setForm({});
  };

  const topupGoal = (id, amount) => {
    updateState("goals", state.goals.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g));
  };

  const addDebt = () => {
    if (!form.name || !form.amount) return;
    const debt = { id: Date.now(), name: form.name, amount: parseFloat(form.amount), paid: 0, type: form.type || "utang", note: form.note || "", dueDate: form.dueDate || "" };
    updateState("debts", [...state.debts, debt]);
    setModal(null); setForm({});
  };

  const payDebt = (id, amount) => {
    updateState("debts", state.debts.map(d => d.id === id ? { ...d, paid: Math.min(d.amount, d.paid + amount) } : d));
  };

  const addInvestment = () => {
    if (!form.name || !form.amount) return;
    const inv = { id: Date.now(), name: form.name, amount: parseFloat(form.amount), currentValue: parseFloat(form.currentValue || form.amount), type: form.type || "Saham", note: form.note || "" };
    updateState("investments", [...state.investments, inv]);
    setModal(null); setForm({});
  };

  const addBill = () => {
    if (!form.name || !form.amount) return;
    const bill = { id: Date.now(), name: form.name, amount: parseFloat(form.amount), dueDay: parseInt(form.dueDay || 1), category: form.category || "Tagihan", paid: false, note: form.note || "" };
    updateState("bills", [...state.bills, bill]);
    setModal(null); setForm({});
  };

  const toggleBillPaid = (id) => {
    updateState("bills", state.bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  };

  // Filtered transactions
  const filteredTx = state.transactions.filter(t => {
    const matchMonth = t.date?.startsWith(filter.month);
    const matchSearch = filter.search ? (t.note + t.category).toLowerCase().includes(filter.search.toLowerCase()) : true;
    return matchMonth && matchSearch;
  });

  const monthIncome = filteredTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = filteredTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = state.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) -
    state.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Health score
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;
  const totalDebt = state.debts.reduce((s, d) => s + (d.amount - d.paid), 0);
  const dti = monthIncome > 0 ? (totalDebt / (monthIncome * 12)) * 100 : 0;
  const healthScore = Math.max(0, Math.min(100, Math.round(
    (savingsRate > 20 ? 40 : savingsRate * 2) +
    (dti < 30 ? 30 : Math.max(0, 30 - (dti - 30))) +
    (state.goals.length > 0 ? 20 : 0) +
    (state.bills.filter(b => b.paid).length / Math.max(1, state.bills.length)) * 10
  )));
  const healthColor = healthScore >= 70 ? "#4ade80" : healthScore >= 40 ? "#fbbf24" : "#f87171";

  // Expense by category (this month)
  const expByCat = {};
  filteredTx.filter(t => t.type === "expense").forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + t.amount; });
  const topCats = Object.entries(expByCat).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const getAiInsight = async () => {
    setAiLoading(true);
    try {
      const expStr = topCats.map(([k, v]) => `${k}: ${fmtShort(v)}`).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Buatkan analisa keuangan bulanan singkat (3-4 poin) dalam Bahasa Indonesia untuk user dengan data:
Pemasukan: Rp ${monthIncome.toLocaleString("id-ID")}
Pengeluaran: Rp ${monthExpense.toLocaleString("id-ID")}  
Sisa: Rp ${(monthIncome - monthExpense).toLocaleString("id-ID")}
Kategori terbesar: ${expStr}
Skor kesehatan: ${healthScore}/100
Goals aktif: ${state.goals.length}, Utang: ${state.debts.length}
Berikan insight konkret, jujur, dan actionable. Pakai format bullet dengan emoji.`
          }]
        })
      });
      const data = await res.json();
      setAiInsight(data.content?.[0]?.text || "Gagal ambil insight.");
    } catch { setAiInsight("❌ Gagal. Coba lagi."); }
    setAiLoading(false);
  };

  const allCats = { income: [...CATS.income, ...state.customCats.filter(c => c.type === "income").map(c => c.name)], expense: [...CATS.expense, ...state.customCats.filter(c => c.type === "expense").map(c => c.name)] };

  // Nav items
  const navItems = [
    { id: "home", icon: "home", label: "Home" },
    { id: "transactions", icon: "wallet", label: "Transaksi" },
    { id: "goals", icon: "target", label: "Goals" },
    { id: "debts", icon: "dollar", label: "Utang" },
    { id: "investments", icon: "trending", label: "Investasi" },
    { id: "bills", icon: "bell", label: "Tagihan" },
    { id: "ai", icon: "bot", label: "AI" },
    { id: "settings", icon: "settings", label: "Lainnya" },
  ];

  // ── PAGES ──────────────────────────────────────────────────────
  const HomePage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Balance Card */}
      <div style={{ background: "linear-gradient(135deg,#1a2e1a,#1a3a2a)", border: "1px solid #4ade8030", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "#4ade8015", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, background: "#22c55e10", borderRadius: "50%" }} />
        <p style={{ margin: 0, fontSize: 12, color: "#4ade8099", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Total Saldo</p>
        <h1 style={{ margin: "6px 0 16px", fontSize: 32, fontWeight: 800, color: balance >= 0 ? "#4ade80" : "#f87171", letterSpacing: -1 }}>{fmt(balance)}</h1>
        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#ffffff60" }}>Bulan ini masuk</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#4ade80" }}>+{fmt(monthIncome)}</p>
          </div>
          <div style={{ width: 1, background: "#ffffff15" }} />
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#ffffff60" }}>Bulan ini keluar</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f87171" }}>-{fmt(monthExpense)}</p>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>SKOR KESEHATAN FINANSIAL</p>
            <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: healthColor }}>{healthScore}<span style={{ fontSize: 14, color: "#94a3b8" }}>/100</span></p>
          </div>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: `4px solid ${healthColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            {healthScore >= 70 ? "😊" : healthScore >= 40 ? "😐" : "😟"}
          </div>
        </div>
        <Progress value={healthScore} max={100} color={healthColor} height={6} />
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <Badge color="#60a5fa">Tabungan {savingsRate.toFixed(0)}%</Badge>
          <Badge color={dti < 30 ? "#4ade80" : "#f87171"}>DTI {dti.toFixed(0)}%</Badge>
          <Badge color="#a78bfa">{state.goals.length} Goals</Badge>
        </div>
      </Card>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Btn onClick={() => { setForm({ type: "expense" }); setModal("addTx"); }} style={{ justifyContent: "center", padding: 16, background: "#f8717120", color: "#f87171", border: "1px solid #f8717130", borderRadius: 14, flex: 1 }}>
          <Icon name="minus" size={18} /> Catat Keluar
        </Btn>
        <Btn onClick={() => { setForm({ type: "income" }); setModal("addTx"); }} style={{ justifyContent: "center", padding: 16, background: "#4ade8020", color: "#4ade80", border: "1px solid #4ade8030", borderRadius: 14, flex: 1 }}>
          <Icon name="plus" size={18} /> Catat Masuk
        </Btn>
      </div>

      {/* Top Categories */}
      {topCats.length > 0 && (
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>PENGELUARAN TERBESAR BULAN INI</p>
          {topCats.map(([cat, val]) => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
                <span style={{ fontSize: 13, color: "#f87171", fontWeight: 700 }}>{fmt(val)}</span>
              </div>
              <Progress value={val} max={topCats[0][1]} color={CAT_COLORS[cat] || "#94a3b8"} height={5} />
            </div>
          ))}
        </Card>
      )}

      {/* AI Insight */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>💡 AI INSIGHT BULANAN</p>
          <Btn onClick={getAiInsight} disabled={aiLoading} variant="secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
            {aiLoading ? "Analisa..." : "Generate"}
          </Btn>
        </div>
        {aiInsight ? (
          <p style={{ margin: 0, fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiInsight}</p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#ffffff40", fontStyle: "italic" }}>Klik Generate untuk dapat analisa AI dari data keuanganmu bulan ini.</p>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>TRANSAKSI TERBARU</p>
          <button onClick={() => setTab("transactions")} style={{ background: "none", border: "none", color: "#4ade80", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Lihat semua</button>
        </div>
        {state.transactions.slice(0, 5).map(t => (
          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ffffff08" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: (CAT_COLORS[t.category] || "#94a3b8") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {t.type === "income" ? "💰" : "💸"}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{t.category}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>{t.note || t.date}</p>
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.type === "income" ? "#4ade80" : "#f87171" }}>
              {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
            </span>
          </div>
        ))}
        {state.transactions.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "#ffffff40", textAlign: "center", padding: "16px 0" }}>Belum ada transaksi. Yuk mulai catat!</p>}
      </Card>

      {/* Bills reminder */}
      {state.bills.filter(b => !b.paid).length > 0 && (
        <Card style={{ border: "1px solid #f4433630", background: "#f4433608" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#f87171", fontWeight: 700 }}>🔔 TAGIHAN BELUM DIBAYAR</p>
          {state.bills.filter(b => !b.paid).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
              <span style={{ fontSize: 13 }}>{b.name} <span style={{ color: "#ffffff50", fontSize: 11 }}>tgl {b.dueDay}</span></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>{fmt(b.amount)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );

  const TransactionsPage = () => (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input type="month" value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))} style={{ background: "#1a1f2e", border: "1px solid #ffffff15", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
        <input placeholder="Cari..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #ffffff15", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#4ade8015", border: "1px solid #4ade8030", borderRadius: 12, padding: 12 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#4ade80" }}>MASUK</p>
          <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "#4ade80" }}>{fmt(monthIncome)}</p>
        </div>
        <div style={{ background: "#f8717115", border: "1px solid #f8717130", borderRadius: 12, padding: 12 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#f87171" }}>KELUAR</p>
          <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "#f87171" }}>{fmt(monthExpense)}</p>
        </div>
      </div>
      {filteredTx.length === 0 ? (
        <p style={{ textAlign: "center", color: "#ffffff40", padding: 32 }}>Tidak ada transaksi</p>
      ) : (
        filteredTx.map(t => (
          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1f2e", border: "1px solid #ffffff08", borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: (CAT_COLORS[t.category] || "#94a3b8") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {t.type === "income" ? "💰" : "💸"}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t.category}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>{t.date}{t.note ? " · " + t.note : ""}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? "#4ade80" : "#f87171" }}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
              <button onClick={() => deleteTx(t.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", opacity: 0.5, padding: 4 }}><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const GoalsPage = () => (
    <div>
      {state.goals.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p style={{ color: "#ffffff60" }}>Belum ada goals. Yuk buat target tabungan pertamamu!</p>
        </div>
      ) : (
        state.goals.map(g => {
          const pct = Math.round((g.saved / g.target) * 100);
          return (
            <Card key={g.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{g.name}</h4>
                  {g.deadline && <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>Target: {g.deadline}</p>}
                </div>
                <Badge color={g.color}>{pct}%</Badge>
              </div>
              <Progress value={g.saved} max={g.target} color={g.color} height={8} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "#ffffff60" }}>Terkumpul {fmt(g.saved)}</span>
                <span style={{ fontSize: 12, color: "#ffffff80" }}>Target {fmt(g.target)}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {[50000, 100000, 500000].map(a => (
                  <button key={a} onClick={() => topupGoal(g.id, a)} style={{ flex: 1, background: g.color + "20", color: g.color, border: `1px solid ${g.color}40`, borderRadius: 8, padding: "6px 4px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+{fmtShort(a)}</button>
                ))}
                <button onClick={() => { const amt = prompt("Top up berapa?"); if (amt) topupGoal(g.id, parseFloat(amt)); }} style={{ flex: 1, background: "#ffffff10", color: "#fff", border: "1px solid #ffffff20", borderRadius: 8, padding: "6px 4px", fontSize: 11, cursor: "pointer" }}>Custom</button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  const DebtsPage = () => (
    <div>
      {state.debts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <p style={{ color: "#ffffff60" }}>Belum ada catatan utang/piutang.</p>
        </div>
      ) : (
        state.debts.map(d => {
          const sisa = d.amount - d.paid;
          const pct = Math.round((d.paid / d.amount) * 100);
          const isUtang = d.type !== "piutang";
          return (
            <Card key={d.id} style={{ marginBottom: 12, border: `1px solid ${isUtang ? "#f8717130" : "#4ade8030"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{d.name}</h4>
                  <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>{isUtang ? "🔴 Utang" : "🟢 Piutang"}{d.dueDate ? ` · Jatuh ${d.dueDate}` : ""}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isUtang ? "#f87171" : "#4ade80" }}>{fmt(sisa)}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#ffffff40" }}>sisa dari {fmt(d.amount)}</p>
                </div>
              </div>
              <Progress value={d.paid} max={d.amount} color={isUtang ? "#f87171" : "#4ade80"} height={6} />
              <p style={{ margin: "6px 0 10px", fontSize: 11, color: "#ffffff50" }}>Sudah lunas {pct}%</p>
              {sisa > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  {[50000, 100000, 500000].map(a => (
                    <button key={a} onClick={() => payDebt(d.id, a)} style={{ flex: 1, background: "#ffffff08", color: "#fff", border: "1px solid #ffffff15", borderRadius: 8, padding: "6px 4px", fontSize: 11, cursor: "pointer" }}>+{fmtShort(a)}</button>
                  ))}
                  <button onClick={() => { const amt = prompt("Bayar berapa?"); if (amt) payDebt(d.id, parseFloat(amt)); }} style={{ flex: 1, background: "#ffffff08", color: "#fff", border: "1px solid #ffffff15", borderRadius: 8, padding: "6px", fontSize: 11, cursor: "pointer" }}>Custom</button>
                </div>
              )}
              {sisa === 0 && <Badge color="#4ade80">✅ Lunas!</Badge>}
            </Card>
          );
        })
      )}
    </div>
  );

  const InvestmentsPage = () => {
    const totalInvested = state.investments.reduce((s, i) => s + i.amount, 0);
    const totalCurrent = state.investments.reduce((s, i) => s + i.currentValue, 0);
    const gain = totalCurrent - totalInvested;
    return (
      <div>
        {state.investments.length > 0 && (
          <Card style={{ marginBottom: 16, background: gain >= 0 ? "#1a2e1a" : "#2e1a1a", border: `1px solid ${gain >= 0 ? "#4ade8030" : "#f8717130"}` }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "#94a3b8" }}>TOTAL PORTFOLIO</p>
            <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800 }}>{fmt(totalCurrent)}</p>
            <p style={{ margin: 0, fontSize: 14, color: gain >= 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>
              {gain >= 0 ? "📈 +" : "📉 "}{fmt(gain)} ({totalInvested > 0 ? ((gain / totalInvested) * 100).toFixed(1) : 0}%)
            </p>
          </Card>
        )}
        {state.investments.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
            <p style={{ color: "#ffffff60" }}>Mulai tracking investasimu!</p>
          </div>
        ) : (
          state.investments.map(inv => {
            const pnl = inv.currentValue - inv.amount;
            const pnlPct = ((pnl / inv.amount) * 100).toFixed(1);
            return (
              <Card key={inv.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{inv.name}</h4>
                    <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>{inv.type}{inv.note ? " · " + inv.note : ""}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ffffff60" }}>Modal: {fmt(inv.amount)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{fmt(inv.currentValue)}</p>
                    <p style={{ margin: 0, fontSize: 13, color: pnl >= 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>{pnl >= 0 ? "+" : ""}{fmt(pnl)} ({pnlPct}%)</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  const BillsPage = () => {
    const unpaid = state.bills.filter(b => !b.paid);
    const paid = state.bills.filter(b => b.paid);
    return (
      <div>
        {unpaid.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#f87171", fontWeight: 700, letterSpacing: 0.5 }}>BELUM DIBAYAR</p>
            {unpaid.map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f4433608", border: "1px solid #f4433630", borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{b.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>Tgl {b.dueDay} · {b.category}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#f87171" }}>{fmt(b.amount)}</span>
                  <button onClick={() => toggleBillPaid(b.id)} style={{ background: "#4ade8020", color: "#4ade80", border: "1px solid #4ade8040", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Bayar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {paid.length > 0 && (
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#4ade80", fontWeight: 700, letterSpacing: 0.5 }}>SUDAH DIBAYAR</p>
            {paid.map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#4ade8008", border: "1px solid #4ade8020", borderRadius: 12, padding: 14, marginBottom: 8, opacity: 0.7 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>✅ {b.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#ffffff50" }}>Tgl {b.dueDay}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff50" }}>{fmt(b.amount)}</span>
                  <button onClick={() => toggleBillPaid(b.id)} style={{ background: "#ffffff10", color: "#94a3b8", border: "1px solid #ffffff20", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>Batal</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {state.bills.length === 0 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <p style={{ color: "#ffffff60" }}>Tambah tagihan rutin untuk dapat reminder!</p>
          </div>
        )}
      </div>
    );
  };

  const SettingsPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>KATEGORI KUSTOM</p>
        {state.customCats.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ffffff08" }}>
            <span style={{ fontSize: 14 }}>{c.name} <Badge color={c.type === "income" ? "#4ade80" : "#f87171"}>{c.type}</Badge></span>
            <button onClick={() => updateState("customCats", state.customCats.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <Btn onClick={() => setModal("addCat")} variant="secondary" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}><Icon name="plus" size={14} /> Tambah Kategori</Btn>
      </Card>

      <Card>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>STATISTIK DATA</p>
        {[["Transaksi", state.transactions.length], ["Goals", state.goals.length], ["Utang/Piutang", state.debts.length], ["Investasi", state.investments.length], ["Tagihan Rutin", state.bills.length]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ffffff08" }}>
            <span style={{ fontSize: 14, color: "#ffffff80" }}>{k}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>

      <Card style={{ border: "1px solid #f4433630" }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#f87171", fontWeight: 600 }}>⚠️ HAPUS SEMUA DATA</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#ffffff60" }}>Hati-hati! Data yang dihapus tidak bisa dikembalikan.</p>
        <Btn variant="danger" onClick={() => { if (confirm("Yakin mau hapus semua data?")) { localStorage.clear(); setState(initState()); } }}>Hapus Semua Data</Btn>
      </Card>
    </div>
  );

  const getPageTitle = () => {
    const titles = { home: "Dompet Digital", transactions: "Transaksi", goals: "Goals & Target", debts: "Utang & Piutang", investments: "Investasi", bills: "Tagihan Rutin", ai: "AI Advisor", settings: "Pengaturan" };
    return titles[tab] || "";
  };

  const getFABAction = () => {
    const actions = {
      transactions: { label: "Tambah Transaksi", action: () => { setForm({ type: "expense" }); setModal("addTx"); } },
      goals: { label: "Tambah Goal", action: () => { setForm({}); setModal("addGoal"); } },
      debts: { label: "Tambah Utang", action: () => { setForm({}); setModal("addDebt"); } },
      investments: { label: "Tambah Investasi", action: () => { setForm({}); setModal("addInv"); } },
      bills: { label: "Tambah Tagihan", action: () => { setForm({}); setModal("addBill"); } },
    };
    return actions[tab];
  };

  const fab = getFABAction();

  return (
    <div style={{ background: "#0f1420", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif", paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ffffff20; border-radius: 2px; }
        select option { background: #1a1f2e; }
        input[type=month]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: "#0f1420ee", backdropFilter: "blur(12px)", borderBottom: "1px solid #ffffff08", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: tab === "home" ? "#4ade80" : "#e2e8f0" }}>{getPageTitle()}</h2>
        {tab === "home" && (
          <div style={{ fontSize: 12, color: "#ffffff50" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto", animation: "slideUp .3s ease" }}>
        {tab === "home" && <HomePage />}
        {tab === "transactions" && <TransactionsPage />}
        {tab === "goals" && <GoalsPage />}
        {tab === "debts" && <DebtsPage />}
        {tab === "investments" && <InvestmentsPage />}
        {tab === "bills" && <BillsPage />}
        {tab === "ai" && (
          <Card style={{ minHeight: 400 }}>
            <AIAdvisor transactions={state.transactions} goals={state.goals} debts={state.debts} />
          </Card>
        )}
        {tab === "settings" && <SettingsPage />}
      </div>

      {/* FAB */}
      {fab && (
        <button onClick={fab.action} style={{ position: "fixed", bottom: 84, right: 20, background: "linear-gradient(135deg,#4ade80,#22c55e)", border: "none", borderRadius: 16, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px #4ade8050", zIndex: 200, color: "#0f1420" }}>
          <Icon name="plus" size={24} />
        </button>
      )}

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#131926", borderTop: "1px solid #ffffff0f", display: "flex", zIndex: 300, maxWidth: 600, margin: "0 auto" }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 4px 14px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === n.id ? "#4ade80" : "#ffffff40", transition: "color .2s" }}>
            <Icon name={n.icon} size={20} />
            <span style={{ fontSize: 9, fontWeight: tab === n.id ? 700 : 500 }}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* ── MODALS ── */}
      <Modal open={modal === "addTx"} onClose={() => { setModal(null); setForm({}); }} title="Catat Transaksi">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["expense", "income"].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: 10, background: form.type === t ? (t === "income" ? "#4ade80" : "#f87171") : "#ffffff10", color: form.type === t ? "#0f1420" : "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {t === "income" ? "💰 Pemasukan" : "💸 Pengeluaran"}
            </button>
          ))}
        </div>
        <Input label="Jumlah (Rp)" type="number" placeholder="0" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <Select label="Kategori" value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          <option value="">Pilih kategori</option>
          {(allCats[form.type] || []).map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Tanggal" type="date" value={form.date || today()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <Input label="Catatan (opsional)" placeholder="e.g. makan siang sama teman" value={form.note || ""} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        <Btn onClick={addTx} disabled={!form.amount || !form.category} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Simpan Transaksi</Btn>
      </Modal>

      <Modal open={modal === "addGoal"} onClose={() => { setModal(null); setForm({}); }} title="Tambah Goal">
        <Input label="Nama Goal" placeholder="e.g. Dana Darurat, DP Rumah" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Target (Rp)" type="number" placeholder="0" value={form.target || ""} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
        <Input label="Sudah ditabung (Rp)" type="number" placeholder="0" value={form.saved || ""} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))} />
        <Input label="Deadline (opsional)" type="date" value={form.deadline || ""} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>Warna</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["#4ade80", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#f87171"].map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, background: c, borderRadius: "50%", border: form.color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <Btn onClick={addGoal} disabled={!form.name || !form.target} style={{ width: "100%", justifyContent: "center" }}>Buat Goal</Btn>
      </Modal>

      <Modal open={modal === "addDebt"} onClose={() => { setModal(null); setForm({}); }} title="Tambah Utang/Piutang">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["utang", "piutang"].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: 10, background: form.type === t ? (t === "utang" ? "#f87171" : "#4ade80") : "#ffffff10", color: form.type === t ? "#0f1420" : "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {t === "utang" ? "🔴 Utang" : "🟢 Piutang"}
            </button>
          ))}
        </div>
        <Input label="Nama / Siapa" placeholder="e.g. KPR BRI, Pinjam ke Budi" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Jumlah Total (Rp)" type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <Input label="Jatuh Tempo (opsional)" type="date" value={form.dueDate || ""} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        <Input label="Catatan (opsional)" value={form.note || ""} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        <Btn onClick={addDebt} disabled={!form.name || !form.amount} style={{ width: "100%", justifyContent: "center" }}>Simpan</Btn>
      </Modal>

      <Modal open={modal === "addInv"} onClose={() => { setModal(null); setForm({}); }} title="Tambah Investasi">
        <Input label="Nama Investasi" placeholder="e.g. BBCA, Reksadana X, Bitcoin" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Select label="Jenis" value={form.type || ""} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="">Pilih jenis</option>
          {["Saham", "Reksadana", "Crypto", "Obligasi", "Emas", "Properti", "Lainnya"].map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Modal Awal (Rp)" type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <Input label="Nilai Sekarang (Rp)" type="number" value={form.currentValue || ""} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} />
        <Input label="Catatan (opsional)" value={form.note || ""} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        <Btn onClick={addInvestment} disabled={!form.name || !form.amount} style={{ width: "100%", justifyContent: "center" }}>Simpan</Btn>
      </Modal>

      <Modal open={modal === "addBill"} onClose={() => { setModal(null); setForm({}); }} title="Tambah Tagihan Rutin">
        <Input label="Nama Tagihan" placeholder="e.g. Listrik, Netflix, BPJS" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Jumlah (Rp)" type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <Input label="Tanggal Jatuh Tempo" type="number" min="1" max="31" placeholder="1-31" value={form.dueDay || ""} onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))} />
        <Select label="Kategori" value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          <option value="">Pilih</option>
          {["Listrik", "Air", "Internet", "Telepon", "Streaming", "Asuransi", "BPJS", "Cicilan", "Sewa", "Lainnya"].map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Btn onClick={addBill} disabled={!form.name || !form.amount} style={{ width: "100%", justifyContent: "center" }}>Tambah Tagihan</Btn>
      </Modal>

      <Modal open={modal === "addCat"} onClose={() => { setModal(null); setForm({}); }} title="Kategori Kustom">
        <Input label="Nama Kategori" placeholder="e.g. Investasi Crypto" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Select label="Tipe" value={form.type || ""} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="">Pilih tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </Select>
        <Btn onClick={() => { if (!form.name || !form.type) return; updateState("customCats", [...state.customCats, { name: form.name, type: form.type }]); setModal(null); setForm({}); }} disabled={!form.name || !form.type} style={{ width: "100%", justifyContent: "center" }}>Tambah Kategori</Btn>
      </Modal>
    </div>
  );
}
