/* ============================================
   UNIFORMITY - product-detail.js
   Phase 5: Fetch single product by URL ?id=
   ============================================ */

let currentProduct = null;
let selectedQty = 1;
let imageZoom = 1;

async function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        showError();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/products/${productId}`);
        if (!res.ok) throw new Error('Not found');

        const product = await res.json();
        currentProduct = product;
        renderProduct(product);
        loadRelatedProducts(product);
    } catch {
        showError();
    }
}

function renderProduct(product) {
    const price = `PHP ${Number(product.price).toFixed(2)}`;
    const sellerInfo = product.seller_id || {};
    const seller = sellerInfo.name || 'Unknown Seller';
    const email = sellerInfo.email || '';
    const category = product.category_id?.name || '-';
    const stock = Number(product.quantity || 0);
    const isSoldOut = stock <= 0;
    const listedAt = product.createdAt || product.created_at;
    const listed = listedAt
        ? new Date(listedAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })
        : '';

    const imgContainer = document.getElementById('detailImage');
    if (imgContainer) {
        imgContainer.innerHTML = product.image_url
            ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;border-radius:var(--radius);object-fit:cover;max-height:420px;" />
               <button type="button" class="image-preview-trigger" aria-label="View full image">
                   <i class="bi bi-arrows-fullscreen"></i>
               </button>
               ${isSoldOut ? '<div class="sold-out-overlay">Sold Out</div>' : ''}`
            : `<i class="bi bi-image" style="color:var(--text-muted);font-size:3rem;"></i>
               ${isSoldOut ? '<div class="sold-out-overlay">Sold Out</div>' : ''}`;

        imgContainer.classList.toggle('is-clickable', Boolean(product.image_url));
        imgContainer.onclick = product.image_url
            ? () => openImagePreview(product.image_url, product.name || 'Product image')
            : null;
    }

    setText('detailName', product.name);
    setText('detailPrice', price);
    setText('detailSize', product.size || '-');
    setText('detailQty', product.quantity ?? '-');
    setText('detailCategory', category);
    setText('detailDescription', product.description || 'No description provided.');
    setText('sellerName', seller);
    setText('sellerEmail', email);
    setText('detailListedDate', listed ? `Listed on ${listed}` : '');

    const avatarEl = document.getElementById('sellerAvatar');
    if (avatarEl) avatarEl.textContent = seller.charAt(0).toUpperCase();

    renderSellerContact(sellerInfo);

    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.disabled = isSoldOut;
        addBtn.classList.toggle('btn-add-cart-disabled', isSoldOut);
        addBtn.innerHTML = isSoldOut
            ? '<i class="bi bi-slash-circle me-2"></i>Sold Out'
            : '<i class="bi bi-cart-plus me-2"></i>Add to Cart';

        addBtn.onclick = () => {
            if (isSoldOut) {
                showToast('This product is sold out.', 'error');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please log in to add items to cart.', 'error');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                return;
            }

            addToCart(product._id, product.seller_id?._id || '', product.price, selectedQty, {
                name: product.name,
                size: product.size || '',
                image_url: product.image_url || '',
            });
        };
    }

    document.getElementById('detailLoading').style.display = 'none';
    document.getElementById('detailBody').style.display = '';
}

function openImagePreview(src, alt) {
    const modalEl = document.getElementById('imagePreviewModal');
    const imageEl = document.getElementById('imagePreviewImg');
    const titleEl = document.getElementById('imagePreviewTitle');
    if (!modalEl || !imageEl) return;

    imageZoom = 1;
    imageEl.src = src;
    imageEl.alt = alt;
    if (titleEl) titleEl.textContent = alt || 'Product Image';
    updateImageZoom();

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function updateImageZoom() {
    const imageEl = document.getElementById('imagePreviewImg');
    const labelEl = document.getElementById('imageZoomLabel');
    if (!imageEl) return;

    imageEl.style.transform = `scale(${imageZoom})`;
    imageEl.classList.toggle('is-zoomed', imageZoom > 1);
    if (labelEl) labelEl.textContent = `${Math.round(imageZoom * 100)}%`;
}

function changeImageZoom(delta) {
    imageZoom = Math.min(3, Math.max(1, Number((imageZoom + delta).toFixed(2))));
    updateImageZoom();
}

async function loadRelatedProducts(product) {
    const section = document.getElementById('youMayLikeSection');
    const grid = document.getElementById('youMayLikeGrid');
    if (!section || !grid) return;

    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error('Could not load related products.');

        const products = await res.json();
        const currentId = product._id;
        const currentCategoryId = product.category_id?._id || product.category_id;

        const available = (Array.isArray(products) ? products : [])
            .filter((item) => item._id !== currentId && Number(item.quantity || 0) > 0);

        const sameCategory = available.filter((item) =>
            (item.category_id?._id || item.category_id) === currentCategoryId
        );

        const others = available.filter((item) =>
            (item.category_id?._id || item.category_id) !== currentCategoryId
        );

        const related = [...sameCategory, ...others].slice(0, 4);
        if (related.length === 0) return;

        grid.innerHTML = related.map(buildRelatedCard).join('');
        section.style.display = '';
    } catch {
        section.style.display = 'none';
    }
}

function buildRelatedCard(product) {
    const name = product.name || 'Uniform listing';
    const image = product.image_url
        ? `<img src="${product.image_url}" alt="${name}" />`
        : `<div class="related-product-placeholder"><i class="bi bi-image"></i></div>`;
    const category = product.category_id?.name || '';
    const seller = product.seller_id?.name || 'Seller';

    return `
        <article class="related-product-card" onclick="window.location.href='product-detail.html?id=${product._id}'">
            <div class="related-product-img">${image}</div>
            <div class="related-product-body">
                <div class="related-product-meta">
                    <span>Size ${product.size || '-'}</span>
                    ${category ? `<span>${category}</span>` : ''}
                </div>
                <h3>${name}</h3>
                <p><i class="bi bi-person-fill me-1"></i>${seller}</p>
                <div class="related-product-bottom">
                    <strong>PHP ${Number(product.price || 0).toFixed(2)}</strong>
                    <span>${Number(product.quantity || 0)} left</span>
                </div>
            </div>
        </article>`;
}

function renderSellerContact(seller) {
    const noteEl = document.getElementById('sellerContactNote');
    const actionsEl = document.getElementById('sellerContactActions');
    if (!noteEl || !actionsEl) return;

    const actions = [];

    if (seller.email) {
        actions.push(`
            <a class="seller-contact-btn" href="mailto:${seller.email}">
                <i class="bi bi-envelope-fill"></i>Email
            </a>`);
    }

    if (seller.phone) {
        actions.push(`
            <a class="seller-contact-btn" href="tel:${seller.phone}">
                <i class="bi bi-telephone-fill"></i>${seller.phone}
            </a>`);
    }

    noteEl.textContent = actions.length
        ? 'Contact the seller using the details below.'
        : 'Seller has not added contact details yet.';
    actionsEl.innerHTML = actions.join('');
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function showError() {
    document.getElementById('detailLoading').style.display = 'none';
    document.getElementById('detailError').style.display = '';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();

    document.getElementById('qtyMinus')?.addEventListener('click', () => {
        if (selectedQty > 1) {
            selectedQty--;
            document.getElementById('qtyDisplay').textContent = selectedQty;
        }
    });

    document.getElementById('qtyPlus')?.addEventListener('click', () => {
        const max = currentProduct?.quantity ?? 99;
        if (selectedQty < max) {
            selectedQty++;
            document.getElementById('qtyDisplay').textContent = selectedQty;
        }
    });

    document.getElementById('imageZoomOutBtn')?.addEventListener('click', () => changeImageZoom(-0.25));
    document.getElementById('imageZoomInBtn')?.addEventListener('click', () => changeImageZoom(0.25));
    document.getElementById('imageZoomResetBtn')?.addEventListener('click', () => {
        imageZoom = 1;
        updateImageZoom();
    });

    document.getElementById('imagePreviewStage')?.addEventListener('wheel', (e) => {
        e.preventDefault();
        changeImageZoom(e.deltaY < 0 ? 0.15 : -0.15);
    }, { passive: false });

    document.getElementById('imagePreviewModal')?.addEventListener('hidden.bs.modal', () => {
        const imageEl = document.getElementById('imagePreviewImg');
        if (imageEl) imageEl.removeAttribute('src');
        imageZoom = 1;
    });
});
