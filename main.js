// Lux Apartament — Sunny Spain

// --- Language switcher ---
const MSGS = {
  pl: {
    required:  'Wypełnij wszystkie wymagane pola.',
    dateOrder: 'Data wyjazdu musi być późniejsza niż data przyjazdu.',
    sending:   'Wysyłanie…',
    error:     'Coś poszło nie tak. Napisz bezpośrednio na WhatsApp: +48 603 768 661',
    submit:    'Wyślij zapytanie',
  },
  en: {
    required:  'Please fill in all required fields.',
    dateOrder: 'Departure date must be after arrival date.',
    sending:   'Sending…',
    error:     'Something went wrong. Contact us on WhatsApp: +48 603 768 661',
    submit:    'Send enquiry',
  },
  es: {
    required:  'Por favor, rellena todos los campos obligatorios.',
    dateOrder: 'La fecha de salida debe ser posterior a la de llegada.',
    sending:   'Enviando…',
    error:     'Algo salió mal. Contáctanos directamente por WhatsApp: +48 603 768 661',
    submit:    'Enviar consulta',
  },
};

let currentLang = localStorage.getItem('lux-lang') || 'pl';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lux-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === lang);
  });

  document.querySelectorAll('[data-pl]').forEach(el => {
    const text = el.dataset[lang] || el.dataset.pl;
    if (!text) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else {
      el.innerHTML = text;
    }
  });

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn && !submitBtn.disabled) {
    submitBtn.textContent = MSGS[lang].submit;
  }
}

document.querySelectorAll('[data-lang-btn]').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
});

// --- Gallery slider (infinite loop) ---
const galleryTrack = document.getElementById('galleryTrack');
const galleryPrev  = document.getElementById('galleryPrev');
const galleryNext  = document.getElementById('galleryNext');

if (galleryTrack && galleryPrev && galleryNext) {
  const origItems = [...galleryTrack.querySelectorAll('.gallery-item')];
  const N = origItems.length;

  origItems.forEach(el => galleryTrack.appendChild(el.cloneNode(true)));
  [...origItems].reverse().forEach(el => galleryTrack.insertBefore(el.cloneNode(true), galleryTrack.firstChild));

  const itemW = () => origItems[0].offsetWidth + 2;

  requestAnimationFrame(() => { galleryTrack.scrollLeft = itemW() * N; });

  galleryPrev.addEventListener('click', () => galleryTrack.scrollBy({ left: -itemW(), behavior: 'smooth' }));
  galleryNext.addEventListener('click', () => galleryTrack.scrollBy({ left:  itemW(), behavior: 'smooth' }));

  let t;
  galleryTrack.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const w = itemW();
      const setW = w * N;
      if (galleryTrack.scrollLeft < setW) {
        galleryTrack.scrollLeft += setW;
      } else if (galleryTrack.scrollLeft >= setW * 2) {
        galleryTrack.scrollLeft -= setW;
      }
    }, 200);
  });
}

// --- Nav: scroll shadow + mobile hamburger ---
const nav = document.getElementById('nav');
const hamburger = document.getElementById('navHamburger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// --- Smooth scroll for all anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// --- Set min date on date inputs to today ---
const today = new Date().toISOString().split('T')[0];
const dateFrom = document.getElementById('date-from');
const dateTo   = document.getElementById('date-to');

if (dateFrom) dateFrom.min = today;
if (dateTo)   dateTo.min   = today;

dateFrom?.addEventListener('change', () => {
  if (dateTo.value && dateTo.value <= dateFrom.value) dateTo.value = '';
  dateTo.min = dateFrom.value || today;
});

// --- Booking form submission (Formspree) ---
const form        = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');
const submitBtn   = document.getElementById('submitBtn');

form?.addEventListener('submit', async e => {
  e.preventDefault();
  formError.style.display = 'none';

  const name   = form.querySelector('#name').value.trim();
  const dFrom  = form.querySelector('#date-from').value;
  const dTo    = form.querySelector('#date-to').value;
  const guests = form.querySelector('#guests').value;
  const phone  = form.querySelector('#phone').value.trim();
  const m = MSGS[currentLang];

  if (!name || !dFrom || !dTo || !guests || !phone) { showError(m.required); return; }
  if (dTo <= dFrom) { showError(m.dateOrder); return; }

  submitBtn.disabled = true;
  submitBtn.textContent = m.sending;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      form.hidden = true;
      formSuccess.hidden = false;
    } else { throw new Error(); }
  } catch {
    showError(m.error);
    submitBtn.disabled = false;
    submitBtn.textContent = m.submit;
  }
});

function showError(msg) {
  formError.textContent = msg;
  formError.style.display = 'block';
}

// --- Init language (must be last) ---
setLang(currentLang);
