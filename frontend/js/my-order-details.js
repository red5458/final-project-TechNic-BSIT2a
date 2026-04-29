/* ============================================
   UNIFORMITY - my-order-details.js
   Phase 5: Fetch single order by URL ?id=
   ============================================ */

async function loadOrderDetails() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
        showOrderError();
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) throw new Error();

        const order = await res.json();
        renderOrderDetails(order);
    } catch {
        showOrderError();
    }
}

function renderOrderDetails(order) {
    const shortId = order._id.slice(-8).toUpperCase();
    const total = Number(order.total_amount).toFixed(2);
    const orderDate = order.createdAt || order.created_at;
    const placedDate = orderDate
        ? new Date(orderDate).toLocaleDateString('en-PH', { dateStyle: 'long' })
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

    const orderIdEl = document.getElementById('orderDetailId');
    if (orderIdEl) orderIdEl.textContent = `Order ID: #${shortId}`;

    const statusEl = document.getElementById('orderDetailStatus');
    if (statusEl) {
        statusEl.className = `status-badge ${statusCls}`;
        statusEl.textContent = statusTxt;
        statusEl.style.cssText = 'font-size:.85rem;padding:.4rem 1.2rem;';
    }

    const itemsContainer = document.getElementById('orderItemsContainer');
    if (itemsContainer) {
        itemsContainer.innerHTML = (order.items || []).map((item) => {
            const name = item.product_id?.name || 'Item';
            const price = Number(item.price).toFixed(2);
            const qty = item.quantity;
            const lineTotal = (item.price * item.quantity).toFixed(2);
            const imgHTML = item.product_id?.image_url
                ? `<img src="${item.product_id.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`
                : `<i class="bi bi-image" style="font-size:1.5rem;"></i>`;
            const fulfilled = item.status === 'fulfilled';

            return `
                <div class="order-detail-item">
                    <div style="width:70px;height:70px;background:var(--bg-soft);border-radius:var(--radius-sm);border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted);overflow:hidden;">
                        ${imgHTML}
                    </div>
                    <div class="flex-grow-1" style="min-width:0;">
                        <div class="cart-item-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
                        <div class="cart-item-meta" style="margin-top:.25rem;">PHP ${price} x ${qty}</div>
                        <div style="margin-top:.65rem;">
                            ${fulfilled
                                ? `<span style="color:var(--success);font-size:.78rem;font-weight:600;"><i class="bi bi-check-circle-fill me-1"></i>Fulfilled by Seller</span>`
                                : `<span style="color:var(--text-muted);font-size:.78rem;"><i class="bi bi-clock me-1"></i>Pending fulfillment</span>`
                            }
                        </div>
                    </div>
                    <div class="text-end" style="flex-shrink:0;">
                        <strong class="cart-item-price">PHP ${lineTotal}</strong>
                    </div>
                </div>`;
        }).join('');
    }

    const addressEl = document.getElementById('orderAddress');
    if (addressEl) addressEl.innerHTML = (order.delivery_address || '-').replace(/,\s*/g, '<br/>');

    const dateEl = document.getElementById('orderPlacedDate');
    if (dateEl) dateEl.textContent = placedDate;

    const subtotalEl = document.getElementById('orderSubtotal');
    if (subtotalEl) subtotalEl.textContent = `PHP ${total}`;

    const totalEl = document.getElementById('orderTotal');
    if (totalEl) totalEl.textContent = `PHP ${total}`;

    const actionCard = document.getElementById('orderActionCard');
    if (actionCard) {
        actionCard.style.display = order.status === 'shipped' ? '' : 'none';

        const actionBtn = actionCard.querySelector('button');
        if (actionBtn) {
            actionBtn.onclick = () => confirmReceipt(order._id, actionBtn);
        }
    }
}

let pendingReceiptConfirmation = null;

function confirmReceipt(orderId, btn) {
    pendingReceiptConfirmation = { orderId, btn };

    const modalEl = document.getElementById('confirmReceiptModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function submitReceiptConfirmation() {
    const token = localStorage.getItem('token');
    if (!token || !pendingReceiptConfirmation) return;

    const { orderId, btn } = pendingReceiptConfirmation;
    const confirmBtn = document.getElementById('confirmReceiptBtn');
    const originalText = btn?.innerHTML;
    const originalConfirmText = confirmBtn?.innerHTML;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }

    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/deliver`, {
            method: 'PATCH',
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not confirm receipt.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmReceiptModal'));
        if (modal) modal.hide();

        pendingReceiptConfirmation = null;
        showToast('Order marked as received.');
        await loadOrderDetails();
        window.dispatchEvent(new Event('orders-updated'));
    } catch (err) {
        showToast(err.message || 'Could not confirm receipt.', 'error');
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

function showOrderError() {
    const content = document.getElementById('orderContent');
    if (content) {
        content.innerHTML = `
            <div class="col-12 state-center">
                <i class="bi bi-exclamation-circle fs-1 text-muted"></i>
                <p class="mt-3 text-muted">Order not found. <a href="my-orders.html">Back to Orders</a></p>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmReceiptBtn')?.addEventListener('click', submitReceiptConfirmation);
    loadOrderDetails();
});
