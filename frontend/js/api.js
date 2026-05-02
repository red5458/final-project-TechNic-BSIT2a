/* ============================================
   UNIFORMITY - api.js
   Phase 4: Form Submission & Data Insertion
   ============================================ */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://final-project-technic-bsit2a.onrender.com/api';


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

let pendingVerificationEmail = '';

function openVerifyEmailModal(email) {
    pendingVerificationEmail = String(email || '').trim().toLowerCase();

    const emailText = document.getElementById('verifyEmailText');
    const otpInput = document.getElementById('verifyOtpInput');
    const modalEl = document.getElementById('verifyEmailModal');

    if (emailText) emailText.textContent = pendingVerificationEmail || 'your email';
    if (otpInput) otpInput.value = '';
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    setTimeout(() => otpInput?.focus(), 350);
}

async function finishVerifiedLogin(token) {
    saveToken(token);
    const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { 'x-auth-token': token } });
    const meData = await meRes.json();
    saveUser(meData);
}

const verifyEmailForm = document.getElementById('verifyEmailForm');
if (verifyEmailForm) {
    verifyEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(verifyEmailForm);

        const otpInput = document.getElementById('verifyOtpInput');
        const btn = document.getElementById('verifyEmailBtn');
        const originalText = btn?.innerHTML;
        const otp = otpInput?.value.trim();

        if (!pendingVerificationEmail) {
            showToast('Please enter your email again.', 'error');
            return;
        }

        if (!/^\d{6}$/.test(otp || '')) {
            showFieldError(otpInput, 'Enter the 6-digit OTP.');
            return;
        }

        if (btn) setLoading(btn, true);

        try {
            const res = await fetch(`${API_BASE}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Could not verify email.');

            await finishVerifiedLogin(data.token);
            showToast('Email verified successfully! Redirecting...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } catch (err) {
            if (btn) setLoading(btn, false, originalText);
            showToast(err.message || 'Could not verify email.', 'error');
        }
    });
}

const resendVerifyOtpBtn = document.getElementById('resendVerifyOtpBtn');
if (resendVerifyOtpBtn) {
    resendVerifyOtpBtn.addEventListener('click', async () => {
        if (!pendingVerificationEmail) {
            showToast('Please enter your email again.', 'error');
            return;
        }

        const originalText = resendVerifyOtpBtn.innerHTML;
        resendVerifyOtpBtn.disabled = true;
        resendVerifyOtpBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

        try {
            const res = await fetch(`${API_BASE}/auth/resend-verification-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Could not resend OTP.');
            showToast(data.msg || 'Verification OTP sent.');
        } catch (err) {
            showToast(err.message || 'Could not resend OTP.', 'error');
        } finally {
            resendVerifyOtpBtn.disabled = false;
            resendVerifyOtpBtn.innerHTML = originalText;
        }
    });
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

            setLoading(btn, false, originalText);
            showToast(data.msg || 'Account created. Please verify your email.');
            openVerifyEmailModal(data.email || email);

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
            if (!res.ok) {
                if (data.verification_required) {
                    setLoading(btn, false, originalText);
                    showToast(data.msg || 'Please verify your email first.', 'error');
                    openVerifyEmailModal(data.email || email);
                    return;
                }
                throw new Error(data.msg || 'Invalid email or password.');
            }

            await finishVerifiedLogin(data.token);

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
    const imageInput = document.getElementById('productImage');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput && uploadArea && imagePreview) {
        imageInput.addEventListener('change', () => {
            const [file] = imageInput.files || [];

            if (!file) {
                imagePreview.removeAttribute('src');
                imagePreview.style.display = 'none';
                uploadArea.classList.remove('has-preview');
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            imagePreview.src = previewUrl;
            imagePreview.style.display = 'block';
            uploadArea.classList.add('has-preview');
            imagePreview.onload = () => URL.revokeObjectURL(previewUrl);
        });
    }

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

// ════════════════════════════════════════════
//  CHECKOUT FORM
//  POST /api/orders
// ════════════════════════════════════════════
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    renderCheckoutSummary();

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(checkoutForm);

        const token = getToken();
        const user = getUser();

        if (!token || !user) {
            showToast('You must be logged in to place an order.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const streetInput = document.getElementById('street');
        const cityInput = document.getElementById('city');
        const provinceInput = document.getElementById('province');
        const postalInput = document.getElementById('postal');
        const btn = checkoutForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        let hasError = false;

        if (!firstNameInput.value.trim()) {
            showFieldError(firstNameInput, 'First name is required.');
            hasError = true;
        }
        if (!lastNameInput.value.trim()) {
            showFieldError(lastNameInput, 'Last name is required.');
            hasError = true;
        }
        if (!streetInput.value.trim()) {
            showFieldError(streetInput, 'Street address is required.');
            hasError = true;
        }
        if (!cityInput.value.trim()) {
            showFieldError(cityInput, 'City is required.');
            hasError = true;
        }

        if (hasError) return;

        // Build full address string
        const delivery_address = [
            `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`,
            streetInput.value.trim(),
            cityInput.value.trim(),
            provinceInput?.value.trim(),
            postalInput?.value.trim(),
        ].filter(Boolean).join(', ');

        // Get cart from localStorage (Phase 5 will populate this dynamically)
        const cart = getCheckoutCart();

        if (cart.length === 0) {
            showToast('Your cart is empty. Add items before checking out.', 'error');
            return;
        }

        const total_amount = getCartTotal(cart);

        const payload = {
            buyer_id: user._id,
            delivery_address,
            total_amount,
            items: cart.map(item => ({
                product_id: item.product_id,
                seller_id: item.seller_id,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        setLoading(btn, true);

        try {
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.msg || 'Failed to place order.');

            localStorage.removeItem('cart');

            showToast('Order placed successfully!');
            setTimeout(() => { window.location.href = 'my-orders.html'; }, 1500);

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Something went wrong. Try again.', 'error');
        }
    });
}

function getCheckoutCart() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
        return [];
    }
}

function getCartTotal(cart) {
    return cart.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        return sum + (price * quantity);
    }, 0);
}

function formatPeso(value) {
    return `PHP ${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));
}

function renderCheckoutSummary() {
    const summaryItemsEl = document.getElementById('checkoutSummaryItems');
    const totalEl = document.getElementById('checkoutTotal')
        || document.querySelector('.order-summary .summary-total span:last-child');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    let placeOrderTextEl = document.getElementById('placeOrderTotal');
    if (!summaryItemsEl || !totalEl || !placeOrderBtn) return;
    if (!placeOrderTextEl) {
        placeOrderBtn.innerHTML = '<i class="bi bi-bag-check-fill me-2"></i>Place Order &middot; <span id="placeOrderTotal">PHP 0.00</span>';
        placeOrderTextEl = document.getElementById('placeOrderTotal');
    }

    const cart = getCheckoutCart();
    const total = getCartTotal(cart);

    if (cart.length === 0) {
        summaryItemsEl.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-cart-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No selected items yet.</p>
                <a href="cart.html" class="btn-green mt-2" style="padding:.5rem 1.25rem;">Go to Cart</a>
            </div>`;
    } else {
        summaryItemsEl.innerHTML = cart.map((item) => {
            const name = escapeHtml(item.name || 'Selected product');
            const size = item.size ? `<div style="font-size:.75rem;color:var(--text-muted);">Size: ${escapeHtml(item.size)}</div>` : '';
            const quantity = Number(item.quantity || 1);
            const lineTotal = Number(item.price || 0) * quantity;

            return `
                <div style="display:flex;align-items:center;gap:.75rem;">
                    <div style="flex:1">
                        <div style="font-weight:600;font-size:.9rem;">${name}</div>
                        ${size}
                        <div style="font-size:.8rem;color:var(--text-muted);">x${quantity}</div>
                    </div>
                    <span style="font-weight:700;">${formatPeso(lineTotal)}</span>
                </div>`;
        }).join('');
    }

    totalEl.textContent = formatPeso(total);
    placeOrderTextEl.textContent = formatPeso(total);
}

// ════════════════════════════════════════════
//  ADD TO CART
//  POST /api/cart/add
//  Phase 5 will call this once products display.
//  Function is ready and exported for use.
// ════════════════════════════════════════════
async function addToCart(productId, sellerId, price, quantity = 1, details = {}) {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        showToast('You must be logged in to add items to cart.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return;
    }

    try {
        // Get or create user cart first
        const cartRes = await fetch(`${API_BASE}/cart/${user._id}`, {
            headers: { 'x-auth-token': token },
        });
        const cartData = await cartRes.json();
        const cart = cartData?.cart;

        if (!cart?._id) {
            throw new Error('Could not open your cart.');
        }

        // Add item
        const res = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                cart_id: cart._id,
                product_id: productId,
                quantity,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Failed to add to cart.');

        // Also mirror to localStorage so checkout can read it
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = localCart.find(i => i.product_id === productId);
        if (existing) {
            existing.quantity += quantity;
            existing.name = existing.name || details.name || 'Selected product';
            existing.size = existing.size || details.size || '';
            existing.image_url = existing.image_url || details.image_url || '';
        } else {
            localCart.push({
                product_id: productId,
                seller_id: sellerId,
                name: details.name || 'Selected product',
                size: details.size || '',
                image_url: details.image_url || '',
                price,
                quantity,
            });
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        window.dispatchEvent(new Event('cart-updated'));

        showToast('Item added to cart!');

    } catch (err) {
        showToast(err.message || 'Could not add to cart.', 'error');
    }
}

// ════════════════════════════════════════════
//  EDIT PROFILE FORM
//  PUT /api/users/:id
// ════════════════════════════════════════════
const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(editProfileForm);

        const token = getToken();
        const user = getUser();

        if (!token || !user) {
            showToast('You must be logged in.', 'error');
            return;
        }

        const nameInput = editProfileForm.querySelector('[name="name"]');
        const emailInput = editProfileForm.querySelector('[name="email"]');
        const phoneInput = editProfileForm.querySelector('[name="phone"]');
        const btn = editProfileForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        let hasError = false;

        if (!nameInput.value.trim()) {
            showFieldError(nameInput, 'Name is required.');
            hasError = true;
        }
        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            showFieldError(emailInput, 'Please enter a valid email address.');
            hasError = true;
        }

        if (hasError) return;

        setLoading(btn, true);

        try {
            const res = await fetch(`${API_BASE}/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput?.value.trim() || '',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.msg || 'Failed to update profile.');

            saveUser({ ...user, ...data });

            if (typeof populateProfile === 'function') {
                populateProfile({ ...user, ...data });
            }

            showToast('Profile updated successfully!');

            // Close Bootstrap modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            if (modal) modal.hide();

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Could not update profile.', 'error');
        }
    });
}
