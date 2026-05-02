/* ============================================
   UNIFORMITY - cart.js
   Phase 5: Fetch + Render Cart Items,
            Live Total, Checkout Link
   ============================================ */

let cartData = null; // full { cart, items } payload from backend
let pendingCartRemoval = null;

function saveCartItemCount(items = []) {
    const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    localStorage.setItem('cartItemCount', String(count));
    window.dispatchEvent(new Event('cart-updated'));
}

async function loadCart() {
    const user = getUser();
    const token = localStorage.getItem('token');
    const rightCol = document.getElementById('cartSummaryCol');

    if (rightCol) rightCol.style.display = 'none';

    if (!user || !token) {
        renderEmptyCart('Please log in to view your cart.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/cart/${user._id}`, {
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        cartData = data;

        const items = data?.items || [];
        saveCartItemCount(items);
        items.length === 0 ? renderEmptyCart() : renderCartItems(items);
    } catch {
        renderEmptyCart('Could not load cart. Please try again.');
    }
}

function renderCartItems(items) {
    const leftCol = document.getElementById('cartItemsCol');
    const rightCol = document.getElementById('cartSummaryCol');
    if (!leftCol) return;

    leftCol.className = 'col-lg-8';
    if (rightCol) rightCol.style.display = '';

    leftCol.innerHTML = items.map((item) => buildCartItem(item)).join('');

    leftCol.querySelectorAll('.cart-item-check').forEach((checkbox) => {
        checkbox.addEventListener('change', updateTotal);
    });

    updateTotal();
}

function buildCartItem(item) {
    const product = item.product_id;
    const productId = product?._id || '';
    const name = product?.name || 'Unknown Item';
    const size = product?.size || '';
    const price = Number(item.price || product?.price || 0);
    const qty = item.quantity || 1;
    const stock = Number(product?.quantity || 0);
    const imgHTML = product?.image_url
        ? `<img src="${product.image_url}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`
        : `<i class="bi bi-image" style="color:var(--text-muted);font-size:1.5rem;"></i>`;

    return `
        <div class="cart-item"
            data-item-id="${item._id}"
            data-product-id="${productId}"
            data-price="${price}"
            data-stock="${stock}"
            onclick="openCartProduct(this)"
            style="cursor:pointer;">
            <input type="checkbox" class="cart-item-check form-check-input" checked
                onclick="event.stopPropagation();"
                style="width:18px;height:18px;cursor:pointer;accent-color:var(--primary);flex-shrink:0;margin-right:.25rem;" />
            <div class="cart-item-img">${imgHTML}</div>
            <div class="flex-grow-1">
                <div class="cart-item-name">${name}</div>
                <div class="cart-item-meta">
                    ${size ? `Size: ${size}` : ''}
                </div>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="event.stopPropagation(); changeQty(this, -1)">-</button>
                <span class="qty-display">${qty}</span>
                <button class="qty-btn" onclick="event.stopPropagation(); changeQty(this, 1)">+</button>
            </div>
            <div class="cart-item-price">PHP ${(price * qty).toFixed(2)}</div>
            <button class="btn-sm-action btn-delete ms-2" title="Remove"
                onclick="event.stopPropagation(); confirmRemoveFromCart('${item._id}', this)">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>`;
}

function confirmRemoveFromCart(itemId, btn) {
    const item = cartData?.items?.find((cartItem) => cartItem._id === itemId);
    const name = item?.product_id?.name || 'This item';
    const nameEl = document.getElementById('deleteCartItemName');
    const modalEl = document.getElementById('deleteCartItemModal');

    pendingCartRemoval = { itemId, btn };

    if (nameEl) {
        nameEl.textContent = `${name} will be removed from your cart.`;
    }

    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function openCartProduct(el) {
    const productId = el?.dataset?.productId;
    if (!productId) return;
    window.location.href = `product-detail.html?id=${productId}`;
}

function changeQty(btn, delta) {
    const cartItem = btn.closest('.cart-item');
    const qtyEl = cartItem.querySelector('.qty-display');
    const priceEl = cartItem.querySelector('.cart-item-price');
    const unitPrice = parseFloat(cartItem.dataset.price);
    const maxStock = parseInt(cartItem.dataset.stock || '0', 10);

    let qty = parseInt(qtyEl.textContent, 10) + delta;
    if (qty < 1) qty = 1;
    if (maxStock > 0 && qty > maxStock) {
        qty = maxStock;
        showToast(`Only ${maxStock} item(s) available for this product.`, 'error');
    }

    qtyEl.textContent = qty;
    priceEl.textContent = `PHP ${(unitPrice * qty).toFixed(2)}`;

    const itemId = cartItem.dataset.itemId;
    const found = cartData?.items?.find((item) => item._id === itemId);
    if (found) found.quantity = qty;

    updateTotal();
}

function updateTotal() {
    const checkedItems = document.querySelectorAll('.cart-item-check:checked');
    let total = 0;

    checkedItems.forEach((checkbox) => {
        const cartItem = checkbox.closest('.cart-item');
        const unitPrice = parseFloat(cartItem.dataset.price);
        const qty = parseInt(cartItem.querySelector('.qty-display').textContent, 10);
        total += unitPrice * qty;
    });

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `PHP ${total.toFixed(2)}`;

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.textContent = `Checkout Selected · PHP ${total.toFixed(2)}`;
        checkoutBtn.style.opacity = total === 0 ? '0.5' : '1';
        checkoutBtn.style.pointerEvents = total === 0 ? 'none' : 'auto';
    }

    const checkoutItems = [];
    checkedItems.forEach((checkbox) => {
        const cartItem = checkbox.closest('.cart-item');
        const itemId = cartItem.dataset.itemId;
        const unitPrice = parseFloat(cartItem.dataset.price);
        const qty = parseInt(cartItem.querySelector('.qty-display').textContent, 10);
        const found = cartData?.items?.find((item) => item._id === itemId);

        if (found) {
            const product = found.product_id || {};
            checkoutItems.push({
                product_id: product?._id || found.product_id,
                seller_id: product?.seller_id?._id || '',
                name: product?.name || 'Unknown Item',
                size: product?.size || '',
                image_url: product?.image_url || '',
                price: unitPrice,
                quantity: qty,
            });
        }
    });

    localStorage.setItem('checkoutCart', JSON.stringify(checkoutItems));
    saveCartItemCount(cartData?.items || []);
}

async function removeFromCart(itemId, btn) {
    const token = localStorage.getItem('token');
    if (!token || !cartData?.cart?._id) return false;

    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/cart/item/${itemId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token },
        });
        if (!res.ok) throw new Error();

        btn.closest('.cart-item').remove();
        if (cartData?.items) {
            cartData.items = cartData.items.filter((item) => item._id !== itemId);
        }
        updateTotal();
        showToast('Item removed from cart.');

        if (document.querySelectorAll('.cart-item').length === 0) {
            renderEmptyCart();
        }
        return true;
    } catch {
        btn.disabled = false;
        showToast('Could not remove item. Try again.', 'error');
        return false;
    }
}

async function submitCartRemoval() {
    if (!pendingCartRemoval) return;

    const { itemId, btn } = pendingCartRemoval;
    const confirmBtn = document.getElementById('confirmDeleteCartItemBtn');
    const originalConfirmText = confirmBtn?.innerHTML;

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Removing...';
    }

    const removed = await removeFromCart(itemId, btn);

    if (removed) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCartItemModal'));
        if (modal) modal.hide();
        pendingCartRemoval = null;
    }

    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalConfirmText;
    }
}

function renderEmptyCart(message = 'Your cart is empty.') {
    const leftCol = document.getElementById('cartItemsCol');
    const rightCol = document.getElementById('cartSummaryCol');

    if (leftCol) {
        leftCol.className = 'col-12';
        leftCol.innerHTML = `
            <div class="state-center">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <p class="mt-3 text-muted">${message}</p>
                <a href="dashboard.html" class="btn-green mt-2" style="padding:.5rem 1.5rem;">Browse Uniforms</a>
            </div>`;
    }

    if (rightCol) rightCol.style.display = 'none';

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = 'PHP 0.00';

    localStorage.setItem('checkoutCart', '[]');
    saveCartItemCount([]);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmDeleteCartItemBtn')?.addEventListener('click', submitCartRemoval);
    loadCart();
});
