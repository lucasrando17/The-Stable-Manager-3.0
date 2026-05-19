import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck, BarChart3, CalendarDays, ClipboardList, DollarSign, Edit3,
  FileText, HeartPulse, Home, LogIn, LogOut, Mail, MessageSquareText,
  Package, Plus, Printer, Search, Share2, ShieldCheck, Trash2, Trophy,
  Users, Wheat, X
} from "lucide-react";
import "./styles.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GST_RATE = 0.1;
const photoPaths = ["/login-photos/photo-1.jpg", "/login-photos/photo-2.jpg", "/login-photos/photo-3.jpg", "/login-photos/photo-4.jpg"];

const modules = {
  horses: {
    table: "horses", title: "Horses", icon: BadgeCheck,
    fields: [
      ["name", "Registered Name", "text"], ["stable_name", "Stable Name", "text"],
      ["age", "Age", "number"], ["sex", "Sex", "select", ["Gelding","Mare","Horse","Colt","Filly"]],
      ["owner", "Owner", "text"], ["trainer", "Trainer", "text"],
      ["status", "Status", "select", ["Racing","Building","Trialling","Spelling","Rehab","Sold","Retired"]],
      ["next_target", "Next Target", "text"], ["notes", "Notes", "textarea"]
    ],
    display: ["stable_name","age","sex","owner","trainer","status","next_target"]
  },
  work: {
    table: "work_entries", title: "Work", icon: ClipboardList,
    fields: [
      ["date", "Date", "date"], ["horse_name", "Horse", "horseName"],
      ["sector", "Work Sector", "select", ["Track Work","Jogger Machine","Warm Up","Race Warm Up","Trial","Swimming","Treadmill","Walking Machine","Beach Work","Recovery"]],
      ["work_type", "Work Type", "select", ["Jog","Pacework","Fast work","Hopple","Jogger machine","Warm up","Swim","Treadmill","Walking machine","Beach work","Trial","Qualifier","Recovery"]],
      ["warmup", "Warm Up Details", "textarea"], ["jogger_machine_details", "Jogger Machine Details", "textarea"],
      ["distance", "Distance", "text"], ["time", "Time", "text"], ["sectionals", "Sectionals", "text"],
      ["driver", "Driver", "text"], ["recovery", "Recovery", "text"], ["notes", "Notes", "textarea"]
    ],
    display: ["date","horse_name","sector","work_type","warmup","jogger_machine_details","distance","time","driver","notes"]
  },
  racing: {
    table: "race_records", title: "Racing", icon: Trophy,
    fields: [
      ["date", "Date", "date"], ["horse_name", "Horse", "horseName"], ["track", "Track", "text"],
      ["race", "Race/Class", "text"], ["distance", "Distance", "text"],
      ["status", "Status", "select", ["Target","Nominated","Accepted","Scratched","Completed"]],
      ["driver", "Driver", "text"], ["result", "Result", "text"], ["notes", "Notes", "textarea"]
    ],
    display: ["date","horse_name","track","race","status","driver","result"]
  },
  treatments: {
    table: "treatments", title: "Vet", icon: HeartPulse,
    fields: [
      ["treatment_date", "Date", "date"], ["horse_name", "Horse", "horseName"],
      ["treatment_type", "Treatment", "text"], ["veterinarian", "Vet", "text"],
      ["follow_up_date", "Follow Up", "date"], ["notes", "Notes", "textarea"]
    ],
    display: ["treatment_date","horse_name","treatment_type","veterinarian","follow_up_date","notes"]
  },
  feed: {
    table: "feed_programs", title: "Feed", icon: Wheat,
    fields: [
      ["horse_name", "Horse", "horseName"], ["morning_feed", "Morning Feed", "textarea"],
      ["lunch_feed", "Lunch Feed", "textarea"], ["night_feed", "Night Feed", "textarea"],
      ["supplements", "Supplements", "textarea"], ["notes", "Notes", "textarea"]
    ],
    display: ["horse_name","morning_feed","lunch_feed","night_feed","supplements"]
  },
  finance: {
    table: "finance_entries", title: "Finance", icon: DollarSign,
    fields: [
      ["entry_date", "Date", "date"], ["horse_name", "Horse", "horseName"],
      ["entry_type", "Type", "select", ["Income","Expense"]], ["category", "Category", "text"],
      ["amount", "Amount", "number"], ["paid", "Paid", "select", ["Yes","No"]], ["notes", "Notes", "textarea"]
    ],
    display: ["entry_date","horse_name","entry_type","category","amount","paid","notes"]
  },
  owners: {
    table: "owners", title: "Owners", icon: Users,
    fields: [
      ["name", "Owner Name", "text"], ["email", "Email", "email"], ["phone", "Phone", "text"],
      ["role", "Role", "select", ["owner","staff","trainer","admin"]], ["notes", "Notes", "textarea"]
    ],
    display: ["email","phone","role","notes"]
  },
  inventory: {
    table: "inventory", title: "Inventory", icon: Package,
    fields: [
      ["item_name", "Item", "text"], ["category", "Category", "text"], ["quantity", "Quantity", "number"],
      ["supplier", "Supplier", "text"], ["reorder_level", "Reorder Level", "number"], ["notes", "Notes", "textarea"]
    ],
    display: ["category","quantity","supplier","reorder_level","notes"]
  },
  staff: {
    table: "staff", title: "Staff", icon: ShieldCheck,
    fields: [
      ["full_name", "Name", "text"], ["role", "Role", "text"], ["phone", "Phone", "text"],
      ["email", "Email", "email"], ["notes", "Notes", "textarea"]
    ],
    display: ["role","phone","email","notes"]
  }
};

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stable, setStable] = useState(null);
  const [view, setView] = useState("landing");
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setView("app");
      else setView("landing");
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
      setToast("Login works, but this user is not linked to a stable profile yet.");
      return;
    }
    setProfile(data);
    setStable(data.stables);
  }

  if (loading) return <div className="center">Loading...</div>;
  if (!session && view === "login") return <Login onBack={() => setView("landing")} />;
  if (!session && view === "invite") return <InviteSignup onBack={() => setView("landing")} setToast={setToast} />;
  if (!session) return <Landing onLogin={() => setView("login")} onInvite={() => setView("invite")} />;

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
        <NavButton active={tab==="dashboard"} onClick={() => setTab("dashboard")} icon={Home} label="Home"/>
        {Object.entries(modules).map(([key, mod]) => <NavButton key={key} active={tab===key} onClick={() => setTab(key)} icon={mod.icon} label={mod.title}/>)}
        <NavButton active={tab==="invoices"} onClick={() => setTab("invoices")} icon={FileText} label="Invoices"/>
      </nav>
      {tab === "dashboard" && <Dashboard stableId={profile?.stable_id} setTab={setTab}/>}
      {tab === "work" && <Work stableId={profile?.stable_id} setToast={setToast}/>}
      {tab !== "dashboard" && tab !== "work" && modules[tab] && <GenericTable stableId={profile?.stable_id} config={modules[tab]} setToast={setToast}/>}
      {tab === "invoices" && <Invoices stableId={profile?.stable_id} setToast={setToast}/>}
    </div>
  );
}

function Landing({ onLogin, onInvite }) {
  return (
    <main className="landing">
      <PhotoReel />
      <header className="landing-nav">
        <strong>The Trotting Stable App</strong>
        <div>
          <button className="ghost dark" onClick={onLogin}>Log In</button>
          <button className="primary light" onClick={onInvite}>Join With Invite Code</button>
        </div>
      </header>
      <section className="hero">
        <p className="eyebrow">Built for harness racing stables</p>
        <h1>Run the stable, owners, work, invoices and racing from one secure app.</h1>
        <p>Work logs, jogger machine tracking, warm-ups, vet notes, feed programs, owners, finance and invoices — built around how racing stables actually operate.</p>
        <div className="hero-actions">
          <button className="primary light" onClick={onInvite}>Join With Invite Code</button>
          <button className="ghost dark" onClick={onLogin}>Stable Login</button>
        </div>
      </section>
      <section className="feature-grid">
        {[
          ["Work History", "Single-horse work isolator, warm-ups and jogger machine records."],
          ["Owner Communication", "Owner records, updates and invoice-ready contact details."],
          ["Invoices", "Create, edit, print and share invoices."],
          ["Vet & Feed", "Treatment history, feed sheets and follow-up dates."],
          ["Racing", "Targets, nominations, results and race planning."],
          ["Secure by Stable", "Login-based access and stable-separated data."]
        ].map(([title, text]) => (
          <article className="feature-card" key={title}><h3>{title}</h3><p>{text}</p></article>
        ))}
      </section>
    </main>
  );
}

function PhotoReel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % photoPaths.length), 4500);
    return () => clearInterval(timer);
  }, []);
  return <div className="photo-reel" style={{ backgroundImage: `url(${photoPaths[index]})` }} />;
}

function Login({ onBack }) {
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
    <main className="login-screen">
      <PhotoReel />
      <section className="login-card">
        <button className="text" onClick={onBack}>← Back</button>
        <h1>Stable Login</h1>
        <p>Invite-only access for trainers, staff and owners.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <button className="primary full">Login</button>
        </form>
        {message && <p className="error">{message}</p>}
      </section>
    </main>
  );
}

function InviteSignup({ onBack, setToast }) {
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();

    const { data: invite, error: inviteError } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code.trim())
      .is("used_by", null)
      .single();

    if (inviteError || !invite) {
      setToast("Invalid or already-used invite code.");
      return;
    }

    const { data: signup, error: signupError } = await supabase.auth.signUp({ email, password });
    if (signupError) {
      setToast(signupError.message);
      return;
    }

    const userId = signup.user?.id;
    if (!userId) {
      setToast("Account created. Check your email if confirmation is enabled.");
      return;
    }

    await supabase.from("profiles").insert({
      id: userId,
      stable_id: invite.stable_id,
      role: invite.role,
      full_name: fullName
    });

    await supabase.from("invite_codes").update({
      used_by: userId,
      used_at: new Date().toISOString()
    }).eq("id", invite.id);

    setToast("Account created. You can log in now.");
    onBack();
  }

  return (
    <main className="login-screen">
      <PhotoReel />
      <section className="login-card">
        <button className="text" onClick={onBack}>← Back</button>
        <h1>Join With Invite Code</h1>
        <p>Only invited stables, staff and owners can create accounts.</p>
        <form onSubmit={submit}>
          <label>Invite Code<input value={code} onChange={e => setCode(e.target.value)} /></label>
          <label>Full Name<input value={fullName} onChange={e => setFullName(e.target.value)} /></label>
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <button className="primary full">Create Account</button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ stableId, setTab }) {
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
      count("horses"), count("work_entries"), count("invoices"), count("finance_entries")
    ]);
    setCounts({ horses, work, invoices, finance });
  }

  return (
    <main className="page">
      <section className="stats">
        <Stat icon={BadgeCheck} label="Horses" value={counts.horses}/>
        <Stat icon={ClipboardList} label="Work Entries" value={counts.work}/>
        <Stat icon={FileText} label="Invoices" value={counts.invoices}/>
        <Stat icon={DollarSign} label="Finance" value={counts.finance}/>
      </section>
      <section className="quick-grid">
        {[
          ["Horses","horses"], ["Work","work"], ["Invoices","invoices"],
          ["Vet","treatments"], ["Feed","feed"], ["Racing","racing"],
          ["Owners","owners"], ["Inventory","inventory"], ["Staff","staff"]
        ].map(([label, key]) => <button key={key} className="quick" onClick={() => setTab(key)}>{label}</button>)}
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
      <WorkHistory stableId={stableId} horses={horses} selected={selected} setSelected={setSelected}/>
      <GenericTable stableId={stableId} config={modules.work} setToast={setToast} embedded/>
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

function GenericTable({ stableId, config, setToast, embedded = false }) {
  const [rows, setRows] = useState([]);
  const [horses, setHorses] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!stableId) return;
    load();
    supabase.from("horses").select("name").eq("stable_id", stableId).then(({ data }) => setHorses(data || []));
  }, [stableId, config.table]);

  async function load() {
    const { data, error } = await supabase.from(config.table).select("*").eq("stable_id", stableId).order("created_at", { ascending: false });
    if (error) setToast(error.message);
    setRows(data || []);
  }

  function blank() {
    const rec = {};
    config.fields.forEach(([key, _label, type, options]) => {
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
    config.fields.forEach(([key, _label, type]) => {
      if (type === "number") clean[key] = clean[key] === "" ? 0 : Number(clean[key]);
    });
    const result = mode === "edit"
      ? await supabase.from(config.table).update(clean).eq("id", clean.id).eq("stable_id", stableId)
      : await supabase.from(config.table).insert(clean);
    if (result.error) setToast(result.error.message);
    else {
      setToast("Saved.");
      setModal(null);
      load();
    }
  }

  async function remove(id) {
    const { error } = await supabase.from(config.table).delete().eq("id", id).eq("stable_id", stableId);
    if (error) setToast(error.message);
    else load();
  }

  const filtered = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const Icon = config.icon;

  const content = (
    <>
      <section className="module-header">
        <div className="module-icon"><Icon size={24}/></div>
        <div><h2>{config.title}</h2><p>Cloud saved and stable-secured.</p></div>
      </section>
      <section className="toolbar">
        <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`}/></div>
        <button className="primary" onClick={() => setModal({ mode: "add", record: blank() })}><Plus size={18}/>Add</button>
      </section>
      <section className="grid">
        {filtered.map(row => (
          <article className="record" key={row.id}>
            <div className="record-head">
              <div><h3>{row.name || row.horse_name || row.item_name || row.full_name || row.entry_date || row.date || "Record"}</h3><p>{row.status || row.work_type || row.category || row.role || ""}</p></div>
              <div className="button-row">
                <button className="edit" onClick={() => setModal({ mode: "edit", record: { ...row } })}><Edit3 size={16}/></button>
                <button className="delete" onClick={() => remove(row.id)}><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="details">
              {config.display.map(k => <div key={k}><span>{labelize(k)}</span><strong>{formatValue(row[k])}</strong></div>)}
            </div>
          </article>
        ))}
      </section>
      {modal && <RecordModal fields={config.fields} title={`${modal.mode === "edit" ? "Edit" : "Add"} ${config.title}`} record={modal.record} horses={horses} onClose={() => setModal(null)} onSave={rec => save(rec, modal.mode)}/>}
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
      client_name: "", client_email: "", client_phone: "",
      horse_name: horses[0]?.name || "",
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "Draft", notes: "",
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
      {modal && <InvoiceModal modal={modal} horses={horses} onClose={() => setModal(null)} onSave={save}/>}
      {printInvoice && <InvoicePrint invoice={printInvoice} onClose={() => setPrintInvoice(null)}/>}
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
              <Input type={type} options={options} value={form[key] ?? ""} horses={horses} onChange={v => setForm(cur => ({ ...cur, [key]: v }))}/>
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

  function setField(key, value) { setInvoice(cur => ({ ...cur, [key]: value })); }
  function setLine(id, key, value) { setInvoice(cur => ({ ...cur, line_items: (cur.line_items || []).map(li => li.id === id ? { ...li, [key]: value } : li) })); }
  function addLine() { setInvoice(cur => ({ ...cur, line_items: [...(cur.line_items || []), { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }] })); }
  function removeLine(id) { setInvoice(cur => ({ ...cur, line_items: (cur.line_items || []).filter(li => li.id !== id) })); }

  return (
    <div className="modal-backdrop">
      <section className="modal invoice-modal">
        <div className="modal-head"><h2>{modal.mode === "edit" ? "Edit" : "Create"} Invoice</h2><button onClick={onClose}><X size={20}/></button></div>
        <div className="form-grid">
          <Field label="Invoice Number"><input value={invoice.invoice_number || ""} onChange={e => setField("invoice_number", e.target.value)}/></Field>
          <Field label="Client Name"><input value={invoice.client_name || ""} onChange={e => setField("client_name", e.target.value)}/></Field>
          <Field label="Client Email"><input value={invoice.client_email || ""} onChange={e => setField("client_email", e.target.value)}/></Field>
          <Field label="Client Phone"><input value={invoice.client_phone || ""} onChange={e => setField("client_phone", e.target.value)}/></Field>
          <Field label="Horse"><select value={invoice.horse_name || ""} onChange={e => setField("horse_name", e.target.value)}>{horses.map(h => <option key={h.name}>{h.name}</option>)}</select></Field>
          <Field label="Due Date"><input type="date" value={invoice.due_date || ""} onChange={e => setField("due_date", e.target.value)}/></Field>
          <Field label="Status"><select value={invoice.status || "Draft"} onChange={e => setField("status", e.target.value)}><option>Draft</option><option>Sent</option><option>Part Paid</option><option>Paid</option><option>Overdue</option></select></Field>
          <Field label="Notes"><textarea value={invoice.notes || ""} onChange={e => setField("notes", e.target.value)}/></Field>
        </div>
        <section className="invoice-lines">
          <div className="section-title"><h3>Line Items</h3><button className="text" onClick={addLine}>+ Add Line</button></div>
          {(invoice.line_items || []).map(li => (
            <div className="line-item" key={li.id}>
              <input placeholder="Description" value={li.description || ""} onChange={e => setLine(li.id, "description", e.target.value)}/>
              <input type="number" placeholder="Qty" value={li.quantity || 0} onChange={e => setLine(li.id, "quantity", e.target.value)}/>
              <input type="number" placeholder="Unit $" value={li.unit_price || 0} onChange={e => setLine(li.id, "unit_price", e.target.value)}/>
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
      </main>
    </div>
  );
}

function Input({ type, options, value, horses, onChange }) {
  if (type === "textarea") return <textarea value={value} onChange={e => onChange(e.target.value)}/>;
  if (type === "select") return <select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select>;
  if (type === "horseName") return <select value={value} onChange={e => onChange(e.target.value)}>{horses.map(h => <option key={h.name}>{h.name}</option>)}</select>;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)}/>;
}

function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function NavButton({ active, onClick, icon: Icon, label }) { return <button className={active ? "active" : ""} onClick={onClick}><Icon size={15}/>{label}</button>; }
function Stat({ icon: Icon, label, value }) { return <section className="stat"><div><Icon size={22}/></div><p>{label}</p><strong>{value}</strong></section>; }
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
function labelize(value) { return value.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase()); }
function formatValue(value) { if (value === null || value === undefined || value === "") return "-"; return String(value); }

createRoot(document.getElementById("root")).render(<App />);
