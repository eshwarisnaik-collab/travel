/* =========================================================
   WAYPOINT — script.js
   Handles: destination data + rendering, search/filter,
   split-flap hero animation, nav toggle, scroll reveal,
   stat counters, form validation, local storage wishlist.
   Every DOM lookup is guarded so this one file can safely
   run on both index.html and about.html.
   ========================================================= */

// ---------- DESTINATION DATA ----------
const destinations = [
  // ---- INDIA ----
  { id:"goa", region:"india", type:["beach"], code:"GOI", city:"Goa", desc:"Sun-bleached shacks, Portuguese lanes and the best sunset on the coast.", days:"3–5 days", best:"Nov–Feb",
    img:"https://picsum.photos/seed/goa-beach/600/400" },
  { id:"manali", region:"india", type:["mountain"], code:"MNL", city:"Manali", desc:"Pine-covered valleys, river rafting and the road to Ladakh.", days:"4–6 days", best:"Mar–Jun",
    img:"https://picsum.photos/seed/manali-hills/600/400" },
  { id:"jaipur", region:"india", type:["heritage","city"], code:"JAI", city:"Jaipur", desc:"The Pink City — forts, bazaars and a skyline of sandstone domes.", days:"2–4 days", best:"Oct–Mar",
    img:"https://picsum.photos/seed/jaipur-fort/600/400" },
  { id:"kerala", region:"india", type:["beach","mountain"], code:"COK", city:"Kerala Backwaters", desc:"Houseboats, coconut groves and slow mornings on the water.", days:"4–7 days", best:"Sep–Mar",
    img:"https://picsum.photos/seed/kerala-water/600/400" },
  { id:"ladakh", region:"india", type:["mountain"], code:"LEH", city:"Ladakh", desc:"High-altitude monasteries and moonscape passes above 5,000m.", days:"6–8 days", best:"May–Sep",
    img:"https://picsum.photos/seed/ladakh-peaks/600/400" },
  { id:"varanasi", region:"india", type:["heritage"], code:"VNS", city:"Varanasi", desc:"Ghats, lamplight and the oldest living city on the Ganges.", days:"2–3 days", best:"Oct–Mar",
    img:"https://picsum.photos/seed/varanasi-ghats/600/400" },
  { id:"mumbai", region:"india", type:["city"], code:"BOM", city:"Mumbai", desc:"Colonial arches, street food trails and the city that never sleeps.", days:"2–4 days", best:"Nov–Feb",
    img:"https://picsum.photos/seed/mumbai-city/600/400" },
  { id:"andaman", region:"india", type:["beach"], code:"IXZ", city:"Andaman Islands", desc:"Turquoise water, coral reefs and beaches with barely a footprint.", days:"5–7 days", best:"Nov–May",
    img:"https://picsum.photos/seed/andaman-islands/600/400" },

  // ---- INTERNATIONAL ----
  { id:"bali", region:"international", type:["beach"], code:"DPS", city:"Bali, Indonesia", desc:"Rice terraces, temple gates and surf breaks on every coast.", days:"5–8 days", best:"Apr–Oct",
    img:"https://picsum.photos/seed/bali-rice/600/400" },
  { id:"tokyo", region:"international", type:["city"], code:"HND", city:"Tokyo, Japan", desc:"Neon crossings by night, quiet shrines by day.", days:"5–7 days", best:"Mar–May",
    img:"https://picsum.photos/seed/tokyo-neon/600/400" },
  { id:"paris", region:"international", type:["city","heritage"], code:"CDG", city:"Paris, France", desc:"Café corners, riverside walks and a skyline built on iron and light.", days:"4–6 days", best:"Apr–Jun",
    img:"https://picsum.photos/seed/paris-city/600/400" },
  { id:"santorini", region:"international", type:["beach"], code:"JTR", city:"Santorini, Greece", desc:"Whitewashed cliffs and caldera sunsets over the Aegean.", days:"3–5 days", best:"May–Sep",
    img:"https://picsum.photos/seed/santorini-cliffs/600/400" },
  { id:"swiss-alps", region:"international", type:["mountain"], code:"ZRH", city:"Swiss Alps", desc:"Cable cars, glacier trails and villages tucked into the peaks.", days:"5–7 days", best:"Jun–Sep",
    img:"https://picsum.photos/seed/swiss-alps/600/400" },
  { id:"dubai", region:"international", type:["city"], code:"DXB", city:"Dubai, UAE", desc:"Desert dunes by morning, record-breaking skylines by night.", days:"3–5 days", best:"Nov–Mar",
    img:"https://picsum.photos/seed/dubai-skyline/600/400" },
  { id:"rome", region:"international", type:["heritage","city"], code:"FCO", city:"Rome, Italy", desc:"Two thousand years of history stacked into one walkable city.", days:"4–6 days", best:"Apr–Jun",
    img:"https://picsum.photos/seed/rome-ruins/600/400" },
  { id:"queenstown", region:"international", type:["mountain"], code:"ZQN", city:"Queenstown, NZ", desc:"Adventure capital ringed by lakes and the Southern Alps.", days:"6–9 days", best:"Dec–Feb",
    img:"https://picsum.photos/seed/queenstown-lake/600/400" }
];

// ---------- RENDER CARDS ----------
function passCardHTML(d){
  return `
  <article class="pass-card reveal" data-region="${d.region}" data-type="${d.type.join(' ')}" data-name="${d.city.toLowerCase()}">
    <div class="pass-photo">
      <img src="${d.img}" alt="${d.city}" loading="lazy">
      <span class="pass-tag">${d.region === 'india' ? 'DOMESTIC' : 'INTERNATIONAL'}</span>
    </div>
    <div class="pass-body">
      <div class="pass-route">
        <span class="pass-code">${d.code}</span>
        <span class="pass-city">${d.city}</span>
      </div>
      <p class="pass-desc">${d.desc}</p>
    </div>
    <div class="pass-perf"></div>
    <div class="pass-stub">
      <span class="stub-item"><span>DURATION</span>${d.days}</span>
      <span class="stub-item"><span>BEST TIME</span>${d.best}</span>
      <span class="pass-barcode" aria-hidden="true"></span>
    </div>
  </article>`;
}

const indiaGrid = document.getElementById('indiaGrid');
const intlGrid = document.getElementById('intlGrid');

function renderGrids(){
  if(!indiaGrid || !intlGrid) return; // not on this page (e.g. about.html)
  indiaGrid.innerHTML = destinations.filter(d => d.region === 'india').map(passCardHTML).join('');
  intlGrid.innerHTML = destinations.filter(d => d.region === 'international').map(passCardHTML).join('');
}
renderGrids();

// ---------- SEARCH + FILTER ----------
const searchInput = document.getElementById('searchInput');
const pills = document.querySelectorAll('.pill');
const noResults = document.getElementById('noResults');
const indiaSection = document.getElementById('india');
const intlSection = document.getElementById('international');
let activeFilter = 'all';

function applyFilters(){
  if(!searchInput || !noResults) return;
  const query = searchInput.value.trim().toLowerCase();
  const allCards = document.querySelectorAll('.pass-card');
  let visibleCount = 0;

  allCards.forEach(card => {
    const region = card.dataset.region;
    const types = card.dataset.type;
    const name = card.dataset.name;

    let matchesFilter = false;
    if(activeFilter === 'all'){ matchesFilter = true; }
    else if(activeFilter === 'india' || activeFilter === 'international'){ matchesFilter = region === activeFilter; }
    else { matchesFilter = types.includes(activeFilter); }

    const matchesSearch = query === '' || name.includes(query);
    const show = matchesFilter && matchesSearch;
    card.style.display = show ? '' : 'none';
    if(show) visibleCount++;
  });

  // Hide whole section headers if empty after filtering
  if(indiaSection){
    const indiaVisible = [...document.querySelectorAll('#indiaGrid .pass-card')].some(c => c.style.display !== 'none');
    indiaSection.style.display = indiaVisible ? '' : 'none';
  }
  if(intlSection){
    const intlVisible = [...document.querySelectorAll('#intlGrid .pass-card')].some(c => c.style.display !== 'none');
    intlSection.style.display = intlVisible ? '' : 'none';
  }

  noResults.classList.toggle('hidden', visibleCount !== 0);
}

if(searchInput){
  searchInput.addEventListener('input', applyFilters);
}
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.dataset.filter;
    applyFilters();
  });
});

// ---------- NAV TOGGLE (mobile) ----------
const hamburger = document.getElementById('hamburger');
const navlinks = document.getElementById('navlinks');
if(hamburger && navlinks){
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navlinks.classList.toggle('open');
  });
  navlinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navlinks.classList.remove('open');
    });
  });
}

// ---------- SPLIT-FLAP HERO WORD CYCLE ----------
const flapWords = ["GOA","LADAKH","TOKYO","JAIPUR","SANTORINI","KERALA","PARIS","VARANASI"];
const flapWordEl = document.getElementById('flapWord');
let flapIndex = 0;

function cycleFlap(){
  if(!flapWordEl) return;
  flapWordEl.style.opacity = 0;
  flapWordEl.style.transform = 'translateY(-6px)';
  setTimeout(() => {
    flapIndex = (flapIndex + 1) % flapWords.length;
    flapWordEl.textContent = flapWords[flapIndex];
    flapWordEl.style.transition = 'opacity .25s ease, transform .25s ease';
    flapWordEl.style.opacity = 1;
    flapWordEl.style.transform = 'translateY(0)';
  }, 260);
}
if(flapWordEl) setInterval(cycleFlap, 2200);

// ---------- SCROLL REVEAL ----------
function observeReveals(){
  const targets = document.querySelectorAll('.reveal:not(.in)');
  if(!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => io.observe(el));
}
observeReveals();

// ---------- STAT COUNTERS ----------
const statNums = document.querySelectorAll('.stat-num');
let statsAnimated = false;

function animateStats(){
  if(statsAnimated) return;
  statsAnimated = true;
  statNums.forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if(progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  });
}
const statsSection = document.querySelector('.stats');
if(statsSection && statNums.length){
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if(entry.isIntersecting) animateStats(); });
  }, { threshold: 0.4 });
  statsObserver.observe(statsSection);
}

// ---------- SCROLL TOP BUTTON ----------
const scrollTopBtn = document.getElementById('scrollTop');
if(scrollTopBtn){
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('show', window.scrollY > 500);
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

// ---------- TOPBAR SHADOW ON SCROLL ----------
const topbar = document.getElementById('topbar');
if(topbar){
  window.addEventListener('scroll', () => {
    topbar.style.boxShadow = window.scrollY > 10 ? '0 8px 24px -16px rgba(22,24,28,0.5)' : 'none';
  });
}

// ---------- TRIP REQUEST FORM VALIDATION ----------
const tripForm = document.getElementById('tripForm');
const formSuccess = document.getElementById('formSuccess');

function setError(fieldId, message){
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + 'Error');
  if(!field || !errorEl) return;
  if(message){
    field.classList.add('invalid');
    errorEl.textContent = message;
  } else {
    field.classList.remove('invalid');
    errorEl.textContent = '';
  }
}

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if(tripForm && formSuccess){
  tripForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const destination = document.getElementById('destination').value.trim();

    if(name.length < 2){ setError('name', 'Please enter your full name.'); valid = false; }
    else setError('name', '');

    if(!isValidEmail(email)){ setError('email', 'Enter a valid email address.'); valid = false; }
    else setError('email', '');

    if(destination.length < 2){ setError('destination', 'Tell us where you\'d like to go.'); valid = false; }
    else setError('destination', '');

    if(!valid){
      formSuccess.classList.add('hidden');
      return;
    }

    // Save last request locally so a returning visitor's form pre-fills (local storage demo)
    try{
      localStorage.setItem('waypoint_last_request', JSON.stringify({ name, email, destination }));
    } catch(err){ /* localStorage unavailable — safe to ignore */ }

    formSuccess.classList.remove('hidden');
    tripForm.reset();
    setTimeout(() => formSuccess.classList.add('hidden'), 5000);
  });

  // Pre-fill from local storage if available
  try{
    const saved = JSON.parse(localStorage.getItem('waypoint_last_request'));
    if(saved){
      document.getElementById('name').value = saved.name || '';
      document.getElementById('email').value = saved.email || '';
    }
  } catch(err){ /* ignore */ }
}