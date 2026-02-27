/* ═══════════════════════════════════════════════════════
   📌 StudyKit Institute - Landing Page Scripts
   📅 Version: 1.0.0 | Last Update: 1404/12/08
   👨‍💻 Clean, modular, and performance-optimized
   ═══════════════════════════════════════════════════════ */


;(function () {
    'use strict';

    /* ─────────────────────────────────────
       🧩 DOM References (کش کردن المان‌ها)
       ───────────────────────────────────── */
    const DOM = {
        navbar:          document.getElementById('navbar'),
        navToggle:       document.getElementById('navToggle'),
        navMenu:         document.getElementById('navMenu'),
        navLinks:        document.querySelectorAll('.nav-link'),
        backToTop:       document.getElementById('backToTop'),
        pricingToggle:   document.getElementById('pricingToggle'),
        monthlyLabel:    document.getElementById('monthlyLabel'),
        yearlyLabel:     document.getElementById('yearlyLabel'),
        saveBadge:       document.querySelector('.save-badge'),
        faqItems:        document.querySelectorAll('.faq-item'),
        statNumbers:     document.querySelectorAll('.stat-number'),
        heroParticles:   document.getElementById('heroParticles'),
        chartBars:       document.querySelectorAll('.chart-bar'),
        testimonialsTrack: document.getElementById('testimonialsTrack'),
        testPrev:        document.getElementById('testPrev'),
        testNext:        document.getElementById('testNext'),
        testDots:        document.getElementById('testDots'),
        userCount:       document.getElementById('userCount'),
        mockHours:       document.getElementById('mockHours'),
        mockGoals:       document.getElementById('mockGoals'),
        aosElements:     document.querySelectorAll('[data-aos]'),
    };


    /* ─────────────────────────────────────
       🧭 Navigation: اسکرول و منوی موبایل
       ───────────────────────────────────── */
    const Navigation = {
        /** حالت اسکرول شده نوار ناوبری */
        handleScroll() {
            const scrollY = window.scrollY;
            DOM.navbar.classList.toggle('scrolled', scrollY > 50);
            DOM.backToTop.classList.toggle('visible', scrollY > 400);
        },

        /** باز و بسته کردن منوی موبایل */
        toggleMobile() {
            DOM.navToggle.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
            document.body.style.overflow =
                DOM.navMenu.classList.contains('active') ? 'hidden' : '';
        },

        /** بستن منو بعد از کلیک روی لینک */
        closeMobile() {
            DOM.navToggle.classList.remove('active');
            DOM.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        },

        /** هایلایت لینک فعال بر اساس اسکرول */
        highlightActive() {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 120;

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');

                if (scrollPos >= top && scrollPos < top + height) {
                    DOM.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        },

        init() {
            /* رویداد اسکرول (با throttle) */
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.handleScroll();
                        this.highlightActive();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            /* دکمه همبرگری */
            DOM.navToggle.addEventListener('click', () => this.toggleMobile());

            /* بستن منو با کلیک روی لینک */
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMobile());
            });

            /* دکمه برگشت به بالا */
            DOM.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    };


    /* ─────────────────────────────────────
       🔢 Counter Animation: شمارنده آمار
       ───────────────────────────────────── */
    const Counter = {
        /**
         * تبدیل عدد به فرمت فارسی با جداکننده هزارگان
         * @param {number} num - عدد ورودی
         * @returns {string} عدد فرمت‌شده فارسی
         */
        formatNumber(num) {
            const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
            return num.toLocaleString('en-US')
                .replace(/\d/g, d => persianDigits[d]);
        },

        /**
         * انیمیشن شمارش از صفر تا هدف
         * @param {HTMLElement} el - المان عددی
         */
        animate(el) {
            const target = parseInt(el.dataset.target);
            const duration = 2200;
            const startTime = performance.now();

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                /* easeOutExpo برای انیمیشن طبیعی */
                const eased = progress === 1
                    ? 1
                    : 1 - Math.pow(2, -10 * progress);

                const current = Math.floor(eased * target);
                el.textContent = this.formatNumber(current);

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };

            requestAnimationFrame(step);
        },

        init() {
            /* Intersection Observer برای شروع شمارش هنگام نمایش */
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animate(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            DOM.statNumbers.forEach(el => observer.observe(el));
        }
    };


    /* ─────────────────────────────────────
       💬 Testimonials: اسلایدر نظرات
       ───────────────────────────────────── */
    const Testimonials = {
        currentIndex: 0,
        cards: null,
        totalDots: 0,
        autoPlayInterval: null,

        /** محاسبه تعداد اسلاید قابل نمایش */
        getVisibleCount() {
            const w = window.innerWidth;
            if (w > 900) return 3;
            if (w > 600) return 2;
            return 1;
        },

        /** ساخت دات‌های ناوبری */
        buildDots() {
            if (!DOM.testDots || !this.cards) return;

            const visible = this.getVisibleCount();
            this.totalDots = Math.max(this.cards.length - visible + 1, 1);
            DOM.testDots.innerHTML = '';

            for (let i = 0; i < this.totalDots; i++) {
                const dot = document.createElement('span');
                dot.classList.add('test-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goTo(i));
                DOM.testDots.appendChild(dot);
            }
        },

        /** رفتن به اسلاید مشخص */
        goTo(index) {
            if (!this.cards || this.cards.length === 0) return;

            this.currentIndex = Math.max(0, Math.min(index, this.totalDots - 1));

            const cardWidth = this.cards[0].offsetWidth + 20; /* 20 = gap */
            const offset = this.currentIndex * cardWidth;
            DOM.testimonialsTrack.style.transform = `translateX(${offset}px)`;

            /* آپدیت دات‌ها */
            DOM.testDots.querySelectorAll('.test-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentIndex);
            });
        },

        /** شروع اتوپلی */
        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => {
                const next = (this.currentIndex + 1) % this.totalDots;
                this.goTo(next);
            }, 4500);
        },

        /** توقف اتوپلی */
        stopAutoPlay() {
            clearInterval(this.autoPlayInterval);
        },

        init() {
            this.cards = DOM.testimonialsTrack?.querySelectorAll('.testimonial-card');
            if (!this.cards || this.cards.length === 0) return;

            this.buildDots();

            DOM.testNext?.addEventListener('click', () => {
                this.stopAutoPlay();
                this.goTo(this.currentIndex + 1);
                this.startAutoPlay();
            });

            DOM.testPrev?.addEventListener('click', () => {
                this.stopAutoPlay();
                this.goTo(this.currentIndex - 1);
                this.startAutoPlay();
            });

            /* ریسایز */
            window.addEventListener('resize', () => {
                this.buildDots();
                this.goTo(0);
            });

            /* پاز هنگام هاور */
            DOM.testimonialsTrack.addEventListener('mouseenter', () => this.stopAutoPlay());
            DOM.testimonialsTrack.addEventListener('mouseleave', () => this.startAutoPlay());

            this.startAutoPlay();
        }
    };


    /* ─────────────────────────────────────
       💰 Pricing Toggle: سوئیچ ماهانه/سالانه
       ───────────────────────────────────── */
    const PricingToggle = {
        isYearly: false,

        /** تبدیل عدد به فارسی با جداکننده */
        toPersianPrice(num) {
            if (num === 0) return '۰';
            const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
            return num.toLocaleString('en-US')
                .replace(/\d/g, d => persianDigits[d]);
        },

        toggle() {
            this.isYearly = !this.isYearly;

            DOM.pricingToggle.classList.toggle('yearly', this.isYearly);
            DOM.monthlyLabel.classList.toggle('active', !this.isYearly);
            DOM.yearlyLabel.classList.toggle('active', this.isYearly);
            DOM.saveBadge.classList.toggle('visible', this.isYearly);

            /* بروزرسانی قیمت‌ها */
            document.querySelectorAll('.price-amount').forEach(el => {
                const price = this.isYearly
                    ? parseInt(el.dataset.yearly)
                    : parseInt(el.dataset.monthly);
                el.textContent = this.toPersianPrice(price);
            });

            /* بروزرسانی واحد */
            document.querySelectorAll('.price-currency').forEach(el => {
                const priceAmount = el.previousElementSibling;
                if (parseInt(priceAmount.dataset.monthly) === 0) {
                    el.textContent = 'تومان';
                } else {
                    el.textContent = this.isYearly ? 'تومان / سال' : 'تومان / ماه';
                }
            });
        },

        init() {
            DOM.pricingToggle?.addEventListener('click', () => this.toggle());
        }
    };


    /* ─────────────────────────────────────
       ❓ FAQ Accordion
       ───────────────────────────────────── */
    const FAQ = {
        init() {
            DOM.faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    /* بستن همه موارد */
                    DOM.faqItems.forEach(i => i.classList.remove('active'));

                    /* باز کردن مورد کلیک‌شده (اگه قبلاً باز نبود) */
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            });
        }
    };


    /* ─────────────────────────────────────
       ✨ Hero Particles: ذرات تزئینی
       ───────────────────────────────────── */
    const Particles = {
        init() {
            if (!DOM.heroParticles) return;

            const colors = [
                'var(--pastel-blue)',
                'var(--pastel-pink)',
                'var(--pastel-green)',
                'var(--pastel-purple)',
                'var(--pastel-orange)',
            ];

            for (let i = 0; i < 18; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');

                const size = Math.random() * 30 + 10;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
                particle.style.animationDelay = `${Math.random() * 5}s`;

                DOM.heroParticles.appendChild(particle);
            }
        }
    };


    /* ─────────────────────────────────────
       📊 Chart Animation: نمودار موکاپ
       ───────────────────────────────────── */
    const ChartAnimation = {
        init() {
            if (DOM.chartBars.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        DOM.chartBars.forEach((bar, index) => {
                            setTimeout(() => {
                                bar.style.height = bar.dataset.height + '%';
                            }, index * 120);
                        });
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.3 });

            const firstBar = DOM.chartBars[0];
            if (firstBar) observer.observe(firstBar.closest('.mock-chart') || firstBar);
        }
    };


    /* ─────────────────────────────────────
       🔢 Hero Mini Counters
       ───────────────────────────────────── */
    const HeroCounters = {
        /** شمارنده ساده فارسی */
        animateTo(el, target, duration = 1800) {
            if (!el) return;

            const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                el.textContent = current.toLocaleString('en-US')
                    .replace(/\d/g, d => persianDigits[d]);

                if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        },

        init() {
            /* شروع با تاخیر کوتاه بعد از لود */
            setTimeout(() => {
                this.animateTo(DOM.userCount, 12580, 2000);
                this.animateTo(DOM.mockHours, 1248, 1600);
                this.animateTo(DOM.mockGoals, 47, 1400);
            }, 600);
        }
    };


    /* ─────────────────────────────────────
       🎭 Scroll Reveal (AOS-lite خودمون)
       ───────────────────────────────────── */
    const ScrollReveal = {
        init() {
            if (DOM.aosElements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        /* اعمال تاخیر اگه data-aos-delay داشت */
                        const delay = entry.target.dataset.aosDelay || 0;
                        setTimeout(() => {
                            entry.target.classList.add('aos-animate');
                        }, parseInt(delay));

                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

            DOM.aosElements.forEach(el => observer.observe(el));
        }
    };


    /* ─────────────────────────────────────
       🔑 Smooth Scroll: اسکرول نرم لینک‌ها
       ───────────────────────────────────── */
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;

                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        }
    };


    /* ─────────────────────────────────────
       🚀 Initialize Everything
       ───────────────────────────────────── */
    function init() {
        Navigation.init();
        Counter.init();
        Testimonials.init();
        PricingToggle.init();
        FAQ.init();
        Particles.init();
        ChartAnimation.init();
        HeroCounters.init();
        ScrollReveal.init();
        SmoothScroll.init();

        /* فعال‌سازی آیکون‌های Lucide */
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /* صبر کن تا DOM کامل لود بشه */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
