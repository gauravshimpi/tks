document.addEventListener('DOMContentLoaded', function () {

    var hasGsap = typeof gsap !== 'undefined';
    if (hasGsap && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ---------- Custom cursor ---------- */
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    var isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (isFinePointer && dot && ring) {
        var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

        window.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
        });

        (function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
            requestAnimationFrame(animateRing);
        })();

        document.querySelectorAll('a, button, .service-card, .duality-panel, .xnav-toggle').forEach(function (el) {
            el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
            el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
        });
    }

    /* ---------- Navbar scroll state ---------- */
    var nav = document.querySelector('.xnav');
    var topBtn = document.querySelector('.x-top');
    window.addEventListener('scroll', function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (nav) nav.classList.toggle('scrolled', y > 40);
        if (topBtn) topBtn.classList.toggle('show', y > 600);
    }, { passive: true });

    /* ---------- Mobile nav toggle ---------- */
    var toggle = document.querySelector('.xnav-toggle');
    var links = document.querySelector('.xnav-links');
    if (toggle && links) {
        toggle.addEventListener('click', function () {
            links.classList.toggle('mobile-open');
        });
        links.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { links.classList.remove('mobile-open'); });
        });
    }

    /* ---------- Back to top ---------- */
    if (topBtn) {
        topBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    if (hasGsap && typeof ScrollTrigger !== 'undefined') {
        // Group reveal elements by their parent container so siblings stagger together.
        var groups = new Map();
        revealEls.forEach(function (el) {
            var key = el.closest('.services-grid, .duality, .stats-grid, .life-stats') || el.parentElement;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(el);
        });
        groups.forEach(function (els) {
            gsap.set(els, { opacity: 0, y: 36 });
            ScrollTrigger.batch(els, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 });
                }
            });
        });
    } else if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = el.dataset.delay || 0;
                    setTimeout(function () {
                        el.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, Number(delay));
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    }

    /* ---------- Hero entrance ---------- */
    if (hasGsap) {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
            .from('.hero .eyebrow', { opacity: 0, y: 20, duration: 0.7 })
            .from('.hero h1', { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1 }, '-=0.4')
            .from('.hero .lead', { opacity: 0, y: 20, duration: 0.8 }, '-=0.5')
            .from('.hero-ctas .btn-x', { opacity: 0, y: 20, duration: 0.6, stagger: 0.12 }, '-=0.5');
    }

    /* ---------- Hero blob parallax ---------- */
    var heroEl = document.querySelector('.hero');
    var blobs = heroEl ? heroEl.querySelectorAll('.blob') : [];
    if (hasGsap && isFinePointer && heroEl && blobs.length) {
        var blobMovers = Array.prototype.map.call(blobs, function (blob, i) {
            return {
                x: gsap.quickTo(blob, 'x', { duration: 0.9, ease: 'power3.out' }),
                y: gsap.quickTo(blob, 'y', { duration: 0.9, ease: 'power3.out' }),
                depth: 20 + i * 12
            };
        });
        heroEl.addEventListener('mousemove', function (e) {
            var rect = heroEl.getBoundingClientRect();
            var relX = (e.clientX - rect.left) / rect.width - 0.5;
            var relY = (e.clientY - rect.top) / rect.height - 0.5;
            blobMovers.forEach(function (m) {
                m.x(relX * m.depth);
                m.y(relY * m.depth);
            });
        });
    }

    /* ---------- 3D tilt on cards ---------- */
    if (hasGsap && isFinePointer) {
        var tiltTargets = document.querySelectorAll('.service-card, .duality-panel, .life-photo');
        tiltTargets.forEach(function (card) {
            var rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
            var rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
            var liftY = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });

            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width - 0.5;
                var py = (e.clientY - rect.top) / rect.height - 0.5;
                rotX(py * -8);
                rotY(px * 8);
                liftY(-4);
            });
            card.addEventListener('mouseleave', function () {
                rotX(0);
                rotY(0);
                liftY(0);
            });
        });
    }

    /* ---------- Magnetic buttons ---------- */
    if (hasGsap && isFinePointer) {
        document.querySelectorAll('.btn-x, .xnav-cta').forEach(function (btn) {
            var moveX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
            var moveY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                moveX((e.clientX - rect.left - rect.width / 2) * 0.35);
                moveY((e.clientY - rect.top - rect.height / 2) * 0.35);
            });
            btn.addEventListener('mouseleave', function () {
                moveX(0);
                moveY(0);
            });
        });
    }

    /* ---------- Contact form ---------- */
    var xform = document.getElementById('xcontact-form');
    var xframe = document.getElementById('xform-hidden-frame');
    if (xform && xframe) {
        var submitBtn = xform.querySelector('.xform-submit');
        var statusEl = xform.querySelector('.xform-status');
        var awaitingResponse = false;

        xform.addEventListener('submit', function (e) {
            var honeypot = xform.querySelector('#xf-hp');
            if (honeypot && honeypot.value) {
                // Likely a bot: silently drop without submitting or showing an error.
                e.preventDefault();
                return;
            }
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            statusEl.textContent = '';
            statusEl.className = 'xform-status';
            awaitingResponse = true;
            // Native form submission proceeds into the hidden iframe from here.
        });

        xframe.addEventListener('load', function () {
            if (!awaitingResponse) return; // ignore the initial blank-iframe load
            awaitingResponse = false;
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            statusEl.textContent = "Thanks — we've got your message and will be in touch shortly.";
            statusEl.classList.add('success');
            xform.reset();
        });
    }

    /* ---------- Count-up stats ---------- */
    var counters = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window && counters.length) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.dataset.count, 10);
                var suffix = el.dataset.suffix || '';
                var duration = 1400;
                var start = null;

                function step(ts) {
                    if (!start) start = ts;
                    var progress = Math.min((ts - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = target + suffix;
                }
                requestAnimationFrame(step);
                cio.unobserve(el);
            });
        }, { threshold: 0.4 });
        counters.forEach(function (el) { cio.observe(el); });
    }

});
