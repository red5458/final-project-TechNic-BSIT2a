/* ============================================
   UNIFORMITY - main.js
   Phase 5: Auth Guard, Sidebar Population,
            Mobile Nav, Logout
   ============================================ */

// ─── Public Pages (no auth required) ─────────
const PUBLIC_PAGES = ['index.html', 'login.html', 'register.html'];

function isPublicPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return PUBLIC_PAGES.includes(page);
}

// ─── Auth Guard ───────────────────────────────
// Redirects to login.html if user is not logged in
// and the current page is not a public page.
function enforceAuth() {
    if (isPublicPage()) return;

    const token = localStorage.getItem('token');
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    })();

    if (!token || !user) {
        window.location.href = 'login.html';
    }
}

// ─── Sidebar User Population ──────────────────
// Replaces the hardcoded "Student User" placeholder
// with the actual logged-in user's name and initial.
function populateSidebarUser() {
    if (isPublicPage()) return;

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    })();

    if (!user) return;

    // Set the name text
    const nameEl = document.querySelector('.sidebar-user .user-info strong');
    if (nameEl) nameEl.textContent = user.name || 'Student';

    // Set the avatar initial
    const avatarEl = document.querySelector('.sidebar-user .user-avatar');
    if (avatarEl) {
        const initial = (user.name || 'S').charAt(0).toUpperCase();
        avatarEl.textContent = initial;
    }
}

// ─── Logout Handler ───────────────────────────
// Wires all logout links to properly clear
// localStorage before redirecting.
function initLogout() {
    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('cart');
            window.location.href = 'login.html';
        });
    });
}

// ─── Category Filter Population ───────────────
// Fetches real categories from the backend and
// populates the #filterCategory dropdown on
// dashboard.html (mirrors the add-listing pattern).
async function initCategoryFilter() {
    const filterCategory = document.getElementById('filterCategory');
    if (!filterCategory) return; // not on dashboard, skip

    const API_BASE = 'http://localhost:5000/api';

    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();

        // Keep the "All Categories" default option
        filterCategory.innerHTML = '<option value="">All Categories</option>';

        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat._id;
            opt.textContent = cat.name;
            filterCategory.appendChild(opt);
        });
    } catch (err) {
        console.warn('Could not load categories for filter:', err.message);
    }
}

// ─── Mobile Sidebar Toggle ────────────────────
function initMobileNav() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (!mobileNavToggle || !sidebar) return;

    mobileNavToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !mobileNavToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

function initProfileDropdown() {
    const btn = document.getElementById('profileTopBtn');
    if (!btn) return;

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    })();

    // Build the dropdown element
    const dropdown = document.createElement('div');
    dropdown.id = 'profileDropdown';
    dropdown.style.cssText = `
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        min-width: 220px;
        z-index: 9999;
        padding: .5rem 0;
        font-family: Poppins, sans-serif;
    `;

    dropdown.innerHTML = `
        <div style="padding:.75rem 1rem .5rem; border-bottom:1px solid var(--border); margin-bottom:.25rem;">
            <div style="font-weight:700;font-size:.9rem;color:var(--text);">
                ${user?.name || 'Student'}
            </div>
            <div style="font-size:.78rem;color:var(--text-muted);">
                ${user?.email || ''}
            </div>
        </div>
        <a href="profile.html" style="display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;font-size:.85rem;color:var(--text);text-decoration:none;" 
           onmouseover="this.style.background='var(--bg-soft)'" 
           onmouseout="this.style.background='transparent'">
            <i class="bi bi-person-fill"></i> My Profile
        </a>
        <a href="#" class="logout-link" style="display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;font-size:.85rem;color:#dc2626;text-decoration:none;"
           onmouseover="this.style.background='var(--bg-soft)'" 
           onmouseout="this.style.background='transparent'">
            <i class="bi bi-box-arrow-left"></i> Log Out
        </a>
    `;

    // The button needs position:relative so dropdown positions correctly
    btn.style.position = 'relative';
    btn.appendChild(dropdown);

    // Toggle on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Close when clicking anywhere else on the page
    document.addEventListener('click', () => {
        dropdown.style.display = 'none';
    });

    // Re-wire logout inside dropdown (since initLogout runs before this)
    dropdown.querySelector('.logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        window.location.href = 'login.html';
    });
}

function buildSidebar(activePage) {
    const links = [
        { label: 'Buyer', type: 'section' },
        { href: 'dashboard.html', icon: 'bi-grid-fill', text: 'Browse Uniforms' },
        { href: 'cart.html', icon: 'bi-cart-fill', text: 'My Cart' },
        { href: 'my-orders.html', icon: 'bi-bag-fill', text: 'My Orders' },
        { label: 'Seller', type: 'section' },
        { href: 'my-listings.html', icon: 'bi-tags-fill', text: 'My Listings' },
        { href: 'add-listing.html', icon: 'bi-plus-circle-fill', text: 'Add Listing' },
        { label: 'Account', type: 'section' },
        { href: 'profile.html', icon: 'bi-person-fill', text: 'My Profile' },
        { href: '#', icon: 'bi-box-arrow-left', text: 'Log Out', extra: 'logout-link' },
    ];

    const navHTML = links.map(link => {
        if (link.type === 'section') {
            return `<div class="sidebar-label">${link.label}</div>`;
        }
        const isActive = activePage === link.href ? 'active' : '';
        const extraClass = link.extra || '';
        return `<a href="${link.href}" class="sidebar-link ${isActive} ${extraClass}">
                    <i class="bi ${link.icon}"></i> ${link.text}
                </a>`;
    }).join('');

    const aside = document.createElement('aside');
    aside.className = 'sidebar';
    aside.innerHTML = `
        <div class="sidebar-logo">
            <img src="img/logo.png" alt="Logo"
                style="width:28px;height:28px;object-fit:contain;border-radius:6px;margin-right:.5rem;vertical-align:middle;" />
            Uniformity
        </div>
        <nav class="sidebar-nav">${navHTML}</nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="user-avatar">U</div>
                <div class="user-info">
                    <strong>Student User</strong>
                </div>
            </div>
        </div>
    `;

    const placeholder = document.getElementById('sidebar-placeholder');
    if (placeholder) placeholder.replaceWith(aside);
}
// ─── Boot ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Get the current page filename e.g. "dashboard.html"
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    buildSidebar(currentPage);
    enforceAuth();           // 1. Redirect if not logged in
    populateSidebarUser();   // 2. Fill in real name + avatar initial
    initLogout();            // 3. Wire logout links to clear session
    initCategoryFilter();    // 4. Load real categories into filter dropdown
    initMobileNav();         // 5. Mobile sidebar toggle (preserved from Phase 3)
    initProfileDropdown();
});