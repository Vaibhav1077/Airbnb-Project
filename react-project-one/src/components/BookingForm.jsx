import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api';
import { toast } from 'react-toastify';
import './BookingForm.css';

export default function BookingForm({ listing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: '',
    phone_no: '',
    checkin: '',
    checkout: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    setSubmitting(true);
    try {
      await createBooking(listing._id, form);
      toast.success('Booking confirmed!');
      setForm({ fullname: '', phone_no: '', checkin: '', checkout: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate nights and total
  const nights = form.checkin && form.checkout
    ? Math.ceil((new Date(form.checkout) - new Date(form.checkin)) / (1000 * 60 * 60 * 24))
    : 0;
  const total = nights > 0 ? nights * (listing.price || 0) : 0;

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-dates">
        <div className="booking-field">
          <label>Check-in</label>
          <input type="date" name="checkin" value={form.checkin} onChange={handleChange} min={today} required />
        </div>
        <div className="booking-field">
          <label>Check-out</label>
          <input type="date" name="checkout" value={form.checkout} onChange={handleChange} min={form.checkin || today} required />
        </div>
      </div>
      <div className="booking-field">
        <label>Full Name</label>
        <input type="text" name="fullname" value={form.fullname} onChange={handleChange} placeholder="Your full name" required minLength={3} />
      </div>
      <div className="booking-field">
        <label>Phone Number</label>
        <input type="tel" name="phone_no" value={form.phone_no} onChange={handleChange} placeholder="10 digit mobile number" required pattern="[6-9][0-9]{9}" />
      </div>

      {nights > 0 && (
        <div className="booking-summary">
          <p>&#8377;{listing.price?.toLocaleString('en-IN')} x {nights} night{nights > 1 ? 's' : ''}</p>
          <p className="booking-total">Total: &#8377;{total.toLocaleString('en-IN')}</p>
        </div>
      )}

      <button type="submit" className="btn-book" disabled={submitting}>
        {submitting ? 'Booking...' : 'Reserve'}
      </button>
    </form>
  );
}
