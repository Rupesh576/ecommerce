import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/products/${id}`)
      .then(({ data }) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError('Product not found.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      navigate('/');
    } catch {
      alert('Failed to delete product.');
      setDeleting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    setMessage('');
    try {
      await addItem(product._id, quantity);
      setMessage('Added to cart!');
    } catch {
      setMessage('Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p className="status-message">Loading…</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (!product) return null;

  return (
    <>
      <div className="product-detail">
        <div className="product-detail-image" aria-hidden="true">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-detail-img" />
          ) : (
            product.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="product-detail-body">
          <div className="product-title-row">
            <h1>{product.name}</h1>
            {isAdmin && (
              <div className="admin-detail-actions">
                <button
                  type="button"
                  className="btn-admin-edit"
                  onClick={() => setModalOpen(true)}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="btn-admin-delete"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : '🗑️ Delete'}
                </button>
              </div>
            )}
          </div>

          <p className="product-card-category">{product.category}</p>
          <p className="product-detail-description">{product.description}</p>
          <p className="price large">${product.price.toFixed(2)}</p>
          <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="add-to-cart-row">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
              <button onClick={handleAddToCart} disabled={adding}>
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>
          )}
          {message && <p className="status-message">{message}</p>}
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={product}
          onClose={() => setModalOpen(false)}
          onSaved={(updated) => setProduct(updated)}
        />
      )}
    </>
  );
}
