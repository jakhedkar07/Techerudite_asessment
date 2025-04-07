const Booking = require('../models/Booking');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      bookingDate,
      bookingType,
      bookingSlot,
      bookingTimeFrom,
      bookingTimeTo
    } = req.body;
    
    // Validate booking data based on type
    if (bookingType === 'Half Day' && !bookingSlot) {
      return res.status(400).json({ message: 'Booking slot is required for Half Day bookings' });
    }
    
    if (bookingType === 'Custom' && (!bookingTimeFrom || !bookingTimeTo)) {
      return res.status(400).json({ message: 'Booking time range is required for Custom bookings' });
    }
    
    // Create booking object with validated data
    const bookingData = {
      customerName,
      customerEmail,
      bookingDate,
      bookingType,
      userId: req.userId
    };
    
    // Add conditional fields based on booking type
    if (bookingType === 'Half Day') {
      bookingData.bookingSlot = bookingSlot;
    } else if (bookingType === 'Custom') {
      bookingData.bookingTimeFrom = bookingTimeFrom;
      bookingData.bookingTimeTo = bookingTimeTo;
    }
    
    // Check for overlapping bookings
    const hasOverlap = await Booking.checkOverlap(bookingData);
    
    if (hasOverlap) {
      return res.status(409).json({ 
        message: 'This booking overlaps with an existing booking. Please select a different time or date.' 
      });
    }
    
    // Create new booking
    const booking = new Booking(bookingData);
    await booking.save();
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error during booking creation' });
  }
};

// Get all bookings for the current user
exports.getUserBookings = async (req, res) => {
  try {
    // For performance with large datasets, implement pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination info
    const total = await Booking.countDocuments({ userId: req.userId });
    
    // Get paginated bookings
    const bookings = await Booking.find({ userId: req.userId })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error while fetching booking' });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      bookingDate,
      bookingType,
      bookingSlot,
      bookingTimeFrom,
      bookingTimeTo
    } = req.body;
    
    // Find the booking first
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Validate booking data based on type
    if (bookingType === 'Half Day' && !bookingSlot) {
      return res.status(400).json({ message: 'Booking slot is required for Half Day bookings' });
    }
    
    if (bookingType === 'Custom' && (!bookingTimeFrom || !bookingTimeTo)) {
      return res.status(400).json({ message: 'Booking time range is required for Custom bookings' });
    }
    
    // Create updated booking data
    const bookingData = {
      _id: booking._id, // Include ID to exclude this booking from overlap check
      customerName,
      customerEmail,
      bookingDate,
      bookingType,
      userId: req.userId
    };
    
    // Add conditional fields based on booking type
    if (bookingType === 'Half Day') {
      bookingData.bookingSlot = bookingSlot;
      bookingData.bookingTimeFrom = null;
      bookingData.bookingTimeTo = null;
    } else if (bookingType === 'Custom') {
      bookingData.bookingSlot = null;
      bookingData.bookingTimeFrom = bookingTimeFrom;
      bookingData.bookingTimeTo = bookingTimeTo;
    } else {
      // Full day - clear other fields
      bookingData.bookingSlot = null;
      bookingData.bookingTimeFrom = null;
      bookingData.bookingTimeTo = null;
    }
    
    // Check for overlapping bookings
    const hasOverlap = await Booking.checkOverlap(bookingData);
    
    if (hasOverlap) {
      return res.status(409).json({ 
        message: 'This booking overlaps with an existing booking. Please select a different time or date.' 
      });
    }
    
    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: bookingData },
      { new: true }
    );
    
    res.status(200).json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error during booking update' });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error during booking deletion' });
  }
};

// Get booking availability for a date
exports.checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    // Create date object for the requested date
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);
    
    // Get all bookings for the requested date
    const bookings = await Booking.find({
      bookingDate: {
        $gte: requestedDate,
        $lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Determine availability
    const hasFullDay = bookings.some(b => b.bookingType === 'Full Day');
    const hasFirstHalf = bookings.some(b => 
      b.bookingType === 'Half Day' && b.bookingSlot === 'First Half'
    );
    const hasSecondHalf = bookings.some(b => 
      b.bookingType === 'Half Day' && b.bookingSlot === 'Second Half'
    );
    
    // Get custom bookings for time-specific availability checks
    const customBookings = bookings.filter(b => b.bookingType === 'Custom').map(b => ({
      from: b.bookingTimeFrom,
      to: b.bookingTimeTo
    }));
    
    res.status(200).json({
      date: requestedDate,
      availability: {
        fullDay: !hasFullDay && !hasFirstHalf && !hasSecondHalf,
        firstHalf: !hasFullDay && !hasFirstHalf,
        secondHalf: !hasFullDay && !hasSecondHalf,
        customTimeSlots: customBookings
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error while checking availability' });
  }
}; 