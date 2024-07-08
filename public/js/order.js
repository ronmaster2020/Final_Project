$(document).ready(function() {
  
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
                            <td>
                                <button id = "delete-btn" class="btn btn-outline-secondary delete-btn" data-order-id="${order._id}">Delete Order</button>
                            </td>
                        </tr>
                    `);
                });

              
                $('.delete-btn').on('click', function() {
                    const orderId = $(this).data('order-id');
                    deleteOrder(orderId); 
                });
            },
            error: function(err) {
                console.error('Error fetching orders:', err);
                showToast('Failed to fetch orders', 'error');
            }
        });
    }

  
    function deleteOrder(id) {
        $.ajax({
            url: '/order/delete/' + id, 
            method: 'POST',  
            success: function() {
                
                fetchOrders();  
                showToast('Order deleted successfully', 'success'); 
            },
            error: function(err) {
                console.error('Error deleting order:', err);
                showToast('Error deleting order', 'error'); 
            }
        });
    }

   
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

    //Function to convert status code to text
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

    //function to filter orders
    function filterOrdersClientSide(status) {
        $('#ordersBody tr').each(function() {
            const orderStatus = $(this).find('td:nth-child(4)').text().trim();
            if (status === '' || orderStatus.toLowerCase() === status.toLowerCase()) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    
    $('#filterForm').on('submit', function(e) {
        e.preventDefault();
        var status = $('#statusFilter').val();
        filterOrdersClientSide(status);
    });

   
    $('#resetBtn').on('click', function(e) {
        e.preventDefault();
        $('#statusFilter').val('');
        filterOrdersClientSide('');
    });

    
    fetchOrders();
});
