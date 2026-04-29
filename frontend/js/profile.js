/* ============================================
   UNIFORMITY - profile.js
   Profile details, stats, and recent orders
   ============================================ */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatCurrency(value) {
    return `PHP ${Number(value || 0).toFixed(2)}`;
}

function populateProfile() {
    const user = getUser();
    if (!user) return;

    const initial = (user.name || 'U').charAt(0).toUpperCase();
    const createdAt = user.createdAt || user.created_at;
    const memberDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })
        : '-';

    setText('profileAvatarLg', initial);
    setText('profileName', user.name || '-');
    setText('profileEmail', user.email || '-');
    setText('profileMemberDate', memberDate ? `Member since ${memberDate}` : '');

    setText('profileDetailName', user.name || '-');
    setText('profileDetailEmail', user.email || '-');
    setText('profileDetailSince', memberDate || '-');
    setText('profileDetailPhone', user.phone || 'Not provided');

    const nameInput = document.getElementById('profileNameInput');
    const emailInput = document.getElementById('profileEmailInput');
    const phoneInput = document.getElementById('profilePhoneInput');
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    const popupAvatar = document.querySelector('#userPopup .user-avatar');
    if (popupAvatar) popupAvatar.textContent = initial;
}

async function loadProfileStats() {
    const token = localStorage.getItem('token');
    const user = getUser();
    if (!token || !user?._id) return;

    try {
        const res = await fetch(`${API_BASE}/users/${user._id}/stats`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) throw new Error();

        const stats = await res.json();

        setText('profileStatOrders', stats.ordersPlaced ?? 0);
        setText('profileStatListings', stats.activeListings ?? 0);
        setText('profileStatSpent', formatCurrency(stats.totalSpent));
        setText('profileStatEarned', formatCurrency(stats.totalEarned));

        setText('sellerSnapshotListings', `${stats.activeListings ?? 0} active`);
        setText('sellerSnapshotOrders', `${stats.ordersReceived ?? 0} received`);
        setText('sellerSnapshotEarned', formatCurrency(stats.totalEarned));
    } catch {
        setText('profileStatOrders', '0');
        setText('profileStatListings', '0');
        setText('profileStatSpent', formatCurrency(0));
        setText('profileStatEarned', formatCurrency(0));
        setText('sellerSnapshotListings', '0 active');
        setText('sellerSnapshotOrders', '0 received');
        setText('sellerSnapshotEarned', formatCurrency(0));
    }
}

async function loadRecentOrders() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const listEl = document.getElementById('recentOrdersList');
    if (!listEl) return;

    listEl.innerHTML = `<div class="state-center state-center-sm">
        <div class="spinner-border spinner-border-sm text-success"></div>
        <span class="text-muted" style="font-size:.85rem;">Loading recent orders...</span>
    </div>`;

    try {
        const res = await fetch(`${API_BASE}/orders`, {
            headers: { 'x-auth-token': token }
        });
        const orders = await res.json();

        setText('profileStatOrders', orders.length);

        if (orders.length === 0) {
            listEl.innerHTML = `<div class="state-center state-center-sm text-muted" style="font-size:.85rem;">No orders placed yet.</div>`;
            return;
        }

        const recent = orders.slice(0, 3);
        listEl.innerHTML = recent.map((order) => {
            const shortId = order._id.slice(-8).toUpperCase();
            const total = formatCurrency(order.total_amount);
            const orderDate = order.createdAt || order.created_at;
            const placedOn = orderDate
                ? new Date(orderDate).toLocaleDateString('en-PH', { dateStyle: 'medium' })
                : '-';
            const statusMap = {
                pending: 'status-pending',
                shipped: 'status-shipped',
                delivered: 'status-delivered',
                cancelled: 'status-sold',
            };
            const statusCls = statusMap[order.status] || 'status-pending';
            const statusTxt = order.status
                ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                : 'Pending';

            return `
                <article class="order-card">
                    <div class="order-card-top">
                        <div>
                            <div class="order-card-title">Order #${shortId}</div>
                            <div class="order-card-sub">Placed on ${placedOn}</div>
                        </div>
                        <span class="status-badge ${statusCls}">${statusTxt}</span>
                    </div>
                    <div class="order-card-grid">
                        <div class="order-data"><span>Total</span><strong>${total}</strong></div>
                        <div class="order-data">
                            <span>Delivery</span>
                            <strong style="font-size:.78rem;">${(order.delivery_address || '').split(',')[0] || '-'}</strong>
                        </div>
                    </div>
                    <div class="order-card-actions">
                        <a href="my-order-details.html?id=${order._id}" class="btn-green"
                            style="padding:.65rem 1rem;font-size:.82rem;">View Order</a>
                    </div>
                </article>`;
        }).join('');
    } catch {
        listEl.innerHTML = `<div class="state-center state-center-sm text-muted" style="font-size:.85rem;">Could not load recent orders.</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateProfile();
    loadProfileStats();
    loadRecentOrders();
});
