import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    county: {
      type: String,
      required: [true, 'County is required']
    },
    postalCode: String,
    country: {
      type: String,
      default: 'Kenya'
    }
  },
  occupation: {
    type: String,
    trim: true
  },
  employer: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      start: String,
      end: String
    }],
    frequency: {
      type: String,
      enum: ['one-time', 'weekly', 'monthly', 'as-needed'],
      default: 'as-needed'
    }
  },
  areasOfInterest: [{
    type: String,
    enum: [
      'teaching',
      'mentoring',
      'sports',
      'arts',
      'library',
      'administration',
      'maintenance',
      'fundraising',
      'event_planning',
      'counseling',
      'medical',
      'technology',
      'other'
    ]
  }],
  experience: {
    years: {
      type: Number,
      min: 0,
      default: 0
    },
    description: String,
    previousVolunteerWork: [{
      organization: String,
      role: String,
      duration: String,
      description: String
    }]
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['id_copy', 'cv', 'certificate', 'reference_letter', 'police_clearance', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'inactive', 'rejected', 'suspended'],
    default: 'pending'
  },
  assignments: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    role: {
      type: String,
      required: true
    },
    startDate: Date,
    endDate: Date,
    hours: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'assigned'
    },
    notes: String
  }],
  totalHours: {
    type: Number,
    min: 0,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  notes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  rejectionReason: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

volunteerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

volunteerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});


volunteerSchema.index({ phone: 1 });
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ 'areasOfInterest': 1 });
volunteerSchema.index({ createdAt: -1 });

export default mongoose.model('Volunteer', volunteerSchema);
