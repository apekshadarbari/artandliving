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

// Contact form
const contactForm = document.querySelector('.contact-form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  contactForm.innerHTML = '<p style="font-family: var(--font-display); font-style: italic; color: var(--teal); font-size: 1.2rem; padding: 2rem 0;">Your message landed. I\'ll be in touch.</p>';
});

// ── MAILING LIST POPUP ──
(function () {
  const FLODESK_URL = 'https://apekshadarbari.myflodesk.com/apekshadarbari-art-and-living';
  const SESSION_KEY = 'mailPopupState'; // 'minimized' | 'dismissed'

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #mail-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      width: 340px;
      background: #35394c;
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
      color: #f2e0d7;
      line-height: 1.3;
      margin-bottom: 0.85rem;
    }
    #mail-popup p {
      font-family: 'Nunito Sans', sans-serif;
      font-size: 0.875rem;
      color: rgba(242,224,215,0.7);
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
      color: rgba(242,224,215,0.45);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }
    #mail-popup-minimize:hover { color: #f2e0d7; }
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

  // Build popup
  const popup = document.createElement('div');
  popup.id = 'mail-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-label', 'Join the circle');
  popup.innerHTML = `
    <button id="mail-popup-minimize" aria-label="Minimise">&#x2715;</button>
    <span id="mail-popup-eyebrow">Join the circle</span>
    <h3>A gift, your choice.<br>Then letters from the studio.</h3>
    <p>Join the circle and choose one of two paid offerings, complimentary, as a quiet thank you for being here. What follows: letters on creativity, neurodivergence, what women carry, upcoming workshops, resources, and what we are building together. You'll only hear from me when there's something worth saying.</p>
    <a id="mail-popup-cta" href="${FLODESK_URL}" target="_blank" rel="noopener noreferrer">Join and choose your gift</a>
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

  document.body.appendChild(popup);
  document.body.appendChild(tab);

  function showPopup() {
    popup.classList.add('visible');
    tab.classList.remove('visible');
  }

  function minimisePopup() {
    popup.classList.remove('visible');
    tab.classList.add('visible');
    sessionStorage.setItem(SESSION_KEY, 'minimized');
  }

  // Restore previous state or show after delay
  const savedState = sessionStorage.getItem(SESSION_KEY);
  if (savedState === 'minimized') {
    // Show only the tab immediately
    setTimeout(() => tab.classList.add('visible'), 800);
  } else {
    // Fresh visit: show popup after 4 seconds
    setTimeout(showPopup, 4000);
  }

  document.getElementById('mail-popup-minimize').addEventListener('click', minimisePopup);
  tab.addEventListener('click', showPopup);
})();
