import express from 'express';
import { initializeTransaction, verifyTransaction, handleWebhook } from '../controllers/paystackController.js';
import Paystack from '../models/Paystack.js';

const router = express.Router();

// Initialize payment
router.post('/initialize', initializeTransaction);

// Verify payment
router.get('/verify/:reference', verifyTransaction);

// Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;