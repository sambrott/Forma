import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
  }
  return client
}
