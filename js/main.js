// ── CLOUDFLARE WEB ANALYTICS (cookieless — no consent banner needed) ──
// One-time setup: sign in to Cloudflare (free) → Web Analytics → "Add a site" →
// enter apekshadarbari.com → copy the token → paste it below in place of
// PASTE_CLOUDFLARE_TOKEN. It stays inert (no tracking) until a real token is set.
(function () {
  var CF_TOKEN = '511802b794d1465fa2cfd59a5c23c4d1';
  if (CF_TOKEN === 'PASTE_CLOUDFLARE_TOKEN') return;
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
  document.head.appendChild(s);
})();

// Nav scroll behaviour
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile hamburger
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const isOpen = navLinks?.classList.contains('open');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    hamburger?.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  });
});

// Intersection Observer for fade-up
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Email form (Flodesk embed placeholder)
document.querySelectorAll('.email-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input?.value) {
      form.innerHTML = '<p style="font-family: var(--font-display); font-style: italic; color: var(--teal); font-size: 1.1rem;">You\'re in. Talk soon. ✦</p>';
    }
  });
});

// Contact form (Netlify Forms; AJAX so we can show an inline confirmation).
// Posts to the form's own path so it works regardless of which host/URL the visitor is on.
const contactForm = document.querySelector('.contact-form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const body = new URLSearchParams(new FormData(contactForm)).toString();
  fetch(window.location.pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      contactForm.innerHTML = '<p style="font-family: var(--font-display); font-style: italic; color: var(--teal); font-size: 1.2rem; padding: 2rem 0;">Your message landed. I\'ll be in touch.</p>';
    })
    .catch(() => {
      contactForm.innerHTML = '<p style="font-family: var(--font-display); font-style: italic; color: var(--clay); font-size: 1.2rem; padding: 2rem 0;">Something went wrong sending this. Please email me directly at <a href="mailto:hello@apekshadarbari.com" style="color: var(--clay); text-decoration: underline;">hello@apekshadarbari.com</a> and I\'ll get right back to you.</p>';
    });
});

// ── MAILING LIST POPUP ──
// Three states, remembered per browser session (sessionStorage):
//   1. (no state)  → first time this session: big, page-wide welcome dialog
//   2. 'small'      → dialog was closed: small card in the corner
//   3. 'minimized'  → small card was minimised: just the little tab button
// Reopening the tab or card never brings back the big dialog — that's a
// one-time first-visit moment. State always stays at whatever level the
// visitor left it at, including across page loads within the same session.
(function () {
  const FLODESK_URL = 'https://apekshadarbari.myflodesk.com/apekshadarbari-art-and-living';
  const SESSION_KEY = 'mailPopupState'; // 'small' | 'minimized'

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #mail-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(53,57,76,0.78);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease;
    }
    #mail-modal-overlay.visible {
      opacity: 1;
      pointer-events: all;
    }
    #mail-modal {
      position: relative;
      width: 100%;
      max-width: 640px;
      background: #f2e0d7;
      padding: 3.5rem 3rem;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      transform: translateY(20px);
      transition: transform 0.4s ease;
    }
    #mail-modal-overlay.visible #mail-modal {
      transform: translateY(0);
    }
    #mail-modal-eyebrow {
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #e57c5f;
      margin-bottom: 1rem;
      display: block;
    }
    #mail-modal h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 400;
      font-size: clamp(1.9rem, 4vw, 2.6rem);
      color: #35394c;
      line-height: 1.25;
      margin-bottom: 1.25rem;
    }
    #mail-modal p {
      font-family: 'Nunito Sans', sans-serif;
      font-size: 1rem;
      color: #6b6b6b;
      line-height: 1.75;
      max-width: 460px;
      margin: 0 auto 2rem;
    }
    #mail-modal-cta {
      display: inline-block;
      background: #e57c5f;
      color: #fff;
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 1rem 2.25rem;
      text-decoration: none;
      transition: background 0.2s ease;
      border: none;
      cursor: pointer;
    }
    #mail-modal-cta:hover { background: #d4694d; }
    #mail-modal-close {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      background: none;
      border: none;
      color: rgba(53,57,76,0.45);
      font-size: 1.4rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }
    #mail-modal-close:hover { color: #35394c; }
    #mail-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      width: 340px;
      background: #f2e0d7;
      padding: 2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    #mail-popup.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    #mail-popup-eyebrow {
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e57c5f;
      margin-bottom: 0.75rem;
      display: block;
    }
    #mail-popup h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 400;
      font-size: 1.35rem;
      color: #35394c;
      line-height: 1.3;
      margin-bottom: 0.85rem;
    }
    #mail-popup p {
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.875rem;
      color: #6b6b6b;
      line-height: 1.65;
      margin-bottom: 1.5rem;
    }
    #mail-popup-cta {
      display: inline-block;
      background: #e57c5f;
      color: #fff;
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.75rem 1.75rem;
      text-decoration: none;
      transition: background 0.2s ease;
      border: none;
      cursor: pointer;
    }
    #mail-popup-cta:hover { background: #d4694d; }
    #mail-popup-minimize {
      position: absolute;
      top: 0.75rem;
      right: 0.9rem;
      background: none;
      border: none;
      color: rgba(53,57,76,0.45);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }
    #mail-popup-minimize:hover { color: #35394c; }
    #mail-tab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      background: #e57c5f;
      color: #fff;
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.6rem 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transform: translateY(8px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
    }
    #mail-tab.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    #mail-tab:hover { background: #d4694d; }
    #mail-tab svg { flex-shrink: 0; }
  `;
  document.head.appendChild(style);

  // Build big welcome dialog (first visit only)
  const overlay = document.createElement('div');
  overlay.id = 'mail-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Join the circle');
  overlay.innerHTML = `
    <div id="mail-modal">
      <button id="mail-modal-close" aria-label="Close">&#x2715;</button>
      <span id="mail-modal-eyebrow">Join the circle</span>
      <h2>Letters from the studio.</h2>
      <p>Letters on creativity, neurodivergence, what women carry, upcoming workshops, resources, and what we are building together. You'll only hear from me when there's something worth saying.</p>
      <a id="mail-modal-cta" href="${FLODESK_URL}" target="_blank" rel="noopener noreferrer">Join the circle</a>
    </div>
  `;

  // Build small corner popup
  const popup = document.createElement('div');
  popup.id = 'mail-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-label', 'Join the circle');
  popup.innerHTML = `
    <button id="mail-popup-minimize" aria-label="Minimise">&#x2715;</button>
    <span id="mail-popup-eyebrow">Join the circle</span>
    <h3>Letters from<br>the studio.</h3>
    <p>Letters on creativity, neurodivergence, what women carry, upcoming workshops, resources, and what we are building together. You'll only hear from me when there's something worth saying.</p>
    <a id="mail-popup-cta" href="${FLODESK_URL}" target="_blank" rel="noopener noreferrer">Join the circle</a>
  `;

  // Build minimised tab
  const tab = document.createElement('div');
  tab.id = 'mail-tab';
  tab.setAttribute('role', 'button');
  tab.setAttribute('aria-label', 'Open mailing list sign-up');
  tab.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
    Join the circle
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  document.body.appendChild(tab);

  function showModal() {
    overlay.classList.add('visible');
  }

  function closeModal() {
    // Closing the big dialog demotes it to the small corner card for future visits/page
    // loads this session — it does NOT reopen immediately as a second pop-up right now.
    // (Round 7 bug fix: it previously called showPopup() here, which looked like two
    // pop-ups firing back to back.)
    overlay.classList.remove('visible');
    sessionStorage.setItem(SESSION_KEY, 'small');
  }

  function showPopup() {
    popup.classList.add('visible');
    tab.classList.remove('visible');
  }

  function minimisePopup() {
    popup.classList.remove('visible');
    tab.classList.add('visible');
    sessionStorage.setItem(SESSION_KEY, 'minimized');
  }

  // Restore whatever state the visitor left things at, or show the
  // big dialog for a true first-time-this-session visit.
  const savedState = sessionStorage.getItem(SESSION_KEY);
  if (savedState === 'minimized') {
    setTimeout(() => tab.classList.add('visible'), 800);
  } else if (savedState === 'small') {
    setTimeout(showPopup, 2000);
  } else {
    setTimeout(showModal, 2000);
  }

  document.getElementById('mail-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.getElementById('mail-popup-minimize').addEventListener('click', minimisePopup);
  tab.addEventListener('click', () => {
    showPopup();
    sessionStorage.setItem(SESSION_KEY, 'small');
  });
})();
