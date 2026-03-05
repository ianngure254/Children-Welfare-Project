import mongoose from "mongoose";

const paystackSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        required: true
    },

    reference: {
        type: String,
        required: true,
        unique: true
    },

    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },

    paidAt: {
        type:Date
        
    },

},
{
timestamps: true
});

export default mongoose.model('Paystack', paystackSchema);
