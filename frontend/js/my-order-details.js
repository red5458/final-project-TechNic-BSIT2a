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
        if (order.status === 'pending') {
            actionCard.style.display = '';
            actionCard.style.background = '#fff';
            actionCard.style.border = '1px solid var(--border)';
            actionCard.style.color = 'var(--text)';
            actionCard.innerHTML = `
                <h6 style="font-weight:700;font-size:1.1rem;margin-bottom:.5rem;color:var(--text);">Pending Order</h6>
                <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:1.25rem;line-height:1.6;">
                    The seller has not fulfilled this order yet. You can cancel it while it is still pending.
                </p>
                <button class="btn btn-outline-danger w-100" id="cancelOrderDetailBtn"
                    style="padding:.8rem;border-radius:50px;transition:var(--transition);">
                    <i class="bi bi-x-circle-fill me-2"></i>Cancel Order
                </button>`;

            const cancelBtn = document.getElementById('cancelOrderDetailBtn');
            if (cancelBtn) cancelBtn.onclick = () => confirmCancelOrder(order._id, cancelBtn);
        } else if (order.status === 'shipped') {
            actionCard.style.display = '';
            actionCard.innerHTML = `
                <h6 style="font-weight:700;font-size:1.1rem;margin-bottom:.5rem;color:#fff;">Order has Shipped!</h6>
                <p style="font-size:.88rem;color:rgba(255,255,255,.8);margin-bottom:1.25rem;line-height:1.6;">
                    Your items are on the way. Once you receive them, please confirm delivery to complete the order.
                </p>
                <button class="btn w-100" id="confirmReceiptDetailBtn"
                    style="background:#fff;color:var(--primary-dark);font-weight:700;padding:.8rem;border-radius:50px;transition:var(--transition);">
                    <i class="bi bi-check-circle-fill me-2"></i>Confirm Receipt
                </button>`;

            const actionBtn = document.getElementById('confirmReceiptDetailBtn');
            if (actionBtn) actionBtn.onclick = () => confirmReceipt(order._id, actionBtn);
        } else {
            actionCard.style.display = 'none';
        }
    }
}

let pendingCancelConfirmation = null;
let pendingReceiptConfirmation = null;

function confirmCancelOrder(orderId, btn) {
    pendingCancelConfirmation = { orderId, btn };

    const modalEl = document.getElementById('cancelOrderModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function submitCancelConfirmation() {
    const token = localStorage.getItem('token');
    if (!token || !pendingCancelConfirmation) return;

    const { orderId, btn } = pendingCancelConfirmation;
    const confirmBtn = document.getElementById('confirmCancelOrderBtn');
    const originalText = btn?.innerHTML;
    const originalConfirmText = confirmBtn?.innerHTML;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cancelling...';
    }
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cancelling...';
    }

    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.msg || 'Could not cancel order.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('cancelOrderModal'));
        if (modal) modal.hide();

        pendingCancelConfirmation = null;
        showToast('Order cancelled.');
        await loadOrderDetails();
        window.dispatchEvent(new Event('orders-updated'));
    } catch (err) {
        showToast(err.message || 'Could not cancel order.', 'error');
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
    document.getElementById('confirmCancelOrderBtn')?.addEventListener('click', submitCancelConfirmation);
    document.getElementById('confirmReceiptBtn')?.addEventListener('click', submitReceiptConfirmation);
    loadOrderDetails();
});
