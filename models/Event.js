import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: String,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Maximum participants must be at least 1']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['Technical', 'Workshop', 'Seminar', 'Competition', 'Social']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'event' // Explicitly set collection name to 'event'
});

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Instance method to check if can add participant
eventSchema.methods.canAddParticipant = function() {
  return this.currentParticipants < this.maxParticipants && this.status === 'active';
};

// Static method to find active events
eventSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

export default mongoose.model('Event', eventSchema, 'event'); // Third parameter sets collection name