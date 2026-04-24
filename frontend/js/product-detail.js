/* ============================================
   UNIFORMITY - product-detail.js
   Phase 5: Fetch single product by URL ?id=
   ============================================ */

let currentProduct = null;
let selectedQty = 1;

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
    } catch {
        showError();
    }
}

function renderProduct(product) {
    const price = `PHP ${Number(product.price).toFixed(2)}`;
    const seller = product.seller_id?.name || 'Unknown Seller';
    const email = product.seller_id?.email || '';
    const category = product.category_id?.name || '-';
    const listedAt = product.createdAt || product.created_at;
    const listed = listedAt
        ? new Date(listedAt).toLocaleDateString('en-PH', { dateStyle: 'medium' })
        : '';

    const imgContainer = document.getElementById('detailImage');
    if (imgContainer) {
        imgContainer.innerHTML = product.image_url
            ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;border-radius:var(--radius);object-fit:cover;max-height:420px;" />`
            : `<i class="bi bi-image" style="color:var(--text-muted);font-size:3rem;"></i>`;
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

    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please log in to add items to cart.', 'error');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                return;
            }

            addToCart(product._id, product.seller_id?._id || '', product.price, selectedQty);
        };
    }

    document.getElementById('detailLoading').style.display = 'none';
    document.getElementById('detailBody').style.display = '';
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
});
