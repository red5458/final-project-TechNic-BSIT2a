/* ============================================
   UNIFORMITY - api.js
   Phase 4: Form Submission & Data Insertion
   ============================================ */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';


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

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutCart');
    localStorage.removeItem('cartItemCount');
    localStorage.removeItem('orderBadgeCounts');
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}

async function validateStoredSession() {
    const token = getToken();
    if (!token) {
        clearSession();
        return false;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'x-auth-token': token },
            cache: 'no-store',
        });

        if (!res.ok) {
            clearSession();
            return false;
        }

        const user = await res.json();
        if (!user?._id) {
            clearSession();
            return false;
        }

        saveUser(user);
        return true;
    } catch {
        clearSession();
        return false;
    }
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

async function finishLogin(token) {
    saveToken(token);
    const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { 'x-auth-token': token } });
    if (!meRes.ok) {
        clearSession();
        throw new Error('Login session could not be verified.');
    }
    const meData = await meRes.json();
    saveUser(meData);
}

// ============================================
//  REGISTER FORM
//  POST /api/auth/register
// ============================================
const registerForm = document.getElementById('registerForm');
const verifyOtpForm = document.getElementById('verifyOtpForm');
let pendingVerificationEmail = '';

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

            if (data.requiresVerification) {
                pendingVerificationEmail = data.email || email;
                const emailLabel = document.getElementById('otpEmailLabel');
                if (emailLabel) emailLabel.textContent = pendingVerificationEmail;

                registerForm.style.display = 'none';
                if (verifyOtpForm) verifyOtpForm.style.display = 'block';
                showToast('OTP sent. Please check your email.');
                return;
            }

            if (data.token) {
                await finishLogin(data.token);
                showToast('Account created successfully! Redirecting...');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            }

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Something went wrong. Try again.', 'error');
        }
    });
}

if (verifyOtpForm) {
    verifyOtpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors(verifyOtpForm);

        const otpInput = verifyOtpForm.querySelector('[name="otp"]');
        const btn = document.getElementById('verifyOtpBtn');
        const originalText = btn.innerHTML;
        const otp = otpInput.value.trim();

        if (!/^\d{6}$/.test(otp)) {
            showFieldError(otpInput, 'Enter the 6-digit OTP from your email.');
            return;
        }

        setLoading(btn, true);

        try {
            const res = await fetch(`${API_BASE}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'OTP verification failed.');

            await finishLogin(data.token);
            showToast('Email verified! Redirecting...');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Could not verify OTP.', 'error');
        }
    });
}

const resendOtpBtn = document.getElementById('resendOtpBtn');
if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', async () => {
        if (!pendingVerificationEmail) {
            showToast('Register first so we know where to send the OTP.', 'error');
            return;
        }

        const originalText = resendOtpBtn.innerHTML;
        resendOtpBtn.disabled = true;
        resendOtpBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

        try {
            const res = await fetch(`${API_BASE}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Could not resend OTP.');

            showToast('A new OTP has been sent.');
        } catch (err) {
            showToast(err.message || 'Could not resend OTP.', 'error');
        } finally {
            resendOtpBtn.disabled = false;
            resendOtpBtn.innerHTML = originalText;
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

            await finishLogin(data.token);

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
    prefillCheckoutDetails();

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

        const nameInput = document.getElementById('checkoutName');
        const streetInput = document.getElementById('street');
        const cityInput = document.getElementById('city');
        const provinceInput = document.getElementById('province');
        const postalInput = document.getElementById('postal');
        const phoneInput = document.getElementById('phone');
        const notesInput = document.getElementById('notes');
        const btn = checkoutForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        let hasError = false;

        if (!nameInput.value.trim()) {
            showFieldError(nameInput, 'Name is required.');
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

        const checkoutDetails = {
            name: nameInput.value.trim(),
            street: streetInput.value.trim(),
            city: cityInput.value.trim(),
            province: provinceInput?.value.trim() || '',
            postal: postalInput?.value.trim() || '',
            phone: phoneInput?.value.trim() || '',
            notes: notesInput?.value.trim() || '',
        };

        saveCheckoutDetails(checkoutDetails);

        const delivery_address = [
            checkoutDetails.name,
            checkoutDetails.street,
            checkoutDetails.city,
            checkoutDetails.province,
            checkoutDetails.postal,
            checkoutDetails.notes ? `Notes: ${checkoutDetails.notes}` : '',
        ].filter(Boolean).join(', ');

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

            localStorage.removeItem('checkoutCart');
            localStorage.setItem('cartItemCount', '0');
            window.dispatchEvent(new Event('cart-updated'));

            showToast('Order placed successfully!');
            setTimeout(() => { window.location.href = 'my-orders.html'; }, 1500);

        } catch (err) {
            setLoading(btn, false, originalText);
            showToast(err.message || 'Something went wrong. Try again.', 'error');
        }
    });
}

function getCheckoutDetailsKey(user = getUser()) {
    return user?._id ? `checkoutDeliveryDetails:${user._id}` : 'checkoutDeliveryDetails';
}

function getSavedCheckoutDetails() {
    try {
        return JSON.parse(localStorage.getItem(getCheckoutDetailsKey()) || '{}');
    } catch {
        return {};
    }
}

function saveCheckoutDetails(details) {
    localStorage.setItem(getCheckoutDetailsKey(), JSON.stringify(details));
}

function prefillCheckoutDetails() {
    const user = getUser();
    const saved = getSavedCheckoutDetails();
    const defaults = {
        name: saved.name || user?.name || '',
        phone: saved.phone || user?.phone || '',
        street: saved.street || '',
        city: saved.city || '',
        province: saved.province || '',
        postal: saved.postal || '',
        notes: saved.notes || '',
    };

    Object.entries({
        checkoutName: defaults.name,
        phone: defaults.phone,
        street: defaults.street,
        city: defaults.city,
        province: defaults.province,
        postal: defaults.postal,
        notes: defaults.notes,
    }).forEach(([id, value]) => {
        const field = document.getElementById(id);
        if (field && !field.value && value) field.value = value;
    });
}

function getCheckoutCart() {
    try {
        return JSON.parse(localStorage.getItem('checkoutCart') || localStorage.getItem('cart') || '[]');
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

        const updatedCartRes = await fetch(`${API_BASE}/cart/${user._id}`, {
            headers: { 'x-auth-token': token },
        });
        const updatedCartData = updatedCartRes.ok ? await updatedCartRes.json() : { items: [] };
        const updatedItems = Array.isArray(updatedCartData.items) ? updatedCartData.items : [];

        const localCart = updatedItems.map((item) => {
            const product = item.product_id || {};
            return {
                product_id: product._id || item.product_id || productId,
                seller_id: product.seller_id?._id || product.seller_id || sellerId,
                name: product.name || details.name || 'Selected product',
                size: product.size || details.size || '',
                image_url: product.image_url || details.image_url || '',
                price: Number(product.price ?? price ?? 0),
                quantity: Number(item.quantity || 0),
            };
        });

        const cartCount = updatedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        localStorage.setItem('cart', JSON.stringify(localCart));
        localStorage.setItem('cartItemCount', String(cartCount));
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
