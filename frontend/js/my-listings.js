/* ============================================
   UNIFORMITY - my-listings.js
   Seller listings and incoming orders
   ============================================ */

function formatCurrency(value) {
    return `PHP ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
    return value
        ? new Date(value).toLocaleDateString('en-PH', { dateStyle: 'medium' })
        : '-';
}

function shortOrderId(orderId) {
    return orderId ? `#${String(orderId).slice(-8).toUpperCase()}` : '-';
}

function sellerEscape(value) {
    return typeof escapeHtml === 'function'
        ? escapeHtml(value)
        : String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[char]));
}

let sellerListings = [];
let sellerOrders = [];
let listingCategories = [];
let editingProductId = null;
let deletingProductId = null;
let fulfillingOrderItem = null;

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
            <div class="state-center state-center-sm">
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
        sellerListings = Array.isArray(products) ? products : [];

        renderListingsTable(sellerListings);
        updateListingStats(sellerListings);
    } catch {
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
                <div class="state-center state-center-sm">Could not load listings.</div>
            </td></tr>`;
        }
    }
}

async function loadCategoriesForEdit(selectedCategoryId = '') {
    if (listingCategories.length === 0) {
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('Could not load categories.');
        listingCategories = await res.json();
    }

    const select = document.querySelector('#editForm [name="category_id"]');
    if (!select) return;

    select.innerHTML = '<option value="" disabled>Select a category</option>';
    listingCategories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        select.appendChild(option);
    });

    select.value = selectedCategoryId || '';
}

function renderListingsTable(products) {
    const tbody = document.getElementById('listingsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
            <div class="state-center state-center-sm">
                <i class="bi bi-tags fs-1 text-muted"></i>
                <span>You have no listings yet.</span>
                <a href="add-listing.html" style="color:var(--primary);font-weight:600;">Add one now</a>
            </div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = products.map((product) => {
        const category = sellerEscape(product.category_id?.name || '-');
        const name = sellerEscape(product.name || 'Untitled listing');
        const size = sellerEscape(product.size || '-');
        const image = product.image_url
            ? `<img src="${sellerEscape(product.image_url)}" alt="${name}" />`
            : `<i class="bi bi-image"></i>`;
        const statusCls = product.quantity > 0 ? 'status-available' : 'status-sold';
        const statusTxt = product.quantity > 0 ? 'Available' : 'Sold Out';
        const qty = Number(product.quantity ?? 0);
        const qtyClass = qty <= 0 ? 'seller-qty is-empty' : qty <= 3 ? 'seller-qty is-low' : 'seller-qty';

        return `
            <tr class="seller-table-row">
                <td data-label="Product">
                    <div class="seller-product-cell">
                        <div class="seller-product-thumb">${image}</div>
                        <div class="seller-product-copy">
                            <strong>${name}</strong>
                            <span>Listed product</span>
                        </div>
                    </div>
                </td>
                <td data-label="Category">${category}</td>
                <td data-label="Size"><span class="product-size">${size}</span></td>
                <td data-label="Qty"><span class="${qtyClass}">${qty}</span></td>
                <td data-label="Price"><strong class="seller-money">${formatCurrency(product.price)}</strong></td>
                <td data-label="Status">
                    <span class="status-badge ${statusCls}">${statusTxt}</span>
                </td>
                <td data-label="Actions">
                    <div class="seller-row-actions">
                        <button class="btn-sm-action btn-edit" title="Edit listing" aria-label="Edit listing" onclick="openEditModal('${product._id}')">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn-sm-action btn-delete" title="Delete listing" aria-label="Delete listing" onclick="confirmDelete('${product._id}', this)">
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

    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-3 loading-cell">
        <div class="state-center state-center-sm">
            <div class="spinner-border spinner-border-sm text-success"></div>
            <span class="text-muted" style="font-size:.85rem;">Loading orders...</span>
        </div>
    </td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/orders/seller/${user._id}`, {
            headers: { 'x-auth-token': token }
        });
        const orders = await res.json();
        sellerOrders = Array.isArray(orders) ? orders : [];
        renderIncomingOrders(sellerOrders);
    } catch {
        sellerOrders = [];
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">
            <div class="state-center state-center-sm">Could not load incoming orders.</div>
        </td></tr>`;
    }
}

function renderIncomingOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">
            <div class="state-center state-center-sm">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <span>No incoming orders yet.</span>
            </div>
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
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">
            <div class="state-center state-center-sm">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <span>No incoming orders yet.</span>
            </div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(({ order, item }) => {
        const productName = sellerEscape(item.product_id?.name || 'Unknown Item');
        const buyerName = sellerEscape(order.buyer_id?.name || 'Buyer');
        const address = sellerEscape(order.delivery_address || '-');
        const orderDate = formatDate(order.createdAt || order.created_at);
        const total = formatCurrency(item.price * item.quantity);
        const image = item.product_id?.image_url
            ? `<img src="${sellerEscape(item.product_id.image_url)}" alt="${productName}" />`
            : `<i class="bi bi-image"></i>`;
        const isCancelled = order.status === 'cancelled' || item.status === 'cancelled';
        const statusCls = isCancelled
            ? 'status-sold'
            : item.status === 'fulfilled'
                ? 'status-available'
                : 'status-pending';
        const statusTxt = isCancelled
            ? 'Cancelled'
            : item.status === 'fulfilled'
                ? 'Fulfilled'
                : 'Pending';

        const detailBtn = `<button class="btn-sm-action btn-view" title="View order details" aria-label="View order details"
                    onclick="openSellerOrderDetails('${order._id}')">
                    <i class="bi bi-eye-fill"></i>
               </button>`;

        const actionBtn = isCancelled
            ? `<span class="status-badge status-sold" style="font-size:.75rem;">Cancelled</span>`
            : item.status !== 'fulfilled'
            ? `<button class="seller-fulfill-btn"
                    onclick="markFulfilled('${order._id}', '${item._id}', this)">
                    <i class="bi bi-check-lg me-1"></i>Mark Fulfilled
               </button>`
            : `<span class="status-badge status-available" style="font-size:.75rem;">Done</span>`;

        return `
            <tr class="seller-table-row">
                <td data-label="Item">
                    <div class="seller-product-cell">
                        <div class="seller-product-thumb">${image}</div>
                        <div class="seller-product-copy">
                            <strong>${productName}</strong>
                            <span>${shortOrderId(order._id)} - ${orderDate}</span>
                        </div>
                    </div>
                </td>
                <td data-label="Buyer">${buyerName}</td>
                <td data-label="Address">
                    <span class="seller-address">${address}</span>
                </td>
                <td data-label="Qty">${item.quantity}</td>
                <td data-label="Total"><strong class="seller-money">${total}</strong></td>
                <td data-label="Status"><span class="status-badge ${statusCls}">${statusTxt}</span></td>
                <td data-label="Actions">
                    <div class="seller-row-actions">
                        ${detailBtn}
                        ${actionBtn}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function openSellerOrderDetails(orderId) {
    const order = sellerOrders.find((entry) => entry._id === orderId);
    if (!order) {
        showToast('Could not find this order. Please refresh and try again.', 'error');
        return;
    }

    const orderItems = order.items || [];
    const buyer = order.buyer_id || {};
    const placedAt = order.createdAt || order.created_at;
    const status = order.status
        ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
        : 'Pending';

    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setValue('sellerOrderShortId', `${shortOrderId(order._id)} - ${formatDate(placedAt)}`);
    setValue('sellerOrderBuyerName', buyer.name || 'Buyer');
    setValue('sellerOrderBuyerEmail', buyer.email || '');
    setValue('sellerOrderDate', formatDate(placedAt));
    setValue('sellerOrderStatus', status);

    const addressEl = document.getElementById('sellerOrderAddress');
    if (addressEl) addressEl.innerHTML = (order.delivery_address || '-').replace(/,\s*/g, '<br/>');

    const itemsEl = document.getElementById('sellerOrderItems');
    if (itemsEl) {
        itemsEl.innerHTML = orderItems.map((item) => {
            const product = item.product_id || {};
            const image = product.image_url
                ? `<img src="${product.image_url}" alt="${product.name || 'Item'}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`
                : `<i class="bi bi-image text-muted"></i>`;
            const isCancelled = order.status === 'cancelled' || item.status === 'cancelled';
            const itemStatusCls = isCancelled
                ? 'status-sold'
                : item.status === 'fulfilled'
                    ? 'status-available'
                    : 'status-pending';
            const itemStatusTxt = isCancelled
                ? 'Cancelled'
                : item.status === 'fulfilled'
                    ? 'Fulfilled'
                    : 'Pending';
            const lineTotal = formatCurrency(Number(item.price || 0) * Number(item.quantity || 0));

            return `
                <article class="order-card">
                    <div class="d-flex gap-3 align-items-center">
                        <div style="width:72px;height:72px;background:var(--bg-soft);border:1px solid var(--border);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
                            ${image}
                        </div>
                        <div class="flex-grow-1" style="min-width:0;">
                            <div style="font-weight:800;color:var(--text);">${product.name || 'Unknown Item'}</div>
                            <div style="font-size:.82rem;color:var(--text-muted);">
                                Size ${product.size || '-'} - Qty ${item.quantity} - ${formatCurrency(item.price)} each
                            </div>
                            <div style="margin-top:.45rem;">
                                <span class="status-badge ${itemStatusCls}">${itemStatusTxt}</span>
                            </div>
                        </div>
                        <strong style="color:var(--primary);white-space:nowrap;">${lineTotal}</strong>
                    </div>
                </article>`;
        }).join('');
    }

    const modalEl = document.getElementById('sellerOrderDetailsModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function markFulfilled(orderId, itemId, btn) {
    fulfillingOrderItem = { orderId, itemId, btn };

    const modalEl = document.getElementById('fulfillOrderModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function confirmFulfilledItem() {
    const token = localStorage.getItem('token');
    if (!token || !fulfillingOrderItem) return;

    const { itemId, btn } = fulfillingOrderItem;
    const confirmBtn = document.getElementById('confirmFulfillOrderBtn');
    const originalText = btn?.innerHTML;
    const originalConfirmText = confirmBtn?.innerHTML;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
    }
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }

    try {
        const res = await fetch(`${API_BASE}/orders/item/${itemId}/fulfill`, {
            method: 'PATCH',
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update order item.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('fulfillOrderModal'));
        if (modal) modal.hide();

        fulfillingOrderItem = null;
        showToast('Order item marked as fulfilled.');
        await loadIncomingOrders();
        await loadSellerStats();
        window.dispatchEvent(new Event('orders-updated'));
    } catch (err) {
        showToast(err.message || 'Could not update order item.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalConfirmText;
        }
    }
}

async function openEditModal(productId) {
    const product = sellerListings.find((item) => item._id === productId);
    if (!product) {
        showToast('Could not find this listing. Please refresh and try again.', 'error');
        return;
    }

    const form = document.getElementById('editForm');
    const modalEl = document.getElementById('editModal');
    if (!form || !modalEl) return;

    editingProductId = productId;

    try {
        const categoryId = product.category_id?._id || product.category_id || '';
        await loadCategoriesForEdit(categoryId);

        form.elements.name.value = product.name || '';
        form.elements.category_id.value = categoryId;
        form.elements.size.value = product.size || '';
        form.elements.quantity.value = product.quantity ?? 0;
        form.elements.price.value = product.price ?? '';
        form.elements.description.value = product.description || '';
    } catch (err) {
        showToast(err.message || 'Could not prepare edit form.', 'error');
        return;
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function confirmDelete(productId) {
    const product = sellerListings.find((item) => item._id === productId);
    deletingProductId = productId;

    const nameEl = document.getElementById('deleteListingName');
    if (nameEl) nameEl.textContent = product?.name || 'This listing';

    const modalEl = document.getElementById('deleteListingModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function deleteSelectedListing() {
    const token = localStorage.getItem('token');
    if (!token || !deletingProductId) return;

    const btn = document.getElementById('confirmDeleteListingBtn');

    const originalText = btn?.innerHTML;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';
    }

    try {
        const res = await fetch(`${API_BASE}/products/${deletingProductId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not delete listing.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteListingModal'));
        if (modal) modal.hide();

        deletingProductId = null;
        showToast('Listing deleted successfully.');
        await loadMyListings();
        await loadSellerStats();
    } catch (err) {
        showToast(err.message || 'Could not delete listing.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function submitListingUpdate(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const form = event.currentTarget;
    if (!token || !editingProductId || !form) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn?.innerHTML;

    const payload = {
        name: form.elements.name.value.trim(),
        category_id: form.elements.category_id.value,
        size: form.elements.size.value,
        quantity: Number(form.elements.quantity.value),
        price: Number(form.elements.price.value),
        description: form.elements.description.value.trim(),
    };

    if (!payload.name || !payload.category_id || !payload.size || payload.quantity < 0 || payload.price < 1) {
        showToast('Please complete the listing details before saving.', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }

    try {
        const res = await fetch(`${API_BASE}/products/${editingProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update listing.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        if (modal) modal.hide();

        editingProductId = null;
        showToast('Listing updated successfully.');
        await loadMyListings();
        await loadSellerStats();
    } catch (err) {
        showToast(err.message || 'Could not update listing.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editForm');
    if (editForm) editForm.addEventListener('submit', submitListingUpdate);

    const deleteBtn = document.getElementById('confirmDeleteListingBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteSelectedListing);

    const fulfillBtn = document.getElementById('confirmFulfillOrderBtn');
    if (fulfillBtn) fulfillBtn.addEventListener('click', confirmFulfilledItem);

    loadSellerStats();
    loadMyListings();
    loadIncomingOrders();
});
