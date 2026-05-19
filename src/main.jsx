import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  Bell, CalendarDays, ChevronRight, CreditCard, DollarSign, FileText,
  Home, Image as ImageIcon, LogOut, Mail, PlayCircle, Share2, Trophy,
  UserCircle, Video, X
} from "lucide-react";
import "./styles.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const photos = ["/login-photos/photo-1.jpg","/login-photos/photo-2.jpg","/login-photos/photo-3.jpg","/login-photos/photo-4.jpg"];

function App(){
  const [session,setSession]=useState(null);
  const [portalProfile,setPortalProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("home");
  const [selectedHorse,setSelectedHorse]=useState(null);
  const [toast,setToast]=useState("");

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session||null);setLoading(false);});
    const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
    return()=>listener.subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(session?.user) loadProfile(); },[session?.user?.id]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),3500); return()=>clearTimeout(t); },[toast]);

  async function loadProfile(){
    const {data,error}=await supabase
      .from("owner_portal_profiles")
      .select("*")
      .eq("user_id",session.user.id)
      .maybeSingle();

    if(error || !data){
      setToast("This account is not linked to an owner portal profile yet.");
      setPortalProfile(null);
      return;
    }
    setPortalProfile(data);
  }

  if(loading)return <div className="center">Loading...</div>;
  if(!session)return <Login/>;
  if(!portalProfile)return <UnlinkedAccount onLogout={()=>supabase.auth.signOut()}/>;

  return <div className="portal-app">
    {toast&&<div className="toast">{toast}</div>}
    <header className="portal-topbar">
      <div>
        <p>Owners Portal</p>
        <h1>{portalProfile.owner_name}</h1>
      </div>
      <button className="ghost" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/>Logout</button>
    </header>

    <main>
      {tab==="home"&&<OwnerDashboard profile={portalProfile} setTab={setTab} setSelectedHorse={setSelectedHorse}/>}
      {tab==="horses"&&<MyHorses profile={portalProfile} setSelectedHorse={setSelectedHorse} setTab={setTab}/>}
      {tab==="updates"&&<UpdatesFeed profile={portalProfile}/>}
      {tab==="calendar"&&<OwnerCalendar profile={portalProfile}/>}
      {tab==="raceday"&&<RaceDayHub profile={portalProfile}/>}
      {tab==="invoices"&&<OwnerInvoices profile={portalProfile}/>}
      {tab==="media"&&<MediaVault profile={portalProfile}/>}
      {tab==="horse"&&selectedHorse&&<HorsePortalPage profile={portalProfile} horse={selectedHorse} back={()=>setTab("horses")}/>}
    </main>

    <nav className="bottom-nav">
      <NavButton active={tab==="home"} onClick={()=>setTab("home")} icon={Home} label="Home"/>
      <NavButton active={tab==="horses"||tab==="horse"} onClick={()=>setTab("horses")} icon={UserCircle} label="Horses"/>
      <NavButton active={tab==="updates"} onClick={()=>setTab("updates")} icon={Bell} label="Updates"/>
      <NavButton active={tab==="calendar"} onClick={()=>setTab("calendar")} icon={CalendarDays} label="Calendar"/>
      <NavButton active={tab==="invoices"} onClick={()=>setTab("invoices")} icon={CreditCard} label="Bills"/>
    </nav>
  </div>;
}

function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(e){
    e.preventDefault();
    setMsg("");
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)setMsg(error.message);
  }

  return <main className="portal-login">
    <PhotoReel/>
    <section className="login-card">
      <p className="eyebrow">Owners Portal</p>
      <h1>Your horses. Your updates. Your stable connection.</h1>
      <p>Private access for owners and shareholders.</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <button className="primary full">Log In</button>
      </form>
      {msg&&<p className="error">{msg}</p>}
    </section>
  </main>;
}

function PhotoReel(){
  const [i,setI]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setI(v=>(v+1)%photos.length),4500);return()=>clearInterval(t)},[]);
  return <div className="photo-reel" style={{backgroundImage:`url(${photos[i]})`}}/>;
}

function UnlinkedAccount({onLogout}){
  return <main className="center page">
    <section className="card">
      <h2>Owner profile not linked yet</h2>
      <p className="muted">This login works, but it has not been connected to an owner profile. Create a row in <strong>owner_portal_profiles</strong> with this user’s auth ID, stable ID, and owner name.</p>
      <button className="primary" onClick={onLogout}>Logout</button>
    </section>
  </main>;
}

function OwnerDashboard({profile,setTab,setSelectedHorse}){
  const {horses,updates,invoices,races,notifications,loading}=useOwnerData(profile);

  const unpaid=invoices.filter(i=>(i.payment_status||i.status)!=="Paid");
  const nextRace=races.filter(r=>r.status!=="Completed").sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];

  if(loading)return <PageLoader/>;

  return <section className="page">
    <section className="hero-card">
      <p className="eyebrow">Welcome back</p>
      <h2>{profile.owner_name}</h2>
      <p>{horses.length} horse{horses.length===1?"":"s"} in your portal</p>
    </section>

    <section className="owner-stats">
      <Stat label="Horses" value={horses.length}/>
      <Stat label="Unread" value={notifications.filter(n=>n.read_status==="Unread").length}/>
      <Stat label="Unpaid Bills" value={unpaid.length}/>
      <Stat label="Upcoming" value={nextRace?nextRace.date:"-"} small/>
    </section>

    {nextRace&&<section className="feature-card dark-card" onClick={()=>setTab("raceday")}>
      <p className="eyebrow">Race Day Hub</p>
      <h3>{nextRace.horse_name}</h3>
      <p>{nextRace.track} · {nextRace.race_time||nextRace.date} · {nextRace.race}</p>
      <ChevronRight/>
    </section>}

    <section className="section-head">
      <h2>Your Horses</h2>
      <button className="text" onClick={()=>setTab("horses")}>View all</button>
    </section>
    <section className="horse-grid">
      {horses.slice(0,4).map(h=><HorseCard key={h.name} horse={h} onClick={()=>{setSelectedHorse(h);setTab("horse");}}/>)}
    </section>

    <section className="section-head">
      <h2>Latest Updates</h2>
      <button className="text" onClick={()=>setTab("updates")}>View feed</button>
    </section>
    <section className="feed-list">
      {updates.slice(0,3).map(u=><UpdateCard key={u.id} update={u}/>)}
      {!updates.length&&<Empty text="No owner updates yet."/>}
    </section>
  </section>;
}

function MyHorses({profile,setSelectedHorse,setTab}){
  const {horses,loading}=useOwnerData(profile);
  if(loading)return <PageLoader/>;
  return <section className="page">
    <HeaderBlock title="Your Horses" subtitle="Tap a horse to see work, races, media, invoices and ownership details."/>
    <section className="horse-grid">
      {horses.map(h=><HorseCard key={h.name} horse={h} onClick={()=>{setSelectedHorse(h);setTab("horse");}}/>)}
    </section>
  </section>;
}

function HorsePortalPage({profile,horse,back}){
  const [data,setData]=useState({work:[],races:[],updates:[],invoices:[],feed:[],vet:[],farrier:[],gear:[]});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{load()},[horse.name]);

  async function load(){
    setLoading(true);
    const [work,races,updates,invoices,feed,vet,farrier,gear]=await Promise.all([
      supabase.from("work_entries").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name).order("date",{ascending:false}),
      supabase.from("race_records").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name).order("date",{ascending:false}),
      supabase.from("updates").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name).in("visibility",["owners","public-preview"]).order("created_at",{ascending:false}),
      supabase.from("invoices").select("*").eq("stable_id",profile.stable_id).eq("client_name",profile.owner_name).eq("horse_name",horse.name).order("created_at",{ascending:false}),
      supabase.from("feed_programs").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name),
      supabase.from("treatments").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name).order("treatment_date",{ascending:false}),
      supabase.from("farrier_records").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name).order("farrier_date",{ascending:false}),
      supabase.from("gear_items").select("*").eq("stable_id",profile.stable_id).eq("horse_name",horse.name)
    ]);
    setData({work:work.data||[],races:races.data||[],updates:updates.data||[],invoices:invoices.data||[],feed:feed.data||[],vet:vet.data||[],farrier:farrier.data||[],gear:gear.data||[]});
    setLoading(false);
  }

  const completed=data.races.filter(r=>r.status==="Completed");
  const prizemoney=completed.reduce((s,r)=>s+Number(r.prizemoney||0),0);

  if(loading)return <PageLoader/>;

  return <section className="page">
    <button className="text back" onClick={back}>← Back to horses</button>
    <section className="horse-hero">
      {horse.profile_photo_url?<img src={horse.profile_photo_url}/>:<div className="horse-photo-placeholder"><UserCircle size={44}/></div>}
      <div>
        <h1>{horse.name}</h1>
        <p>{horse.stable_name||""} · {horse.status||horse.current_status||"Active"}</p>
        <strong>{horse.percentage}% owned</strong>
      </div>
    </section>

    <section className="owner-stats">
      <Stat label="Work" value={data.work.length}/>
      <Stat label="Starts" value={completed.length}/>
      <Stat label="Prizemoney" value={`$${prizemoney.toLocaleString()}`} small/>
      <Stat label="Bills" value={data.invoices.length}/>
    </section>

    <PortalSection title="Next Target / Race Day">
      {data.races.filter(r=>r.status!=="Completed").slice(0,2).map(r=><RaceCard key={r.id} race={r}/>)}
      {!data.races.filter(r=>r.status!=="Completed").length&&<Empty text="No upcoming target currently listed."/>}
    </PortalSection>

    <PortalSection title="Updates Feed">
      {data.updates.map(u=><UpdateCard key={u.id} update={u}/>)}
      {!data.updates.length&&<Empty text="No updates posted for this horse yet."/>}
    </PortalSection>

    <PortalSection title="Recent Work">
      {data.work.slice(0,6).map(w=><TimelineItem key={w.id} title={`${w.date} · ${w.sector}`} text={`${w.distance||""} ${w.mile_rate?`· Mile: ${w.mile_rate}`:""} ${w.last_half?`· Last half: ${w.last_half}`:""}`}/>)}
    </PortalSection>

    <PortalSection title="Race Results">
      {completed.slice(0,6).map(r=><RaceCard key={r.id} race={r}/>)}
    </PortalSection>

    <PortalSection title="Feed">
      {data.feed.map(f=><div className="info-card" key={f.id}><p><strong>Morning:</strong> {f.morning_feed||"-"}</p><p><strong>Lunch:</strong> {f.lunch_feed||"-"}</p><p><strong>Night:</strong> {f.night_feed||"-"}</p><p><strong>Supplements:</strong> {f.supplements||"-"}</p></div>)}
    </PortalSection>

    <PortalSection title="Vet / Farrier">
      {data.vet.slice(0,4).map(v=><TimelineItem key={v.id} title={`${v.treatment_date} · ${v.treatment_type}`} text={v.notes||v.veterinarian||""}/>)}
      {data.farrier.slice(0,4).map(f=><TimelineItem key={f.id} title={`${f.farrier_date} · ${f.service_type}`} text={f.notes||f.farrier_name||""}/>)}
    </PortalSection>

    <PortalSection title="Gear">
      {data.gear.map(g=><TimelineItem key={g.id} title={`${g.item_name} · ${g.category}`} text={`${g.condition||""} ${g.location?`· ${g.location}`:""}`}/>)}
    </PortalSection>

    <PortalSection title="Invoices">
      {data.invoices.map(i=><InvoiceCard key={i.id} invoice={i}/>)}
    </PortalSection>
  </section>;
}

function UpdatesFeed({profile}){
  const {updates,loading}=useOwnerData(profile);
  if(loading)return <PageLoader/>;
  return <section className="page">
    <HeaderBlock title="Updates Feed" subtitle="Private stable updates, media, links and race information."/>
    <section className="feed-list">
      {updates.map(u=><UpdateCard key={u.id} update={u}/>)}
      {!updates.length&&<Empty text="No updates yet."/>}
    </section>
  </section>;
}

function RaceDayHub({profile}){
  const {races,loading}=useOwnerData(profile);
  if(loading)return <PageLoader/>;
  const upcoming=races.filter(r=>r.status!=="Completed").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const results=races.filter(r=>r.status==="Completed");
  return <section className="page">
    <HeaderBlock title="Race Day Hub" subtitle="Upcoming races, acceptances, results, replays and prizemoney."/>
    <PortalSection title="Upcoming">
      {upcoming.map(r=><RaceCard key={r.id} race={r}/>)}
      {!upcoming.length&&<Empty text="No upcoming races listed."/>}
    </PortalSection>
    <PortalSection title="Results">
      {results.map(r=><RaceCard key={r.id} race={r}/>)}
    </PortalSection>
  </section>;
}

function OwnerInvoices({profile}){
  const {invoices,loading}=useOwnerData(profile);
  if(loading)return <PageLoader/>;
  const unpaid=invoices.filter(i=>(i.payment_status||i.status)!=="Paid");
  return <section className="page">
    <HeaderBlock title="Invoices & Financials" subtitle="Charges, payment status, prizemoney and owner allocations."/>
    <section className="owner-stats">
      <Stat label="Invoices" value={invoices.length}/>
      <Stat label="Unpaid" value={unpaid.length}/>
      <Stat label="Total" value={`$${invoices.reduce((s,i)=>s+Number(i.total||0),0).toLocaleString()}`} small/>
    </section>
    <section className="feed-list">
      {invoices.map(i=><InvoiceCard key={i.id} invoice={i}/>)}
      {!invoices.length&&<Empty text="No invoices yet."/>}
    </section>
  </section>;
}

function MediaVault({profile}){
  const {updates,loading}=useOwnerData(profile);
  if(loading)return <PageLoader/>;
  const media=[];
  updates.forEach(u=>{
    splitLines(u.photo_urls).forEach(url=>media.push({type:"photo",url,horse:u.horse_name,title:u.title}));
    splitLines(u.video_urls).forEach(url=>media.push({type:"video",url,horse:u.horse_name,title:u.title}));
    splitLines(u.link_urls).forEach(url=>media.push({type:"link",url,horse:u.horse_name,title:u.title}));
  });
  return <section className="page">
    <HeaderBlock title="Media Vault" subtitle="Photos, videos, race replays and important links."/>
    <section className="media-grid">
      {media.map((m,i)=><a key={i} className="media-tile" href={m.url} target="_blank" rel="noreferrer">
        {m.type==="photo"?<img src={m.url}/>:m.type==="video"?<Video size={34}/>:<ImageIcon size={34}/>}
        <strong>{m.horse}</strong>
        <span>{m.title}</span>
      </a>)}
      {!media.length&&<Empty text="No media added yet."/>}
    </section>
  </section>;
}

function OwnerCalendar({profile}){
  const {work,races,vet,farrier,loading}=useOwnerData(profile);
  const events=[
    ...work.map(x=>({...x,date:x.date,type:"Work",title:x.horse_name,body:x.sector})),
    ...races.map(x=>({...x,date:x.date,type:"Race",title:x.horse_name,body:`${x.track||""} ${x.race||""}`})),
    ...vet.map(x=>({...x,date:x.treatment_date,type:"Vet",title:x.horse_name,body:x.treatment_type})),
    ...farrier.map(x=>({...x,date:x.farrier_date,type:"Farrier",title:x.horse_name,body:x.service_type}))
  ].filter(e=>e.date);

  if(loading)return <PageLoader/>;

  return <section className="page">
    <HeaderBlock title="Calendar" subtitle="Races, work, vet, farrier and key dates."/>
    <PhoneCalendar events={events}/>
  </section>;
}

function PhoneCalendar({events}){
  const today=new Date();
  const [cursor,setCursor]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [openDay,setOpenDay]=useState(toIso(today));

  const year=cursor.getFullYear();
  const month=cursor.getMonth();
  const firstDay=new Date(year,month,1);
  const startOffset=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<startOffset;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(new Date(year,month,d));
  while(cells.length%7!==0)cells.push(null);

  const selectedEvents=events.filter(e=>e.date===openDay);

  return <section className="phone-calendar-wrap">
    <div className="phone-calendar-shell">
      <div className="phone-calendar-top">
        <button className="calendar-round" onClick={()=>setCursor(new Date(year,month-1,1))}>‹</button>
        <div><h3>{cursor.toLocaleString("en-AU",{month:"long",year:"numeric"})}</h3><p>Tap a date to view events</p></div>
        <button className="calendar-round" onClick={()=>setCursor(new Date(year,month+1,1))}>›</button>
      </div>
      <div className="phone-calendar-actions">
        <button className="ghost" onClick={()=>{const n=new Date();setCursor(new Date(n.getFullYear(),n.getMonth(),1));setOpenDay(toIso(n));}}>Today</button>
      </div>
      <div className="phone-weekdays">{["M","T","W","T","F","S","S"].map((d,i)=><span key={d+i}>{d}</span>)}</div>
      <div className="phone-calendar-grid">
        {cells.map((date,i)=>{
          const iso=date?toIso(date):"";
          const count=events.filter(e=>e.date===iso).length;
          return <button key={i} disabled={!date} className={`${openDay===iso?"selected":""} ${count?"has-records":""} ${iso===toIso(today)?"today":""}`} onClick={()=>date&&setOpenDay(iso)}>
            {date&&<strong>{date.getDate()}</strong>}
            {count>0&&<small>{count}</small>}
          </button>;
        })}
      </div>
    </div>
    <div className="calendar-day-panel">
      <h3>{formatDate(openDay)}</h3>
      <p className="muted">{selectedEvents.length} event{selectedEvents.length===1?"":"s"}</p>
      <div className="day-records">
        {selectedEvents.map((e,i)=><article className="day-record" key={i}><strong>{e.type} · {e.title}</strong><span>{e.body}</span></article>)}
        {!selectedEvents.length&&<Empty text="No events on this date."/>}
      </div>
    </div>
  </section>;
}

function useOwnerData(profile){
  const [state,setState]=useState({horses:[],shares:[],updates:[],invoices:[],races:[],work:[],vet:[],farrier:[],notifications:[],loading:true});

  useEffect(()=>{ if(profile?.stable_id && profile?.owner_name) load(); },[profile?.stable_id,profile?.owner_name]);

  async function load(){
    setState(s=>({...s,loading:true}));
    const {data:shares}=await supabase.from("horse_owners").select("*").eq("stable_id",profile.stable_id).eq("owner_name",profile.owner_name);
    const horseNames=(shares||[]).map(s=>s.horse_name);

    const [horses,updates,invoices,races,work,vet,farrier,notifications]=await Promise.all([
      horseNames.length?supabase.from("horses").select("*").eq("stable_id",profile.stable_id).in("name",horseNames):{data:[]},
      horseNames.length?supabase.from("updates").select("*").eq("stable_id",profile.stable_id).in("horse_name",horseNames).in("visibility",["owners","public-preview"]).order("created_at",{ascending:false}):{data:[]},
      supabase.from("invoices").select("*").eq("stable_id",profile.stable_id).eq("client_name",profile.owner_name).order("created_at",{ascending:false}),
      horseNames.length?supabase.from("race_records").select("*").eq("stable_id",profile.stable_id).in("horse_name",horseNames).order("date",{ascending:false}):{data:[]},
      horseNames.length?supabase.from("work_entries").select("*").eq("stable_id",profile.stable_id).in("horse_name",horseNames).order("date",{ascending:false}):{data:[]},
      horseNames.length?supabase.from("treatments").select("*").eq("stable_id",profile.stable_id).in("horse_name",horseNames).order("treatment_date",{ascending:false}):{data:[]},
      horseNames.length?supabase.from("farrier_records").select("*").eq("stable_id",profile.stable_id).in("horse_name",horseNames).order("farrier_date",{ascending:false}):{data:[]},
      supabase.from("owner_notifications").select("*").eq("stable_id",profile.stable_id).eq("owner_name",profile.owner_name).order("created_at",{ascending:false})
    ]);

    const horsesWithPct=(horses.data||[]).map(h=>({...h,percentage:(shares||[]).find(s=>s.horse_name===h.name)?.percentage||0}));
    setState({horses:horsesWithPct,shares:shares||[],updates:updates.data||[],invoices:invoices.data||[],races:races.data||[],work:work.data||[],vet:vet.data||[],farrier:farrier.data||[],notifications:notifications.data||[],loading:false});
  }

  return state;
}

function HorseCard({horse,onClick}){
  return <article className="horse-card" onClick={onClick}>
    {horse.profile_photo_url?<img src={horse.profile_photo_url}/>:<div className="horse-card-placeholder"><UserCircle size={34}/></div>}
    <div>
      <h3>{horse.name}</h3>
      <p>{horse.status||horse.current_status||"Active"}</p>
      <strong>{horse.percentage}% owned</strong>
    </div>
    <ChevronRight size={18}/>
  </article>;
}

function UpdateCard({update}){
  return <article className="update-card">
    <div className="update-head"><div><p>{update.category||"Update"}</p><h3>{update.title||update.horse_name}</h3></div><span>{formatDate(update.created_at)}</span></div>
    <p>{update.body}</p>
    <MediaPreview update={update}/>
  </article>;
}

function MediaPreview({update}){
  const photos=splitLines(update.photo_urls), videos=splitLines(update.video_urls), links=splitLines(update.link_urls);
  if(!photos.length&&!videos.length&&!links.length)return null;
  return <section className="media-preview">
    {photos.map((url,i)=><a href={url} target="_blank" rel="noreferrer" key={`p${i}`}><img src={url}/></a>)}
    {videos.map((url,i)=><a href={url} target="_blank" rel="noreferrer" className="media-pill" key={`v${i}`}><PlayCircle size={16}/>Video {i+1}</a>)}
    {links.map((url,i)=><a href={url} target="_blank" rel="noreferrer" className="media-pill" key={`l${i}`}>Link {i+1}</a>)}
  </section>;
}

function RaceCard({race}){
  return <article className="info-card race-card">
    <div><h3>{race.horse_name}</h3><p>{race.track} · {race.race_time||race.date}</p></div>
    <div className="details clean">
      <div><span>Race</span><strong>{race.race||"-"}</strong></div>
      <div><span>Barrier</span><strong>{race.barrier||"-"}</strong></div>
      <div><span>Driver</span><strong>{race.driver||"-"}</strong></div>
      <div><span>Status</span><strong>{race.status||"-"}</strong></div>
      <div><span>Result</span><strong>{race.result||"-"}</strong></div>
      <div><span>Prizemoney</span><strong>${Number(race.prizemoney||0).toLocaleString()}</strong></div>
    </div>
    {race.replay_url&&<a className="primary" href={race.replay_url} target="_blank" rel="noreferrer"><PlayCircle size={16}/>Replay</a>}
  </article>;
}

function InvoiceCard({invoice}){
  return <article className="info-card">
    <div className="row"><div><h3>{invoice.invoice_number}</h3><p>{invoice.horse_name} · Due {invoice.due_date}</p></div><strong>${Number(invoice.total||0).toLocaleString()}</strong></div>
    <p>Status: {invoice.payment_status||invoice.status||"Unpaid"}</p>
  </article>;
}

function TimelineItem({title,text}){return <article className="timeline-item"><strong>{title}</strong><span>{text}</span></article>;}
function PortalSection({title,children}){return <section className="portal-section"><h2>{title}</h2><div className="feed-list">{children}</div></section>;}
function HeaderBlock({title,subtitle}){return <section className="header-block"><h1>{title}</h1><p>{subtitle}</p></section>;}
function Stat({label,value,small}) {return <section className="stat-card"><p>{label}</p><strong className={small?"small-stat":""}>{value}</strong></section>;}
function NavButton({active,onClick,icon:Icon,label}){return <button className={active?"active":""} onClick={onClick}><Icon size={18}/><span>{label}</span></button>;}
function PageLoader(){return <main className="page"><section className="card"><p>Loading...</p></section></main>;}
function Empty({text}){return <p className="empty">{text}</p>;}
function splitLines(v){return String(v||"").split(/\n|,/).map(x=>x.trim()).filter(Boolean);}
function toIso(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
function formatDate(v){if(!v)return "-"; const d=new Date(v); if(Number.isNaN(d.getTime()))return String(v); return d.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"});}
createRoot(document.getElementById("root")).render(<App/>);
