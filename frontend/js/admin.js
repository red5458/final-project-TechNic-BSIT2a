let adminCategories = [];
let adminUsers = [];
let adminProducts = [];
let adminOrders = [];
let pendingDeleteCategoryId = null;

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

    if (!adminCategories.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-folder-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No categories yet.</p>
            </div>`;
        return;
    }

    list.innerHTML = adminCategories.map((category) => `
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

    if (!adminUsers.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-person-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No users found.</p>
            </div>`;
        return;
    }

    const currentUser = getUser();

    list.innerHTML = adminUsers.map((user) => {
        const isSelf = String(user._id) === String(currentUser?._id);
        const joinedDate = user.created_at
            ? new Date(user.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })
            : '-';
        const status = user.status || 'active';
        const statusClass = status === 'disabled' ? 'status-cancelled' : 'status-delivered';

        return `
            <div class="admin-list-row admin-user-row">
                <div class="admin-list-main">
                    <span class="admin-list-icon"><i class="bi bi-person-fill"></i></span>
                    <div>
                        <strong>${escapeHtml(user.name || 'Unnamed User')}${isSelf ? ' (You)' : ''}</strong>
                        <span>${escapeHtml(user.email || '')}</span>
                        <span>Joined ${escapeHtml(joinedDate)}</span>
                    </div>
                </div>
                <div class="admin-user-controls">
                    <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
                    <select class="admin-role-select" ${isSelf ? 'disabled' : ''}
                        onchange="updateUserRole('${user._id}', this.value, this)">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
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

    if (!adminProducts.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-tags fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No products found.</p>
            </div>`;
        return;
    }

    list.innerHTML = adminProducts.map((product) => {
        const status = product.status || 'active';
        const statusClass = status === 'removed' ? 'status-cancelled' : 'status-delivered';
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
                    <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
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

    if (!adminOrders.length) {
        list.innerHTML = `
            <div class="state-center state-center-sm">
                <i class="bi bi-bag-x fs-2 text-muted"></i>
                <p class="mt-2 text-muted">No orders found.</p>
            </div>`;
        return;
    }

    const statusClassMap = {
        pending: 'status-pending',
        confirmed: 'status-confirmed',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-cancelled',
    };

    list.innerHTML = adminOrders.map((order) => {
        const status = order.status || 'pending';
        const statusClass = statusClassMap[status] || 'status-pending';
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
                        <strong>Order #${escapeHtml(shortId)}</strong>
                        <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
                    </div>
                    <div class="admin-order-meta">
                        Buyer: ${escapeHtml(buyer)}${buyerEmail ? ` (${escapeHtml(buyerEmail)})` : ''} | Placed ${escapeHtml(placedDate)} | ${escapeHtml(total)}
                    </div>
                    <div class="admin-order-items">${itemSummary}</div>
                </div>
            </div>`;
    }).join('');
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

        resetCategoryForm();
        showToast(id ? 'Category updated.' : 'Category added.');
        await Promise.all([loadAdminCategories(), loadAdminSummary()]);
    } catch (err) {
        showToast(err.message || 'Could not save category.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function updateUserRole(userId, role, select) {
    const previousRole = adminUsers.find((user) => user._id === userId)?.role || 'user';
    await updateAdminUser(userId, { role }, {
        control: select,
        fallback: () => { if (select) select.value = previousRole; },
        successMessage: 'User role updated.',
    });
}

async function toggleUserStatus(userId, currentStatus, btn) {
    const status = currentStatus === 'disabled' ? 'active' : 'disabled';
    await updateAdminUser(userId, { status }, {
        control: btn,
        loadingText: status === 'disabled' ? 'Disabling...' : 'Enabling...',
        successMessage: status === 'disabled' ? 'User disabled.' : 'User enabled.',
    });
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

        showToast(successMessage);
        await Promise.all([loadAdminUsers(), loadAdminSummary()]);
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

        showToast(status === 'removed' ? 'Product removed.' : 'Product restored.');
        await Promise.all([loadAdminProducts(), loadAdminSummary()]);
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

        bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'))?.hide();
        pendingDeleteCategoryId = null;
        showToast('Category deleted.');
        await Promise.all([loadAdminCategories(), loadAdminSummary()]);
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
    document.getElementById('cancelCategoryEditBtn')?.addEventListener('click', resetCategoryForm);
    document.getElementById('confirmDeleteCategoryBtn')?.addEventListener('click', deleteCategory);

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
