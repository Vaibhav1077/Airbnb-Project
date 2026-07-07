import { useState, useEffect } from 'react';
import { getTrips } from '../api';
import { Link } from 'react-router-dom';
import './Bookings.css';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrips()
      .then((res) => setTrips(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading your trips...</div>;

  return (
    <div className="bookings-page">
      <h1>My Trips</h1>
      {trips.length === 0 ? (
        <p className="empty-message">No trips yet. <Link to="/">Browse listings</Link> and book your first stay!</p>
      ) : (
        <div className="bookings-list">
          {trips.map((trip) => (
            <div key={trip._id} className="booking-card">
              <div className="booking-img">
                <img
                  src={trip.bookedlisting?.image?.[0]?.url || 'https://via.placeholder.com/200x130'}
                  alt={trip.bookedlisting?.title}
                />
              </div>
              <div className="booking-details">
                <h3>{trip.bookedlisting?.title || 'Listing'}</h3>
                <p>{trip.bookedlisting?.location}, {trip.bookedlisting?.country}</p>
                <p><strong>Check-in:</strong> {new Date(trip.checkin).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(trip.checkout).toLocaleDateString()}</p>
                <p><strong>Total:</strong> &#8377;{trip.totalPrice?.toLocaleString('en-IN')}</p>
                <span className={`status-badge status-${trip.bookingStatus}`}>{trip.bookingStatus}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
