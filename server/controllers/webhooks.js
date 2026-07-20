export const stripeWebhooks = async (request, response) => {
    response.json({ received: false, message: "Stripe webhooks removed. Using Razorpay now." })
}