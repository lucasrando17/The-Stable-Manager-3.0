
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
import "../styles.css";

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
