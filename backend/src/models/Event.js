import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
    trim: true
  },
  category: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'religious', 'fundraising', 'community', 'graduation', 'other'],
    required: [true, 'Event category is required']
  },
  type: {
    type: String,
    enum: ['single', 'recurring', 'series'],
    default: 'single'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  location: {
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      county: String,
      postalCode: String
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    onlineLink: String
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
    default: 'draft'
  },
  registration: {
    required: {
      type: Boolean,
      default: false
    },
    deadline: Date,
    maxAttendees: {
      type: Number,
      min: [0, 'Max attendees cannot be negative']
    },
    currentAttendees: {
      type: Number,
      default: 0,
      min: 0
    },
    fee: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  targetAudience: [{
    type: String,
    enum: ['students', 'parents', 'teachers', 'staff', 'alumni', 'community', 'all']
  }],
  classes: [{
    type: String,
    enum: ['playgroup', 'nursery', 'pre-unit', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8', 'grade9', 'all']
  }],
  organizers: [{
    name: {
      type: String,
      required: true
    },
    role: String,
    contact: String
  }],
  speakers: [{
    name: {
      type: String,
      required: true
    },
    title: String,
    bio: String,
    image: String
  }],
  agenda: [{
    time: String,
    title: {
      type: String,
      required: true
    },
    description: String,
    speaker: String
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: String
}, {
  timestamps: true
});

eventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.startDate && this.status === 'published';
});

eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.status === 'published';
});

eventSchema.virtual('isPast').get(function() {
  return new Date() > this.endDate || this.status === 'completed';
});

eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registration.required) return false;
  if (this.registration.deadline && new Date() > this.registration.deadline) return false;
  if (this.registration.maxAttendees && this.registration.currentAttendees >= this.registration.maxAttendees) return false;
  return this.status === 'published' && this.isUpcoming;
});

eventSchema.virtual('availableSpots').get(function() {
  if (!this.registration.maxAttendees) return null;
  return Math.max(0, this.registration.maxAttendees - this.registration.currentAttendees);
});

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ isPublic: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ createdAt: -1 });

export default mongoose.model('Event', eventSchema);
