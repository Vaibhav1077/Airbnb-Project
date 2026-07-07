import { useState, useEffect } from 'react';
import { getBookings } from '../api';
import './Bookings.css';

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="bookings-page">
      <h1>Bookings on My Listings</h1>
      {bookings.length === 0 ? (
        <p className="empty-message">No bookings yet on your listings.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-img">
                <img
                  src={booking.bookedlisting?.image?.[0]?.url || 'https://via.placeholder.com/200x130'}
                  alt={booking.bookedlisting?.title}
                />
              </div>
              <div className="booking-details">
                <h3>{booking.bookedlisting?.title || 'Listing'}</h3>
                <p><strong>Guest:</strong> {booking.bookinguser?.username || booking.fullname}</p>
                <p><strong>Phone:</strong> {booking.phone_no}</p>
                <p><strong>Check-in:</strong> {new Date(booking.checkin).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(booking.checkout).toLocaleDateString()}</p>
                <p><strong>Total:</strong> &#8377;{booking.totalPrice?.toLocaleString('en-IN')}</p>
                <span className={`status-badge status-${booking.bookingStatus}`}>{booking.bookingStatus}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
