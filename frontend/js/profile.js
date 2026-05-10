/* ============================================
   UNIFORMITY - profile.js
   Profile details, stats, and recent orders
   ============================================ */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toFixed(2)}`;
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
        setText('profileStatOrdersReceived', stats.ordersReceived ?? 0);
        setText('profileStatSpent', formatCurrency(stats.totalSpent));
        setText('profileStatEarned', formatCurrency(stats.totalEarned));
    } catch {
        setText('profileStatOrders', '0');
        setText('profileStatListings', '0');
        setText('profileStatOrdersReceived', '0');
        setText('profileStatSpent', formatCurrency(0));
        setText('profileStatEarned', formatCurrency(0));
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
            const firstItem = order.items?.[0];
            const imageItem = order.items?.find((item) => item.product_id?.image_url) || firstItem;
            const firstName = firstItem?.product_id?.name || 'Order Item';
            const extraCount = (order.items?.length || 1) - 1;
            const extraText = extraCount > 0
                ? ` <span style="font-weight:400;font-size:.85rem;color:var(--text-muted);">(+${extraCount} other item/s)</span>`
                : '';
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
            const imageUrl = imageItem?.product_id?.image_url || '';
            const imgHTML = imageUrl
                ? `<img src="${imageUrl}" alt="${imageItem?.product_id?.name || 'Order item'}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=&quot;bi bi-image&quot;></i>';" />`
                : `<i class="bi bi-image"></i>`;

            return `
                <article class="order-card profile-order-preview"
                    onclick="window.location.href='my-order-details.html?id=${order._id}'">
                    <div class="d-flex gap-3">
                        <div class="profile-order-thumb">
                            ${imgHTML}
                        </div>
                        <div class="flex-grow-1 d-flex flex-column justify-content-center min-width-0">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="profile-order-id">Order ID: #${shortId}</span>
                                <span class="status-badge ${statusCls}">${statusTxt}</span>
                            </div>
                            <div class="profile-order-title">
                                ${firstName}${extraText}
                            </div>
                            <div class="d-flex justify-content-between align-items-end mt-auto profile-order-meta-row">
                                <div class="profile-order-date">Placed on ${placedOn}</div>
                                <strong class="profile-order-total">${total}</strong>
                            </div>
                        </div>
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
