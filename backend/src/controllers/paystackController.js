// controllers/paystackController.js
// -----------------------------------------------
// This is the brain of your Paystack integration.
// All the actual logic for each payment action
// lives here. The routes file just calls these
// functions — keeping things clean and organized.
// -----------------------------------------------

import axios from 'axios';
import paystackConfig from '../config/paystack.js';
import Paystack from '../models/Paystack.js';

// ===============================================
// 1. INITIALIZE TRANSACTION
// ===============================================
// This starts a new payment. It tells Paystack:
// "Hey, a customer with this email wants to pay
// this amount." Paystack responds with a checkout
// URL and a unique reference for this transaction.
// ===============================================
const initializeTransaction = async (req, res) => {
  const { email, amount, currency, metadata } = req.body;

  // --- Basic Validation ---
  // Always validate inputs before sending to Paystack
  if (!email || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Email and amount are required',
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
  }

  try {
    const response = await axios.post(
      `${paystackConfig.baseURL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo (smallest currency unit)
        currency: currency || 'NGN',      // Default to Nigerian Naira
        metadata: metadata || {},          // Optional extra info (e.g. order ID, product name)
      },
      { headers: paystackConfig.getHeaders() }
    );

    const { authorization_url, access_code, reference } = response.data.data;

    return res.status(200).json({
      success: true,
      message: 'Transaction initialized successfully',
      data: {
        authorization_url, // The URL to redirect customer to (if not using popup)
        access_code,       // Used with the Paystack inline popup
        reference,         // Save this! You'll need it to verify the payment
      },
    });

  } catch (error) {
    console.error('Initialize transaction error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize transaction',
      error: error.response?.data?.message || error.message,
    });
  }
};


// ===============================================
// 2. VERIFY TRANSACTION
// ===============================================
// After a customer pays, ALWAYS verify the payment
// on your backend. Never trust the frontend alone.
// This confirms the payment is real and gets the
// full details (amount paid, status, customer info).
// ===============================================
const verifyTransaction = async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({
      success: false,
      message: 'Transaction reference is required',
    });
  }

  try {
    const response = await axios.get(
      `${paystackConfig.baseURL}/transaction/verify/${reference}`,
      { headers: paystackConfig.getHeaders() }
    );

    const transactionData = response.data.data;

    // Check if the payment actually succeeded
    if (transactionData.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: `Transaction was not successful. Status: ${transactionData.status}`,
        data: transactionData,
      });
    }

    // ✅ Payment is verified and successful
    // This is where you would:
    // - Update the order status in your database
    // - Send a confirmation email to the customer
    // - Trigger delivery of product/service
    // For now we just return the verified data

    return res.status(200).json({
      success: true,
      message: 'Transaction verified successfully',
      data: {
        reference: transactionData.reference,
        status: transactionData.status,
        amount: transactionData.amount / 100, // Convert back from kobo to main unit
        currency: transactionData.currency,
        customer: transactionData.customer,
        paid_at: transactionData.paid_at,
        channel: transactionData.channel, // e.g. "card", "bank", "ussd"
      },
    });

  } catch (error) {
    console.error('Verify transaction error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify transaction',
      error: error.response?.data?.message || error.message,
    });
  }
};


// ===============================================
// 3. HANDLE WEBHOOK
// ===============================================
// Paystack calls this URL automatically whenever
// something happens (payment, refund, etc.).
// This is more reliable than waiting for the
// customer's browser to come back to your site.
// Think of it as Paystack calling your server
// directly in the background.
// ===============================================
const handleWebhook = async (req, res) => {
  const event = req.body;

  // Always respond to Paystack with 200 quickly
  // so they know you received the webhook.
  // Do your processing after sending the response.
  res.status(200).json({ received: true });

  // Now handle the event based on its type
  switch (event.event) {

    case 'charge.success':
      // A payment was successfully completed
      console.log('✅ Payment successful via webhook:', {
        reference: event.data.reference,
        amount: event.data.amount / 100,
        customer: event.data.customer.email,
      });
      // TODO: Update your database here
      // e.g. await Order.findOneAndUpdate({ reference }, { status: 'paid' })
      break;

    case 'transfer.success':
      // A transfer/payout was successful
      console.log('✅ Transfer successful:', event.data);
      // TODO: Handle transfer confirmation
      break;

    case 'transfer.failed':
      // A transfer/payout failed
      console.log('❌ Transfer failed:', event.data);
      // TODO: Handle failed transfer (notify admin, retry, etc.)
      break;

    case 'charge.dispute.create':
      // A customer disputed a charge
      console.log('⚠️ Dispute created:', event.data);
      // TODO: Handle dispute
      break;

    default:
      // An event type we haven't handled yet
      console.log(`Unhandled webhook event type: ${event.event}`);
  }
};


// ===============================================
// 4. LIST TRANSACTIONS
// ===============================================
// Fetch a list of all transactions from Paystack.
// Useful for an admin dashboard or transaction history.
// ===============================================
const listTransactions = async (req, res) => {
  // You can pass query params like page, perPage, status, from, to
  const { page = 1, perPage = 20, status, from, to } = req.query;

  try {
    // Build query string dynamically based on what was passed
    const params = new URLSearchParams({ page, perPage });
    if (status) params.append('status', status);   // 'success', 'failed', 'abandoned'
    if (from) params.append('from', from);           // Start date e.g. 2024-01-01
    if (to) params.append('to', to);                 // End date e.g. 2024-12-31

    const response = await axios.get(
      `${paystackConfig.baseURL}/transaction?${params.toString()}`,
      { headers: paystackConfig.getHeaders() }
    );

    return res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: response.data.data,
      meta: response.data.meta, // Contains total count, pages, etc.
    });

  } catch (error) {
    console.error('List transactions error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.response?.data?.message || error.message,
    });
  }
};


// ===============================================
// 5. FETCH SINGLE TRANSACTION
// ===============================================
// Get the full details of one specific transaction
// using its Paystack transaction ID (not reference).
// ===============================================
const fetchTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(
      `${paystackConfig.baseURL}/transaction/${id}`,
      { headers: paystackConfig.getHeaders() }
    );

    return res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: response.data.data,
    });

  } catch (error) {
    console.error('Fetch transaction error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.response?.data?.message || error.message,
    });
  }
};


// Export all controller functions so routes can use them
export {
  initializeTransaction,
  verifyTransaction,
  handleWebhook,
  listTransactions,
  fetchTransaction,
};