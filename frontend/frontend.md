client/
│
├── public/
│
├── src/
│   ├── app/                     # Routing (if using Vite/React Router)
│   ├── assets/
│   ├── components/
│   │   ├── ui/                  # Buttons, cards, modals
│   │   ├── layout/              # Navbar, Footer, Sidebar
│   │   └── shared/              # Reusable pieces
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── Shop.jsx
│   │   ├── Events.jsx
│   │   ├── Admissions.jsx
│   │   ├── Fees.jsx
│   │   ├── Volunteers.jsx
│   │   ├── Donations.jsx
│   │   ├── 
│   │   └── Admin/
│   │       ├── Dashboard.jsx
│   │       ├── ProjectsAdmin.jsx
│   │       ├── ProductsAdmin.jsx
│   │       ├── EventsAdmin.jsx
│   │       ├── UsersAdmin.jsx
│   │       └── NewsletterAdmin.jsx
│   │
│   ├── services/                # API calls
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   └── productService.js
│   │
│   ├── hooks/    useAuth                 # Custom hooks
│   ├── context/                 # Auth context
│   ├── utils/
│   └── main.jsx
│
├── tailwind.config.js
└── vite.config.js