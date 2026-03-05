import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
    trim: true
  },
  category: {
    type: String,
    enum: ['infrastructure', 'academic', 'sports', 'technology', 'community', 'fundraising', 'other'],
    required: [true, 'Project category is required']
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  budget: {
    estimated: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    allocated: {
      type: Number,
      min: [0, 'Allocated budget cannot be negative'],
      default: 0
    },
    spent: {
      type: Number,
      min: [0, 'Spent amount cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  location: {
    type: String,
    trim: true
  },
  stakeholders: [{
    name: String,
    role: String,
    contact: String
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date
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

projectSchema.virtual('progress').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.completed).length;
  return Math.round((completed / this.milestones.length) * 100);
});

projectSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.allocated || this.budget.allocated === 0) return 0;
  return Math.round((this.budget.spent / this.budget.allocated) * 100);
});

projectSchema.virtual('isOverdue').get(function() {
  if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') return false;
  return new Date() > this.endDate;
});

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ createdAt: -1 });

export default mongoose.model('Project', projectSchema);
