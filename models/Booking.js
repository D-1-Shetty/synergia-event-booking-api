import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  participantName: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  college: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  department: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  year: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'waiting'],
    default: 'confirmed'
  }
}, {
  timestamps: true,
  collection: 'booking' 
});


bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });


bookingSchema.virtual('registrationDate').get(function() {
  return this.createdAt;
});


bookingSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

bookingSchema.statics.findConfirmed = function() {
  return this.find({ status: 'confirmed' });
};

export default mongoose.model('Booking', bookingSchema, 'booking');