import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/client';

export default function Cart() {
  const { cart, loading, updateItem, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <p className="status-message">Loading cart…</p>;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    setError('');
    setCheckingOut(true);
    try {
      const { data: order } = await api.post('/orders');
      await refreshCart();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return <p className="status-message">Your cart is empty.</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product._id}>
              <td>{item.product.name}</td>
              <td>${item.product.price.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.product._id, Math.max(1, Number(e.target.value)))}
                />
              </td>
              <td>${(item.product.price * item.quantity).toFixed(2)}</td>
              <td>
                <button className="link-button" onClick={() => removeItem(item.product._id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <span>Total: <strong>${total.toFixed(2)}</strong></span>
        <button onClick={handleCheckout} disabled={checkingOut}>
          {checkingOut ? 'Placing order…' : 'Checkout'}
        </button>
      </div>
      {error && <p className="status-message error">{error}</p>}
    </div>
  );
}
