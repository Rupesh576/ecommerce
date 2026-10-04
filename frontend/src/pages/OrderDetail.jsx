import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="status-message">Loading order…</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (!order) return null;

  return (
    <div>
      <h1>Order #{order._id.slice(-6)}</h1>
      <p>
        Placed on {new Date(order.createdAt).toLocaleString()} ·{' '}
        <span className={`status-badge status-${order.status}`}>{order.status}</span>
      </p>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.product?._id || item.product}>
              <td>{item.product?.name || 'Product removed'}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <span>Total: <strong>${order.totalAmount.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}
