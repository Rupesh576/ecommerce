import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status-message">Loading orders…</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (orders.length === 0) return <p className="status-message">You have no orders yet.</p>;

  return (
    <div>
      <h1>Your Orders</h1>
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order._id}>
            <Link to={`/orders/${order._id}`} className="order-row">
              <span>Order #{order._id.slice(-6)}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
