import { useState, useCallback } from "react";

// ─── DEMO USERS ───────────────────────────────────────────────────────────
const USERS = [
  { uid:"u1", email:"owner@pharma.com",      password:"owner123",   role:"owner",      name:"Dr. Aarav Shah" },
  { uid:"u2", email:"manager@pharma.com",    password:"manager123", role:"manager",    name:"Priya Menon" },
  { uid:"u3", email:"pharmacist@pharma.com", password:"pharma123",  role:"pharmacist", name:"Rohan Das" },
];

const D = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const TODAY = new Date().toISOString().split("T")[0];

let MEDS = [
  { id:"m1", name:"Paracetamol 500mg",   company:"Sun Pharma",  batch:"SP2024A", expiry:D(40),  mrp:12,  cost:7,  qty:8,  reorder:20, cat:"Analgesic" },
  { id:"m2", name:"Amoxicillin 250mg",   company:"Cipla",       batch:"CP2024B", expiry:D(200), mrp:85,  cost:50, qty:45, reorder:15, cat:"Antibiotic" },
  { id:"m3", name:"Metformin 500mg",     company:"Zydus",       batch:"ZY2024C", expiry:D(55),  mrp:30,  cost:18, qty:60, reorder:25, cat:"Antidiabetic" },
  { id:"m4", name:"Atorvastatin 10mg",   company:"Lupin",       batch:"LP2024D", expiry:D(300), mrp:120, cost:70, qty:5,  reorder:10, cat:"Cardiac" },
  { id:"m5", name:"Omeprazole 20mg",     company:"Dr. Reddy's", batch:"DR2024E", expiry:D(180), mrp:45,  cost:25, qty:90, reorder:20, cat:"GI" },
  { id:"m6", name:"Cetirizine 10mg",     company:"Sun Pharma",  batch:"SP2024F", expiry:D(25),  mrp:18,  cost:10, qty:30, reorder:15, cat:"Antihistamine" },
  { id:"m7", name:"Azithromycin 500mg",  company:"Cipla",       batch:"CP2024G", expiry:D(400), mrp:95,  cost:55, qty:22, reorder:10, cat:"Antibiotic" },
  { id:"m8", name:"Pantoprazole 40mg",   company:"Zydus",       batch:"ZY2024H", expiry:D(150), mrp:55,  cost:30, qty:7,  reorder:12, cat:"GI" },
];

let SALES = [
  { id:"b1", date:TODAY, items:[{id:"m2",name:"Amoxicillin 250mg",qty:2,mrp:85,cost:50},{id:"m5",name:"Omeprazole 20mg",qty:1,mrp:45,cost:25}], total:215, profit:55, by:"Rohan Das" },
  { id:"b2", date:TODAY, items:[{id:"m1",name:"Paracetamol 500mg",qty:3,mrp:12,cost:7},{id:"m6",name:"Cetirizine 10mg",qty:2,mrp:18,cost:10}],   total:72,  profit:21, by:"Rohan Das" },
  { id:"b3", date:D(-1), items:[{id:"m3",name:"Metformin 500mg",qty:5,mrp:30,cost:18}],    total:150, profit:60,  by:"Rohan Das" },
  { id:"b4", date:D(-1), items:[{id:"m7",name:"Azithromycin 500mg",qty:1,mrp:95,cost:55}], total:95,  profit:40,  by:"Rohan Das" },
  { id:"b5", date:D(-3), items:[{id:"m4",name:"Atorvastatin 10mg",qty:2,mrp:120,cost:70}], total:240, profit:100, by:"Rohan Das" },
  { id:"b6", date:D(-5), items:[{id:"m2",name:"Amoxicillin 250mg",qty:3,mrp:85,cost:50}],  total:255, profit:105, by:"Rohan Das" },
  { id:"b7", date:D(-8), items:[{id:"m8",name:"Pantoprazole 40mg",qty:2,mrp:55,cost:30}],  total:110, profit:50,  by:"Rohan Das" },
];

let SUPPLIERS = [
  { id:"s1", name:"Medico Distributors", contact:"Rajesh Kumar", phone:"9876543210", email:"rajesh@medico.com",    meds:["m1","m6"] },
  { id:"s2", name:"Cipla Direct",        contact:"Anita Sharma", phone:"9123456789", email:"anita@cipla.com",      meds:["m2","m7"] },
  { id:"s3", name:"HealthLine Supply",   contact:"Suresh Nair",  phone:"9012345678", email:"suresh@healthline.com", meds:["m3","m4","m5","m8"] },
];

let DAMAGES = [];
let REFILLS = [];

// ─── HELPERS ──────────────────────────────────────────────────────────────
const daysLeft = (exp) => Math.ceil((new Date(exp) - new Date()) / 86400000);
const rs       = (n)   => "₹" + Number(n).toFixed(2);
const fmtDate  = (d)   => new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

// ─── STYLES ───────────────────────────────────────────────────────────────
const C = { bg:"#0f1117", surface:"#1a1e2b", surface2:"#161a24", border:"#2a2d3a", accent:"#00e5a0", blue:"#0ea5e9", amber:"#f59e0b", danger:"#ef4444", text:"#e8eaf0", muted:"#8890a4" };

const S = {
  app:      { display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:C.bg, color:C.text },
  sidebar:  { width:220, background:C.surface2, borderRight:"1px solid "+C.border, display:"flex", flexDirection:"column", padding:"24px 0", position:"fixed", top:0, left:0, bottom:0, zIndex:50 },
  main:     { marginLeft:220, flex:1, padding:28, minHeight:"100vh" },
  logo:     { padding:"0 20px 24px", fontSize:20, fontWeight:700, color:C.accent, borderBottom:"1px solid "+C.border, marginBottom:8 },
  navBtn:   (a) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 20px", background:a?"rgba(0,229,160,0.1)":"none", color:a?C.accent:C.muted, border:"none", cursor:"pointer", fontSize:14, fontWeight:a?600:400, width:"100%", textAlign:"left", borderLeft:a?"3px solid "+C.accent:"3px solid transparent", transition:"all 0.15s" }),
  card:     { background:C.surface, border:"1px solid "+C.border, borderRadius:12, padding:20, marginBottom:16 },
  statCard: { background:C.surface, border:"1px solid "+C.border, borderRadius:12, padding:18 },
  statGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 },
  table:    { width:"100%", borderCollapse:"collapse", fontSize:13 },
  th:       { textAlign:"left", padding:"8px 12px", color:C.muted, fontSize:11, letterSpacing:1, textTransform:"uppercase", borderBottom:"1px solid "+C.border },
  td:       { padding:"11px 12px", borderBottom:"1px solid #1e2330", verticalAlign:"middle" },
  input:    { width:"100%", padding:"9px 12px", background:C.bg, border:"1px solid "+C.border, borderRadius:8, color:C.text, fontSize:14, outline:"none", boxSizing:"border-box" },
  select:   { width:"100%", padding:"9px 12px", background:C.bg, border:"1px solid "+C.border, borderRadius:8, color:C.text, fontSize:14, outline:"none" },
  label:    { fontSize:11, color:C.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:0.8 },
  btnPrimary:{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", background:C.accent, color:"#000", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" },
  btnGhost:  { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", background:C.surface, color:C.text, border:"1px solid "+C.border, borderRadius:8, fontSize:14, cursor:"pointer" },
  btnDanger: { display:"inline-flex", alignItems:"center", gap:7, padding:"7px 14px", background:"rgba(239,68,68,0.1)", color:C.danger, border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, cursor:"pointer" },
  btnRefill: { display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", background:"rgba(0,229,160,0.1)", color:C.accent, border:"1px solid rgba(0,229,160,0.25)", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:600 },
  btnSm:     { padding:"5px 10px", fontSize:12 },
  badgeGreen: { background:"rgba(0,229,160,0.12)",  color:C.accent, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, display:"inline-block" },
  badgeRed:   { background:"rgba(239,68,68,0.12)",  color:C.danger, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, display:"inline-block" },
  badgeYellow:{ background:"rgba(245,158,11,0.12)", color:C.amber,  padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, display:"inline-block" },
  badgeBlue:  { background:"rgba(14,165,233,0.12)", color:C.blue,   padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, display:"inline-block" },
  badgeGray:  { background:"rgba(136,144,164,0.12)",color:C.muted,  padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, display:"inline-block" },
  alertWarn:   { background:"rgba(245,158,11,0.07)",  border:"1px solid rgba(245,158,11,0.25)",  borderRadius:8, padding:"11px 14px", marginBottom:10, color:"#fcd34d", fontSize:13 },
  alertDanger: { background:"rgba(239,68,68,0.07)",   border:"1px solid rgba(239,68,68,0.25)",   borderRadius:8, padding:"11px 14px", marginBottom:10, color:"#fca5a5", fontSize:13 },
  alertSuccess:{ background:"rgba(0,229,160,0.07)",   border:"1px solid rgba(0,229,160,0.25)",   borderRadius:8, padding:"11px 14px", marginBottom:10, color:C.accent,   fontSize:13 },
  overlay:  { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
  modal:    { background:C.surface, border:"1px solid "+C.border, borderRadius:14, padding:28, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" },
  pageTitle:   { fontSize:26, fontWeight:700, marginBottom:4, color:C.text },
  pageSub:     { fontSize:13, color:C.muted, marginBottom:22 },
  sectionTitle:{ fontSize:15, fontWeight:600, marginBottom:14, color:C.text },
  tabs: { display:"flex", gap:4, background:C.surface2, borderRadius:8, padding:4, marginBottom:20, width:"fit-content" },
  tab:  (a) => ({ padding:"8px 16px", borderRadius:6, border:"none", cursor:"pointer", fontSize:13, background:a?C.surface:"none", color:a?C.text:C.muted, fontWeight:a?600:400 }),
  grid2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
  row:  { display:"flex", alignItems:"center", justifyContent:"space-between" },
  userPill: { margin:"auto 12px 0", padding:"12px 14px", background:C.bg, borderRadius:10, display:"flex", alignItems:"center", gap:10 },
  avatar: (c) => ({ width:32, height:32, borderRadius:"50%", background:c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000", flexShrink:0 }),
};

// ─── LOGIN ────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");

  const attempt = (em, pw) => {
    const u = USERS.find(x => x.email===em && x.password===pw);
    if (u) onLogin(u); else setErr("Wrong email or password.");
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg }}>
      <div style={{ background:C.surface, border:"1px solid "+C.border, borderRadius:16, padding:40, width:400, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize:26, fontWeight:800, color:C.accent, marginBottom:4 }}>⚕ PharmaFlow</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:28 }}>Pharmacy Management System</div>
        <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Quick Sign In</div>
        {USERS.map(u => (
          <button key={u.uid} onClick={() => onLogin(u)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"11px 14px", background:C.bg, border:"1px solid "+C.border, borderRadius:8, marginBottom:8, cursor:"pointer", color:C.text }}>
            <span>
              <span style={{ fontWeight:700, fontSize:13, color:u.role==="owner"?C.accent:u.role==="manager"?C.blue:C.amber }}>
                {u.role.charAt(0).toUpperCase()+u.role.slice(1)}
              </span>
              <span style={{ color:C.muted, fontSize:12, marginLeft:8 }}>{u.name}</span>
            </span>
            <span style={{ fontSize:11, color:C.muted }}>Sign in →</span>
          </button>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0" }}>
          <div style={{ flex:1, height:1, background:C.border }} />
          <span style={{ fontSize:11, color:C.muted }}>OR MANUALLY</span>
          <div style={{ flex:1, height:1, background:C.border }} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={email} placeholder="email@pharmacy.com" onChange={e=>setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={pass} placeholder="••••••••"
            onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt(email,pass)} />
        </div>
        {err && <div style={{ color:C.danger, fontSize:13, marginBottom:10 }}>{err}</div>}
        <button style={{ ...S.btnPrimary, width:"100%", justifyContent:"center" }} onClick={()=>attempt(email,pass)}>Sign In</button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",  roles:["owner","manager","pharmacist"] },
  { id:"billing",   label:"Billing",    roles:["pharmacist"] },
  { id:"inventory", label:"Inventory",  roles:["pharmacist","manager"] },
  { id:"suppliers", label:"Suppliers",  roles:["manager"] },
  { id:"reports",   label:"Reports",    roles:["owner"] },
];
const NAV_ICONS = { dashboard:"📊", billing:"🧾", inventory:"📦", suppliers:"🚚", reports:"📈" };

function Sidebar({ user, page, setPage, onLogout }) {
  const items = NAV.filter(n => n.roles.includes(user.role));
  const avatarColor = user.role==="owner"?C.accent:user.role==="manager"?C.blue:C.amber;
  return (
    <div style={S.sidebar}>
      <div style={S.logo}>⚕ PharmaFlow</div>
      {items.map(n => (
        <button key={n.id} style={S.navBtn(page===n.id)} onClick={()=>setPage(n.id)}>
          {NAV_ICONS[n.id]} {n.label}
        </button>
      ))}
      <div style={S.userPill}>
        <div style={S.avatar(avatarColor)}>{user.name[0]}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600 }}>{user.name.split(" ")[0]}</div>
          <div style={{ fontSize:11, color:C.muted, textTransform:"capitalize" }}>{user.role}</div>
        </div>
        <button style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }} onClick={onLogout}>⏻</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
function Dashboard({ meds, sales }) {
  const todaySales = sales.filter(s=>s.date===TODAY);
  const revenue    = todaySales.reduce((a,s)=>a+s.total,0);
  const profit     = todaySales.reduce((a,s)=>a+s.profit,0);
  const expiring   = meds.filter(m=>{ const d=daysLeft(m.expiry); return d>0&&d<=60; });
  const lowStock   = meds.filter(m=>m.qty<=m.reorder&&m.qty>0);
  const expired    = meds.filter(m=>daysLeft(m.expiry)<=0);
  const Stat = ({ label, value, color }) => (
    <div style={S.statCard}>
      <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:color||C.text }}>{value}</div>
    </div>
  );
  return (
    <div>
      <div style={S.pageTitle}>Dashboard</div>
      <div style={S.pageSub}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
      <div style={S.statGrid}>
        <Stat label="Today's Revenue" value={rs(revenue)}       color={C.accent} />
        <Stat label="Today's Profit"  value={rs(profit)} />
        <Stat label="Bills Today"     value={todaySales.length} />
        <Stat label="Low Stock"       value={lowStock.length}   color={lowStock.length?C.amber:undefined} />
        <Stat label="Expiring Soon"   value={expiring.length}   color={expiring.length?C.danger:undefined} />
        <Stat label="Total Medicines" value={meds.length} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {expiring.length>0 && (
          <div style={S.card}>
            <div style={S.sectionTitle}>⚠ Expiring Within 60 Days</div>
            {expiring.slice(0,5).map(m=>(
              <div key={m.id} style={S.alertWarn}>
                <strong>{m.name}</strong><br/>
                <span style={{fontSize:11}}>Expires: {fmtDate(m.expiry)} · {daysLeft(m.expiry)} days · Stock: {m.qty}</span>
              </div>
            ))}
          </div>
        )}
        {lowStock.length>0 && (
          <div style={S.card}>
            <div style={S.sectionTitle}>🔴 Low Stock Alert</div>
            {lowStock.slice(0,5).map(m=>(
              <div key={m.id} style={S.alertDanger}>
                <strong>{m.name}</strong><br/>
                <span style={{fontSize:11}}>Stock: {m.qty} · Reorder at: {m.reorder}</span>
              </div>
            ))}
          </div>
        )}
        <div style={S.card}>
          <div style={S.sectionTitle}>Recent Bills</div>
          {sales.slice(-5).reverse().map(s=>(
            <div key={s.id} style={{...S.row, padding:"8px 0", borderBottom:"1px solid #1e2330"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{s.id}</div>
                <div style={{fontSize:11,color:C.muted}}>{s.items.length} items · {fmtDate(s.date)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.accent,fontWeight:700}}>{rs(s.total)}</div>
                <div style={{fontSize:11,color:C.muted}}>Profit: {rs(s.profit)}</div>
              </div>
            </div>
          ))}
        </div>
        {expired.length>0 && (
          <div style={S.card}>
            <div style={S.sectionTitle}>❌ Expired Medicines</div>
            {expired.map(m=>(
              <div key={m.id} style={S.alertDanger}><strong>{m.name}</strong> — Expired {fmtDate(m.expiry)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BILLING ──────────────────────────────────────────────────────────────
function Billing({ user, meds, onSale }) {
  const [q, setQ]         = useState("");
  const [results, setRes] = useState([]);
  const [items, setItems] = useState([]);
  const [payment, setPay] = useState("");
  const [receipt, setRec] = useState(null);
  const [err, setErr]     = useState("");

  const search = (v) => {
    setQ(v);
    if (v.length<2) { setRes([]); return; }
    setRes(meds.filter(m=>m.qty>0&&daysLeft(m.expiry)>0&&m.name.toLowerCase().includes(v.toLowerCase())));
  };
  const add = (m) => {
    setQ(""); setRes([]);
    const ex = items.find(i=>i.id===m.id);
    if (ex) setItems(items.map(i=>i.id===m.id?{...i,qty:i.qty+1}:i));
    else    setItems([...items, {id:m.id,name:m.name,mrp:m.mrp,cost:m.cost,qty:1,max:m.qty,expiry:m.expiry}]);
  };
  const setQty = (id, v) => {
    const it = items.find(i=>i.id===id);
    const n  = parseInt(v)||1;
    if (n<1||n>it.max) return;
    setItems(items.map(i=>i.id===id?{...i,qty:n}:i));
  };
  const total  = items.reduce((a,i)=>a+i.mrp*i.qty, 0);
  const profit = items.reduce((a,i)=>a+(i.mrp-i.cost)*i.qty, 0);
  const paid   = parseFloat(payment)||0;
  const change = paid-total;
  const complete = () => {
    if (!items.length) { setErr("Add at least one medicine."); return; }
    if (paid<total)    { setErr("Payment is less than total."); return; }
    const sale = { id:"B"+Date.now(), date:TODAY, items:items.map(i=>({id:i.id,name:i.name,qty:i.qty,mrp:i.mrp,cost:i.cost})), total, profit, by:user.name };
    SALES.push(sale);
    sale.items.forEach(it=>{ const m=MEDS.find(x=>x.id===it.id); if(m) m.qty-=it.qty; });
    onSale(); setRec({...sale,change}); setItems([]); setPay(""); setErr("");
  };

  return (
    <div>
      <div style={S.pageTitle}>Billing</div>
      <div style={S.pageSub}>Create a new bill for a customer</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
        <div>
          <div style={S.card}>
            <div style={{ position:"relative", marginBottom:16 }}>
              <input style={{...S.input,paddingLeft:36}} placeholder="Search medicine…" value={q} onChange={e=>search(e.target.value)} />
              <span style={{ position:"absolute", left:11, top:10, color:C.muted }}>🔍</span>
              {results.length>0 && (
                <div style={{ position:"absolute", top:"100%", left:0, right:0, background:C.surface, border:"1px solid "+C.border, borderRadius:8, marginTop:4, maxHeight:240, overflowY:"auto", zIndex:100 }}>
                  {results.map(m=>(
                    <div key={m.id} onClick={()=>add(m)}
                      style={{ padding:"10px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", borderBottom:"1px solid #1e2330", fontSize:13 }}>
                      <div>
                        <div style={{fontWeight:600}}>{m.name}</div>
                        <div style={{fontSize:11,color:C.muted}}>{m.company} · Exp: {fmtDate(m.expiry)} · Stock: {m.qty}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:700,color:C.accent}}>{rs(m.mrp)}</div>
                        {daysLeft(m.expiry)<=60&&<span style={S.badgeYellow}>Exp soon</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length===0 ? (
              <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>Search and add medicines to begin billing</div>
            ) : (
              <table style={S.table}>
                <thead><tr>{["Medicine","Expiry","MRP","Qty","Amount",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {items.map(it=>(
                    <tr key={it.id}>
                      <td style={S.td}><strong>{it.name}</strong></td>
                      <td style={S.td}><span style={daysLeft(it.expiry)<=60?S.badgeYellow:S.badgeGreen}>{fmtDate(it.expiry)}</span></td>
                      <td style={S.td}>{rs(it.mrp)}</td>
                      <td style={S.td}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <button style={{...S.btnGhost,...S.btnSm}} onClick={()=>setQty(it.id,it.qty-1)}>−</button>
                          <span style={{minWidth:24,textAlign:"center"}}>{it.qty}</span>
                          <button style={{...S.btnGhost,...S.btnSm}} onClick={()=>setQty(it.id,it.qty+1)}>+</button>
                        </div>
                      </td>
                      <td style={{...S.td,fontWeight:700,color:C.accent}}>{rs(it.mrp*it.qty)}</td>
                      <td style={S.td}><button style={S.btnDanger} onClick={()=>setItems(items.filter(i=>i.id!==it.id))}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle}>Bill Summary</div>
          {items.map(it=>(
            <div key={it.id} style={{...S.row,fontSize:12,color:C.muted,marginBottom:4}}>
              <span>{it.name} ×{it.qty}</span><span style={{color:C.text}}>{rs(it.mrp*it.qty)}</span>
            </div>
          ))}
          {!items.length&&<div style={{fontSize:13,color:C.muted,marginBottom:12}}>No items</div>}
          <div style={{borderTop:"1px solid "+C.border,paddingTop:10,marginTop:10,marginBottom:16,...S.row}}>
            <span style={{fontWeight:700,fontSize:16}}>Total</span>
            <span style={{fontWeight:700,fontSize:18,color:C.accent}}>{rs(total)}</span>
          </div>
          <div style={{marginBottom:12}}>
            <label style={S.label}>Cash Received (₹)</label>
            <input style={S.input} type="number" value={payment} onChange={e=>setPay(e.target.value)} placeholder="0.00" />
          </div>
          {paid>=total&&paid>0&&<div style={{...S.alertSuccess,marginBottom:12}}>✓ Change: <strong>{rs(change)}</strong></div>}
          {err&&<div style={{...S.alertDanger,marginBottom:12}}>{err}</div>}
          <button style={{...S.btnPrimary,width:"100%",justifyContent:"center"}} onClick={complete}>🖨 Complete & Print</button>
        </div>
      </div>
      {receipt&&(
        <div style={S.overlay}>
          <div style={{...S.modal,maxWidth:380}}>
            <div style={{...S.row,marginBottom:20}}>
              <span style={{fontSize:18,fontWeight:700}}>Receipt</span>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}} onClick={()=>setRec(null)}>✕</button>
            </div>
            <div style={{background:"#fff",color:"#111",padding:20,borderRadius:8,fontSize:13}}>
              <div style={{textAlign:"center",borderBottom:"1px dashed #ccc",paddingBottom:12,marginBottom:12}}>
                <div style={{fontSize:18,fontWeight:800}}>⚕ PharmaFlow</div>
                <div style={{fontSize:11,color:"#555"}}>Bill: {receipt.id} · {fmtDate(receipt.date)}</div>
                <div style={{fontSize:11,color:"#555"}}>Cashier: {user.name}</div>
              </div>
              {receipt.items.map((it,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
                  <span>{it.name} ×{it.qty}</span><span>₹{(it.mrp*it.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{borderTop:"1px solid #ccc",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontWeight:800}}>
                <span>TOTAL</span><span>₹{receipt.total.toFixed(2)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}><span>Paid</span><span>₹{(receipt.total+receipt.change).toFixed(2)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}><span>Change</span><span>₹{receipt.change.toFixed(2)}</span></div>
              <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#777"}}>Thank you!</div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button style={S.btnPrimary} onClick={()=>window.print()}>🖨 Print</button>
              <button style={S.btnGhost}   onClick={()=>setRec(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INVENTORY ────────────────────────────────────────────────────────────
function Inventory({ user, meds, refresh }) {
  const [tab, setTab]     = useState("stock");
  const [q, setQ]         = useState("");
  const [showAdd, setAdd] = useState(false);
  const [dmgMed, setDmg]  = useState(null);
  const [rfMed, setRfMed] = useState(null);
  const [err, setErr]     = useState("");
  const [form, setForm]   = useState({ name:"", company:"", batch:"", expiry:"", mrp:"", cost:"", qty:"", reorder:"", cat:"General" });
  const [dmgForm, setDF]  = useState({ qty:1, reason:"" });
  const [rfForm, setRfF]  = useState({ qty:"", batch:"", expiry:"", note:"" });
  const CATS = ["General","Analgesic","Antibiotic","Antidiabetic","Cardiac","GI","Antihistamine","Vitamin","Other"];

  const filtered = meds.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.company.toLowerCase().includes(q.toLowerCase()));
  const expiring = meds.filter(m=>{ const d=daysLeft(m.expiry); return d>0&&d<=60; });
  const lowStock = meds.filter(m=>m.qty<=m.reorder);

  const addMed = () => {
    if (!form.name||!form.company||!form.batch||!form.expiry||!form.mrp||!form.cost||!form.qty||!form.reorder) { setErr("Fill all fields."); return; }
    MEDS.push({ id:"m"+Date.now(), name:form.name, company:form.company, batch:form.batch, expiry:form.expiry, mrp:+form.mrp, cost:+form.cost, qty:+form.qty, reorder:+form.reorder, cat:form.cat });
    refresh(); setAdd(false); setForm({ name:"", company:"", batch:"", expiry:"", mrp:"", cost:"", qty:"", reorder:"", cat:"General" }); setErr("");
  };

  const recDamage = () => {
    if (!dmgForm.reason)        { setErr("Select a reason."); return; }
    if (+dmgForm.qty>dmgMed.qty){ setErr("Qty exceeds current stock."); return; }
    if (+dmgForm.qty<1)         { setErr("Qty must be at least 1."); return; }
    DAMAGES.push({ id:"d"+Date.now(), medId:dmgMed.id, name:dmgMed.name, qty:+dmgForm.qty, reason:dmgForm.reason, date:TODAY, by:user.name });
    const m=MEDS.find(x=>x.id===dmgMed.id); if(m) m.qty -= +dmgForm.qty;
    refresh(); setDmg(null); setDF({qty:1,reason:""}); setErr("");
  };

  const openRefill = (m) => { setRfMed(m); setRfF({ qty:"", batch:m.batch, expiry:m.expiry, note:"" }); setErr(""); };

  const recRefill = () => {
    if (!rfForm.qty||+rfForm.qty<1){ setErr("Enter a valid quantity to add."); return; }
    if (!rfForm.batch)              { setErr("Enter a batch number."); return; }
    if (!rfForm.expiry)             { setErr("Enter the expiry date."); return; }
    const prevQty  = rfMed.qty;
    const addedQty = +rfForm.qty;
    const m = MEDS.find(x=>x.id===rfMed.id);
    if (m) { m.qty = prevQty+addedQty; m.batch = rfForm.batch; m.expiry = rfForm.expiry; }
    REFILLS.push({ id:"r"+Date.now(), medId:rfMed.id, name:rfMed.name, addedQty, prevQty, newQty:prevQty+addedQty, batch:rfForm.batch, expiry:rfForm.expiry, note:rfForm.note, date:TODAY, by:user.name });
    refresh(); setRfMed(null); setRfF({qty:"",batch:"",expiry:"",note:""}); setErr("");
  };

  const statusBadge = (m) => {
    const d = daysLeft(m.expiry);
    if (d<=0)            return <span style={S.badgeRed}>Expired</span>;
    if (d<=60)           return <span style={S.badgeYellow}>Exp {d}d</span>;
    if (m.qty<=m.reorder)return <span style={S.badgeRed}>Low Stock</span>;
    return <span style={S.badgeGreen}>OK</span>;
  };

  return (
    <div>
      <div style={{...S.row,marginBottom:4}}>
        <div style={S.pageTitle}>Inventory</div>
        <button style={S.btnPrimary} onClick={()=>{setAdd(true);setErr("");}}>+ Add Medicine</button>
      </div>
      <div style={S.pageSub}>Manage stock, refills, expiry alerts and damages</div>

      <div style={S.tabs}>
        {[["stock","All Stock"],["alerts","Alerts ("+( expiring.length+lowStock.length)+")"],["refills","Refill Log ("+REFILLS.length+")"],["damage","Damage Log"]].map(([id,lbl])=>(
          <button key={id} style={S.tab(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* ALL STOCK */}
      {tab==="stock"&&(
        <div style={S.card}>
          <input style={{...S.input,marginBottom:14}} placeholder="Search medicine or company…" value={q} onChange={e=>setQ(e.target.value)} />
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>{["Medicine","Company","Batch","Expiry","MRP","Cost","Stock","Status","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(m=>(
                  <tr key={m.id}>
                    <td style={S.td}><strong style={{fontSize:13}}>{m.name}</strong><br/><span style={{fontSize:11,color:C.muted}}>{m.cat}</span></td>
                    <td style={S.td}>{m.company}</td>
                    <td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{m.batch}</td>
                    <td style={S.td}>{fmtDate(m.expiry)}</td>
                    <td style={S.td}>{rs(m.mrp)}</td>
                    <td style={S.td}>{rs(m.cost)}</td>
                    <td style={S.td}>
                      <span style={{color:m.qty<=m.reorder?C.danger:C.text,fontWeight:700}}>{m.qty}</span>
                      <span style={{fontSize:11,color:C.muted}}> /{m.reorder}</span>
                    </td>
                    <td style={S.td}>{statusBadge(m)}</td>
                    <td style={S.td}>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <button style={S.btnRefill} onClick={()=>openRefill(m)}>📦 Refill</button>
                        <button style={S.btnDanger} onClick={()=>{setDmg(m);setErr("");}}>Damage</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALERTS */}
      {tab==="alerts"&&(
        <div>
          {expiring.length>0&&(
            <div style={S.card}>
              <div style={S.sectionTitle}>⚠ Expiring Within 60 Days — Sell First!</div>
              <table style={S.table}><thead><tr>{["Medicine","Batch","Expiry","Days Left","Stock",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{expiring.sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).map(m=>(
                  <tr key={m.id}>
                    <td style={{...S.td,fontWeight:600}}>{m.name}</td>
                    <td style={S.td}>{m.batch}</td>
                    <td style={S.td}>{fmtDate(m.expiry)}</td>
                    <td style={S.td}><span style={S.badgeYellow}>{daysLeft(m.expiry)} days</span></td>
                    <td style={S.td}>{m.qty}</td>
                    <td style={S.td}><button style={S.btnRefill} onClick={()=>openRefill(m)}>📦 Refill</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {lowStock.length>0&&(
            <div style={S.card}>
              <div style={S.sectionTitle}>🔴 Below Reorder Level — Reorder Now!</div>
              <table style={S.table}><thead><tr>{["Medicine","Company","Stock","Reorder At","Shortage",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{lowStock.map(m=>(
                  <tr key={m.id}>
                    <td style={{...S.td,fontWeight:600}}>{m.name}</td>
                    <td style={S.td}>{m.company}</td>
                    <td style={{...S.td,color:C.danger,fontWeight:700}}>{m.qty}</td>
                    <td style={S.td}>{m.reorder}</td>
                    <td style={S.td}><span style={S.badgeRed}>{Math.max(0,m.reorder-m.qty)} short</span></td>
                    <td style={S.td}><button style={S.btnRefill} onClick={()=>openRefill(m)}>📦 Refill</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {!expiring.length&&!lowStock.length&&(
            <div style={{...S.card,textAlign:"center",padding:"50px 0",color:C.muted}}>✅ All medicines are in good shape. No alerts!</div>
          )}
        </div>
      )}

      {/* REFILL LOG */}
      {tab==="refills"&&(
        <div style={S.card}>
          <div style={{...S.row,marginBottom:16}}>
            <div style={S.sectionTitle}>📦 Stock Refill History</div>
            <span style={S.badgeBlue}>{REFILLS.length} refill{REFILLS.length!==1?"s":""} recorded</span>
          </div>
          {REFILLS.length===0?(
            <div style={{color:C.muted,textAlign:"center",padding:"30px 0"}}>
              No refills recorded yet.<br/>
              <span style={{fontSize:12}}>Use the "📦 Refill" button on any medicine in the All Stock tab.</span>
            </div>
          ):(
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead><tr>{["Medicine","Added","Before → After","Batch","New Expiry","Date","By","Note"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...REFILLS].reverse().map(r=>(
                    <tr key={r.id}>
                      <td style={{...S.td,fontWeight:600}}>{r.name}</td>
                      <td style={S.td}><span style={S.badgeGreen}>+{r.addedQty}</span></td>
                      <td style={S.td}>
                        <span style={{color:C.muted}}>{r.prevQty}</span>
                        <span style={{color:C.muted}}> → </span>
                        <span style={{color:C.accent,fontWeight:700}}>{r.newQty}</span>
                      </td>
                      <td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{r.batch}</td>
                      <td style={S.td}>{fmtDate(r.expiry)}</td>
                      <td style={S.td}>{fmtDate(r.date)}</td>
                      <td style={S.td}>{r.by}</td>
                      <td style={{...S.td,color:C.muted,fontSize:12}}>{r.note||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DAMAGE LOG */}
      {tab==="damage"&&(
        <div style={S.card}>
          <div style={S.sectionTitle}>Damage / Wastage Records</div>
          {DAMAGES.length===0?<div style={{color:C.muted}}>No damage records yet.</div>:(
            <table style={S.table}><thead><tr>{["Medicine","Qty","Reason","Date","By"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>{DAMAGES.map(d=>(
                <tr key={d.id}>
                  <td style={{...S.td,fontWeight:600}}>{d.name}</td>
                  <td style={S.td}><span style={S.badgeRed}>{d.qty}</span></td>
                  <td style={S.td}>{d.reason}</td>
                  <td style={S.td}>{fmtDate(d.date)}</td>
                  <td style={S.td}>{d.by}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {showAdd&&(
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{...S.row,marginBottom:20}}>
              <span style={{fontSize:18,fontWeight:700}}>Add New Medicine</span>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}} onClick={()=>setAdd(false)}>✕</button>
            </div>
            <div style={S.grid2}>
              {[["name","Medicine Name","text"],["company","Company","text"],["batch","Batch No.","text"],["expiry","Expiry Date","date"],["mrp","MRP (₹)","number"],["cost","Cost Price (₹)","number"],["qty","Initial Qty","number"],["reorder","Reorder Level","number"]].map(([k,l,t])=>(
                <div key={k}><label style={S.label}>{l}</label><input style={S.input} type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
              ))}
              <div><label style={S.label}>Category</label>
                <select style={S.select} value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {err&&<div style={{...S.alertDanger,marginTop:12}}>{err}</div>}
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button style={S.btnPrimary} onClick={addMed}>Add Medicine</button>
              <button style={S.btnGhost}   onClick={()=>setAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* REFILL MODAL */}
      {rfMed&&(
        <div style={S.overlay}>
          <div style={{...S.modal,maxWidth:440}}>
            <div style={{...S.row,marginBottom:16}}>
              <span style={{fontSize:18,fontWeight:700}}>📦 Refill Stock</span>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}} onClick={()=>setRfMed(null)}>✕</button>
            </div>
            {/* Medicine banner */}
            <div style={{ background:"rgba(0,229,160,0.07)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"12px 14px", marginBottom:18 }}>
              <div style={{fontWeight:700,fontSize:14,color:C.accent}}>{rfMed.name}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:3}}>
                {rfMed.company} &nbsp;·&nbsp; Current Stock:&nbsp;
                <strong style={{color:rfMed.qty<=rfMed.reorder?C.danger:C.text}}>{rfMed.qty}</strong>
                &nbsp;·&nbsp; Reorder Level: {rfMed.reorder}
              </div>
            </div>
            <div style={S.grid2}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={S.label}>Quantity to Add *</label>
                <input style={{...S.input,fontSize:20,fontWeight:700,color:C.accent}} type="number" min="1"
                  value={rfForm.qty} placeholder="e.g. 50" onChange={e=>setRfF({...rfForm,qty:e.target.value})} />
                {rfForm.qty&&+rfForm.qty>0&&(
                  <div style={{fontSize:12,color:C.muted,marginTop:5}}>
                    New total will be:&nbsp;<strong style={{color:C.accent}}>{rfMed.qty+(+rfForm.qty||0)}</strong>&nbsp;units
                  </div>
                )}
              </div>
              <div>
                <label style={S.label}>New Batch No. *</label>
                <input style={S.input} value={rfForm.batch} onChange={e=>setRfF({...rfForm,batch:e.target.value})} />
              </div>
              <div>
                <label style={S.label}>New Expiry Date *</label>
                <input style={S.input} type="date" value={rfForm.expiry} onChange={e=>setRfF({...rfForm,expiry:e.target.value})} />
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={S.label}>Note / Supplier Reference (optional)</label>
                <input style={S.input} value={rfForm.note} placeholder="e.g. Invoice #1234 from Cipla Direct"
                  onChange={e=>setRfF({...rfForm,note:e.target.value})} />
              </div>
            </div>
            {err&&<div style={{...S.alertDanger,marginTop:12}}>{err}</div>}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button style={S.btnPrimary} onClick={recRefill}>✅ Confirm Refill</button>
              <button style={S.btnGhost}   onClick={()=>setRfMed(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DAMAGE MODAL */}
      {dmgMed&&(
        <div style={S.overlay}>
          <div style={{...S.modal,maxWidth:400}}>
            <div style={{...S.row,marginBottom:16}}>
              <span style={{fontSize:18,fontWeight:700}}>Record Damage</span>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}} onClick={()=>setDmg(null)}>✕</button>
            </div>
            <div style={{...S.alertWarn,marginBottom:16}}><strong>{dmgMed.name}</strong> · Current stock: {dmgMed.qty}</div>
            <div style={{marginBottom:12}}>
              <label style={S.label}>Qty Damaged</label>
              <input style={S.input} type="number" min="1" max={dmgMed.qty} value={dmgForm.qty} onChange={e=>setDF({...dmgForm,qty:e.target.value})} />
            </div>
            <div style={{marginBottom:12}}>
              <label style={S.label}>Reason</label>
              <select style={S.select} value={dmgForm.reason} onChange={e=>setDF({...dmgForm,reason:e.target.value})}>
                <option value="">Select reason…</option>
                {["Expired","Broken/Physical damage","Water damage","Contamination","Manufacturing defect","Theft","Other"].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            {err&&<div style={{...S.alertDanger,marginBottom:10}}>{err}</div>}
            <div style={{display:"flex",gap:10}}>
              <button style={S.btnDanger} onClick={recDamage}>Record Damage</button>
              <button style={S.btnGhost}  onClick={()=>setDmg(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUPPLIERS ────────────────────────────────────────────────────────────
function Suppliers({ meds }) {
  const [tab, setTab]       = useState("list");
  const [showAdd, setAdd]   = useState(false);
  const [form, setForm]     = useState({ name:"", contact:"", phone:"", email:"" });
  const [err, setErr]       = useState("");
  const [suppliers, setSup] = useState(SUPPLIERS);
  const po = suppliers.map(s=>({...s,orderMeds:s.meds.map(mid=>meds.find(m=>m.id===mid)).filter(Boolean).filter(m=>m.qty<=m.reorder)})).filter(s=>s.orderMeds.length>0);
  const add = () => {
    if (!form.name||!form.contact||!form.phone){ setErr("Fill all required fields."); return; }
    SUPPLIERS.push({id:"s"+Date.now(),...form,meds:[]}); setSup([...SUPPLIERS]);
    setAdd(false); setForm({name:"",contact:"",phone:"",email:""}); setErr("");
  };
  return (
    <div>
      <div style={{...S.row,marginBottom:4}}>
        <div style={S.pageTitle}>Suppliers</div>
        <button style={S.btnPrimary} onClick={()=>setAdd(true)}>+ Add Supplier</button>
      </div>
      <div style={S.pageSub}>Manage suppliers and purchase orders</div>
      <div style={S.tabs}>
        {[["list","Suppliers"],["po","Purchase Orders ("+po.length+")"]].map(([id,lbl])=>(
          <button key={id} style={S.tab(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>
      {tab==="list"&&(
        <div style={S.card}>
          <table style={S.table}><thead><tr>{["Supplier","Contact","Phone","Email","Medicines"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>{suppliers.map(s=>(
              <tr key={s.id}>
                <td style={{...S.td,fontWeight:700}}>{s.name}</td>
                <td style={S.td}>{s.contact}</td>
                <td style={S.td}>{s.phone}</td>
                <td style={S.td}>{s.email}</td>
                <td style={S.td}>{s.meds.map(mid=>{ const m=meds.find(x=>x.id===mid); return m?<span key={mid} style={{...S.badgeBlue,marginRight:4}}>{m.name.split(" ")[0]}</span>:null; })}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {tab==="po"&&(
        <div>
          {po.length===0?(
            <div style={{...S.card,textAlign:"center",padding:"50px 0",color:C.muted}}>✅ All stock above reorder level.</div>
          ):po.map(s=>(
            <div key={s.id} style={S.card}>
              <div style={{...S.row,marginBottom:14}}>
                <div><div style={{fontWeight:700,fontSize:15}}>{s.name}</div><div style={{fontSize:12,color:C.muted}}>{s.contact} · {s.phone}</div></div>
                <span style={S.badgeRed}>{s.orderMeds.length} items low</span>
              </div>
              <table style={S.table}><thead><tr>{["Medicine","Current Stock","Reorder At","Suggested Order"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{s.orderMeds.map(m=>(
                  <tr key={m.id}>
                    <td style={{...S.td,fontWeight:600}}>{m.name}</td>
                    <td style={{...S.td,color:C.danger,fontWeight:700}}>{m.qty}</td>
                    <td style={S.td}>{m.reorder}</td>
                    <td style={{...S.td,color:C.accent,fontWeight:700}}>{m.reorder*2-m.qty}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      {showAdd&&(
        <div style={S.overlay}>
          <div style={{...S.modal,maxWidth:420}}>
            <div style={{...S.row,marginBottom:20}}>
              <span style={{fontSize:18,fontWeight:700}}>Add Supplier</span>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}} onClick={()=>setAdd(false)}>✕</button>
            </div>
            <div style={S.grid2}>
              {[["name","Company Name"],["contact","Contact Person"],["phone","Phone"],["email","Email"]].map(([k,l])=>(
                <div key={k}><label style={S.label}>{l}</label><input style={S.input} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
              ))}
            </div>
            {err&&<div style={{...S.alertDanger,marginTop:12}}>{err}</div>}
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button style={S.btnPrimary} onClick={add}>Add Supplier</button>
              <button style={S.btnGhost}   onClick={()=>setAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────
function Reports({ meds, sales }) {
  const [tab, setTab]     = useState("daily");
  const [range, setRange] = useState("week");
  const todaySales = sales.filter(s=>s.date===TODAY);
  const rev  = todaySales.reduce((a,s)=>a+s.total,0);
  const prof = todaySales.reduce((a,s)=>a+s.profit,0);
  const cutoff = range==="week"?D(-7):range==="month"?D(-30):TODAY;
  const ranged = sales.filter(s=>s.date>=cutoff&&s.date<=TODAY);
  const byDate = {};
  ranged.forEach(s=>{ if(!byDate[s.date])byDate[s.date]={rev:0,prof:0,cnt:0}; byDate[s.date].rev+=s.total; byDate[s.date].prof+=s.profit; byDate[s.date].cnt++; });
  const dateRows = Object.entries(byDate).sort((a,b)=>b[0].localeCompare(a[0]));
  const medPerf = {};
  sales.forEach(s=>s.items.forEach(it=>{ if(!medPerf[it.name])medPerf[it.name]={qty:0,rev:0}; medPerf[it.name].qty+=it.qty; medPerf[it.name].rev+=it.mrp*it.qty; }));
  const sorted = Object.entries(medPerf).sort((a,b)=>b[1].qty-a[1].qty);
  const Stat = ({label,value,color}) => (
    <div style={S.statCard}>
      <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>{label}</div>
      <div style={{fontSize:26,fontWeight:700,color:color||C.text}}>{value}</div>
    </div>
  );
  return (
    <div>
      <div style={S.pageTitle}>Reports</div>
      <div style={S.pageSub}>Business performance & analytics</div>
      <div style={S.tabs}>
        {[["daily","Daily"],["history","History"],["performance","Performance"]].map(([id,lbl])=>(
          <button key={id} style={S.tab(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>
      {tab==="daily"&&(
        <div>
          <div style={S.statGrid}>
            <Stat label="Today's Revenue" value={rs(rev)} color={C.accent} />
            <Stat label="Today's Profit"  value={rs(prof)} />
            <Stat label="Bills Today"     value={todaySales.length} />
            <Stat label="Avg Bill"        value={todaySales.length?rs(rev/todaySales.length):"₹0"} />
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Today's Bills</div>
            {!todaySales.length?<div style={{color:C.muted}}>No sales today.</div>:(
              <table style={S.table}><thead><tr>{["Bill No.","Items","Revenue","Profit","Cashier"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{todaySales.map(s=>(
                  <tr key={s.id}>
                    <td style={{...S.td,fontFamily:"monospace"}}>{s.id}</td>
                    <td style={S.td}>{s.items.length}</td>
                    <td style={{...S.td,fontWeight:700}}>{rs(s.total)}</td>
                    <td style={{...S.td,color:C.accent}}>{rs(s.profit)}</td>
                    <td style={S.td}>{s.by}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {tab==="history"&&(
        <div style={S.card}>
          <div style={{...S.row,marginBottom:16}}>
            <div style={S.sectionTitle}>Sales History</div>
            <select style={{...S.select,width:"auto"}} value={range} onChange={e=>setRange(e.target.value)}>
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div style={{display:"flex",gap:32,marginBottom:18}}>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>TOTAL REVENUE</div><div style={{fontSize:20,fontWeight:700,color:C.accent}}>{rs(ranged.reduce((a,s)=>a+s.total,0))}</div></div>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>TOTAL PROFIT</div><div style={{fontSize:20,fontWeight:700}}>{rs(ranged.reduce((a,s)=>a+s.profit,0))}</div></div>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>TOTAL BILLS</div><div style={{fontSize:20,fontWeight:700}}>{ranged.length}</div></div>
          </div>
          <table style={S.table}><thead><tr>{["Date","Bills","Revenue","Profit","Margin"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>{dateRows.map(([date,d])=>(
              <tr key={date}>
                <td style={S.td}>{fmtDate(date)}</td>
                <td style={S.td}>{d.cnt}</td>
                <td style={{...S.td,fontWeight:700}}>{rs(d.rev)}</td>
                <td style={{...S.td,color:C.accent}}>{rs(d.prof)}</td>
                <td style={S.td}><span style={S.badgeGreen}>{d.rev?Math.round(d.prof/d.rev*100):0}%</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {tab==="performance"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={S.card}>
            <div style={S.sectionTitle}>⭐ Best Sellers</div>
            {sorted.slice(0,8).map(([name,d],i)=>(
              <div key={name} style={{...S.row,padding:"8px 0",borderBottom:"1px solid #1e2330"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:22,height:22,borderRadius:"50%",background:i<3?C.amber:C.surface,color:i<3?"#000":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{i+1}</span>
                  <span style={{fontSize:13,fontWeight:500}}>{name}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700}}>{d.qty} units</div>
                  <div style={{fontSize:11,color:C.muted}}>{rs(d.rev)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle}>🐌 Slow Movers</div>
            {sorted.slice(-5).reverse().map(([name,d])=>(
              <div key={name} style={{...S.row,padding:"8px 0",borderBottom:"1px solid #1e2330"}}>
                <span style={{fontSize:13}}>{name}</span>
                <span style={S.badgeGray}>{d.qty} sold</span>
              </div>
            ))}
            <div style={{...S.sectionTitle,marginTop:16}}>Never Sold</div>
            {meds.filter(m=>!medPerf[m.name]).map(m=>(
              <div key={m.id} style={{...S.row,padding:"6px 0",borderBottom:"1px solid #1e2330"}}>
                <span style={{fontSize:13}}>{m.name}</span>
                <span style={S.badgeGray}>0 units</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(()=>setTick(t=>t+1),[]);
  const login  = (u) => { setUser(u); setPage(u.role==="owner"?"reports":u.role==="manager"?"inventory":"billing"); };
  const logout = ()  => { setUser(null); setPage("dashboard"); };
  if (!user) return <Login onLogin={login} />;
  const meds  = [...MEDS];
  const sales = [...SALES];
  const pages = {
    dashboard: <Dashboard meds={meds} sales={sales} />,
    billing:   <Billing   user={user} meds={meds} onSale={refresh} />,
    inventory: <Inventory user={user} meds={meds} refresh={refresh} />,
    suppliers: <Suppliers meds={meds} />,
    reports:   <Reports   meds={meds} sales={sales} />,
  };
  return (
    <div style={S.app}>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={logout} />
      <div style={S.main}>{pages[page]}</div>
    </div>
  );
}
