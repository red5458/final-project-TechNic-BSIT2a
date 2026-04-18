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

// ════════════════════════════════════════════
//  REGISTER FORM
//  POST /api/auth/register
// ════════════════════════════════════════════
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(registerForm);

        const nameInput = registerForm.querySelector('[name="name"]');
        const emailInput = registerForm.querySelector('[name="email"]');
        const passwordInput = registerForm.querySelector('[name="password"]');
        const confirmInput = registerForm.querySelector('[name="confirmPassword"]');
        const btn = document.getElementById('registerBtn');
        const originalText = btn.innerHTML;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        let hasError = false;

        if (!name) {
            showFieldError(nameInput, 'Full name is required.');
            hasError = true;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError(emailInput, 'Please enter a valid email address.');
            hasError = true;
        }
        if (!password || password.length < 8) {
            showFieldError(passwordInput, 'Password must be at least 8 characters.');
            hasError = true;
        }
        if (password !== confirm) {
            showFieldError(confirmInput, 'Passwords do not match.');
            hasError = true;
        }

        if (hasError) return;

        setLoading(btn, true);

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed.');

            saveToken(data.token);
            const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { 'x-auth-token': data.token } });
            const meData = await meRes.json();
            saveUser(meData);

            showToast('Account created successfully! Redirecting...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Something went wrong. Try again.', 'error');
        }
    });
}

// ════════════════════════════════════════════
//  LOGIN FORM
//  POST /api/auth/login
// ════════════════════════════════════════════
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(loginForm);

        const emailInput = loginForm.querySelector('[name="email"]');
        const passwordInput = loginForm.querySelector('[name="password"]');
        const btn = document.getElementById('loginBtn');
        const originalText = btn.innerHTML;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let hasError = false;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError(emailInput, 'Please enter a valid email address.');
            hasError = true;
        }
        if (!password) {
            showFieldError(passwordInput, 'Password is required.');
            hasError = true;
        }

        if (hasError) return;

        setLoading(btn, true);

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Invalid email or password.');

            saveToken(data.token);
            const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { 'x-auth-token': data.token } });
            const meData = await meRes.json();
            saveUser(meData);

            showToast('Logged in successfully! Redirecting...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Login failed. Check your credentials.', 'error');
        }
    });
}

// ════════════════════════════════════════════
//  ADD LISTING FORM
//  POST /api/products
// ════════════════════════════════════════════
const listingForm = document.getElementById('listingForm');
if (listingForm) {

    // Load real categories from backend into dropdown
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        fetch(`${API_BASE}/categories`)
            .then(res => res.json())
            .then(categories => {
                categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
                categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat._id;
                    opt.textContent = cat.name;
                    categorySelect.appendChild(opt);
                });
            })
            .catch(() => { });
    }

    listingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(listingForm);

        const token = getToken();
        if (!token) {
            showToast('You must be logged in to list a uniform.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        const nameInput = listingForm.querySelector('[name="name"]');
        const categoryInput = listingForm.querySelector('[name="category_id"]');
        const sizeInput = listingForm.querySelector('[name="size"]');
        const priceInput = listingForm.querySelector('[name="price"]');
        const quantityInput = listingForm.querySelector('[name="quantity"]');
        const btn = document.getElementById('submitListingBtn');
        const originalText = btn.innerHTML;

        let hasError = false;

        if (!nameInput.value.trim()) {
            showFieldError(nameInput, 'Listing name is required.');
            hasError = true;
        }
        if (!categoryInput.value) {
            showFieldError(categoryInput, 'Please select a category.');
            hasError = true;
        }
        if (!sizeInput.value) {
            showFieldError(sizeInput, 'Please select a size.');
            hasError = true;
        }
        if (!priceInput.value || Number(priceInput.value) < 1) {
            showFieldError(priceInput, 'Please enter a valid price (minimum ₱1).');
            hasError = true;
        }
        if (!quantityInput.value || Number(quantityInput.value) < 1) {
            showFieldError(quantityInput, 'Quantity must be at least 1.');
            hasError = true;
        }

        if (hasError) return;

        setLoading(btn, true);

        try {
            const formData = new FormData(listingForm);

            const res = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.msg || 'Failed to create listing.');

            showToast('Uniform listed successfully!');
            setTimeout(() => { window.location.href = 'my-listings.html'; }, 1500);

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Something went wrong. Try again.', 'error');
        }
    });
}