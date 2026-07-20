import Transaction from "../models/Transaction.js"
import Razorpay from 'razorpay'

const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

// API Controller for getting all plans
export const getPlans = async (req, res) => {
    try {
        res.json({success: true, plans})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API Controller for purchasing a plan
export const purchasePlan = async (req, res) => {
    try {
        const { planId } = req.body
        const userId = req.user._id
        const plan = plans.find(plan => plan._id === planId)

        if (!plan) {
            return res.json({ success: false, message: "Invalid plan" })
        }

        // Create new Transaction
        const transaction = await Transaction.create({
            userId: userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })

        // Razorpay order create (amount in paise, so *100)
        const order = await razorpay.orders.create({
            amount: plan.price * 100,
            currency: "INR",
            receipt: transaction._id.toString(),
            notes: {
                transactionId: transaction._id.toString(),
                appId: "quickgpt"
            }
        })

        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
            plan,
            transactionId: transaction._id
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// API Controller to verify payment after Razorpay callback
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body

        const crypto = await import('crypto')

        // Verify signature
        const generatedSignature = crypto.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed" })
        }

        // Find transaction and update user credits
        const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false })

        if (!transaction) {
            return res.json({ success: false, message: "Transaction not found or already paid" })
        }

        const User = (await import('../models/User.js')).default

        // Add credits to user
        await User.updateOne({ _id: transaction.userId }, { $inc: { credits: transaction.credits } })

        // Mark transaction as paid
        transaction.isPaid = true
        await transaction.save()

        res.json({ success: true, message: "Payment verified and credits added!" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}