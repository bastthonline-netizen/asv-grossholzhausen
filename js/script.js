// ASV Großholzhausen — Frontend JS

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    // --- 1. Mobile-Navigation Toggle ---
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            const isOpen = links.classList.toggle('open');
            toggle.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        links.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (links.classList.contains('open')) {
                    links.classList.remove('open');
                    toggle.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }


    // --- 2. Aktiven Nav-Link markieren ---
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-link').forEach(function (link) {
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });


    // --- 3. Smooth-Scroll für Anker ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: reducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        });
    });


    // --- 4. Scroll-Reveal mit IntersectionObserver ---
    if (!reducedMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('has-reveal');
        const revealEls = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }


    // --- 5. Header schrumpft beim Scrollen + Reading-Progress-Bar ---
    const header = document.querySelector('.site-header');
    const progressBar = document.querySelector('.reading-progress');
    let ticking = false;

    function updateScrollUI() {
        const scrollY = window.scrollY;
        if (header) {
            header.classList.toggle('scrolled', scrollY > 40);
        }
        if (progressBar && !reducedMotion) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0;
            progressBar.style.width = pct + '%';
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollUI);
            ticking = true;
        }
    }, { passive: true });
    updateScrollUI();


    // --- 6. FAQ-Accordion (eigenes Toggle für smooth Grid-Animation) ---
    document.querySelectorAll('.faq-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            const item = trigger.closest('.faq-item');
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            if (item) item.classList.toggle('is-open', !expanded);
        });
    });


    // --- 7. Counter-Up für Hero-Stats (rein numerische Werte) ---
    if (!reducedMotion && 'IntersectionObserver' in window) {
        const heroStats = document.querySelectorAll('.hero-stat-num');
        if (heroStats.length > 0) {
            const animateCounter = function (el) {
                const text = el.textContent.trim();
                const target = parseInt(text.replace(/\D/g, ''), 10);
                if (!Number.isFinite(target) || target === 0 || text.match(/[a-zA-Z–-]/)) {
                    // Nicht-numerische Werte (z.B. "U7–Senior") nicht animieren
                    return;
                }
                const duration = 1400;
                const start = performance.now();
                const tick = function (now) {
                    const t = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = Math.floor(eased * target);
                    if (t < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        el.textContent = text;
                    }
                };
                requestAnimationFrame(tick);
            };

            const statsObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });

            heroStats.forEach(function (el) { statsObserver.observe(el); });
        }
    }

})();
