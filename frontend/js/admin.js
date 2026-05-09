let adminCategories = [];
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
        await Promise.all([loadAdminSummary(), loadAdminCategories()]);
    } catch (err) {
        showToast(err.message || 'Could not load admin panel.', 'error');
    }
});
