import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck, BarChart3, CalendarDays, ClipboardList, DollarSign, Edit3,
  FileText, HeartPulse, Home, LogOut, Mail, Megaphone, Package, Plus, Printer,
  Search, Share2, ShieldCheck, Trash2, Trophy, Users, Wheat, X, ChevronRight,
  Sparkles, BriefcaseBusiness, Calendar
} from "lucide-react";
import "./styles.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const GST_RATE = 0.1;
const photos = ["/login-photos/photo-1.jpg","/login-photos/photo-2.jpg","/login-photos/photo-3.jpg","/login-photos/photo-4.jpg"];

const workSectorOptions = ["Jog - Cart","Jog- Lead","Jog- Jogger Machine","Jog/Canter","Gallop","Trot","Hopple","Walking Machine","Water Walk","Race","Trial","Educational Trial","Swim","Beach Work","Recovery"];
const warmupRequiredSectors = ["Jog/Canter","Gallop","Trot","Hopple"];

const modules = {
  horses:{table:"horses",title:"Horses",subtitle:"Profiles, multi-owner shares and targets",icon:BadgeCheck,fields:[["name","Registered Name","text"],["stable_name","Stable Name","text"],["age","Age","number"],["sex","Sex","select",["Gelding","Mare","Horse","Colt","Filly"]],["owner","Primary Owner","ownerName"],["owner_percentage","Primary Owner %","number"],["trainer","Trainer","text"],["status","Status","select",["Racing","Building","Trialling","Spelling","Rehab","Sold","Retired"]],["next_target","Next Target","text"],["notes","Notes","textarea"]],display:["stable_name","age","sex","owner","owner_percentage","trainer","status","next_target","notes"],profile:true},
  work:{table:"work_entries",title:"Work",subtitle:"Track work, warm-ups and sectionals",icon:ClipboardList,calendarField:"date",fields:[["date","Date","date"],["horse_name","Horse","horseName"],["sector","Work Sector","select",workSectorOptions],["warmup","Warm Up Options / Details","conditionalWarmup"],["distance","Distance","text"],["overall_time","Overall Time","text"],["mile_rate","Mile Rate","text"],["last_half","Last Half","text"],["last_quarter","Last Quarter","text"],["driver","Driver","text"],["recovery","Recovery/Heart Rate","text"],["notes","Notes","textarea"]],display:["date","horse_name","sector","warmup","distance","overall_time","mile_rate","last_half","last_quarter","driver","recovery","notes"]},
  racing:{table:"race_records",title:"Racing",subtitle:"Targets, nominations, results and prizemoney",icon:Trophy,calendarField:"date",fields:[["date","Date","date"],["horse_name","Horse","horseName"],["track","Track","text"],["race","Race/Class","text"],["distance","Distance","text"],["status","Status","select",["Target","Nominated","Accepted","Scratched","Completed"]],["driver","Driver","text"],["result","Result","text"],["prizemoney","Prizemoney","number"],["notes","Notes","textarea"]],display:["date","horse_name","track","race","distance","status","driver","result","prizemoney","notes"]},
  treatments:{table:"treatments",title:"Vet",subtitle:"Treatments, bills and follow-ups",icon:HeartPulse,calendarField:"treatment_date",expenseCapable:true,fields:[["treatment_date","Date","date"],["horse_name","Horse","horseName"],["treatment_type","Treatment","text"],["veterinarian","Vet","text"],["bill_amount","Bill Amount","number"],["bill_to_owners","Add to owner invoices?","select",["No","Yes"]],["follow_up_date","Follow Up","date"],["notes","Notes","textarea"]],display:["treatment_date","horse_name","treatment_type","veterinarian","bill_amount","bill_to_owners","follow_up_date","notes"]},
  feed:{table:"feed_programs",title:"Feed",subtitle:"Morning, lunch, night and supplements",icon:Wheat,fields:[["horse_name","Horse","horseName"],["morning_feed","Morning Feed","textarea"],["lunch_feed","Lunch Feed","textarea"],["night_feed","Night Feed","textarea"],["supplements","Supplements","textarea"],["notes","Notes","textarea"]],display:["horse_name","morning_feed","lunch_feed","night_feed","supplements","notes"]},
  finance:{table:"finance_entries",title:"Finance",subtitle:"Income, expenses and paid status",icon:DollarSign,calendarField:"entry_date",expenseCapable:true,fields:[["entry_date","Date","date"],["horse_name","Horse","horseName"],["entry_type","Type","select",["Income","Expense"]],["category","Category","text"],["amount","Amount","number"],["paid","Paid","select",["Yes","No"]],["bill_to_owners","Add expense to owner invoices?","select",["No","Yes"]],["notes","Notes","textarea"]],display:["entry_date","horse_name","entry_type","category","amount","paid","bill_to_owners","notes"]},
  owners:{table:"owners",title:"Owners",subtitle:"Owner contacts, horses and percentages",icon:Users,ownerProfile:true,fields:[["name","Owner Name","text"],["email","Email","email"],["phone","Phone","text"],["role","Role","select",["owner","staff","trainer","admin"]],["notes","Notes","textarea"]],display:["email","phone","role","notes"]},
  ownerPortal:{table:"owner_portal_items",title:"Owner Portal",subtitle:"Owner-facing horse updates and portal content",icon:BriefcaseBusiness,fields:[["owner_name","Owner Name","ownerName"],["owner_email","Owner Email","email"],["horse_name","Horse","horseName"],["update_title","Update Title","text"],["update_body","Update Body","textarea"],["visibility","Visibility","select",["owner","stable","draft"]]],display:["owner_email","horse_name","update_title","visibility","update_body"]},
  gear:{table:"gear_items",title:"Gear",subtitle:"Gear assignment, sizes, colours and location",icon:Package,fields:[["item_name","Item","text"],["horse_name","Horse","horseName"],["category","Category","select",["Hopples","Bridle","Bit","Boots","Harness","Sulky","Driving Gear","Rug","Other"]],["size","Size","text"],["colour","Colour","text"],["condition","Condition","select",["Excellent","Good","Fair","Needs Repair","Retired"]],["location","Location","text"],["assigned_to","Assigned To","text"],["notes","Notes","textarea"]],display:["horse_name","category","size","colour","condition","location","assigned_to","notes"]},
  inventory:{table:"inventory",title:"Inventory",subtitle:"Feed, medical and supplies",icon:Package,fields:[["item_name","Item","text"],["category","Category","text"],["quantity","Quantity","number"],["supplier","Supplier","text"],["reorder_level","Reorder Level","number"],["notes","Notes","textarea"]],display:["category","quantity","supplier","reorder_level","notes"]},
  staff:{table:"staff",title:"Staff",subtitle:"Drivers, workers and contacts",icon:ShieldCheck,fields:[["full_name","Name","text"],["role","Role","text"],["phone","Phone","text"],["email","Email","email"],["notes","Notes","textarea"]],display:["role","phone","email","notes"]},
  updates:{table:"updates",title:"Updates",subtitle:"Photos, videos, links and owner communication",icon:Megaphone,fields:[["title","Title","text"],["horse_name","Horse","horseName"],["category","Category","select",["Stable Update","Owner Update","Race Update","Vet Update","Work Update","General"]],["body","Update Message","textarea"],["photo_urls","Photo URLs","textarea"],["video_urls","Video URLs","textarea"],["link_urls","Links","textarea"],["visibility","Visibility","select",["internal","owners","public-preview"]],["send_status","Send Status","select",["Draft","Ready To Send","Sent"]]],display:["horse_name","category","visibility","send_status","body","photo_urls","video_urls","link_urls"]}
};

function App(){
  const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[stable,setStable]=useState(null);
  const [view,setView]=useState("landing"),[tab,setTab]=useState("dashboard"),[loading,setLoading]=useState(true),[toast,setToast]=useState("");
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session||null);setLoading(false)});const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);setView(s?"app":"landing")});return()=>l.subscription.unsubscribe()},[]);
  useEffect(()=>{if(session?.user)loadProfile()},[session?.user?.id]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),4200);return()=>clearTimeout(t)},[toast]);
  async function loadProfile(){const {data,error}=await supabase.from("profiles").select("*, stables(*)").eq("id",session.user.id).single();if(error){setToast("Login works, but this user is not linked to a stable profile yet.");return}setProfile(data);setStable(data.stables)}
  if(loading)return <div className="center">Loading...</div>;
  if(!session&&view==="login")return <Login onBack={()=>setView("landing")}/>;
  if(!session&&view==="invite")return <InviteSignup onBack={()=>setView("landing")} setToast={setToast}/>;
  if(!session)return <Landing onLogin={()=>setView("login")} onInvite={()=>setView("invite")}/>;
  return <div className="app"><header className="topbar"><div><h1>The Trotting Stable App</h1><p>{stable?.name||"Stable"} · {profile?.role||"user"}</p></div><button className="ghost" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/>Logout</button></header>{toast&&<div className="toast" onClick={()=>setToast("")}>{toast}</div>}<nav className="nav"><NavButton active={tab==="dashboard"} onClick={()=>setTab("dashboard")} icon={Home} label="Home"/>{Object.entries(modules).map(([k,m])=><NavButton key={k} active={tab===k} onClick={()=>setTab(k)} icon={m.icon} label={m.title}/>)}
  <NavButton active={tab==="analytics"} onClick={()=>setTab("analytics")} icon={BarChart3} label="Analytics"/><NavButton active={tab==="invoices"} onClick={()=>setTab("invoices")} icon={FileText} label="Invoices"/></nav>
  {tab==="dashboard"&&<Dashboard stableId={profile?.stable_id} setTab={setTab}/>}
  {tab==="work"&&<Work stableId={profile?.stable_id} setToast={setToast}/>}
  {tab==="analytics"&&<Analytics stableId={profile?.stable_id}/>}
  {tab==="updates"&&<UpdatesPanel stableId={profile?.stable_id} setToast={setToast}/>}
  {tab!=="dashboard"&&tab!=="work"&&tab!=="analytics"&&tab!=="updates"&&modules[tab]&&<GenericTable stableId={profile?.stable_id} config={modules[tab]} setToast={setToast}/>}
  {tab==="invoices"&&<Invoices stableId={profile?.stable_id} setToast={setToast}/>}
  </div>
}

function Landing({onLogin,onInvite}){return <main className="landing"><PhotoReel/><header className="landing-nav"><strong>The Trotting Stable App</strong><div><button className="ghost dark" onClick={onLogin}>Log In</button><button className="primary light" onClick={onInvite}>Join With Invite Code</button></div></header><section className="hero"><p className="eyebrow">Harness racing stable software</p><h1>Stable operations, owner portals, work records and invoices.</h1><p>Track horses, work, jogger machine sessions, treatments, feed, racing, owners, gear, analytics and invoices from one secure app.</p><div className="hero-actions"><button className="primary light" onClick={onInvite}>Join With Invite Code</button><button className="ghost dark" onClick={onLogin}>Stable Login</button></div></section><section className="feature-grid">{[["Horse Profiles","Tap into work, races, feed, vet, gear, owners and bills."],["Owner Percentages","Split expenses automatically by ownership share."],["Analytics","Income, expenses, net, work entries and race result stats."],["Calendar Views","Flip key tabs into calendar mode by day."],["Invoices","Clear invoice numbers, owner line items and share/print tools."],["Secure by Stable","Invite-only accounts and stable-separated data."]].map(([h,p])=><article className="feature-card" key={h}><h3>{h}</h3><p>{p}</p></article>)}</section></main>}
function PhotoReel(){const[i,setI]=useState(0);useEffect(()=>{const t=setInterval(()=>setI(v=>(v+1)%photos.length),4500);return()=>clearInterval(t)},[]);return <div className="photo-reel" style={{backgroundImage:`url(${photos[i]})`}}/>}
function Login({onBack}){const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[msg,setMsg]=useState("");async function submit(e){e.preventDefault();setMsg("");const{error}=await supabase.auth.signInWithPassword({email,password});if(error)setMsg(error.message)}return <main className="login-screen"><PhotoReel/><section className="login-card"><button className="text" onClick={onBack}>← Back</button><h1>Stable Login</h1><p>Invite-only access for stables, owners and staff.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary full">Login</button></form>{msg&&<p className="error">{msg}</p>}</section></main>}
function InviteSignup({onBack,setToast}){const[code,setCode]=useState(""),[fullName,setFullName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");async function submit(e){e.preventDefault();const{data:invite,error:ie}=await supabase.from("invite_codes").select("*").eq("code",code.trim()).is("used_by",null).single();if(ie||!invite){setToast("Invalid or used invite code.");return}const{data,error}=await supabase.auth.signUp({email,password});if(error){setToast(error.message);return}const uid=data.user?.id;if(!uid){setToast("Account created. Check email confirmation.");return}await supabase.from("profiles").insert({id:uid,stable_id:invite.stable_id,role:invite.role,full_name:fullName});await supabase.from("invite_codes").update({used_by:uid,used_at:new Date().toISOString()}).eq("id",invite.id);setToast("Account created. Log in now.");onBack()}return <main className="login-screen"><PhotoReel/><section className="login-card"><button className="text" onClick={onBack}>← Back</button><h1>Join With Invite Code</h1><p>Only invited users can create accounts.</p><form onSubmit={submit}><label>Invite Code<input value={code} onChange={e=>setCode(e.target.value)}/></label><label>Full Name<input value={fullName} onChange={e=>setFullName(e.target.value)}/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary full">Create Account</button></form></section></main>}

function Dashboard({stableId,setTab}){const[counts,setCounts]=useState({horses:0,work:0,invoices:0,finance:0,owners:0,gear:0});useEffect(()=>{if(stableId)load()},[stableId]);async function count(t){const{count}=await supabase.from(t).select("*",{count:"exact",head:true}).eq("stable_id",stableId);return count||0}async function load(){const[h,w,i,f,o,g]=await Promise.all([count("horses"),count("work_entries"),count("invoices"),count("finance_entries"),count("owners"),count("gear_items")]);setCounts({horses:h,work:w,invoices:i,finance:f,owners:o,gear:g})}return <main className="page"><section className="hero-panel"><div><p className="eyebrow dark-text">Stable command centre</p><h2>Everything important, in one place.</h2><p>Operations, owners, gear, analytics, invoices and work history.</p></div><Sparkles size={42}/></section><section className="stats"><Stat icon={BadgeCheck} label="Horses" value={counts.horses}/><Stat icon={ClipboardList} label="Work" value={counts.work}/><Stat icon={Users} label="Owners" value={counts.owners}/><Stat icon={Package} label="Gear" value={counts.gear}/><Stat icon={FileText} label="Invoices" value={counts.invoices}/><Stat icon={DollarSign} label="Finance" value={counts.finance}/></section><section className="quick-grid">{[["Horse Profiles","horses"],["Work Log","work"],["Owner Portal","ownerPortal"],["Analytics","analytics"],["Gear","gear"],["Racing","racing"],["Vet","treatments"],["Feed","feed"],["Invoices","invoices"],["Inventory","inventory"],["Staff","staff"],["Updates","updates"]].map(([l,k])=><button key={k} className="quick" onClick={()=>setTab(k)}><span>{l}</span><ChevronRight size={18}/></button>)}</section></main>}

function Analytics({stableId}){const [data,setData]=useState({finance:[],work:[],races:[],horses:[],invoices:[]});useEffect(()=>{if(stableId)load()},[stableId]);async function load(){const [finance,work,races,horses,invoices]=await Promise.all([supabase.from("finance_entries").select("*").eq("stable_id",stableId),supabase.from("work_entries").select("*").eq("stable_id",stableId),supabase.from("race_records").select("*").eq("stable_id",stableId),supabase.from("horses").select("*").eq("stable_id",stableId),supabase.from("invoices").select("*").eq("stable_id",stableId)]);setData({finance:finance.data||[],work:work.data||[],races:races.data||[],horses:horses.data||[],invoices:invoices.data||[]})}const income=data.finance.filter(f=>f.entry_type==="Income").reduce((s,f)=>s+Number(f.amount||0),0)+data.races.filter(r=>r.status==="Completed").reduce((s,r)=>s+Number(r.prizemoney||0),0);const expenses=data.finance.filter(f=>f.entry_type==="Expense").reduce((s,f)=>s+Number(f.amount||0),0);const completed=data.races.filter(r=>r.status==="Completed");const wins=completed.filter(r=>String(r.result||"").toLowerCase().includes("1")||String(r.result||"").toLowerCase().includes("win")).length;return <main className="page"><section className="module-header"><div className="module-icon"><BarChart3 size={24}/></div><div><h2>Analytics</h2><p>Income, expenses, net, work volume and race performance.</p></div></section><section className="stats"><Stat icon={DollarSign} label="Income" value={`$${income.toLocaleString()}`}/><Stat icon={DollarSign} label="Expenses" value={`$${expenses.toLocaleString()}`}/><Stat icon={BarChart3} label="Net" value={`$${(income-expenses).toLocaleString()}`}/><Stat icon={ClipboardList} label="Work Entries" value={data.work.length}/><Stat icon={Trophy} label="Completed Races" value={completed.length}/><Stat icon={Trophy} label="Wins/1sts" value={wins}/></section><section className="grid">{data.horses.map(h=>{const works=data.work.filter(w=>w.horse_name===h.name);const races=data.races.filter(r=>r.horse_name===h.name);const pm=races.reduce((s,r)=>s+Number(r.prizemoney||0),0);const inv=data.invoices.filter(i=>i.horse_name===h.name).reduce((s,i)=>s+Number(i.total||0),0);return <article className="record" key={h.id}><h3>{h.name}</h3><div className="details"><div><span>Work Entries</span><strong>{works.length}</strong></div><div><span>Race Starts</span><strong>{races.length}</strong></div><div><span>Prizemoney</span><strong>${pm.toLocaleString()}</strong></div><div><span>Invoiced</span><strong>${inv.toLocaleString()}</strong></div></div></article>})}</section></main>}

function Work({stableId,setToast}){const[horses,setHorses]=useState([]),[selected,setSelected]=useState("");useEffect(()=>{if(!stableId)return;supabase.from("horses").select("name").eq("stable_id",stableId).then(({data})=>{setHorses(data||[]);if(data?.[0]?.name&&!selected)setSelected(data[0].name)})},[stableId]);return <main className="page"><WorkHistory stableId={stableId} horses={horses} selected={selected} setSelected={setSelected}/><GenericTable stableId={stableId} config={modules.work} setToast={setToast} embedded/></main>}
function WorkHistory({stableId,horses,selected,setSelected}){const[rows,setRows]=useState([]);useEffect(()=>{if(!stableId||!selected)return;supabase.from("work_entries").select("*").eq("stable_id",stableId).eq("horse_name",selected).order("date",{ascending:false}).then(({data})=>setRows(data||[]))},[stableId,selected]);return <section className="card"><div className="section-title"><h2>Single Horse Work History Isolator</h2><select value={selected} onChange={e=>setSelected(e.target.value)}>{horses.map(h=><option key={h.name}>{h.name}</option>)}</select></div><div className="mini-stats"><span>{rows.length} total</span><span>{rows.filter(r=>r.sector==="Race").length} race</span><span>{rows.filter(r=>r.sector==="Jog- Jogger Machine").length} jogger machine</span><span>{rows.filter(r=>r.warmup).length} warm-ups</span></div><div className="list">{rows.slice(0,8).map(r=><article className="mini-work" key={r.id}><strong>{r.date} · {r.sector}</strong><span>{r.distance?`Distance: ${r.distance}`:""} {r.overall_time?`· Overall: ${r.overall_time}`:""} {r.mile_rate?`· Mile rate: ${r.mile_rate}`:""} {r.last_half?`· Last half: ${r.last_half}`:""} {r.last_quarter?`· Last quarter: ${r.last_quarter}`:""}</span>{r.warmup&&<em>Warm-up: {r.warmup}</em>}</article>)}</div></section>}


function RealCalendar({rows,dateField,selectedDate,setSelectedDate}){
  const today = new Date();
  const [cursor,setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthName = cursor.toLocaleString("en-AU", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d));
  while(cells.length % 7 !== 0) cells.push(null);

  function toIso(date){
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }

  function countFor(date){
    if(!date) return 0;
    const iso = toIso(date);
    return rows.filter(r=>r[dateField]===iso).length;
  }

  return <section className="real-calendar">
    <div className="calendar-head">
      <button className="ghost" onClick={()=>setCursor(new Date(year, month-1, 1))}>←</button>
      <div>
        <h3>{monthName}</h3>
        {selectedDate ? <p>Showing {selectedDate}</p> : <p>Tap a date to view that day's records</p>}
      </div>
      <button className="ghost" onClick={()=>setCursor(new Date(year, month+1, 1))}>→</button>
    </div>
    <button className="text clear-date" onClick={()=>setSelectedDate("")}>Show all records</button>
    <div className="calendar-weekdays">
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=><span key={day}>{day}</span>)}
    </div>
    <div className="calendar-grid">
      {cells.map((date,idx)=>{
        const iso = date ? toIso(date) : "";
        const recordCount = date ? countFor(date) : 0;
        return <button
          key={idx}
          disabled={!date}
          className={`${selectedDate===iso ? "selected" : ""} ${recordCount ? "has-records" : ""}`}
          onClick={()=>{
            if(!date) return;
            setSelectedDate(iso);
            setTimeout(()=>{
              document.querySelector(".grid")?.scrollIntoView({behavior:"smooth",block:"start"});
            },50);
          }}
        >
          {date && <strong>{date.getDate()}</strong>}
          {recordCount>0 && <small>{recordCount}</small>}
        </button>
      })}
    </div>
  </section>
}


function UpdatesPanel({stableId,setToast}){
  const config = modules.updates;
  const [rows,setRows]=useState([]),[horses,setHorses]=useState([]),[owners,setOwners]=useState([]),[search,setSearch]=useState(""),[modal,setModal]=useState(null),[sendModal,setSendModal]=useState(null);

  useEffect(()=>{if(stableId)load()},[stableId]);

  async function load(){
    const [updates,horsesRes,ownersRes]=await Promise.all([
      supabase.from("updates").select("*").eq("stable_id",stableId).order("created_at",{ascending:false}),
      supabase.from("horses").select("name,owner,owner_percentage").eq("stable_id",stableId),
      supabase.from("owners").select("name,email,phone").eq("stable_id",stableId)
    ]);
    if(updates.error)setToast(updates.error.message);
    setRows(updates.data||[]);
    setHorses(horsesRes.data||[]);
    setOwners(ownersRes.data||[]);
  }

  function blank(){
    return {
      title:"",
      horse_name:horses[0]?.name||"",
      category:"Owner Update",
      body:"",
      photo_urls:"",
      video_urls:"",
      link_urls:"",
      visibility:"owners",
      send_status:"Draft"
    };
  }

  async function save(record,mode){
    const clean={...record,stable_id:stableId};
    const result=mode==="edit"
      ? await supabase.from("updates").update(clean).eq("id",clean.id).eq("stable_id",stableId)
      : await supabase.from("updates").insert(clean);
    if(result.error)setToast(result.error.message);
    else{setToast("Update saved.");setModal(null);load();}
  }

  async function remove(id){
    const {error}=await supabase.from("updates").delete().eq("id",id).eq("stable_id",stableId);
    if(error)setToast(error.message);
    else load();
  }

  const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  return <main className="page">
    <section className="module-header">
      <div className="module-icon"><Megaphone size={24}/></div>
      <div><h2>Updates</h2><p>Send horse updates with photos, videos and links directly to owners.</p></div>
    </section>
    <section className="toolbar">
      <div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search updates..."/></div>
      <button className="primary" onClick={()=>setModal({mode:"add",record:blank()})}><Plus size={18}/>Create Update</button>
    </section>
    <section className="grid">
      {filtered.map(row=><article className="record" key={row.id}>
        <div className="record-head">
          <div><h3>{row.title||"Update"}</h3><p>{row.horse_name} · {row.category} · {row.send_status||"Draft"}</p></div>
          <div className="button-row">
            <button className="share" onClick={()=>setSendModal(row)}><Share2 size={16}/></button>
            <button className="edit" onClick={()=>setModal({mode:"edit",record:{...row}})}><Edit3 size={16}/></button>
            <button className="delete" onClick={()=>remove(row.id)}><Trash2 size={16}/></button>
          </div>
        </div>
        <div className="details">
          <div><span>Visibility</span><strong>{row.visibility||"-"}</strong></div>
          <div><span>Message</span><strong>{row.body||"-"}</strong></div>
          <div><span>Photos</span><strong>{countLines(row.photo_urls)}</strong></div>
          <div><span>Videos</span><strong>{countLines(row.video_urls)}</strong></div>
          <div><span>Links</span><strong>{countLines(row.link_urls)}</strong></div>
        </div>
        <MediaPreview photos={row.photo_urls} videos={row.video_urls} links={row.link_urls}/>
      </article>)}
    </section>
    {modal&&<RecordModal fields={config.fields} title={`${modal.mode==="edit"?"Edit":"Create"} Update`} record={modal.record} horses={horses} owners={owners} onClose={()=>setModal(null)} onSave={rec=>save(rec,modal.mode)}/>}
    {sendModal&&<SendUpdateModal update={sendModal} stableId={stableId} owners={owners} onClose={()=>setSendModal(null)} setToast={setToast} onSent={load}/>}
  </main>
}

function MediaPreview({photos,videos,links}){
  const photoList=splitLines(photos), videoList=splitLines(videos), linkList=splitLines(links);
  if(!photoList.length&&!videoList.length&&!linkList.length)return null;
  return <section className="media-preview">
    {photoList.map((url,i)=><a key={`p-${i}`} href={url} target="_blank" rel="noreferrer"><img src={url} alt="Update media"/></a>)}
    {videoList.map((url,i)=><a className="media-pill" key={`v-${i}`} href={url} target="_blank" rel="noreferrer">Video {i+1}</a>)}
    {linkList.map((url,i)=><a className="media-pill" key={`l-${i}`} href={url} target="_blank" rel="noreferrer">Link {i+1}</a>)}
  </section>
}

function SendUpdateModal({update,stableId,owners,onClose,setToast,onSent}){
  const [recipients,setRecipients]=useState([]);
  const [selected,setSelected]=useState({});
  const message=buildUpdateMessage(update);

  useEffect(()=>{loadRecipients()},[update.id]);

  async function loadRecipients(){
    let ownerNames=[];
    if(update.horse_name){
      const {data:shares}=await supabase.from("horse_owners").select("owner_name").eq("stable_id",stableId).eq("horse_name",update.horse_name);
      ownerNames=(shares||[]).map(s=>s.owner_name);
      if(!ownerNames.length){
        const {data:horse}=await supabase.from("horses").select("owner").eq("stable_id",stableId).eq("name",update.horse_name).maybeSingle();
        if(horse?.owner) ownerNames=[horse.owner];
      }
    }
    const matched=owners.filter(o=>ownerNames.includes(o.name));
    setRecipients(matched);
    const defaults={};
    matched.forEach(o=>defaults[o.name]=true);
    setSelected(defaults);
  }

  const chosen=recipients.filter(r=>selected[r.name]);

  async function copyMessage(){
    await navigator.clipboard.writeText(message);
    setToast("Update message copied.");
  }

  async function phoneShare(){
    if(navigator.share) await navigator.share({title:update.title||"Stable update",text:message});
    else copyMessage();
  }

  async function emailAll(){
    let sent=0;
    for(const owner of chosen){
      if(!owner.email) continue;
      const res=await fetch("/api/send-invoice-email",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          to:owner.email,
          subject:update.title||`Update for ${update.horse_name}`,
          message,
          invoiceNumber:update.title||"Owner Update"
        })
      });
      if(res.ok) sent++;
    }
    await supabase.from("updates").update({send_status:"Sent"}).eq("id",update.id).eq("stable_id",stableId);
    setToast(sent ? `Email sent/demo sent to ${sent} owner(s).` : "No owner email addresses found.");
    onSent();
    onClose();
  }

  function smsLink(owner){
    const phone=(owner.phone||"").replace(/\s+/g,"");
    return `sms:${phone}?&body=${encodeURIComponent(message)}`;
  }

  function mailLink(owner){
    return `mailto:${owner.email||""}?subject=${encodeURIComponent(update.title||"Stable update")}&body=${encodeURIComponent(message)}`;
  }

  return <div className="modal-backdrop">
    <section className="modal profile-modal">
      <div className="modal-head"><h2>Send Update</h2><button onClick={onClose}><X size={20}/></button></div>
      <p className="hint">{update.horse_name} · {update.title}</p>
      <label className="field"><span>Message Preview</span><textarea value={message} readOnly/></label>
      <section className="profile-section">
        <h3>Owner Recipients</h3>
        {recipients.length?recipients.map(owner=><div className="recipient-row" key={owner.name}>
          <label><input type="checkbox" checked={!!selected[owner.name]} onChange={e=>setSelected(s=>({...s,[owner.name]:e.target.checked}))}/> {owner.name}</label>
          <span>{owner.email||"No email"} · {owner.phone||"No phone"}</span>
          <div className="button-row">
            {owner.phone&&<a className="mini-action" href={smsLink(owner)}>Phone/SMS</a>}
            {owner.email&&<a className="mini-action" href={mailLink(owner)}>Email Link</a>}
          </div>
        </div>):<p className="hint">No owners found for this horse. Attach owners to the horse first.</p>}
      </section>
      <div className="button-row wide">
        <button className="primary" onClick={phoneShare}><Share2 size={18}/>Phone Share Sheet</button>
        <button className="primary" onClick={emailAll}><Mail size={18}/>Send Email / Demo API</button>
        <button className="ghost" onClick={copyMessage}>Copy Message</button>
      </div>
      <p className="hint">Phone/SMS opens your device’s message app. Real email sending requires Resend keys in Vercel.</p>
    </section>
  </div>
}

function buildUpdateMessage(update){
  const parts=[
    update.title||"Stable Update",
    update.horse_name?`Horse: ${update.horse_name}`:"",
    "",
    update.body||"",
    splitLines(update.photo_urls).length?`Photos:\\n${splitLines(update.photo_urls).join("\\n")}`:"",
    splitLines(update.video_urls).length?`Videos:\\n${splitLines(update.video_urls).join("\\n")}`:"",
    splitLines(update.link_urls).length?`Links:\\n${splitLines(update.link_urls).join("\\n")}`:""
  ];
  return parts.filter(Boolean).join("\\n");
}

function splitLines(value){return String(value||"").split(/\\n|,/).map(v=>v.trim()).filter(Boolean)}
function countLines(value){return splitLines(value).length||"-"}

function GenericTable({stableId,config,setToast,embedded=false}){const[rows,setRows]=useState([]),[horses,setHorses]=useState([]),[owners,setOwners]=useState([]),[search,setSearch]=useState(""),[modal,setModal]=useState(null),[calendar,setCalendar]=useState(false),[selectedDate,setSelectedDate]=useState("");useEffect(()=>{if(!stableId)return;load();supabase.from("horses").select("name").eq("stable_id",stableId).then(({data})=>setHorses(data||[]));supabase.from("owners").select("name,email,phone").eq("stable_id",stableId).then(({data})=>setOwners(data||[]))},[stableId,config.table]);async function load(){const{data,error}=await supabase.from(config.table).select("*").eq("stable_id",stableId).order("created_at",{ascending:false});if(error)setToast(error.message);setRows(data||[])}function blank(){const r={};config.fields.forEach(([k,_l,t,o])=>{if(t==="date")r[k]=new Date().toISOString().slice(0,10);else if(t==="number")r[k]="";else if(t==="select")r[k]=o[0];else if(t==="horseName")r[k]=horses[0]?.name||"";else if(t==="ownerName")r[k]=owners[0]?.name||"";else r[k]=""});return r}async function save(rec,mode){const clean={...rec,stable_id:stableId};config.fields.forEach(([k,_l,t])=>{if(t==="number")clean[k]=clean[k]===""?0:Number(clean[k])});const result=mode==="edit"?await supabase.from(config.table).update(clean).eq("id",clean.id).eq("stable_id",stableId):await supabase.from(config.table).insert(clean);if(result.error){setToast(result.error.message);return}await afterSaveAutomation(config,clean,stableId,setToast);setToast("Saved.");setModal(null);load()}async function remove(id){const{error}=await supabase.from(config.table).delete().eq("id",id).eq("stable_id",stableId);if(error)setToast(error.message);else load()}const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));const shown=calendar&&selectedDate&&config.calendarField?filtered.filter(r=>r[config.calendarField]===selectedDate):filtered;const dates=[...new Set(rows.map(r=>config.calendarField?r[config.calendarField]:null).filter(Boolean))].sort();const Icon=config.icon;const content=<><section className="module-header"><div className="module-icon"><Icon size={24}/></div><div><h2>{config.title}</h2><p>{config.subtitle}</p></div></section><section className="toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`}/></div>{config.calendarField&&<button className="ghost" onClick={()=>setCalendar(!calendar)}><Calendar size={18}/>{calendar?"Card View":"Calendar View"}</button>}<button className="primary" onClick={()=>setModal({mode:"add",record:blank()})}><Plus size={18}/>Add</button></section>{calendar&&config.calendarField&&<RealCalendar rows={rows} dateField={config.calendarField} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>}<section className="grid">{shown.map(row=><article className="record clickable" key={row.id} onClick={()=>config.profile?setModal({mode:"profile",record:row}):config.ownerProfile?setModal({mode:"ownerProfile",record:row}):null}><div className="record-head"><div><h3>{row.name||row.horse_name||row.item_name||row.update_title||row.metric_name||row.title||row.full_name||row.entry_date||row.date||"Record"}</h3><p>{row.status||row.work_type||row.category||row.role||row.visibility||""}</p></div><div className="button-row" onClick={e=>e.stopPropagation()}><button className="edit" onClick={()=>setModal({mode:"edit",record:{...row}})}><Edit3 size={16}/></button><button className="delete" onClick={()=>remove(row.id)}><Trash2 size={16}/></button></div></div><div className="details">{config.display.map(k=><div key={k}><span>{labelize(k)}</span><strong>{formatValue(row[k])}</strong></div>)}</div></article>)}</section>{modal&&modal.mode==="profile"&&<HorseProfile horse={modal.record} stableId={stableId} onClose={()=>setModal(null)}/>} {modal&&modal.mode==="ownerProfile"&&<OwnerProfile owner={modal.record} stableId={stableId} onClose={()=>setModal(null)}/>} {modal&&["add","edit"].includes(modal.mode)&&<RecordModal fields={config.fields} title={`${modal.mode==="edit"?"Edit":"Add"} ${config.title}`} record={modal.record} horses={horses} owners={owners} onClose={()=>setModal(null)} onSave={rec=>save(rec,modal.mode)}/>}</>;return embedded?content:<main className="page">{content}</main>}

async function afterSaveAutomation(config, record, stableId, setToast){if(config.table==="finance_entries" && record.entry_type==="Expense" && record.bill_to_owners==="Yes") await addExpenseToOwnerInvoices(stableId, record.horse_name, Number(record.amount||0), record.category||"Expense", record.notes||""); if(config.table==="treatments" && record.bill_to_owners==="Yes" && Number(record.bill_amount||0)>0) await addExpenseToOwnerInvoices(stableId, record.horse_name, Number(record.bill_amount||0), record.treatment_type||"Vet bill", record.notes||"");}
async function addExpenseToOwnerInvoices(stableId, horseName, amount, category, notes){const {data:shares}=await supabase.from("horse_owners").select("*").eq("stable_id",stableId).eq("horse_name",horseName);let ownerShares=shares||[];if(!ownerShares.length){const {data:horse}=await supabase.from("horses").select("*").eq("stable_id",stableId).eq("name",horseName).single();if(horse?.owner)ownerShares=[{owner_name:horse.owner,percentage:Number(horse.owner_percentage||100)}]}for(const share of ownerShares){const pct=Number(share.percentage||0);if(!pct)continue;const charge=amount*pct/100;const {data:owner}=await supabase.from("owners").select("*").eq("stable_id",stableId).eq("name",share.owner_name).maybeSingle();const line={id:crypto.randomUUID(),description:`${category} - ${horseName} (${pct}%)`,quantity:1,unit_price:Number(charge.toFixed(2)),notes};const invoiceNo=`INV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${String(Math.floor(Math.random()*9000)+1000)}`;await supabase.from("invoices").insert({stable_id:stableId,invoice_number:invoiceNo,client_name:share.owner_name,client_email:owner?.email||"",client_phone:owner?.phone||"",horse_name:horseName,due_date:new Date(Date.now()+14*86400000).toISOString().slice(0,10),status:"Draft",notes:`Auto-created from ${category}`,line_items:[line],amount:charge,gst:charge*GST_RATE,total:charge*(1+GST_RATE)});}}

function HorseProfile({horse,stableId,onClose}){const[data,setData]=useState({work:[],races:[],feed:[],vet:[],gear:[],owners:[],invoices:[],finance:[]});useEffect(()=>{load()},[horse.name]);async function load(){const [work,races,feed,vet,gear,owners,invoices,finance]=await Promise.all([supabase.from("work_entries").select("*").eq("stable_id",stableId).eq("horse_name",horse.name).order("date",{ascending:false}),supabase.from("race_records").select("*").eq("stable_id",stableId).eq("horse_name",horse.name).order("date",{ascending:false}),supabase.from("feed_programs").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("treatments").select("*").eq("stable_id",stableId).eq("horse_name",horse.name).order("treatment_date",{ascending:false}),supabase.from("gear_items").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("horse_owners").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("invoices").select("*").eq("stable_id",stableId).eq("horse_name",horse.name),supabase.from("finance_entries").select("*").eq("stable_id",stableId).eq("horse_name",horse.name)]);setData({work:work.data||[],races:races.data||[],feed:feed.data||[],vet:vet.data||[],gear:gear.data||[],owners:owners.data||[],invoices:invoices.data||[],finance:finance.data||[]})}return <div className="modal-backdrop"><section className="modal profile-modal"><div className="modal-head"><h2>{horse.name}</h2><button onClick={onClose}><X size={20}/></button></div><p className="hint">{horse.stable_name} · {horse.status} · Target: {horse.next_target||"-"}</p><ProfileSection title="Owners / Ownership Shares">{(data.owners.length?data.owners:[{owner_name:horse.owner,percentage:horse.owner_percentage}]).map((o,i)=><div className="profile-row" key={i}><span>{o.owner_name}</span><strong>{o.percentage||"-"}%</strong></div>)}
</ProfileSection><ProfileSection title="Add Extra Owners">
<div className="button-row wide">
<button className="primary" onClick={async()=>{
const ownerName = prompt("Owner name");
const percentage = prompt("Percentage owned");
if(!ownerName || !percentage) return;
await supabase.from("horse_owners").insert({
stable_id: stableId,
horse_name: horse.name,
owner_name: ownerName,
percentage: Number(percentage)
});
window.location.reload();
}}>Add Additional Owner</button>
</div>
<ProfileSection title="Recent Work">{data.work.slice(0,5).map(r=><div className="profile-row" key={r.id}><span>{r.date} · {r.sector}</span><strong>{r.mile_rate||r.overall_time||"-"}</strong></div>)}</ProfileSection><ProfileSection title="Race Results / Targets">{data.races.slice(0,5).map(r=><div className="profile-row" key={r.id}><span>{r.date} · {r.track} · {r.status}</span><strong>{r.result||"-"} ${Number(r.prizemoney||0).toLocaleString()}</strong></div>)}</ProfileSection><ProfileSection title="Feed">{data.feed.map(r=><div className="profile-block" key={r.id}><strong>Program</strong><p>{r.morning_feed}</p><p>{r.lunch_feed}</p><p>{r.night_feed}</p><p>{r.supplements}</p></div>)}</ProfileSection><ProfileSection title="Vet Work">{data.vet.slice(0,5).map(r=><div className="profile-row" key={r.id}><span>{r.treatment_date} · {r.treatment_type}</span><strong>${Number(r.bill_amount||0).toLocaleString()}</strong></div>)}</ProfileSection><ProfileSection title="Gear">{data.gear.map(r=><div className="profile-row" key={r.id}><span>{r.item_name} · {r.category}</span><strong>{r.condition||"-"}</strong></div>)}</ProfileSection><ProfileSection title="Bills / Invoices">{data.invoices.map(r=><div className="profile-row" key={r.id}><span>{r.invoice_number} · {r.client_name}</span><strong>${Number(r.total||0).toLocaleString()}</strong></div>)}</ProfileSection></section></div>}
function OwnerProfile({owner,stableId,onClose}){const[data,setData]=useState({shares:[],invoices:[]});useEffect(()=>{load()},[owner.name]);async function load(){const [shares,invoices]=await Promise.all([supabase.from("horse_owners").select("*").eq("stable_id",stableId).eq("owner_name",owner.name),supabase.from("invoices").select("*").eq("stable_id",stableId).eq("client_name",owner.name)]);setData({shares:shares.data||[],invoices:invoices.data||[]})}return <div className="modal-backdrop"><section className="modal profile-modal"><div className="modal-head"><h2>{owner.name}</h2><button onClick={onClose}><X size={20}/></button></div><p className="hint">{owner.email} · {owner.phone}</p><ProfileSection title="Horses / Percentage Owned">{data.shares.map(s=><div className="profile-row" key={s.id}><span>{s.horse_name}</span><strong>{s.percentage}%</strong></div>)}</ProfileSection><ProfileSection title="Invoices">{data.invoices.map(i=><div className="profile-row" key={i.id}><span>{i.invoice_number} · {i.horse_name}</span><strong>${Number(i.total||0).toLocaleString()}</strong></div>)}</ProfileSection></section></div>}
function ProfileSection({title,children}){return <section className="profile-section"><h3>{title}</h3>{React.Children.count(children)?children:<p className="hint">No records yet.</p>}</section>}

function RecordModal({title,fields,record,horses,owners,onClose,onSave}){const[form,setForm]=useState(record);return <div className="modal-backdrop"><section className="modal"><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={20}/></button></div><div className="form-grid">{fields.filter(([k,l,t])=>shouldShowField(t,form)).map(([k,l,t,o])=><Field key={k} label={l}><Input type={t} options={o} value={form[k]??""} horses={horses} owners={owners} onChange={v=>setForm(c=>({...c,[k]:v}))}/></Field>)}</div><button className="primary full" onClick={()=>onSave(form)}>Save</button></section></div>}
function shouldShowField(type,form){if(type!=="conditionalWarmup")return true;return warmupRequiredSectors.includes(form.sector)}
function Invoices({stableId,setToast}){const[rows,setRows]=useState([]),[horses,setHorses]=useState([]),[modal,setModal]=useState(null),[printInvoice,setPrintInvoice]=useState(null),[shareModal,setShareModal]=useState(null);useEffect(()=>{if(stableId)load()},[stableId]);async function load(){const{data,error}=await supabase.from("invoices").select("*").eq("stable_id",stableId).order("created_at",{ascending:false});if(error)setToast(error.message);setRows(data||[]);const h=await supabase.from("horses").select("name").eq("stable_id",stableId);setHorses(h.data||[])}function blank(){return{invoice_number:`INV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${String(rows.length+1).padStart(3,"0")}`,client_name:"",client_email:"",client_phone:"",horse_name:horses[0]?.name||"",due_date:new Date(Date.now()+14*86400000).toISOString().slice(0,10),status:"Draft",notes:"",line_items:[{id:crypto.randomUUID(),description:"",quantity:1,unit_price:0}]}}async function save(inv,mode){const totals=invoiceTotals(inv);const clean={...inv,stable_id:stableId,amount:totals.subtotal,gst:totals.gst,total:totals.total};const result=mode==="edit"?await supabase.from("invoices").update(clean).eq("id",clean.id).eq("stable_id",stableId):await supabase.from("invoices").insert(clean);if(result.error)setToast(result.error.message);else{setToast("Invoice saved.");setModal(null);load()}}async function remove(id){await supabase.from("invoices").delete().eq("id",id).eq("stable_id",stableId);load()}return <main className="page"><section className="module-header"><div className="module-icon"><FileText size={24}/></div><div><h2>Invoices</h2><p>Create, edit, print, share and prepare email invoices.</p></div></section><section className="toolbar"><button className="primary" onClick={()=>setModal({mode:"add",invoice:blank()})}><Plus size={18}/>Create Invoice</button></section><section className="grid">{rows.map(inv=>{const totals=invoiceTotals(inv);return <article className="record" key={inv.id}><div className="record-head"><div><h3>{inv.invoice_number}</h3><p>{inv.client_name} · {inv.horse_name}</p></div><div className="button-row"><button className="edit" onClick={()=>setModal({mode:"edit",invoice:inv})}><Edit3 size={16}/></button><button className="print" onClick={()=>setPrintInvoice(inv)}><Printer size={16}/></button><button className="share" onClick={()=>setShareModal(inv)}><Share2 size={16}/></button><button className="delete" onClick={()=>remove(inv.id)}><Trash2 size={16}/></button></div></div><div className="details"><div><span>Status</span><strong>{inv.status}</strong></div><div><span>Due</span><strong>{inv.due_date}</strong></div><div><span>Email</span><strong>{inv.client_email||"-"}</strong></div><div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></div></article>})}</section>{modal&&<InvoiceModal modal={modal} horses={horses} onClose={()=>setModal(null)} onSave={save}/>} {printInvoice&&<InvoicePrint invoice={printInvoice} onClose={()=>setPrintInvoice(null)}/>} {shareModal&&<ShareInvoice invoice={shareModal} onClose={()=>setShareModal(null)} setToast={setToast}/>}</main>}
function ShareInvoice({invoice,onClose,setToast}){const totals=invoiceTotals(invoice);const[message,setMessage]=useState(`Hi ${invoice.client_name||""},\n\nPlease find invoice ${invoice.invoice_number} for ${invoice.horse_name}.\n\nTotal: $${totals.total.toFixed(2)}\nDue: ${invoice.due_date}`);async function sendDemo(){const res=await fetch("/api/send-invoice-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:invoice.client_email,subject:`Invoice ${invoice.invoice_number}`,message,invoiceNumber:invoice.invoice_number})});const data=await res.json();setToast(data.message||"Email request sent.");onClose()}async function phoneShare(){const text=`Invoice ${invoice.invoice_number} for ${invoice.horse_name}: $${totals.total.toFixed(2)} due ${invoice.due_date}.`;if(navigator.share)await navigator.share({title:`Invoice ${invoice.invoice_number}`,text});else{await navigator.clipboard.writeText(text);setToast("Invoice text copied.")}}return <div className="modal-backdrop"><section className="modal"><div className="modal-head"><h2>Share Invoice {invoice.invoice_number}</h2><button onClick={onClose}><X size={20}/></button></div><div className="button-row wide"><button className="primary" onClick={()=>window.print()}><Printer size={18}/>Print / Save PDF</button><button className="primary" onClick={phoneShare}><Share2 size={18}/>Phone Share Sheet</button></div><label className="field"><span>Email message</span><textarea value={message} onChange={e=>setMessage(e.target.value)}/></label><button className="primary full" onClick={sendDemo}><Mail size={18}/>Send Email / Demo API</button><p className="hint">Real email works after Resend keys are added in Vercel.</p></section></div>}
function InvoiceModal({modal,horses,onClose,onSave}){const[inv,setInv]=useState(modal.invoice);const totals=invoiceTotals(inv);function setField(k,v){setInv(c=>({...c,[k]:v}))}function setLine(id,k,v){setInv(c=>({...c,line_items:(c.line_items||[]).map(li=>li.id===id?{...li,[k]:v}:li)}))}function addLine(){setInv(c=>({...c,line_items:[...(c.line_items||[]),{id:crypto.randomUUID(),description:"",quantity:1,unit_price:0}]}))}function removeLine(id){setInv(c=>({...c,line_items:(c.line_items||[]).filter(li=>li.id!==id)}))}return <div className="modal-backdrop"><section className="modal invoice-modal"><div className="modal-head"><h2>{modal.mode==="edit"?"Edit":"Create"} Invoice</h2><button onClick={onClose}><X size={20}/></button></div><div className="form-grid"><Field label="Invoice Number"><input value={inv.invoice_number||""} onChange={e=>setField("invoice_number",e.target.value)}/></Field><Field label="Client Name"><input value={inv.client_name||""} onChange={e=>setField("client_name",e.target.value)}/></Field><Field label="Client Email"><input value={inv.client_email||""} onChange={e=>setField("client_email",e.target.value)}/></Field><Field label="Client Phone"><input value={inv.client_phone||""} onChange={e=>setField("client_phone",e.target.value)}/></Field><Field label="Horse"><select value={inv.horse_name||""} onChange={e=>setField("horse_name",e.target.value)}>{horses.map(h=><option key={h.name}>{h.name}</option>)}</select></Field><Field label="Due Date"><input type="date" value={inv.due_date||""} onChange={e=>setField("due_date",e.target.value)}/></Field><Field label="Status"><select value={inv.status||"Draft"} onChange={e=>setField("status",e.target.value)}><option>Draft</option><option>Sent</option><option>Part Paid</option><option>Paid</option><option>Overdue</option></select></Field><Field label="Notes"><textarea value={inv.notes||""} onChange={e=>setField("notes",e.target.value)}/></Field></div><section className="invoice-lines"><div className="section-title"><h3>Line Items</h3><button className="text" onClick={addLine}>+ Add Line</button></div>{(inv.line_items||[]).map(li=><div className="line-item" key={li.id}><input placeholder="Description" value={li.description||""} onChange={e=>setLine(li.id,"description",e.target.value)}/><input type="number" placeholder="Qty" value={li.quantity||0} onChange={e=>setLine(li.id,"quantity",e.target.value)}/><input type="number" placeholder="Unit $" value={li.unit_price||0} onChange={e=>setLine(li.id,"unit_price",e.target.value)}/><strong>${(Number(li.quantity||0)*Number(li.unit_price||0)).toFixed(2)}</strong><button className="delete small" onClick={()=>removeLine(li.id)}><Trash2 size={14}/></button></div>)}</section><section className="invoice-totals"><div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></section><button className="primary full" onClick={()=>onSave(inv,modal.mode)}>Save Invoice</button></section></div>}
function InvoicePrint({invoice,onClose}){const totals=invoiceTotals(invoice);return <div className="print-backdrop"><section className="print-actions"><button className="primary" onClick={()=>window.print()}><Printer size={18}/>Print / Save PDF</button><button className="danger" onClick={onClose}>Close</button></section><main className="invoice-print"><header className="invoice-print-head"><div><h1>Invoice</h1><p>The Trotting Stable App</p></div><div><strong>{invoice.invoice_number}</strong><p>Status: {invoice.status}</p></div></header><section className="invoice-print-grid"><div><h3>Bill To</h3><p>{invoice.client_name}</p><p>{invoice.client_email}</p><p>{invoice.client_phone}</p><p>{invoice.horse_name}</p></div><div><h3>Dates</h3><p>Due: {invoice.due_date}</p></div></section><table className="invoice-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{(invoice.line_items||[]).map(li=><tr key={li.id}><td>{li.description}</td><td>{li.quantity}</td><td>${Number(li.unit_price||0).toFixed(2)}</td><td>${(Number(li.quantity||0)*Number(li.unit_price||0)).toFixed(2)}</td></tr>)}</tbody></table><section className="invoice-print-totals"><div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div className="grand"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></section></main></div>}
function Input({type,options,value,horses,owners,onChange}){if(type==="textarea"||type==="conditionalWarmup")return <textarea value={value} onChange={e=>onChange(e.target.value)}/>;if(type==="select")return <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>;if(type==="horseName")return <select value={value} onChange={e=>onChange(e.target.value)}>{horses.map(h=><option key={h.name}>{h.name}</option>)}</select>;if(type==="ownerName")return <select value={value} onChange={e=>onChange(e.target.value)}>{owners.map(o=><option key={o.name}>{o.name}</option>)}</select>;return <input type={type} value={value} onChange={e=>onChange(e.target.value)}/>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function NavButton({active,onClick,icon:Icon,label}){return <button className={active?"active":""} onClick={onClick}><Icon size={15}/>{label}</button>}
function Stat({icon:Icon,label,value}){return <section className="stat"><div><Icon size={22}/></div><p>{label}</p><strong>{value}</strong></section>}
function invoiceTotals(inv){const subtotal=(inv.line_items||[]).reduce((s,li)=>s+Number(li.quantity||0)*Number(li.unit_price||0),0);const gst=subtotal*GST_RATE;return{subtotal,gst,total:subtotal+gst}}
function labelize(v){return v.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}
function formatValue(v){if(v===null||v===undefined||v==="")return "-";return String(v)}
createRoot(document.getElementById("root")).render(<App/>);
