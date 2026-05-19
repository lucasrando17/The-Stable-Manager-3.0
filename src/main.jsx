import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck, BarChart3, Bell, CalendarDays, ClipboardList, Cloud, Download,
  DollarSign, Edit3, FileText, HeartPulse, Home, LogIn, Mail, MessageCircle,
  MessageSquareText, Package, Plus, Printer, Search, Send, Settings,
  ShieldCheck, Share2, Trash2, Trophy, Upload, Users, Wheat, X
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "stable-manager-saas-v1";
const GST_RATE = 0.10;

const moduleConfig = {
  horses: {
    label:"Horse", plural:"Horses", icon:BadgeCheck, title:"Horse Register",
    subtitle:"Complete profile for every horse in the stable.",
    fields:[["name","Registered Name","text"],["stableName","Stable Name","text"],["status","Status","select",["Racing","Building","Trialling","Spelling","Rehab","Sold","Retired"]],["age","Age","number"],["sex","Sex","select",["Gelding","Mare","Horse","Colt","Filly"]],["sire","Sire","text"],["dam","Dam","text"],["owner","Owner / Syndicate","text"],["trainer","Trainer","text"],["location","Stable / Paddock","text"],["gear","Gear Notes","textarea"],["nextTarget","Next Target","text"],["notes","General Notes","textarea"]],
    display:["stableName","status","age","sex","owner","trainer","nextTarget"]
  },
  work: {
    label:"Work Entry", plural:"Work", icon:ClipboardList, title:"Training Work Log",
    subtitle:"Training, warm-ups, jogger machine, trials, fast work and single-horse history.",
    fields:[["date","Date","date"],["horse","Horse","horse"],["sector","Work Sector","select",["Track Work","Jogger Machine","Warm Up","Race Warm Up","Trial","Swimming","Treadmill","Walking Machine","Beach Work","Recovery"]],["type","Work Type","select",["Jog","Pacework","Fast work","Hopple","Jogger machine","Warm up","Swim","Treadmill","Walking machine","Beach work","Trial","Qualifier","Recovery"]],["warmUp","Warm Up Details","textarea"],["joggerMachine","Jogger Machine Details","textarea"],["distance","Distance","text"],["time","Time","text"],["sectionals","Sectionals","text"],["driver","Driver","text"],["track","Track / Conditions","text"],["recovery","Recovery / HR","text"],["notes","Notes","textarea"]],
    display:["date","horse","sector","type","warmUp","joggerMachine","distance","time","driver","notes"]
  },
  racing: {
    label:"Race Record", plural:"Racing", icon:Trophy, title:"Race Planning & Results",
    subtitle:"Targets, nominations, acceptances and results.",
    fields:[["date","Date","date"],["horse","Horse","horse"],["track","Track","text"],["race","Race / Class","text"],["distance","Distance","text"],["status","Status","select",["Target","Nominated","Accepted","Scratched","Completed"]],["barrier","Barrier","text"],["driver","Driver","text"],["result","Result","text"],["earnings","Earnings","number"],["notes","Notes","textarea"]],
    display:["date","horse","track","race","status","driver","result","earnings"]
  },
  treatments: {
    label:"Treatment", plural:"Vet", icon:HeartPulse, title:"Vet & Treatments",
    subtitle:"Vet work, medication, withholding and stand-down dates.",
    fields:[["date","Date","date"],["horse","Horse","horse"],["treatment","Treatment / Procedure","text"],["vet","Vet / Provider","text"],["medication","Medication","text"],["dose","Dose","text"],["withholding","Withholding / Stand Down","date"],["nextDue","Next Due","date"],["notes","Notes","textarea"]],
    display:["date","horse","treatment","vet","withholding","nextDue","notes"]
  },
  farrier: {
    label:"Farrier Record", plural:"Farrier", icon:CalendarDays, title:"Farrier & Dental",
    subtitle:"Shoeing, dental, feet issues and due dates.",
    fields:[["date","Date","date"],["horse","Horse","horse"],["type","Type","select",["Shoe","Trim","Dental","Foot Treatment","Other"]],["provider","Provider","text"],["setup","Shoe / Setup","text"],["nextDue","Next Due","date"],["notes","Notes","textarea"]],
    display:["date","horse","type","provider","setup","nextDue","notes"]
  },
  feed: {
    label:"Feed Program", plural:"Feed", icon:Wheat, title:"Feed Programs",
    subtitle:"Daily feed sheets, supplements and nutrition notes.",
    fields:[["horse","Horse","horse"],["morning","Morning Feed","textarea"],["lunch","Lunch Feed","textarea"],["night","Night Feed","textarea"],["hay","Hay","text"],["supplements","Supplements","textarea"],["condition","Condition / Weight Notes","textarea"]],
    display:["horse","morning","lunch","night","hay","supplements"]
  },
  finance: {
    label:"Finance Entry", plural:"Finance", icon:DollarSign, title:"Income & Expenses",
    subtitle:"Income, costs, owner payments and profitability.",
    fields:[["date","Date","date"],["horse","Horse","horse"],["type","Type","select",["Income","Expense"]],["category","Category","select",["Prizemoney","Owner Payment","Sale Proceeds","Feed","Vet","Farrier","Transport","Staff Wages","Gear","Insurance","Noms/Acceptances","Stable Rent","Invoice Payment","Other"]],["amount","Amount","number"],["paid","Paid?","select",["Yes","No"]],["notes","Notes","textarea"]],
    display:["date","horse","type","category","amount","paid","notes"]
  },
  owners: {
    label:"Owner", plural:"Owners", icon:Users, title:"Owner Management",
    subtitle:"Owner details, shares, email, phone and payment notes.",
    fields:[["name","Owner Name","text"],["horse","Horse","horse"],["share","Share %","number"],["phone","Phone","text"],["email","Email","email"],["paymentStatus","Payment Status","select",["Paid","Part Paid","Outstanding"]],["notes","Notes","textarea"]],
    display:["horse","share","phone","email","paymentStatus","notes"]
  },
  staff: {
    label:"Staff", plural:"Staff", icon:ShieldCheck, title:"Staff & Rosters",
    subtitle:"Staff, roles, pay rates, rosters and tasks.",
    fields:[["name","Staff Name","text"],["role","Role","select",["Trainer","Driver","Stablehand","Foreperson","Admin","Vet","Farrier"]],["phone","Phone","text"],["payRate","Pay Rate","number"],["shift","Shift / Roster","text"],["tasks","Tasks","textarea"],["notes","Notes","textarea"]],
    display:["role","phone","payRate","shift","tasks"]
  },
  inventory: {
    label:"Inventory Item", plural:"Inventory", icon:Package, title:"Inventory & Stock",
    subtitle:"Feed, supplements, gear, medication and low stock alerts.",
    fields:[["item","Item","text"],["category","Category","select",["Feed","Hay","Supplement","Medication","Gear","Bedding","Other"]],["quantity","Quantity","number"],["unit","Unit","text"],["reorderLevel","Reorder Level","number"],["supplier","Supplier","text"],["cost","Cost","number"],["notes","Notes","textarea"]],
    display:["category","quantity","unit","reorderLevel","supplier","cost","notes"]
  },
  ownerUpdates: {
    label:"Owner Update", plural:"Updates", icon:MessageSquareText, title:"Owner Communication",
    subtitle:"Owner messages, race reviews and stable updates.",
    fields:[["date","Date","date"],["horse","Horse","horse"],["owner","Owner","text"],["type","Update Type","select",["Stable Update","Race Preview","Race Review","Vet Update","Trial Update","Invoice Note"]],["sentBy","Sent By","text"],["method","Method","select",["SMS","Email","WhatsApp","Phone","In Person"]],["message","Message","textarea"]],
    display:["date","horse","owner","type","method","message"]
  },
  gear: {
    label:"Gear Item", plural:"Gear", icon:Settings, title:"Gear Register",
    subtitle:"Gear assignments, condition and replacement dates.",
    fields:[["item","Gear Item","text"],["horse","Horse","horse"],["brand","Brand","text"],["purchaseDate","Purchase Date","date"],["cost","Cost","number"],["condition","Condition","select",["New","Good","Worn","Repair","Replace"]],["replacementDue","Replacement Due","date"],["notes","Notes","textarea"]],
    display:["horse","brand","purchaseDate","cost","condition","replacementDue","notes"]
  },
  reminders: {
    label:"Reminder", plural:"Reminders", icon:Bell, title:"Reminders",
    subtitle:"Manual reminders for treatments, noms, stock, invoices and staff tasks.",
    fields:[["date","Due Date","date"],["horse","Horse","horse"],["type","Reminder Type","select",["Treatment","Farrier","Nomination","Acceptance","Feed Stock","Owner Update","Staff Task","Invoice Due","Other"]],["priority","Priority","select",["Low","Normal","High","Urgent"]],["assignedTo","Assigned To","text"],["done","Done?","select",["No","Yes"]],["notes","Notes","textarea"]],
    display:["date","horse","type","priority","assignedTo","done","notes"]
  }
};

const starterData = {
  horses: [
    {id:"h1",name:"Red Reactor",stableName:"Red",status:"Racing",age:5,sex:"Gelding",sire:"Somebeachsomewhere",dam:"Red Lady",owner:"Punthub x Rando Racing",trainer:"James Rando",location:"Barn A",gear:"Murphy blind optional",nextTarget:"Menangle — 24 May",notes:"Relaxed type."},
    {id:"h2",name:"Miss Camden",stableName:"Missy",status:"Building",age:4,sex:"Mare",sire:"Bettors Delight",dam:"Camden Girl",owner:"Rando Racing",trainer:"James Rando",location:"Barn B",gear:"Check hopple length",nextTarget:"Trial — 27 May",notes:"Improving."}
  ],
  work:[
    {id:"w1",date:"2026-05-19",horse:"Red Reactor",sector:"Track Work",type:"Fast work",warmUp:"Jogged 2 laps before main work.",joggerMachine:"",distance:"2400m",time:"3:18",sectionals:"Last 400m strong",driver:"Lucas",track:"Good",recovery:"Good",notes:"Pulled up well."},
    {id:"w2",date:"2026-05-20",horse:"Miss Camden",sector:"Jogger Machine",type:"Jogger machine",warmUp:"",joggerMachine:"35 mins steady on jogger machine.",distance:"",time:"35 mins",sectionals:"",driver:"",track:"Machine",recovery:"Normal",notes:"Relaxed throughout."}
  ],
  invoices:[
    {id:"inv1",invoiceNumber:"INV-0001",date:"2026-05-19",dueDate:"2026-06-02",owner:"Mark Porter",ownerEmail:"mark@example.com",ownerPhone:"0400000000",horse:"Red Reactor",status:"Draft",gstEnabled:"Yes",notes:"Training and associated charges.",lineItems:[{id:"li1",description:"Training fee",quantity:1,unitPrice:550},{id:"li2",description:"Feed allocation",quantity:1,unitPrice:86}]}
  ],
  racing:[{id:"r1",date:"2026-05-24",horse:"Red Reactor",track:"Menangle",race:"NR race",distance:"1609m",status:"Target",barrier:"",driver:"Lucas",result:"",earnings:0,notes:"Target race."}],
  treatments:[{id:"t1",date:"2026-05-18",horse:"Red Reactor",treatment:"Dental",vet:"Equine Dentist",medication:"",dose:"",withholding:"",nextDue:"2027-05-12",notes:"Routine float."}],
  farrier:[{id:"fr1",date:"2026-05-12",horse:"Red Reactor",type:"Shoe",provider:"Stable Farrier",setup:"Race plates",nextDue:"2026-06-02",notes:"No issues."}],
  feed:[{id:"fd1",horse:"Red Reactor",morning:"1kg Release, lucerne, bran",lunch:"Hay",night:"2kg Release, beet, oil, hay",hay:"Ad lib",supplements:"Enduralyte, Muslamax",condition:"Holding condition."}],
  finance:[{id:"m1",date:"2026-05-15",horse:"Red Reactor",type:"Income",category:"Prizemoney",amount:1200,paid:"Yes",notes:"3rd at Penrith"}],
  owners:[{id:"o1",name:"Mark Porter",horse:"Red Reactor",share:10,phone:"0400000000",email:"mark@example.com",paymentStatus:"Paid",notes:"Main contact."}],
  staff:[{id:"s1",name:"Lucas Rando",role:"Driver",phone:"",payRate:0,shift:"Mornings/race meetings",tasks:"Trackwork, race driving, owner updates",notes:""}],
  inventory:[{id:"i1",item:"Pryde's Release",category:"Feed",quantity:4,unit:"bags",reorderLevel:2,supplier:"Feed store",cost:42,notes:""}],
  ownerUpdates:[{id:"u1",date:"2026-05-19",horse:"Red Reactor",owner:"Mark Porter",type:"Stable Update",sentBy:"Lucas",method:"SMS",message:"Worked strongly and pulled up well."}],
  gear:[{id:"g1",item:"Hopples",horse:"Red Reactor",brand:"Wahlsten",purchaseDate:"2026-05-01",cost:180,condition:"Good",replacementDue:"",notes:"Race set."}],
  reminders:[{id:"rem1",date:"2026-06-02",horse:"Red Reactor",type:"Farrier",priority:"Normal",assignedTo:"Lucas",done:"No",notes:"Shoe due."}]
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterData;
    const parsed = JSON.parse(saved);
    return Object.keys(starterData).reduce((acc,key)=>({...acc,[key]:Array.isArray(parsed[key])?parsed[key]:starterData[key]}),{});
  } catch { return starterData; }
}

function emptyRecord(moduleKey, horseNames) {
  const rec = {};
  moduleConfig[moduleKey].fields.forEach(([key,label,type,options])=>{
    if(type==="date") rec[key]=new Date().toISOString().slice(0,10);
    else if(type==="number") rec[key]="";
    else if(type==="select") rec[key]=options[0];
    else if(type==="horse") rec[key]=horseNames[0]||"";
    else rec[key]="";
  });
  if(moduleKey==="horses") Object.assign(rec,{status:"Racing",sex:"Gelding",trainer:"James Rando",nextTarget:"TBC"});
  if(moduleKey==="finance") Object.assign(rec,{type:"Expense",paid:"No"});
  return rec;
}

function emptyInvoice(data) {
  const nextNo = String((data.invoices?.length || 0) + 1).padStart(4, "0");
  const owner = data.owners?.[0];
  const horse = data.horses?.[0];
  return {
    id:"", invoiceNumber:`INV-${nextNo}`, date:new Date().toISOString().slice(0,10),
    dueDate:addDays(new Date(),14).toISOString().slice(0,10),
    owner:owner?.name || "", ownerEmail:owner?.email || "", ownerPhone:owner?.phone || "",
    horse:horse?.name || "", status:"Draft", gstEnabled:"Yes", notes:"",
    lineItems:[{id:crypto.randomUUID(),description:"",quantity:1,unitPrice:0}]
  };
}

function App() {
  const [data,setData]=useState(loadData);
  const [activeModule,setActiveModule]=useState("dashboard");
  const [modal,setModal]=useState(null);
  const [invoiceModal,setInvoiceModal]=useState(null);
  const [shareModal,setShareModal]=useState(null);
  const [printInvoice,setPrintInvoice]=useState(null);
  const [search,setSearch]=useState("");
  const [horseFilter,setHorseFilter]=useState("All");
  const [historyHorse,setHistoryHorse]=useState("");
  const [toast,setToast]=useState("");

  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(data)),[data]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(""),3500); return()=>clearTimeout(t); },[toast]);

  const horseNames=data.horses.map(h=>h.name).filter(Boolean);
  const finance=useMemo(()=>{let income=0,expenses=0;data.finance.forEach(r=>r.type==="Income"?income+=Number(r.amount||0):expenses+=Number(r.amount||0));return{income,expenses,net:income-expenses}},[data.finance]);

  function openAdd(moduleKey){ if(moduleKey==="invoices") return setInvoiceModal({mode:"add",invoice:emptyInvoice(data)}); setModal({moduleKey,record:emptyRecord(moduleKey,horseNames),mode:"add"}); }
  function openEdit(moduleKey,record){ if(moduleKey==="invoices") return setInvoiceModal({mode:"edit",invoice:JSON.parse(JSON.stringify(record))}); setModal({moduleKey,record:{...record},mode:"edit"}); }
  function saveRecord(moduleKey,record,mode){const clean=normalise(record,moduleKey);setData(cur=>{const rows=cur[moduleKey]||[];const nextRows=mode==="edit"?rows.map(r=>r.id===clean.id?clean:r):[{...clean,id:crypto.randomUUID()},...rows];return{...cur,[moduleKey]:nextRows}});setModal(null)}
  function saveInvoice(invoice,mode){const clean={...invoice,lineItems:invoice.lineItems.map(li=>({...li,quantity:Number(li.quantity||0),unitPrice:Number(li.unitPrice||0)}))};setData(cur=>{const rows=cur.invoices||[];const nextRows=mode==="edit"?rows.map(r=>r.id===clean.id?clean:r):[{...clean,id:crypto.randomUUID()},...rows];return{...cur,invoices:nextRows}});setInvoiceModal(null)}
  function updateInvoiceStatus(id,status){setData(cur=>({...cur,invoices:cur.invoices.map(inv=>inv.id===id?{...inv,status}:inv)}))}
  function deleteRecord(moduleKey,id){setData(cur=>({...cur,[moduleKey]:cur[moduleKey].filter(r=>r.id!==id)}))}
  function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="stable-manager-export.json";a.click();URL.revokeObjectURL(url)}
  function importData(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);setData(Object.keys(starterData).reduce((acc,key)=>({...acc,[key]:Array.isArray(parsed[key])?parsed[key]:[]}),{}))}catch{alert("Could not import that file.")}};reader.readAsText(file)}

  async function sendInvoiceEmail(invoice, emailBody) {
    try {
      const res = await fetch("/api/send-invoice-email", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          to: invoice.ownerEmail,
          subject: `Invoice ${invoice.invoiceNumber} - ${invoice.horse}`,
          message: emailBody,
          invoiceNumber: invoice.invoiceNumber,
          invoiceHtml: invoiceHtml(invoice)
        })
      });
      const json = await res.json();
      updateInvoiceStatus(invoice.id, "Sent");
      setToast(json.message || "Invoice email request sent.");
    } catch {
      setToast("Email API not connected yet. Use Share/Copy for now.");
    }
  }

  async function sendInvoiceSms(invoice, smsBody) {
    try {
      const res = await fetch("/api/send-invoice-sms", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({to: invoice.ownerPhone, message: smsBody, invoiceNumber: invoice.invoiceNumber})
      });
      const json = await res.json();
      updateInvoiceStatus(invoice.id, "Sent");
      setToast(json.message || "Invoice SMS request sent.");
    } catch {
      setToast("SMS API not connected yet. Use Share/Copy for now.");
    }
  }

  return <div className="app-shell">
    <header className="topbar"><div><h1>Stable Manager Pro</h1><p>Stable operations, invoices, email and SMS scaffold</p></div><button className="primary-button" onClick={()=>openAdd(activeModule==="dashboard"?"work":activeModule)}><Plus size={18}/>Add</button></header>
    <ModuleStrip active={activeModule} setActive={setActiveModule}/>
    {toast && <div className="toast">{toast}</div>}
    {activeModule==="dashboard"&&<Dashboard data={data} finance={finance} openAdd={openAdd} setActiveModule={setActiveModule}/>}
    {activeModule==="invoices"&&<InvoicesPage invoices={data.invoices} openAdd={openAdd} openEdit={openEdit} deleteRecord={deleteRecord} setPrintInvoice={setPrintInvoice} setShareModal={setShareModal}/>}
    {activeModule==="analytics"&&<Analytics data={data} finance={finance}/>}
    {activeModule==="sync"&&<SyncPage exportData={exportData} importData={importData}/>}
    {activeModule==="ownerPortal"&&<PlaceholderPage icon={LogIn} title="Owner Portal" text="Owner logins, payment links and shared cloud invoice viewing are planned for the backend/database version."/>}
    {activeModule==="settings"&&<SettingsPage reset={()=>{if(confirm("Reset demo data?")){localStorage.removeItem(STORAGE_KEY);setData(starterData)}}}/>}
    {moduleConfig[activeModule]&&<ModulePage moduleKey={activeModule} data={data} horseNames={horseNames} search={search} setSearch={setSearch} horseFilter={horseFilter} setHorseFilter={setHorseFilter} historyHorse={historyHorse||horseNames[0]||""} setHistoryHorse={setHistoryHorse} openAdd={openAdd} openEdit={openEdit} deleteRecord={deleteRecord}/>}
    <BottomNav active={activeModule} setActive={setActiveModule}/>
    {modal&&<RecordModal modal={modal} horseNames={horseNames} onClose={()=>setModal(null)} onSave={saveRecord}/>}
    {invoiceModal&&<InvoiceModal modal={invoiceModal} data={data} onClose={()=>setInvoiceModal(null)} onSave={saveInvoice}/>}
    {shareModal&&<InvoiceShareModal invoice={shareModal} onClose={()=>setShareModal(null)} sendEmail={sendInvoiceEmail} sendSms={sendInvoiceSms} setPrintInvoice={setPrintInvoice}/>}
    {printInvoice&&<InvoicePrintView invoice={printInvoice} onClose={()=>setPrintInvoice(null)}/>}
  </div>
}

function Dashboard({data,finance,openAdd,setActiveModule}) {
  const dueTreatments=data.treatments.filter(r=>r.nextDue&&new Date(r.nextDue)<=addDays(new Date(),7));
  const lowStock=data.inventory.filter(r=>Number(r.quantity||0)<=Number(r.reorderLevel||0));
  const recentWork=[...data.work].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  const unpaidInvoices=data.invoices.filter(i=>i.status!=="Paid");
  return <main className="page">
    <section className="stats-grid">
      <Stat icon={BadgeCheck} label="Horses" value={data.horses.length} hint="stable register"/>
      <Stat icon={ClipboardList} label="Work Entries" value={data.work.length} hint="training log"/>
      <Stat icon={FileText} label="Unpaid Invoices" value={unpaidInvoices.length} hint="draft/sent/overdue"/>
      <Stat icon={DollarSign} label="Net Position" value={`$${finance.net.toLocaleString()}`} hint="income less expenses"/>
    </section>
    <section className="quick-grid">{[["Horse","horses"],["Work","work"],["Invoice","invoices"],["Treatment","treatments"],["Race","racing"],["Finance","finance"]].map(([label,key])=><button className="quick-button" key={key} onClick={()=>openAdd(key)}><Plus size={16}/>Add {label}</button>)}</section>
    <section className="dashboard-grid">
      <Panel title="Recent Work" action="Open" onAction={()=>setActiveModule("work")}><MiniList rows={recentWork} primary="horse" secondary={["date","sector","type","distance"]}/></Panel>
      <Panel title="Invoices" action="Open" onAction={()=>setActiveModule("invoices")}><MiniList rows={unpaidInvoices.slice(0,5)} primary="invoiceNumber" secondary={["owner","horse","status","dueDate"]} empty="No unpaid invoices."/></Panel>
      <Panel title="Low Stock" action="Open" onAction={()=>setActiveModule("inventory")}><MiniList rows={lowStock} primary="item" secondary={["quantity","unit","reorderLevel"]} empty="No low stock alerts."/></Panel>
      <Panel title="Treatment Alerts" action="Open" onAction={()=>setActiveModule("treatments")}><MiniList rows={dueTreatments} primary="horse" secondary={["treatment","nextDue"]} empty="No treatment alerts."/></Panel>
    </section>
  </main>
}

function InvoicesPage({invoices,openAdd,openEdit,deleteRecord,setPrintInvoice,setShareModal}) {
  const [query,setQuery]=useState("");
  const filtered=invoices.filter(i=>JSON.stringify(i).toLowerCase().includes(query.toLowerCase()));
  return <main className="page">
    <section className="module-header"><div className="module-icon"><FileText size={24}/></div><div><h2>Invoices</h2><p>Create, edit, print, share, email and SMS invoices.</p></div></section>
    <section className="toolbar"><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search invoices..."/></div><button className="primary-button" onClick={()=>openAdd("invoices")}><Plus size={18}/>Create Invoice</button></section>
    <section className="record-grid-list">{filtered.length?filtered.map(inv=>{const totals=invoiceTotals(inv);return <article className="record-card" key={inv.id}>
      <div className="record-head"><div><h3>{inv.invoiceNumber}</h3><p>{inv.owner} · {inv.horse}</p></div><div className="button-row"><button className="edit-button" onClick={()=>openEdit("invoices",inv)}><Edit3 size={16}/></button><button className="share-button" onClick={()=>setShareModal(inv)}><Share2 size={16}/></button><button className="print-button" onClick={()=>setPrintInvoice(inv)}><Printer size={16}/></button><button className="delete-button" onClick={()=>deleteRecord("invoices",inv.id)}><Trash2 size={16}/></button></div></div>
      <div className="detail-list"><div><span>Status</span><strong>{inv.status}</strong></div><div><span>Email</span><strong>{inv.ownerEmail || "-"}</strong></div><div><span>Phone</span><strong>{inv.ownerPhone || "-"}</strong></div><div><span>Due</span><strong>{inv.dueDate}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></div>
    </article>}):<p className="empty">No invoices found.</p>}</section>
  </main>
}

function InvoiceShareModal({invoice,onClose,sendEmail,sendSms,setPrintInvoice}) {
  const totals=invoiceTotals(invoice);
  const defaultEmail = `Hi ${invoice.owner || ""},

Please find invoice ${invoice.invoiceNumber} for ${invoice.horse || "your horse"}.

Total due: $${totals.total.toFixed(2)}
Due date: ${invoice.dueDate}

You can save the attached/printed invoice for your records.

Regards,
Stable Manager`;
  const defaultSms = `Invoice ${invoice.invoiceNumber} for ${invoice.horse}: $${totals.total.toFixed(2)} due ${invoice.dueDate}.`;
  const [emailBody,setEmailBody]=useState(defaultEmail);
  const [smsBody,setSmsBody]=useState(defaultSms);

  async function nativeShare() {
    const text = `${defaultSms}\n\n${invoiceText(invoice)}`;
    if (navigator.share) {
      await navigator.share({title:`Invoice ${invoice.invoiceNumber}`, text});
    } else {
      await navigator.clipboard.writeText(text);
      alert("Invoice text copied. Paste it into Messages, WhatsApp or email.");
    }
  }

  return <div className="modal-backdrop"><section className="modal-card invoice-modal">
    <div className="modal-header"><h2>Share Invoice {invoice.invoiceNumber}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></div>
    <section className="share-grid">
      <button className="primary-button" onClick={()=>setPrintInvoice(invoice)}><Printer size={18}/>Print / Save PDF</button>
      <button className="primary-button" onClick={nativeShare}><Share2 size={18}/>Phone Share Sheet</button>
    </section>
    <Field label={`Email to ${invoice.ownerEmail || "owner email missing"}`}><textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)}/></Field>
    <button className="primary-button full" onClick={()=>sendEmail(invoice,emailBody)}><Mail size={18}/>Send Email / Demo API</button>
    <Field label={`SMS to ${invoice.ownerPhone || "owner phone missing"}`}><textarea value={smsBody} onChange={e=>setSmsBody(e.target.value)}/></Field>
    <button className="primary-button full" onClick={()=>sendSms(invoice,smsBody)}><MessageCircle size={18}/>Send SMS / Demo API</button>
    <p className="muted share-note">Email/SMS buttons use demo serverless API stubs until you add Resend/Twilio keys in Vercel. Print/Share works now.</p>
  </section></div>
}

function InvoiceModal({modal,data,onClose,onSave}) {
  const [invoice,setInvoice]=useState(modal.invoice);
  const totals=invoiceTotals(invoice);
  function setField(key,value){setInvoice(cur=>({...cur,[key]:value}))}
  function setOwner(name){const owner=data.owners.find(o=>o.name===name);setInvoice(cur=>({...cur,owner:name,ownerEmail:owner?.email||cur.ownerEmail,ownerPhone:owner?.phone||cur.ownerPhone}))}
  function setLine(id,key,value){setInvoice(cur=>({...cur,lineItems:cur.lineItems.map(li=>li.id===id?{...li,[key]:value}:li)}))}
  function addLine(){setInvoice(cur=>({...cur,lineItems:[...cur.lineItems,{id:crypto.randomUUID(),description:"",quantity:1,unitPrice:0}]}))}
  function removeLine(id){setInvoice(cur=>({...cur,lineItems:cur.lineItems.filter(li=>li.id!==id)}))}
  return <div className="modal-backdrop"><section className="modal-card invoice-modal">
    <div className="modal-header"><h2>{modal.mode==="edit"?"Edit":"Create"} Invoice</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></div>
    <div className="form-grid">
      <Field label="Invoice Number"><input value={invoice.invoiceNumber} onChange={e=>setField("invoiceNumber",e.target.value)}/></Field>
      <Field label="Owner / Client"><input list="owners" value={invoice.owner} onChange={e=>setOwner(e.target.value)}/><datalist id="owners">{data.owners.map(o=><option key={o.id} value={o.name}/>)}</datalist></Field>
      <Field label="Owner Email"><input type="email" value={invoice.ownerEmail || ""} onChange={e=>setField("ownerEmail",e.target.value)}/></Field>
      <Field label="Owner Phone"><input value={invoice.ownerPhone || ""} onChange={e=>setField("ownerPhone",e.target.value)}/></Field>
      <Field label="Horse"><select value={invoice.horse} onChange={e=>setField("horse",e.target.value)}>{data.horses.map(h=><option key={h.id}>{h.name}</option>)}</select></Field>
      <Field label="Date"><input type="date" value={invoice.date} onChange={e=>setField("date",e.target.value)}/></Field>
      <Field label="Due Date"><input type="date" value={invoice.dueDate} onChange={e=>setField("dueDate",e.target.value)}/></Field>
      <Field label="Status"><select value={invoice.status} onChange={e=>setField("status",e.target.value)}><option>Draft</option><option>Sent</option><option>Part Paid</option><option>Paid</option><option>Overdue</option></select></Field>
      <Field label="GST"><select value={invoice.gstEnabled} onChange={e=>setField("gstEnabled",e.target.value)}><option>Yes</option><option>No</option></select></Field>
      <Field label="Notes"><textarea value={invoice.notes} onChange={e=>setField("notes",e.target.value)}/></Field>
    </div>
    <section className="invoice-lines"><div className="section-title"><h3>Line Items</h3><button className="text-button" onClick={addLine}>+ Add Line</button></div>
      {invoice.lineItems.map(li=><div className="line-item" key={li.id}>
        <input placeholder="Description" value={li.description} onChange={e=>setLine(li.id,"description",e.target.value)}/>
        <input type="number" placeholder="Qty" value={li.quantity} onChange={e=>setLine(li.id,"quantity",e.target.value)}/>
        <input type="number" placeholder="Unit $" value={li.unitPrice} onChange={e=>setLine(li.id,"unitPrice",e.target.value)}/>
        <strong>${(Number(li.quantity||0)*Number(li.unitPrice||0)).toFixed(2)}</strong>
        <button className="delete-button small-button" onClick={()=>removeLine(li.id)}><Trash2 size={14}/></button>
      </div>)}
    </section>
    <section className="invoice-totals"><div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></section>
    <button className="primary-button full" onClick={()=>onSave(invoice,modal.mode)}>Save Invoice</button>
  </section></div>
}

function InvoicePrintView({invoice,onClose}) {
  const totals=invoiceTotals(invoice);
  return <div className="print-backdrop"><section className="print-actions"><button className="primary-button" onClick={()=>window.print()}><Printer size={18}/>Print / Save PDF</button><button className="danger-button no-margin" onClick={onClose}>Close</button></section>
    <main className="invoice-print">
      <header className="invoice-print-head"><div><h1>Invoice</h1><p>Stable Manager Pro</p></div><div><strong>{invoice.invoiceNumber}</strong><p>Status: {invoice.status}</p></div></header>
      <section className="invoice-print-grid"><div><h3>Bill To</h3><p>{invoice.owner}</p><p>{invoice.ownerEmail}</p><p>{invoice.ownerPhone}</p><p>{invoice.horse}</p></div><div><h3>Dates</h3><p>Issued: {invoice.date}</p><p>Due: {invoice.dueDate}</p></div></section>
      <table className="invoice-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{invoice.lineItems.map(li=><tr key={li.id}><td>{li.description}</td><td>{li.quantity}</td><td>${Number(li.unitPrice||0).toFixed(2)}</td><td>${(Number(li.quantity||0)*Number(li.unitPrice||0)).toFixed(2)}</td></tr>)}</tbody></table>
      <section className="invoice-print-totals"><div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div><div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div><div className="grand-total"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div></section>
      {invoice.notes&&<section className="invoice-notes"><h3>Notes</h3><p>{invoice.notes}</p></section>}
    </main>
  </div>
}

function ModulePage({moduleKey,data,horseNames,search,setSearch,horseFilter,setHorseFilter,historyHorse,setHistoryHorse,openAdd,openEdit,deleteRecord}) {
  const config=moduleConfig[moduleKey]; const Icon=config.icon; const rows=data[moduleKey]||[];
  const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase())&&(horseFilter==="All"||r.horse===horseFilter||r.name===horseFilter));
  const showHorseFilter=rows.some(r=>r.horse)||["work","feed","finance","racing","treatments","farrier","gear","ownerUpdates","reminders"].includes(moduleKey);
  return <main className="page"><section className="module-header"><div className="module-icon"><Icon size={24}/></div><div><h2>{config.title}</h2><p>{config.subtitle}</p></div></section>
    <section className="toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${config.plural.toLowerCase()}...`}/></div>{showHorseFilter&&<select value={horseFilter} onChange={e=>setHorseFilter(e.target.value)}><option>All</option>{horseNames.map(n=><option key={n}>{n}</option>)}</select>}<button className="primary-button" onClick={()=>openAdd(moduleKey)}><Plus size={18}/>Add {config.label}</button></section>
    {moduleKey==="work"&&<WorkHistoryIsolator data={data} horseNames={horseNames} historyHorse={historyHorse} setHistoryHorse={setHistoryHorse} openEdit={openEdit}/>}
    <section className="record-grid-list">{filtered.length?filtered.map(item=><RecordCard key={item.id} moduleKey={moduleKey} item={item} config={config} openEdit={openEdit} deleteRecord={deleteRecord}/>):<p className="empty">No records found.</p>}</section>
  </main>
}

function WorkHistoryIsolator({data,horseNames,historyHorse,setHistoryHorse,openEdit}) {
  const selected=historyHorse||horseNames[0]||""; const rows=data.work.filter(r=>r.horse===selected).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return <section className="card isolator"><div className="section-title"><h3>Single Horse Work History Isolator</h3></div><div className="toolbar compact"><select value={selected} onChange={e=>setHistoryHorse(e.target.value)}>{horseNames.map(n=><option key={n}>{n}</option>)}</select></div><div className="mini-stats"><span>{rows.length} total works</span><span>{rows.filter(r=>r.sector==="Track Work").length} track</span><span>{rows.filter(r=>r.sector==="Jogger Machine").length} jogger machine</span><span>{rows.filter(r=>(r.warmUp||"").trim()).length} warm-ups</span></div><div className="list">{rows.length?rows.slice(0,8).map(r=><article className="mini-work" key={r.id} onClick={()=>openEdit("work",r)}><strong>{r.date} · {r.sector}</strong><span>{r.type} {r.distance?`· ${r.distance}`:""} {r.time?`· ${r.time}`:""}</span>{r.warmUp&&<em>Warm-up: {r.warmUp}</em>}{r.joggerMachine&&<em>Jogger: {r.joggerMachine}</em>}{r.notes&&<p>{r.notes}</p>}</article>):<p className="empty small">No work logged for this horse yet.</p>}</div></section>
}

function RecordCard({moduleKey,item,config,openEdit,deleteRecord}) {
  const title=item.name||item.horse||item.item||item.date||"Record"; const subtitle=item.stableName||item.type||item.category||item.status||item.sector||"";
  return <article className="record-card"><div className="record-head"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div><div className="button-row"><button className="edit-button" onClick={()=>openEdit(moduleKey,item)}><Edit3 size={16}/></button><button className="delete-button" onClick={()=>deleteRecord(moduleKey,item.id)}><Trash2 size={16}/></button></div></div><div className="detail-list">{config.display.map(key=><div key={key}><span>{labelize(key)}</span><strong>{formatValue(item[key])}</strong></div>)}</div></article>
}

function RecordModal({modal,horseNames,onClose,onSave}) {
  const {moduleKey,mode}=modal; const config=moduleConfig[moduleKey]; const [form,setForm]=useState(modal.record);
  return <div className="modal-backdrop"><section className="modal-card"><div className="modal-header"><h2>{mode==="edit"?"Edit":"Add"} {config.label}</h2><button className="icon-button" onClick={onClose}><X size={20}/></button></div><div className="form-grid">{config.fields.map(([key,label,type,options])=><Field key={key} label={label}><Input type={type} options={options} value={form[key]??""} horseNames={horseNames} onChange={v=>setForm(cur=>({...cur,[key]:v}))}/></Field>)}</div><button className="primary-button full" onClick={()=>onSave(moduleKey,form,mode)}>{mode==="edit"?"Save Changes":"Save"} {config.label}</button></section></div>
}
function Input({type,options,value,horseNames,onChange}){if(type==="textarea")return <textarea value={value} onChange={e=>onChange(e.target.value)}/>;if(type==="select")return <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>;if(type==="horse")return <select value={value} onChange={e=>onChange(e.target.value)}>{horseNames.length?horseNames.map(n=><option key={n}>{n}</option>):<option value="">Add a horse first</option>}</select>;return <input type={type} value={value} onChange={e=>onChange(e.target.value)}/>}

function Analytics({data,finance}){const byHorse=data.horses.map(h=>{const name=h.name;const work=data.work.filter(r=>r.horse===name);const jogger=work.filter(r=>r.sector==="Jogger Machine").length;const inv=data.invoices.filter(i=>i.horse===name).reduce((s,i)=>s+invoiceTotals(i).total,0);const income=data.finance.filter(r=>r.horse===name&&r.type==="Income").reduce((s,r)=>s+Number(r.amount||0),0);const expenses=data.finance.filter(r=>r.horse===name&&r.type==="Expense").reduce((s,r)=>s+Number(r.amount||0),0);return{name,work:work.length,jogger,invoices:inv,income,expenses,net:income-expenses}});return <main className="page"><section className="module-header"><div className="module-icon"><BarChart3 size={24}/></div><div><h2>Analytics</h2><p>Workload, invoices and finance summaries.</p></div></section><section className="stats-grid"><Stat icon={DollarSign} label="Income" value={`$${finance.income.toLocaleString()}`} hint="all income"/><Stat icon={DollarSign} label="Expenses" value={`$${finance.expenses.toLocaleString()}`} hint="all expenses"/><Stat icon={BarChart3} label="Net" value={`$${finance.net.toLocaleString()}`} hint="profit/loss"/><Stat icon={ClipboardList} label="Work Entries" value={data.work.length} hint="training volume"/></section><section className="record-grid-list">{byHorse.map(r=><article className="record-card" key={r.name}><h3>{r.name}</h3><div className="detail-list"><div><span>Work Entries</span><strong>{r.work}</strong></div><div><span>Jogger Machine</span><strong>{r.jogger}</strong></div><div><span>Invoiced</span><strong>${r.invoices.toFixed(2)}</strong></div><div><span>Income</span><strong>${r.income.toLocaleString()}</strong></div><div><span>Expenses</span><strong>${r.expenses.toLocaleString()}</strong></div><div><span>Net</span><strong>${r.net.toLocaleString()}</strong></div></div></article>)}</section></main>}

function SyncPage({exportData,importData}){return <main className="page"><section className="module-header"><div className="module-icon"><Cloud size={24}/></div><div><h2>Sync, Import & Export</h2><p>Export/import JSON now. Cloud multi-user sync is the next backend step.</p></div></section><section className="card"><button className="primary-button" onClick={exportData}><Download size={18}/>Export Data</button><label className="upload-label"><Upload size={18}/>Import JSON<input type="file" accept="application/json" onChange={e=>importData(e.target.files?.[0])}/></label></section><section className="card"><h3>Future Cloud Features</h3><p>Staff logins, owner portal, encrypted database, shared phone syncing, push notifications and backups need a backend like Supabase or Firebase.</p></section></main>}
function PlaceholderPage({icon:Icon,title,text}){return <main className="page"><section className="module-header"><div className="module-icon"><Icon size={24}/></div><div><h2>{title}</h2><p>{text}</p></div></section></main>}
function SettingsPage({reset}){return <main className="page"><section className="module-header"><div className="module-icon"><Settings size={24}/></div><div><h2>Settings</h2><p>Install and reset options.</p></div></section><section className="card"><h3>Install on iPhone</h3><p>Open the Vercel URL in Safari, tap Share, then Add to Home Screen.</p></section><section className="card"><button className="danger-button" onClick={reset}>Reset Demo Data</button></section></main>}

function ModuleStrip({active,setActive}){const modules=[["dashboard","Home",Home],["horses","Horses",BadgeCheck],["work","Work",ClipboardList],["invoices","Invoices",FileText],["racing","Racing",Trophy],["treatments","Vet",HeartPulse],["farrier","Farrier",CalendarDays],["feed","Feed",Wheat],["finance","Finance",DollarSign],["owners","Owners",Users],["staff","Staff",ShieldCheck],["inventory","Inventory",Package],["ownerUpdates","Updates",MessageSquareText],["gear","Gear",Settings],["reminders","Reminders",Bell],["analytics","Analytics",BarChart3],["sync","Sync",Cloud],["ownerPortal","Owner Portal",LogIn],["settings","Settings",Settings]];return <section className="module-strip">{modules.map(([key,label,Icon])=><button key={key} className={active===key?"active":""} onClick={()=>setActive(key)}><Icon size={15}/>{label}</button>)}</section>}
function BottomNav({active,setActive}){const nav=[["dashboard","Home",Home],["horses","Horses",BadgeCheck],["work","Work",ClipboardList],["invoices","Invoices",FileText],["racing","Race",Trophy],["treatments","Vet",HeartPulse],["finance","$",DollarSign],["sync","More",Settings]];return <nav className="bottom-nav">{nav.map(([key,label,Icon])=><button key={key} className={active===key?"active":""} onClick={()=>setActive(key)}><Icon size={20}/><span>{label}</span></button>)}</nav>}
function Panel({title,action,onAction,children}){return <section className="card"><div className="section-title"><h3>{title}</h3>{action&&<button className="text-button" onClick={onAction}>{action}</button>}</div>{children}</section>}
function MiniList({rows,primary,secondary,empty="No records yet."}){if(!rows.length)return <p className="empty small">{empty}</p>;return <div className="mini-list">{rows.map(r=><div className="mini-row" key={r.id}><strong>{r[primary]}</strong><span>{secondary.map(k=>r[k]).filter(Boolean).join(" · ")}</span></div>)}</div>}
function Stat({icon:Icon,label,value,hint}){return <section className="stat-card"><div className="stat-icon"><Icon size={22}/></div><div><p>{label}</p><strong>{value}</strong><small>{hint}</small></div></section>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function invoiceTotals(invoice){const subtotal=(invoice.lineItems||[]).reduce((s,li)=>s+Number(li.quantity||0)*Number(li.unitPrice||0),0);const gst=invoice.gstEnabled==="Yes"?subtotal*GST_RATE:0;return{subtotal,gst,total:subtotal+gst}}
function invoiceText(invoice){const totals=invoiceTotals(invoice);return `${invoice.invoiceNumber}\nOwner: ${invoice.owner}\nHorse: ${invoice.horse}\nDue: ${invoice.dueDate}\nTotal: $${totals.total.toFixed(2)}`}
function invoiceHtml(invoice){return `<h1>Invoice ${invoice.invoiceNumber}</h1><p>${invoice.owner} - ${invoice.horse}</p><p>Total: $${invoiceTotals(invoice).total.toFixed(2)}</p>`}
function labelize(v){return v.replace(/([A-Z])/g," $1").replace(/^./,l=>l.toUpperCase())}
function formatValue(v){return v===undefined||v===null||v===""?"-":String(v)}
function normalise(record,moduleKey){const next={...record};moduleConfig[moduleKey].fields.forEach(([key,label,type])=>{if(type==="number")next[key]=next[key]===""?0:Number(next[key])});return next}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d}
createRoot(document.getElementById("root")).render(<App/>);
