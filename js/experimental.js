document.addEventListener('DOMContentLoaded', function () {

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

        document.querySelectorAll('a, button, .service-card, .xnav-toggle').forEach(function (el) {
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

    /* ---------- Scroll reveal (IntersectionObserver, GSAP-free fallback) ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, i) {
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
