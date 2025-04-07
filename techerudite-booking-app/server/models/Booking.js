const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  bookingDate: {
    type: Date,
    required: true,
    index: true // Index for faster queries on booking date
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['Full Day', 'Half Day', 'Custom'],
  },
  bookingSlot: {
    type: String,
    enum: ['First Half', 'Second Half', null],
    default: null
  },
  bookingTimeFrom: {
    type: Date,
    default: null
  },
  bookingTimeTo: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient overlap checking
bookingSchema.index({ bookingDate: 1, bookingType: 1, bookingSlot: 1 });

// Static method to check for booking overlaps
bookingSchema.statics.checkOverlap = async function(bookingData) {
  const { bookingDate, bookingType, bookingSlot, bookingTimeFrom, bookingTimeTo, _id } = bookingData;
  
  // Create a date object with just the date part for comparison
  const dateOnly = new Date(bookingDate);
  dateOnly.setHours(0, 0, 0, 0);
  
  // Base query to find bookings on the same date
  const baseQuery = {
    bookingDate: {
      $gte: dateOnly,
      $lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000)
    }
  };
  
  // Exclude the current booking if we're updating
  if (_id) {
    baseQuery._id = { $ne: _id };
  }
  
  // For performance reasons, we'll use different query strategies based on booking type
  
  // Case 1: If the new booking is Full Day, check for any existing bookings on that date
  if (bookingType === 'Full Day') {
    const existingBookings = await this.find(baseQuery).limit(1);
    return existingBookings.length > 0;
  }
  
  // Case 2: If the new booking is Half Day, check for full day bookings or conflicting half-day bookings
  if (bookingType === 'Half Day') {
    const conflictQuery = {
      ...baseQuery,
      $or: [
        { bookingType: 'Full Day' },
        { bookingType: 'Half Day', bookingSlot: bookingSlot }
      ]
    };
    const existingBookings = await this.find(conflictQuery).limit(1);
    return existingBookings.length > 0;
  }
  
  // Case 3: If the new booking is Custom, check for various conflicts
  if (bookingType === 'Custom') {
    // First check for full day bookings
    const fullDayBookings = await this.find({
      ...baseQuery,
      bookingType: 'Full Day'
    }).limit(1);
    
    if (fullDayBookings.length > 0) {
      return true;
    }
    
    // Check if time is in first half and there's a First Half booking
    const startHour = new Date(bookingTimeFrom).getHours();
    const endHour = new Date(bookingTimeTo).getHours();
    
    const morningConflict = (startHour < 12 || endHour < 12) && 
      await this.exists({
        ...baseQuery,
        bookingType: 'Half Day',
        bookingSlot: 'First Half'
      });
    
    if (morningConflict) {
      return true;
    }
    
    // Check if time is in second half and there's a Second Half booking
    const afternoonConflict = (startHour >= 12 || endHour >= 12) && 
      await this.exists({
        ...baseQuery,
        bookingType: 'Half Day',
        bookingSlot: 'Second Half'
      });
    
    if (afternoonConflict) {
      return true;
    }
    
    // Check for overlapping custom bookings
    const customConflicts = await this.find({
      ...baseQuery,
      bookingType: 'Custom',
      $or: [
        // New booking starts during an existing booking
        { bookingTimeFrom: { $lte: bookingTimeFrom }, bookingTimeTo: { $gte: bookingTimeFrom } },
        // New booking ends during an existing booking
        { bookingTimeFrom: { $lte: bookingTimeTo }, bookingTimeTo: { $gte: bookingTimeTo } },
        // New booking spans an entire existing booking
        { bookingTimeFrom: { $gte: bookingTimeFrom }, bookingTimeTo: { $lte: bookingTimeTo } }
      ]
    }).limit(1);
    
    return customConflicts.length > 0;
  }
  
  return false;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 