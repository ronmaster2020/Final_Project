$(document).ready(function() {
    let orders = [];
    const userId = "668bfa4fa02553a02291e0c1"; 

   
    function fetchOrders() {
        $.ajax({
            url: '/orders/byid/' + userId, 
            method: 'GET',
            success: function(data) {
                orders = data;
                populateOrders(orders);
            },
            error: function(error) {
                console.log('Error fetching orders:', error);
            }
        });
    }

    
    function populateOrders(orders) {
        const orderHistoryContainer = $('#order-history');
        orderHistoryContainer.empty(); 

        if (orders.length === 0) {
            orderHistoryContainer.append('<p>No orders found.</p>');
            return;
        }

        orders.forEach(order => {
            
            let totalPrice = order.order_items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

            const orderElement = `
                <div class="order" data-order-id="${order._id}" data-status="${order.status} ">
                    <div class="order-header hover-div" onclick="toggleOrderDetails('${order._id}')">
                        <span class="order-date">${new Date(order.order_date).toLocaleDateString()}</span>
                        <span class="order-id">Order ID: ${order._id}</span>
                        <span class="order-total">Total: $${totalPrice.toFixed(2)}</span>
                    </div>
                    <div class="order-details" id="order-details-${order._id}">
                        ${order.order_items.map(item => `
                            <div class="order-item" >
                                <img src="${item.productId.images[0]}" alt="${item.productId.name}">
                                <p>Product: ${item.productId.name}</p>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: $${item.price.toFixed(2)}</p>
                                <button class="buy-again-btn" onclick="reorderItem('${item.productId._id}')">Buy It Again</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            orderHistoryContainer.append(orderElement);
        });
    }

    // Function to toggle order details
    window.toggleOrderDetails = function(orderId) {
        $(`#order-details-${orderId}`).toggleClass('visible');
    };

    // Function to filter orders based on status
    function filterOrders(status) {
        $('.filter-btn').removeClass('active');
        $(`.filter-btn[data-status="${status}"]`).addClass('active');

        if (status === 'all') {
            $('.order').show();
        } else {
            $('.order').hide();
            $(`.order[data-status="${status}"]`).show();
        }
    }

    // Event listener for filter buttons
    $('.filter-btn').on('click', function() {
        const status = $(this).data('status');
        filterOrders(status);
    });

    // Function to reorder an item (placeholder function, replace with actual logic)
    window.reorderItem = function(productId) {
        console.log('Reordering product with ID:', productId);
        // Implement your reorder logic here
    };

    // Fetch orders when the page loads
    fetchOrders();
});
