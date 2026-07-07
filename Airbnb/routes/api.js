const express = require('express');
const router = express.Router();
const listing = require('../models/schema.js');
const review = require('../models/review_schema.js');
const booking = require('../models/bookingSchema.js');
const User = require('../models/user_schema.js');
const passport = require('passport');
const { isLogged } = require('../middleware.js');

// ===================== LISTINGS =====================

router.get('/listings', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category_type: category } : {};
        const all_listings = await listing.find(filter).populate('owner').lean();
        res.json(all_listings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/listings/:id', async (req, res) => {
    try {
        const list = await listing
            .findById(req.params.id)
            .populate({ path: 'reviews', populate: { path: 'author' } })
            .populate('owner');
        if (!list) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        return res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== AUTH =====================

// Get current logged-in user
router.get('/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            profile_pic: req.user.profile_pic,
        });
    }
    return res.json(null);
});

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({
                _id: registeredUser._id,
                username: registeredUser.username,
                email: registeredUser.email,
                profile_pic: registeredUser.profile_pic,
            });
        });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Signup failed' });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: info?.message || 'Invalid username or password' });
        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profile_pic: user.profile_pic,
            });
        });
    })(req, res, next);
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: 'Logged out successfully' });
    });
});

// ===================== REVIEWS =====================

// Add a review to a listing
router.post('/listings/:id/reviews', isLogged, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const newReview = new review({ rating, comment, author: req.user._id });
        const foundListing = await listing.findById(req.params.id);
        if (!foundListing) return res.status(404).json({ error: 'Listing not found' });

        foundListing.reviews.push(newReview);
        await newReview.save();
        await foundListing.save();

        // Populate author before sending back
        await newReview.populate('author');
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a review
router.delete('/listings/:id/reviews/:reviewId', isLogged, async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        const foundReview = await review.findById(reviewId);
        if (!foundReview) return res.status(404).json({ error: 'Review not found' });

        // Check if user is the author
        if (!foundReview.author.equals(req.user._id)) {
            return res.status(403).json({ error: 'You are not the author of this review' });
        }

        await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await review.findByIdAndDelete(reviewId);
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== BOOKINGS =====================

// Create a booking
router.post('/bookings/:id', isLogged, async (req, res) => {
    try {
        const { id } = req.params;
        const foundListing = await listing.findById(id);
        if (!foundListing) return res.status(404).json({ error: 'Listing not found' });

        const { fullname, phone_no, checkin, checkout } = req.body;

        // Calculate total price
        const days = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
        const totalPrice = days * (foundListing.price || 0);

        const newBooking = new booking({
            fullname,
            phone_no,
            checkin,
            checkout,
            totalPrice,
            owneruser: foundListing.owner,
            bookinguser: req.user._id,
            bookedlisting: foundListing._id,
        });

        // Prevent self-booking
        if (foundListing.owner && foundListing.owner.equals(req.user._id)) {
            return res.status(400).json({ error: 'You cannot book your own listing' });
        }

        await newBooking.save();

        // Update guest bookings
        await User.findByIdAndUpdate(req.user._id, { $push: { guest_bookings: newBooking._id } });
        // Update host bookings
        if (foundListing.owner) {
            await User.findByIdAndUpdate(foundListing.owner, { $push: { host_bookings: newBooking._id } });
        }

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get user's trips (bookings they made as guest)
router.get('/trips', isLogged, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'guest_bookings',
            populate: [
                { path: 'bookedlisting' },
                { path: 'owneruser' },
            ],
            options: { sort: { bookingAt: -1 } },
        });
        res.json(user.guest_bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get bookings on user's listings (they are the host)
router.get('/bookings', isLogged, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'host_bookings',
            populate: [
                { path: 'bookedlisting' },
                { path: 'bookinguser' },
            ],
            options: { sort: { bookingAt: -1 } },
        });
        res.json(user.host_bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
