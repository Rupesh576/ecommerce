import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/products')
      .then(({ data }) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load products. Is the backend running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSaved = (savedProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p._id === savedProduct._id);
      if (exists) {
        return prev.map((p) => (p._id === savedProduct._id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="status-message">Loading products…</p>;
  if (error) return <p className="status-message error">{error}</p>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Products</h1>
          {isAdmin && (
            <button className="add-product-btn" onClick={handleAdd}>
              ➕ Add Product
            </button>
          )}
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="status-message">No products found.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={isAdmin ? handleEdit : undefined}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
