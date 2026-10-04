import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-image" aria-hidden="true">
        {product.name.charAt(0).toUpperCase()}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-card-category">{product.category}</p>
        <div className="product-card-footer">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
            {product.stock > 0 ? 'In stock' : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}
