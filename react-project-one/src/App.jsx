import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Trips from './pages/Trips';
import HostBookings from './pages/HostBookings';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <WishlistProvider>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/bookings" element={<HostBookings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Routes>
            </main>
            <ToastContainer position="top-right" autoClose={3000} />
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
