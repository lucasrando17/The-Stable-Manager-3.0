// COMPLETE FINAL REBUILD V13

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck, BarChart3, Calendar, ChevronRight, ClipboardList, CreditCard,
  DollarSign, Edit3, FileText, HeartPulse, Home, LogOut, Mail, Megaphone,
  Package, Plus, Printer, Search, Settings, Share2, ShieldCheck, Trash2, Trophy,
  Users, Wheat, X
} from "lucide-react";
import "./styles.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const GST_RATE = 0.1;
const photos = ["/login-photos/photo-1.jpg", "/login-photos/photo-2.jpg", "/login-photos/photo-3.jpg", "/login-photos/photo-4.jpg"];

const WORK_SECTORS = ["Jog - Cart", "Jog- Lead", "Jog- Jogger Machine", "Jog/Canter", "Gallop", "Trot", "Hopple", "Walking Machine", "Water Walk", "Race", "Trial", "Educational Trial", "Swim", "Beach Work", "Recovery"];
const WARMUP_SECTORS = ["Jog/Canter", "Gallop", "Trot", "Hopple"];

const stableRoles = ["admin", "trainer", "staff"];
const financeRoles = ["admin", "trainer"];

const moduleDefs = {
  horses: {
    table: "horses", title: "Horses", icon: BadgeCheck, profile: "horse",
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
    table: "farrier_records", title: "Farrier", icon: Package, calendarField: "farrier_date",
    fields: [["farrier_date","Date","date"],["horse_name","Horse","horseName"],["farrier_name","Farrier","text"],["service_type","Service","select",["Full Set","Fronts","Hinds","Trim","Reset","Bar Shoes","Pads","Glue Ons","Other"]],["shoeing_notes","Shoeing Notes","textarea"],["bill_amount","Bill Amount","number"],["bill_to_owners","Add to owner invoices?","select",["No","Yes"]],["next_due_date","Next Due Date","date"],["notes","Notes","textarea"]],
    display: ["farrier_date","horse_name","farrier_name","service_type","bill_amount","bill_to_owners","next_due_date"]
  },
  feed: {
    table: "feed_programs", title: "Feed", icon: Wheat,
    fields: [["horse_name","Horse","horseName"],["morning_feed","Morning Feed","textarea"],["lunch_feed","Lunch Feed","textarea"],["night_feed","Night Feed","textarea"],["supplements","Supplements","textarea"],["notes","Notes","textarea"]],
    display: ["horse_name","morning_feed","lunch_feed","night_feed","supplements"]
  },
  gear: {
    table: "gear_items", title: "Gear", icon: Package,
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
  }, [session?.user?.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadProfile() {
    const { data, error } = await supabase.from("profiles").select("*, stables(*)").eq("id", session.user.id).maybeSingle();

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
  if (!session) return <Landing setEntry={setEntry} />;

  if (!profile) {
    return <main className="page"><section className="card"><h2>Loading profile...</h2><p>Please wait while your account is checked.</p></section></main>;
  }

  if (!profile.stable_id) {
    return <CreateStableOnboarding session={session} setProfile={setProfile} setStable={setStable} setToast={setToast} />;
  }

  return <div className="app">
    {toast && <div className="toast">{toast}</div>}
    <header className="topbar">
      <div>
        <p>{profile.role === "owner" ? "Owners Portal" : "Stable App"}</p>
        <h1>{profile.role === "owner" ? profile.owner_name || profile.full_name : stable?.name || "Stable"}</h1>
      </div>
      <button className="ghost" onClick={() => supabase.auth.signOut()}><LogOut size={18}/>Logout</button>
    </header>
    {profile.role === "owner" || loginMode === "owner"
      ? <OwnerApp profile={profile} tab={tab} setTab={setTab} setToast={setToast} stable={stable} setStable={setStable} setProfile={setProfile} />
      : <StableApp profile={profile} tab={tab} setTab={setTab} setToast={setToast} stable={stable} setStable={setStable} setProfile={setProfile} />}
  </div>;
}



function CreateStableOnboarding({ session, setProfile, setStable, setToast }) {
  const [stableName, setStableName] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("admin");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  async function createStable(event) {
    event.preventDefault();

    if (!stableName.trim()) {
      setToast("Enter your stable name.");
      return;
    }

    if (!fullName.trim()) {
      setToast("Enter your name.");
      return;
    }

    setSaving(true);

    const { data: stableRow, error: stableError } = await supabase
      .from("stables")
      .insert({ name: stableName.trim() })
      .select()
      .single();

    if (stableError) {
      setSaving(false);
      setToast(stableError.message);
      return;
    }

    const profilePayload = {
      id: session.user.id,
      stable_id: stableRow.id,
      role,
      full_name: fullName.trim(),
      owner_name: fullName.trim()
    };

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload)
      .select("*, stables(*)")
      .single();

    if (profileError) {
      setSaving(false);
      setToast(profileError.message);
      return;
    }

    setProfile(profileRow);
    setStable(stableRow);
    setToast("Stable created.");
    setSaving(false);
  }

  return <main className="onboarding-screen">
    <PhotoReel />
    <section className="onboarding-card">
      <p className="eyebrow">Welcome to The Trotting Stable App</p>
      <h1>Create your stable</h1>
      <p className="onboarding-lead">
        Set up your stable first. Once this is complete, you can add horses, owners, staff, work entries, invoices and updates.
      </p>

      <div className="onboarding-steps">
        <button className={step === 1 ? "active" : ""} onClick={() => setStep(1)}>1. Stable</button>
        <button className={step === 2 ? "active" : ""} onClick={() => setStep(2)}>2. What comes next</button>
      </div>

      {step === 1 && <form className="form-grid" onSubmit={createStable}>
        <label className="field">
          <span>Stable Name</span>
          <input value={stableName} onChange={e => setStableName(e.target.value)} placeholder="Example: Rando Racing" />
        </label>

        <label className="field">
          <span>Your Name</span>
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Example: Lucas Rando" />
        </label>

        <label className="field">
          <span>Your Role</span>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin / Head Trainer</option>
            <option value="trainer">Trainer</option>
            <option value="staff">Staff</option>
          </select>
        </label>

        <button className="primary full" disabled={saving}>{saving ? "Creating stable..." : "Create Stable"}</button>
      </form>}

      {step === 2 && <section className="next-steps-grid">
        <article><strong>Add horses</strong><span>Create horse profiles with age, sex, trainer, status and targets.</span></article>
        <article><strong>Add owners</strong><span>Create owner records and assign ownership percentages.</span></article>
        <article><strong>Invite users</strong><span>Invite staff, drivers, owners or guests once team invites are enabled.</span></article>
        <article><strong>Start recording</strong><span>Use work, racing, vet, farrier, feed, gear, invoices and updates.</span></article>
      </section>}

      <button className="text onboarding-logout" onClick={() => supabase.auth.signOut()}>Log out</button>
    </section>
  </main>;
}


function PasswordResetForm({ onDone, setToast }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
        <label>New Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label>Confirm New Password<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
        <button className="primary full">Update Password</button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </section>
  </main>;
}


function Landing({ setEntry }) {
  return <main className="landing">
    <PhotoReel />
    <header className="landing-nav">
      <strong>The Trotting Stable App</strong>
      <div>
        <button className="ghost dark" onClick={() => setEntry("stableLogin")}>Stable Login</button>
        <button className="ghost dark" onClick={() => setEntry("ownerLogin")}>Owners Portal</button>
        <button className="primary light" onClick={() => setEntry("invite")}>Join With Invite Code</button>
      </div>
    </header>
    <section className="hero">
      <p className="eyebrow">Harness racing stable software</p>
      <h1>Stable operations and owner communication in one platform.</h1>
      <p>Separate access points for trainers/staff and owners, with role-based permissions and a proper owners portal.</p>
      <div className="hero-actions">
        <button className="primary light" onClick={() => setEntry("stableLogin")}>Stable Login</button>
        <button className="ghost dark" onClick={() => setEntry("ownerLogin")}>Owners Portal</button>
      </div>
    </section>
    <section className="feature-grid">
      {["Stable Operations","Owners Portal","Phone Calendar","Invoices","Analytics","Media Updates"].map(x => <article className="feature-card" key={x}><h3>{x}</h3><p>Included in the clean final rebuild.</p></article>)}
    </section>
  </main>;
}

function PhotoReel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(v => (v + 1) % photos.length), 4500);
    return () => clearInterval(timer);
  }, []);
  return <div className="photo-reel" style={{ backgroundImage: `url(${photos[index]})` }} />;
}

function Login({ mode, onBack, setLoginMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <h1>{mode === "owner" ? "Owners Portal" : "Stable Login"}</h1>
      <p>{mode === "owner" ? "Owner-only access to horses, updates, invoices and calendar." : "Trainer/staff access to the stable operations side."}</p>

      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
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

  async function submit(event) {
    event.preventDefault();
    setLoginMode(mode);
    const { data: invite, error: inviteError } = await supabase.from("invite_codes").select("*").eq("code", code.trim()).is("used_by", null).single();
    if (inviteError || !invite) {
      setToast("Invalid or used invite code.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setToast(error.message);
      return;
    }
    const userId = data.user?.id;
    if (!userId) {
      setToast("Account created. Check email confirmation.");
      return;
    }
    await supabase.from("profiles").insert({ id: userId, stable_id: invite.stable_id, role: invite.role, full_name: fullName, owner_name: invite.owner_name || fullName });
    await supabase.from("invite_codes").update({ used_by: userId, used_at: new Date().toISOString() }).eq("id", invite.id);
    setToast("Account created. Log in now.");
    onBack();
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
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className="primary full">Create Account</button>
      </form>
    </section>
  </main>;
}

function StableApp({ profile, tab, setTab, setToast, stable, setStable, setProfile }) {
  const hidden = profile.role === "staff" ? ["finance", "staff"] : [];
  return <>
    <nav className="nav">
      <NavButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={Home} label="Home" />
      {Object.entries(moduleDefs).filter(([key]) => !hidden.includes(key)).map(([key, module]) => <NavButton key={key} active={tab === key} onClick={() => setTab(key)} icon={module.icon} label={module.title} />)}
      <NavButton active={tab === "updates"} onClick={() => setTab("updates")} icon={Megaphone} label="Updates" />
      <NavButton active={tab === "analytics"} onClick={() => setTab("analytics")} icon={BarChart3} label="Analytics" />
      {financeRoles.includes(profile.role) && <NavButton active={tab === "invoices"} onClick={() => setTab("invoices")} icon={FileText} label="Invoices" />}
      <NavButton active={tab === "settings"} onClick={() => setTab("settings")} icon={Settings} label="Settings" />
    </nav>
    {tab === "dashboard" && <Dashboard stableId={profile.stable_id} setTab={setTab} />}
    {tab === "updates" && <UpdatesPanel stableId={profile.stable_id} setToast={setToast} />}
    {tab === "analytics" && <Analytics stableId={profile.stable_id} />}
    {tab === "invoices" && financeRoles.includes(profile.role) && <Invoices stableId={profile.stable_id} setToast={setToast} />}
    {tab === "settings" && <SettingsPanel profile={profile} stable={stable} setStable={setStable} setProfile={setProfile} setToast={setToast} />}
    {moduleDefs[tab] && <GenericTable stableId={profile.stable_id} config={moduleDefs[tab]} setToast={setToast} />}
  </>;
}

function OwnerApp({ profile, tab, setTab, setToast, stable, setStable, setProfile }) {
  return <>
    <nav className="nav">
      <NavButton active={tab === "ownerHome"} onClick={() => setTab("ownerHome")} icon={Home} label="Home" />
      <NavButton active={tab === "ownerHorses"} onClick={() => setTab("ownerHorses")} icon={BadgeCheck} label="Horses" />
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


function SettingsPanel({ profile, stable, setStable, setProfile, setToast, ownerMode = false }) {
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

    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);

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

    setSaving(true);
    const nextName = stableName.trim();
    const { error } = await supabase
  .from("stables")
  .update({
    name: stableName.trim()
  })
  .eq("id", profile.stable_id);;

   if (error) {
  setToast(error.message);
} else {
  setToast("Stable settings saved.");
  setStable?.(current => ({ ...(current || {}), id: profile.stable_id, name: stableName.trim() }));
setProfile?.(current => current ? { ...current, stables: { ...(current.stables || {}), id: profile.stable_id, name: stableName.trim() } } : current);;
}
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

    if (error) setToast(error.message);
    else setToast("Password reset email sent.");
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
          <label className="field"><span>Name</span><input value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="field"><span>Owner Display Name</span><input value={ownerName} onChange={e => setOwnerName(e.target.value)} /></label>
          <label className="field"><span>Email</span><input value={profile.email || ""} disabled /></label>
          <button className="primary full" disabled={saving}>{saving ? "Saving..." : "Save Account"}</button>
        </form>
      </article>

      {!ownerMode && <article className="settings-card">
        <h3>Stable</h3>
        <p>Basic stable identity and branding. Logo upload can be added next.</p>
        <form className="form-grid" onSubmit={saveStable}>
          <label className="field"><span>Stable Name</span><input value={stableName} onChange={e => setStableName(e.target.value)} /></label>
          <label className="field"><span>Stable ID</span><input value={profile.stable_id || ""} disabled /></label>
          <button className="primary full" disabled={saving}>{saving ? "Saving..." : "Save Stable"}</button>
        </form>
      </article>}

      <article className="settings-card">
        <h3>Security</h3>
        <p>Password reset works now. Two-factor authentication will be added here next.</p>
        <div className="settings-actions">
          <button className="ghost" onClick={sendPasswordReset}>Send Password Reset Email</button>
          <button className="ghost" disabled>Two-Factor Authentication — Coming Next</button>
        </div>
      </article>

      <article className="settings-card">
        <h3>Notifications</h3>
        <p>Email notifications for updates, invoices, race reminders and owner notices will live here.</p>
        <div className="settings-actions">
          <button className="ghost" disabled>Email Preferences — Coming Soon</button>
        </div>
      </article>
    </section>
  </main>;
}


function Dashboard({ stableId, setTab }) {
  const [counts, setCounts] = useState({});
  useEffect(() => { if (stableId) load(); }, [stableId]);

  async function count(table) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("stable_id", stableId);
    return count || 0;
  }

  async function load() {
    const [horses, work, owners, races, invoices] = await Promise.all([
      count("horses"), count("work_entries"), count("owners"), count("race_records"), count("invoices")
    ]);
    setCounts({ horses, work, owners, races, invoices });
  }

  return <main className="page">
    <section className="hero-panel">
      <div><p className="eyebrow dark-text">Stable command centre</p><h2>Everything important, in one place.</h2></div>
    </section>
    <section className="stats">
      <Stat icon={BadgeCheck} label="Horses" value={counts.horses || 0} />
      <Stat icon={ClipboardList} label="Work" value={counts.work || 0} />
      <Stat icon={Users} label="Owners" value={counts.owners || 0} />
      <Stat icon={Trophy} label="Races" value={counts.races || 0} />
      <Stat icon={FileText} label="Invoices" value={counts.invoices || 0} />
    </section>
    <section className="quick-grid">
      {["horses","owners","work","racing","treatments","farrier","feed","gear","updates","analytics","invoices"].map(key => <button className="quick" key={key} onClick={() => setTab(key)}>{key}<ChevronRight size={18}/></button>)}
    </section>
  </main>;
}

function GenericTable({ stableId, config, setToast }) {
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
    await supabase.from(config.table).delete().eq("id", id).eq("stable_id", stableId);
    load();
  }

  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  const shown = calendar && selectedDate && config.calendarField ? filtered.filter(row => row[config.calendarField] === selectedDate) : filtered;
  const Icon = config.icon;

  return <main className="page">
    <section className="module-header"><div className="module-icon"><Icon size={24}/></div><h2>{config.title}</h2></section>
    <section className="toolbar">
      <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${config.title}`} /></div>
      {config.calendarField && <button className="ghost" onClick={() => setCalendar(!calendar)}><Calendar size={18}/>{calendar ? "Card View" : "Calendar"}</button>}
      <button className="primary" onClick={() => setModal({ mode: "add", record: blank() })}><Plus size={18}/>Add</button>
    </section>
    {calendar && config.calendarField && <PhoneCalendar rows={rows} dateField={config.calendarField} selectedDate={selectedDate} setSelectedDate={setSelectedDate} title={config.title} />}
    <section className="grid">
      <CollapsibleRecords rows={shown} threshold={config.table === "work_entries" ? 12 : 999999} render={row => <article className="record clickable" key={row.id} onClick={() => config.profile === "horse" ? setModal({ mode: "horseProfile", record: row }) : config.profile === "owner" ? setModal({ mode: "ownerProfile", record: row }) : null}>
        <div className="record-head">
          <div><h3>{row.name || row.horse_name || row.item_name || row.full_name || row.date || row.entry_date || "Record"}</h3><p>{row.status || row.category || row.role || ""}</p></div>
          <div className="button-row" onClick={e => e.stopPropagation()}>
            <button className="edit" onClick={() => setModal({ mode: "edit", record: { ...row } })}><Edit3 size={16}/></button>
            <button className="delete" onClick={() => remove(row.id)}><Trash2 size={16}/></button>
          </div>
        </div>
        <div className="details">{config.display.map(key => <div key={key}><span>{labelize(key)}</span><strong>{formatValue(row[key])}</strong></div>)}</div>
      </article>} />
    </section>
    {modal?.mode === "horseProfile" && <HorseProfile horse={modal.record} stableId={stableId} onClose={() => setModal(null)} />}
    {modal?.mode === "ownerProfile" && <OwnerProfile owner={modal.record} stableId={stableId} onClose={() => setModal(null)} />}
    {modal && ["add","edit"].includes(modal.mode) && <RecordModal title={`${modal.mode === "edit" ? "Edit" : "Add"} ${config.title}`} fields={config.fields} record={modal.record} horses={horses} owners={owners} stableId={stableId} onClose={() => setModal(null)} onSave={record => save(record, modal.mode)} />}
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

function Analytics({ stableId }) {
  const [data, setData] = useState({ finance: [], work: [], races: [], horses: [] });
  useEffect(() => { if (stableId) load(); }, [stableId]);

  async function load() {
    const [finance, work, races, horses] = await Promise.all([
      supabase.from("finance_entries").select("*").eq("stable_id", stableId),
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
      <Stat icon={DollarSign} label="Income" value={`$${income.toLocaleString()}`} />
      <Stat icon={DollarSign} label="Expenses" value={`$${expenses.toLocaleString()}`} />
      <Stat icon={BarChart3} label="Net" value={`$${(income - expenses).toLocaleString()}`} />
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
    const horseResult = await supabase.from("horses").select("name").eq("stable_id", stableId).order("name");
    setHorses(horseResult.data || []);
    const ownerResult = await supabase.from("owners").select("name,email,phone").eq("stable_id", stableId).order("name");
    setOwners(ownerResult.data || []);
  }

  function blank() {
    return {
      invoice_number: `INV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${String(rows.length + 1).padStart(3, "0")}`,
      client_name: "",
      client_email: "",
      client_phone: "",
      horse_name: horses[0]?.name || "",
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
        <Field label="Horse"><select value={invoice.horse_name || ""} onChange={e => setField("horse_name", e.target.value)}>{horses.map(horse => <option key={horse.name}>{horse.name}</option>)}</select></Field>
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

function HorseProfile({ horse, stableId, onClose }) {
  const [data, setData] = useState({ owners: [], work: [], races: [], vet: [], farrier: [], feed: [], gear: [], invoices: [] });
  useEffect(() => { load(); }, [horse.name]);

  async function load() {
    const [owners, work, races, vet, farrier, feed, gear, invoices] = await Promise.all([
      supabase.from("horse_owners").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("created_at", { ascending: false }),
      supabase.from("work_entries").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("date", { ascending: false }),
      supabase.from("race_records").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("date", { ascending: false }),
      supabase.from("treatments").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("treatment_date", { ascending: false }),
      supabase.from("farrier_records").select("*").eq("stable_id", stableId).eq("horse_name", horse.name).order("farrier_date", { ascending: false }),
      supabase.from("feed_programs").select("*").eq("stable_id", stableId).eq("horse_name", horse.name),
      supabase.from("gear_items").select("*").eq("stable_id", stableId).eq("horse_name", horse.name),
      supabase.from("invoices").select("*").eq("stable_id", stableId).eq("horse_name", horse.name)
    ]);
    setData({ owners: owners.data || [], work: work.data || [], races: races.data || [], vet: vet.data || [], farrier: farrier.data || [], feed: feed.data || [], gear: gear.data || [], invoices: invoices.data || [] });
  }

  async function addOwner() {
    const owner_name = prompt("Owner name");
    const percentage = prompt("Percentage owned");
    if (!owner_name || !percentage) return;
    await supabase.from("horse_owners").insert({ stable_id: stableId, horse_name: horse.name, owner_name, percentage: Number(percentage) });
    load();
  }

  async function deleteShare(id) {
    await supabase.from("horse_owners").delete().eq("id", id).eq("stable_id", stableId);
    load();
  }

  return <div className="modal-backdrop">
    <section className="modal profile-modal">
      <div className="modal-head"><h2>{horse.name}</h2><button onClick={onClose}><X size={20}/></button></div>
      <ProfileSection title="Horse Details">
        <div className="details">
          <div><span>Stable Name</span><strong>{horse.stable_name || "-"}</strong></div>
          <div><span>Sire</span><strong>{horse.sire || "-"}</strong></div>
          <div><span>Mare</span><strong>{horse.mare || "-"}</strong></div>
          <div><span>Age</span><strong>{horse.age || "-"}</strong></div>
          <div><span>Sex</span><strong>{horse.sex || "-"}</strong></div>
          <div><span>Trainer</span><strong>{horse.trainer || "-"}</strong></div>
        </div>
      </ProfileSection>
      <button className="primary" onClick={addOwner}>Add Owner Share</button>
      <ProfileSection title="Owners">
        {data.owners.map(row => <div className="profile-row" key={row.id}><span>{row.owner_name}</span><strong>{row.percentage}%</strong><button className="delete small" onClick={() => deleteShare(row.id)}><Trash2 size={14}/></button></div>)}
      </ProfileSection>
      <ProfileSection title="Work"><CollapsibleList rows={data.work} threshold={8} render={row => <SimpleRow key={row.id} left={`${row.date} · ${row.sector}`} right={`Overall: ${row.overall_time || "-"} · Mile: ${row.mile_rate || "-"}`} />} /></ProfileSection>
      <ProfileSection title="Races">{data.races.map(row => <SimpleRow key={row.id} left={`${row.date} · ${row.track} · ${row.status}`} right={row.result || `$${row.prizemoney || 0}`} />)}</ProfileSection>
      <ProfileSection title="Vet">{data.vet.map(row => <SimpleRow key={row.id} left={`${row.treatment_date} · ${row.treatment_type}`} right={`$${row.bill_amount || 0}`} />)}</ProfileSection>
      <ProfileSection title="Farrier">{data.farrier.map(row => <SimpleRow key={row.id} left={`${row.farrier_date} · ${row.service_type}`} right={`$${row.bill_amount || 0}`} />)}</ProfileSection>
      <ProfileSection title="Feed">{data.feed.map(row => <SimpleRow key={row.id} left={row.morning_feed || row.night_feed || "Feed record"} right={row.supplements || ""} />)}</ProfileSection>
      <ProfileSection title="Gear">{data.gear.map(row => <SimpleRow key={row.id} left={`${row.item_name} · ${row.category}`} right={row.condition || ""} />)}</ProfileSection>
      <ProfileSection title="Bills">{data.invoices.map(row => <SimpleRow key={row.id} left={row.invoice_number} right={`$${row.total || 0}`} />)}</ProfileSection>
    </section>
  </div>;
}

function OwnerProfile({ owner, stableId, onClose }) {
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
    const invoiceResult = await supabase.from("invoices").select("*").eq("stable_id", stableId).eq("client_name", owner.name);
    setInvoices(invoiceResult.data || []);
  }

  return <div className="modal-backdrop">
    <section className="modal">
      <div className="modal-head"><h2>{owner.name}</h2><button onClick={onClose}><X size={20}/></button></div>
      <ProfileSection title="Horses Owned">{shares.map(row => <SimpleRow key={row.id} left={row.horse_name} right={`${row.percentage}%`} />)}</ProfileSection>
      <ProfileSection title="Invoices">{invoices.map(row => <SimpleRow key={row.id} left={row.invoice_number} right={`$${row.total || 0}`} />)}</ProfileSection>
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
