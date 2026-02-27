/**
 * ============================================
 *  StudyKit — Authentication Logic
 * ============================================
 *  Handles: Login, Register, Password Toggle,
 *  Password Strength, Google Auth
 * ============================================
 *  Version: 1.0.0
 *  Last Modified: 1404/12/08
 * ============================================
 */

/* ── Wait for DOM ── */
document.addEventListener('DOMContentLoaded', () => {
    
    /* Check if already logged in → redirect to dashboard */
    if (window.StudyKit) {
        StudyKit.redirectIfLoggedIn();
    }

    initPasswordToggle();
    initPasswordStrength();
    initLoginForm();
    initRegisterForm();
    initGoogleAuth();
});

/* ═══════════════════════════════════════
   🔑 Login Form Handler
   ═══════════════════════════════════════ */

function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const password = form.password.value;
        const submitBtn = document.getElementById('submitBtn');

        /* Validation */
        if (!email || !password) {
            showMessage('لطفاً ایمیل و رمز عبور رو وارد کن', 'error');
            return;
        }

        /* Show loading state */
        setLoading(submitBtn, true);

        try {
            const { data, error } = await StudyKit.db.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            showMessage('ورود موفق! در حال انتقال...', 'success');

            /* Small delay for UX, then redirect */
            setTimeout(() => {
                window.location.href = '/dashboard/dashboard.html';
            }, 800);

        } catch (err) {
            console.error('Login error:', err);
            
            /* User-friendly error messages */
            const messages = {
                'Invalid login credentials': 'ایمیل یا رمز عبور اشتباهه!',
                'Email not confirmed': 'ایمیلت هنوز تأیید نشده. صندوق ورودیتو چک کن!',
                'Too many requests': 'زیادی تلاش کردی! چند دقیقه صبر کن.'
            };

            const msg = messages[err.message] || `خطا: ${err.message}`;
            showMessage(msg, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

/* ═══════════════════════════════════════
   📝 Register Form Handler
   ═══════════════════════════════════════ */

function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = form.fullName.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const terms = form.terms?.checked;
        const submitBtn = document.getElementById('submitBtn');

        /* Validations */
        if (!fullName || fullName.length < 3) {
            showMessage('لطفاً اسم کاملت رو وارد کن (حداقل ۳ حرف)', 'error');
            return;
        }

        if (!email) {
            showMessage('ایمیلت رو وارد کن', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('رمز عبور باید حداقل ۶ کاراکتر باشه', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('رمز عبور و تکرارش یکی نیستن! 🤔', 'error');
            return;
        }

        if (!terms) {
            showMessage('لطفاً قوانین رو قبول کن', 'error');
            return;
        }

        setLoading(submitBtn, true);

        try {
            const { data, error } = await StudyKit.db.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        display_name: fullName
                    }
                }
            });

            if (error) throw error;

            /* 
             * Supabase sends a confirmation email.
             * The trigger we created automatically makes
             * a profile in the `users` table.
             */
            showMessage(
                '✅ ثبت‌نام موفق! یه ایمیل تأیید برات فرستادیم. صندوق ورودیتو چک کن!',
                'success'
            );

            /* Clear form */
            form.reset();

        } catch (err) {
            console.error('Register error:', err);

            const messages = {
                'User already registered': 'این ایمیل قبلاً ثبت‌نام کرده!',
                'Password should be at least 6 characters': 'رمز باید حداقل ۶ کاراکتر باشه',
                'Too many requests': 'زیادی تلاش کردی! چند دقیقه صبر کن.'
            };

            const msg = messages[err.message] || `خطا: ${err.message}`;
            showMessage(msg, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

/* ═══════════════════════════════════════
   🔗 Google Auth
   ═══════════════════════════════════════ */

function initGoogleAuth() {
    const btn = document.getElementById('googleLogin');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        try {
            const { error } = await StudyKit.db.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard/dashboard.html'
                }
            });
            
            if (error) throw error;
        } catch (err) {
            showMessage('ورود با گوگل فعلاً در دسترس نیست', 'error');
            console.error('Google auth error:', err);
        }
    });
}

/* ═══════════════════════════════════════
   👁️ Password Toggle
   ═══════════════════════════════════════ */

function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            btn.textContent = isPassword ? '🙈' : '👁️';
        });
    });
}

/* ═══════════════════════════════════════
   💪 Password Strength Meter
   ═══════════════════════════════════════ */

function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthContainer = document.getElementById('passwordStrength');
    
    if (!passwordInput || !strengthContainer) return;

    const fill = strengthContainer.querySelector('.strength-fill');
    const text = strengthContainer.querySelector('.strength-text');

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let score = 0;

        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        /* Remove all classes */
        fill.className = 'strength-fill';

        if (val.length === 0) {
            text.textContent = 'قدرت رمز';
        } else if (score <= 2) {
            fill.classList.add('weak');
            text.textContent = '😕 ضعیف';
        } else if (score <= 3) {
            fill.classList.add('medium');
            text.textContent = '😐 متوسط';
        } else {
            fill.classList.add('strong');
            text.textContent = '💪 قوی';
        }
    });
}

/* ═══════════════════════════════════════
   🛠️ Utility Functions
   ═══════════════════════════════════════ */

/**
 * Show success or error message
 */
function showMessage(text, type = 'error') {
    const el = document.getElementById('authMessage');
    if (!el) return;

    el.textContent = text;
    el.className = `auth-message ${type}`;
    el.style.display = 'block';

    /* Auto-hide after 6 seconds */
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
        el.style.display = 'none';
    }, 6000);
}

/**
 * Toggle loading state on submit button
 */
function setLoading(btn, loading) {
    if (!btn) return;

    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');

    if (loading) {
        btn.disabled = true;
        if (text) text.style.display = 'none';
        if (loader) loader.style.display = 'inline-flex';
    } else {
        btn.disabled = false;
        if (text) text.style.display = 'inline';
        if (loader) loader.style.display = 'none';
    }
}
