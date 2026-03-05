server/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── firebase.js
│   │   └── cloudinary.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Product.js
│   │   ├── Event.js
│   │   ├── Admission.js
│   │   ├── Fee.js
│   │   ├── Volunteer.js
│   │   ├── Donation.js
│   │  
│   │ ├── Subscriber.js
│   │   └── Application.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── productController.js
│   │   ├── eventController.js
│   │   ├── newsletterController.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── productRoutes.js
│   │   ├── eventRoutes.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── verifyFirebaseToken.js
│   │   ├── roleMiddleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   │
│   ├── services/
│   │   ├── emailService.js
│   │   ├── uploadService.js
│   │   └── newsletterService.js
│   │
│   ├── utils/ -- Avoid repetitive tasks $ quiet friction.. like (validate emails, passwords, formatDate, slugify(text), hashPasswords, async handlers) --
│   └── server.js
│
├── .env
└── package.json
