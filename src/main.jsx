import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck, ClipboardList, DollarSign, Edit3, FileText, Home,
  LogOut, Plus, Printer, Search, Share2, Trash2, X
} from "lucide-react";
import "./styles.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GST_RATE = 0.1;

const horseFields = [
  ["name", "Registered Name", "text"],
  ["stable_name", "Stable Name", "text"],
  ["age", "Age", "number"],
  ["sex", "Sex", "select", ["Gelding", "Mare", "Horse", "Colt", "Filly"]],
  ["owner", "Owner", "text"],
  ["trainer", "Trainer", "text"],
  ["status", "Status", "select", ["Racing", "Building", "Trialling", "Spelling", "Rehab", "Sold", "Retired"]],
  ["next_target", "Next Target", "text"],
  ["notes", "Notes", "textarea"]
];

const workFields = [
  ["date", "Date", "date"],
  ["horse_name", "Horse", "horseName"],
  ["sector", "Work Sector", "select", ["Track Work", "Jogger Machine", "Warm Up", "Race Warm Up", "Trial", "Swimming", "Treadmill", "Walking Machine", "Beach Work", "Recovery"]],
  ["work_type", "Work Type", "select", ["Jog", "Pacework", "Fast work", "Hopple", "Jogger machine", "Warm up", "Swim", "Treadmill", "Walking machine", "Beach work", "Trial", "Qualifier", "Recovery"]],
  ["warmup", "Warm Up Details", "textarea"],
  ["jogger_machine_details", "Jogger Machine Details", "textarea"],
  ["distance", "Distance", "text"],
  ["time", "Time", "text"],
  ["sectionals", "Sectionals", "text"],
  ["driver", "Driver", "text"],
  ["recovery", "Recovery", "text"],
  ["notes", "Notes", "textarea"]
];

const financeFields = [
  ["entry_date", "Date", "date"],
  ["horse_name", "Horse", "horseName"],
  ["entry_type", "Type", "select", ["Income", "Expense"]],
  ["category", "Category", "text"],
  ["amount", "Amount", "number"],
  ["paid", "Paid", "select", ["Yes", "No"]],
  ["notes", "Notes", "textarea"]
];

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stable, setStable] = useState(null);
  const [tab, setTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    loadProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, stables(*)")
      .eq("id", session.user.id)
      .single();

    if (error) {
      setToast("This login is not linked to a stable profile yet.");
      return;
    }
    setProfile(data);
    setStable(data.stables);
  }

  if (loading) return <div className="center">Loading...</div>;
  if (!session) return <Login />;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>The Trotting Stable App</h1>
          <p>{stable?.name || "Stable"} · {profile?.role || "user"}</p>
        </div>
        <button className="ghost" onClick={() => supabase.auth.signOut()}><LogOut size={18}/>Logout</button>
      </header>

      {toast && <div className="toast" onClick={() => setToast("")}>{toast}</div>}

      <nav className="nav">
        <button className={tab==="home" ? "active" : ""} onClick={() => setTab("home")}><Home size={16}/>Home</button>
        <button className={tab==="horses" ? "active" : ""} onClick={() => setTab("horses")}><BadgeCheck size={16}/>Horses</button>
        <button className={tab==="work" ? "active" : ""} onClick={() => setTab("work")}><ClipboardList size={16}/>Work</button>
        <button className={tab==="finance" ? "active" : ""} onClick={() => setTab("finance")}><DollarSign size={16}/>Finance</button>
        <button className={tab==="invoices" ? "active" : ""} onClick={() => setTab("invoices")}><FileText size={16}/>Invoices</button>
      </nav>

      {tab === "home" && <Dashboard stableId={profile?.stable_id} />}
      {tab === "horses" && <GenericTable stableId={profile?.stable_id} table="horses" title="Horses" icon={BadgeCheck} fields={horseFields} display={["stable_name","age","sex","owner","trainer","status","next_target"]} setToast={setToast} />}
      {tab === "work" && <Work stableId={profile?.stable_id} setToast={setToast} />}
      {tab === "finance" && <GenericTable stableId={profile?.stable_id} table="finance_entries" title="Finance" icon={DollarSign} fields={financeFields} display={["entry_date","horse_name","entry_type","category","amount","paid","notes"]} setToast={setToast} />}
      {tab === "invoices" && <Invoices stableId={profile?.stable_id} setToast={setToast} />}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  }

  return (
    <main className="login">
      <section className="login-card">
        <h1>The Trotting Stable App</h1>
        <p>Secure stable management login.</p>
        <form onSubmit={submit}>
          <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" /></label>
          <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" /></label>
          <button className="primary full">Login</button>
        </form>
        {message && <p className="error">{message}</p>}
      </section>
    </main>
  );
}

function Dashboard({ stableId }) {
  const [counts, setCounts] = useState({ horses: 0, work: 0, invoices: 0, finance: 0 });

  useEffect(() => {
    if (!stableId) return;
    load();
  }, [stableId]);

  async function count(table) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("stable_id", stableId);
    return count || 0;
  }

  async function load() {
    const [horses, work, invoices, finance] = await Promise.all([
      count("horses"),
      count("work_entries"),
      count("invoices"),
      count("finance_entries")
    ]);
    setCounts({ horses, work, invoices, finance });
  }

  return (
    <main className="page">
      <section className="stats">
        <Stat icon={BadgeCheck} label="Horses" value={counts.horses} />
        <Stat icon={ClipboardList} label="Work Entries" value={counts.work} />
        <Stat icon={FileText} label="Invoices" value={counts.invoices} />
        <Stat icon={DollarSign} label="Finance" value={counts.finance} />
      </section>
      <section className="card">
        <h2>Security active</h2>
        <p>The app requires login and reads/writes data using your linked stable profile.</p>
      </section>
    </main>
  );
}

function Work({ stableId, setToast }) {
  const [horses, setHorses] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!stableId) return;
    supabase.from("horses").select("name").eq("stable_id", stableId).then(({ data }) => {
      setHorses(data || []);
      if (data?.[0]?.name && !selected) setSelected(data[0].name);
    });
  }, [stableId]);

  return (
    <main className="page">
      <WorkHistory stableId={stableId} horses={horses} selected={selected} setSelected={setSelected} />
      <GenericTable stableId={stableId} table="work_entries" title="Training Work Log" icon={ClipboardList} fields={workFields} display={["date","horse_name","sector","work_type","warmup","jogger_machine_details","distance","time","driver","notes"]} setToast={setToast} embedded />
    </main>
  );
}

function WorkHistory({ stableId, horses, selected, setSelected }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!stableId || !selected) return;
    supabase.from("work_entries").select("*").eq("stable_id", stableId).eq("horse_name", selected).order("date", { ascending: false }).then(({ data }) => setRows(data || []));
  }, [stableId, selected]);

  return (
    <section className="card">
      <h2>Single Horse Work History Isolator</h2>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        {horses.map(h => <option key={h.name}>{h.name}</option>)}
      </select>
      <div className="mini-stats">
        <span>{rows.length} total</span>
        <span>{rows.filter(r => r.sector === "Track Work").length} track</span>
        <span>{rows.filter(r => r.sector === "Jogger Machine").length} jogger machine</span>
        <span>{rows.filter(r => r.warmup).length} warm-ups</span>
      </div>
      <div className="list">
        {rows.slice(0, 8).map(r => (
          <article className="mini-work" key={r.id}>
            <strong>{r.date} · {r.sector}</strong>
            <span>{r.work_type} {r.distance ? `· ${r.distance}` : ""} {r.time ? `· ${r.time}` : ""}</span>
            {r.warmup && <em>Warm-up: {r.warmup}</em>}
            {r.jogger_machine_details && <em>Jogger: {r.jogger_machine_details}</em>}
          </article>
        ))}
      </div>
    </section>
  );
}

function GenericTable({ stableId, table, title, icon: Icon, fields, display, setToast, embedded = false }) {
  const [rows, setRows] = useState([]);
  const [horses, setHorses] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!stableId) return;
    load();
    supabase.from("horses").select("name").eq("stable_id", stableId).then(({ data }) => setHorses(data || []));
  }, [stableId, table]);

  async function load() {
    const { data, error } = await supabase.from(table).select("*").eq("stable_id", stableId).order("created_at", { ascending: false });
    if (error) setToast(error.message);
    setRows(data || []);
  }

  function blank() {
    const rec = {};
    fields.forEach(([key, _label, type, options]) => {
      if (type === "date") rec[key] = new Date().toISOString().slice(0, 10);
      else if (type === "number") rec[key] = "";
      else if (type === "select") rec[key] = options[0];
      else if (type === "horseName") rec[key] = horses[0]?.name || "";
      else rec[key] = "";
    });
    return rec;
  }

  async function save(record, mode) {
    const clean = { ...record, stable_id: stableId };
    fields.forEach(([key, _label, type]) => {
      if (type === "number") clean[key] = clean[key] === "" ? 0 : Number(clean[key]);
    });

    const result = mode === "edit"
      ? await supabase.from(table).update(clean).eq("id", clean.id).eq("stable_id", stableId)
      : await supabase.from(table).insert(clean);

    if (result.error) setToast(result.error.message);
    else {
      setToast("Saved.");
      setModal(null);
      load();
    }
  }

  async function remove(id) {
    const { error } = await supabase.from(table).delete().eq("id", id).eq("stable_id", stableId);
    if (error) setToast(error.message);
    else load();
  }

  const filtered = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  const content = (
    <>
      <section className="module-header">
        <div className="module-icon"><Icon size={24} /></div>
        <div><h2>{title}</h2><p>Cloud saved and stable-secured.</p></div>
      </section>
      <section className="toolbar">
        <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} /></div>
        <button className="primary" onClick={() => setModal({ mode: "add", record: blank() })}><Plus size={18}/>Add</button>
      </section>
      <section className="grid">
        {filtered.map(row => (
          <article className="record" key={row.id}>
            <div className="record-head">
              <div><h3>{row.name || row.horse_name || row.entry_date || row.date || "Record"}</h3><p>{row.status || row.work_type || row.category || ""}</p></div>
              <div className="button-row">
                <button className="edit" onClick={() => setModal({ mode: "edit", record: { ...row } })}><Edit3 size={16}/></button>
                <button className="delete" onClick={() => remove(row.id)}><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="details">
              {display.map(k => <div key={k}><span>{labelize(k)}</span><strong>{formatValue(row[k])}</strong></div>)}
            </div>
          </article>
        ))}
      </section>
      {modal && <RecordModal fields={fields} title={`${modal.mode === "edit" ? "Edit" : "Add"} ${title}`} record={modal.record} horses={horses} onClose={() => setModal(null)} onSave={rec => save(rec, modal.mode)} />}
    </>
  );

  return embedded ? content : <main className="page">{content}</main>;
}

function Invoices({ stableId, setToast }) {
  const [rows, setRows] = useState([]);
  const [horses, setHorses] = useState([]);
  const [modal, setModal] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  useEffect(() => {
    if (!stableId) return;
    load();
  }, [stableId]);

  async function load() {
    const { data, error } = await supabase.from("invoices").select("*").eq("stable_id", stableId).order("created_at", { ascending: false });
    if (error) setToast(error.message);
    setRows(data || []);
    const horsesResult = await supabase.from("horses").select("name").eq("stable_id", stableId);
    setHorses(horsesResult.data || []);
  }

  function blank() {
    return {
      invoice_number: `INV-${String(rows.length + 1).padStart(4, "0")}`,
      client_name: "",
      client_email: "",
      client_phone: "",
      horse_name: horses[0]?.name || "",
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "Draft",
      notes: "",
      line_items: [{ id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }]
    };
  }

  async function save(invoice, mode) {
    const totals = invoiceTotals(invoice);
    const clean = { ...invoice, stable_id: stableId, amount: totals.subtotal, gst: totals.gst, total: totals.total };

    const result = mode === "edit"
      ? await supabase.from("invoices").update(clean).eq("id", clean.id).eq("stable_id", stableId)
      : await supabase.from("invoices").insert(clean);

    if (result.error) setToast(result.error.message);
    else {
      setToast("Invoice saved.");
      setModal(null);
      load();
    }
  }

  async function remove(id) {
    await supabase.from("invoices").delete().eq("id", id).eq("stable_id", stableId);
    load();
  }

  return (
    <main className="page">
      <section className="module-header">
        <div className="module-icon"><FileText size={24}/></div>
        <div><h2>Invoices</h2><p>Create, edit, print and share invoices.</p></div>
      </section>
      <section className="toolbar">
        <button className="primary" onClick={() => setModal({ mode: "add", invoice: blank() })}><Plus size={18}/>Create Invoice</button>
      </section>
      <section className="grid">
        {rows.map(inv => {
          const totals = invoiceTotals(inv);
          return (
            <article className="record" key={inv.id}>
              <div className="record-head">
                <div><h3>{inv.invoice_number}</h3><p>{inv.client_name} · {inv.horse_name}</p></div>
                <div className="button-row">
                  <button className="edit" onClick={() => setModal({ mode: "edit", invoice: inv })}><Edit3 size={16}/></button>
                  <button className="print" onClick={() => setPrintInvoice(inv)}><Printer size={16}/></button>
                  <button className="share" onClick={() => shareInvoice(inv)}><Share2 size={16}/></button>
                  <button className="delete" onClick={() => remove(inv.id)}><Trash2 size={16}/></button>
                </div>
              </div>
              <div className="details">
                <div><span>Status</span><strong>{inv.status}</strong></div>
                <div><span>Due</span><strong>{inv.due_date}</strong></div>
                <div><span>Email</span><strong>{inv.client_email || "-"}</strong></div>
                <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
              </div>
            </article>
          );
        })}
      </section>
      {modal && <InvoiceModal modal={modal} horses={horses} onClose={() => setModal(null)} onSave={save} />}
      {printInvoice && <InvoicePrint invoice={printInvoice} onClose={() => setPrintInvoice(null)} />}
    </main>
  );
}

function RecordModal({ title, fields, record, horses, onClose, onSave }) {
  const [form, setForm] = useState(record);
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={20}/></button></div>
        <div className="form-grid">
          {fields.map(([key, label, type, options]) => (
            <Field key={key} label={label}>
              <Input type={type} options={options} value={form[key] ?? ""} horses={horses} onChange={v => setForm(cur => ({ ...cur, [key]: v }))} />
            </Field>
          ))}
        </div>
        <button className="primary full" onClick={() => onSave(form)}>Save</button>
      </section>
    </div>
  );
}

function InvoiceModal({ modal, horses, onClose, onSave }) {
  const [invoice, setInvoice] = useState(modal.invoice);
  const totals = invoiceTotals(invoice);

  function setField(key, value) {
    setInvoice(cur => ({ ...cur, [key]: value }));
  }

  function setLine(id, key, value) {
    setInvoice(cur => ({ ...cur, line_items: (cur.line_items || []).map(li => li.id === id ? { ...li, [key]: value } : li) }));
  }

  function addLine() {
    setInvoice(cur => ({ ...cur, line_items: [...(cur.line_items || []), { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }] }));
  }

  function removeLine(id) {
    setInvoice(cur => ({ ...cur, line_items: (cur.line_items || []).filter(li => li.id !== id) }));
  }

  return (
    <div className="modal-backdrop">
      <section className="modal invoice-modal">
        <div className="modal-head"><h2>{modal.mode === "edit" ? "Edit" : "Create"} Invoice</h2><button onClick={onClose}><X size={20}/></button></div>
        <div className="form-grid">
          <Field label="Invoice Number"><input value={invoice.invoice_number || ""} onChange={e => setField("invoice_number", e.target.value)} /></Field>
          <Field label="Client Name"><input value={invoice.client_name || ""} onChange={e => setField("client_name", e.target.value)} /></Field>
          <Field label="Client Email"><input value={invoice.client_email || ""} onChange={e => setField("client_email", e.target.value)} /></Field>
          <Field label="Client Phone"><input value={invoice.client_phone || ""} onChange={e => setField("client_phone", e.target.value)} /></Field>
          <Field label="Horse"><select value={invoice.horse_name || ""} onChange={e => setField("horse_name", e.target.value)}>{horses.map(h => <option key={h.name}>{h.name}</option>)}</select></Field>
          <Field label="Due Date"><input type="date" value={invoice.due_date || ""} onChange={e => setField("due_date", e.target.value)} /></Field>
          <Field label="Status"><select value={invoice.status || "Draft"} onChange={e => setField("status", e.target.value)}><option>Draft</option><option>Sent</option><option>Part Paid</option><option>Paid</option><option>Overdue</option></select></Field>
          <Field label="Notes"><textarea value={invoice.notes || ""} onChange={e => setField("notes", e.target.value)} /></Field>
        </div>
        <section className="invoice-lines">
          <div className="section-title"><h3>Line Items</h3><button className="text" onClick={addLine}>+ Add Line</button></div>
          {(invoice.line_items || []).map(li => (
            <div className="line-item" key={li.id}>
              <input placeholder="Description" value={li.description || ""} onChange={e => setLine(li.id, "description", e.target.value)} />
              <input type="number" placeholder="Qty" value={li.quantity || 0} onChange={e => setLine(li.id, "quantity", e.target.value)} />
              <input type="number" placeholder="Unit $" value={li.unit_price || 0} onChange={e => setLine(li.id, "unit_price", e.target.value)} />
              <strong>${(Number(li.quantity || 0) * Number(li.unit_price || 0)).toFixed(2)}</strong>
              <button className="delete small" onClick={() => removeLine(li.id)}><Trash2 size={14}/></button>
            </div>
          ))}
        </section>
        <section className="invoice-totals">
          <div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div>
          <div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div>
          <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
        </section>
        <button className="primary full" onClick={() => onSave(invoice, modal.mode)}>Save Invoice</button>
      </section>
    </div>
  );
}

function InvoicePrint({ invoice, onClose }) {
  const totals = invoiceTotals(invoice);
  return (
    <div className="print-backdrop">
      <section className="print-actions">
        <button className="primary" onClick={() => window.print()}><Printer size={18}/>Print / Save PDF</button>
        <button className="danger" onClick={onClose}>Close</button>
      </section>
      <main className="invoice-print">
        <header className="invoice-print-head">
          <div><h1>Invoice</h1><p>The Trotting Stable App</p></div>
          <div><strong>{invoice.invoice_number}</strong><p>Status: {invoice.status}</p></div>
        </header>
        <section className="invoice-print-grid">
          <div><h3>Bill To</h3><p>{invoice.client_name}</p><p>{invoice.client_email}</p><p>{invoice.client_phone}</p><p>{invoice.horse_name}</p></div>
          <div><h3>Dates</h3><p>Due: {invoice.due_date}</p></div>
        </section>
        <table className="invoice-table">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
          <tbody>{(invoice.line_items || []).map(li => <tr key={li.id}><td>{li.description}</td><td>{li.quantity}</td><td>${Number(li.unit_price || 0).toFixed(2)}</td><td>${(Number(li.quantity || 0) * Number(li.unit_price || 0)).toFixed(2)}</td></tr>)}</tbody>
        </table>
        <section className="invoice-print-totals">
          <div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div>
          <div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div>
          <div className="grand"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
        </section>
        {invoice.notes && <section><h3>Notes</h3><p>{invoice.notes}</p></section>}
      </main>
    </div>
  );
}

function Input({ type, options, value, horses, onChange }) {
  if (type === "textarea") return <textarea value={value} onChange={e => onChange(e.target.value)} />;
  if (type === "select") return <select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select>;
  if (type === "horseName") return <select value={value} onChange={e => onChange(e.target.value)}>{horses.map(h => <option key={h.name}>{h.name}</option>)}</select>;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} />;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Stat({ icon: Icon, label, value }) {
  return <section className="stat"><div><Icon size={22}/></div><p>{label}</p><strong>{value}</strong></section>;
}

function invoiceTotals(invoice) {
  const subtotal = (invoice.line_items || []).reduce((sum, li) => sum + Number(li.quantity || 0) * Number(li.unit_price || 0), 0);
  const gst = subtotal * GST_RATE;
  return { subtotal, gst, total: subtotal + gst };
}

async function shareInvoice(invoice) {
  const totals = invoiceTotals(invoice);
  const text = `Invoice ${invoice.invoice_number} for ${invoice.horse_name}: $${totals.total.toFixed(2)} due ${invoice.due_date}.`;
  if (navigator.share) await navigator.share({ title: `Invoice ${invoice.invoice_number}`, text });
  else {
    await navigator.clipboard.writeText(text);
    alert("Invoice text copied.");
  }
}

function labelize(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

createRoot(document.getElementById("root")).render(<App />);
