import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#ff385c">
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.267 3.42-6.414 3.615l-.28.019-.267.006C5.377 31 2.5 28.584 2.5 24.522l.005-.469c.026-.928.23-1.768.83-3.244l.216-.524c.966-2.298 5.146-11.02 7.076-14.842l.53-1.017C12.545 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.605 2.24l-.009.33v.206c0 2.946 2.036 4.478 4.357 4.478 1.71 0 3.548-.977 5.342-2.79l.602-.623.58-.611.095.1.572.6c1.836 1.878 3.725 2.91 5.472 3.054l.264.013.263.003c2.321 0 4.357-1.532 4.357-4.478l-.002-.318c-.028-.648-.17-1.263-.547-2.166l-.193-.457c-.96-2.26-5.107-10.94-7.064-14.724l-.528-1.019C18.053 3.539 17.24 3 16 3z" />
        </svg>
        <span>airbnb</span>
      </Link>

      <div className="navbar-links">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <Link to="/trips" className="nav-link">My Trips</Link>
            <Link to="/bookings" className="nav-link">Host Bookings</Link>
            <Link to="/profile" className="user-menu">
              <img src={user.profile_pic} alt={user.username} className="user-avatar" />
              <span className="user-name">{user.username}</span>
            </Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link btn-signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
