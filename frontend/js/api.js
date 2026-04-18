/* ============================================
   UNIFORMITY - api.js
   Phase 4: Form Submission & Data Insertion
   ============================================ */

const API_BASE = 'http://localhost:5000/api';

// ─── Token Helpers ───────────────────────────
function getToken() {
    return localStorage.getItem('token');
}
function saveToken(token) {
    localStorage.setItem('token', token);
}
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ─── Toast Notification ──────────────────────
function showToast(message, type = 'success') {
    const existing = document.getElementById('api-toast');
    if (existing) existing.remove();

    const color = type === 'success' ? '#1f7a4a' : '#dc2626';
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';

    const toast = document.createElement('div');
    toast.id = 'api-toast';
    toast.innerHTML = `<i class="bi ${icon} me-2"></i>${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 99999;
        background: #fff;
        color: #1a1a1a;
        border-left: 4px solid ${color};
        border-radius: 10px;
        padding: 0.9rem 1.2rem;
        font-family: Poppins, sans-serif;
        font-size: 0.88rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        display: flex;
        align-items: center;
        min-width: 260px;
        animation: slideUp 0.25s ease;
    `;

    if (!document.getElementById('toast-keyframes')) {
        const style = document.createElement('style');
        style.id = 'toast-keyframes';
        style.textContent = `@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ─── Button Loading State ────────────────────
function setLoading(btn, isLoading, originalText) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Please wait...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// ─── Inline Field Errors ─────────────────────
function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('is-invalid');
    const err = document.createElement('div');
    err.className = 'invalid-feedback field-error-msg';
    err.style.display = 'block';
    err.textContent = message;
    input.parentElement.appendChild(err);
}

function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const old = input.parentElement.querySelector('.field-error-msg');
    if (old) old.remove();
}

function clearAllErrors(form) {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
}