import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">Shop</Link>
      <nav className="nav-links">
        <Link to="/">Products</Link>
        {user && (
          <>
            <Link to="/cart">Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Link>
            <Link to="/orders">Orders</Link>
          </>
        )}
        {user ? (
          <>
            <span className="nav-user">
              Hi, {user.name}
              {user.role === 'admin' && <span className="admin-badge">Admin</span>}
            </span>
            <button className="link-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
