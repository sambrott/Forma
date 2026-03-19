import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripeClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      }],
      success_url: `${baseUrl}/tools?pro=activated`,
      cancel_url: `${baseUrl}/pricing`,
    })

    return NextResponse.redirect(session.url!, { status: 303 })
  } catch (err) {
    console.error('stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
