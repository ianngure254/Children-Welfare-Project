// config/paystack.js
// -----------------------------------------------
// Paystack configuration and helper functions
// -----------------------------------------------

const config = {
  // Paystack API base URL
  baseURL: 'https://api.paystack.co',
  
  // Your Paystack secret key (from environment variables)
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  
  // Helper function to get authorization headers
  getHeaders: () => ({
    Authorization: `Bearer ${config.secretKey}`,
    'Content-Type': 'application/json',
  }),
};

export default config;
