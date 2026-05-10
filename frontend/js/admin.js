let adminCategories = [];
let adminUsers = [];
let adminProducts = [];
let adminOrders = [];
let pendingDeleteCategoryId = null;
let selectedAdminOrderStatus = 'all';
let pendingAdminConfirmResolve = null;

function adminToken() {
    return localStorage.getItem('token');
}

function adminHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-auth-token': adminToken(),
    };
}

async function guardAdminPage() {
    const token = adminToken();

    if (!token) {
        window.location.href = 'dashboard.html';
        return false;
    }

    try {
        const sessionValid = await validateStoredSession();
        const user = getUser();
        if (!sessionValid || user?.role !== 'admin') throw new Error('Admin access denied.');

        const res = await fetch(`${API_BASE}/admin/me`, {
            headers: { 'x-auth-token': token },
            cache: 'no-store',
        });

        if (!res.ok) throw new Error('Admin access denied.');
        return true;
    } catch {
        showToast('Admin access only.', 'error');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        return false;
    }
}

async function loadAdminSummary() {
    const res = await fetch(`${API_BASE}/admin/summary`, {
        headers: { 'x-auth-token': adminToken() },
        cache: 'no-store',
    });
    const summary = await res.json();
    if (!res.ok) throw new Error(summary.error || summary.msg || 'Could not load admin summary.');

    setText('adminTotalUsers', summary.totalUsers);
    setText('adminTotalProducts', summary.totalProducts);
    setText('adminTotalOrders', summary.totalOrders);
    setText('adminTotalCategories', summary.totalCategories);
}

async function loadAdminCategories() {
    const list = document.getElementById('categoryList');
    if (!list) return;

    list.innerHTML = `
        <div class="state-center state-center-sm">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-2 text-muted">Loading categories...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
        adminCategories = await res.json();
        if (!res.ok) throw new Error(adminCategories.error || 'Could not load categories.');
        renderAdminCategories();
    } catch (err) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-wifi-off fs-2 text-muted"></i>
                <p class="mt-2 text-muted">${escapeHtml(err.message || 'Could not load categories.')}</p>
            </div>`;
    }
}

async function loadAdminUsers() {
    const list = document.getElementById('userList');
    if (!list) return;

    list.innerHTML = `
        <div class="state-center state-center-sm">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-2 text-muted">Loading users...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'x-auth-token': adminToken() },
            cache: 'no-store',
        });
        adminUsers = await res.json();
        if (!res.ok) throw new Error(adminUsers.error || adminUsers.msg || 'Could not load users.');
        renderAdminUsers();
    } catch (err) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-wifi-off fs-2 text-muted"></i>
                <p class="mt-2 text-muted">${escapeHtml(err.message || 'Could not load users.')}</p>
            </div>`;
    }
}

async function loadAdminProducts() {
    const list = document.getElementById('productList');
    if (!list) return;

    list.innerHTML = `
        <div class="state-center state-center-sm">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-2 text-muted">Loading products...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/admin/products`, {
            headers: { 'x-auth-token': adminToken() },
            cache: 'no-store',
        });
        adminProducts = await res.json();
        if (!res.ok) throw new Error(adminProducts.error || adminProducts.msg || 'Could not load products.');
        renderAdminProducts();
    } catch (err) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-wifi-off fs-2 text-muted"></i>
                <p class="mt-2 text-muted">${escapeHtml(err.message || 'Could not load products.')}</p>
            </div>`;
    }
}

async function loadAdminOrders() {
    const list = document.getElementById('orderList');
    if (!list) return;

    list.innerHTML = `
        <div class="state-center state-center-sm">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-2 text-muted">Loading orders...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/admin/orders`, {
            headers: { 'x-auth-token': adminToken() },
            cache: 'no-store',
        });
        adminOrders = await res.json();
        if (!res.ok) throw new Error(adminOrders.error || adminOrders.msg || 'Could not load orders.');
        renderAdminOrders();
    } catch (err) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-wifi-off fs-2 text-muted"></i>
                <p class="mt-2 text-muted">${escapeHtml(err.message || 'Could not load orders.')}</p>
            </div>`;
    }
}

function renderAdminCategories() {
    const list = document.getElementById('categoryList');
    if (!list) return;

    const query = getAdminSearchQuery('adminCategorySearch');
    const categories = adminCategories.filter((category) => {
        return matchesAdminSearch(query, category.name, category._id);
    });

    if (!adminCategories.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-folder-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No categories yet.</p>
            </div>`;
        return;
    }

    if (!categories.length) {
        list.innerHTML = renderAdminNoResults('No categories match your search.');
        return;
    }

    list.innerHTML = categories.map((category) => `
        <div class="admin-list-row">
            <div class="admin-list-main">
                <span class="admin-list-icon"><i class="bi bi-folder-fill"></i></span>
                <div>
                    <strong>${escapeHtml(category.name)}</strong>
                    <span>${escapeHtml(category._id)}</span>
                </div>
            </div>
            <div class="admin-list-actions">
                <button type="button" class="icon-btn" title="Edit category"
                    onclick="startEditCategory('${category._id}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="icon-btn danger-icon-btn" title="Delete category"
                    onclick="confirmDeleteCategory('${category._id}')">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </div>`).join('');
}

function renderAdminUsers() {
    const list = document.getElementById('userList');
    if (!list) return;

    const query = getAdminSearchQuery('adminUserSearch');
    const users = adminUsers.filter((user) => {
        return matchesAdminSearch(query, user.name, user.email, user.role, user.status, user._id);
    });

    if (!adminUsers.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-person-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No users found.</p>
            </div>`;
        return;
    }

    if (!users.length) {
        list.innerHTML = renderAdminNoResults('No users match your search.');
        return;
    }

    const currentUser = getUser();

    list.innerHTML = users.map((user) => {
        const isSelf = String(user._id) === String(currentUser?._id);
        const joinedDate = user.created_at
            ? new Date(user.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })
            : '-';
        const status = user.status || 'active';
        const role = user.role || 'user';
        const roleClass = role === 'admin' ? 'admin-role-badge-admin' : 'admin-role-badge-user';

        return `
            <div class="admin-list-row admin-user-row">
                <div class="admin-list-main">
                    <span class="admin-list-icon"><i class="bi bi-person-fill"></i></span>
                    <div>
                        <strong>
                            ${escapeHtml(user.name || 'Unnamed User')}${isSelf ? ' (You)' : ''}
                            <span class="admin-role-badge ${roleClass}">${escapeHtml(role)}</span>
                        </strong>
                        <span>${escapeHtml(user.email || '')}</span>
                        <span>Joined ${escapeHtml(joinedDate)}</span>
                    </div>
                </div>
                <div class="admin-user-controls">
                    <button type="button" class="icon-btn" title="Edit user"
                        onclick="openAdminEditUser('${user._id}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn ${status === 'disabled' ? 'btn-outline-success' : 'btn-outline-danger'} btn-sm"
                        ${isSelf ? 'disabled' : ''}
                        onclick="toggleUserStatus('${user._id}', '${status}', this)">
                        ${status === 'disabled' ? 'Enable' : 'Disable'}
                    </button>
                </div>
            </div>`;
    }).join('');
}

function renderAdminProducts() {
    const list = document.getElementById('productList');
    if (!list) return;

    const query = getAdminSearchQuery('adminProductSearch');
    const products = adminProducts.filter((product) => {
        return matchesAdminSearch(
            query,
            product.name,
            product.size,
            product.status,
            product.seller_id?.name,
            product.seller_id?.email,
            product.category_id?.name,
            product._id
        );
    });

    if (!adminProducts.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-tags fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No products found.</p>
            </div>`;
        return;
    }

    if (!products.length) {
        list.innerHTML = renderAdminNoResults('No products match your search.');
        return;
    }

    list.innerHTML = products.map((product) => {
        const status = product.status || 'active';
        const image = product.image_url
            ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name || 'Product')}" />`
            : '<i class="bi bi-image"></i>';
        const price = `PHP ${Number(product.price || 0).toFixed(2)}`;
        const seller = product.seller_id?.name || 'Unknown seller';
        const category = product.category_id?.name || 'Uncategorized';

        return `
            <div class="admin-list-row admin-product-row">
                <div class="admin-product-main">
                    <div class="admin-product-thumb">${image}</div>
                    <div class="admin-product-copy">
                        <strong>${escapeHtml(product.name || 'Unnamed Product')}</strong>
                        <span>${escapeHtml(category)} · Size ${escapeHtml(product.size || '-')} · Qty ${Number(product.quantity || 0)}</span>
                        <span>Seller: ${escapeHtml(seller)} · ${escapeHtml(price)}</span>
                    </div>
                </div>
                <div class="admin-user-controls">
                    <button type="button" class="icon-btn" title="Edit product"
                        onclick="openAdminEditProduct('${product._id}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn ${status === 'removed' ? 'btn-outline-success' : 'btn-outline-danger'} btn-sm"
                        onclick="toggleProductStatus('${product._id}', '${status}', this)">
                        ${status === 'removed' ? 'Restore' : 'Remove'}
                    </button>
                </div>
            </div>`;
    }).join('');
}

function renderAdminOrders() {
    const list = document.getElementById('orderList');
    if (!list) return;

    const query = getAdminSearchQuery('adminOrderSearch');
    const orders = adminOrders.filter((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        const matchesStatus = selectedAdminOrderStatus === 'all' || order.status === selectedAdminOrderStatus;
        if (!matchesStatus) return false;
        return matchesAdminSearch(
            query,
            order._id,
            order.status,
            order.buyer_id?.name,
            order.buyer_id?.email,
            order.total_amount,
            ...items.flatMap((item) => [
                item.product_id?.name,
                item.product_id?.size,
                item.seller_id?.name,
                item.seller_id?.email,
                item.status,
            ])
        );
    });

    if (!adminOrders.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-bag-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No orders found.</p>
            </div>`;
        return;
    }

    if (!orders.length) {
        list.innerHTML = renderAdminNoResults('No orders match your search.');
        return;
    }

    list.innerHTML = orders.map((order) => {
        const status = order.status || 'pending';
        const statusClass = getAdminStatusClass(status);
        const placedDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })
            : '-';
        const buyer = order.buyer_id?.name || 'Unknown buyer';
        const buyerEmail = order.buyer_id?.email || '';
        const total = `PHP ${Number(order.total_amount || 0).toFixed(2)}`;
        const shortId = String(order._id || '').slice(-8).toUpperCase();
        const items = Array.isArray(order.items) ? order.items : [];

        const itemSummary = items.length
            ? items.map((item) => {
                const product = item.product_id || {};
                const seller = item.seller_id?.name || 'Unknown seller';
                const itemStatus = item.status || 'pending';
                return `
                    <div class="admin-order-item">
                        <span>${escapeHtml(product.name || 'Deleted product')}</span>
                        <small>Seller: ${escapeHtml(seller)} | Size ${escapeHtml(product.size || '-')} | Qty ${Number(item.quantity || 0)} | ${escapeHtml(itemStatus)}</small>
                    </div>`;
            }).join('')
            : '<div class="admin-order-item"><span>No items found.</span></div>';

        return `
            <div class="admin-list-row admin-order-row">
                <div class="admin-order-main">
                    <div class="admin-order-topline">
                        <div class="admin-order-id-status">
                            <strong>Order #${escapeHtml(shortId)}</strong>
                            <span class="status-badge ${statusClass}">${escapeHtml(getAdminStatusLabel(status))}</span>
                        </div>
                    </div>
                    <div class="admin-order-meta">
                        Buyer: ${escapeHtml(buyer)}${buyerEmail ? ` (${escapeHtml(buyerEmail)})` : ''} | Placed ${escapeHtml(placedDate)} | ${escapeHtml(total)}
                    </div>
                    <div class="admin-order-items">${itemSummary}</div>
                </div>
                <div class="admin-order-actions">
                    <select class="admin-status-select" aria-label="Update order status"
                        onchange="updateAdminOrderStatus('${order._id}', this.value, this)">
                        ${renderStatusOptions(['pending', 'shipped', 'delivered', 'cancelled'], status)}
                    </select>
                    <button type="button" class="icon-btn" title="View order details"
                        onclick="openAdminOrderDetails('${order._id}')">
                        <i class="bi bi-receipt"></i>
                    </button>
                </div>
            </div>`;
    }).join('');
}

function getAdminStatusClass(status) {
    const statusClassMap = {
        pending: 'status-pending',
        shipped: 'status-shipped',
        fulfilled: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-cancelled',
    };
    return statusClassMap[status] || 'status-pending';
}

function renderStatusOptions(statuses, currentStatus) {
    return statuses.map((status) => {
        const label = getAdminStatusLabel(status);
        return `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
}

function getAdminStatusLabel(status) {
    if (status === 'shipped') return 'fulfilled';
    return status || 'pending';
}

function openAdminOrderDetails(orderId) {
    const order = adminOrders.find((item) => item._id === orderId);
    const modalEl = document.getElementById('adminOrderDetailsModal');
    const body = document.getElementById('adminOrderDetailsBody');
    const subtitle = document.getElementById('adminOrderDetailsSubtitle');
    if (!order || !modalEl || !body) return;

    const shortId = String(order._id || '').slice(-8).toUpperCase();
    const placedDate = order.created_at
        ? new Date(order.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
        : '-';
    const buyer = order.buyer_id || {};
    const items = Array.isArray(order.items) ? order.items : [];
    const status = order.status || 'pending';

    if (subtitle) {
        subtitle.textContent = `Order #${shortId} | ${placedDate}`;
    }

    const itemRows = items.length ? items.map((item) => {
        const product = item.product_id || {};
        const seller = item.seller_id || {};
        const itemStatus = item.status || 'pending';
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);

        return `
            <div class="admin-receipt-item">
                <div>
                    <strong>${escapeHtml(product.name || 'Deleted product')}</strong>
                    <small>Size ${escapeHtml(product.size || '-')} | Qty ${Number(item.quantity || 0)} | Seller: ${escapeHtml(seller.name || 'Unknown seller')}</small>
                    <small>${escapeHtml(seller.email || '')}</small>
                </div>
                <div style="text-align:right;">
                    <strong>PHP ${lineTotal.toFixed(2)}</strong>
                    <span class="status-badge ${getAdminStatusClass(itemStatus)} mt-2">${escapeHtml(getAdminStatusLabel(itemStatus))}</span>
                </div>
            </div>`;
    }).join('') : '<p class="text-muted mb-0">No items found.</p>';

    body.innerHTML = `
        <div class="admin-receipt">
            <div class="admin-receipt-block">
                <div class="admin-receipt-title">Buyer</div>
                <div class="admin-receipt-line"><span>Name</span><strong>${escapeHtml(buyer.name || 'Unknown buyer')}</strong></div>
                <div class="admin-receipt-line"><span>Email</span><strong>${escapeHtml(buyer.email || '-')}</strong></div>
                ${buyer.phone ? `<div class="admin-receipt-line"><span>Phone</span><strong>${escapeHtml(buyer.phone)}</strong></div>` : ''}
                <div class="admin-receipt-line"><span>Address</span><strong>${escapeHtml(order.delivery_address || '-')}</strong></div>
            </div>
            <div class="admin-receipt-block">
                <div class="admin-receipt-title">Order</div>
                <div class="admin-receipt-line"><span>Placed</span><strong>${escapeHtml(placedDate)}</strong></div>
            </div>
            <div class="admin-receipt-block">
                <div class="admin-receipt-title">Items Ordered</div>
                ${itemRows}
                <div class="admin-receipt-total"><span>Total</span><strong>PHP ${Number(order.total_amount || 0).toFixed(2)}</strong></div>
            </div>
        </div>`;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function updateAdminOrderStatus(orderId, status, control) {
    const order = adminOrders.find((item) => item._id === orderId);
    const previousStatus = order?.status || 'pending';

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
        const confirmed = await confirmAdminAction(
            'Cancel this order?',
            'This will also cancel its items and return the stock to the products.'
        );
        if (!confirmed) {
            if (control?.tagName === 'SELECT') control.value = previousStatus;
            return;
        }
    }

    await updateAdminOrder(orderId, { status }, {
        control,
        fallback: () => { if (control?.tagName === 'SELECT') control.value = previousStatus; },
        successMessage: status === 'cancelled' ? 'Order cancelled.' : 'Order status updated.',
    });
}

async function updateAdminOrder(orderId, payload, options = {}) {
    const { control, fallback, loadingText = 'Saving...', successMessage = 'Order updated.' } = options;
    const originalText = control?.innerHTML;
    const originalDisabled = control?.disabled;

    if (control) {
        control.disabled = true;
        if (control.tagName !== 'SELECT') {
            control.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
        }
    }

    try {
        const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: adminHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update order.');

        applyAdminOrderStatus(orderId, payload.status);
        showToast(successMessage || loadingText);
        renderAdminOrders();
        loadAdminSummary().catch(() => null);
        if (document.getElementById('adminOrderDetailsModal')?.classList.contains('show')) {
            openAdminOrderDetails(orderId);
        }
    } catch (err) {
        fallback?.();
        showToast(err.message || 'Could not update order.', 'error');
    } finally {
        if (control) {
            control.disabled = originalDisabled;
            if (control.tagName !== 'SELECT') control.innerHTML = originalText;
        }
    }
}

function applyAdminOrderStatus(orderId, status) {
    const order = adminOrders.find((item) => item._id === orderId);
    if (!order || !status) return;

    order.status = status;
    if (status === 'cancelled' && Array.isArray(order.items)) {
        order.items = order.items.map((item) => ({ ...item, status: 'cancelled' }));
    }
}

function applyAdminCategory(category) {
    if (!category?._id) return;
    const index = adminCategories.findIndex((item) => item._id === category._id);
    if (index >= 0) {
        adminCategories[index] = category;
    } else {
        adminCategories.push(category);
    }
    adminCategories.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}

function removeAdminCategory(categoryId) {
    adminCategories = adminCategories.filter((category) => category._id !== categoryId);
}

function applyAdminUser(user) {
    if (!user?._id) return;
    const index = adminUsers.findIndex((item) => item._id === user._id);
    if (index >= 0) {
        adminUsers[index] = user;
    } else {
        adminUsers.unshift(user);
    }
}

function applyAdminProduct(product) {
    if (!product?._id) return;
    const index = adminProducts.findIndex((item) => item._id === product._id);
    if (index >= 0) {
        adminProducts[index] = product;
    } else {
        adminProducts.unshift(product);
    }
}

function resetCategoryForm() {
    setValue('categoryId', '');
    setValue('categoryName', '');
    document.getElementById('cancelCategoryEditBtn')?.setAttribute('hidden', '');
    const saveBtn = document.getElementById('saveCategoryBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="bi bi-save-fill me-1"></i>Save';
}

function startEditCategory(categoryId) {
    const category = adminCategories.find((item) => item._id === categoryId);
    if (!category) return;

    setValue('categoryId', category._id);
    setValue('categoryName', category.name);
    document.getElementById('cancelCategoryEditBtn')?.removeAttribute('hidden');
    const saveBtn = document.getElementById('saveCategoryBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="bi bi-pencil-square me-1"></i>Update';
    document.getElementById('categoryName')?.focus();
}

async function saveCategory(event) {
    event.preventDefault();

    const id = document.getElementById('categoryId')?.value.trim();
    const name = document.getElementById('categoryName')?.value.trim();
    const btn = document.getElementById('saveCategoryBtn');
    const originalText = btn?.innerHTML;

    if (!name) {
        showToast('Category name is required.', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }

    try {
        const res = await fetch(`${API_BASE}/categories${id ? `/${id}` : ''}`, {
            method: id ? 'PATCH' : 'POST',
            headers: adminHeaders(),
            body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not save category.');

        applyAdminCategory(data);
        resetCategoryForm();
        showToast(id ? 'Category updated.' : 'Category added.');
        renderAdminCategories();
        loadAdminSummary().catch(() => null);
    } catch (err) {
        showToast(err.message || 'Could not save category.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function toggleUserStatus(userId, currentStatus, btn) {
    const status = currentStatus === 'disabled' ? 'active' : 'disabled';
    await updateAdminUser(userId, { status }, {
        control: btn,
        loadingText: status === 'disabled' ? 'Disabling...' : 'Enabling...',
        successMessage: status === 'disabled' ? 'User disabled.' : 'User enabled.',
    });
}

function openAdminEditUser(userId) {
    const user = adminUsers.find((item) => item._id === userId);
    const form = document.getElementById('adminEditUserForm');
    const modalEl = document.getElementById('adminEditUserModal');
    if (!user || !form || !modalEl) return;

    form.elements.user_id.value = user._id;
    form.elements.name.value = user.name || '';
    form.elements.email.value = user.email || '';
    form.elements.phone.value = user.phone || '';
    form.elements.role.value = user.role || 'user';
    form.elements.role.disabled = String(user._id) === String(getUser()?._id);

    new bootstrap.Modal(modalEl).show();
}

async function submitAdminEditUser(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const userId = form.elements.user_id.value;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn?.innerHTML;
    const payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        role: form.elements.role.disabled ? undefined : form.elements.role.value,
    };

    if (!payload.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        showToast('Please enter a valid name and email address.', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }

    try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'PATCH',
            headers: adminHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update user.');

        const currentUser = getUser();
        if (String(currentUser?._id) === String(userId) && typeof saveUser === 'function') {
            saveUser({ ...currentUser, ...data });
        }

        applyAdminUser(data);
        bootstrap.Modal.getInstance(document.getElementById('adminEditUserModal'))?.hide();
        showToast('User updated.');
        renderAdminUsers();
        loadAdminSummary().catch(() => null);
    } catch (err) {
        showToast(err.message || 'Could not update user.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function updateAdminUser(userId, payload, options = {}) {
    const { control, fallback, loadingText = 'Saving...', successMessage = 'User updated.' } = options;
    const originalText = control?.innerHTML;
    const originalDisabled = control?.disabled;

    if (control) {
        control.disabled = true;
        if (control.tagName !== 'SELECT') {
            control.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${loadingText}`;
        }
    }

    try {
        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'PATCH',
            headers: adminHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update user.');

        applyAdminUser(data);
        showToast(successMessage);
        renderAdminUsers();
        loadAdminSummary().catch(() => null);
    } catch (err) {
        fallback?.();
        showToast(err.message || 'Could not update user.', 'error');
    } finally {
        if (control) {
            control.disabled = originalDisabled;
            if (control.tagName !== 'SELECT') control.innerHTML = originalText;
        }
    }
}

async function populateAdminProductCategories(selectedCategoryId = '') {
    if (!adminCategories.length) {
        const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not load categories.');
        adminCategories = data;
    }

    const select = document.querySelector('#adminEditProductForm [name="category_id"]');
    if (!select) return;

    select.innerHTML = '<option value="" disabled>Select a category</option>';
    adminCategories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        select.appendChild(option);
    });
    select.value = selectedCategoryId || '';
}

async function openAdminEditProduct(productId) {
    const product = adminProducts.find((item) => item._id === productId);
    const form = document.getElementById('adminEditProductForm');
    const modalEl = document.getElementById('adminEditProductModal');
    if (!product || !form || !modalEl) return;

    try {
        const categoryId = product.category_id?._id || product.category_id || '';
        await populateAdminProductCategories(categoryId);

        form.elements.product_id.value = product._id;
        form.elements.name.value = product.name || '';
        form.elements.category_id.value = categoryId;
        form.elements.size.value = product.size || '';
        form.elements.quantity.value = product.quantity ?? 0;
        form.elements.price.value = product.price ?? '';
        form.elements.description.value = product.description || '';

        new bootstrap.Modal(modalEl).show();
    } catch (err) {
        showToast(err.message || 'Could not prepare product edit form.', 'error');
    }
}

async function submitAdminEditProduct(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const productId = form.elements.product_id.value;
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
        showToast('Please complete the product details before saving.', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }

    try {
        const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'PATCH',
            headers: adminHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update product.');

        applyAdminProduct(data);
        bootstrap.Modal.getInstance(document.getElementById('adminEditProductModal'))?.hide();
        showToast('Product updated.');
        renderAdminProducts();
        loadAdminSummary().catch(() => null);
    } catch (err) {
        showToast(err.message || 'Could not update product.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function toggleProductStatus(productId, currentStatus, btn) {
    const status = currentStatus === 'removed' ? 'active' : 'removed';
    const originalText = btn?.innerHTML;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${status === 'removed' ? 'Removing...' : 'Restoring...'}`;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'PATCH',
            headers: adminHeaders(),
            body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not update product.');

        applyAdminProduct(data);
        showToast(status === 'removed' ? 'Product removed.' : 'Product restored.');
        renderAdminProducts();
        loadAdminSummary().catch(() => null);
    } catch (err) {
        showToast(err.message || 'Could not update product.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

function confirmDeleteCategory(categoryId) {
    pendingDeleteCategoryId = categoryId;
    const modalEl = document.getElementById('deleteCategoryModal');
    if (!modalEl) return;
    new bootstrap.Modal(modalEl).show();
}

async function deleteCategory() {
    if (!pendingDeleteCategoryId) return;

    const btn = document.getElementById('confirmDeleteCategoryBtn');
    const originalText = btn?.innerHTML;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';
    }

    try {
        const res = await fetch(`${API_BASE}/categories/${pendingDeleteCategoryId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': adminToken() },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not delete category.');

        removeAdminCategory(pendingDeleteCategoryId);
        bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'))?.hide();
        pendingDeleteCategoryId = null;
        showToast('Category deleted.');
        renderAdminCategories();
        loadAdminSummary().catch(() => null);
    } catch (err) {
        showToast(err.message || 'Could not delete category.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? '0';
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value ?? '';
}

function getAdminSearchQuery(id) {
    return document.getElementById(id)?.value.trim().toLowerCase() || '';
}

function matchesAdminSearch(query, ...values) {
    if (!query) return true;
    return values.some((value) => String(value ?? '').toLowerCase().includes(query));
}

function renderAdminNoResults(message) {
    return `
        <div class="state-center state-center-sm">
            <i class="bi bi-search fs-2 text-muted"></i>
            <p class="mt-2 text-muted">${escapeHtml(message)}</p>
        </div>`;
}

function confirmAdminAction(title, message) {
    const modalEl = document.getElementById('adminConfirmActionModal');
    if (!modalEl) return Promise.resolve(false);

    document.getElementById('adminConfirmActionTitle').textContent = title;
    document.getElementById('adminConfirmActionText').textContent = message;

    return new Promise((resolve) => {
        pendingAdminConfirmResolve = resolve;
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    });
}

function resolveAdminConfirm(value) {
    if (pendingAdminConfirmResolve) {
        pendingAdminConfirmResolve(value);
        pendingAdminConfirmResolve = null;
    }
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[char]));
}

document.addEventListener('DOMContentLoaded', async () => {
    const allowed = await guardAdminPage();
    if (!allowed) return;

    document.getElementById('categoryForm')?.addEventListener('submit', saveCategory);
    document.getElementById('adminEditUserForm')?.addEventListener('submit', submitAdminEditUser);
    document.getElementById('adminEditProductForm')?.addEventListener('submit', submitAdminEditProduct);
    document.getElementById('cancelCategoryEditBtn')?.addEventListener('click', resetCategoryForm);
    document.getElementById('confirmDeleteCategoryBtn')?.addEventListener('click', deleteCategory);
    document.getElementById('adminConfirmActionBtn')?.addEventListener('click', () => {
        resolveAdminConfirm(true);
        bootstrap.Modal.getInstance(document.getElementById('adminConfirmActionModal'))?.hide();
    });
    document.getElementById('adminConfirmActionModal')?.addEventListener('hidden.bs.modal', () => {
        resolveAdminConfirm(false);
    });
    document.getElementById('adminUserSearch')?.addEventListener('input', renderAdminUsers);
    document.getElementById('adminProductSearch')?.addEventListener('input', renderAdminProducts);
    document.getElementById('adminOrderSearch')?.addEventListener('input', renderAdminOrders);
    document.getElementById('adminCategorySearch')?.addEventListener('input', renderAdminCategories);
    document.querySelectorAll('[data-order-status]').forEach((button) => {
        button.addEventListener('click', () => {
            selectedAdminOrderStatus = button.dataset.orderStatus || 'all';
            document.querySelectorAll('[data-order-status]').forEach((chip) => {
                chip.classList.toggle('active', chip === button);
            });
            renderAdminOrders();
        });
    });

    try {
        await Promise.all([
            loadAdminSummary(),
            loadAdminCategories(),
            loadAdminUsers(),
            loadAdminProducts(),
            loadAdminOrders(),
        ]);
    } catch (err) {
        showToast(err.message || 'Could not load admin panel.', 'error');
    }
});
