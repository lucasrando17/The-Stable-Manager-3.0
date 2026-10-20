// COMPLETE FINAL REBUILD V13

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck, BarChart3, Calendar, ChevronRight, ClipboardList, CreditCard,
  DollarSign, Edit3, FileText, HeartPulse, Home, LogOut, Mail, Megaphone,
  Package, Plus, Printer, Search, Settings, Share2, ShieldCheck, Trash2, Trophy,
  Users, Wheat, X, ArrowRight, Clock3, Building2, UserRoundCheck, KeyRound, Info, CheckCircle2
} from "lucide-react";
import "../styles.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const GST_RATE = 0.1;
const photos = Array.from({ length: 8 }, (_, i) => `/login-photos/photo-${i + 1}.jpg`);

const WORK_SECTORS = ["Jog - Cart", "Jog- Lead", "Jog- Jogger Machine", "Jog/Canter", "Gallop", "Trot", "Hopple", "Walking Machine", "Water Walk", "Race", "Trial", "Educational Trial", "Swim", "Beach Work", "Recovery"];
const WARMUP_SECTORS = ["Jog/Canter", "Gallop", "Trot", "Hopple"];

const stableRoles = ["admin", "trainer", "staff"];
const financeRoles = ["admin", "trainer"];

// Custom stable icons — match the existing Lucide outline style.
function HorseIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 21v-5l2-4 1-5 4-4 2 4 4 1 2 5-2 3-4-1-2-2-2 4v4" />
      <path d="M8 7 7 3l5 1M14 11h.01M5 17h5" />
    </svg>
  );
}

function HorseshoeIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 5v8a7 7 0 0 0 14 0V5h-5v8a2 2 0 0 1-4 0V5Z" />
      <path d="M5 8h5M14 8h5M5 12h5M14 12h5" />
    </svg>
  );
}

function BridleIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3c-2 3-3 7-3 11v5M17 3c2 3 3 7 3 11v5" />
      <path d="M7 3c3 2 7 2 10 0M5 9c4 3 10 3 14 0" />
      <path d="M4 15h16M8 15v4c0 2 8 2 8 0v-4" />
      <circle cx="5" cy="15" r="1.5" />
      <circle cx="19" cy="15" r="1.5" />
    </svg>
  );
}

const moduleDefs = {
  horses: {
    table: "horses", title: "Horses", icon: HorseIcon, profile: "horse",
    fields: [["name","Registered Name","text"],["stable_name","Stable Name","text"],["profile_photo_url","Profile Photo URL","text"],["sire","Sire","text"],["mare","Mare","text"],["age","Age","number"],["sex","Sex","select",["Gelding","Mare","Horse","Colt","Filly"]],["trainer","Trainer","text"],["status","Status","select",["Racing","Building","Trialling","Spelling","Rehab","Sold","Retired"]],["current_status","Current Status","text"],["next_target","Next Target","text"],["notes","Notes","textarea"]],
    display: ["stable_name","sire","mare","age","sex","trainer","status","current_status","next_target"]
  },
  owners: {
    table: "owners", title: "Owners", icon: Users, profile: "owner",
    fields: [["name","Owner Name","text"],["email","Email","email"],["phone","Phone","text"],["role","Role","select",["owner","staff","trainer","admin"]],["notes","Notes","textarea"]],
    display: ["email","phone","role","notes"]
  },
  work: {
    table: "work_entries", title: "Work", icon: ClipboardList, calendarField: "date",
    fields: [["date","Date","date"],["horse_name","Horse","horseName"],["sector","Work Sector","select",WORK_SECTORS],["warmup","Warm Up Options / Details","conditionalWarmup"],["distance","Distance","text"],["overall_time","Overall Time","text"],["mile_rate","Mile Rate","text"],["last_half","Last Half","text"],["last_quarter","Last Quarter","text"],["driver","Driver","text"],["recovery","Recovery/Heart Rate","text"],["notes","Notes","textarea"]],
    display: ["date","horse_name","sector","warmup","distance","overall_time","mile_rate","last_half","last_quarter","driver","recovery"]
  },
  racing: {
    table: "race_records", title: "Racing", icon: Trophy, calendarField: "date",
    fields: [["date","Date","date"],["horse_name","Horse","horseName"],["track","Track","text"],["race","Race/Class","text"],["race_time","Race Time","text"],["barrier","Barrier","text"],["distance","Distance","text"],["status","Status","select",["Nominated","Accepted","Target","Scratched","Completed"]],["driver","Driver","text"],["result","Result","text"],["prizemoney","Prizemoney","number"],["replay_url","Replay URL","text"],["comments","Comments","textarea"],["notes","Notes","textarea"]],
    display: ["date","horse_name","track","race","race_time","barrier","status","driver","result","prizemoney"]
  },
  treatments: {
    table: "treatments", title: "Vet", icon: HeartPulse, calendarField: "treatment_date",
    fields: [["treatment_date","Date","date"],["horse_name","Horse","horseName"],["treatment_type","Treatment","text"],["veterinarian","Vet","text"],["bill_amount","Bill Amount","number"],["bill_to_owners","Add to owner invoices?","select",["No","Yes"]],["follow_up_date","Follow Up","date"],["notes","Notes","textarea"]],
    display: ["treatment_date","horse_name","treatment_type","veterinarian","bill_amount","bill_to_owners","follow_up_date"]
  },
  farrier: {
    table: "farrier_records", title: "Farrier", icon: HorseshoeIcon, calendarField: "farrier_date",
    fields: [["farrier_date","Date","date"],["horse_name","Horse","horseName"],["farrier_name","Farrier","text"],["service_type","Service","select",["Full Set","Fronts","Hinds","Trim","Reset","Bar Shoes","Pads","Glue Ons","Other"]],["shoeing_notes","Shoeing Notes","textarea"],["bill_amount","Bill Amount","number"],["bill_to_owners","Add to owner invoices?","select",["No","Yes"]],["next_due_date","Next Due Date","date"],["notes","Notes","textarea"]],
    display: ["farrier_date","horse_name","farrier_name","service_type","bill_amount","bill_to_owners","next_due_date"]
  },
  feed: {
    table: "feed_programs", title: "Feed", icon: Wheat,
    fields: [["horse_name","Horse","horseName"],["morning_feed","Morning Feed","textarea"],["lunch_feed","Lunch Feed","textarea"],["night_feed","Night Feed","textarea"],["supplements","Supplements","textarea"],["notes","Notes","textarea"]],
    display: ["horse_name","morning_feed","lunch_feed","night_feed","supplements"]
  },
  gear: {
    table: "gear_items", title: "Gear", icon: BridleIcon,
    fields: [["item_name","Item","text"],["horse_name","Horse","horseName"],["category","Category","select",["Hopples","Bridle","Bit","Boots","Harness","Sulky","Driving Gear","Rug","Other"]],["size","Size","text"],["colour","Colour","text"],["condition","Condition","select",["Excellent","Good","Fair","Needs Repair","Retired"]],["location","Location","text"],["assigned_to","Assigned To","text"],["notes","Notes","textarea"]],
    display: ["horse_name","category","size","colour","condition","location","assigned_to"]
  },
  finance: {
    table: "finance_entries", title: "Finance", icon: DollarSign, calendarField: "entry_date",
    fields: [["entry_date","Date","date"],["horse_name","Horse","horseName"],["entry_type","Type","select",["Income","Expense"]],["category","Category","text"],["amount","Amount","number"],["paid","Paid","select",["Yes","No"]],["bill_to_owners","Add expense to owner invoices?","select",["No","Yes"]],["notes","Notes","textarea"]],
    display: ["entry_date","horse_name","entry_type","category","amount","paid","bill_to_owners"]
  },
  inventory: {
    table: "inventory", title: "Inventory", icon: Package,
    fields: [["item_name","Item","text"],["category","Category","text"],["quantity","Quantity","number"],["supplier","Supplier","text"],["reorder_level","Reorder Level","number"],["notes","Notes","textarea"]],
    display: ["category","quantity","supplier","reorder_level"]
  },
  staff: {
    table: "staff", title: "Staff", icon: ShieldCheck,
    fields: [["full_name","Name","text"],["role","Role","text"],["phone","Phone","text"],["email","Email","email"],["notes","Notes","textarea"]],
    display: ["role","phone","email","notes"]
  }
};

const ADMIN_UI_CSS = '\n/* Super administrator workspace and searchable stable selector */\n.stable-switcher{position:relative;min-width:220px;max-width:min(340px,90vw);z-index:100}\n.stable-switcher-label{display:block;font-size:10px;font-weight:800;letter-spacing:.12em;opacity:.7;margin-bottom:5px}\n.stable-switcher-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(150,160,185,.4);border-radius:12px;padding:8px 11px;background:rgba(255,255,255,.1);color:inherit;cursor:pointer;transition:background .18s,border-color .18s,box-shadow .18s}\n.stable-switcher-trigger:hover,.stable-switcher-trigger:focus-visible{background:rgba(255,255,255,.18);border-color:rgba(150,160,185,.85);outline:none;box-shadow:0 0 0 3px rgba(100,130,200,.12)}\n.stable-switcher-selected{display:flex;align-items:center;gap:10px;min-width:0;text-align:left;font-weight:650}\n.stable-switcher-selected>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.stable-switcher-avatar{display:grid;place-items:center;flex-shrink:0;width:30px;height:30px;border-radius:9px;background:rgba(135,155,205,.2)}\n.stable-switcher-chevron{transform:rotate(90deg);transition:transform .2s;flex-shrink:0}.stable-switcher-chevron.open{transform:rotate(-90deg)}\n.stable-switcher-menu{position:absolute;right:0;top:calc(100% + 8px);width:max(100%,285px);max-width:calc(100vw - 32px);border:1px solid #dbe3ef;border-radius:15px;background:#fff;color:#0b1026;box-shadow:0 18px 50px rgba(6,16,40,.2);overflow:hidden;animation:stable-menu-in .16s ease-out}\n@keyframes stable-menu-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}\n.stable-switcher-search{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid #e7eaf0;color:#64748b}\n.stable-switcher-search input{width:100%;border:0;outline:0;background:transparent;color:#0b1026;font:inherit;box-shadow:none;padding:4px}\n.stable-switcher-options{max-height:300px;overflow:auto;padding:6px}\n.stable-switcher-options button{width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left;gap:12px;border:0;border-radius:9px;padding:11px 12px;background:transparent;color:#18223b;cursor:pointer;font:inherit;transition:background .15s}\n.stable-switcher-options button:hover{background:#f1f5fb}.stable-switcher-options button.selected{background:#eaf0ff;color:#173c83;font-weight:750}\n.site-admin-page{max-width:1300px;margin-inline:auto}.site-admin-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 24px;padding:5px;border:1px solid #dbe3ef;border-radius:14px;background:#f3f6fb;width:fit-content}\n.site-admin-tabs button{display:flex;align-items:center;gap:9px;padding:11px 17px;border:0;border-radius:10px;background:transparent;color:#4a556d;font:inherit;font-weight:650;cursor:pointer;transition:background .18s,box-shadow .18s,color .18s}\n.site-admin-tabs button:hover{background:#e8eef8}.site-admin-tabs button.active{background:white;color:#0b1026;box-shadow:0 2px 8px rgba(15,23,42,.1)}\n.site-admin-content{animation:stable-menu-in .2s ease-out}.site-admin-content>.settings-card{margin-bottom:20px}\n@media(max-width:640px){.stable-switcher{width:100%;max-width:100%}.stable-switcher-menu{left:0;right:auto;width:100%}.site-admin-tabs{width:100%}.site-admin-tabs button{flex:1;justify-content:center;font-size:13px}}\n';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stable, setStable] = useState(null);
  const [entry, setEntry] = useState("landing");
  const [loginMode, setLoginMode] = useState("stable");
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const [profileRefresh, setProfileRefresh] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [allStables, setAllStables] = useState([]);
  const [selectedStableId, setSelectedStableId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setEntry("app");
      if (_event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadProfile();
  }, [session?.user?.id, profileRefresh]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadProfile() {
    const pendingCode = session.user.user_metadata?.stable_invite_code;
    if (pendingCode && session.user.email_confirmed_at) {
      const { error: redemptionError } = await supabase.rpc("redeem_stable_invite");
      if (redemptionError) {
        setInviteStatus(redemptionError.message);
        console.error("Invitation redemption failed:", redemptionError);
      } else {
        setInviteStatus("");
      }
    }
    const [profileResult, adminResult] = await Promise.all([
      supabase.from("profiles").select("*, stables(*)").eq("id", session.user.id).maybeSingle(),
      supabase.from("website_admins").select("user_id").eq("user_id", session.user.id).maybeSingle()
    ]);
    const { data, error } = profileResult;
    const superAdmin = !adminResult.error && !!adminResult.data;
    setIsSuperAdmin(superAdmin);
    if (superAdmin) {
      const { data: stableRows, error: stableError } = await supabase.from("stables").select("*").order("name");
      if (stableError) setToast(`Unable to load stables: ${stableError.message}`);
      setAllStables(stableRows || []);
      setSelectedStableId(current => current && (stableRows || []).some(st => st.id === current)
        ? current : data?.stable_id || stableRows?.[0]?.id || "");
    } else {
      setAllStables([]);
      setSelectedStableId("");
    }

    if (error) {
      setToast("Login works, but profile setup needs to be completed.");
      setProfile({ id: session.user.id, email: session.user.email, role: "admin", stable_id: null, stables: null });
      setStable(null);
      return;
    }

    if (!data) {
      setProfile({ id: session.user.id, email: session.user.email, role: "admin", stable_id: null, stables: null });
      setStable(null);
      return;
    }

    setProfile(data);
    setStable(data.stables);
    setTab(data.role === "owner" || loginMode === "owner" ? "ownerHome" : "dashboard");
  }

  if (loading) return <div className="center">Loading...</div>;
  if (session && passwordRecovery) return <PasswordResetForm onDone={() => setPasswordRecovery(false)} setToast={setToast} />;
  if (!session && entry === "stableLogin") return <Login mode="stable" onBack={() => setEntry("landing")} setLoginMode={setLoginMode} />;
  if (!session && entry === "ownerLogin") return <Login mode="owner" onBack={() => setEntry("landing")} setLoginMode={setLoginMode} />;
  if (!session && entry === "invite") return <InviteSignup onBack={() => setEntry("landing")} setToast={setToast} />;
  if (!session && entry === "apply") return <StableApplicationSignup onBack={() => setEntry("landing")} />;
  if (!session) return <Landing setEntry={setEntry} />;

  if (!profile) {
    return <main className="page"><section className="card"><h2>Loading profile...</h2><p>Please wait while your account is checked.</p></section></main>;
  }

  if (!profile.stable_id && !isSuperAdmin && inviteStatus) {
    return <main className="page"><section className="card"><h2>Invitation needs attention</h2><p>{inviteStatus}</p><p>Please contact your stable administrator for a new invitation if necessary.</p><button className="ghost" onClick={() => supabase.auth.signOut()}>Log out</button></section></main>;
  }

  if (!profile.stable_id && !isSuperAdmin) {
    return profile.membership_removed
      ? <MembershipEnded session={session} refreshProfile={() => setProfileRefresh(n => n + 1)} />
      : <StableApplicationOnboarding session={session} refreshProfile={() => setProfileRefresh(n => n + 1)} />;
  }

  if (profile.stable_id && profile.role === "staff" && !profile.phone?.trim()) {
    return <StaffPhoneOnboarding profile={profile} onSaved={phone => setProfile(current => ({ ...current, phone }))} />;
  }

  const activeStableId = isSuperAdmin ? selectedStableId : profile.stable_id;
  const activeStable = isSuperAdmin ? allStables.find(item => item.id === activeStableId) || null : stable;
  const activeProfile = isSuperAdmin
    ? { ...profile, stable_id: activeStableId, role: "admin", is_trainer: true, stables: activeStable }
    : profile;

  return <div className="app">
    {isSuperAdmin && <style>{ADMIN_UI_CSS}</style>}
    {toast && <div className="toast">{toast}</div>}
    <header className="topbar">
      <div>
        <p>{isSuperAdmin ? "Super Administrator" : profile.role === "owner" ? "Owners Portal" : "Stable App"}</p>
        <h1>{!isSuperAdmin && profile.role === "owner" ? profile.owner_name || profile.full_name : activeStable?.name || "Select a stable"}</h1>
      </div>
      {isSuperAdmin && <StableSwitcher
        stables={allStables}
        selectedId={selectedStableId}
        onSelect={id => { if (id !== selectedStableId) { setSelectedStableId(id); if (tab !== "siteAdmin") setTab("dashboard"); } }}
      />}
      <button className="ghost" onClick={() => supabase.auth.signOut()}><LogOut size={18}/>Logout</button>
    </header>
    {!isSuperAdmin && (profile.role === "owner" || loginMode === "owner")
      ? <OwnerApp profile={profile} tab={tab} setTab={setTab} setToast={setToast} stable={stable} setStable={setStable} setProfile={setProfile} />
      : isSuperAdmin && tab === "siteAdmin" ? <><nav className="nav"><NavButton active={false} onClick={() => setTab("dashboard")} icon={Home} label="Stable Dashboard" /><NavButton active={true} onClick={() => setTab("siteAdmin")} icon={ShieldCheck} label="Site Administration" /></nav><SiteAdministration setToast={setToast} onStableDeleted={async deletedId => { const { data, error } = await supabase.from("stables").select("*").order("name"); if (error) { setToast(`Unable to refresh stable list: ${error.message}`); return; } const rows = data || []; setAllStables(rows); setSelectedStableId(current => current === deletedId || !rows.some(st => st.id === current) ? (rows[0]?.id || "") : current); }} /></>
      : activeStableId ? <StableApp key={activeStableId} profile={activeProfile} isSuperAdmin={isSuperAdmin} tab={tab} setTab={setTab} setToast={setToast} stable={activeStable} setStable={setStable} setProfile={setProfile} />
      : isSuperAdmin ? <><nav className="nav"><NavButton active={false} onClick={() => setTab("dashboard")} icon={Home} label="Stable Dashboard"/><NavButton active={false} onClick={() => setTab("siteAdmin")} icon={ShieldCheck} label="Site Administration"/></nav><main className="page"><section className="card">No stables are available. Open Site Administration to manage applications or the website.</section></main></> : <main className="page"><section className="card">No stables are available to manage.</section></main>}
  </div>;
}



function StaffPhoneOnboarding({ profile, onSaved }) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    const cleaned = phone.trim();
    if (!/^[+()\d\s-]{8,22}$/.test(cleaned) || cleaned.replace(/\D/g, "").length < 8) {
      setError("Please enter a valid phone number, including area or country code where needed.");
      return;
    }
    setBusy(true); setError("");
    const { error: updateError } = await supabase.rpc("set_my_staff_phone", { p_phone: cleaned });
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    onSaved(cleaned);
  }
  return <main className="onboarding-screen"><PhotoReel />
    <section className="onboarding-card" style={{ maxWidth: 560 }}>
      <p className="eyebrow">THE TROTTING STABLE APP · TEAM SETUP</p>
      <div style={{ display: "inline-flex", padding: 13, borderRadius: 15, background: "#edf2ff", color: "#1e3a8a", marginBottom: 12 }}><Users size={28}/></div>
      <h1>One last thing before you get started.</h1>
      <p>Welcome to your stable team{profile.full_name ? `, ${profile.full_name}` : ""}. Add your phone number so your trainer and fellow team managers can contact you when needed.</p>
      <form onSubmit={submit} className="form-grid">
        <label className="field"><span>Mobile or contact number</span>
          <input type="tel" autoComplete="tel" inputMode="tel" required placeholder="e.g. 0412 345 678" value={phone} onChange={event => setPhone(event.target.value)} />
        </label>
        <p style={{ fontSize: 13, opacity: .7, margin: 0 }}>Your number will appear in the Staff directory for your stable's authorised managers.</p>
        {error && <p role="alert" className="login-message">{error}</p>}
        <button className="primary full" disabled={busy}>{busy ? "Saving..." : "Save & Enter Stable"}</button>
      </form>
      <button className="text onboarding-logout" onClick={() => supabase.auth.signOut()}>Log out</button>
    </section>
  </main>;
}

function StaffDirectory({ stableId, setToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.rpc("get_staff_directory", { p_stable_id: stableId }).then(({ data, error }) => {
      if (!active) return;
      setLoading(false);
      if (error) setToast(`Unable to load staff directory: ${error.message}`);
      else setMembers(data || []);
    });
    return () => { active = false; };
  }, [stableId]);
  return <section className="settings-card" style={{ marginBottom: 20 }}>
    <h3>Registered staff members</h3>
    <p>Automatically populated when invited staff join your stable. Phone numbers are collected on their first login. Removing a member from the stable also removes them from this directory.</p>
    {loading ? <p>Loading staff...</p> : !members.length ? <p>No registered staff members yet.</p> :
      <div style={{ display: "grid", gap: 10 }}>
        {members.map(member => <div key={member.user_id} style={{ padding: 14, border: "1px solid #dbe3ef", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><strong>{member.full_name || "Unnamed staff member"}</strong><div className="muted">Staff · Registered account</div></div>
          <div style={{ textAlign: "right" }}>{member.phone ? <a href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}>{member.phone}</a> : <span className="muted">Phone not yet provided</span>}</div>
        </div>)}
      </div>}
  </section>;
}

// Supabase may deliberately conceal whether an email exists to prevent account enumeration.
// Only show a definite duplicate warning when Auth explicitly reports one.
function signupAlreadyRegistered(data, error) {
  if (error) return /already registered|already exists|user already registered|email address is already/i.test(error.message || "");
  return Array.isArray(data?.user?.identities) && data.user.identities.length === 0;
}

function ExistingAccountNotice({ onBack }) {
  return <div role="alert" style={{marginTop:16,padding:16,borderRadius:12,background:"#eef2ff",color:"#0b1026",lineHeight:1.55}}>
    <strong>An account is already registered with this email address.</strong>
    <p style={{margin:"8px 0 12px"}}>Please log in using your existing account instead of creating another one. You can use Forgot password on the login page if needed.</p>
    <button type="button" className="ghost" onClick={onBack}>Go to login options</button>
  </div>;
}

function StableApplicationSignup({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  async function submit(event) {
    setAlreadyRegistered(false);
    event.preventDefault();
    if (password.length < 8 || password !== confirm) {
      setMessage("Use a password of at least 8 characters and make sure both passwords match.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: window.location.origin, data: { stable_application_signup: true } }
    });
    setBusy(false);
    if (signupAlreadyRegistered(data, error)) {
      setAlreadyRegistered(true);
      setMessage("");
    } else {
      setMessage(error ? error.message : "If this email is eligible for registration, check your inbox for confirmation instructions. Already registered? Use Stable Login instead.");
    }
  }
  return <main className="login-screen"><PhotoReel /><section className="login-card">
    <button className="text" onClick={onBack}>← Back</button>
    <h1>Apply for a Stable</h1><p>Create your account first. Your stable will not be activated until your application is approved.</p>
    <form onSubmit={submit}>
      <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <label>Confirm Password<input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
      <button className="primary full" disabled={busy}>{busy ? "Creating account..." : "Create Account"}</button>
    </form>{alreadyRegistered && <ExistingAccountNotice onBack={onBack} />}{message && <p role="status" className="login-message">{message}</p>}
  </section></main>;
}

// Standalone onboarding styles avoid changing the rest of the application.
const onboard = {
  shell: {position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"44px 16px",isolation:"isolate",fontFamily:"inherit"},
  overlay: {position:"absolute",inset:0,background:"linear-gradient(115deg,rgba(8,15,37,.94),rgba(8,15,37,.66))",zIndex:0},
  card: {position:"relative",zIndex:1,width:"100%",maxWidth:750,background:"#fff",borderRadius:22,boxShadow:"0 28px 90px rgba(0,0,0,.30)",overflow:"hidden",color:"#111b32"},
  header: {background:"#0b1026",color:"#fff",padding:"26px 34px"},
  content: {padding:"30px 34px 34px"},
  eyebrow: {fontSize:11,letterSpacing:"2px",fontWeight:800,textTransform:"uppercase",color:"#7e8aa4",margin:"0 0 12px"},
  title: {fontSize:"clamp(27px, 5vw, 39px)",letterSpacing:"-1.2px",lineHeight:1.12,margin:"0 0 14px",fontWeight:800},
  subtitle: {color:"#53617a",lineHeight:1.7,margin:"0 0 24px"},
  panel: {background:"#f5f7fb",border:"1px solid #e4e9f2",borderRadius:15,padding:"20px",marginBottom:20},
  label: {display:"block",fontSize:13,fontWeight:700,color:"#34425c",marginBottom:7},
  input: {display:"block",boxSizing:"border-box",width:"100%",minHeight:46,border:"1px solid #cbd5e1",borderRadius:9,padding:"11px 13px",font:"inherit",color:"#15213a",background:"#fff"},
  button: {width:"100%",minHeight:49,background:"#0b1026",color:"#fff",border:0,borderRadius:10,fontWeight:750,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:9},
  secondary: {background:"#fff",color:"#18223b",border:"1px solid #cbd5e1",borderRadius:9,padding:"11px 16px",cursor:"pointer",fontWeight:700},
  error: {background:"#fff1f2",color:"#9f1239",border:"1px solid #fecdd3",padding:13,borderRadius:9,margin:"14px 0"}
};

function OnboardingFrame({children}) {
  return <main style={onboard.shell}>
    <PhotoReel />
    <div style={onboard.overlay} />
    <section style={onboard.card}>
      <header style={onboard.header}>
        <div style={{display:"flex",alignItems:"center",gap:11,fontWeight:800,letterSpacing:"1.6px",fontSize:12}}>
          <ShieldCheck size={23} /> THE TROTTING STABLE APP
        </div>
      </header>
      <div style={onboard.content}>{children}</div>
    </section>
  </main>;
}

function OnboardingLogout() {
  return <div style={{textAlign:"center",marginTop:20}}><button type="button" className="text" onClick={() => supabase.auth.signOut()} style={{color:"#64748b"}}>Log out of your account</button></div>;
}

function MembershipEnded({session,refreshProfile}) {
  const [code,setCode] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  async function join(event) {
    event.preventDefault();
    if (!code.trim()) {setError("Enter the invitation code provided by your stable administrator.");return;}
    setBusy(true);setError("");setSuccess("");
    // The existing redemption function reads the code from authenticated user metadata.
    const {error:metadataError} = await supabase.auth.updateUser({data:{stable_invite_code:code.trim()}});
    if (metadataError) {setError(metadataError.message);setBusy(false);return;}
    const {error:redeemError} = await supabase.rpc("redeem_stable_invite");
    if (redeemError) {setError(redeemError.message);setBusy(false);return;}
    await supabase.auth.updateUser({data:{stable_invite_code:null}});
    setSuccess("Invitation accepted. Loading your new stable...");
    setBusy(false);
    refreshProfile();
  }
  return <OnboardingFrame>
    <div style={{textAlign:"center",margin:"10px 0 28px"}}>
      <div style={{width:68,height:68,borderRadius:20,background:"#eef2ff",color:"#172554",display:"grid",placeItems:"center",margin:"0 auto 18px"}}><Users size={32}/></div>
      <p style={onboard.eyebrow}>ACCOUNT STATUS</p>
      <h1 style={onboard.title}>You're not currently part of a stable.</h1>
      <p style={{...onboard.subtitle,maxWidth:540,margin:"0 auto"}}>Your previous stable membership has ended. Your account is still active, but access to your former stable's information has been removed.</p>
    </div>
    <div style={onboard.panel}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><KeyRound size={20}/><strong>Have a new invitation?</strong></div>
      <p style={{fontSize:14,color:"#53617a",lineHeight:1.6,margin:"0 0 17px"}}>Ask your new stable's administrator or trainer for an invitation code. You can join using this same account.</p>
      <form onSubmit={join}>
        <label style={onboard.label} htmlFor="rejoin-code">Invitation code</label>
        <input id="rejoin-code" style={{...onboard.input,marginBottom:12}} value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter your invitation code" autoComplete="off" required />
        <button style={onboard.button} type="submit" disabled={busy}>{busy?"Joining stable...":"Join a stable"}<ArrowRight size={17}/></button>
      </form>
      {error && <p role="alert" style={onboard.error}>{error}</p>}
      {success && <p role="status" style={{color:"#166534"}}>{success}</p>}
    </div>
    <p style={{fontSize:13,color:"#64748b",textAlign:"center",lineHeight:1.6}}>Believe your access was removed in error? Contact your previous stable administrator.</p>
    <OnboardingLogout />
  </OnboardingFrame>;
}

function StableApplicationOnboarding({ session, refreshProfile }) {
  const [application, setApplication] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stableName, setStableName] = useState("");
  const [contactName, setContactName] = useState(session.user.user_metadata?.invited_full_name || "");
  const [message, setMessage] = useState("");
  async function load() {
    setChecking(true);
    const { data, error: queryError } = await supabase.from("stable_applications")
      .select("id,stable_name,status,created_at,review_notes")
      .eq("applicant_id", session.user.id).order("created_at", { ascending: false }).limit(1);
    if (queryError) setError(queryError.message);
    else { setError(""); setApplication(data?.[0] || null); }
    setChecking(false);
  }
  useEffect(() => { load(); }, [session.user.id]);
  async function submit(event) {
    event.preventDefault();
    if (!session.user.email_confirmed_at) { setError("Confirm your email address before applying."); return; }
    setBusy(true); setError("");
    const { error: insertError } = await supabase.from("stable_applications").insert({
      applicant_id: session.user.id, stable_name: stableName.trim(),
      contact_name: contactName.trim(), contact_email: session.user.email, message: message.trim() || null
    });
    setBusy(false);
    if (insertError) setError(insertError.message);
    else await load();
  }
  return <OnboardingFrame>
    {checking ? <div role="status" style={onboard.panel}>Checking your application...</div> : application?.status === "pending" ? <>
      <div style={{textAlign:"center",padding:"12px 0 20px"}}>
        <div style={{width:68,height:68,borderRadius:20,background:"#eef2ff",color:"#1e3a8a",display:"grid",placeItems:"center",margin:"0 auto 18px"}}><Clock3 size={33}/></div>
        <p style={onboard.eyebrow}>APPLICATION SUBMITTED</p>
        <h1 style={onboard.title}>Your application is under review.</h1>
        <p style={onboard.subtitle}>We've received your application for <strong>{application.stable_name}</strong>. Your stable will become available once a website administrator approves it.</p>
      </div>
      <div style={onboard.panel}><strong>What happens next?</strong><p style={{fontSize:14,color:"#53617a",lineHeight:1.7,marginBottom:0}}>Your application is waiting for review. Once approved, you'll be able to enter your stable, add horses and invite your team. Return here to check its status.</p></div>
      <button type="button" style={onboard.button} onClick={load}>Check application status <ArrowRight size={17}/></button>
    </> : application?.status === "approved" ? <>
      <div style={{textAlign:"center",padding:"12px 0 20px"}}><CheckCircle2 size={54} color="#15803d"/><p style={onboard.eyebrow}>APPLICATION APPROVED</p><h1 style={onboard.title}>Welcome to your stable.</h1><p style={onboard.subtitle}>Your application has been approved. You're ready to get started.</p></div>
      <button type="button" style={onboard.button} onClick={refreshProfile}>Enter your stable <ArrowRight size={17}/></button>
    </> : <>
      <p style={onboard.eyebrow}>NEW STABLE REGISTRATION</p>
      <h1 style={onboard.title}>Let's get your stable set up.</h1>
      <p style={onboard.subtitle}>Tell us about your training operation. Once approved, you'll have a dedicated workspace to manage horses, your team and owners.</p>
      {application?.status === "rejected" && <div style={onboard.error}>Your previous application was not approved.{application.review_notes ? ` Reason: ${application.review_notes}` : ""} You can submit another application.</div>}
      <div style={onboard.panel}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><Building2 size={20}/><strong>Stable details</strong></div>
        <form onSubmit={submit} style={{display:"grid",gap:17}}>
          <label><span style={onboard.label}>Stable name</span><input style={onboard.input} required minLength={2} maxLength={120} placeholder="e.g. Rando Racing" value={stableName} onChange={e=>setStableName(e.target.value)}/></label>
          <label><span style={onboard.label}>Trainer's full name</span><input style={onboard.input} required minLength={2} maxLength={120} placeholder="Your full name" value={contactName} onChange={e=>setContactName(e.target.value)}/></label>
          <label><span style={onboard.label}>Email address</span><input style={{...onboard.input,background:"#edf1f7"}} disabled value={session.user.email || ""}/></label>
          <label><span style={onboard.label}>Tell us about your stable <span style={{fontWeight:400}}>(optional)</span></span><textarea style={{...onboard.input,minHeight:95,resize:"vertical"}} placeholder="Where you're based, your training background and your operation..." value={message} onChange={e=>setMessage(e.target.value)}/></label>
          <button type="submit" style={onboard.button} disabled={busy}>{busy?"Submitting application...":"Submit stable application"}<ArrowRight size={17}/></button>
        </form>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"flex-start",color:"#53617a",fontSize:13,lineHeight:1.6}}><Info size={19} style={{flexShrink:0,marginTop:2}}/><span><strong style={{color:"#1e293b"}}>What happens next?</strong> Your application will be reviewed before a stable is created. After approval, you can add horses, invite staff and connect with owners.</span></div>
    </>}
    {error && <p role="alert" style={onboard.error}>{error}</p>}
    <OnboardingLogout />
  </OnboardingFrame>;
}

function PasswordResetForm({ onDone, setToast }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setToast?.("Password updated. You can now log in.");
    setMessage("Password updated. You can now log in.");

    setTimeout(async () => {
      await supabase.auth.signOut();
      onDone?.();
    }, 1200);
  }

  return <main className="login-screen">
    <PhotoReel />
    <section className="login-card">
      <h1>Reset Password</h1>
      <p>Create a new password for your account.</p>
      <form onSubmit={submit}>
        <label>New Password<input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label>Confirm New Password<input type={showPassword ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show passwords</label>
        <button className="primary full">Update Password</button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </section>
  </main>;
}


const landingDefaults = {
  site_name: "The Trotting Stable App",
  site_logo_url: "",
  hero_background_url: "",
  hero_primary_button: "Stable Login",
  hero_secondary_button: "Owners Portal",
  nav_stable_login: "Stable Login",
  nav_owner_login: "Owners Portal",
  nav_invite_signup: "Join With Invite Code",
  login_stable_title: "Stable Login",
  login_stable_description: "Trainer/staff access to the stable operations side.",
  login_owner_title: "Owners Portal",
  login_owner_description: "Owner-only access to horses, updates, invoices and calendar.",
  brand_primary_color: "#0B1026",
  brand_accent_color: "#FFFFFF",
  hero_eyebrow: "HARNESS RACING STABLE SOFTWARE",
  hero_title: "Stable operations and owner communication in one platform.",
  hero_description: "Separate access points for trainers/staff and owners, with role-based permissions and a proper owners portal.",
  feature_operations: "Stable Operations",
  feature_owners: "Owners Portal",
  feature_calendar: "Phone Calendar",
  feature_invoices: "Invoices",
  feature_analytics: "Analytics",
  feature_media: "Media Updates",
  feature_operations_description: "Included in the clean final rebuild.",
  feature_owners_description: "Included in the clean final rebuild.",
  feature_calendar_description: "Included in the clean final rebuild.",
  feature_invoices_description: "Included in the clean final rebuild.",
  feature_analytics_description: "Included in the clean final rebuild.",
  feature_media_description: "Included in the clean final rebuild."
};

function useSiteSettings(enabled = true) {
  const [content, setContent] = useState(landingDefaults);
  const [settingsError, setSettingsError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(enabled);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    async function loadSettings() {
      setSettingsLoading(true);
      setSettingsError("");
      try {
        const { data, error } = await supabase.from("site_settings").select("key,value");
        if (!active) return;
        if (error) throw error;
        if (!data?.length) {
          throw new Error("Supabase returned zero published settings. The public SELECT policy may be hiding rows, the site_settings table may be empty, or this deployment may point to a different Supabase project.");
        }
        const settings = Object.fromEntries(data.map(({ key, value }) => [key, value]));
        setContent({ ...landingDefaults, ...Object.fromEntries(
          Object.entries(settings).filter(([, value]) => value !== null && value !== "")
        ) });
      } catch (error) {
        if (!active) return;
        console.error("Public website settings could not load:", error);
        setSettingsError(error?.message || String(error));
      } finally {
        if (active) setSettingsLoading(false);
      }
    }
    loadSettings();
    return () => { active = false; };
  }, [enabled, retryCount]);

  return { content, settingsError, settingsLoading, retrySettings: () => setRetryCount(count => count + 1) };
}

function Landing({ setEntry, previewContent = null }) {
  const { content: liveContent, settingsError, settingsLoading, retrySettings } = useSiteSettings(!previewContent);
  const content = previewContent || liveContent;
  const features = ["operations", "owners", "calendar", "invoices", "analytics", "media"];

  // Do not disguise a failed database read as a successfully published homepage.
  if (!previewContent && (settingsLoading || settingsError)) {
    const projectHost = (() => {
      try { return new URL(import.meta.env.VITE_SUPABASE_URL).host; }
      catch { return "Invalid or missing VITE_SUPABASE_URL"; }
    })();
    return <main className="landing" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section role={settingsError ? "alert" : "status"} style={{ background: "#fff", color: "#0b1026", padding: 28, borderRadius: 16, maxWidth: 680, width: "100%", position: "relative", zIndex: 10 }}>
        <h1 style={{ fontSize: 28, marginTop: 0 }}>{settingsLoading ? "Loading website…" : "Website settings could not load"}</h1>
        {settingsError && <>
          <p>The homepage has not loaded its published content. This is a connection, permissions or data issue — not a reason to republish your draft.</p>
          <p style={{ overflowWrap: "anywhere" }}><strong>Supabase response:</strong> {settingsError}</p>
          <p style={{ overflowWrap: "anywhere" }}><strong>Supabase project used by this deployment:</strong> {projectHost}</p>
          <button className="primary" type="button" onClick={retrySettings}>Retry loading website</button>
        </>}
      </section>
    </main>;
  }

  return <main className="landing" style={{
    "--site-primary": content.brand_primary_color,
    "--site-accent": content.brand_accent_color
  }}>
    <PhotoReel backgroundUrl={content.hero_background_url} />
    <header className="landing-nav">
      <strong>{content.site_logo_url
        ? <img src={content.site_logo_url} alt={content.site_name} style={{ maxHeight: 44, maxWidth: 220, objectFit: "contain" }} />
        : content.site_name}</strong>
      <div>
        <button className="ghost dark" onClick={() => setEntry("stableLogin")}>{content.nav_stable_login}</button>
        <button className="ghost dark" onClick={() => setEntry("ownerLogin")}>{content.nav_owner_login}</button>
        <button className="primary light" onClick={() => setEntry("invite")}>{content.nav_invite_signup}</button>
        <button className="ghost dark" onClick={() => setEntry("apply")}>Create a Stable</button>
      </div>
    </header>
    <section className="hero">
      <p className="eyebrow">{content.hero_eyebrow}</p>
      <h1>{content.hero_title}</h1>
      <p>{content.hero_description}</p>
      <div className="hero-actions">
        <button className="primary light" onClick={() => setEntry("stableLogin")}>{content.hero_primary_button}</button>
        <button className="ghost dark" onClick={() => setEntry("ownerLogin")}>{content.hero_secondary_button}</button>
      </div>
    </section>
    <section className="feature-grid">
      {features.map(name => <article className="feature-card" key={name}>
        <h3>{content[`feature_${name}`]}</h3>
        <p>{content[`feature_${name}_description`]}</p>
      </article>)}
    </section>
  </main>;
}

function PhotoReel({ backgroundUrl = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [wiping, setWiping] = useState(false);

  // Preload every slide so the next photograph is ready before the wipe begins.
  useEffect(() => {
    photos.forEach(src => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (backgroundUrl || photos.length < 2) return;
    let revealTimer;
    let finishTimer;
    const interval = setInterval(() => {
      setCurrentIndex(current => {
        const upcoming = (current + 1) % photos.length;
        setNextIndex(upcoming);
        return current;
      });
      // Allow the incoming layer to mount before animating its clipping edge.
      revealTimer = setTimeout(() => setWiping(true), 50);
      finishTimer = setTimeout(() => {
        setCurrentIndex(current => (current + 1) % photos.length);
        setNextIndex(null);
        setWiping(false);
      }, 1250);
    }, 5500);
    return () => {
      clearInterval(interval);
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, [backgroundUrl]);

  const layerStyle = {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
  const safeUrl = url => `url("${String(url).replace(/["\\]/g, "")}")`;

  return <div className="photo-reel" style={{ overflow: "hidden", isolation: "isolate", position: "absolute" }}>
    <div style={{ ...layerStyle, backgroundImage: safeUrl(backgroundUrl || photos[currentIndex]) }} />
    {!backgroundUrl && nextIndex !== null &&
      <div style={{
        ...layerStyle,
        backgroundImage: safeUrl(photos[nextIndex]),
        clipPath: wiping ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        transition: wiping ? "clip-path 1.15s cubic-bezier(0.65, 0, 0.35, 1)" : "none",
        willChange: "clip-path"
      }} />}
  </div>;
}

function Login({ mode, onBack, setLoginMode }) {
  const { content } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setLoginMode?.(mode);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  }

  async function resetPassword() {
    setMessage("");

    if (!email) {
      setMessage("Enter your email address first, then click Forgot password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://thetrottingstableapp.com"
    });

    if (error) setMessage(error.message);
    else setMessage("Password reset email sent. Please check your inbox.");
  }

  return <main className="login-screen">
    <PhotoReel />
    <section className="login-card">
      <button className="text" onClick={onBack}>← Back</button>
      <h1>{mode === "owner" ? content.login_owner_title : content.login_stable_title}</h1>
      <p>{mode === "owner" ? content.login_owner_description : content.login_stable_description}</p>

      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show password</label>
        <button className="primary full">Login</button>
      </form>

      <div className="login-options always-visible-login-options">
        <button type="button" className="text forgot-password-link" onClick={resetPassword}>Forgot password?</button>
      </div>

      {message && <p className="login-message">{message}</p>}
    </section>
  </main>;
}


function InviteSignup({ onBack, setToast }) {
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setAlreadyRegistered(false);
    const trimmedCode = code.trim();
    if (!trimmedCode || !fullName.trim() || !email.trim() || password.length < 8) {
      setMessage("Enter an invitation code, name, email and a password of at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { stable_invite_code: trimmedCode, invited_full_name: fullName.trim() }
      }
    });
    setSubmitting(false);
    if (signupAlreadyRegistered(data, error)) {
      setAlreadyRegistered(true);
      return;
    }
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("If this email is eligible for registration, check your inbox for confirmation instructions. Already have an account? Log in instead.");
  }

  return <main className="login-screen">
    <PhotoReel />
    <section className="login-card">
      <button className="text" onClick={onBack}>← Back</button>
      <h1>Join With Invite Code</h1>
      <form onSubmit={submit}>
        <label>Invite Code<input value={code} onChange={e => setCode(e.target.value)} /></label>
        <label>Full Name<input value={fullName} onChange={e => setFullName(e.target.value)} /></label>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label>Confirm Password<input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show passwords</label>
        <button className="primary full" disabled={submitting}>{submitting ? "Creating account..." : "Create Account"}</button>
      </form>
      {alreadyRegistered && <ExistingAccountNotice onBack={onBack} />}
      {message && <p className="login-message" role="status">{message}</p>}
    </section>
  </main>;
}

// Super Admin navigation lives outside individual stable settings.
function SiteAdministration({ setToast, onStableDeleted }) {
  const [section, setSection] = useState("applications");
  return <main className="page site-admin-page">
    <section className="module-header"><div className="module-icon"><ShieldCheck size={24}/></div>
      <div><p className="eyebrow">Platform management</p><h2>Site Administration</h2>
      <p className="muted">Manage the website and stable applications independently of any selected stable.</p></div>
    </section>
    <div className="site-admin-tabs" role="tablist" aria-label="Site administration sections">
      <button type="button" role="tab" aria-selected={section === "applications"} className={section === "applications" ? "active" : ""} onClick={() => setSection("applications")}><ClipboardList size={18}/> Stable Applications</button>
      <button type="button" role="tab" aria-selected={section === "stables"} className={section === "stables" ? "active" : ""} onClick={() => setSection("stables")}><Building2 size={18}/> Stable Management</button>
      <button type="button" role="tab" aria-selected={section === "website"} className={section === "website" ? "active" : ""} onClick={() => setSection("website")}><Edit3 size={18}/> Website Editor</button>
    </div>
    <div className="site-admin-content" role="tabpanel">
      {section === "applications" ? <StableApplicationsAdmin setToast={setToast}/> : section === "stables" ? <SuperAdminStableManagement setToast={setToast} onStableDeleted={onStableDeleted}/> : <WebsiteEditor setToast={setToast}/>} 
    </div>
  </main>;
}

function SuperAdminStableManagement({ setToast, onStableDeleted }) {
  const [stables, setStables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("stables").select("id,name").order("name");
    setLoading(false);
    setError(loadError?.message || "");
    if (!loadError) setStables(data || []);
  }
  useEffect(() => { refresh(); }, []);
  async function deleteStable() {
    if (!target || busy || confirmation !== target.name) return;
    setBusy(true); setError("");
    const { error: deleteError } = await supabase.rpc("super_admin_delete_stable", {
      p_stable_id: target.id, p_confirm_name: confirmation
    });
    setBusy(false);
    if (deleteError) { setError(deleteError.message); return; }
    const removedId = target.id;
    setTarget(null); setConfirmation("");
    setToast("Stable permanently deleted. Member logins were retained.");
    await refresh();
    await onStableDeleted?.(removedId);
  }
  return <section className="settings-card" style={{maxWidth:920,margin:"0 auto"}}>
    <h3>Stable Management</h3>
    <p>Manage registered stables. Permanent deletion is restricted to Super Administrators.</p>
    <button type="button" className="ghost" onClick={refresh} disabled={loading || busy}>Refresh stables</button>
    {error && <p role="alert" style={{color:"#b42318",marginTop:12}}>{error}</p>}
    {loading ? <p>Loading stables...</p> : !stables.length ? <p>No registered stables.</p> : stables.map(st =>
      <div key={st.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",padding:"18px 0",borderBottom:"1px solid #dbe3ef"}}>
        <div><strong>{st.name}</strong><div className="muted" style={{fontSize:12}}>{st.id}</div></div>
        <button type="button" className="ghost" disabled={busy} onClick={() => {setTarget(st);setConfirmation("");setError("");}}><Trash2 size={16}/> Delete stable</button>
      </div>
    )}
    {target && <div role="dialog" aria-modal="true" aria-label="Confirm permanent stable deletion" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(9,16,36,.78)",display:"grid",placeItems:"center",padding:18}}>
      <div style={{width:"100%",maxWidth:510,background:"#fff",color:"#111827",borderRadius:18,padding:28,boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
        <h2 style={{marginTop:0}}>Permanently delete {target.name}?</h2>
        <p>This cannot be undone. All stable-linked horses, work, races, invoices, financial records, owner portal records and other stable data will be deleted. Members will lose access, but their login accounts and personal profiles will remain.</p>
        <p>Type <strong>{target.name}</strong> exactly to confirm:</p>
        <input autoFocus aria-label="Type stable name to confirm deletion" style={{width:"100%",padding:12,marginBottom:18}} value={confirmation} onChange={e=>setConfirmation(e.target.value)} disabled={busy}/>
        {error && <p role="alert" style={{color:"#b42318"}}>{error}</p>}
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",flexWrap:"wrap"}}>
          <button type="button" className="ghost" disabled={busy} onClick={()=>{setTarget(null);setConfirmation("");setError("");}}>Cancel</button>
          <button type="button" disabled={busy || confirmation !== target.name} onClick={deleteStable} style={{background:confirmation === target.name ? "#b42318" : "#a5a5a5",color:"white",border:0,borderRadius:9,padding:"12px 18px",cursor:confirmation === target.name ? "pointer" : "not-allowed"}}>{busy ? "Deleting..." : "Permanently delete stable"}</button>
        </div>
      </div>
    </div>}
  </section>;
}

function StableSwitcher({ stables, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef(null);
  const search = useRef(null);
  const selected = stables.find(st => st.id === selectedId);
  const matches = stables.filter(st => (st.name || "").toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    if (!open) return;
    const dismiss = event => { if (root.current && !root.current.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    search.current?.focus();
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="stable-switcher" ref={root}>
    <span className="stable-switcher-label">MANAGING STABLE</span>
    <button type="button" className="stable-switcher-trigger" aria-expanded={open} aria-haspopup="listbox" onClick={() => { setQuery(""); setOpen(v => !v); }}>
      <span className="stable-switcher-selected"><span className="stable-switcher-avatar"><Home size={17}/></span><span>{selected?.name || "Select a stable"}</span></span>
      <ChevronRight size={18} className={open ? "stable-switcher-chevron open" : "stable-switcher-chevron"}/>
    </button>
    {open && <div className="stable-switcher-menu">
      <div className="stable-switcher-search"><Search size={17}/><input ref={search} aria-label="Search stables" placeholder="Search stables..." value={query} onChange={e => setQuery(e.target.value)}/></div>
      <div className="stable-switcher-options" role="listbox" aria-label="Select a stable">
        {matches.length ? matches.map(st => <button type="button" role="option" aria-selected={st.id === selectedId} className={st.id === selectedId ? "selected" : ""} key={st.id} onClick={() => { onSelect(st.id); setOpen(false); setQuery(""); }}><span>{st.name}</span>{st.id === selectedId && <BadgeCheck size={17}/>}</button>) : <p className="muted" style={{padding:14}}>No matching stables</p>}
      </div>
    </div>}
  </div>;
}

function StableApp({ profile, tab, setTab, setToast, stable, setStable, setProfile, isSuperAdmin = false }) {
  const hidden = profile.role === "staff" ? ["finance", "staff"] : [];
  return <>
    <nav className="nav">
      <NavButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={Home} label="Home" />
      {Object.entries(moduleDefs).filter(([key]) => !hidden.includes(key)).map(([key, module]) => <NavButton key={key} active={tab === key} onClick={() => setTab(key)} icon={module.icon} label={module.title} />)}
      <NavButton active={tab === "updates"} onClick={() => setTab("updates")} icon={Megaphone} label="Updates" />
      <NavButton active={tab === "analytics"} onClick={() => setTab("analytics")} icon={BarChart3} label="Analytics" />
      {financeRoles.includes(profile.role) && <NavButton active={tab === "invoices"} onClick={() => setTab("invoices")} icon={FileText} label="Invoices" />}
      <NavButton active={tab === "settings"} onClick={() => setTab("settings")} icon={Settings} label="Settings" />
      {isSuperAdmin && <NavButton active={tab === "siteAdmin"} onClick={() => setTab("siteAdmin")} icon={ShieldCheck} label="Site Administration" />}
    </nav>
    {tab === "dashboard" && <Dashboard stableId={profile.stable_id} setTab={setTab} role={profile.role} />}
    {tab === "updates" && <UpdatesPanel stableId={profile.stable_id} setToast={setToast} />}
    {tab === "analytics" && <Analytics stableId={profile.stable_id} role={profile.role} />}
    {tab === "invoices" && financeRoles.includes(profile.role) && <Invoices stableId={profile.stable_id} setToast={setToast} />}
    {tab === "settings" && <SettingsPanel profile={profile} stable={stable} setStable={setStable} setProfile={setProfile} setToast={setToast} isSuperAdmin={isSuperAdmin} />}
    {moduleDefs[tab] && !hidden.includes(tab) && <GenericTable stableId={profile.stable_id} config={moduleDefs[tab]} setToast={setToast} role={profile.role} />}
  </>;
}

function OwnerApp({ profile, tab, setTab, setToast, stable, setStable, setProfile }) {
  return <>
    <nav className="nav">
      <NavButton active={tab === "ownerHome"} onClick={() => setTab("ownerHome")} icon={Home} label="Home" />
      <NavButton active={tab === "ownerHorses"} onClick={() => setTab("ownerHorses")} icon={HorseIcon} label="Horses" />
      <NavButton active={tab === "ownerUpdates"} onClick={() => setTab("ownerUpdates")} icon={Megaphone} label="Updates" />
      <NavButton active={tab === "ownerCalendar"} onClick={() => setTab("ownerCalendar")} icon={Calendar} label="Calendar" />
      <NavButton active={tab === "ownerInvoices"} onClick={() => setTab("ownerInvoices")} icon={CreditCard} label="Bills" />
      <NavButton active={tab === "ownerSettings"} onClick={() => setTab("ownerSettings")} icon={Settings} label="Account" />
    </nav>
    {tab === "ownerHome" && <OwnerHome profile={profile} setTab={setTab} />}
    {tab === "ownerHorses" && <OwnerHorses profile={profile} />}
    {tab === "ownerUpdates" && <OwnerUpdates profile={profile} />}
    {tab === "ownerCalendar" && <OwnerCalendar profile={profile} />}
    {tab === "ownerInvoices" && <OwnerInvoices profile={profile} />}
    {tab === "ownerSettings" && <SettingsPanel profile={profile} stable={stable} setStable={setStable} setProfile={setProfile} setToast={setToast} ownerMode />}
  </>;
}


function SettingsPanel({ profile, stable, setStable, setProfile, setToast, ownerMode = false, isSuperAdmin = false }) {
  const [name, setName] = useState(profile.full_name || profile.owner_name || "");
  const [ownerName, setOwnerName] = useState(profile.owner_name || profile.full_name || "");
  const [stableName, setStableName] = useState(stable?.name || profile.stables?.name || "");
  const [saving, setSaving] = useState(false);
  async function saveAccount(event) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      full_name: name.trim(),
      owner_name: ownerName.trim() || name.trim()
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", profile.id);

    if (error) {
      setToast(error.message);
    } else {
      setProfile?.(current => current ? { ...current, ...payload } : current);
      setToast("Account settings saved.");
    }

    setSaving(false);
  }

  async function saveStable(event) {
    event.preventDefault();

    if (!profile.stable_id) {
      setToast("No stable is linked to this account yet.");
      return;
    }

    const nextName = stableName.trim();

    if (!nextName) {
      setToast("Stable name cannot be blank.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("stables")
      .update({ name: nextName })
      .eq("id", profile.stable_id);

    if (error) {
      setToast(error.message);
    } else {
      const updatedStable = {
        ...(stable || {}),
        id: profile.stable_id,
        name: nextName
      };

      setStable?.(updatedStable);
      if (!isSuperAdmin) setProfile?.(current => current ? { ...current, stables: updatedStable } : current);
      setStableName(nextName);
      setToast("Stable settings saved.");
    }

    setSaving(false);
  }

  async function sendPasswordReset() {
    const email = profile.email || profile.user_email || "";

    if (!email) {
      setToast("No email address found for this account.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://thetrottingstableapp.com"
    });

    if (error) {
      setToast(error.message);
    } else {
      setToast("Password reset email sent.");
    }
  }

  return <main className="page">
    <section className="module-header">
      <div className="module-icon"><Settings size={24}/></div>
      <h2>{ownerMode ? "Account" : "Settings"}</h2>
    </section>

    <section className="settings-grid">
      <article className="settings-card">
        <h3>Account</h3>
        <p>Manage your personal login profile.</p>
        <form className="form-grid" onSubmit={saveAccount}>
          <label className="field"><span>Name</span><input value={name} onChange={event => setName(event.target.value)} /></label>
          <label className="field"><span>Owner Display Name</span><input value={ownerName} onChange={event => setOwnerName(event.target.value)} /></label>
          <label className="field"><span>Email</span><input value={profile.email || ""} disabled /></label>
          <button className="primary full" disabled={saving}>{saving ? "Saving..." : "Save Account"}</button>
        </form>
      </article>

      {!ownerMode && profile.role === "admin" && <article className="settings-card">
        <h3>Stable</h3>
        <p>Basic stable identity and branding. Logo upload can be added next.</p>
        <form className="form-grid" onSubmit={saveStable}>
          <label className="field"><span>Stable Name</span><input value={stableName} onChange={event => setStableName(event.target.value)} /></label>
          <label className="field"><span>Stable ID</span><input value={profile.stable_id || ""} disabled /></label>
          <button className="primary full" disabled={saving}>{saving ? "Saving..." : "Save Stable"}</button>
        </form>
      </article>}

      {!ownerMode && (isSuperAdmin || profile.role === "trainer" || (profile.role === "admin" && profile.is_trainer)) &&
        <TeamInvitations profile={profile} setToast={setToast} isSuperAdmin={isSuperAdmin} />}
      {!ownerMode && (isSuperAdmin || (profile.role === "admin" && profile.is_trainer)) &&
        <ManageTeam profile={profile} setToast={setToast} isSuperAdmin={isSuperAdmin} />}


      <article className="settings-card">
        <h3>Security</h3>
        <p>Password reset works now. Two-factor authentication will be added here next.</p>
        <div className="settings-actions">
          <button className="ghost" type="button" onClick={sendPasswordReset}>Send Password Reset Email</button>
          <button className="ghost" type="button" disabled>Two-Factor Authentication — Coming Next</button>
        </div>
      </article>

      <article className="settings-card">
        <h3>Notifications</h3>
        <p>Email notifications for updates, invoices, race reminders and owner notices will live here.</p>
        <div className="settings-actions">
          <button className="ghost" type="button" disabled>Email Preferences — Coming Soon</button>
        </div>
      </article>
    </section>
  </main>;
}

function TeamInvitations({ profile, setToast, isSuperAdmin = false }) {
  const [role, setRole] = useState("staff");
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(true);

  async function loadInvites() {
    setLoadingInvites(true);
    const { data, error } = await supabase.from("invite_codes")
      .select("id,code,role,email,used_by,used_at,expires_at,created_at")
      .eq("stable_id", profile.stable_id)
      .order("created_at", { ascending: false });
    setLoadingInvites(false);
    if (error) setToast(`Unable to load invitations: ${error.message}`);
    else setInvites(data || []);
  }

  useEffect(() => { if (profile.stable_id) loadInvites(); }, [profile.stable_id]);

  async function generateInvite(event) {
    event.preventDefault();
    if (!profile.stable_id || busy) return;
    setBusy(true);
    setNewCode("");
    const { data, error } = await supabase.rpc("create_stable_invite", {
      p_stable_id: profile.stable_id,
      p_role: role,
      p_email: email.trim() || null
    });
    setBusy(false);
    if (error) { setToast(`Unable to create invitation: ${error.message}`); return; }
    setNewCode(data || "");
    setEmail("");
    setToast("Invitation created. Copy the code to send it privately.");
    await loadInvites();
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setToast("Invitation code copied.");
    } catch {
      window.prompt("Copy this invitation code:", code);
    }
  }

  async function revokeInvite(invite) {
    if (!window.confirm(`Revoke invitation ${invite.code}?`)) return;
    setBusy(true);
    const { error } = await supabase.rpc("revoke_stable_invite", { p_invite_id: invite.id });
    setBusy(false);
    if (error) setToast(`Unable to revoke invitation: ${error.message}`);
    else { setToast("Invitation revoked."); await loadInvites(); }
  }

  return <article className="settings-card" style={{ gridColumn: "1 / -1" }}>
    <h3>Team &amp; Invitations</h3>
    <p>Create a code, copy it and send it privately. The recipient selects <strong>Join With Invite Code</strong> on the homepage.</p>
    <form className="form-grid" onSubmit={generateInvite}>
      <label className="field"><span>Access role</span>
        <select value={role} onChange={event => setRole(event.target.value)}>
          <option value="staff">Staff</option>
          {(isSuperAdmin || (profile.role === "admin" && profile.is_trainer)) && <option value="trainer">Trainer</option>}
          <option value="owner">Owner</option>
        </select>
      </label>
      <label className="field"><span>Recipient email (optional)</span>
        <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="person@example.com" />
      </label>
      <button className="primary" type="submit" disabled={busy}>{busy ? "Working..." : "Generate Invitation Code"}</button>
    </form>
    {newCode && <div style={{ marginTop: 16, padding: 16, background: "#eef2ff", color: "#0b1026", borderRadius: 12 }}>
      <strong>New invitation code</strong>
      <p style={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>{newCode}</p>
      <button type="button" className="primary" onClick={() => copyCode(newCode)}>Copy Code</button>
    </div>}
    <h4 style={{ marginTop: 24 }}>Invitation history</h4>
    <button type="button" className="ghost" onClick={loadInvites} disabled={loadingInvites}>Refresh</button>
    {loadingInvites ? <p>Loading invitations...</p> : invites.length === 0 ? <p>No invitations yet.</p> :
      invites.map(invite => {
        const expired = !!invite.expires_at && new Date(invite.expires_at).getTime() < Date.now();
        const used = !!invite.used_at || !!invite.used_by;
        return <div key={invite.id} style={{ borderTop: "1px solid #dbe3ef", padding: "14px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <strong>{invite.role === "owner" ? "Owner" : invite.role === "trainer" ? "Trainer" : "Staff"}</strong>
              <span> · {used ? "Used" : expired ? "Expired" : "Unused"}</span>
              {invite.email && <div className="muted">{invite.email}</div>}
              <div style={{ fontFamily: "monospace", overflowWrap: "anywhere", marginTop: 5 }}>{invite.code}</div>
            </div>
            {!used && !expired && <div className="button-row">
              <button type="button" className="ghost" onClick={() => copyCode(invite.code)}>Copy</button>
              <button type="button" className="ghost" disabled={busy} onClick={() => revokeInvite(invite)}>Revoke</button>
            </div>}
          </div>
        </div>;
      })}
  </article>;
}

function ManageTeam({ profile, setToast, isSuperAdmin = false }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadMembers() {
    if (!profile.stable_id) { setMembers([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.rpc("get_stable_members", { p_stable_id: profile.stable_id });
    setLoading(false);
    if (error) { setErrorMessage(error.message); setToast(`Unable to load team: ${error.message}`); }
    else { setErrorMessage(""); setMembers(data || []); }
  }

  useEffect(() => { loadMembers(); }, [profile.stable_id]);

  async function removeMember(member) {
    if (member.role === "admin" || member.user_id === profile.id) return;
    if (!window.confirm(`Remove ${member.full_name || "this member"} from this stable? Their account and historical records will be retained.`)) return;
    setBusyId(member.user_id);
    const { error } = await supabase.rpc("remove_stable_member", { p_user_id: member.user_id });
    setBusyId(null);
    if (error) setToast(`Could not remove member: ${error.message}`);
    else { setToast("Stable membership removed."); await loadMembers(); }
  }

  return <article className="settings-card" style={{gridColumn:"1 / -1"}}>
    <h3>Manage Team</h3>
    <p>View stable account members and revoke access. Removing a member preserves their login and historical stable records.</p>
    <button className="ghost" type="button" disabled={loading} onClick={loadMembers}>Refresh Members</button>
    {loading ? <p>Loading members...</p> : errorMessage ? <p role="alert">{errorMessage}</p> : !members.length ? <p>No members found for this stable.</p> :
      members.map(member => <div key={member.user_id} style={{borderTop:"1px solid #dbe3ef",padding:"14px 0",display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <div><strong>{member.full_name || "Unnamed member"}</strong><div className="muted">{member.role === "admin" && member.is_trainer ? "Stable Admin + Trainer" : member.role === "trainer" ? "Trainer" : member.role === "owner" ? "Owner" : member.role === "staff" ? "Staff" : member.role}</div></div>
        {member.role !== "admin" && member.user_id !== profile.id &&
          <button type="button" className="ghost" disabled={!!busyId} onClick={() => removeMember(member)}><Trash2 size={16}/> Remove</button>}
        {member.role === "admin" && <span className="muted">Protected administrator</span>}
      </div>)}
  </article>;
}

function StableApplicationsAdmin({ setToast }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("stable_applications")
      .select("id,applicant_id,stable_name,contact_name,contact_email,message,status,created_at,review_notes")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) setToast(`Applications: ${error.message}`);
    else setApplications(data || []);
  }
  useEffect(() => { load(); }, []);
  async function review(item, action) {
    if (!window.confirm(`${action === "approve" ? "Approve" : "Reject"} ${item.stable_name}?`)) return;
    const reason = action === "reject" ? window.prompt("Optional rejection reason:", "") : null;
    if (action === "reject" && reason === null) return;
    setBusyId(item.id);
    const { error } = action === "approve"
      ? await supabase.rpc("approve_stable_application", { p_application_id: item.id })
      : await supabase.rpc("reject_stable_application", { p_application_id: item.id, p_reason: reason || null });
    setBusyId(null);
    if (error) setToast(error.message);
    else { setToast(`Application ${action === "approve" ? "approved" : "rejected"}.`); await load(); }
  }
  return <article className="settings-card" style={{ gridColumn: "1 / -1" }}>
    <h3>Stable Applications</h3><p>Only website administrators can review applications.</p>
    <button type="button" className="ghost" onClick={load}>Refresh Applications</button>
    {loading ? <p>Loading applications...</p> : !applications.length ? <p>No applications yet.</p> :
      applications.map(item => <div key={item.id} style={{ borderTop: "1px solid #ddd", padding: "16px 0" }}>
        <strong>{item.stable_name}</strong> — {item.status}<br />
        <span>{item.contact_name} · {item.contact_email}</span><br />
        <small>{new Date(item.created_at).toLocaleString()}</small>
        {item.message && <p>{item.message}</p>}
        {item.review_notes && <p>Review notes: {item.review_notes}</p>}
        {item.status === "pending" && <div className="settings-actions">
          <button className="primary" type="button" disabled={!!busyId} onClick={() => review(item, "approve")}>Approve</button>
          <button className="ghost" type="button" disabled={!!busyId} onClick={() => review(item, "reject")}>Reject</button>
        </div>}
      </div>)}
  </article>;
}

const editableWebsiteFields = [
  ["Branding", [
    ["site_name", "Website name"], ["site_logo_url", "Logo public URL"],
    ["hero_background_url", "Homepage background public URL"]
  ]],
  ["Homepage", [
    ["hero_eyebrow", "Small heading"], ["hero_title", "Main heading"],
    ["hero_description", "Introduction"]
  ]],
  ["Buttons and navigation", [
    ["hero_primary_button", "Main button"], ["hero_secondary_button", "Secondary button"],
    ["nav_stable_login", "Navigation: Stable Login"],
    ["nav_owner_login", "Navigation: Owners Portal"],
    ["nav_invite_signup", "Navigation: Invite signup"]
  ]],
  ["Login pages", [
    ["login_stable_title", "Stable login title"],
    ["login_stable_description", "Stable login description"],
    ["login_owner_title", "Owner login title"],
    ["login_owner_description", "Owner login description"]
  ]],
  ["Feature cards", [
    ...["operations", "owners", "calendar", "invoices", "analytics", "media"].flatMap(name => [
      [`feature_${name}`, `${name} title`],
      [`feature_${name}_description`, `${name} description`]
    ])
  ]]
];

function WebsiteEditor({ setToast }) {
  const [values, setValues] = useState(landingDefaults);
  const [published, setPublished] = useState(landingDefaults);
  const [savedDraft, setSavedDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState({});
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const [liveResult, draftResult] = await Promise.all([
        supabase.from("site_settings").select("key,value"),
        supabase.from("site_settings_drafts").select("key,value")
      ]);
      if (!active) return;
      if (liveResult.error || draftResult.error) {
        setToast(`Unable to load website editor: ${(liveResult.error || draftResult.error).message}`);
        setLoading(false);
        return;
      }
      const live = { ...landingDefaults, ...Object.fromEntries((liveResult.data || []).map(({ key, value }) => [key, value ?? ""])) };
      const drafts = Object.fromEntries((draftResult.data || []).map(({ key, value }) => [key, value ?? ""]));
      setPublished(live);
      setSavedDraft(drafts);
      setValues({ ...live, ...drafts });
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const hasUnsavedChanges = Object.keys(dirty).length > 0;
  const hasSavedDraft = Object.keys(savedDraft).length > 0;

  function change(key, value) {
    setValues(current => ({ ...current, [key]: value }));
    setDirty(current => ({ ...current, [key]: true }));
  }

  async function saveDraft(event) {
    if (event) event.preventDefault();
    const keys = Object.keys(dirty);
    if (!keys.length) return;
    setSaving(true);
    const changes = Object.fromEntries(keys.map(key => [key, values[key] ?? ""]));
    const { error } = await supabase.from("site_settings_drafts").upsert(
      keys.map(key => ({ key, value: changes[key] })), { onConflict: "key" }
    );
    setSaving(false);
    if (error) {
      setToast(`Could not save draft: ${error.message}`);
      return;
    }
    setSavedDraft(current => ({ ...current, ...changes }));
    setDirty({});
    setToast("Draft saved privately. The public website has not changed.");
  }

  async function publish() {
    if (hasUnsavedChanges) {
      setToast("Save your draft before publishing.");
      return;
    }
    if (!hasSavedDraft) {
      setToast("There is no saved draft to publish.");
      return;
    }
    if (!window.confirm("Publish your saved website draft to the public website now?")) return;
    setPublishing(true);
    const entries = Object.entries(savedDraft).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_settings").upsert(entries, { onConflict: "key" });
    if (error) {
      setPublishing(false);
      setToast(`Publishing failed: ${error.message}`);
      return;
    }
    const { error: clearError } = await supabase.from("site_settings_drafts").delete()
      .in("key", Object.keys(savedDraft));
    setPublishing(false);
    setPublished(current => ({ ...current, ...savedDraft }));
    if (clearError) {
      setToast(`Published successfully, but the draft could not be cleared: ${clearError.message}`);
    } else {
      setSavedDraft({});
      setToast("Website published! Refresh the public homepage to see the changes.");
    }
  }

  return <article className="settings-card" style={{ gridColumn: "1 / -1" }}>
    <h3>Website Editor</h3>
    <p>Save a private draft, preview it, then publish when you're ready. Saving a draft never changes the public website.</p>
    {loading ? <p>Loading website settings...</p> : <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <button className="ghost" type="button" onClick={() => setPreview(true)}>Preview draft</button>
        <button className="primary" type="button" disabled={saving || !hasUnsavedChanges} onClick={saveDraft}>
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button className="primary" type="button" disabled={publishing || saving || hasUnsavedChanges || !hasSavedDraft} onClick={publish}>
          {publishing ? "Publishing..." : "Publish Changes"}
        </button>
      </div>
      <p style={{ fontSize: 13 }}>
        {hasUnsavedChanges ? "You have unsaved edits. Save Draft before publishing."
          : hasSavedDraft ? "Private draft saved. Review the preview and publish when ready."
          : "No unpublished draft. Your editor matches the public website."}
      </p>
      <form onSubmit={saveDraft} className="form-grid">
        {editableWebsiteFields.map(([section, fields]) => <fieldset key={section} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, minWidth: 0 }}>
          <legend style={{ fontWeight: 700, padding: "0 8px" }}>{section}</legend>
          {fields.map(([key, label]) => <label className="field" key={key}>
            <span>{label}</span>
            {key.endsWith("_description") || key === "hero_description"
              ? <textarea rows={3} value={values[key] ?? ""} onChange={e => change(key, e.target.value)} />
              : <input value={values[key] ?? ""} onChange={e => change(key, e.target.value)} />}
          </label>)}
        </fieldset>)}
      </form>
      {preview && <div role="dialog" aria-modal="true" aria-label="Website draft preview"
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#0b1026", overflow: "auto" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10000, background: "#fff", padding: "10px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <strong>PRIVATE PREVIEW — not published</strong>
          <button type="button" className="primary" onClick={() => setPreview(false)}>Close Preview</button>
        </div>
        <Landing setEntry={() => {}} previewContent={values} />
      </div>}
    </>}
  </article>;
}

function Dashboard({ stableId, setTab, role }) {
  const [counts, setCounts] = useState({});
  useEffect(() => { if (stableId) load(); }, [stableId]);

  async function count(table) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("stable_id", stableId);
    return count || 0;
  }

  async function load() {
    const [horses, work, owners, races, invoices] = await Promise.all([
      count("horses"), count("work_entries"), count("owners"), count("race_records"), financeRoles.includes(role) ? count("invoices") : Promise.resolve(0)
    ]);
    setCounts({ horses, work, owners, races, invoices });
  }

  return <main className="page">
    <section className="hero-panel">
      <div><p className="eyebrow dark-text">Stable command centre</p><h2>Everything important, in one place.</h2></div>
    </section>
    <section className="stats">
      <Stat icon={HorseIcon} label="Horses" value={counts.horses || 0} />
      <Stat icon={ClipboardList} label="Work" value={counts.work || 0} />
      <Stat icon={Users} label="Owners" value={counts.owners || 0} />
      <Stat icon={Trophy} label="Races" value={counts.races || 0} />
      {financeRoles.includes(role) && <Stat icon={FileText} label="Invoices" value={counts.invoices || 0} />}
    </section>
    <section className="quick-grid">
      {["horses","owners","work","racing","treatments","farrier","feed","gear","updates","analytics",...(financeRoles.includes(role) ? ["invoices"] : [])].map(key => <button className="quick" key={key} onClick={() => setTab(key)}>{key}<ChevronRight size={18}/></button>)}
    </section>
  </main>;
}

function GenericTable({ stableId, config, setToast, role = "staff" }) {
  const canEdit = config.table !== "owners" || financeRoles.includes(role);
  const [rows, setRows] = useState([]);
  const [horses, setHorses] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [calendar, setCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!stableId) return;
    load();
    supabase.from("horses").select("name,stable_name").eq("stable_id", stableId).order("name").then(({ data }) => setHorses(validHorseOptions(data || [])));
    supabase.from("owners").select("name,email,phone").eq("stable_id", stableId).order("name").then(({ data }) => setOwners(data || []));
  }, [stableId, config.table]);

  async function load() {
    const { data, error } = await supabase.from(config.table).select("*").eq("stable_id", stableId).order("created_at", { ascending: false });
    if (error) setToast(error.message);
    setRows(data || []);
  }

  function blank() {
    const out = {};
    config.fields.forEach(([key, _label, type, options]) => {
      if (type === "date") out[key] = new Date().toISOString().slice(0, 10);
      else if (type === "number") out[key] = "";
      else if (type === "select") out[key] = options[0];
      else if (type === "horseName") out[key] = horseDisplayName(validHorseOptions(horses)[0]) || "";
      else if (type === "ownerName") out[key] = owners[0]?.name || "";
      else out[key] = "";
    });
    return out;
  }

  async function save(record, mode) {
    if (!canEdit) { setToast("You do not have permission to edit owners."); return; }
    const clean = { ...record, stable_id: stableId };
    config.fields.forEach(([key, _label, type]) => {
      if (type === "number") clean[key] = clean[key] === "" ? 0 : Number(clean[key]);
    });
    const result = mode === "edit"
      ? await supabase.from(config.table).update(clean).eq("id", clean.id).eq("stable_id", stableId).select().single()
      : await supabase.from(config.table).insert(clean).select().single();
    if (result.error) {
      setToast(result.error.message);
      return;
    }
    await afterSave(config, result.data || clean, stableId);
    setToast("Saved");
    setModal(null);
    load();
  }

  async function remove(id) {
    if (!canEdit) { setToast("You do not have permission to delete owners."); return; }
    const { error } = await supabase.from(config.table).delete().eq("id", id).eq("stable_id", stableId);
    if (error) setToast(error.message);
    else load();
  }

  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  const shown = calendar && selectedDate && config.calendarField ? filtered.filter(row => row[config.calendarField] === selectedDate) : filtered;
  const Icon = config.icon;

  if (config.profile === "horse" && modal?.mode === "horseProfile") {
    return <HorseProfile horse={modal.record} stableId={stableId} role={role} onClose={() => setModal(null)} />;
  }

  return <main className="page">
    <section className="module-header"><div className="module-icon"><Icon size={24}/></div><h2>{config.title}</h2></section>
    <section className="toolbar">
      <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.title}`} /></div>
      {config.calendarField && <button className="ghost" onClick={() => setCalendar(!calendar)}><Calendar size={18}/>{calendar ? "Card View" : "Calendar"}</button>}
      {canEdit && <button className="primary" onClick={() => setModal({ mode: "add", record: blank() })}><Plus size={18}/>Add</button>}
    </section>
    {config.table === "staff" && <StaffDirectory stableId={stableId} setToast={setToast} />}
    {calendar && config.calendarField && <PhoneCalendar rows={rows} dateField={config.calendarField} selectedDate={selectedDate} setSelectedDate={setSelectedDate} title={config.title} />}
    <section className="grid">
      <CollapsibleRecords rows={shown} threshold={config.table === "work_entries" ? 12 : 999999} render={row => <article className="record clickable" key={row.id} onClick={() => config.profile === "horse" ? setModal({ mode: "horseProfile", record: row }) : config.profile === "owner" ? setModal({ mode: "ownerProfile", record: row }) : null}>
        <div className="record-head">
          <div><h3>{row.name || row.horse_name || row.item_name || row.full_name || row.date || row.entry_date || "Record"}</h3><p>{row.status || row.category || row.role || ""}</p></div>
          {canEdit && <div className="button-row" onClick={e => e.stopPropagation()}>
            <button className="edit" onClick={() => setModal({ mode: "edit", record: { ...row } })}><Edit3 size={16}/></button>
            <button className="delete" onClick={() => remove(row.id)}><Trash2 size={16}/></button>
          </div>}
        </div>
        <div className="details">{config.display.map(key => <div key={key}><span>{labelize(key)}</span><strong>{formatValue(row[key])}</strong></div>)}</div>
      </article>} />
    </section>
    {modal?.mode === "ownerProfile" && <OwnerProfile owner={modal.record} stableId={stableId} role={role} onClose={() => setModal(null)} />}
    {canEdit && modal && ["add","edit"].includes(modal.mode) && <RecordModal title={`${modal.mode === "edit" ? "Edit" : "Add"} ${config.title}`} fields={config.fields} record={modal.record} horses={horses} owners={owners} stableId={stableId} onClose={() => setModal(null)} onSave={record => save(record, modal.mode)} />}
  </main>;
}

async function afterSave(config, record, stableId) {
  if (["treatments", "farrier_records"].includes(config.table) && record.bill_to_owners === "Yes" && Number(record.bill_amount) > 0) {
    await createOwnerInvoices(stableId, record.horse_name, Number(record.bill_amount), record.treatment_type || record.service_type || "Bill", config.table, record.id);
  }
  if (config.table === "finance_entries" && record.entry_type === "Expense" && record.bill_to_owners === "Yes") {
    await createOwnerInvoices(stableId, record.horse_name, Number(record.amount), record.category || "Expense", config.table, record.id);
  }
  if (config.table === "updates") {
    await distributeUpdate(stableId, record);
    await supabase.from("updates").update({ send_status: "Sent", visibility: record.visibility === "internal" ? "internal" : "owners", sent_at: new Date().toISOString() }).eq("id", record.id).eq("stable_id", stableId);
  }
}

async function createOwnerInvoices(stableId, horseName, amount, category, sourceType, sourceId) {
  if (!horseName || !amount) return;
  const { data: shares } = await supabase.from("horse_owners").select("*").eq("stable_id", stableId).eq("horse_name", horseName);
  for (const share of shares || []) {
    const charge = Number((amount * Number(share.percentage || 0) / 100).toFixed(2));
    const { data: owner } = await supabase.from("owners").select("*").eq("stable_id", stableId).eq("name", share.owner_name).maybeSingle();
    const line = { id: crypto.randomUUID(), description: `${category} - ${horseName} (${share.percentage}%)`, quantity: 1, unit_price: charge };
    await supabase.from("invoices").insert({
      stable_id: stableId,
      invoice_number: `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      client_name: share.owner_name,
      client_email: owner?.email || "",
      client_phone: owner?.phone || "",
      horse_name: horseName,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "Draft",
      payment_status: "Unpaid",
      line_items: [line],
      amount: charge,
      gst: charge * GST_RATE,
      total: charge * (1 + GST_RATE),
      source_type: sourceType,
      source_id: sourceId
    });
  }
}

async function distributeUpdate(stableId, update) {
  if (!update.horse_name) return;
  const { data: shares } = await supabase.from("horse_owners").select("owner_name").eq("stable_id", stableId).eq("horse_name", update.horse_name);
  for (const share of shares || []) {
    await supabase.from("owner_notifications").insert({
      stable_id: stableId,
      owner_name: share.owner_name,
      horse_name: update.horse_name,
      title: update.title,
      body: update.body,
      notification_type: "Update"
    });
  }
}

function UpdatesPanel({ stableId, setToast }) {
  const config = {
    table: "updates",
    title: "Updates",
    icon: Megaphone,
    fields: [["title","Title","text"],["horse_name","Horse","horseName"],["category","Category","select",["Stable Update","Owner Update","Race Update","Vet Update","Work Update","General"]],["body","Update Message","textarea"],["photo_urls","Photos","photoUpload"],["video_urls","Videos","videoUpload"],["link_urls","Links","textarea"],["visibility","Visibility","select",["internal","owners","public-preview"]],["send_status","Send Status","select",["Draft","Ready To Send","Sent"]]],
    display: ["horse_name","category","visibility","send_status","body","photo_urls","video_urls","link_urls"]
  };
  return <GenericTable stableId={stableId} config={config} setToast={setToast} />;
}

function Analytics({ stableId, role }) {
  const [data, setData] = useState({ finance: [], work: [], races: [], horses: [] });
  useEffect(() => { if (stableId) load(); }, [stableId]);

  async function load() {
    const [finance, work, races, horses] = await Promise.all([
      financeRoles.includes(role) ? supabase.from("finance_entries").select("*").eq("stable_id", stableId) : Promise.resolve({ data: [] }),
      supabase.from("work_entries").select("*").eq("stable_id", stableId),
      supabase.from("race_records").select("*").eq("stable_id", stableId),
      supabase.from("horses").select("*").eq("stable_id", stableId)
    ]);
    setData({ finance: finance.data || [], work: work.data || [], races: races.data || [], horses: horses.data || [] });
  }

  const completed = data.races.filter(r => r.status === "Completed");
  const prizemoney = completed.reduce((sum, row) => sum + Number(row.prizemoney || 0), 0);
  const financeIncome = data.finance.filter(row => row.entry_type === "Income").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const expenses = data.finance.filter(row => row.entry_type === "Expense").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const income = financeIncome + prizemoney;
  const wins = completed.filter(row => String(row.result || "").toLowerCase().includes("1") || String(row.result || "").toLowerCase().includes("win")).length;
  const placings = completed.filter(row => ["1","1st","2","2nd","3","3rd"].includes(String(row.result || "").toLowerCase())).length;

  return <main className="page">
    <section className="module-header"><div className="module-icon"><BarChart3 size={24}/></div><h2>Analytics</h2></section>
    <section className="stats">
      {financeRoles.includes(role) && <>
        <Stat icon={DollarSign} label="Income" value={`$${income.toLocaleString()}`} />
        <Stat icon={DollarSign} label="Expenses" value={`$${expenses.toLocaleString()}`} />
        <Stat icon={BarChart3} label="Net" value={`$${(income - expenses).toLocaleString()}`} />
      </>}
      <Stat icon={ClipboardList} label="Work" value={data.work.length} />
      <Stat icon={Trophy} label="Starts" value={completed.length} />
      <Stat icon={Trophy} label="Wins" value={wins} />
      <Stat icon={Trophy} label="Placings" value={placings} />
      <Stat icon={DollarSign} label="Prizemoney" value={`$${prizemoney.toLocaleString()}`} />
    </section>
  </main>;
}

function Invoices({ stableId, setToast }) {
  const [rows, setRows] = useState([]);
  const [horses, setHorses] = useState([]);
  const [owners, setOwners] = useState([]);
  const [modal, setModal] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  useEffect(() => { if (stableId) load(); }, [stableId]);

  async function load() {
    const { data, error } = await supabase.from("invoices").select("*").eq("stable_id", stableId).order("created_at", { ascending: false });
    if (error) setToast(error.message);
    setRows(data || []);
    const horseResult = await supabase.from("horses").select("name,stable_name").eq("stable_id", stableId).order("name");
    setHorses(validHorseOptions(horseResult.data || []));
    const ownerResult = await supabase.from("owners").select("name,email,phone").eq("stable_id", stableId).order("name");
    setOwners(ownerResult.data || []);
  }

  function blank() {
    return {
      invoice_number: `INV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${String(rows.length + 1).padStart(3, "0")}`,
      client_name: "",
      client_email: "",
      client_phone: "",
      horse_name: horseDisplayName(validHorseOptions(horses)[0]) || "",
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0,10),
      status: "Draft",
      payment_status: "Unpaid",
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
      setToast("Saved");
      setModal(null);
      load();
    }
  }

  async function remove(id) {
    await supabase.from("invoices").delete().eq("id", id).eq("stable_id", stableId);
    load();
  }

  return <main className="page">
    <section className="module-header"><div className="module-icon"><FileText size={24}/></div><h2>Invoices</h2></section>
    <section className="toolbar"><button className="primary" onClick={() => setModal({ mode: "add", invoice: blank() })}><Plus size={18}/>Create Invoice</button></section>
    <section className="grid">
      {rows.map(invoice => {
        const totals = invoiceTotals(invoice);
        return <article className="record" key={invoice.id}>
          <div className="record-head">
            <div><h3>{invoice.invoice_number}</h3><p>{invoice.client_name} · {invoice.horse_name}</p></div>
            <div className="button-row">
              <button className="edit" onClick={() => setModal({ mode: "edit", invoice })}><Edit3 size={16}/></button>
              <button className="print" onClick={() => setPrintInvoice(invoice)}><Printer size={16}/></button>
              <button className="share" onClick={() => setShareModal(invoice)}><Share2 size={16}/></button>
              <button className="delete" onClick={() => remove(invoice.id)}><Trash2 size={16}/></button>
            </div>
          </div>
          <div className="details">
            <div><span>Status</span><strong>{invoice.payment_status || invoice.status}</strong></div>
            <div><span>Due</span><strong>{invoice.due_date}</strong></div>
            <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
          </div>
        </article>;
      })}
    </section>
    {modal && <InvoiceModal modal={modal} horses={horses} owners={owners} onClose={() => setModal(null)} onSave={save} />}
    {shareModal && <ShareInvoice invoice={shareModal} onClose={() => setShareModal(null)} setToast={setToast} />}
    {printInvoice && <InvoicePrint invoice={printInvoice} onClose={() => setPrintInvoice(null)} />}
  </main>;
}

function InvoiceModal({ modal, horses, owners, onClose, onSave }) {
  const [invoice, setInvoice] = useState(modal.invoice);
  const totals = invoiceTotals(invoice);

  function setField(key, value) {
    if (key === "client_name") {
      const owner = owners.find(item => item.name === value);
      setInvoice(current => ({
        ...current,
        client_name: value,
        client_email: owner?.email || current.client_email || "",
        client_phone: owner?.phone || current.client_phone || ""
      }));
      return;
    }
    setInvoice(current => ({ ...current, [key]: value }));
  }

  function setLine(id, key, value) {
    setInvoice(current => ({ ...current, line_items: (current.line_items || []).map(line => line.id === id ? { ...line, [key]: value } : line) }));
  }

  function addLine() {
    setInvoice(current => ({ ...current, line_items: [...(current.line_items || []), { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }] }));
  }

  function removeLine(id) {
    setInvoice(current => ({ ...current, line_items: (current.line_items || []).filter(line => line.id !== id) }));
  }

  return <div className="modal-backdrop">
    <section className="modal invoice-modal">
      <div className="modal-head"><h2>{modal.mode === "edit" ? "Edit" : "Create"} Invoice</h2><button onClick={onClose}><X size={20}/></button></div>
      <div className="form-grid">
        <Field label="Invoice Number"><input value={invoice.invoice_number || ""} onChange={e => setField("invoice_number", e.target.value)} /></Field>
        <Field label="Owner / Client"><select value={invoice.client_name || ""} onChange={e => setField("client_name", e.target.value)}><option value="">Select owner...</option>{owners.map(owner => <option key={owner.name} value={owner.name}>{owner.name}</option>)}</select></Field>
        <Field label="Client Email"><input value={invoice.client_email || ""} onChange={e => setField("client_email", e.target.value)} /></Field>
        <Field label="Client Phone"><input value={invoice.client_phone || ""} onChange={e => setField("client_phone", e.target.value)} /></Field>
        <Field label="Horse"><select value={invoice.horse_name || ""} onChange={event => setField("horse_name", event.target.value)}>{validHorseOptions(horses).map(horse => { const display = horseDisplayName(horse); return <option key={horse.name || horse.stable_name || display} value={display}>{display}</option>; })}</select></Field>
        <Field label="Due Date"><input type="date" value={invoice.due_date || ""} onChange={e => setField("due_date", e.target.value)} /></Field>
        <Field label="Status"><select value={invoice.status || "Draft"} onChange={e => setField("status", e.target.value)}><option>Draft</option><option>Sent</option><option>Part Paid</option><option>Paid</option><option>Overdue</option></select></Field>
        <Field label="Payment Status"><select value={invoice.payment_status || "Unpaid"} onChange={e => setField("payment_status", e.target.value)}><option>Unpaid</option><option>Part Paid</option><option>Paid</option></select></Field>
        <Field label="Notes"><textarea value={invoice.notes || ""} onChange={e => setField("notes", e.target.value)} /></Field>
      </div>
      <section className="invoice-lines">
        <div className="section-title"><h3>Line Items</h3><button className="text" onClick={addLine}>+ Add Line</button></div>
        {(invoice.line_items || []).map(line => <div className="line-item" key={line.id}>
          <input placeholder="Description" value={line.description || ""} onChange={e => setLine(line.id, "description", e.target.value)} />
          <input type="number" placeholder="Qty" value={line.quantity || 0} onChange={e => setLine(line.id, "quantity", e.target.value)} />
          <input type="number" placeholder="Unit $" value={line.unit_price || 0} onChange={e => setLine(line.id, "unit_price", e.target.value)} />
          <strong>${(Number(line.quantity || 0) * Number(line.unit_price || 0)).toFixed(2)}</strong>
          <button className="delete small" onClick={() => removeLine(line.id)}><Trash2 size={14}/></button>
        </div>)}
      </section>
      <section className="invoice-totals">
        <div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div>
        <div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div>
        <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
      </section>
      <button className="primary full" onClick={() => onSave(invoice, modal.mode)}>Save Invoice</button>
    </section>
  </div>;
}

function ShareInvoice({ invoice, onClose, setToast }) {
  const totals = invoiceTotals(invoice);
  const message = `Hi ${invoice.client_name || ""},\n\nPlease find invoice ${invoice.invoice_number} for ${invoice.horse_name}.\n\nTotal: $${totals.total.toFixed(2)}\nDue: ${invoice.due_date}`;

  async function phoneShare() {
    if (navigator.share) await navigator.share({ title: `Invoice ${invoice.invoice_number}`, text: message });
    else {
      await navigator.clipboard.writeText(message);
      setToast("Invoice copied");
    }
  }

  async function emailInvoice() {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: invoice.client_email, subject: `Invoice ${invoice.invoice_number}`, message })
    });
    setToast(response.ok ? "Email sent/demo sent" : "Email failed");
    onClose();
  }

  return <div className="modal-backdrop">
    <section className="modal">
      <div className="modal-head"><h2>Share Invoice</h2><button onClick={onClose}><X size={20}/></button></div>
      <label className="field"><span>Message</span><textarea value={message} readOnly /></label>
      <div className="button-row wide">
        <button className="primary" onClick={phoneShare}><Share2 size={18}/>Phone Share Sheet</button>
        <button className="primary" onClick={emailInvoice}><Mail size={18}/>Send Email / Demo API</button>
      </div>
    </section>
  </div>;
}

function InvoicePrint({ invoice, onClose }) {
  const totals = invoiceTotals(invoice);
  return <div className="print-backdrop">
    <section className="print-actions">
      <button className="primary" onClick={() => window.print()}><Printer size={18}/>Print / Save PDF</button>
      <button className="danger" onClick={onClose}>Close</button>
    </section>
    <main className="invoice-print">
      <header><h1>Invoice</h1><strong>{invoice.invoice_number}</strong></header>
      <p>Bill To: {invoice.client_name}</p>
      <p>Horse: {invoice.horse_name}</p>
      <table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>
        {(invoice.line_items || []).map(line => <tr key={line.id}><td>{line.description}</td><td>{line.quantity}</td><td>${Number(line.unit_price || 0).toFixed(2)}</td><td>${(Number(line.quantity || 0) * Number(line.unit_price || 0)).toFixed(2)}</td></tr>)}
      </tbody></table>
      <h2>Total: ${totals.total.toFixed(2)}</h2>
    </main>
  </div>;
}

function HorseProfile({ horse, stableId, role, onClose }) {
  const canEditOwnership = financeRoles.includes(role);
  const canManagePhotos = financeRoles.includes(role);
  const [horsePhotos, setHorsePhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [viewPhoto, setViewPhoto] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ owners: [], work: [], races: [], vet: [], farrier: [], feed: [], gear: [], invoices: [] });
  const money = value => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(value) || 0);
  const dateLabel = value => value ? String(value).slice(0, 10) : "Undated";
  const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 22, marginBottom: 16 };
  const muted = { color: "#64748b" };
  const tabs = ["Overview", "Photos", "Activity", "Performance", "Care", "Ownership", ...(canEditOwnership ? ["Finance"] : [])];

  useEffect(() => { load(); }, [horse.name, stableId, role]);
  useEffect(() => { loadHorsePhotos(); }, [horse.id]);

  async function load() {
    setLoading(true);
    const [owners, work, races, vet, farrier, feed, gear, invoices] = await Promise.all([
      supabase.from("horse_owners").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("created_at", { ascending: false }),
      supabase.from("work_entries").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("date", { ascending: false }),
      supabase.from("race_records").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("date", { ascending: false }),
      supabase.from("treatments").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("treatment_date", { ascending: false }),
      supabase.from("farrier_records").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("farrier_date", { ascending: false }),
      supabase.from("feed_programs").select("*").eq("stable_id", stableId).eq("horse_name", horse.name),
      supabase.from("gear_items").select("*").eq("stable_id", stableId).eq("horse_name", horse.name),
      canEditOwnership ? supabase.from("invoices").select("*").eq("stable_id", stableId).eq("horse_name", horse.name) : Promise.resolve({ data: [] })
    ]);
    setData({ owners: owners.data || [], work: work.data || [], races: races.data || [], vet: vet.data || [], farrier: farrier.data || [], feed: feed.data || [], gear: gear.data || [], invoices: invoices.data || [] });
    setLoading(false);
  }

  async function loadHorsePhotos() {
    setPhotosLoading(true);
    setPhotoError("");
    const { data: rows, error } = await supabase.from("horse_photos")
      .select("id,horse_id,storage_path,is_cover,caption,created_at")
      .eq("horse_id", horse.id).order("created_at", { ascending: true });
    if (error) { setPhotoError(error.message); setPhotosLoading(false); return; }
    const signed = await Promise.all((rows || []).map(async row => {
      const { data, error: urlError } = await supabase.storage.from("horse-photos")
        .createSignedUrl(row.storage_path, 3600);
      return { ...row, url: urlError ? "" : data?.signedUrl || "" };
    }));
    setHorsePhotos(signed);
    setPhotosLoading(false);
  }

  async function uploadHorsePhotos(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!canManagePhotos || !files.length || photoBusy) return;
    setPhotoBusy(true);
    setPhotoError("");
    let successful = 0;
    const errors = [];
    let makeCover = horsePhotos.length === 0;
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        errors.push(`${file.name}: use JPG, PNG or WebP.`); continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: maximum size is 10 MB.`); continue;
      }
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${horse.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("horse-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) { errors.push(`${file.name}: ${uploadError.message}`); continue; }
      const { error: recordError } = await supabase.from("horse_photos")
        .insert({ horse_id: horse.id, storage_path: path, is_cover: makeCover });
      if (recordError) {
        await supabase.storage.from("horse-photos").remove([path]);
        errors.push(`${file.name}: ${recordError.message}`);
      } else { successful++; makeCover = false; }
    }
    await loadHorsePhotos();
    setPhotoBusy(false);
    if (errors.length) setPhotoError(errors.join(" "));
    if (successful && !errors.length) setPhotoError("");
  }

  async function setCoverPhoto(photo) {
    if (!canManagePhotos || photoBusy || photo.is_cover) return;
    setPhotoBusy(true); setPhotoError("");
    const currentCover = horsePhotos.find(p => p.is_cover);
    if (currentCover) {
      const { error } = await supabase.from("horse_photos").update({ is_cover: false }).eq("id", currentCover.id).eq("horse_id", horse.id);
      if (error) { setPhotoError(error.message); setPhotoBusy(false); return; }
    }
    const { error } = await supabase.from("horse_photos").update({ is_cover: true }).eq("id", photo.id).eq("horse_id", horse.id);
    if (error) {
      if (currentCover) await supabase.from("horse_photos").update({ is_cover: true }).eq("id", currentCover.id).eq("horse_id", horse.id);
      setPhotoError(error.message);
    }
    await loadHorsePhotos(); setPhotoBusy(false);
  }

  async function deleteHorsePhoto(photo) {
    if (!canManagePhotos || photoBusy || !window.confirm("Permanently delete this photograph?")) return;
    setPhotoBusy(true); setPhotoError("");
    // Remove the storage object first so a failed storage deletion does not leave an orphaned file.
    const { error: storageError } = await supabase.storage.from("horse-photos").remove([photo.storage_path]);
    if (storageError) { setPhotoError(storageError.message); setPhotoBusy(false); return; }
    const { error } = await supabase.from("horse_photos").delete().eq("id", photo.id).eq("horse_id", horse.id);
    if (error) setPhotoError(error.message);
    else if (photo.is_cover) {
      const replacement = horsePhotos.find(p => p.id !== photo.id);
      if (replacement) {
        const { error: coverError } = await supabase.from("horse_photos").update({ is_cover: true }).eq("id", replacement.id).eq("horse_id", horse.id);
        if (coverError) setPhotoError(coverError.message);
      }
    }
    setViewPhoto(null);
    await loadHorsePhotos(); setPhotoBusy(false);
  }

  const coverPhoto = horsePhotos.find(p => p.is_cover && p.url) || horsePhotos.find(p => p.url);

  async function addOwner() {
    if (!canEditOwnership) return;
    const owner_name = prompt("Owner name");
    if (!owner_name?.trim()) return;
    const percentageInput = prompt("Percentage owned");
    if (percentageInput === null) return;
    const percentage = Number(percentageInput);
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) { alert("Enter a percentage between 0 and 100."); return; }
    const { error } = await supabase.from("horse_owners").insert({ stable_id: stableId, horse_name: horse.name, owner_name: owner_name.trim(), percentage });
    if (error) alert(error.message); else load();
  }

  async function deleteShare(id) {
    if (!canEditOwnership || !window.confirm("Remove this owner share?")) return;
    const { error } = await supabase.from("horse_owners").delete().eq("id", id).eq("stable_id", stableId);
    if (error) alert(error.message); else load();
  }

  const activity = [
    ...data.work.map(r => ({ type: "Work", date: r.date, title: r.sector || "Work session", detail: [r.distance, r.overall_time && `Overall ${r.overall_time}`, r.mile_rate && `Mile ${r.mile_rate}`, r.notes].filter(Boolean).join(" · ") })),
    ...data.races.map(r => ({ type: "Race", date: r.date, title: [r.track, r.status].filter(Boolean).join(" · ") || "Race", detail: [r.race, r.result, r.prizemoney != null && money(r.prizemoney)].filter(Boolean).join(" · ") })),
    ...data.vet.map(r => ({ type: "Vet", date: r.treatment_date, title: r.treatment_type || "Treatment", detail: r.notes || "" })),
    ...data.farrier.map(r => ({ type: "Farrier", date: r.farrier_date, title: r.service_type || "Farrier visit", detail: r.notes || "" }))
  ].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  function Empty({ text = "No records yet." }) { return <p style={{ ...muted, margin: "12px 0" }}>{text}</p>; }
  function Section({ title, children }) { return <section style={card}><h3 style={{ margin: "0 0 16px", fontSize: 18 }}>{title}</h3>{children}</section>; }
  function Rows({ rows, render }) { return rows.length ? <div style={{ display: "grid", gap: 10 }}>{rows.map((r, i) => <div key={r.id || i} style={{ padding: "12px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>{render(r)}</div>)}</div> : <Empty />; }
  function Detail({ label, value }) { return <div><div style={{ ...muted, fontSize: 12, marginBottom: 4 }}>{label}</div><strong>{value || "—"}</strong></div>; }

  return <main className="page" style={{ maxWidth: 1180, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
    <button className="ghost" onClick={onClose} style={{ marginBottom: 18 }}>← Back to Horses</button>
    <section style={{ ...card, display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center" }}>
      {(coverPhoto?.url || horse.profile_photo_url) ? <img src={coverPhoto?.url || horse.profile_photo_url} alt={horse.name} style={{ width: 128, height: 128, objectFit: "cover", borderRadius: 16 }} /> : <div style={{ width: 128, height: 128, borderRadius: 16, background: "#edf2f7", display: "grid", placeItems: "center", flexShrink: 0 }}><HorseIcon size={65}/></div>}
      <div style={{ flex: 1, minWidth: 220 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px, 4vw, 38px)" }}>{horse.name}</h1>
        <p style={{ ...muted, margin: "0 0 12px" }}>{[horse.stable_name && `Stable name: ${horse.stable_name}`, horse.age && `${horse.age}yo`, horse.sex].filter(Boolean).join(" · ")}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span style={{ background: "#e9f7ee", color: "#176b38", borderRadius: 99, padding: "5px 12px", fontSize: 13, fontWeight: 700 }}>{horse.status || "Status not set"}</span>{horse.trainer && <span style={{ background: "#f1f5f9", borderRadius: 99, padding: "5px 12px", fontSize: 13 }}>Trainer: {horse.trainer}</span>}</div>
      </div>
    </section>
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 8 }}>
      {tabs.map(t => <button key={t} className={tab === t ? "primary" : "ghost"} onClick={() => setTab(t)} style={{ flexShrink: 0 }}>{t}</button>)}
    </div>
    {loading ? <section style={card}>Loading horse records…</section> : <>
      {tab === "Overview" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
          {[["Work sessions", data.work.length], ["Race records", data.races.length], ["Owners", data.owners.length], ["Recent activities", activity.length]].map(([label, value]) => <div key={label} style={{ ...card, marginBottom: 0 }}><div style={{ ...muted, fontSize: 13 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 5 }}>{value}</div></div>)}
        </div>
        <Section title="Horse details"><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 }}><Detail label="Stable name" value={horse.stable_name}/><Detail label="Sire" value={horse.sire}/><Detail label="Dam" value={horse.mare}/><Detail label="Age" value={horse.age}/><Detail label="Sex" value={horse.sex}/><Detail label="Trainer" value={horse.trainer}/><Detail label="Current status" value={horse.current_status}/><Detail label="Next target" value={horse.next_target}/></div>{horse.notes && <p style={{ marginBottom: 0 }}>{horse.notes}</p>}</Section>
        <Section title="Recent activity"><Rows rows={activity.slice(0, 6)} render={r => <><strong>{r.title}</strong><div style={{ ...muted, fontSize: 13, marginTop: 4 }}>{dateLabel(r.date)} · {r.type}{r.detail && ` · ${r.detail}`}</div></>}/></Section>
      </>}
      {tab === "Photos" && <Section title="Horse photo gallery">
        {canManagePhotos && <div style={{ marginBottom: 18 }}>
          <label className="primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: photoBusy ? "wait" : "pointer", padding: "10px 16px", borderRadius: 10 }}>
            <Plus size={17}/> {photoBusy ? "Working…" : "Upload photos"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={photoBusy} onChange={uploadHorsePhotos} style={{ display: "none" }}/>
          </label>
          <p style={{ ...muted, fontSize: 13 }}>JPG, PNG or WebP · up to 10 MB per photo · select multiple files at once.</p>
        </div>}
        {photoError && <p role="alert" style={{ color: "#b91c1c", overflowWrap: "anywhere" }}>{photoError}</p>}
        {photosLoading ? <p>Loading photos…</p> : horsePhotos.length === 0 ? <Empty text="No photographs uploaded yet." /> :
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {horsePhotos.map(photo => <article key={photo.id} style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", background: "#f8fafc" }}>
              <button type="button" onClick={() => photo.url && setViewPhoto(photo)} aria-label="View photo full size" style={{ display: "block", width: "100%", padding: 0, border: 0, background: "#e2e8f0", cursor: "pointer" }}>
                {photo.url ? <img src={photo.url} alt={`${horse.name} gallery`} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} /> : <div style={{ padding: 35 }}>Image unavailable</div>}
              </button>
              <div style={{ padding: 12, display: "grid", gap: 8 }}>
                <strong style={{ fontSize: 13 }}>{photo.is_cover ? "★ Cover photo" : "Horse photo"}</strong>
                {canManagePhotos && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {!photo.is_cover && <button className="ghost" type="button" disabled={photoBusy} onClick={() => setCoverPhoto(photo)} style={{ fontSize: 12 }}>Set as cover</button>}
                  <button className="delete small" type="button" disabled={photoBusy} onClick={() => deleteHorsePhoto(photo)} aria-label="Delete photo"><Trash2 size={15}/></button>
                </div>}
              </div>
            </article>)}
          </div>}
        {viewPhoto?.url && <div role="dialog" aria-modal="true" aria-label="Horse photograph" onClick={() => setViewPhoto(null)} style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.88)", display: "grid", placeItems: "center", padding: 24 }}>
          <button type="button" onClick={() => setViewPhoto(null)} aria-label="Close photograph" style={{ position: "absolute", right: 20, top: 20, background: "white", borderRadius: 10, padding: 8 }}><X size={22}/></button>
          <img src={viewPhoto.url} alt={horse.name} onClick={e => e.stopPropagation()} style={{ maxWidth: "95vw", maxHeight: "88vh", objectFit: "contain" }}/>
        </div>}
      </Section>}
      {tab === "Activity" && <Section title="Activity timeline"><Rows rows={activity} render={r => <><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong>{r.title}</strong><span style={{ ...muted, fontSize: 13 }}>{dateLabel(r.date)} · {r.type}</span></div>{r.detail && <div style={{ ...muted, marginTop: 6 }}>{r.detail}</div>}</>}/></Section>}
      {tab === "Performance" && <>
        <Section title="Race history"><Rows rows={data.races} render={r => <><strong>{dateLabel(r.date)} · {r.track || "Race"}</strong><p style={{ margin: "5px 0", ...muted }}>{[r.race, r.status, r.result].filter(Boolean).join(" · ")}</p><strong>{money(r.prizemoney)}</strong>{r.replay_url && <p><a href={r.replay_url} target="_blank" rel="noopener noreferrer">Watch replay ↗</a></p>}</>}/></Section>
        <Section title="Trackwork and sectionals"><Rows rows={data.work} render={r => <><strong>{dateLabel(r.date)} · {r.sector || "Work"}</strong><p style={{ margin: "5px 0", ...muted }}>{[r.distance, r.driver && `Driver: ${r.driver}`, r.overall_time && `Overall: ${r.overall_time}`, r.mile_rate && `Mile: ${r.mile_rate}`, r.last_half && `Last half: ${r.last_half}`, r.last_quarter && `Last quarter: ${r.last_quarter}`].filter(Boolean).join(" · ")}</p>{r.notes && <p style={{ marginBottom: 0 }}>{r.notes}</p>}</>}/></Section>
      </>}
      {tab === "Care" && <>
        <Section title="Veterinary"><Rows rows={data.vet} render={r => <><strong>{dateLabel(r.treatment_date)} · {r.treatment_type || "Treatment"}</strong><div style={muted}>{r.notes || ""}</div></>}/></Section>
        <Section title="Farrier"><Rows rows={data.farrier} render={r => <><strong>{dateLabel(r.farrier_date)} · {r.service_type || "Farrier visit"}</strong><div style={muted}>{r.notes || ""}</div></>}/></Section>
        <Section title="Feed"><Rows rows={data.feed} render={r => <><strong>{r.morning_feed || r.night_feed || "Feed programme"}</strong><div style={muted}>{[r.night_feed && `Night: ${r.night_feed}`, r.supplements].filter(Boolean).join(" · ")}</div></>}/></Section>
        <Section title="Gear"><Rows rows={data.gear} render={r => <><strong>{r.item_name || "Gear"}</strong><div style={muted}>{[r.category, r.condition].filter(Boolean).join(" · ")}</div></>}/></Section>
      </>}
      {tab === "Ownership" && <Section title="Ownership register">{canEditOwnership && <button className="primary" onClick={addOwner} style={{ marginBottom: 14 }}><Plus size={16}/> Add owner share</button>}<Rows rows={data.owners} render={r => <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ flex: 1 }}>{r.owner_name}</span><strong>{r.percentage}%</strong>{canEditOwnership && <button className="delete small" onClick={() => deleteShare(r.id)} aria-label={`Remove ${r.owner_name}`}><Trash2 size={14}/></button>}</div>}/></Section>}
      {tab === "Finance" && canEditOwnership && <Section title="Invoices"><Rows rows={data.invoices} render={r => <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{r.invoice_number || "Invoice"}</strong><strong>{money(r.total)}</strong></div>}/></Section>}
    </>}
  </main>;
}

function OwnerProfile({ owner, stableId, role, onClose }) {
  const [shares, setShares] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [updates, setUpdates] = useState([]);

  useEffect(() => { load(); }, [owner.name]);

  async function load() {
    const shareResult = await supabase.from("horse_owners").select("*").eq("stable_id", stableId).eq("owner_name", owner.name);
    const nextShares = shareResult.data || [];
    setShares(nextShares);
    const horseNames = nextShares.map(row => row.horse_name);
    if (horseNames.length) {
      const updateResult = await supabase.from("updates").select("*").eq("stable_id", stableId).in("horse_name", horseNames);
      setUpdates(updateResult.data || []);
    }
    if (financeRoles.includes(role)) {
      const invoiceResult = await supabase.from("invoices").select("*").eq("stable_id", stableId).eq("client_name", owner.name);
      setInvoices(invoiceResult.data || []);
    } else setInvoices([]);
  }

  return <div className="modal-backdrop">
    <section className="modal">
      <div className="modal-head"><h2>{owner.name}</h2><button onClick={onClose}><X size={20}/></button></div>
      <ProfileSection title="Horses Owned">{shares.map(row => <SimpleRow key={row.id} left={row.horse_name} right={`${row.percentage}%`} />)}</ProfileSection>
      {financeRoles.includes(role) && <ProfileSection title="Invoices">{invoices.map(row => <SimpleRow key={row.id} left={row.invoice_number} right={`$${row.total || 0}`} />)}</ProfileSection>}
      <ProfileSection title="Updates Received">{updates.map(row => <SimpleRow key={row.id} left={row.title} right={row.horse_name} />)}</ProfileSection>
    </section>
  </div>;
}

function OwnerHome({ profile, setTab }) {
  return <main className="page">
    <section className="hero-panel"><div><p className="eyebrow dark-text">Owners Portal</p><h2>Welcome, {profile.owner_name || profile.full_name}</h2></div></section>
    <section className="quick-grid">
      {[["Horses","ownerHorses"],["Updates","ownerUpdates"],["Calendar","ownerCalendar"],["Bills","ownerInvoices"]].map(([label, key]) => <button className="quick" onClick={() => setTab(key)} key={key}>{label}<ChevronRight size={18}/></button>)}
    </section>
  </main>;
}

function useOwnerData(profile) {
  const [state, setState] = useState({ horses: [], updates: [], invoices: [], events: [] });
  useEffect(() => { if (profile?.stable_id) load(); }, [profile?.stable_id, profile?.owner_name]);

  async function load() {
    const { data: shares } = await supabase.from("horse_owners").select("*").eq("stable_id", profile.stable_id).eq("owner_name", profile.owner_name || profile.full_name);
    const horseNames = (shares || []).map(row => row.horse_name);
    const [horses, updates, invoices, races, work, vet, farrier] = await Promise.all([
      horseNames.length ? supabase.from("horses").select("*").eq("stable_id", profile.stable_id).in("name", horseNames) : { data: [] },
      horseNames.length ? supabase.from("updates").select("*").eq("stable_id", profile.stable_id).in("horse_name", horseNames).in("visibility", ["owners", "public-preview"]).order("created_at", { ascending: false }) : { data: [] },
      supabase.from("invoices").select("*").eq("stable_id", profile.stable_id).eq("client_name", profile.owner_name || profile.full_name),
      horseNames.length ? supabase.from("race_records").select("*").eq("stable_id", profile.stable_id).in("horse_name", horseNames) : { data: [] },
      horseNames.length ? supabase.from("work_entries").select("*").eq("stable_id", profile.stable_id).in("horse_name", horseNames) : { data: [] },
      horseNames.length ? supabase.from("treatments").select("*").eq("stable_id", profile.stable_id).in("horse_name", horseNames) : { data: [] },
      horseNames.length ? supabase.from("farrier_records").select("*").eq("stable_id", profile.stable_id).in("horse_name", horseNames) : { data: [] }
    ]);
    setState({
      horses: (horses.data || []).map(horse => ({ ...horse, percentage: (shares || []).find(share => share.horse_name === horse.name)?.percentage || 0 })),
      updates: updates.data || [],
      invoices: invoices.data || [],
      events: [
        ...(races.data || []).map(row => ({ ...row, date: row.date, type: "Race" })),
        ...(work.data || []).map(row => ({ ...row, date: row.date, type: "Work" })),
        ...(vet.data || []).map(row => ({ ...row, date: row.treatment_date, type: "Vet" })),
        ...(farrier.data || []).map(row => ({ ...row, date: row.farrier_date, type: "Farrier" }))
      ].filter(row => row.date)
    });
  }

  return state;
}

function OwnerHorses({ profile }) {
  const { horses } = useOwnerData(profile);
  const [selectedHorse, setSelectedHorse] = useState(null);

  return <main className="page">
    <section className="grid">
      {horses.map(horse => <article className="record clickable" key={horse.name} onClick={() => setSelectedHorse(horse)}>
        <div className="record-head">
          <div>
            <h3>{horse.name}</h3>
            <p>{horse.percentage}% owned</p>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="details">
          <div><span>Status</span><strong>{horse.status || horse.current_status || "-"}</strong></div>
          <div><span>Age</span><strong>{horse.age || "-"}</strong></div>
          <div><span>Sex</span><strong>{horse.sex || "-"}</strong></div>
          <div><span>Sire</span><strong>{horse.sire || "-"}</strong></div>
          <div><span>Mare</span><strong>{horse.mare || "-"}</strong></div>
          <div><span>Trainer</span><strong>{horse.trainer || "-"}</strong></div>
          <div><span>Next Target</span><strong>{horse.next_target || "-"}</strong></div>
        </div>
      </article>)}
    </section>
    {selectedHorse && <OwnerHorseDetail horse={selectedHorse} profile={profile} onClose={() => setSelectedHorse(null)} />}
  </main>;
}


function OwnerHorseDetail({ horse, profile, onClose }) {
  const [data, setData] = useState({ work: [], races: [], vet: [], farrier: [], feed: [], gear: [], updates: [], invoices: [] });

  useEffect(() => { load(); }, [horse.name]);

  async function load() {
    const [work, races, vet, farrier, feed, gear, updates, invoices] = await Promise.all([
      supabase.from("work_entries").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name).order("date", { ascending: false }),
      supabase.from("race_records").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name).order("date", { ascending: false }),
      supabase.from("treatments").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name).order("treatment_date", { ascending: false }),
      supabase.from("farrier_records").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name).order("farrier_date", { ascending: false }),
      supabase.from("feed_programs").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name),
      supabase.from("gear_items").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name),
      supabase.from("updates").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name).in("visibility", ["owners", "public-preview"]).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("stable_id", profile.stable_id).eq("horse_name", horse.name).eq("client_name", profile.owner_name || profile.full_name)
    ]);

    setData({
      work: work.data || [],
      races: races.data || [],
      vet: vet.data || [],
      farrier: farrier.data || [],
      feed: feed.data || [],
      gear: gear.data || [],
      updates: updates.data || [],
      invoices: invoices.data || []
    });
  }

  return <div className="modal-backdrop">
    <section className="modal profile-modal owner-horse-detail">
      <div className="modal-head">
        <div>
          <p className="eyebrow dark-text">Horse Profile</p>
          <h2>{horse.name}</h2>
        </div>
        <button onClick={onClose}><X size={20}/></button>
      </div>

      <section className="owner-horse-summary">
        {horse.profile_photo_url && <img src={horse.profile_photo_url} alt={horse.name} />}
        <div className="owner-horse-basic-grid">
          <div><span>Ownership</span><strong>{horse.percentage}%</strong></div>
          <div><span>Stable Name</span><strong>{horse.stable_name || "-"}</strong></div>
          <div><span>Age</span><strong>{horse.age || "-"}</strong></div>
          <div><span>Sex</span><strong>{horse.sex || "-"}</strong></div>
          <div><span>Sire</span><strong>{horse.sire || "-"}</strong></div>
          <div><span>Mare</span><strong>{horse.mare || "-"}</strong></div>
          <div><span>Trainer</span><strong>{horse.trainer || "-"}</strong></div>
          <div><span>Status</span><strong>{horse.status || horse.current_status || "-"}</strong></div>
          <div><span>Next Target</span><strong>{horse.next_target || "-"}</strong></div>
        </div>
      </section>

      {horse.notes && <ProfileSection title="Notes"><p className="owner-horse-notes">{horse.notes}</p></ProfileSection>}

      <ProfileSection title="Recent Work">
        <CollapsibleList rows={data.work} threshold={6} render={row => <SimpleRow key={row.id} left={`${row.date || "-"} · ${row.sector || "Work"}`} right={`Overall: ${row.overall_time || "-"} · Mile: ${row.mile_rate || "-"}`} />} />
      </ProfileSection>

      <ProfileSection title="Races">
        <CollapsibleList rows={data.races} threshold={6} render={row => <SimpleRow key={row.id} left={`${row.date || "-"} · ${row.track || ""} · ${row.status || ""}`} right={row.result || (row.prizemoney ? `$${row.prizemoney}` : "-")} />} />
      </ProfileSection>

      <ProfileSection title="Updates">
        <CollapsibleList rows={data.updates} threshold={4} render={update => <article className="owner-update-card" key={update.id}>
          <p className="owner-update-horse">{update.horse_name}</p>
          <h3>{update.title || "Stable Update"}</h3>
          <p>{update.body}</p>
          <UpdateMedia update={update} />
        </article>} />
      </ProfileSection>

      <ProfileSection title="Vet">
        <CollapsibleList rows={data.vet} threshold={5} render={row => <SimpleRow key={row.id} left={`${row.treatment_date || "-"} · ${row.treatment_type || "Treatment"}`} right={row.follow_up_date ? `Follow-up: ${row.follow_up_date}` : ""} />} />
      </ProfileSection>

      <ProfileSection title="Farrier">
        <CollapsibleList rows={data.farrier} threshold={5} render={row => <SimpleRow key={row.id} left={`${row.farrier_date || "-"} · ${row.service_type || "Farrier"}`} right={row.next_due_date ? `Next due: ${row.next_due_date}` : ""} />} />
      </ProfileSection>

      <ProfileSection title="Feed">
        <CollapsibleList rows={data.feed} threshold={3} render={row => <SimpleRow key={row.id} left={row.morning_feed || row.night_feed || "Feed record"} right={row.supplements || ""} />} />
      </ProfileSection>

      <ProfileSection title="Gear">
        <CollapsibleList rows={data.gear} threshold={5} render={row => <SimpleRow key={row.id} left={`${row.item_name || "Gear"} · ${row.category || ""}`} right={row.condition || ""} />} />
      </ProfileSection>

      <ProfileSection title="Bills">
        <CollapsibleList rows={data.invoices} threshold={5} render={row => <SimpleRow key={row.id} left={row.invoice_number || "Invoice"} right={`$${Number(row.total || 0).toFixed(2)}`} />} />
      </ProfileSection>
    </section>
  </div>;
}


function OwnerUpdates({ profile }) {
  const { updates } = useOwnerData(profile);
  return <main className="page">
    <section className="grid">
      {updates.map(update => <article className="record owner-update-card" key={update.id}>
        <p className="owner-update-horse">{update.horse_name || "Stable Update"}</p>
        <h3>{update.title || "Update"}</h3>
        <p>{update.body}</p>
        <UpdateMedia update={update}/>
      </article>)}
    </section>
  </main>;
}

function OwnerCalendar({ profile }) {
  const { events } = useOwnerData(profile);
  return <main className="page"><PhoneCalendar rows={events} dateField="date" selectedDate="" setSelectedDate={() => {}} title="Owner" /></main>;
}

function OwnerInvoices({ profile }) {
  const { invoices } = useOwnerData(profile);
  return <main className="page"><section className="grid">{invoices.map(invoice => <article className="record" key={invoice.id}><h3>{invoice.invoice_number}</h3><p>{invoice.horse_name} · ${invoice.total}</p><p>{invoice.payment_status || invoice.status}</p></article>)}</section></main>;
}

function PhoneCalendar({ rows, dateField, selectedDate, setSelectedDate, title }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [openDay, setOpenDay] = useState("");
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = [];
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);

  function recordsFor(iso) {
    return rows.filter(row => row[dateField] === iso);
  }

  function pick(date) {
    const iso = toIso(date);
    setSelectedDate(iso);
    setOpenDay(iso);
  }

  return <section className="phone-calendar-wrap">
    <div className="phone-calendar-shell">
      <div className="phone-calendar-top">
        <button className="calendar-round" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
        <div><h3>{cursor.toLocaleString("en-AU", { month: "long", year: "numeric" })}</h3><p>{title} calendar</p></div>
        <button className="calendar-round" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="phone-calendar-actions">
        <button className="ghost" onClick={() => pick(today)}>Today</button>
        <button className="ghost" onClick={() => { setSelectedDate(""); setOpenDay(""); }}>Show All</button>
      </div>
      <div className="phone-weekdays">{["M","T","W","T","F","S","S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="phone-calendar-grid">{cells.map((date, index) => {
        const iso = date ? toIso(date) : "";
        const count = date ? recordsFor(iso).length : 0;
        return <button key={index} disabled={!date} className={`${selectedDate === iso ? "selected" : ""} ${count ? "has-records" : ""} ${iso === toIso(today) ? "today" : ""}`} onClick={() => date && pick(date)}>
          {date && <strong>{date.getDate()}</strong>}
          {count > 0 && <small>{count}</small>}
        </button>;
      })}</div>
    </div>
    <div className="calendar-day-panel">
      <h3>{openDay ? formatDate(openDay) : "Select a date"}</h3>
      <div className="day-records">
        {openDay && recordsFor(openDay).map((row, index) => <article className="day-record" key={row.id || index}><strong>{row.horse_name || row.name || row.title || "Record"}</strong><span>{row.type || row.sector || row.status || row.treatment_type || row.service_type || row.category || ""}</span></article>)}
        {openDay && !recordsFor(openDay).length && <p className="empty">No records.</p>}
      </div>
    </div>
  </section>;
}

function RecordModal({ title, fields, record, horses, owners, stableId, onClose, onSave }) {
  const [form, setForm] = useState(record);
  return <div className="modal-backdrop">
    <section className="modal">
      <div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={20}/></button></div>
      <div className="form-grid">
        {fields.filter(([_key, _label, type]) => type !== "conditionalWarmup" || WARMUP_SECTORS.includes(form.sector)).map(([key, label, type, options]) => <Field key={key} label={label}>
          <Input type={type} value={form[key] ?? ""} options={options} horses={horses} owners={owners} stableId={stableId} onChange={value => setForm(current => ({ ...current, [key]: value }))} />
        </Field>)}
      </div>
      <button className="primary full" onClick={() => onSave(form)}>Save</button>
    </section>
  </div>;
}

function UpdateMedia({ update }) {
  return <div className="media-preview">
    {splitLines(update.photo_urls).map(url => <a href={url} target="_blank" rel="noreferrer" key={url}><img src={url} /></a>)}
    {splitLines(update.video_urls).map((url, index) => <a className="media-pill" href={url} target="_blank" rel="noreferrer" key={url}>Video {index + 1}</a>)}
    {splitLines(update.link_urls).map((url, index) => <a className="media-pill" href={url} target="_blank" rel="noreferrer" key={url}>Link {index + 1}</a>)}
  </div>;
}


function MediaUploadInput({ value, stableId, accept, kind, onChange }) {
  const [uploading, setUploading] = useState(false);
  const urls = splitLines(value);

  async function uploadFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${stableId || "stable"}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("update-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (error) {
        alert(error.message || "Upload failed");
        continue;
      }

      const { data } = supabase.storage.from("update-media").getPublicUrl(path);
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }

    const next = [...urls, ...uploadedUrls].join("\n");
    onChange(next);
    setUploading(false);
    event.target.value = "";
  }

  function removeUrl(url) {
    onChange(urls.filter(item => item !== url).join("\n"));
  }

  return <div className="media-upload-box">
    <label className="upload-button">
      {uploading ? "Uploading..." : `Upload ${kind === "photo" ? "photos" : "videos"}`}
      <input type="file" accept={accept} multiple onChange={uploadFiles} disabled={uploading} />
    </label>
    <textarea
      value={value || ""}
      onChange={event => onChange(event.target.value)}
      placeholder={`Uploaded ${kind} URLs will appear here. You can also paste URLs manually.`}
    />
    {!!urls.length && <div className="uploaded-media-list">
      {urls.map(url => <div key={url} className="uploaded-media-item">
        <span>{url}</span>
        <button type="button" onClick={() => removeUrl(url)}>Remove</button>
      </div>)}
    </div>}
  </div>;
}


function SimpleRow({ left, right }) {
  return <div className="profile-row"><span>{left}</span><strong>{right}</strong></div>;
}

function ProfileSection({ title, children }) {
  return <section className="profile-section"><h3>{title}</h3>{children}</section>;
}


function CollapsibleList({ rows, threshold = 8, render }) {
  const [expanded, setExpanded] = useState(false);
  const safeRows = rows || [];
  const visible = expanded ? safeRows : safeRows.slice(0, threshold);
  return <>
    {visible.map(render)}
    {safeRows.length > threshold && <button className="text show-more" onClick={() => setExpanded(!expanded)}>
      {expanded ? "Show less" : `Show all ${safeRows.length}`}
    </button>}
  </>;
}

function CollapsibleRecords({ rows, threshold = 12, render }) {
  const [expanded, setExpanded] = useState(false);
  const safeRows = rows || [];
  const visible = expanded ? safeRows : safeRows.slice(0, threshold);
  return <>
    {visible.map(render)}
    {safeRows.length > threshold && <article className="record show-more-card">
      <button className="primary full" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Minimise entries" : `Show all ${safeRows.length} entries`}
      </button>
    </article>}
  </>;
}

function Input({ type, value, options, horses, owners, stableId, onChange }) {
  if (type === "photoUpload") return <MediaUploadInput value={value} stableId={stableId} accept="image/*" kind="photo" onChange={onChange} />;
  if (type === "videoUpload") return <MediaUploadInput value={value} stableId={stableId} accept="video/*" kind="video" onChange={onChange} />;
  if (type === "textarea" || type === "conditionalWarmup") return <textarea value={value} onChange={event => onChange(event.target.value)} />;
  if (type === "select") return <select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select>;
  if (type === "horseName") { const options = validHorseOptions(horses); return <select value={value} onChange={event => onChange(event.target.value)}>{options.length ? options.map(horse => { const display = horseDisplayName(horse); return <option key={horse.id || horse.name || horse.stable_name || display} value={display}>{display}</option>; }) : <option value="">No horses added yet</option>}</select>; }
  if (type === "ownerName") return <select value={value} onChange={event => onChange(event.target.value)}>{owners.map(owner => <option key={owner.name}>{owner.name}</option>)}</select>;
  return <input type={type} value={value} onChange={event => onChange(event.target.value)} />;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function NavButton({ active, onClick, icon: Icon, label }) {
  return <button className={active ? "active" : ""} onClick={onClick}><Icon size={15}/>{label}</button>;
}

function Stat({ icon: Icon, label, value }) {
  return <section className="stat"><div><Icon size={22}/></div><p>{label}</p><strong>{value}</strong></section>;
}

function invoiceTotals(invoice) {
  const subtotal = (invoice.line_items || []).reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_price || 0), 0);
  const gst = subtotal * GST_RATE;
  return { subtotal, gst, total: subtotal + gst };
}

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function splitLines(value) {
  return String(value || "").split(/\n|,/).map(item => item.trim()).filter(Boolean);
}


function horseDisplayName(horse) {
  if (!horse) return "";
  if (typeof horse === "string") return horse.trim();
  const registeredName = String(horse.name || "").trim();
  const stableName = String(horse.stable_name || "").trim();
  return registeredName || stableName || "";
}

function validHorseOptions(horses) {
  return (horses || []).filter(horse => horseDisplayName(horse));
}

function labelize(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatValue(value) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

createRoot(document.getElementById("root")).render(<App />);
