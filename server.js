import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import other modules AFTER dotenv.config()
import connectDB from './config/database.js';
import Event from './models/Event.js';
import Booking from './models/Booking.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// ==================== EVENT ROUTES ====================

// 1. GET /events - Get all events
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' });
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message
    });
  }
});

// 2. POST /events/add - Create a new event
app.post('/events/add', async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      time,
      venue,
      maxParticipants,
      category
    } = req.body;

    // Validation
    if (!name || !description || !date || !time || !venue || !maxParticipants || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newEvent = new Event({
      name,
      description,
      date,
      time,
      venue,
      maxParticipants: parseInt(maxParticipants),
      category
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: savedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    });
  }
});

// 3. GET /event/:id - Get event by ID
app.get('/event/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message
    });
  }
});

// 4. PUT /event/:id - Update event details
app.put('/event/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      time,
      venue,
      maxParticipants,
      category,
      status
    } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        date,
        time,
        venue,
        maxParticipants,
        category,
        status
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message
    });
  }
});

// 5. DELETE /event/:id - Cancel an event
app.delete('/event/:id', async (req, res) => {
  try {
    const cancelledEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!cancelledEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event cancelled successfully",
      data: cancelledEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling event",
      error: error.message
    });
  }
});

// ==================== BOOKING ROUTES ====================

// 1. GET /api/bookings - Get all event bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' })
      .populate('eventId', 'name date time venue');
    
    const enrichedBookings = bookings.map(booking => ({
      id: booking._id,
      participantName: booking.participantName,
      email: booking.email,
      phone: booking.phone,
      college: booking.college,
      department: booking.department,
      year: booking.year,
      registrationDate: booking.createdAt,
      event: {
        name: booking.eventId.name,
        date: booking.eventId.date,
        time: booking.eventId.time,
        venue: booking.eventId.venue
      }
    }));

    res.json({
      success: true,
      count: enrichedBookings.length,
      data: enrichedBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
});

// 2. POST /api/bookings - Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      eventId,
      participantName,
      email,
      phone,
      college,
      department,
      year
    } = req.body;

    // Validation
    if (!eventId || !participantName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Event ID, participant name, email, and phone are required"
      });
    }

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Event is not active for bookings"
      });
    }

    // Check if event has available slots
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is fully booked"
      });
    }

    const newBooking = new Booking({
      eventId,
      participantName,
      email,
      phone,
      college: college || "Not specified",
      department: department || "Not specified",
      year: year || "Not specified"
    });

    const savedBooking = await newBooking.save();
    
    // Update event participant count
    event.currentParticipants += 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedBooking
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered for this event"
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Synergia Event Booking API with MongoDB",
    endpoints: {
      events: {
        "GET /events": "Get all active events",
        "POST /events/add": "Create new event",
        "GET /event/:id": "Get event by ID",
        "PUT /event/:id": "Update event",
        "DELETE /event/:id": "Cancel event"
      },
      bookings: {
        "GET /api/bookings": "Get all bookings",
        "POST /api/bookings": "Create new booking",
        "GET /api/bookings/:id": "Get booking by ID",
        "PUT /api/bookings/:id": "Update booking",
        "DELETE /api/bookings/:id": "Cancel booking"
      }
    }
  });
});

// 404 handler - MUST BE AFTER ALL ROUTES
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please check the API documentation at /"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server - THIS MUST BE LAST
app.listen(PORT, () => {
  console.log(`🚀 Synergia Event Booking API running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});