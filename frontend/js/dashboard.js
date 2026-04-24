/* ============================================
   UNIFORMITY - dashboard.js
   Phase 5: Fetch + Render Products,
            Filter, Sort, Search, Pagination
   ============================================ */

const PAGE_SIZE = 6;
let allProducts  = [];
let currentPageNum  = 1;

// ─── Fetch All Products ───────────────────────
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-3 text-muted" style="font-size:.9rem;">Loading uniforms...</p>
        </div>`;

    try {
        const res  = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        allProducts = data;
        applyFiltersAndRender();
    } catch {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-wifi-off fs-1 text-muted"></i>
                <p class="mt-3 text-muted">Could not load products. Make sure the server is running.</p>
            </div>`;
    }
}

// ─── Filter + Sort + Search ───────────────────
function applyFiltersAndRender() {
    const category = document.getElementById('filterCategory')?.value  || '';
    const size     = document.getElementById('filterSize')?.value      || '';
    const sort     = document.getElementById('filterSort')?.value      || 'newest';
    const search   = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';

    let filtered = [...allProducts];

    if (category) filtered = filtered.filter(p => p.category_id?._id === category || p.category_id === category);
    if (size)     filtered = filtered.filter(p => p.size === size);
    if (search)   filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

    if (sort === 'price_asc')  filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'newest')     filtered.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

    currentPageNum = 1;
    renderPage(filtered);
}

// ─── Render Page (Pagination slice) ──────────
function renderPage(filtered) {
    const countEl = document.getElementById('listingCount');
    if (countEl) countEl.textContent = `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} found`;

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const start      = (currentPageNum - 1) * PAGE_SIZE;
    const slice      = filtered.slice(start, start + PAGE_SIZE);

    const grid = document.getElementById('productGrid');

    if (slice.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <p class="mt-3 text-muted">No uniforms match your filters.</p>
                <button class="btn-green mt-2" onclick="clearFilters()" style="padding:.5rem 1.5rem;">Clear Filters</button>
            </div>`;
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    grid.innerHTML = slice.map(p => buildProductCard(p)).join('');
    renderPagination(totalPages, filtered);
}

// ─── Product Card Template ────────────────────
function buildProductCard(p) {
    const price     = `₱${Number(p.price).toFixed(2)}`;
    const size      = p.size || '—';
    const seller    = p.seller_id?.name || 'Seller';
    const category  = p.category_id?.name || '';
    const imgHTML   = p.image_url
        ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<div class="product-img-placeholder"><i class="bi bi-image fs-1"></i></div>`;

    return `
        <div class="product-card" onclick="window.location.href='product-detail.html?id=${p._id}'">
            <div class="product-img">${imgHTML}</div>
            <div class="product-body">
                <div class="product-name">${p.name}</div>
                <div class="product-meta">
                    <span class="product-size">Size ${size}</span>
                    <span class="product-seller"><i class="bi bi-person-fill me-1"></i>${seller}</span>
                </div>
                <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:.5rem;">${category}</div>
                <div class="product-price">${price}</div>
                <button class="btn-add-cart" onclick="event.stopPropagation(); handleAddToCart('${p._id}', '${p.seller_id?._id || ''}', ${p.price})">
                    <i class="bi bi-cart-plus me-1"></i>Add to Cart
                </button>
            </div>
        </div>`;
}

// ─── Add to Cart Handler ──────────────────────
function handleAddToCart(productId, sellerId, price) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please log in to add items to cart.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return;
    }
    addToCart(productId, sellerId, price, 1);
}

// ─── Pagination Controls ──────────────────────
function renderPagination(totalPages, filtered) {
    const container = document.getElementById('paginationControls');
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';

    html += `<button class="btn btn-outline-secondary btn-sm"
                ${currentPageNum === 1 ? 'disabled' : ''}
                onclick="goToPage(${currentPageNum - 1}, event)">
                <i class="bi bi-chevron-left"></i>
             </button>`;

    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPageNum ? 'btn-success' : 'btn-outline-secondary';
        html += `<button class="btn ${active} btn-sm" onclick="goToPage(${i}, event)">${i}</button>`;
    }

    html += `<button class="btn btn-outline-secondary btn-sm"
                ${currentPageNum === totalPages ? 'disabled' : ''}
                onclick="goToPage(${currentPageNum + 1}, event)">
                <i class="bi bi-chevron-right"></i>
             </button>`;

    container.innerHTML = html;
}

function goToPage(page, e) {
    e?.preventDefault();
    currentPageNum = page;

    // Re-apply filters to get the current filtered list, then render new page
    const category = document.getElementById('filterCategory')?.value  || '';
    const size     = document.getElementById('filterSize')?.value      || '';
    const sort     = document.getElementById('filterSort')?.value      || 'newest';
    const search   = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';

    let filtered = [...allProducts];
    if (category) filtered = filtered.filter(p => p.category_id?._id === category || p.category_id === category);
    if (size)     filtered = filtered.filter(p => p.size === size);
    if (search)   filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    if (sort === 'price_asc')  filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'newest')     filtered.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

    renderPage(filtered);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterSize').value     = '';
    document.getElementById('filterSort').value     = 'newest';
    document.getElementById('searchInput').value    = '';
    applyFiltersAndRender();
}

// ─── Wire Controls ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    // Debounce search input
    let searchTimer;
    document.getElementById('searchInput')?.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFiltersAndRender, 350);
    });

    document.getElementById('filterCategory')?.addEventListener('change', applyFiltersAndRender);
    document.getElementById('filterSize')?.addEventListener('change', applyFiltersAndRender);
    document.getElementById('filterSort')?.addEventListener('change', applyFiltersAndRender);
});
