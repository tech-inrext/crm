// cabBookingRoutes.js
import express from 'express'
import cabBookingController from '../controllers/cabBookingController'
import validateBooking from '../middlewares/bookingValidation'


const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for team heads
router.post(
  '/',
  authController.restrictTo('team_head', 'cab_management', 'accounts'),
  validateBooking,
  cabBookingController.createBooking
);

router.get(
  '/my-bookings',
  authController.restrictTo('team_head', 'cab_management', 'accounts'),
  cabBookingController.getAllBookings
);

router.get(
  '/my-bookings/:id',
  authController.restrictTo('team_head', 'cab_management', 'accounts'),
  cabBookingController.getBooking
);

router.patch(
  '/my-bookings/:id/cancel',
  authController.restrictTo('team_head', 'cab_management', 'accounts'),
  cabBookingController.cancelBooking
);

// Routes for cab management
router.get(
  '/',
  authController.restrictTo('cab_management', 'accounts', 'super_admin'),
  cabBookingController.getAllBookings
);

router.get(
  '/my-bookings',
  authController.restrictTo('team_head', 'cab_management', 'accounts', 'super_admin'),
  cabBookingController.getAllBookings
);

router.get(
  '/:id',
  authController.restrictTo('cab_management', 'accounts', 'super_admin'),
  cabBookingController.getBooking
);


router.patch(
  '/:id/status',
  authController.restrictTo('cab_management', 'accounts', 'super_admin'),
  cabBookingController.updateBookingStatus
);

// Routes for drivers
router.patch(
  '/:id/tracking',
  authController.restrictTo('driver'),
  cabBookingController.updateTrackingInfo
);

// Available vehicles
router.get(
  '/vehicles/available',
  authController.restrictTo('cab_management', 'team_head', 'accounts', 'super_admin'),
  cabBookingController.getAvailableVehicles
);

module.exports = router;

