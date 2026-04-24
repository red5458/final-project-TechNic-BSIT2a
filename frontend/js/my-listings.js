/* ============================================
   UNIFORMITY - my-listings.js
   Seller listings and incoming orders
   ============================================ */

function formatCurrency(value) {
    return `PHP ${Number(value || 0).toFixed(2)}`;
}

async function loadSellerStats() {
    const user = getUser();
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    try {
        const res = await fetch(`${API_BASE}/users/${user._id}/stats`, {
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error();

        const stats = await res.json();
        const ordersReceivedEl = document.getElementById('statOrdersReceived');
        const totalEarnedEl = document.getElementById('statTotalEarned');

        if (ordersReceivedEl) ordersReceivedEl.textContent = stats.ordersReceived ?? 0;
        if (totalEarnedEl) totalEarnedEl.textContent = formatCurrency(stats.totalEarned);
    } catch {
        const ordersReceivedEl = document.getElementById('statOrdersReceived');
        const totalEarnedEl = document.getElementById('statTotalEarned');

        if (ordersReceivedEl) ordersReceivedEl.textContent = '0';
        if (totalEarnedEl) totalEarnedEl.textContent = formatCurrency(0);
    }
}

async function loadMyListings() {
    const user = getUser();
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    const tbody = document.getElementById('listingsTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 loading-cell">
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6rem;width:100%;">
                <div class="spinner-border spinner-border-sm text-success"></div>
                <span class="text-muted" style="font-size:.85rem;">Loading...</span>
            </div>
        </td></tr>`;
    }

    try {
        const res = await fetch(`${API_BASE}/products?seller=${user._id}`, {
            headers: { 'x-auth-token': token }
        });
        const products = await res.json();

        renderListingsTable(products);
        updateListingStats(products);
    } catch {
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
                Could not load listings.
            </td></tr>`;
        }
    }
}

function renderListingsTable(products) {
    const tbody = document.getElementById('listingsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
            You have no listings yet.
            <a href="add-listing.html" class="ms-2" style="color:var(--primary);font-weight:600;">Add one now</a>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = products.map((product) => {
        const category = product.category_id?.name || '-';
        const statusCls = product.quantity > 0 ? 'status-available' : 'status-sold';
        const statusTxt = product.quantity > 0 ? 'Available' : 'Sold Out';

        return `
            <tr>
                <td data-label="Product">
                    <span style="font-weight:600;font-size:.9rem;">${product.name}</span>
                </td>
                <td data-label="Category">${category}</td>
                <td data-label="Size"><span class="product-size">${product.size || '-'}</span></td>
                <td data-label="Qty">${product.quantity ?? 0}</td>
                <td data-label="Price"><strong>${formatCurrency(product.price)}</strong></td>
                <td data-label="Status">
                    <span class="status-badge ${statusCls}">${statusTxt}</span>
                </td>
                <td data-label="Actions">
                    <div class="d-flex gap-1 flex-wrap">
                        <button class="btn-sm-action btn-edit" title="Edit" onclick="openEditModal('${product._id}')">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn-sm-action btn-delete" title="Delete" onclick="confirmDelete('${product._id}', this)">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function updateListingStats(products) {
    const listedEl = document.getElementById('statTotalListed');
    if (listedEl) listedEl.textContent = products.length;
}

async function loadIncomingOrders() {
    const user = getUser();
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 loading-cell">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6rem;width:100%;">
            <div class="spinner-border spinner-border-sm text-success"></div>
            <span class="text-muted" style="font-size:.85rem;">Loading orders...</span>
        </div>
    </td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/orders/seller/${user._id}`, {
            headers: { 'x-auth-token': token }
        });
        const orders = await res.json();
        renderIncomingOrders(orders);
    } catch {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">
            Could not load incoming orders.
        </td></tr>`;
    }
}

function renderIncomingOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">
            No incoming orders yet.
        </td></tr>`;
        return;
    }

    const rows = [];
    orders.forEach((order) => {
        (order.items || []).forEach((item) => {
            rows.push({ order, item });
        });
    });

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">
            No incoming orders yet.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(({ order, item }) => {
        const productName = item.product_id?.name || 'Unknown Item';
        const buyerName = order.buyer_id?.name || 'Buyer';
        const total = formatCurrency(item.price * item.quantity);
        const statusCls = item.status === 'fulfilled' ? 'status-available' : 'status-pending';
        const statusTxt = item.status === 'fulfilled' ? 'Fulfilled' : 'Pending';

        const actionBtn = item.status !== 'fulfilled'
            ? `<button class="btn-green"
                    style="padding:.3rem .9rem;font-size:.78rem;border-radius:var(--radius-sm);"
                    onclick="markFulfilled('${order._id}', '${item._id}', this)">
                    <i class="bi bi-check-lg me-1"></i>Mark Fulfilled
               </button>`
            : `<span class="status-badge status-available" style="font-size:.75rem;">Done</span>`;

        return `
            <tr>
                <td data-label="Item">${productName}</td>
                <td data-label="Buyer">${buyerName}</td>
                <td data-label="Qty">${item.quantity}</td>
                <td data-label="Total"><strong>${total}</strong></td>
                <td data-label="Status"><span class="status-badge ${statusCls}">${statusTxt}</span></td>
                <td data-label="Action">${actionBtn}</td>
            </tr>`;
    }).join('');
}

function markFulfilled() {
    showToast('Mark fulfilled will be implemented in Phase 6.', 'error');
}

function openEditModal() {
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    loadSellerStats();
    loadMyListings();
    loadIncomingOrders();
});
