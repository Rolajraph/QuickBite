import { useState, useEffect } from 'react';
import { getAllOrdersRequest, updateOrderStatusRequest } from '../../api/orderApi';
import { formatCurrency } from '../../utils/formatCurrency';
import '../../styles/forms.css';
import '../../styles/admin.css';

// Mirrors backend/constants/orderStatus.js — keep in sync if backend changes
const ALLOWED_TRANSITIONS = {
  pending: ['preparing', 'cancelled'],
  preparing: ['on_the_way', 'cancelled'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAllOrdersRequest();
      setOrders(response.data.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatusRequest(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
  <div className="admin-page">
    <h1>Manage Orders</h1>
    <p>{orders.length} total orders</p>

    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update Status</th></tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const nextOptions = ALLOWED_TRANSITIONS[order.status] || [];
            const customer = order.customer || { name: 'Unknown customer', email: 'No email' };
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <tr key={order._id}>
                <td>
                  {customer.name}<br />
                  <small style={{ color: 'var(--color-muted)' }}>{customer.email}</small>
                </td>
                <td>{items.map((item) => <div key={item.food || item.name}>{item.name} × {item.quantity}</div>)}</td>
                <td>{formatCurrency(order.totalAmount || 0)}</td>
                <td><span className="admin-badge admin-badge--available">{order.status}</span></td>
                <td>
                  {nextOptions.length === 0 ? '—' : (
                    <select
                      defaultValue=""
                      disabled={updatingId === order._id}
                      onChange={(e) => e.target.value && handleStatusChange(order._id, e.target.value)}
                      className="admin-select"
                    >
                      <option value="" disabled>Change to...</option>
                      {nextOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
  );
};


export default ManageOrders;