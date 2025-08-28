// models/VendorBooking.js
import mongoose from "mongoose";

const vendorBookingSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  driverName: { type: String, required: true },
  startKm: { type: Number, required: true },
  endKm: { type: Number, required: true },
  totalKm: { type: Number, required: true },
  pickupPoint: { type: String, required: true },
  dropPoint: { type: String, required: true },
  employeeName: { type: String, required: true },
  teamHead: { 
    type: String, 
    required: true,
    enum: [
      "Mr. Awadhesh Kumar",
      "Mr. Shiva Karki",
      "Mr. Sartaj Ali",
      "Ms. Pooja",
      "Mr. Raghunandan Kumar",
      "Mr. Rahul Singh Parihar",
      "Mr. Shivam Tripathi",
      "Mr. Santosh Kumar Singh",
      "Mr. Nitin Kumar Sharma",
      "Mr. Pankaj Mohapatra",
      "Mr. Dinesh Kumar Diwakar",
      "Mr. Biraj Kumar Byapari",
      "Mr. S.S. Dwivedi",
      "Mr. Sujeet Mehta",
      "Mr. Deepak Kumar",
      "Mohd. Kaleem",
      "Mr. Manish Kumar",
      "Mr. Rajendra Chauhan",
      "Mr. Subodh Khantwal",
      "Mr. Arun Kumar",
      "Inrext Pvt. Ltd."
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorBooking', vendorBookingSchema);
