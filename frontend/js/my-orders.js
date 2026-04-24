/* ============================================
   UNIFORMITY - my-orders.js
   Phase 5: Fetch + Render Buyer Order History
   ============================================ */

async function loadMyOrders() {
    const token = localStorage.getItem('token');
    const user = getUser();
    const container = document.getElementById('ordersContainer');

    if (!container || !token || !user?._id) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-3 text-muted" style="font-size:.9rem;">Loading your orders...</p>
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/orders`, {
            headers: { 'x-auth-token': token }
        });
        const orders = await res.json();

        orders.length === 0 ? renderEmptyOrders() : renderOrders(orders);
    } catch {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-wifi-off fs-1 text-muted"></i>
                <p class="mt-3 text-muted">Could not load orders. Please try again.</p>
            </div>`;
    }
}

function renderOrders(orders) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    container.innerHTML = `<div class="row m-0">${orders.map((order) => buildOrderCard(order)).join('')}</div>`;
}

function buildOrderCard(order) {
    const firstItem = order.items?.[0];
    const firstName = firstItem?.product_id?.name || 'Order Item';
    const extraCount = (order.items?.length || 1) - 1;
    const extraText = extraCount > 0
        ? ` <span style="font-weight:400;font-size:.85rem;color:var(--text-muted);">(+${extraCount} other item/s)</span>`
        : '';
    const total = `PHP ${Number(order.total_amount).toFixed(2)}`;
    const orderDate = order.createdAt || order.created_at;
    const placedDate = orderDate
        ? new Date(orderDate).toLocaleDateString('en-PH', { dateStyle: 'medium' })
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

    const actionBtn = order.status === 'shipped'
        ? `<button class="btn-green"
                style="padding:.3rem .75rem;font-size:.78rem;border-radius:var(--radius-sm);"
                onclick="event.stopPropagation(); confirmReceipt('${order._id}', this)">
                <i class="bi bi-check-circle me-1"></i>Received
           </button>`
        : order.status === 'delivered'
            ? `<span class="status-badge status-delivered" style="display:inline-flex;align-items:center;gap:.3rem;">
                <i class="bi bi-check-circle-fill"></i>Completed
           </span>`
            : '';

    const imgHTML = firstItem?.product_id?.image_url
        ? `<img src="${firstItem.product_id.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`
        : `<i class="bi bi-image"></i>`;

    return `
        <div class="col-12 mb-3">
            <div class="order-card"
                style="border:1px solid var(--border);border-radius:var(--radius);padding:1rem;background:#fff;cursor:pointer;transition:transform 0.1s,box-shadow 0.1s;"
                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)';"
                onmouseout="this.style.transform='none';this.style.boxShadow='none';"
                onclick="window.location.href='my-order-details.html?id=${order._id}'">
                <div class="d-flex gap-3">
                    <div style="width:80px;height:80px;background:var(--bg-soft);border-radius:var(--radius-sm);border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--text-muted);overflow:hidden;">
                        ${imgHTML}
                    </div>
                    <div class="flex-grow-1 d-flex flex-column justify-content-center">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span style="font-size:.82rem;font-weight:500;color:var(--text-muted);">
                                Order ID: #${order._id.slice(-8).toUpperCase()}
                            </span>
                            <span class="status-badge ${statusCls}">${statusTxt}</span>
                        </div>
                        <div style="font-size:1.05rem;font-weight:600;color:var(--text);line-height:1.2;margin-bottom:.35rem;">
                            ${firstName}${extraText}
                        </div>
                        <div class="d-flex justify-content-between align-items-end mt-auto">
                            <div style="font-size:.85rem;color:var(--text-muted);">Placed on ${placedDate}</div>
                            <div class="d-flex align-items-center gap-3">
                                <strong style="color:var(--text);font-size:1.1rem;">${total}</strong>
                                <div onclick="event.stopPropagation();">${actionBtn}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function confirmReceipt(orderId) {
    showToast('Confirm receipt will be fully implemented in Phase 6.', 'error');
}

function renderEmptyOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-bag-x fs-1 text-muted"></i>
            <p class="mt-3 text-muted">You haven't placed any orders yet.</p>
            <a href="dashboard.html" class="btn-green mt-2" style="padding:.5rem 1.5rem;">Browse Uniforms</a>
        </div>`;
}

document.addEventListener('DOMContentLoaded', loadMyOrders);
