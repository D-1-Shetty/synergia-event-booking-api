import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


let events = [
  {
    id: 1,
    name: "Code Hackathon",
    description: "24-hour competitive programming challenge",
    date: "2024-02-15",
    time: "10:00 AM",
    venue: "Tech Auditorium",
    maxParticipants: 50,
    currentParticipants: 25,
    category: "Technical"
  },
  {
    id: 2,
    name: "AI Workshop",
    description: "Hands-on machine learning workshop",
    date: "2024-02-20",
    time: "2:00 PM",
    venue: "Computer Lab 3",
    maxParticipants: 30,
    currentParticipants: 15,
    category: "Workshop"
  }
];

let bookings = [
  {
    id: 1,
    eventId: 1,
    participantName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    college: "Tech University",
    department: "Computer Science",
    year: "3rd Year",
    registrationDate: "2024-01-15T10:30:00Z",
    status: "confirmed"
  },
  {
    id: 2,
    eventId: 2,
    participantName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+0987654321",
    college: "Engineering College",
    department: "AI & ML",
    year: "4th Year",
    registrationDate: "2024-01-16T14:20:00Z",
    status: "confirmed"
  }
];

let nextEventId = 3;
let nextBookingId = 3;


const findEventById = (id) => events.find(event => event.id === parseInt(id));
const findBookingById = (id) => bookings.find(booking => booking.id === parseInt(id));
const findBookingsByEventId = (eventId) => bookings.filter(booking => booking.eventId === parseInt(eventId));


app.get('/events', (req, res) => {
  try {
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


app.post('/events/add', (req, res) => {
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

    if (!name || !description || !date || !time || !venue || !maxParticipants || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newEvent = {
      id: nextEventId++,
      name,
      description,
      date,
      time,
      venue,
      maxParticipants: parseInt(maxParticipants),
      currentParticipants: 0,
      category,
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    });
  }
});


app.get('/event/:id', (req, res) => {
  try {
    const event = findEventById(req.params.id);
    
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


app.put('/event/:id', (req, res) => {
  try {
    const event = findEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const {
      name,
      description,
      date,
      time,
      venue,
      maxParticipants,
      category
    } = req.body;

    
    if (name) event.name = name;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (venue) event.venue = venue;
    if (maxParticipants) event.maxParticipants = parseInt(maxParticipants);
    if (category) event.category = category;
    event.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message
    });
  }
});


app.delete('/event/:id', (req, res) => {
  try {
    const eventIndex = events.findIndex(event => event.id === parseInt(req.params.id));
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    
    bookings = bookings.filter(booking => booking.eventId !== parseInt(req.params.id));
    

    const deletedEvent = events.splice(eventIndex, 1)[0];

    res.json({
      success: true,
      message: "Event and associated bookings cancelled successfully",
      data: deletedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling event",
      error: error.message
    });
  }
});


app.get('/api/bookings', (req, res) => {
  try {
    
    const enrichedBookings = bookings.map(booking => {
      const event = findEventById(booking.eventId);
      return {
        ...booking,
        event: event ? {
          name: event.name,
          date: event.date,
          time: event.time,
          venue: event.venue
        } : null
      };
    });

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


app.post('/api/bookings', (req, res) => {
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

   
    if (!eventId || !participantName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Event ID, participant name, email, and phone are required"
      });
    }

   
    const event = findEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is fully booked"
      });
    }

    
    const existingBooking = bookings.find(
      booking => booking.eventId === parseInt(eventId) && booking.email === email
    );

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered for this event"
      });
    }

    const newBooking = {
      id: nextBookingId++,
      eventId: parseInt(eventId),
      participantName,
      email,
      phone,
      college: college || "Not specified",
      department: department || "Not specified",
      year: year || "Not specified",
      registrationDate: new Date().toISOString(),
      status: "confirmed"
    };

    bookings.push(newBooking);
    
   
    event.currentParticipants++;

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        ...newBooking,
        event: {
          name: event.name,
          date: event.date,
          time: event.time,
          venue: event.venue
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message
    });
  }
});


app.get('/api/bookings/:id', (req, res) => {
  try {
    const booking = findBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const event = findEventById(booking.eventId);

    res.json({
      success: true,
      data: {
        ...booking,
        event: event ? {
          name: event.name,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: event.venue,
          category: event.category
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message
    });
  }
});


app.put('/api/bookings/:id', (req, res) => {
  try {
    const booking = findBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const {
      participantName,
      email,
      phone,
      college,
      department,
      year
    } = req.body;

    
    if (participantName) booking.participantName = participantName;
    if (email) booking.email = email;
    if (phone) booking.phone = phone;
    if (college) booking.college = college;
    if (department) booking.department = department;
    if (year) booking.year = year;
    booking.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Booking updated successfully",
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message
    });
  }
});


app.delete('/api/bookings/:id', (req, res) => {
  try {
    const bookingIndex = bookings.findIndex(booking => booking.id === parseInt(req.params.id));
    
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const deletedBooking = bookings.splice(bookingIndex, 1)[0];
    
    
    const event = findEventById(deletedBooking.eventId);
    if (event && event.currentParticipants > 0) {
      event.currentParticipants--;
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: deletedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Synergia Event Booking API",
    endpoints: {
      events: {
        "GET /events": "Get all events",
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


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please check the API documentation at /"
  });
});


app.listen(PORT, () => {
  console.log(`Synergia Event Booking API running on port ${PORT}`);
  console.log(`Base URL: http://localhost:${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/`);
});