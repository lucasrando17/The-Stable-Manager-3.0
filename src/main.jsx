import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck, BarChart3, BriefcaseBusiness, Calendar, ChevronRight,
  ClipboardList, DollarSign, Edit3, FileText, HeartPulse, Home, LogOut,
  Mail, Megaphone, Package, Plus, Printer, Search, Share2, ShieldCheck,
  Sparkles, Trash2, Trophy, Users, Wheat, X
} from "lucide-react";
import "./styles.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const GST_RATE = 0.1;
const photos = ["/login-photos/photo-1.jpg","/login-photos/photo-2.jpg","/login-photos/photo-3.jpg","/login-photos/photo-4.jpg"];

const WORK_SECTORS = ["Jog - Cart","Jog- Lead","Jog- Jogger Machine","Jog/Canter","Gallop","Trot","Hopple","Walking Machine","Water Walk","Race","Trial","Educational Trial","Swim","Beach Work","Recovery"];
const WARMUP_SECTORS = ["Jog/Canter","Gallop","Trot","Hopple"];

const modules = {
  horses: {
    table:"horses", title:"Horses", subtitle:"Tap a horse to open the full profile.", icon:BadgeCheck, profile:true,
    fields:[["name","Registered Name","text"],["stable_name","Stable Name","text"],["age","Age","number"],["sex","Sex","select",["Gelding","Mare","Horse","Colt","Filly"]],["owner","Primary Owner","ownerName"],["owner_percentage","Primary Owner %","number"],["trainer","Trainer","text"],["status","Status","select",["Racing","Building","Trialling","Spelling","Rehab","Sold","Retired"]],["next_target","Next Target","text"],["notes","Notes","textarea"]],
    display:["stable_name","age","sex","owner","owner_percentage","trainer","status","next_target"]
  },
  work: {
    table:"work_entries", title:"Work", subtitle:"Work sectors, warm-ups, sectionals and heart rate.", icon:ClipboardList, calendarField:"date",
    fields:[["date","Date","date"],["horse_name","Horse","horseName"],["sector","Work Sector","select",WORK_SECTORS],["warmup","Warm Up Options / Details","conditionalWarmup"],["distance","Distance","text"],["overall_time","Overall Time","text"],["mile_rate","Mile Rate","text"],["last_half","Last Half","text"],["last_quarter","Last Quarter","text"],["driver","Driver","text"],["recovery","Recovery/Heart Rate","text"],["notes","Notes","textarea"]],
    display:["date","horse_name","sector","warmup","distance","overall_time","mile_rate","last_half","last_quarter","driver","recovery","notes"]
  },
  racing: {
    table:"race_records", title:"Racing", subtitle:"When completed, add result and prizemoney.", icon:Trophy, calendarField:"date",
    fields:[["date","Date","date"],["horse_name","Horse","horseName"],["track","Track","text"],["race","Race/Class","text"],["distance","Distance","text"],["status","Status","select",["Target","Nominated","Accepted","Scratched","Completed"]],["driver","Driver","text"],["result","Result","text"],["prizemoney","Prizemoney","number"],["notes","Notes","textarea"]],
    display:["date","horse_name","track","race","distance","status","driver","result","prizemoney"]
  },
  treatments: {
    table:"treatments", title:"Vet", subtitle:"Vet work, bills and owner percentage billing.", icon:HeartPulse, calendarField:"treatment_date",
    fields:[["treatment_date","Date","date"],["horse_name","Horse","horseName"],["treatment_type","Treatment","text"],["veterinarian","Vet","text"],["bill_amount","Bill Amount","number"],["bill_to_owners","Add to owner invoices?","select",["No","Yes"]],["follow_up_date","Follow Up","date"],["notes","Notes","textarea"]],
    display:["treatment_date","horse_name","treatment_type","veterinarian","bill_amount","bill_to_owners","follow_up_date"]
  },
  feed: {
    table:"feed_programs", title:"Feed", subtitle:"Feed programs and supplements.", icon:Wheat,
    fields:[["horse_name","Horse","horseName"],["morning_feed","Morning Feed","textarea"],["lunch_feed","Lunch Feed","textarea"],["night_feed","Night Feed","textarea"],["supplements","Supplements","textarea"],["notes","Notes","textarea"]],
    display:["horse_name","morning_feed","lunch_feed","night_feed","supplements"]
  },
  finance: {
    table:"finance_entries", title:"Finance", subtitle:"Income, expenses, owner billing and paid status.", icon:DollarSign, calendarField:"entry_date",
    fields:[["entry_date","Date","date"],["horse_name","Horse","horseName"],["entry_type","Type","select",["Income","Expense"]],["category","Category","text"],["amount","Amount","number"],["paid","Paid","select",["Yes","No"]],["bill_to_owners","Add expense to owner invoices?","select",["No","Yes"]],["notes","Notes","textarea"]],
    display:["entry_date","horse_name","entry_type","category","amount","paid","bill_to_owners"]
  },
  owners: {
    table:"owners", title:"Owners", subtitle:"Tap owner to see horses and ownership percentages.", icon:Users, ownerProfile:true,
    fields:[["name","Owner Name","text"],["email","Email","email"],["phone","Phone","text"],["role","Role","select",["owner","staff","trainer","admin"]],["notes","Notes","textarea"]],
    display:["email","phone","role","notes"]
  },
  ownerPortal: {
    table:"owner_portal_items", title:"Owner Portal", subtitle:"Owner-facing horse updates and portal content.", icon:BriefcaseBusiness,
    fields:[["owner_name","Owner Name","ownerName"],["owner_email","Owner Email","email"],["horse_name","Horse","horseName"],["update_title","Update Title","text"],["update_body","Update Body","textarea"],["visibility","Visibility","select",["owner","stable","draft"]]],
    display:["owner_email","horse_name","update_title","visibility","update_body"]
  },
  gear: {
    table:"gear_items", title:"Gear", subtitle:"Gear assigned to horses.", icon:Package,
    fields:[["item_name","Item","text"],["horse_name","Horse","horseName"],["category","Category","select",["Hopples","Bridle","Bit","Boots","Harness","Sulky","Driving Gear","Rug","Other"]],["size","Size","text"],["colour","Colour","text"],["condition","Condition","select",["Excellent","Good","Fair","Needs Repair","Retired"]],["location","Location","text"],["assigned_to","Assigned To","text"],["notes","Notes","textarea"]],
    display:["horse_name","category","size","colour","condition","location","assigned_to"]
  },
  inventory: {
    table:"inventory", title:"Inventory", subtitle:"Stable supplies and reorder levels.", icon:Package,
    fields:[["item_name","Item","text"],["category","Category","text"],["quantity","Quantity","number"],["supplier","Supplier","text"],["reorder_level","Reorder Level","number"],["notes","Notes","textarea"]],
    display:["category","quantity","supplier","reorder_level","notes"]
  },
  staff: {
    table:"staff", title:"Staff", subtitle:"Staff, drivers and contacts.", icon:ShieldCheck,
    fields:[["full_name","Name","text"],["role","Role","text"],["phone","Phone","text"],["email","Email","email"],["notes","Notes","textarea"]],
    display:["role","phone","email","notes"]
  }
};

function App(){
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [stable,setStable]=useState(null);
  const [view,setView]=useState("landing");
  const [tab,setTab]=useState("dashboard");
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState("");

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ setSession(data.session || null); setLoading(false); });
    const {data:listener}=supabase.auth.onAuthStateChange((_event,nextSession)=>{
      setSession(nextSession);
      setView(nextSession ? "app" : "landing");
    });
    return ()=>listener.subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(session?.user) loadProfile(); },[session?.user?.id]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(""),4200); return()=>clearTimeout(t); },[toast]);

  async function loadProfile(){
    const {data,error}=await supabase.from("profiles").select("*, stables(*)").eq("id",session.user.id).single();
    if(error){ setToast("Login works, but this user is not linked to a stable profile yet."); return; }
    setProfile(data); setStable(data.stables);
  }

  if(loading) return <div className="center">Loading...</div>;
  if(!session && view==="login") return <Login onBack={()=>setView("landing")}/>;
  if(!session && view==="invite") return <InviteSignup onBack={()=>setView("landing")} setToast={setToast}/>;
  if(!session) return <Landing onLogin={()=>setView("login")} onInvite={()=>setView("invite")}/>;

  return <div className="app">
    <header className="topbar">
      <div><h1>The Trotting Stable App</h1><p>{stable?.name || "Stable"} · {profile?.role || "user"}</p></div>
      <button className="ghost" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/>Logout</button>
    </header>
    {toast && <div className="toast" onClick={()=>setToast("")}>{toast}</div>}
    <nav className="nav">
      <NavButton active={tab==="dashboard"} onClick={()=>setTab("dashboard")} icon={Home} label="Home"/>
      {Object.entries(modules).map(([key,m])=><NavButton key={key} active={tab===key} onClick={()=>setTab(key)} icon={m.icon} label={m.title}/>)}
      <NavButton active={tab==="updates"} onClick={()=>setTab("updates")} icon={Megaphone} label="Updates"/>
      <NavButton active={tab==="analytics"} onClick={()=>setTab("analytics")} icon={BarChart3} label="Analytics"/>
      <NavButton active={tab==="invoices"} onClick={()=>setTab("invoices")} icon={FileText} label="Invoices"/>
    </nav>

    {tab==="dashboard" && <Dashboard stableId={profile?.stable_id} setTab={setTab}/>}
    {tab==="work" && <Work stableId={profile?.stable_id} setToast={setToast}/>}
    {tab==="updates" && <UpdatesPanel stableId={profile?.stable_id} setToast={setToast}/>}
    {tab==="analytics" && <Analytics stableId={profile?.stable_id}/>}
    {tab==="invoices" && <Invoices stableId={profile?.stable_id} setToast={setToast}/>}
    {tab!=="dashboard" && tab!=="work" && tab!=="updates" && tab!=="analytics" && tab!=="invoices" && modules[tab] && <GenericTable stableId={profile?.stable_id} config={modules[tab]} setToast={setToast}/>}
  </div>;
}

function Landing({onLogin,onInvite}){
  return <main className="landing">
    <PhotoReel/>
    <header className="landing-nav"><strong>The Trotting Stable App</strong><div><button className="ghost dark" onClick={onLogin}>Log In</button><button className="primary light" onClick={onInvite}>Join With Invite Code</button></div></header>
    <section className="hero"><p className="eyebrow">Harness racing stable software</p><h1>Stable operations, owner portals, work records and invoices.</h1><p>Work, racing, vet, feed, owners, gear, analytics, media updates, invoices and phone-style calendars in one secure app.</p><div className="hero-actions"><button className="primary light" onClick={onInvite}>Join With Invite Code</button><button className="ghost dark" onClick={onLogin}>Stable Login</button></div></section>
    <section className="feature-grid">{["Phone-style calendars","Media owner updates","Owner percentage billing","Deep horse profiles","Race prizemoney analytics","Secure invite-only access"].map(x=><article className="feature-card" key={x}><h3>{x}</h3><p>Included in this clean rebuild.</p></article>)}</section>
  </main>;
}

function PhotoReel(){
  const [i,setI]=useState(0);
  useEffect(()=>{ const t=setInterval(()=>setI(v=>(v+1)%photos.length),4500); return()=>clearInterval(t); },[]);
  return <div className="photo-reel" style={{backgroundImage:`url(${photos[i]})`}}/>;
}

function Login({onBack}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");
  async function submit(e){
    e.preventDefault(); setMsg("");
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error) setMsg(error.message);
  }
  return <main className="login-screen"><PhotoReel/><section className="login-card"><button className="text" onClick={onBack}>← Back</button><h1>Stable Login</h1><p>Invite-only access for stables, owners and staff.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary full">Login</button></form>{msg&&<p className="error">{msg}</p>}</section></main>;
}

function InviteSignup({onBack,setToast}){
  const [code,setCode]=useState("");
  const [fullName,setFullName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  async function submit(e){
    e.preventDefault();
    const {data:invite,error:inviteError}=await supabase.from("invite_codes").select("*").eq("code",code.trim()).is("used_by",null).single();
    if(inviteError || !invite){ setToast("Invalid or used invite code."); return; }
    const {data,error}=await supabase.auth.signUp({email,password});
    if(error){ setToast(error.message); return; }
    const uid=data.user?.id;
    if(!uid){ setToast("Account created. Check email confirmation."); return; }
    await supabase.from("profiles").insert({id:uid,stable_id:invite.stable_id,role:invite.role,full_name:fullName});
    await supabase.from("invite_codes").update({used_by:uid,used_at:new Date().toISOString()}).eq("id",invite.id);
    setToast("Account created. Log in now.");
    onBack();
  }
  return <main className="login-screen"><PhotoReel/><section className="login-card"><button className="text" onClick={onBack}>← Back</button><h1>Join With Invite Code</h1><p>Only invited users can create accounts.</p><form onSubmit={submit}><label>Invite Code<input value={code} onChange={e=>setCode(e.target.value)}/></label><label>Full Name<input value={fullName} onChange={e=>setFullName(e.target.value)}/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary full">Create Account</button></form></section></main>;
}

function Dashboard({stableId,setTab}){
  const [counts,setCounts]=useState({horses:0,work:0,owners:0,gear:0,invoices:0,races:0});
  useEffect(()=>{ if(stableId) load(); },[stableId]);
  async function count(table){ const {count}=await supabase.from(table).select("*",{count:"exact",head:true}).eq("stable_id",stableId); return count||0; }
  async function load(){ const [horses,work,owners,gear,invoices,races]=await Promise.all([count("horses"),count("work_entries"),count("owners"),count("gear_items"),count("invoices"),count("race_records")]); setCounts({horses,work,owners,gear,invoices,races}); }
  return <main className="page"><section className="hero-panel"><div><p className="eyebrow dark-text">Stable command centre</p><h2>Everything important, in one place.</h2><p>Operations, owners, gear, analytics, invoices, media updates and calendars.</p></div><Sparkles size={42}/></section><section className="stats"><Stat icon={BadgeCheck} label="Horses" value={counts.horses}/><Stat icon={ClipboardList} label="Work" value={counts.work}/><Stat icon={Users} label="Owners" value={counts.owners}/><Stat icon={Package} label="Gear" value={counts.gear}/><Stat icon={FileText} label="Invoices" value={counts.invoices}/><Stat icon={Trophy} label="Races" value={counts.races}/></section><section className="quick-grid">{[["Horse Profiles","horses"],["Work Log","work"],["Phone Calendar","work"],["Owner Portal","ownerPortal"],["Updates","updates"],["Analytics","analytics"],["Gear","gear"],["Racing","racing"],["Vet","treatments"],["Feed","feed"],["Invoices","invoices"],["Owners","owners"]].map(([label,key])=><button key={label} className="quick" onClick={()=>setTab(key)}><span>{label}</span><ChevronRight size={18}/></button>)}</section></main>;
}

function Work({stableId,setToast}){
  const [horses,setHorses]=useState([]);
  const [selected,setSelected]=useState("");
  useEffect(()=>{ if(!stableId)return; supabase.from("horses").select("name").eq("stable_id",stableId).then(({data})=>{setHorses(data||[]); if(data?.[0]?.name && !selected) setSelected(data[0].name);}); },[stableId]);
  return <main className="page"><WorkHistory stableId={stableId} horses={horses} selected={selected} setSelected={setSelected}/><GenericTable stableId={stableId} config={modules.work} setToast={setToast} embedded/></main>;
}

function WorkHistory({stableId,horses,selected,setSelected}){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ if(!stableId || !selected) return; supabase.from("work_entries").select("*").eq("stable_id",stableId).eq("horse_name",selected).order("date",{ascending:false}).then(({data})=>setRows(data||[])); },[stableId,selected]);
  return <section className="card"><div className="section-title"><h2>Single Horse Work History Isolator</h2><select value={selected} onChange={e=>setSelected(e.target.value)}>{horses.map(h=><option key={h.name}>{h.name}</option>)}</select></div><div className="mini-stats"><span>{rows.length} total</span><span>{rows.filter(r=>r.sector==="Race").length} race</span><span>{rows.filter(r=>r.sector==="Jog- Jogger Machine").length} jogger machine</span><span>{rows.filter(r=>r.warmup).length} warm-ups</span></div><div className="list">{rows.slice(0,8).map(r=><article className="mini-work" key={r.id}><strong>{r.date} · {r.sector}</strong><span>{r.distance?`Distance: ${r.distance}`:""} {r.overall_time?`· Overall: ${r.overall_time}`:""} {r.mile_rate?`· Mile rate: ${r.mile_rate}`:""} {r.last_half?`· Last half: ${r.last_half}`:""} {r.last_quarter?`· Last quarter: ${r.last_quarter}`:""}</span>{r.warmup&&<em>Warm-up: {r.warmup}</em>}</article>)}</div></section>;
}

function PhoneCalendar({rows,dateField,selectedDate,setSelectedDate,title}){
  const today=new Date();
  const [cursor,setCursor]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [openDay,setOpenDay]=useState(selectedDate||"");
  const year=cursor.getFullYear(), month=cursor.getMonth();
  const firstDay=new Date(year,month,1);
  const startOffset=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(new Date(year,month,d));
  while(cells.length%7!==0) cells.push(null);
  const monthName=cursor.toLocaleString("en-AU",{month:"long",year:"numeric"});
  function toIso(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
  function fromIso(iso){if(!iso)return null; const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d);}
  function recordsFor(iso){return rows.filter(r=>r[dateField]===iso);}
  function selectDay(date){const iso=toIso(date); setSelectedDate(iso); setOpenDay(iso);}
  const selectedRecords=openDay?recordsFor(openDay):[];
  const selectedObj=fromIso(openDay);
  const label=selectedObj?selectedObj.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"";
  return <section className="phone-calendar-wrap"><div className="phone-calendar-shell"><div className="phone-calendar-top"><button className="calendar-round" onClick={()=>setCursor(new Date(year,month-1,1))}>‹</button><div><h3>{monthName}</h3><p>{title} calendar</p></div><button className="calendar-round" onClick={()=>setCursor(new Date(year,month+1,1))}>›</button></div><div className="phone-calendar-actions"><button className="ghost" onClick={()=>{const n=new Date();setCursor(new Date(n.getFullYear(),n.getMonth(),1));selectDay(n);}}>Today</button><button className="ghost" onClick={()=>{setSelectedDate("");setOpenDay("");}}>Show All</button></div><div className="phone-weekdays">{["M","T","W","T","F","S","S"].map((d,i)=><span key={d+i}>{d}</span>)}</div><div className="phone-calendar-grid">{cells.map((date,i)=>{const iso=date?toIso(date):""; const count=date?recordsFor(iso).length:0; const isToday=date&&iso===toIso(today); return <button key={i} disabled={!date} className={`${selectedDate===iso?"selected":""} ${isToday?"today":""} ${count?"has-records":""}`} onClick={()=>date&&selectDay(date)}>{date&&<strong>{date.getDate()}</strong>}{count>0&&<small>{count}</small>}</button>;})}</div></div><div className="calendar-day-panel">{openDay?<><div className="day-panel-head"><div><h3>{label}</h3><p>{selectedRecords.length} {selectedRecords.length===1?"record":"records"}</p></div><button className="text" onClick={()=>{setSelectedDate("");setOpenDay("");}}>Clear</button></div>{selectedRecords.length?<div className="day-records">{selectedRecords.map((r,i)=><article className="day-record" key={r.id||i}><strong>{r.horse_name||r.name||r.title||"Record"}</strong><span>{r.sector||r.status||r.treatment_type||r.race||r.category||r.notes||""}</span></article>)}</div>:<p className="hint">No records on this date yet.</p>}</>:<div className="day-panel-empty"><h3>Select a date</h3><p>Tap a day to view that day’s {title.toLowerCase()} records.</p></div>}</div></section>;
}

function GenericTable({stableId,config,setToast,embedded=false}){
  const [rows,setRows]=useState([]);
  const [horses,setHorses]=useState([]);
  const [owners,setOwners]=useState([]);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [calendar,setCalendar]=useState(false);
  const [selectedDate,setSelectedDate]=useState("");

  useEffect(()=>{ if(!stableId) return; load(); supabase.from("horses").select("name").eq("stable_id",stableId).then(({data})=>setHorses(data||[])); supabase.from("owners").select("name,email,phone").eq("stable_id",stableId).then(({data})=>setOwners(data||[])); },[stableId,config.table]);

  async function load(){
    const {data,error}=await supabase.from(config.table).select("*").eq("stable_id",stableId).order("created_at",{ascending:false});
    if(error) setToast(error.message);
    setRows(data||[]);
  }
  function blank(){
    const r={};
    config.fields.forEach(([key,_label,type,options])=>{
      if(type==="date") r[key]=new Date().toISOString().slice(0,10);
      else if(type==="number") r[key]="";
      else if(type==="select") r[key]=options[0];
      else if(type==="horseName") r[key]=horses[0]?.name||"";
      else if(type==="ownerName") r[key]=owners[0]?.name||"";
      else r[key]="";
    });
    return r;
  }
  async function save(record,mode){
    const clean={...record,stable_id:stableId};
    config.fields.forEach(([key,_label,type])=>{ if(type==="number") clean[key]=clean[key]===""?0:Number(clean[key]); });
    const result=mode==="edit" ? await supabase.from(config.table).update(clean).eq("id",clean.id).eq("stable_id",stableId) : await supabase.from(config.table).insert(clean);
    if(result.error){ setToast(result.error.message); return; }
    await afterSaveAutomation(config,clean,stableId);
    setToast("Saved.");
    setModal(null);
    load();
  }
  async function remove(id){
    const {error}=await supabase.from(config.table).delete().eq("id",id).eq("stable_id",stableId);
    if(error) setToast(error.message); else load();
  }
  const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const shown=calendar && selectedDate && config.calendarField ? filtered.filter(r=>r[config.calendarField]===selectedDate) : filtered;
  const Icon=config.icon;
  const content=<><section className="module-header"><div className="module-icon"><Icon size={24}/></div><div><h2>{config.title}</h2><p>{config.subtitle}</p></div></section><section className="toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`}/></div>{config.calendarField&&<button className="ghost" onClick={()=>setCalendar(!calendar)}><Calendar size={18}/>{calendar?"Card View":"Calendar"}</button>}<button className="primary" onClick={()=>setModal({mode:"add",record:blank()})}><Plus size={18}/>Add</button></section>{calendar&&config.calendarField&&<PhoneCalendar rows={rows} dateField={config.calendarField} selectedDate={selectedDate} setSelectedDate={setSelectedDate} title={config.title}/>}<section className="grid">{shown.map(row=><article className="record clickable" key={row.id} onClick={()=>config.profile?setModal({mode:"profile",record:row}):config.ownerProfile?setModal({mode:"ownerProfile",record:row}):null}><div className="record-head"><div><h3>{row.name||row.horse_name||row.item_name||row.full_name||row.update_title||row.entry_date||row.date||"Record"}</h3><p>{row.status||row.category||row.role||row.visibility||""}</p></div><div className="button-row" onClick={e=>e.stopPropagation()}><button className="edit" onClick={()=>setModal({mode:"edit",record:{...row}})}><Edit3 size={16}/></button><button className="delete" onClick={()=>remove(row.id)}><Trash2 size={16}/></button></div></div><div className="details">{config.display.map(k=><div key={k}><span>{labelize(k)}</span><strong>{formatValue(row[k])}</strong></div>)}</div></article>)}</section>{modal?.mode==="profile"&&<HorseProfile horse={modal.record} stableId={stableId} onClose={()=>setModal(null)}/>} {modal?.mode==="ownerProfile"&&<OwnerProfile owner={modal.record} stableId={stableId} onClose={()=>setModal(null)}/>} {modal&&["add","edit"].includes(modal.mode)&&<RecordModal fields={config.fields} title={`${modal.mode==="edit"?"Edit":"Add"} ${config.title}`} record={modal.record} horses={horses} owners={owners} onClose={()=>setModal(null)} onSave={rec=>save(rec,modal.mode)}/>}</>;
  return embedded?content:<main className="page">{content}</main>;
}

async function afterSaveAutomation(config,record,stableId){
  if(config.table==="horses" && record.owner){
    await supabase.from("horse_owners").upsert({stable_id:stableId,horse_name:record.name,owner_name:record.owner,percentage:Number(record.owner_percentage||100)},{onConflict:"stable_id,horse_name,owner_name"});
  }
  if(config.table==="finance_entries" && record.entry_type==="Expense" && record.bill_to_owners==="Yes") await addExpenseToOwnerInvoices(stableId,record.horse_name,Number(record.amount||0),record.category||"Expense",record.notes||"");
  if(config.table==="treatments" && record.bill_to_owners==="Yes" && Number(record.bill_amount||0)>0) await addExpenseToOwnerInvoices(stableId,record.horse_name,Number(record.bill_amount||0),record.treatment_type||"Vet bill",record.notes||"");
}
async function addExpenseToOwnerInvoices(stableId,horseName,amount,category,notes){
  if(!horseName||!amount) return;
  const {data:shares}=await supabase.from("horse_owners").select("*").eq("stable_id",stableId).eq("horse_name",horseName);
  let ownerShares=shares||[];
  if(!ownerShares.length){
    const {data:horse}=await supabase.from("horses").select("*").eq("stable_id",stableId).eq("name",horseName).maybeSingle();
    if(horse?.owner) ownerShares=[{owner_name:horse.owner,percentage:Number(horse.owner_percentage||100)}];
  }
  for(const share of ownerShares){
    const pct=Number(share.percentage||0);
    if(!pct) continue;
    const charge=Number((amount*pct/100).toFixed(2));
    const {data:owner}=await supabase.from("owners").select("*").eq("stable_id",stableId).eq("name",share.owner_name).maybeSingle();
    const line={id:crypto.randomUUID(),description:`${category} - ${horseName} (${pct}%)`,quantity:1,unit_price:charge,notes};
    await supabase.from("invoices").insert({stable_id:stableId,invoice_number:`INV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${String(Math.floor(Math.random()*9000)+1000)}`,client_name:share.owner_name,client_email:owner?.email||"",client_phone:owner?.phone||"",horse_name:horseName,due_date:new Date(Date.now()+14*86400000).toISOString().slice(0,10),status:"Draft",notes:`Auto-created from ${category}`,line_items:[line],amount:charge,gst:charge*GST_RATE,total:charge*(1+GST_RATE)});
  }
}

function UpdatesPanel({stableId,setToast}){
  const config={fields:[["title","Title","text"],["horse_name","Horse","horseName"],["category","Category","select",["Stable Update","Owner Update","Race Update","Vet Update","Work Update","General"]],["body","Update Message","textarea"],["photo_urls","Photo URLs","textarea"],["video_urls","Video URLs","textarea"],["link_urls","Links","textarea"],["visibility","Visibility","select",["internal","owners","public-preview"]],["send_status","Send Status","select",["Draft","Ready To Send","Sent"]]]};
  const [rows,setRows]=useState([]),[horses,setHorses]=useState([]),[owners,setOwners]=useState([]),[search,setSearch]=useState(""),[modal,setModal]=useState(null),[sendModal,setSendModal]=useState(null);
  useEffect(()=>{ if(stableId) load(); },[stableId]);
  async function load(){ const [updates,h,o]=await Promise.all([supabase.from("updates").select("*").eq("stable_id",stableId).order("created_at",{ascending:false}),supabase.from("horses").select("name,owner").eq("stable_id",stableId),supabase.from("owners").select("name,email,phone").eq("stable_id",stableId)]); if(updates.error) setToast(updates.error.message); setRows(updates.data||[]); setHorses(h.data||[]); setOwners(o.data||[]); }
  function blank(){return{title:"",horse_name:horses[0]?.name||"",category:"Owner Update",body:"",photo_urls:"",video_urls:"",link_urls:"",visibility:"owners",send_status:"Draft"};}
  async function save(record,mode){ const clean={...record,stable_id:stableId}; const result=mode==="edit"?await supabase.from("updates").update(clean).eq("id",clean.id).eq("stable_id",stableId):await supabase.from("updates").insert(clean); if(result.error) setToast(result.error.message); else{setToast("Update saved.");setModal(null);load();}}
  async function remove(id){const {error}=await supabase.from("updates").delete().eq("id",id).eq("stable_id",stableId); if(error)setToast(error.message); else load();}
  const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  return <main className="page"><section className="module-header"><div className="module-icon"><Megaphone size={24}/></div><div><h2>Updates</h2><p>Send horse updates with photos, videos and links directly to owners.</p></div></section><section className="toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search updates..."/></div><button className="primary" onClick={()=>setModal({mode:"add",record:blank()})}><Plus size={18}/>Create Update</button></section><section className="grid">{filtered.map(row=><article className="record" key={row.id}><div className="record-head"><div><h3>{row.title||"Update"}</h3><p>{row.horse_name} · {row.category} · {row.send_status||"Draft"}</p></div><div className="button-row"><button className="share" onClick={()=>setSendModal(row)}><Share2 size={16}/></button><button className="edit" onClick={()=>setModal({mode:"edit",record:{...row}})}><Edit3 size={16}/></button><button className="delete" onClick={()=>remove(row.id)}><Trash2 size={16}/></button></div></div><div className="details"><div><span>Visibility</span><strong>{row.visibility||"-"}</strong></div><div><span>Message</span><strong>{row.body||"-"}</strong></div><div><span>Photos</span><strong>{splitLines(row.photo_urls).length||"-"}</strong></div><div><span>Videos</span><strong>{splitLines(row.video_urls).length||"-"}</strong></div><div><span>Links</span><strong>{splitLines(row.link_urls).length||"-"}</strong></div></div><MediaPreview photos={row.photo_urls} videos={row.video_urls} links={row.link_urls}/></article>)}</section>{modal&&<RecordModal fields={config.fields} title={`${modal.mode==="edit"?"Edit":"Create"} Update`} record={modal.record} horses={horses} owners={owners} onClose={()=>setModal(null)} onSave={rec=>save(rec,modal.mode)}/>} {sendModal&&<SendUpdateModal update={sendModal} stableId={stableId} owners={owners} onClose={()=>setSendModal(null)} setToast={setToast} onSent={load}/>}</main>;
}
function MediaPreview({photos,videos,links}){const ps=splitLines(photos),vs=splitLines(videos),ls=splitLines(links); if(!ps.length&&!vs.length&&!ls.length)return null; return <section className="media-preview">{ps.map((url,i)=><a key={`p${i}`} href={url} target="_blank" rel="noreferrer"><img src={url} alt="Update media"/></a>)}{vs.map((url,i)=><a className="media-pill" key={`v${i}`} href={url} target="_blank" rel="noreferrer">Video {i+1}</a>)}{ls.map((url,i)=><a className="media-pill" key={`l${i}`} href={url} target="_blank" rel="noreferrer">Link {i+1}</a>)}</section>;}
function SendUpdateModal({update,stableId,owners,onClose,setToast,onSent}){const [recipients,setRecipients]=useState([]),[selected,setSelected]=useState({}); const message=buildUpdateMessage(update); useEffect(()=>{loadRecipients();},[update.id]); async function loadRecipients(){let names=[]; if(update.horse_name){const {data:shares}=await supabase.from("horse_owners").select("owner_name").eq("stable_id",stableId).eq("horse_name",update.horse_name); names=(shares||[]).map(s=>s.owner_name); if(!names.length){const {data:horse}=await supabase.from("horses").select("owner").eq("stable_id",stableId).eq("name",update.horse_name).maybeSingle(); if(horse?.owner)names=[horse.owner];}} const matched=owners.filter(o=>names.includes(o.name)); setRecipients(matched); const defaults={}; matched.forEach(o=>defaults[o.name]=true); setSelected(defaults);}
  async function emailAll(){let sent=0; for(const owner of recipients.filter(r=>selected[r.name])){if(!owner.email)continue; const res=await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:owner.email,subject:update.title||`Update for ${update.horse_name}`,message})}); if(res.ok)sent++;} await supabase.from("updates").update({send_status:"Sent",sent_at:new Date().toISOString()}).eq("id",update.id).eq("stable_id",stableId); setToast(sent?`Email sent/demo sent to ${sent} owner(s).`:"No owner email addresses found."); onSent(); onClose();}
  async function phoneShare(){if(navigator.share) await navigator.share({title:update.title||"Stable update",text:message}); else {await navigator.clipboard.writeText(message); setToast("Update message copied.");}}
  return <div className="modal-backdrop"><section className="modal profile-modal"><div className="modal-head"><h2>Send Update</h2><button onClick={onClose}><X size={20}/></button></div><label className="field"><span>Message Preview</span><textarea value={message} readOnly/></label><section className="profile-section"><h3>Owner Recipients</h3>{recipients.length?recipients.map(o=><div className="recipient-row" key={o.name}><label><input type="checkbox" checked={!!selected[o.name]} onChange={e=>setSelected(s=>({...s,[o.name]:e.target.checked}))}/> {o.name}</label><span>{o.email||"No email"} · {o.phone||"No phone"}</span><div className="button-row">{o.phone&&<a className="mini-action" href={`sms:${String(o.phone).replace(/\s+/g,"")}?&body=${encodeURIComponent(message)}`}>Phone/SMS</a>}{o.email&&<a className="mini-action" href={`mailto:${o.email}?subject=${encodeURIComponent(update.title||"Stable update")}&body=${encodeURIComponent(message)}`}>Email Link</a>}</div></div>):<p className="hint">No owners found for this horse.</p>}</section><div className="button-row wide"><button className="primary" onClick={phoneShare}><Share2 size={18}/>Phone Share Sheet</button><button className="primary" onClick={emailAll}><Mail size={18}/>Send Email / Demo API</button></div></section></div>;}

function Analytics({stableId}){const [data,setData]=useState({finance:[],work:[],races:[],horses:[],invoices:[]}); useEffect(()=>{if(stableId)load();},[stableId]); async function load(){const [finance,work,races,horses,invoices]=await Promise.all([supabase.from("finance_entries").select("*").eq("stable_id",stableId),supabase.from("work_entries").select("*").eq("stable_id",stableId),supabase.from("race_records").select("*").eq("stable_id",stableId),supabase.from("horses").select("*").eq("stable_id",stableId),supabase.from("invoices").select("*").eq("stable_id",stableId)]); setData({finance:finance.data||[],work:work.data||[],races:races.data||[],horses:horses.data||[],invoices:invoices.data||[]});}
  function resultText(r){return String(r.result||"").trim().toLowerCase();} function isWin(r){const x=resultText(r);return x==="1"||x==="1st"||x.includes("win")||x.includes("won");} function isPlacing(r){const x=resultText(r);return ["1","1st","2","2nd","3","3rd"].includes(x)||x.includes("win")||x.includes("won");}
  const completed=data.races.filter(r=>r.status==="Completed"); const totalPrizemoney=completed.reduce((s,r)=>s+Number(r.prizemoney||0),0); const financeIncome=data.finance.filter(f=>f.entry_type==="Income").reduce((s,f)=>s+Number(f.amount||0),0); const expenses=data.finance.filter(f=>f.entry_type==="Expense").reduce((s,f)=>s+Number(f.amount||0),0); const income=financeIncome+totalPrizemoney; const wins=completed.filter(isWin).length; const placings=completed.filter(isPlacing).length; const starts=completed.length;
  return <main className="page"><section className="module-header"><div className="module-icon"><BarChart3 size={24}/></div><div><h2>Analytics</h2><p>Income, expenses, net, work entries, starts, wins, placings and prizemoney.</p></div></section><section className="stats analytics-stats"><Stat icon={DollarSign} label="Income" value={`$${income.toLocaleString()}`}/><Stat icon={DollarSign} label="Expenses" value={`$${expenses.toLocaleString()}`}/><Stat icon={BarChart3} label="Net" value={`$${(income-expenses).toLocaleString()}`}/><Stat icon={ClipboardList} label="Work Entries" value={data.work.length}/><Stat icon={Trophy} label="Race Starts" value={starts}/><Stat icon={Trophy} label="Wins" value={wins}/><Stat icon={Trophy} label="Placings" value={placings}/><Stat icon={DollarSign} label="Prizemoney" value={`$${totalPrizemoney.toLocaleString()}`}/></section><section className="grid">{data.horses.map(h=>{const races=data.races.filter(r=>r.horse_name===h.name&&r.status==="Completed"); const pm=races.reduce((s,r)=>s+Number(r.prizemoney||0),0); return <article className="record" key={h.id}><h3>{h.name}</h3><div className="details"><div><span>Work Entries</span><strong>{data.work.filter(w=>w.horse_name===h.name).length}</strong></div><div><span>Starts</span><strong>{races.length}</strong></div><div><span>Wins</span><strong>{races.filter(isWin).length}</strong></div><div><span>Placings</span><strong>{races.filter(isPlacing).length}</strong></div><div><span>Prizemoney</span><strong>${pm.toLocaleString()}</strong></div></div></article>;})}</section></main>;}

function HorseProfile({horse,stableId,onClose}){const [data,setData]=useState({work:[],races:[],feed:[],vet:[],gear:[],owners:[],invoices:[]}); useEffect(()=>{load();},[horse.name]); async function load(){const [work,races,feed,vet,gear,owners,invoices]=await Promise.all([supabase.from("work_entries").select("*").eq("stable_id",stableId).eq("horse_name",horse.name).order("date",{ascending:false}),supabase.from("race_records").select("*").eq("stable_id",stableId).eq("horse_name",horse.name).order("date",{ascending:false}),supabase.from("feed_programs").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("treatments").select("*").eq("stable_id",stableId).eq("horse_name",horse.name).order("treatment_date",{ascending:false}),supabase.from("gear_items").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("horse_owners").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("invoices").select("*").eq("stable_id",stableId).eq("horse_name",horse.name)]); setData({work:work.data||[],races:races.data||[],feed:feed.data||[],vet:vet.data||[],gear:gear.data||[],owners:owners.data||[],invoices:invoices.data||[]});}
  async function addOwner(){const ownerName=prompt("Owner name"); const percentage=prompt("Percentage owned"); if(!ownerName||!percentage)return; await supabase.from("horse_owners").insert({stable_id:stableId,horse_name:horse.name,owner_name:ownerName,percentage:Number(percentage)}); load();}
  return <div className="modal-backdrop"><section className="modal profile-modal"><div className="modal-head"><h2>{horse.name}</h2><button onClick={onClose}><X size={20}/></button></div><p className="hint">{horse.stable_name} · {horse.status} · Target: {horse.next_target||"-"}</p><ProfileSection title="Owners / Ownership Shares"><button className="primary" onClick={addOwner}>Add Additional Owner</button>{(data.owners.length?data.owners:[{owner_name:horse.owner,percentage:horse.owner_percentage}]).map((o,i)=><div className="profile-row" key={i}><span>{o.owner_name}</span><strong>{o.percentage||"-"}%</strong></div>)}</ProfileSection><ProfileSection title="Recent Work">{data.work.slice(0,5).map(r=><div className="profile-row" key={r.id}><span>{r.date} · {r.sector}</span><strong>{r.mile_rate||r.overall_time||"-"}</strong></div>)}</ProfileSection><ProfileSection title="Race Results / Targets">{data.races.slice(0,5).map(r=><div className="profile-row" key={r.id}><span>{r.date} · {r.track} · {r.status}</span><strong>{r.result||"-"} ${Number(r.prizemoney||0).toLocaleString()}</strong></div>)}</ProfileSection><ProfileSection title="Feed">{data.feed.map(r=><div className="profile-block" key={r.id}><p>{r.morning_feed}</p><p>{r.lunch_feed}</p><p>{r.night_feed}</p><p>{r.supplements}</p></div>)}</ProfileSection><ProfileSection title="Vet Work">{data.vet.slice(0,5).map(r=><div className="profile-row" key={r.id}><span>{r.treatment_date} · {r.treatment_type}</span><strong>${Number(r.bill_amount||0).toLocaleString()}</strong></div>)}</ProfileSection><ProfileSection title="Gear">{data.gear.map(r=><div className="profile-row" key={r.id}><span>{r.item_name} · {r.category}</span><strong>{r.condition||"-"}</strong></div>)}</ProfileSection><ProfileSection title="Bills / Invoices">{data.invoices.map(r=><div className="profile-row" key={r.id}><span>{r.invoice_number} · {r.client_name}</span><strong>${Number(r.total||0).toLocaleString()}</strong></div>)}</ProfileSection></section></div>;}
function OwnerProfile({owner,stableId,onClose}){const [data,setData]=useState({shares:[],invoices:[]}); useEffect(()=>{load();},[owner.name]); async function load(){const [shares,invoices]=await Promise.all([supabase.from("horse_owners").select("*").eq("stable_id",stableId).eq("owner_name",owner.name),supabase.from("invoices").select("*").eq("stable_id",stableId).eq("client_name",owner.name)]); setData({shares:shares.data||[],invoices:invoices.data||[]});} return <div className="modal-backdrop"><section className="modal profile-modal"><div className="modal-head"><h2>{owner.name}</h2><button onClick={onClose}><X size={20}/></button></div><p className="hint">{owner.email} · {owner.phone}</p><ProfileSection title="Horses / Percentage Owned">{data.shares.map(s=><div className="profile-row" key={s.id}><span>{s.horse_name}</span><strong>{s.percentage}%</strong></div>)}</ProfileSection><ProfileSection title="Invoices">{data.invoices.map(i=><div className="profile-row" key={i.id}><span>{i.invoice_number} · {i.horse_name}</span><strong>${Number(i.total||0).toLocaleString()}</strong></div>)}</ProfileSection></section></div>;}
function ProfileSection({title,children}){return <section className="profile-section"><h3>{title}</h3>{React.Children.count(children)?children:<p className="hint">No records yet.</p>}</section>;}

function RecordModal({title,fields,record,horses,owners,onClose,onSave}){const [form,setForm]=useState(record); return <div className="modal-backdrop"><section className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={20}/></button></div><div className="form-grid">{fields.filter(([_k,_l,type])=>type!=="conditionalWarmup"||WARMUP_SECTORS.includes(form.sector)).map(([k,l,t,o])=><Field key={k} label={l}><Input type={t} options={o} value={form[k]??""} horses={horses} owners={owners} onChange={v=>setForm(c=>({...c,[k]:v}))}/></Field>)}</div><button className="primary full" onClick={()=>onSave(form)}>Save</button></section></div>;}
function Invoices({stableId,setToast}){const [rows,setRows]=useState([]),[horses,setHorses]=useState([]),[modal,setModal]=useState(null),[printInvoice,setPrintInvoice]=useState(null),[shareModal,setShareModal]=useState(null); useEffect(()=>{if(stableId)load();},[stableId]); async function load(){const {data,error}=await supabase.from("invoices").select("*").eq("stable_id",stableId).order("created_at",{ascending:false}); if(error)setToast(error.message); setRows(data||[]); const h=await supabase.from("horses").select("name").eq("stable_id",stableId); setHorses(h.data||[]);}
  function blank(){return{invoice_number:`INV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${String(rows.length+1).padStart(3,"0")}`,client_name:"",client_email:"",client_phone:"",horse_name:horses[0]?.name||"",due_date:new Date(Date.now()+14*86400000).toISOString().slice(0,10),status:"Draft",notes:"",line_items:[{id:crypto.randomUUID(),description:"",quantity:1,unit_price:0}]};}
  async function save(inv,mode){const totals=invoiceTotals(inv); const clean={...inv,stable_id:stableId,amount:totals.subtotal,gst:totals.gst,total:totals.total}; const result=mode==="edit"?await supabase.from("invoices").update(clean).eq("id",clean.id).eq("stable_id",stableId):await supabase.from("invoices").insert(clean); if(result.error)setToast(result.error.message); else{setToast("Invoice saved."); setModal(null); load();}}
  async function remove(id){await supabase.from("invoices").delete().eq("id",id).eq("stable_id",stableId); load();}
  return <main className="page"><section className="module-header"><div className="module-icon"><FileText size={24}/></div><div><h2>Invoices</h2><p>Clear invoice numbers, print, share and owner percentage billing.</p></div></section><section className="toolbar"><button className="primary" onClick={()=>setModal({mode:"add",invoice:blank()})}><Plus size={18}/>Create Invoice</button></section><section className="grid">{rows.map(inv=>{const totals=invoiceTotals(inv); return <article className="record" key={inv.id}><div className="record-head"><div><h3>{inv.invoice_number}</h3><p>{inv.client_name} · {inv.horse_name}</p></div><div className="button-row"><button className="edit" onClick={()=>setModal({mode:"edit",invoice:inv})}><Edit3 size={16}/></button><button className="print" onClick={()=>setPrintInvoice(inv)}><Printer size={16}/></button><button className="share" onClick={()=>setShareModal(inv)}><Share2 size={16}/></button><button className="delete" onClick={()=>remove(inv.id)}><Trash2 size={16}/></button></div></div><div className="details"><div><span>Status</span><strong>{inv.status}</strong></div><div><span>Due</span><strong>{inv.due_date}</strong></div><div><span>Email</span><strong>{inv.client_email||"-"}</strong></div><div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></div></article>;})}</section>{modal&&<InvoiceModal modal={modal} horses={horses} onClose={()=>setModal(null)} onSave={save}/>} {printInvoice&&<InvoicePrint invoice={printInvoice} onClose={()=>setPrintInvoice(null)}/>} {shareModal&&<ShareInvoice invoice={shareModal} onClose={()=>setShareModal(null)} setToast={setToast}/>}</main>;}
function ShareInvoice({invoice,onClose,setToast}){const totals=invoiceTotals(invoice); const message=`Hi ${invoice.client_name||""},\n\nPlease find invoice ${invoice.invoice_number} for ${invoice.horse_name}.\n\nTotal: $${totals.total.toFixed(2)}\nDue: ${invoice.due_date}`; async function phoneShare(){if(navigator.share)await navigator.share({title:`Invoice ${invoice.invoice_number}`,text:message});else{await navigator.clipboard.writeText(message);setToast("Invoice text copied.");}} async function email(){const res=await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:invoice.client_email,subject:`Invoice ${invoice.invoice_number}`,message})});setToast(res.ok?"Email sent/demo sent.":"Email failed.");onClose();} return <div className="modal-backdrop"><section className="modal"><div className="modal-head"><h2>Share Invoice</h2><button onClick={onClose}><X size={20}/></button></div><label className="field"><span>Message</span><textarea value={message} readOnly/></label><div className="button-row wide"><button className="primary" onClick={phoneShare}><Share2 size={18}/>Phone Share Sheet</button><button className="primary" onClick={email}><Mail size={18}/>Send Email / Demo API</button></div></section></div>;}
function InvoiceModal({modal,horses,onClose,onSave}){const [inv,setInv]=useState(modal.invoice); const totals=invoiceTotals(inv); function setField(k,v){setInv(c=>({...c,[k]:v}));} function setLine(id,k,v){setInv(c=>({...c,line_items:(c.line_items||[]).map(li=>li.id===id?{...li,[k]:v}:li)}));} function addLine(){setInv(c=>({...c,line_items:[...(c.line_items||[]),{id:crypto.randomUUID(),description:"",quantity:1,unit_price:0}]}));} function removeLine(id){setInv(c=>({...c,line_items:(c.line_items||[]).filter(li=>li.id!==id)}));} return <div className="modal-backdrop"><section className="modal invoice-modal"><div className="modal-head"><h2>{modal.mode==="edit"?"Edit":"Create"} Invoice</h2><button onClick={onClose}><X size={20}/></button></div><div className="form-grid"><Field label="Invoice Number"><input value={inv.invoice_number||""} onChange={e=>setField("invoice_number",e.target.value)}/></Field><Field label="Client Name"><input value={inv.client_name||""} onChange={e=>setField("client_name",e.target.value)}/></Field><Field label="Client Email"><input value={inv.client_email||""} onChange={e=>setField("client_email",e.target.value)}/></Field><Field label="Client Phone"><input value={inv.client_phone||""} onChange={e=>setField("client_phone",e.target.value)}/></Field><Field label="Horse"><select value={inv.horse_name||""} onChange={e=>setField("horse_name",e.target.value)}>{horses.map(h=><option key={h.name}>{h.name}</option>)}</select></Field><Field label="Due Date"><input type="date" value={inv.due_date||""} onChange={e=>setField("due_date",e.target.value)}/></Field><Field label="Status"><select value={inv.status||"Draft"} onChange={e=>setField("status",e.target.value)}><option>Draft</option><option>Sent</option><option>Part Paid</option><option>Paid</option><option>Overdue</option></select></Field><Field label="Notes"><textarea value={inv.notes||""} onChange={e=>setField("notes",e.target.value)}/></Field></div><section className="invoice-lines"><div className="section-title"><h3>Line Items</h3><button className="text" onClick={addLine}>+ Add Line</button></div>{(inv.line_items||[]).map(li=><div className="line-item" key={li.id}><input placeholder="Description" value={li.description||""} onChange={e=>setLine(li.id,"description",e.target.value)}/><input type="number" placeholder="Qty" value={li.quantity||0} onChange={e=>setLine(li.id,"quantity",e.target.value)}/><input type="number" placeholder="Unit $" value={li.unit_price||0} onChange={e=>setLine(li.id,"unit_price",e.target.value)}/><strong>${(Number(li.quantity||0)*Number(li.unit_price||0)).toFixed(2)}</strong><button className="delete small" onClick={()=>removeLine(li.id)}><Trash2 size={14}/></button></div>)}</section><section className="invoice-totals"><div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></section><button className="primary full" onClick={()=>onSave(inv,modal.mode)}>Save Invoice</button></section></div>;}
function InvoicePrint({invoice,onClose}){const totals=invoiceTotals(invoice); return <div className="print-backdrop"><section className="print-actions"><button className="primary" onClick={()=>window.print()}><Printer size={18}/>Print / Save PDF</button><button className="danger" onClick={onClose}>Close</button></section><main className="invoice-print"><header className="invoice-print-head"><div><h1>Invoice</h1><p>The Trotting Stable App</p></div><div><strong>{invoice.invoice_number}</strong><p>Status: {invoice.status}</p></div></header><section className="invoice-print-grid"><div><h3>Bill To</h3><p>{invoice.client_name}</p><p>{invoice.client_email}</p><p>{invoice.client_phone}</p><p>{invoice.horse_name}</p></div><div><h3>Dates</h3><p>Due: {invoice.due_date}</p></div></section><table className="invoice-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{(invoice.line_items||[]).map(li=><tr key={li.id}><td>{li.description}</td><td>{li.quantity}</td><td>${Number(li.unit_price||0).toFixed(2)}</td><td>${(Number(li.quantity||0)*Number(li.unit_price||0)).toFixed(2)}</td></tr>)}</tbody></table><section className="invoice-print-totals"><div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div className="grand"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></section></main></div>;}

function Input({type,options,value,horses,owners,onChange}){if(type==="textarea"||type==="conditionalWarmup")return <textarea value={value} onChange={e=>onChange(e.target.value)}/>; if(type==="select")return <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>; if(type==="horseName")return <select value={value} onChange={e=>onChange(e.target.value)}>{horses.map(h=><option key={h.name}>{h.name}</option>)}</select>; if(type==="ownerName")return <select value={value} onChange={e=>onChange(e.target.value)}>{owners.map(o=><option key={o.name}>{o.name}</option>)}</select>; return <input type={type} value={value} onChange={e=>onChange(e.target.value)}/>;}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>;}
function NavButton({active,onClick,icon:Icon,label}){return <button className={active?"active":""} onClick={onClick}><Icon size={15}/>{label}</button>;}
function Stat({icon:Icon,label,value}){return <section className="stat"><div><Icon size={22}/></div><p>{label}</p><strong>{value}</strong></section>;}
function invoiceTotals(inv){const subtotal=(inv.line_items||[]).reduce((s,li)=>s+Number(li.quantity||0)*Number(li.unit_price||0),0); const gst=subtotal*GST_RATE; return{subtotal,gst,total:subtotal+gst};}
function splitLines(value){return String(value||"").split(/\n|,/).map(v=>v.trim()).filter(Boolean);}
function buildUpdateMessage(update){return [update.title||"Stable Update",update.horse_name?`Horse: ${update.horse_name}`:"","",update.body||"",splitLines(update.photo_urls).length?`Photos:\n${splitLines(update.photo_urls).join("\n")}`:"",splitLines(update.video_urls).length?`Videos:\n${splitLines(update.video_urls).join("\n")}`:"",splitLines(update.link_urls).length?`Links:\n${splitLines(update.link_urls).join("\n")}`:""].filter(Boolean).join("\n");}
function labelize(v){return v.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase());}
function formatValue(v){if(v===null||v===undefined||v==="")return "-"; return String(v);}
createRoot(document.getElementById("root")).render(<App/>);
