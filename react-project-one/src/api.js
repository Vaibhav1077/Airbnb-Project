import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Listings
export const getListings = (category) =>
  api.get('/listings', { params: category ? { category } : {} });
export const getListing = (id) => api.get(`/listings/${id}`);

// Auth
export const getCurrentUser = () => api.get('/current-user');
export const signup = (data) => api.post('/signup', data);
export const login = (data) => api.post('/login', data);
export const logout = () => api.post('/logout');

// Reviews
export const addReview = (listingId, data) =>
  api.post(`/listings/${listingId}/reviews`, data);
export const deleteReview = (listingId, reviewId) =>
  api.delete(`/listings/${listingId}/reviews/${reviewId}`);

// Bookings
export const createBooking = (listingId, data) =>
  api.post(`/bookings/${listingId}`, data);
export const getTrips = () => api.get('/trips');
export const getBookings = () => api.get('/bookings');

// Profile
export const updateProfile = (formData) =>
  api.put('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (listingId) => api.post(`/wishlist/${listingId}`);
export const removeFromWishlist = (listingId) => api.delete(`/wishlist/${listingId}`);

export default api;
