const STORAGE = {
  login: "campus_login",
  complaints: "campus_complaints",
  eventRegs: "campus_event_regs",
  seats: "campus_event_seats",
  glow: "campus_glow"
};

const notices = [
  {id:1,title:"Semester registration deadline announced",category:"Academic",date:"02 Sep 2026",text:"Students are requested to complete semester registration before the published deadline."},
  {id:2,title:"Inter-college football trials",category:"Sports",date:"04 Sep 2026",text:"Open trials will be conducted at the main sports ground. Carry your valid campus ID."},
  {id:3,title:"Mid-semester examination schedule",category:"Examinations",date:"06 Sep 2026",text:"The examination cell has published the provisional mid-semester timetable."},
  {id:4,title:"Scheduled Wi-Fi maintenance",category:"Emergency",date:"03 Sep 2026",text:"Campus Wi-Fi may be unavailable in selected academic blocks during maintenance."},
  {id:5,title:"Library extended hours",category:"Academic",date:"01 Sep 2026",text:"The central library will remain open until 10 PM during the examination preparation period."},
  {id:6,title:"Coding club workshop registrations",category:"Sports",date:"08 Sep 2026",text:"A practical workshop on web development and problem solving is open for registrations."}
];

const services = [
  ["📚","Library Management","Search books, check availability and view borrowing information."],
  ["🏠","Hostel Portal","Access hostel notices, maintenance requests and room services."],
  ["🚌","Transportation Track","View campus shuttle routes and expected arrival information."],
  ["🍽️","Canteen Menu","Check today's menu, timings and campus food counters."],
  ["📝","Exam Cell","Find exam schedules, forms, academic notices and results."]
];

const defaultEvents = [
  {id:"fest-2026",icon:"🎉",name:"Campus Fest 2026",type:"Fest",date:"15 Sep 2026",time:"10:00 AM",location:"Central Ground",capacity:250},
  {id:"tech-hacks",icon:"💻",name:"Tech-Hacks",type:"Hackathon",date:"20 Sep 2026",time:"9:00 AM",location:"Innovation Lab",capacity:120},
  {id:"ai-workshop",icon:"🤖",name:"AI Workshop",type:"Workshop",date:"24 Sep 2026",time:"2:00 PM",location:"Seminar Hall",capacity:80},
  {id:"sports-day",icon:"🏆",name:"Annual Sports Day",type:"Sports",date:"28 Sep 2026",time:"8:00 AM",location:"Sports Complex",capacity:300}
];

const routeTitles = {
  home:"Home", student:"Student Portal", teacher:"Teacher Portal", services:"Services",
  notices:"Updates / Noticeboard", complaint:"Raise Complaint", track:"Track Complaint",
  events:"Campus Events", contact:"Contact"
};

const app = document.getElementById("app");
const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const mobileOverlay = document.getElementById("mobileOverlay");
const modalBackdrop = document.getElementById("modalBackdrop");
const modal = document.getElementById("modal");

function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function showToast(message, type="") {
  const box = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function closeModal(){ modalBackdrop.classList.add("hidden"); modal.innerHTML=""; }
function openModal(content){ modal.innerHTML=content; modalBackdrop.classList.remove("hidden"); }

function updateProfileUI(){
  const login = getJSON(STORAGE.login, null);
  const name = login?.name || "Guest User";
  const role = login?.role ? login.role[0].toUpperCase()+login.role.slice(1) : "Not signed in";
  document.getElementById("sideName").textContent = name;
  document.getElementById("sideRole").textContent = role;
  document.getElementById("sideAvatar").textContent = name[0]?.toUpperCase() || "G";
  document.getElementById("menuProfileName").textContent = name;
  document.getElementById("menuProfileRole").textContent = role;
  document.getElementById("logoutBtn").classList.toggle("hidden", !login);
}
function setActive(route){
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.route === route));
  pageTitle.textContent = routeTitles[route] || "Home";
}
function navigate(route){
  history.pushState({route}, "", `#${route}`);
  render(route);
  sidebar.classList.remove("open"); mobileOverlay.classList.add("hidden");
  document.getElementById("profileMenu").classList.add("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
function currentRoute(){ return location.hash.replace("#","") || "home"; }

function render(route=currentRoute()){
  if(!routeTitles[route]) route="home";
  setActive(route);
  const pages = {home:homePage,student:()=>authPage("student"),teacher:()=>authPage("teacher"),
    services:servicesPage,notices:noticesPage,complaint:complaintPage,track:trackPage,events:eventsPage,contact:contactPage};
  app.innerHTML = pages[route]();
  bindPage(route);
  updateProfileUI();
}

function homePage(){
  const complaints=getJSON(STORAGE.complaints,[]);
  const resolved=complaints.filter(c=>c.status==="Resolved").length + 124;
  const login=getJSON(STORAGE.login,null);
  const greeting=login ? `Welcome back, ${escapeHTML(login.name)}.` : "Welcome to your digital campus.";
  return `
    <div class="hero">
      <div class="eyebrow">SMART CAMPUS • ONE CONNECTED PLATFORM</div>
      <h1>${greeting}<br><span class="gradient-text">Everything campus, in one place.</span></h1>
      <p>Manage campus services, discover notices, raise support requests, track complaints and register for events from one responsive portal.</p>
      <div class="inline-actions">
        <button class="btn" data-route="student">Open Portal</button>
        <button class="btn secondary" data-route="complaint">Raise a Complaint</button>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><small>Total Students</small><strong>12,480</strong><span>● Campus population</span></div>
      <div class="stat"><small>Complaints Resolved</small><strong>${resolved}</strong><span>● Support performance</span></div>
      <div class="stat"><small>Upcoming Events</small><strong>${defaultEvents.length}</strong><span>● This month</span></div>
    </div>
    <div class="section">
      <div class="section-head"><div><h2>Quick Access</h2><p>Jump directly to the most-used campus tools.</p></div></div>
      <div class="quick-grid">
        <div class="card quick-card" data-route="student"><div class="card-icon">🎓</div><h3>Student Login</h3><p>Access your student dashboard, campus services and complaint history.</p></div>
        <div class="card quick-card" data-route="complaint"><div class="card-icon">⚠️</div><h3>Raise Complaint</h3><p>Submit a support request and receive a unique tracking ID instantly.</p></div>
        <div class="card quick-card" data-route="notices"><div class="card-icon">📢</div><h3>Campus Notices</h3><p>Search academic, examination, sports and emergency updates.</p></div>
      </div>
    </div>
  `;
}

function authPage(role){
  const login=getJSON(STORAGE.login,null);
  const logged=login?.role===role;
  return `
    <div class="section" style="margin-top:0">
      <div class="auth-wrap">
        <div class="card auth-info">
          <div class="eyebrow">${role==="student"?"STUDENT":"TEACHER"} PORTAL</div>
          <h1 style="font-size:32px">Your campus dashboard, <span class="gradient-text">simplified.</span></h1>
          <p class="muted" style="margin-top:15px;line-height:1.8">This demo uses browser LocalStorage to simulate authentication and session persistence. No real credentials are transmitted.</p>
          <ul><li>Personalized dashboard after login</li><li>Complaint and campus activity access</li><li>Responsive experience on mobile and desktop</li><li>Session persists after page refresh</li></ul>
        </div>
        <div class="card auth-form">
          ${logged ? dashboardMarkup(login) : `
          <div class="toggle">
            <button class="${role==="student"?"active":""}" data-route="student">Student Login</button>
            <button class="${role==="teacher"?"active":""}" data-route="teacher">Teacher Login</button>
          </div>
          <form id="loginForm">
            <div class="field"><label>University ID / Email</label><input id="loginId" required minlength="3" placeholder="${role==="student"?"e.g. STU2026001":"e.g. faculty@campus.edu"}"></div>
            <div class="field"><label>Password</label><input id="loginPassword" type="password" required minlength="4" placeholder="Minimum 4 characters"></div>
            <div class="field"><label>Role</label><select id="loginRole"><option value="${role}">${role[0].toUpperCase()+role.slice(1)}</option></select></div>
            <button class="btn" type="submit">Sign in as ${role}</button>
            <p class="hint">Demo only: any valid ID/email and password of 4+ characters will work.</p>
          </form>`}
        </div>
      </div>
    </div>
  `;
}
function dashboardMarkup(login){
  const complaints=getJSON(STORAGE.complaints,[]).filter(c=>c.roll===login.id || c.email===login.email);
  return `<div class="eyebrow">ACTIVE SESSION</div><h2>Welcome, ${escapeHTML(login.name)}</h2>
    <p class="muted" style="margin:8px 0 20px">${escapeHTML(login.role)} account • ${escapeHTML(login.id)}</p>
    <div class="dashboard-grid">
      <div class="card dashboard-main"><div class="split"><div><small class="muted">Academic progress</small><h3 style="margin-top:8px">Semester overview</h3></div><span class="badge">On Track</span></div><div class="progress"><i></i></div><p class="muted" style="margin-top:10px">Demo dashboard data for presentation purposes.</p></div>
      <div class="card"><small class="muted">My complaints</small><strong style="font-size:28px;display:block;margin-top:8px">${complaints.length}</strong></div>
      <div class="card"><small class="muted">Notices</small><strong style="font-size:28px;display:block;margin-top:8px">${notices.length}</strong></div>
    </div>
    <div class="inline-actions" style="margin-top:20px"><button class="btn" data-route="complaint">Raise Complaint</button><button class="btn secondary" data-route="track">Track Complaint</button><button class="btn secondary" id="dashboardLogout">Sign out</button></div>`;
}

function servicesPage(){
  return `<div class="section" style="margin-top:0"><div class="section-head"><div><div class="eyebrow">CAMPUS SERVICES</div><h1 style="font-size:36px">Everything you need.</h1><p>Centralized access to common campus resources.</p></div></div><div class="service-grid">${services.map(s=>`<div class="card"><div class="card-icon">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p><button class="small-btn service-action" data-service="${escapeHTML(s[1])}" style="margin-top:16px">Open service →</button></div>`).join("")}</div></div>`;
}

function noticesPage(){
  return `<div class="section" style="margin-top:0"><div class="section-head"><div><div class="eyebrow">CAMPUS INTELLIGENCE</div><h1 style="font-size:36px">Noticeboard.</h1><p>Search and filter the latest campus updates.</p></div></div>
  <div class="notice-tools"><input class="search" id="noticeSearch" placeholder="Search notices..."><div class="filters" id="noticeFilters">${["All","Academic","Sports","Examinations","Emergency"].map((x,i)=>`<button class="filter ${i===0?"active":""}" data-category="${x}">${x}</button>`).join("")}</div></div>
  <div class="notice-grid" id="noticeGrid">${noticeCards(notices)}</div></div>`;
}
function noticeCards(list){
  if(!list.length)return `<div class="empty" style="grid-column:1/-1">No notices match your search.</div>`;
  return list.map(n=>`<article class="card notice-card"><span class="notice-tag">${escapeHTML(n.category)}</span><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.text)}</p><time>${escapeHTML(n.date)}</time></article>`).join("");
}

function complaintPage(){
  return `<div class="section" style="margin-top:0"><div class="section-head"><div><div class="eyebrow">CAMPUS SUPPORT</div><h1 style="font-size:36px">Raise a complaint.</h1><p>Submit an issue and get a tracking ID immediately.</p></div></div>
  <div class="card form-card"><form id="complaintForm"><div class="form-grid">
  <div class="field"><label>Student Name *</label><input id="cName" required placeholder="Full name"></div>
  <div class="field"><label>Roll No. *</label><input id="cRoll" required placeholder="University roll number"></div>
  <div class="field"><label>Department *</label><select id="cDept" required><option value="">Select department</option><option>Computer Science</option><option>Electronics & Communication</option><option>Electrical Engineering</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Management</option><option>Other</option></select></div>
  <div class="field"><label>Category *</label><select id="cCategory" required><option value="">Select category</option><option>Hostel</option><option>Wi-Fi</option><option>Infrastructure</option><option>Academic</option></select></div>
  <div class="field full"><label>Description *</label><textarea id="cDescription" required minlength="10" placeholder="Describe the issue clearly..."></textarea></div>
  <div class="field full"><label>Attachment (optional)</label><input id="cFile" type="file" accept=".jpg,.jpeg,.png,.pdf"><p class="hint">Demo stores only the file name in LocalStorage, not the file itself.</p></div>
  </div><button class="btn" type="submit">Submit Complaint</button></form></div></div>`;
}

function trackPage(){
  return `<div class="section" style="margin-top:0"><div class="section-head"><div><div class="eyebrow">SUPPORT TRACKER</div><h1 style="font-size:36px">Track complaint.</h1><p>Enter your complaint ID to see its current status.</p></div></div>
  <div class="card track-box"><form id="trackForm"><div class="field"><label>Complaint Tracking ID</label><input id="trackId" required placeholder="#CMP-8942"></div><button class="btn" type="submit">Track Status</button></form><div id="trackResult"></div></div></div>`;
}

function statusClass(status){return status==="Resolved"?"status-resolved":status==="Under Review"?"status-review":"status-pending";}
function complaintResult(c){
  const stages=["Pending","Under Review","Resolved"]; const idx=stages.indexOf(c.status);
  return `<div class="track-result"><div class="split"><div><span class="muted">Tracking ID</span><h2>${escapeHTML(c.id)}</h2></div><span class="badge ${statusClass(c.status)}">${escapeHTML(c.status)}</span></div>
  <div style="margin-top:18px;display:grid;gap:8px"><p class="muted"><b style="color:#cbd5e1">Student:</b> ${escapeHTML(c.name)} • ${escapeHTML(c.roll)}</p><p class="muted"><b style="color:#cbd5e1">Category:</b> ${escapeHTML(c.category)} • ${escapeHTML(c.department)}</p><p class="muted"><b style="color:#cbd5e1">Assigned Authority:</b> ${escapeHTML(c.authority)}</p><p class="muted"><b style="color:#cbd5e1">Submitted:</b> ${escapeHTML(c.timestamp)}</p><p class="muted"><b style="color:#cbd5e1">Description:</b> ${escapeHTML(c.description)}</p></div>
  <div class="status-line">${stages.map((s,i)=>`<div class="step ${i<idx?"done":i===idx?"active":""}"><div class="dot">${i<idx?"✓":i+1}</div><small>${s}</small></div>`).join("")}</div></div>`;
}

function eventsPage(){
  const seats=getJSON(STORAGE.seats,{});
  return `<div class="section" style="margin-top:0"><div class="section-head"><div><div class="eyebrow">CAMPUS CALENDAR</div><h1 style="font-size:36px">Upcoming events.</h1><p>Reserve your seat in a few clicks.</p></div></div>
  <div class="event-grid">${defaultEvents.map(e=>{const left=Math.max(0,e.capacity-(seats[e.id]||0));return `<div class="card event-card"><div class="event-top">${e.icon}</div><span class="notice-tag">${e.type}</span><h3>${e.name}</h3><div class="meta"><span>${e.date}</span><span>${e.time}</span></div><p>${e.location}</p><div class="meta"><span class="seat">${left} seats left</span><span>Capacity ${e.capacity}</span></div><button class="btn register-btn" data-event="${e.id}" ${left===0?"disabled":""}>${left===0?"Sold Out":"Register Now"}</button></div>`}).join("")}</div></div>`;
}

function contactPage(){
  return `<div class="section" style="margin-top:0"><div class="eyebrow">HELP DESK</div><h1 style="font-size:36px">Contact campus support.</h1><p class="muted" style="margin:12px 0 25px;line-height:1.7">For this demo, the contact cards below provide the campus support structure. Connect these to a real backend/email service when deploying.</p><div class="contact-grid">
  <div class="card"><div class="card-icon">📞</div><h3>Help Desk</h3><p>General campus assistance and service navigation.</p><strong style="display:block;margin-top:15px">+91 1800 000 000</strong></div>
  <div class="card"><div class="card-icon">✉️</div><h3>Email Support</h3><p>Send support queries to the campus administration.</p><strong style="display:block;margin-top:15px">support@campusconnect.demo</strong></div>
  <div class="card"><div class="card-icon">📍</div><h3>Administration</h3><p>Campus Administration Block, Main Campus.</p><strong style="display:block;margin-top:15px">Mon–Fri • 9 AM–5 PM</strong></div>
  </div></div>`;
}

function bindPage(route){
  document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.route)));
  if(route==="student"||route==="teacher"){
    const form=document.getElementById("loginForm");
    if(form) form.addEventListener("submit",e=>{
      e.preventDefault();
      const id=document.getElementById("loginId").value.trim(), pass=document.getElementById("loginPassword").value;
      if(id.length<3||pass.length<4){showToast("Please enter a valid ID and password.","error");return}
      const role=document.getElementById("loginRole").value;
      const name=id.includes("@") ? id.split("@")[0].replace(/[._-]/g," ") : `${role==="student"?"Student":"Teacher"} ${id.slice(-4)}`;
      setJSON(STORAGE.login,{id,email:id.includes("@")?id:"",name,role,loggedAt:new Date().toISOString()});
      showToast("Login successful.");
      render(route);
    });
    const out=document.getElementById("dashboardLogout"); if(out) out.addEventListener("click",logout);
  }
  if(route==="notices"){
    let category="All";
    const update=()=>{const q=document.getElementById("noticeSearch").value.toLowerCase();const list=notices.filter(n=>(category==="All"||n.category===category)&&(n.title+n.text+n.category).toLowerCase().includes(q));document.getElementById("noticeGrid").innerHTML=noticeCards(list)};
    document.getElementById("noticeSearch").addEventListener("input",update);
    document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{category=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");update()}));
  }
  if(route==="complaint"){
    document.getElementById("complaintForm").addEventListener("submit",e=>{
      e.preventDefault();
      const complaints=getJSON(STORAGE.complaints,[]);
      let id;
      do{id="#CMP-"+Math.floor(1000+Math.random()*9000)}while(complaints.some(c=>c.id===id));
      const file=document.getElementById("cFile").files[0];
      const c={id,name:document.getElementById("cName").value.trim(),roll:document.getElementById("cRoll").value.trim(),department:document.getElementById("cDept").value,category:document.getElementById("cCategory").value,description:document.getElementById("cDescription").value.trim(),file:file?file.name:"",timestamp:new Date().toLocaleString(),authority:document.getElementById("cCategory").value==="Academic"?"Academic Office":document.getElementById("cCategory").value==="Hostel"?"Hostel Administration":"Campus Support Desk",status:"Pending"};
      complaints.unshift(c);setJSON(STORAGE.complaints,complaints);
      openModal(`<div class="modal-head"><h2>Complaint submitted</h2><button class="close" id="closeModal">×</button></div><p class="muted">Keep this tracking ID to check your complaint status.</p><div class="success-id">${c.id}</div><button class="btn" id="copyId">Copy Tracking ID</button> <button class="btn secondary" id="viewComplaint">Track Now</button>`);
      document.getElementById("copyId").onclick=()=>navigator.clipboard?.writeText(c.id).then(()=>showToast("Tracking ID copied.")).catch(()=>showToast("Copy unavailable; select the ID manually.","error"));
      document.getElementById("viewComplaint").onclick=()=>{closeModal();navigate("track");setTimeout(()=>{document.getElementById("trackId").value=c.id;document.getElementById("trackForm").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}))},50)};
      document.getElementById("closeModal").onclick=closeModal;
    });
  }
  if(route==="track"){
    document.getElementById("trackForm").addEventListener("submit",e=>{e.preventDefault();const id=document.getElementById("trackId").value.trim().toUpperCase();const c=getJSON(STORAGE.complaints,[]).find(x=>x.id.toUpperCase()===id);document.getElementById("trackResult").innerHTML=c?complaintResult(c):`<div class="empty track-result">No complaint found for <b>${escapeHTML(id)}</b>. Check the tracking ID and try again.</div>`});
  }
  if(route==="events"){
    document.querySelectorAll(".register-btn").forEach(btn=>btn.addEventListener("click",()=>openRegistration(btn.dataset.event)));
  }
  if(route==="services"){
    document.querySelectorAll(".service-action").forEach(btn=>btn.addEventListener("click",()=>showToast(`${btn.dataset.service} is ready for backend integration.`)));
  }
}

function openRegistration(eventId){
  const e=defaultEvents.find(x=>x.id===eventId); if(!e)return;
  const seats=getJSON(STORAGE.seats,{}), left=Math.max(0,e.capacity-(seats[e.id]||0));
  openModal(`<div class="modal-head"><div><div class="eyebrow">${e.type}</div><h2>${e.name}</h2></div><button class="close" id="closeModal">×</button></div>
  <p class="muted" style="margin-bottom:16px">${e.date} • ${e.time} • ${e.location}<br><span style="color:#67e8f9">${left} seats currently available</span></p>
  <form id="registerForm"><div class="field"><label>Full Name *</label><input id="rName" required></div><div class="field"><label>University ID / Email *</label><input id="rId" required></div><button class="btn" type="submit">Confirm Registration</button></form>`);
  document.getElementById("closeModal").onclick=closeModal;
  document.getElementById("registerForm").addEventListener("submit",ev=>{
    ev.preventDefault();
    const current=getJSON(STORAGE.seats,{}); if((current[e.id]||0)>=e.capacity){showToast("No seats remaining.","error");closeModal();return}
    current[e.id]=(current[e.id]||0)+1;setJSON(STORAGE.seats,current);
    const regs=getJSON(STORAGE.eventRegs,[]);regs.push({eventId,name:document.getElementById("rName").value.trim(),id:document.getElementById("rId").value.trim(),time:new Date().toISOString()});setJSON(STORAGE.eventRegs,regs);
    closeModal();showToast(`Registered for ${e.name}.`);render("events");
  });
}

function logout(){localStorage.removeItem(STORAGE.login);showToast("Signed out.");navigate("home")}
document.getElementById("logoutBtn").addEventListener("click",logout);
document.getElementById("profileBtn").addEventListener("click",()=>document.getElementById("profileMenu").classList.toggle("hidden"));
document.getElementById("glowToggle").addEventListener("click",()=>{document.body.classList.toggle("glow-off");localStorage.setItem(STORAGE.glow,document.body.classList.contains("glow-off")?"off":"on")});
if(localStorage.getItem(STORAGE.glow)==="off")document.body.classList.add("glow-off");
document.getElementById("mobileMenu").addEventListener("click",()=>{sidebar.classList.add("open");mobileOverlay.classList.remove("hidden")});
mobileOverlay.addEventListener("click",()=>{sidebar.classList.remove("open");mobileOverlay.classList.add("hidden")});
modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop)closeModal()});
window.addEventListener("popstate",()=>render(currentRoute()));
window.addEventListener("hashchange",()=>render(currentRoute()));
render();
