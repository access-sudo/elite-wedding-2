(function () {
  // ---------- Header scroll state ----------
  var header = document.querySelector('header.top');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  var mobile = document.getElementById('mobile');
  document.getElementById('burger').addEventListener('click', function () {
    mobile.classList.add('open');
    this.setAttribute('aria-expanded', 'true');
  });
  document.getElementById('closeMobile').addEventListener('click', function () {
    mobile.classList.remove('open');
    document.getElementById('burger').setAttribute('aria-expanded', 'false');
  });
  mobile.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mobile.classList.remove('open'); });
  });

  // ---------- Banner slider ----------
  var slides = Array.prototype.slice.call(document.querySelectorAll('#slider .slide'));
  var dotsWrap = document.getElementById('dots');
  var index = 0, timer = null, INTERVAL = 6000;

  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.addEventListener('click', function () { go(i); restart(); });
    dotsWrap.appendChild(b);
  });

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === index); });
    Array.prototype.forEach.call(dotsWrap.children, function (d, k) { d.classList.toggle('on', k === index); });
  }
  function go(i) { show(i); }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { show(index + 1); }, INTERVAL);
  }
  document.getElementById('prev').addEventListener('click', function () { go(index - 1); restart(); });
  document.getElementById('next').addEventListener('click', function () { go(index + 1); restart(); });
  show(0);
  restart();

  // Pause on hover / hidden tab
  var sl = document.getElementById('slider');
  sl.addEventListener('mouseenter', function () { clearInterval(timer); });
  sl.addEventListener('mouseleave', restart);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearInterval(timer); else restart();
  });

  // Swipe support on touch
  var startX = null;
  sl.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  sl.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- Enquiry form ----------
  var ENDPOINT = 'https://readdy.ai/api/form/dbi927p9sb2grpr1boeg';
  var form = document.getElementById('enquiry');
  var status = document.getElementById('status');
  var btn = document.getElementById('submitBtn');

  function setStatus(type, msg) {
    status.className = 'status ' + type;
    status.textContent = msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);

    // Honeypot
    if ((fd.get('website_alt') || '').toString().trim()) {
      form.reset();
      setStatus('ok', 'Thank you — our atelier director will be in touch within one business day.');
      return;
    }

    var name = (fd.get('name') || '').toString().trim();
    var email = (fd.get('email') || '').toString().trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('err', 'Please enter your name and a valid email address.');
      return;
    }

    var body = new URLSearchParams();
    fd.forEach(function (v, k) { if (k !== 'website_alt' && String(v).trim()) body.append(k, v); });

    btn.disabled = true;
    setStatus('', '');
    status.className = 'status';
    btn.innerHTML = 'Sending… ';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    }).then(function (r) { return r.text(); }).then(function () {
      form.reset();
      setStatus('ok', 'Your enquiry is with our atelier director. We reply to every commission within one business day.');
    }).catch(function () {
      setStatus('err', 'A network error stopped your enquiry. Please check your connection and try again.');
    }).finally(function () {
      btn.disabled = false;
      btn.innerHTML = 'Send Wedding Enquiry <i class="ri-arrow-right-line"></i>';
    });
  });
})();
