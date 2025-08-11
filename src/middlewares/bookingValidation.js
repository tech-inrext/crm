// bookingValidation.js
import {body, param} from 'express-validator'
 
// const SiteVisit = require('../models/SiteVisit');
import CabBooking from '../models/CabBooking';
 import Vehicle from '../models/Vehicle'
 import User from '../models/User'
 import Project from '../models/Project'
 

exports.validateBooking = [
  body('project')
    .notEmpty().withMessage('Project is required')
    .isMongoId().withMessage('Invalid project ID')
    .custom(async (value) => {
      const project = await Project.findById(value);
      if (!project) {
        throw new Error('Project not found');
      }
      return true;
    }),

  body('clientName')
    .notEmpty().withMessage('Client name is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Client name must be less than 100 characters'),

  body('numberOfClients')
    .notEmpty().withMessage('Number of clients is required')
    .isInt({ min: 1 }).withMessage('At least 1 client required')
    .isInt({ max: 20 }).withMessage('Maximum 20 clients allowed'),

  body('pickupPoint')
    .notEmpty().withMessage('Pickup point is required')
    .trim()
    .isLength({ max: 200 }).withMessage('Pickup point must be less than 200 characters'),

  body('dropPoint')
    .notEmpty().withMessage('Drop point is required')
    .trim()
    .isLength({ max: 200 }).withMessage('Drop point must be less than 200 characters'),

  body('employeeName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Employee name must be less than 100 characters'),

  body('requestedDateTime')
    .notEmpty().withMessage('Requested date/time is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const bookingDate = new Date(value);
      const now = new Date();
      // Ensure booking is at least 1 hour in the future
      if (bookingDate <= new Date(now.getTime() + 60 * 60 * 1000)) {
        throw new Error('Booking must be at least 1 hour from now');
      }
      return true;
    }),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

exports.validateStatusUpdate = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID')
    .custom(async (value, { req }) => {
      const booking = await CabBooking.findById(value);
      if (!booking) {
        throw new Error('Booking not found');
      }
      return true;
    }),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['approved', 'rejected', 'completed']).withMessage('Invalid status'),

  body('driver')
    .optional()
    .isMongoId().withMessage('Invalid driver ID')
    .custom(async (value) => {
      const driver = await User.findById(value);
      if (!driver || driver.role !== 'driver') {
        throw new Error('Invalid driver specified');
      }
      return true;
    }),

  body('vehicle')
    .optional()
    .isMongoId().withMessage('Invalid vehicle ID')
    .custom(async (value) => {
      const vehicle = await Vehicle.findById(value);
      if (!vehicle || !vehicle.isAvailable) {
        throw new Error('Invalid or unavailable vehicle specified');
      }
      return true;
    }),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

exports.validateSiteVisit = [
  body('project')
    .notEmpty().withMessage('Project is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Project name must be less than 100 characters'),

  body('clientName')
    .notEmpty().withMessage('Client name is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Client name must be less than 100 characters'),

  body('employeeName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Employee name must be less than 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

exports.validateSiteVisitStatusUpdate = [
  param('id')
    .isMongoId().withMessage('Invalid site visit ID')
    .custom(async (value, { req }) => {
      const siteVisit = await SiteVisit.findById(value);
      if (!siteVisit) {
        throw new Error('Site visit not found');
      }
      return true;
    }),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['approved', 'rejected', 'completed', 'cancelled']).withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];


