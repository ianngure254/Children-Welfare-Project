import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";


//Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import productRoutes from './routes/productRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paystackRoutes from './routes/paystackRoutes.js';
//Error handler Middleware
import { errorHandler } from './middleware/error.middleware.js';
    const app = express();
//security middleware
    app.use(helmet());
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  // req.query is read-only in newer Express — don't touch it
  next();
});

//CORS CROSS-ORIGIN
// allow multiple development origins and any value stored in CLIENT_URL
const allowedOrigins = [
    process.env.CLIENT_URL, 'https://give-and-receive.onrender.com/api'
   
];

app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn('Blocked CORS request from', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    optionsSuccessStatus: 200,
}));
//rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);
//Body Parser
app.use(express.json({ limit: '20mb'}))
app.use(express.urlencoded({ extended: true, limit: '20mb'}))
//Logging
  if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

//Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'server is running',
       timestamp: new Date().toISOString()  
    });
});
     
//API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/paystack', paystackRoutes);

//404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    })
});
   
//Error handler middleware
app.use(errorHandler);

export default app;


