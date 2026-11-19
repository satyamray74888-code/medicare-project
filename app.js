/* MediCare+ shared logic.
   Each patient's records are saved in the browser (localStorage) under their own email.
   A real system would store them on a server database instead. */
const KEY = "mc_user", USERS = "mc_accounts";
const DEMO = "patient@demo.com";

/* ---------- DOCTOR ACCOUNTS (edit here to add or change doctors) ----------
   Doctors log in on doctor-login.html. Names match the doctors the chatbot suggests. */
const DOCTORS = [
  { email: "doctor@demo.com",      pw: "doctor123", name: "Dr. Anil Sharma",    spec: "General Physician" },
  { email: "dr.anjali@demo.com",   pw: "doctor123", name: "Dr. Anjali Kapoor",  spec: "Paediatrician (child specialist)" },
  { email: "dr.imran@demo.com",    pw: "doctor123", name: "Dr. Imran Khan",     spec: "ENT Specialist" },
  { email: "dr.rohit@demo.com",    pw: "doctor123", name: "Dr. Rohit Malhotra", spec: "Allergy & Chest Specialist" },
  { email: "dr.sanjay@demo.com",   pw: "doctor123", name: "Dr. Sanjay Gupta",   spec: "Gastroenterologist" },
  { email: "dr.neha@demo.com",     pw: "doctor123", name: "Dr. Neha Verma",     spec: "Dermatologist (skin)" },
  { email: "dr.rahul@demo.com",    pw: "doctor123", name: "Dr. Rahul Mehta",    spec: "Neurologist" },
  { email: "dr.priya@demo.com",    pw: "doctor123", name: "Dr. Priya Nair",     spec: "Psychiatrist & Sleep Specialist" },
  { email: "dr.vikram@demo.com",   pw: "doctor123", name: "Dr. Vikram Singh",   spec: "Orthopaedic Surgeon (bone & joint)" },
  { email: "dr.meera@demo.com",    pw: "doctor123", name: "Dr. Meera Iyer",     spec: "Cardiologist (heart)" },
  { email: "dr.kavita@demo.com",   pw: "doctor123", name: "Dr. Kavita Rao",     spec: "Endocrinologist / Diabetologist" },
  { email: "dr.sunita@demo.com",   pw: "doctor123", name: "Dr. Sunita Joshi",   spec: "Rheumatologist (arthritis)" },
  { email: "dr.arjun@demo.com",    pw: "doctor123", name: "Dr. Arjun Das",      spec: "Eye Specialist (Ophthalmologist)" },
  { email: "doctorrama@demo.com",  pw: "doctor123", name: "Dr. Rama",           spec: "General Surgeon" }
];

/* Sample records, given only to the demo account the first time it logs in */
const SEED = {
  history: [
    { id: 1, type: "condition", title: "Type 2 diabetes", date: "2026-07-10", note: "Diagnosed after a high fasting glucose test." },
    { id: 2, type: "condition", title: "Mild hypertension", date: "2026-09-02", note: "Blood pressure slightly high at check-up." },
    { id: 3, type: "allergy", title: "Penicillin", date: "2025-03-03", note: "Rash after taking it. Must be avoided in future treatment." },
    { id: 4, type: "medicine", title: "Metformin 500 mg", date: "2026-07-18", note: "Twice daily with meals. Mild nausea in week one, then settled." },
    { id: 5, type: "medicine", title: "Amlodipine 5 mg", date: "2026-09-02", note: "Once daily in the morning for blood pressure." },
    { id: 6, type: "test", title: "Fasting glucose test", date: "2026-07-10", note: "142 mg/dL, above target. Led to the diabetes treatment plan." },
    { id: 7, type: "visit", title: "Check-up with Dr. Sharma", date: "2026-09-02", note: "Advised less salt and daily walking." },
    { id: 8, type: "test", title: "HbA1c blood test", date: "2026-10-14", note: "6.8%, improved from 7.4% in July. Plan is working." }
  ],
  sugar: [152, 141, 136, 129, 124, 118], taken: {}
};

/* ---------- helpers ---------- */
const user = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const fmt = iso => new Date(iso + "T00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const tagCls = h => h.type === "allergy" ? "red" : h.type === "symptom" ? "amber" : "";
const tagsHtml = h => `<span class="tag ${tagCls(h)}">${h.type}</span>` + (h.src === "doctor" ? `<span class="tag green">Added by ${esc(h.by || "doctor")}</span>` : h.src === "chat" ? `<span class="tag amber">From chatbot</span>` : "");
const sorted = h => [...h].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

function loadFor(email) {
  let d = null;
  try { d = JSON.parse(localStorage.getItem("mc_data_" + email)); } catch {}
  if (!d) { d = email === DEMO ? JSON.parse(JSON.stringify(SEED)) : { history: [], sugar: [], taken: {} }; saveFor(email, d); }
  return d;
}
function saveFor(email, d) { try { localStorage.setItem("mc_data_" + email, JSON.stringify(d)); } catch { alert("Could not save. Check that browser storage is allowed."); } }
const load = () => { const u = user(); return u ? loadFor(u.email) : null; };
const save = d => saveFor(user().email, d);
const ofType = (d, t) => d.history.filter(h => h.type === t);

{ const need = document.body.dataset.private, me = user();
  if (need && !me) location.href = need === "doctor" ? "doctor-login.html" : "login.html";
  else if (need === "doctor" && me.role !== "doctor") location.href = "dashboard.html";
  else if (need && need !== "doctor" && me.role === "doctor") location.href = "doctor.html"; }

/* ---------- nav ---------- */
const nav = document.getElementById("nav");
if (nav) {
  const cur = location.pathname.split("/").pop() || "index.html", u = user();
  const links = u && u.role === "doctor" ? [["index.html","Home"],["doctor.html","Doctor Portal"]] : u ? [["index.html","Home"],["dashboard.html","Dashboard"],["history.html","History"]] : [["index.html","Home"],["login.html","Patient Login"],["doctor-login.html","Doctor Login"]];
  nav.innerHTML = links.map(([h,t]) => `<a href="${h}" ${h===cur?'class="on"':""}>${t}</a>`).join("") + (u ? `<a href="#" id="out">Log out</a>` : "");
  document.getElementById("out")?.addEventListener("click", e => { e.preventDefault(); localStorage.removeItem(KEY); location.href = "index.html"; });
}

/* ---------- home ---------- */
const info = { a: "Routine check-up|We use your past results to skip repeated tests and focus on what has changed.", b: "New symptoms|Log in and our assistant will compare symptoms with your conditions and allergies, then suggest when to see a doctor.", c: "Medicine review|We check each medicine against your allergy list and past reactions before suggesting a change.", d: "Follow-up|See which treatment steps are done and what is due next." };
document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
  document.querySelectorAll(".opt").forEach(x => x.classList.remove("on")); b.classList.add("on");
  const [t, d] = info[b.dataset.k].split("|");
  document.getElementById("result").innerHTML = `<b>${t}</b><br>${d}<br><a class="btn sm" style="margin-top:10px" href="${user() ? "dashboard.html" : "login.html"}">${user() ? "Open dashboard" : "Log in to continue"}</a>`;
});

/* ---------- login + register ---------- */
const lf = document.getElementById("lf");
if (lf) {
  let mode = "in"; const want = document.body.dataset.role || "patient"; const err = document.getElementById("err"), nm = document.getElementById("nmf");
  const dl = document.getElementById("dl");   // demo doctor list on doctor-login.html: tap one to fill the form
  if (dl) {
    dl.innerHTML = DOCTORS.map((x, i) => `<button type="button" class="dbtn" data-i="${i}"><b>${esc(x.name)}</b><small>${esc(x.spec)}</small></button>`).join("");
    dl.onclick = e => { const b = e.target.closest("button"); if (b) { const x = DOCTORS[+b.dataset.i]; lf.email.value = x.email; lf.pw.value = x.pw; err.textContent = ""; } };
  }
  document.querySelectorAll(".tabs button").forEach(t => t.onclick = () => {
    mode = t.dataset.m; document.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("on", x === t));
    nm.hidden = mode === "in"; document.getElementById("go").textContent = mode === "in" ? "Log in" : "Create account"; err.textContent = "";
  });
  lf.onsubmit = e => {
    e.preventDefault(); const em = lf.email.value.trim().toLowerCase(), pw = lf.pw.value;
    const acc = JSON.parse(localStorage.getItem(USERS) || "{}"); acc[DEMO] = acc[DEMO] || { pw: "demo123", name: "Aarav Sharma", role: "patient" };
    DOCTORS.forEach(x => acc[x.email] = { pw: x.pw, name: x.name, role: "doctor", spec: x.spec });  // code is the source of truth for doctors
    if (!/^\S+@\S+\.\S+$/.test(em)) return err.textContent = "Enter a valid email, like name@example.com.";
    if (pw.length < 6) return err.textContent = "Password must be at least 6 characters.";
    if (mode === "up") {
      if (!lf.nm.value.trim()) return err.textContent = "Enter your full name.";
      if (acc[em]) return err.textContent = "This email already has an account. Log in instead.";
      acc[em] = { pw, name: lf.nm.value.trim(), role: "patient" };  // sign-up is for patients only
    } else if (!acc[em] || acc[em].pw !== pw) return err.textContent = want === "doctor" ? "Email or password is wrong. Please try again." : "Email or password is wrong. Try again or create an account.";
    if ((acc[em].role || "patient") !== want) return err.textContent = want === "doctor" ? "This is not a doctor account. Patients should use the Patient Login page." : "This is a doctor account. Please use the Doctor Login page.";
    localStorage.setItem(USERS, JSON.stringify(acc));
    const role = acc[em].role || "patient";
    localStorage.setItem(KEY, JSON.stringify({ email: em, name: acc[em].name, role, spec: acc[em].spec || "" })); location.href = role === "doctor" ? "doctor.html" : "dashboard.html";
  };
}

/* ---------- dashboard ---------- */
const hi = document.getElementById("hi");
if (hi) {
  const d = load(), h = new Date().getHours();
  hi.textContent = `${h<12?"Good morning":h<18?"Good afternoon":"Good evening"}, ${user().name.split(" ")[0]}`;
  const conds = ofType(d, "condition"), alls = ofType(d, "allergy"), meds = ofType(d, "medicine"), s = d.sugar;

  document.getElementById("prof").innerHTML = (conds.map(c => `<span class="tag">${esc(c.title)}</span>`).join("") + alls.map(a => `<span class="tag red">Allergy: ${esc(a.title)}</span>`).join("")) || `<p>No conditions or allergies recorded yet.</p>`;
  document.getElementById("vit").innerHTML = `<div><b>${s.length ? s[s.length-1] : "–"}</b><span>Latest sugar mg/dL</span></div><div><b>${d.history.length}</b><span>Records saved</span></div><div><b>${meds.length}</b><span>Medicines</span></div>`;

  const taken = (d.taken[today()] = d.taken[today()] || []), ml = document.getElementById("meds");
  const drawMeds = () => ml.innerHTML = meds.length ? meds.map(m => { const t = taken.includes(m.id);
    return `<li class="${t?"done":""}"><span><b>${esc(m.title)}</b><br><small>${esc(m.note)}</small></span><button class="btn sm alt" data-id="${m.id}" ${t?"disabled":""}>${t?"Taken ✓":"Mark taken"}</button></li>`; }).join("")
    : `<li><span>No medicines yet. <a href="history.html">Add one in History</a>.</span></li>`;
  drawMeds();
  ml.onclick = e => { const id = +e.target.dataset.id; if (id) { taken.push(id); save(d); drawMeds(); } };

  // Recommendations are generated from this patient's own saved records
  const r = [];
  if (s.length >= 2) r.push(s[s.length-1] < s[0] ? `Your blood sugar changed from ${s[0]} to ${s[s.length-1]} mg/dL, a good sign. Keep following your plan.` : `Your sugar readings have not improved (${s[0]} to ${s[s.length-1]} mg/dL). Talk to your doctor about your plan.`);
  if (conds.some(c => /hypertension|blood pressure/i.test(c.title))) r.push("Keep salt low and walk 30 minutes a day to help your blood pressure.");
  if (conds.some(c => /diabet/i.test(c.title))) r.push("Eat at regular times and check your blood sugar as your doctor advised.");
  if (alls.length) r.push(`Tell every doctor about your ${alls.map(a => esc(a.title)).join(", ")} allergy before any new medicine.`);
  const dn = sorted(d.history).find(h => h.src === "doctor" && (h.type === "note" || h.type === "visit"));
  if (dn) r.unshift(`Note from ${esc(dn.by)} (${fmt(dn.date)}): ${esc(dn.title)}. ${esc(dn.note)}`);
  if (!d.history.length) r.push("Start by adding your conditions, allergies and medicines in History. Your advice will then become personal.");
  document.getElementById("rec").innerHTML = r.map(x => `<li>${x}</li>`).join("");

  const drawChart = () => {
    const c = document.getElementById("chart");
    if (s.length < 2) { c.innerHTML = `<text x="200" y="80" text-anchor="middle" font-size="14" fill="#5a6882">Log at least 2 readings to see your trend.</text>`; return; }
    const W = 380, H = 150, mx = Math.max(...s), mn = Math.min(...s) - 10, st = W / (s.length - 1);
    const p = s.map((y, i) => [10 + i * st, H - (y - mn) / (mx - mn || 1) * (H - 30) - 10]);
    c.innerHTML = `<polyline fill="none" stroke="#2f5fd0" stroke-width="3" points="${p.map(q => q.join(",")).join(" ")}"/>` + p.map((q, i) => `<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="#2f5fd0"/><text x="${q[0]}" y="${q[1]-10}" font-size="11" text-anchor="middle" fill="#16243f">${s[i]}</text>`).join("");
  };
  drawChart();
  document.getElementById("sl").onsubmit = e => {
    e.preventDefault(); const i = e.target.val, v = +i.value;
    if (!v || v < 20 || v > 600) return document.getElementById("slerr").textContent = "Enter a value between 20 and 600 mg/dL.";
    document.getElementById("slerr").textContent = ""; s.push(v); save(d); location.reload();
  };
}

/* ---------- history: add, delete, search, filter ---------- */
const tl = document.getElementById("tl");
if (tl) {
  const d = load(), q = document.getElementById("q"), f = document.getElementById("f"), none = document.getElementById("none"), form = document.getElementById("af"), err = document.getElementById("aerr");
  form.date.value = today(); form.date.max = today();
  const draw = () => {
    const t = q.value.toLowerCase(), list = sorted(d.history).filter(h => (f.value === "all" || h.type === f.value) && (h.title + h.note).toLowerCase().includes(t));
    tl.innerHTML = list.map(h => `<li><details><summary>${esc(h.title)}<small>${fmt(h.date)}</small></summary><p>${tagsHtml(h)}<br>${esc(h.note) || "No notes."}</p>${h.src === "doctor" ? "" : `<button class="btn sm alt del" data-id="${h.id}">Delete</button>`}</details></li>`).join("");
    none.hidden = list.length > 0; none.textContent = d.history.length ? "No records match. Try another word or choose All records." : "No records yet. Use “Add a record” above to save your first one.";
  };
  q.oninput = f.onchange = draw;
  tl.onclick = e => { if (e.target.classList.contains("del") && confirm("Delete this record?")) { d.history = d.history.filter(h => h.id !== +e.target.dataset.id); save(d); draw(); } };
  form.onsubmit = e => {
    e.preventDefault();
    if (!form.title.value.trim()) return err.textContent = "Enter a title, like “Blood test” or “Paracetamol 500 mg”.";
    if (!form.date.value) return err.textContent = "Choose a date.";
    d.history.push({ id: Date.now(), type: form.type.value, title: form.title.value.trim(), date: form.date.value, note: form.note.value.trim(), src: "patient" });
    save(d); err.textContent = ""; form.title.value = form.note.value = ""; form.date.value = today(); f.value = "all"; q.value = ""; draw();
    document.getElementById("ok").textContent = "Record saved."; setTimeout(() => document.getElementById("ok").textContent = "", 2500);
  };
  draw();
}

/* ---------- doctor portal ---------- */
const plist = document.getElementById("plist");
if (plist) {
  const me = user(), acc = JSON.parse(localStorage.getItem(USERS) || "{}");
  const pats = Object.entries(acc).filter(([, a]) => (a.role || "patient") === "patient").map(([email, a]) => ({ email, name: a.name }));
  let sel = null; const $ = id => document.getElementById(id);
  document.getElementById("dh").textContent = "Welcome, " + me.name + (me.spec ? " (" + me.spec + ")" : "");
  const stats = () => { let rec = 0, chat = 0; pats.forEach(p => { const h = loadFor(p.email).history; rec += h.length; chat += h.filter(x => x.src === "chat" && x.note.includes(me.name)).length; });
    $("dstats").innerHTML = `<div><b>${pats.length}</b><span>Patients</span></div><div><b>${rec}</b><span>Total records</span></div><div><b>${chat}</b><span>Chatbot referrals to you</span></div>`; };
  const drawList = () => { const q = $("ps").value.toLowerCase(), l = pats.filter(p => (p.name + p.email).toLowerCase().includes(q));
    plist.innerHTML = l.length ? l.map(p => `<li><button class="pbtn ${p.email === sel ? "on" : ""}" data-e="${esc(p.email)}"><b>${esc(p.name)}</b><br><small>${esc(p.email)}</small></button></li>`).join("") : `<li>No patients found.</li>`; };
  const drawDetail = () => {
    if (!sel) return; const d = loadFor(sel), name = pats.find(p => p.email === sel).name;
    $("pempty").hidden = true; $("pbody").hidden = false; $("pname").textContent = name; $("pmail").textContent = sel;
    const c = ofType(d, "condition"), a = ofType(d, "allergy");
    $("pprof").innerHTML = (c.map(x => `<span class="tag">${esc(x.title)}</span>`).join("") + a.map(x => `<span class="tag red">Allergy: ${esc(x.title)}</span>`).join("")) || "<p>No conditions or allergies recorded.</p>";
    $("pvit").innerHTML = `<div><b>${d.sugar.length ? d.sugar[d.sugar.length - 1] : "–"}</b><span>Latest sugar mg/dL</span></div><div><b>${d.history.length}</b><span>Records</span></div><div><b>${ofType(d, "medicine").length}</b><span>Medicines</span></div>`;
    const l = sorted(d.history);
    $("ptl").innerHTML = l.length ? l.map(h => `<li><details ${h.src === "chat" && h.note.includes(me.name) ? "open" : ""}><summary>${esc(h.title)}<small>${fmt(h.date)}</small></summary><p>${tagsHtml(h)}${h.src === "chat" && h.note.includes(me.name) ? '<span class="tag green">Referred to you</span>' : ""}<br>${esc(h.note) || "No notes."}</p>${h.src === "doctor" && h.by === me.name ? `<button class="btn sm alt del" data-id="${h.id}">Delete</button>` : ""}</details></li>`).join("") : `<li>This patient has no records yet.</li>`;
  };
  plist.onclick = e => { const b = e.target.closest("button"); if (b) { sel = b.dataset.e; drawList(); drawDetail(); } };
  $("ps").oninput = drawList;
  const form = $("df"); form.date.value = today(); form.date.max = today();
  form.onsubmit = e => {
    e.preventDefault(); const er = $("derr");
    if (!sel) return er.textContent = "Select a patient first.";
    if (!form.title.value.trim()) return er.textContent = "Enter a title, like “Prescription” or “Follow-up advice”.";
    const d = loadFor(sel);
    d.history.push({ id: Date.now(), type: form.type.value, title: form.title.value.trim(), date: form.date.value || today(), note: form.note.value.trim(), src: "doctor", by: me.name });
    saveFor(sel, d); er.textContent = ""; form.title.value = form.note.value = ""; stats(); drawDetail();
    $("dok").textContent = "Saved to the patient's history."; setTimeout(() => $("dok").textContent = "", 2500);
  };
  $("ptl").onclick = e => { if (e.target.classList.contains("del") && confirm("Delete this note?")) { const d = loadFor(sel); d.history = d.history.filter(h => h.id !== +e.target.dataset.id); saveFor(sel, d); stats(); drawDetail(); } };
  stats(); drawList();
}
