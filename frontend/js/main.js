/* ============================================
   UNIFORMITY - main.js
   Phase 5: Auth Guard, Sidebar, Logout,
            Category Filter, Profile Dropdown
   ============================================ */

// ─── Page Classification ──────────────────────
const PUBLIC_PAGES = ['index.html', 'login.html', 'register.html'];
const SEMI_PUBLIC_PAGES = ['dashboard.html', 'product-detail.html'];

function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}
function isPublicPage() {
    return PUBLIC_PAGES.includes(currentPage()) || SEMI_PUBLIC_PAGES.includes(currentPage());
}
function isLoggedIn() {
    return Boolean(localStorage.getItem('token') && getUser());
}

// ─── Auth Guard ───────────────────────────────
function enforceAuth() {
    if (isPublicPage()) return;
    const token = localStorage.getItem('token');
    const user = getUser();
    if (!token || !user) window.location.href = 'login.html';
}

// ─── Sidebar Builder ──────────────────────────
function buildSidebar() {
    const placeholder = document.getElementById('sidebar-placeholder') || document.querySelector('.sidebar');
    if (!placeholder) return;

    const user = getUser();
    const displayName = user?.name || '';
    const avatarInitial = (displayName || 'U').charAt(0).toUpperCase();

    // product-detail is visually under Browse Uniforms
    const active = currentPage() === 'product-detail.html' ? 'dashboard.html' : currentPage();

    const links = [
        { href: 'dashboard.html', icon: 'bi-grid-fill', text: 'Browse Uniforms' },
        { href: 'cart.html', icon: 'bi-cart-fill', text: 'My Cart', extra: 'cart-link' },
        { href: 'my-orders.html', icon: 'bi-bag-fill', text: 'My Orders', badge: 'orders' },
        { href: 'my-listings.html', icon: 'bi-tags-fill', text: 'My Listings', badge: 'seller-orders' },
        { href: 'add-listing.html', icon: 'bi-plus-circle-fill', text: 'Add Listing' },
    ];

    if (getUser()?.role === 'admin') {
        links.push({ href: 'admin.html', icon: 'bi-shield-lock-fill', text: 'Admin Panel' });
    }

    const navHTML = links.map(l => {
        if (l.section) return `<div class="sidebar-label">${l.section}</div>`;
        const isActive = active === l.href ? 'active' : '';
        const extraClass = l.extra || '';
        let badgeHTML = '';
        if (l.href === 'cart.html') {
            badgeHTML = `<span class="cart-count-badge" data-cart-count style="display:none;margin-left:auto;background:var(--accent);color:var(--primary-dark);font-size:.72rem;font-weight:700;min-width:20px;height:20px;padding:0 .35rem;border-radius:999px;align-items:center;justify-content:center;"></span>`;
        } else if (l.badge === 'orders') {
            badgeHTML = `<span class="nav-count-badge" data-buyer-order-count style="display:none;margin-left:auto;background:#dc2626;color:#fff;font-size:.72rem;font-weight:800;min-width:20px;height:20px;padding:0 .35rem;border-radius:999px;align-items:center;justify-content:center;"></span>`;
        } else if (l.badge === 'seller-orders') {
            badgeHTML = `<span class="nav-count-badge" data-seller-order-count style="display:none;margin-left:auto;background:#dc2626;color:#fff;font-size:.72rem;font-weight:800;min-width:20px;height:20px;padding:0 .35rem;border-radius:999px;align-items:center;justify-content:center;"></span>`;
        }
        return `<a href="${l.href}" class="sidebar-link ${isActive} ${extraClass}">
                    <i class="bi ${l.icon}"></i> ${l.text}${badgeHTML}
                </a>`;
    }).join('');

    const aside = document.createElement('aside');
    aside.className = 'sidebar';
    aside.innerHTML = `
        <a class="sidebar-logo" href="dashboard.html" aria-label="Go to dashboard">
            <img src="img/logo.png" alt="Logo"
                style="width:28px;height:28px;object-fit:contain;border-radius:6px;margin-right:.5rem;vertical-align:middle;" />
            Uniformity
        </a>
        <nav class="sidebar-nav">${navHTML}</nav>
        <div class="sidebar-footer" ${user ? '' : 'style="display:none;"'}>
            <a href="profile.html" class="sidebar-user" aria-label="Open profile">
                <div class="user-avatar">${escapeSidebarText(avatarInitial)}</div>
                <div class="user-info"><strong>${escapeSidebarText(displayName || 'Account')}</strong></div>
            </a>
            <a href="#" class="sidebar-logout logout-link">
                <i class="bi bi-box-arrow-left"></i><span>Log Out</span>
            </a>
        </div>`;
    placeholder.replaceWith(aside);
}

function escapeSidebarText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[char]));
}

function getCartCount() {
    try {
        const savedCount = localStorage.getItem('cartItemCount');
        if (savedCount !== null) return Number(savedCount || 0);

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    } catch {
        return 0;
    }
}

function ensureTopbarCartBadge() {
    document.querySelectorAll('.topbar-actions a[href="cart.html"]').forEach((link) => {
        if (link.querySelector('[data-cart-count]')) return;

        link.style.position = 'relative';
        const badge = document.createElement('span');
        badge.setAttribute('data-cart-count', '');
        badge.style.cssText = `
            display:none; position:absolute; top:-6px; right:-6px;
            background:var(--accent); color:var(--primary-dark);
            min-width:18px; height:18px; padding:0 .3rem;
            border-radius:999px; font-size:.7rem; font-weight:700;
            align-items:center; justify-content:center;`;
        link.appendChild(badge);
    });
}

function updateCartCountBadges() {
    ensureTopbarCartBadge();
    const count = getCartCount();

    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.style.display = 'inline-flex';
        } else {
            badge.textContent = '';
            badge.style.display = 'none';
        }
    });
}

function setBadgeCount(selector, count) {
    document.querySelectorAll(selector).forEach((badge) => {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.style.display = 'inline-flex';
        } else {
            badge.textContent = '';
            badge.style.display = 'none';
        }
    });
}

function getCachedOrderCounts() {
    try {
        return JSON.parse(localStorage.getItem('orderBadgeCounts') || '{}');
    } catch {
        return {};
    }
}

function setCachedOrderCounts(counts) {
    localStorage.setItem('orderBadgeCounts', JSON.stringify(counts));
}

function applyCachedOrderBadges() {
    const counts = getCachedOrderCounts();
    setBadgeCount('[data-buyer-order-count]', Number(counts.buyer || 0));
    setBadgeCount('[data-seller-order-count]', Number(counts.seller || 0));
}

async function updateOrderCountBadges() {
    const token = localStorage.getItem('token');
    const user = getUser();
    if (!token || !user?._id) {
        setBadgeCount('[data-buyer-order-count]', 0);
        setBadgeCount('[data-seller-order-count]', 0);
        localStorage.removeItem('orderBadgeCounts');
        return;
    }

    const nextCounts = getCachedOrderCounts();

    try {
        const buyerRes = await fetch(`${API_BASE}/orders`, {
            headers: { 'x-auth-token': token }
        });
        const buyerOrders = buyerRes.ok ? await buyerRes.json() : [];
        const activeBuyerOrders = (buyerOrders || []).filter((order) =>
            !['delivered', 'cancelled'].includes(order.status)
        ).length;
        setBadgeCount('[data-buyer-order-count]', activeBuyerOrders);
        nextCounts.buyer = activeBuyerOrders;
    } catch {
        setBadgeCount('[data-buyer-order-count]', Number(nextCounts.buyer || 0));
    }

    try {
        const sellerRes = await fetch(`${API_BASE}/orders/seller/${user._id}`, {
            headers: { 'x-auth-token': token }
        });
        const sellerOrders = sellerRes.ok ? await sellerRes.json() : [];
        const pendingSellerItems = (sellerOrders || []).reduce((sum, order) => {
            const pendingItems = (order.items || []).filter((item) => item.status !== 'fulfilled').length;
            return sum + pendingItems;
        }, 0);
        setBadgeCount('[data-seller-order-count]', pendingSellerItems);
        nextCounts.seller = pendingSellerItems;
    } catch {
        setBadgeCount('[data-seller-order-count]', Number(nextCounts.seller || 0));
    }

    setCachedOrderCounts(nextCounts);
}

// ─── Sidebar User Population ──────────────────
function populateSidebarUser() {
    const user = getUser();
    const footer = document.querySelector('.sidebar-footer');

    if (!user) {
        // Guest on semi-public page — hide sidebar footer
        if (footer) footer.style.display = 'none';
        return;
    }

    const nameEl = document.querySelector('.sidebar-user .user-info strong');
    const avatarEl = document.querySelector('.sidebar-user .user-avatar');
    if (nameEl) nameEl.textContent = user.name || 'Student';
    if (avatarEl) avatarEl.textContent = (user.name || 'S').charAt(0).toUpperCase();
}

// ─── Logout Handler ───────────────────────────
function initLogout() {
    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            logout();
        });
    });
}

// ─── Category Filter (dashboard only) ────────
async function initCategoryFilter() {
    const sel = document.getElementById('filterCategory');
    if (!sel) return;
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();
        sel.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat._id;
            opt.textContent = cat.name;
            sel.appendChild(opt);
        });
    } catch {
        // silently fail — "All Categories" default stays
    }
}

// ─── Mobile Sidebar Toggle ────────────────────
function initMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (!toggle || !sidebar) return;

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    };

    const openSidebar = () => {
        sidebar.classList.add('open');
        backdrop.classList.add('show');
        document.body.classList.add('sidebar-open');
    };

    toggle.addEventListener('click', e => {
        e.stopPropagation();
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    backdrop.addEventListener('click', closeSidebar);

    document.addEventListener('click', e => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !toggle.contains(e.target)) {
            closeSidebar();
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    sidebar.querySelectorAll('.sidebar-link, .sidebar-user, .sidebar-logout').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) closeSidebar();
        });
    });
}

// ─── Profile Dropdown ─────────────────────────
function initProfileDropdown() {
    const btn = document.getElementById('profileTopBtn');
    if (!btn) return;

    const user = getUser();

    const dropdown = document.createElement('div');
    dropdown.id = 'profileDropdown';
    dropdown.style.cssText = `
        display:none; position:absolute; top:calc(100% + 8px); right:0;
        background:#fff; border:1px solid var(--border);
        border-radius:var(--radius); box-shadow:0 8px 24px rgba(0,0,0,.1);
        min-width:220px; z-index:9999; padding:.5rem 0;
        font-family:Poppins,sans-serif;`;

    dropdown.innerHTML = `
        <div style="padding:.75rem 1rem .5rem;border-bottom:1px solid var(--border);margin-bottom:.25rem;">
            <div style="font-weight:700;font-size:.9rem;color:var(--text);">
                ${user?.name || 'Guest'}
            </div>
            <div style="font-size:.78rem;color:var(--text-muted);">
                ${user?.email || ''}
            </div>
        </div>
        <a href="profile.html"
            style="display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;font-size:.85rem;color:var(--text);text-decoration:none;"
            onmouseover="this.style.background='var(--bg-soft)'"
            onmouseout="this.style.background='transparent'">
            <i class="bi bi-person-fill"></i> My Profile
        </a>
        <a href="#" class="dropdown-logout"
            style="display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;font-size:.85rem;color:#dc2626;text-decoration:none;"
            onmouseover="this.style.background='var(--bg-soft)'"
            onmouseout="this.style.background='transparent'">
            <i class="bi bi-box-arrow-left"></i> Log Out
        </a>`;

    btn.style.position = 'relative';
    btn.appendChild(dropdown);

    // Toggle
    btn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close on outside click
    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    // Logout inside dropdown
    dropdown.querySelector('.dropdown-logout').addEventListener('click', e => {
        e.preventDefault();
        logout();
    });
}

// ─── Boot ─────────────────────────────────────
function initModalLayoutStabilizer() {
    const setModalScrollbarGap = () => {
        const gap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
        document.documentElement.classList.add('modal-scroll-locked');
        document.documentElement.style.setProperty('--modal-scrollbar-gap', `${gap}px`);
        document.querySelectorAll('.topbar').forEach((el) => {
            if (!el.style.getPropertyValue('--topbar-modal-padding-right')) {
                el.style.setProperty('--topbar-modal-padding-right', window.getComputedStyle(el).paddingRight);
            }
        });
    };

    const clearModalScrollbarGap = () => {
        document.documentElement.classList.remove('modal-scroll-locked');
        document.documentElement.style.removeProperty('--modal-scrollbar-gap');
        document.body.style.removeProperty('padding-right');
        document.querySelectorAll('.topbar').forEach((el) => {
            el.style.removeProperty('--topbar-modal-padding-right');
            el.style.removeProperty('padding-right');
        });
    };

    document.addEventListener('show.bs.modal', setModalScrollbarGap);
    document.addEventListener('hidden.bs.modal', clearModalScrollbarGap);
}

function runWhenIdle(callback, timeout = 700) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout });
    } else {
        setTimeout(callback, 120);
    }
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(() => {
                // PWA install still fails gracefully if service workers are unavailable.
            });
    };

    if (document.readyState === 'complete') {
        register();
    } else {
        window.addEventListener('load', register, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const hadSavedSession = Boolean(localStorage.getItem('token') || getUser());
    buildSidebar();
    enforceAuth();
    populateSidebarUser();
    initLogout();
    initCategoryFilter();
    initMobileNav();
    initProfileDropdown();
    initModalLayoutStabilizer();
    updateCartCountBadges();
    applyCachedOrderBadges();
    registerServiceWorker();

    if (hadSavedSession) {
        runWhenIdle(async () => {
            const sessionValid = await validateStoredSession();
            if (!sessionValid && !isPublicPage()) {
                window.location.href = 'login.html';
                return;
            }
            if (sessionValid) populateSidebarUser();
        });
    }

    runWhenIdle(updateOrderCountBadges, 1200);
});

window.addEventListener('storage', (event) => {
    if (event.key === 'cart') updateCartCountBadges();
});

window.addEventListener('cart-updated', updateCartCountBadges);
window.addEventListener('orders-updated', updateOrderCountBadges);
