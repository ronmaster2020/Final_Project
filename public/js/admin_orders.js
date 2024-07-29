$(document).ready(function() {
    // Animate loading bar to 100% width
    $('#loadingBar .progress-bar').animate({ width: '100%' }, 2500, function() {
        $('#ordersBody').hide();
        fetchOrders();
        $('#loadingBar').hide();
        $('#ordersBody').show();
    });

    // Function to fetch orders and populate the table
    function fetchOrders() {
        $.ajax({
            url: '/order/all',
            method: 'GET',
            success: function(data) {
                if (!Array.isArray(data)) {
                    console.error('Error: Expected an array but received:', data);
                    showToast('Failed to fetch orders: Unexpected response', 'error');
                    return;
                }

                const sortOrder = $('#dateSort').val();
                const statusFilter = $('#statusFilter').val();
                const startDate = $('#startDate').val();
                const endDate = $('#endDate').val();

                // Sort orders by date
                data = sortOrdersByDate(data, sortOrder);

                // Filter orders by status and date range
                data = filterOrders(data, statusFilter, startDate, endDate);

                // Populate orders table
                $('#ordersBody').empty();
                data.forEach(function(order) {
                    let totalPrice = order.order_items.reduce((acc, item) => {
                        return acc + (item.price * item.quantity);
                    }, 0);

                    $('#ordersBody').append(`
                        <tr>
                            <td>${order._id}</td>
                            <td>${order.order_items.length}</td>
                            <td>${totalPrice.toFixed(2)}</td>
                            <td>${getStatusText(order.status)}</td>
                            <td>${new Date(order.order_date).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-outline-secondary delete-btn" data-order-id="${order._id}">Delete Order</button>
                                <button class="btn btn-outline-secondary view-products-btn" data-order-id="${order._id}">View Products</button>
                            </td>
                        </tr>
                    `);
                });

                // Attach click event handlers after appending orders
                $('.delete-btn').on('click', function() {
                    const orderId = $(this).data('order-id');
                    showDeleteConfirmation(orderId);
                });

                $('.view-products-btn').on('click', function() {
                    const orderId = $(this).data('order-id');
                    fetchProductsForOrder(orderId);
                });
            },
            error: function(err) {
                console.error('Error fetching orders:', err);
                showToast('Failed to fetch orders', 'error');
            }
        });
    }

    // Function to sort orders by date
    function sortOrdersByDate(orders, sortOrder) {
        if (sortOrder === 'all') {
            return orders; // No sorting needed
        }
        return orders.sort((a, b) => {
            const dateA = new Date(a.order_date);
            const dateB = new Date(b.order_date);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    // Function to filter orders by status and date range
    function filterOrders(orders, status, startDate, endDate) {
        return orders.filter(order => {
            const orderDate = new Date(order.order_date);
            const isStatusMatch = !status || getStatusText(order.status).toLowerCase() === status.toLowerCase();
            const isInDateRange = (!startDate || orderDate >= new Date(startDate)) &&
                                  (!endDate || orderDate <= new Date(endDate));
            return isStatusMatch && isInDateRange;
        });
    }

    // Function to fetch products for a specific order
    function fetchProductsForOrder(orderId) {
        $.ajax({
            url: `/order/${orderId}`,
            method: 'GET',
            success: function(data) {
                $('#modalOrderID').text(orderId);
                $('#modalProductsList').empty();

                data.order_items.forEach(async function(item) {
                    try {
                        const product = await getProductDetails(item.productId);
                        if (product) {
                            $('#modalProductsList').append(`
                                <div class="product-item">
                                    <p><strong>${product.name}</strong></p>
                                    <p>Price: ${item.price}, Quantity: ${item.quantity}</p>
                                    <img src="/${product.images[0]}" alt="Product Image">
                                </div>
                            `);
                        }
                    } catch (err) {
                        console.error('Error fetching product details:', err);
                    }
                });

                // Show the modal
                $('#viewProductsModal').modal('show');
                $('.closemodal').on('click', function() {
                    $('#viewProductsModal').modal('hide');
                });
            },
            error: function(err) {
                console.error('Error fetching products for order:', err);
                showToast('Failed to fetch products for order', 'error');
            }
        });
    }

    // Function to fetch product details using async/await
    async function getProductDetails(productId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/product/${productId}`,
                method: 'GET',
                success: function(response) {
                    const product = response.product;
                    resolve(product);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error fetching product details:', errorThrown);
                    reject(errorThrown);
                }
            });
        });
    }

    // Function to delete an order
    function deleteOrder(id) {
        $.ajax({
            url: '/order/delete/' + id,
            method: 'POST',
            success: function() {
                fetchOrders(); // Refresh orders after deletion
                showToast('Order deleted successfully', 'success');
            },
            error: function(err) {
                console.error('Error deleting order:', err);
                showToast('Error deleting order', 'error');
            }
        });
    }

    // Function to display toast messages
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('show');
        }, 100);

        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Function to convert status code to text
    function getStatusText(status) {
        switch (status) {
            case 1:
                return 'Pending';
            case 2:
                return 'Processed';
            case 3:
                return 'Delivered';
            default:
                return 'Unknown';
        }
    }

    // Event listener for filter form submission
    $('#filterForm').on('submit', function(e) {
        e.preventDefault();
        fetchOrders();
    });

    // Event listener for reset button click
    $('#resetBtn').on('click', function(e) {
        e.preventDefault();
        $('#statusFilter').val('');
        $('#dateSort').val('all');
        $('#startDate').val('');
        $('#endDate').val('');
        fetchOrders();
    });

    function showDeleteConfirmation(orderId) {
        $('#deleteConfirmationModal').modal('show');
        $('#confirmDeleteButton').off('click').on('click', function() {
            $('#deleteConfirmationModal').modal('hide');
            deleteOrder(orderId);
        });
        $('#closeDaModal').on('click', function() {
            $('#deleteConfirmationModal').modal('hide');
        });
    }

    // Initial fetch of orders when document is ready
    fetchOrders();
});