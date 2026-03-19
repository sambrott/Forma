import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        // In production: store Pro status in a database keyed by customer email
        // For MVP: we set a cookie in the checkout success redirect
        console.log('Pro subscription activated for:', session.customer_email)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        console.log('Subscription cancelled:', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('stripe webhook error:', err)
    return NextResponse.json({ error: 'Webhook verification failed.' }, { status: 400 })
  }
}
