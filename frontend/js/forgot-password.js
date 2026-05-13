(function () {
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : '/api';

    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const showForgotPasswordBtn = document.getElementById('showForgotPasswordBtn');
    const backToLoginFromForgotBtn = document.getElementById('backToLoginFromForgotBtn');
    const backToLoginFromResetBtn = document.getElementById('backToLoginFromResetBtn');
    const resendResetCodeBtn = document.getElementById('resendResetCodeBtn');
    let pendingPasswordResetEmail = '';

    if (!loginForm || !forgotPasswordForm || !resetPasswordForm || !showForgotPasswordBtn) return;

    function showStep(step) {
        loginForm.style.display = step === 'login' ? 'block' : 'none';
        forgotPasswordForm.style.display = step === 'forgot' ? 'block' : 'none';
        resetPasswordForm.style.display = step === 'reset' ? 'block' : 'none';
    }

    function toast(message, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }

        alert(message);
    }

    function clearErrors(form) {
        if (typeof window.clearAllErrors === 'function') {
            window.clearAllErrors(form);
            return;
        }

        form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
        form.querySelectorAll('.field-error-msg').forEach((el) => el.remove());
    }

    function showError(input, message) {
        if (typeof window.showFieldError === 'function') {
            window.showFieldError(input, message);
            return;
        }

        input.classList.add('is-invalid');
        const err = document.createElement('div');
        err.className = 'invalid-feedback field-error-msg';
        err.style.display = 'block';
        err.textContent = message;
        input.parentElement.appendChild(err);
    }

    function setButtonLoading(btn, isLoading, originalText) {
        if (typeof window.setLoading === 'function') {
            window.setLoading(btn, isLoading, originalText);
            return;
        }

        btn.disabled = isLoading;
        if (isLoading) {
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Please wait...';
        } else {
            btn.innerHTML = originalText;
        }
    }

    async function sendResetCode(email) {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Could not send reset code.');
        return data;
    }

    showForgotPasswordBtn.addEventListener('click', () => {
        clearErrors(forgotPasswordForm);
        const loginEmailInput = loginForm.querySelector('[name="email"]');
        const forgotEmailInput = forgotPasswordForm.querySelector('[name="email"]');
        if (loginEmailInput && forgotEmailInput) {
            forgotEmailInput.value = loginEmailInput.value.trim();
        }
        showStep('forgot');
    });

    if (backToLoginFromForgotBtn) {
        backToLoginFromForgotBtn.addEventListener('click', () => {
            clearErrors(forgotPasswordForm);
            showStep('login');
        });
    }

    if (backToLoginFromResetBtn) {
        backToLoginFromResetBtn.addEventListener('click', () => {
            clearErrors(resetPasswordForm);
            showStep('login');
        });
    }

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors(forgotPasswordForm);

        const emailInput = forgotPasswordForm.querySelector('[name="email"]');
        const btn = document.getElementById('forgotPasswordBtn');
        const originalText = btn.innerHTML;
        const email = emailInput.value.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError(emailInput, 'Please enter a valid email address.');
            return;
        }

        setButtonLoading(btn, true, originalText);

        try {
            const data = await sendResetCode(email);
            pendingPasswordResetEmail = data.email || email;
            const emailLabel = document.getElementById('resetEmailLabel');
            if (emailLabel) emailLabel.textContent = pendingPasswordResetEmail;
            showStep('reset');
            toast('Reset code sent. Please check your email.');
        } catch (err) {
            toast(err.message || 'Could not send reset code.', 'error');
        } finally {
            setButtonLoading(btn, false, originalText);
        }
    });

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors(resetPasswordForm);

        const otpInput = resetPasswordForm.querySelector('[name="otp"]');
        const passwordInput = resetPasswordForm.querySelector('[name="password"]');
        const confirmInput = resetPasswordForm.querySelector('[name="confirmPassword"]');
        const btn = document.getElementById('resetPasswordBtn');
        const originalText = btn.innerHTML;
        const otp = otpInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        let hasError = false;

        if (!/^\d{6}$/.test(otp)) {
            showError(otpInput, 'Enter the 6-digit reset code from your email.');
            hasError = true;
        }
        if (!password || password.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters.');
            hasError = true;
        }
        if (password !== confirm) {
            showError(confirmInput, 'Passwords do not match.');
            hasError = true;
        }
        if (hasError) return;

        setButtonLoading(btn, true, originalText);

        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: pendingPasswordResetEmail,
                    otp,
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Could not reset password.');

            resetPasswordForm.reset();
            showStep('login');
            toast(data.msg || 'Password reset successfully. You can now log in.');
        } catch (err) {
            toast(err.message || 'Could not reset password.', 'error');
        } finally {
            setButtonLoading(btn, false, originalText);
        }
    });

    if (resendResetCodeBtn) {
        resendResetCodeBtn.addEventListener('click', async () => {
            if (!pendingPasswordResetEmail) {
                toast('Enter your email first so we know where to send the code.', 'error');
                showStep('forgot');
                return;
            }

            const originalText = resendResetCodeBtn.innerHTML;
            resendResetCodeBtn.disabled = true;
            resendResetCodeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

            try {
                await sendResetCode(pendingPasswordResetEmail);
                toast('A new reset code has been sent.');
            } catch (err) {
                toast(err.message || 'Could not resend reset code.', 'error');
            } finally {
                resendResetCodeBtn.disabled = false;
                resendResetCodeBtn.innerHTML = originalText;
            }
        });
    }
})();
