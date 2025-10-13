import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    console.log(`[Webhook] Processing event: ${event.type}`);

    // IDEMPOTENCY CHECK: Verify we haven't already processed this event
    const { data: existingEvent } = await supabase
      .from('subscription_events')
      .select('id, processed')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`[Webhook] Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, message: 'Event already processed' });
    }

    // Extract buildingId from event metadata (if available)
    let buildingId: string | null = null;
    const eventObject = event.data.object as any;

    if (eventObject.metadata?.buildingId) {
      buildingId = eventObject.metadata.buildingId;
    } else if (eventObject.subscription) {
      // For invoice events, fetch subscription to get metadata
      try {
        const subscription = await stripe.subscriptions.retrieve(eventObject.subscription as string);
        buildingId = subscription.metadata?.buildingId || null;
      } catch (err) {
        console.error('[Webhook] Failed to fetch subscription for buildingId:', err);
      }
    }

    console.log(`[Webhook] Extracted buildingId: ${buildingId}`);

    // Log the event with buildingId
    try {
      await supabase.from('subscription_events').insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data as any,
        building_id: buildingId,
        processed: false,
      });
    } catch (logError) {
      console.error('[Webhook] Failed to log event:', logError);
      // Continue processing even if logging fails
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Webhook] Checkout completed for customer:', session.customer);
        console.log('[Webhook] Session metadata:', session.metadata);
        await handleCheckoutCompleted(session, supabase);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Webhook] Subscription event for customer:', subscription.customer);
        console.log('[Webhook] Subscription metadata:', subscription.metadata);
        await handleSubscriptionUpdate(subscription, supabase);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, supabase);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('subscription_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    console.log(`[Webhook] Successfully processed: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Handler error:', error);
    console.error('[Webhook] Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  try {
    const buildingId = session.metadata?.buildingId;
    console.log('[handleCheckoutCompleted] Building ID from metadata:', buildingId);

    if (!buildingId) {
      console.error('[handleCheckoutCompleted] No buildingId in metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    console.log('[handleCheckoutCompleted] Subscription ID:', subscriptionId);

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('[handleCheckoutCompleted] Retrieved subscription:', subscription.id);

    // Get period dates from subscription item
    const subscriptionItem = subscription.items.data[0];
    const periodStart = (subscriptionItem as any).current_period_start;
    const periodEnd = (subscriptionItem as any).current_period_end;

    const { error } = await supabase
      .from('buildings')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        subscription_status: subscription.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('id', buildingId);

    if (error) {
      console.error('[handleCheckoutCompleted] Database update error:', error);
      throw error;
    }

    console.log('[handleCheckoutCompleted] Successfully updated building');
  } catch (error) {
    console.error('[handleCheckoutCompleted] Error:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  try {
    const buildingId = subscription.metadata?.buildingId;
    console.log('[handleSubscriptionUpdate] Building ID from metadata:', buildingId);

    if (!buildingId) {
      console.error('[handleSubscriptionUpdate] No buildingId in metadata');
      return;
    }

    // Get current building state to detect plan changes
    const { data: currentBuilding } = await supabase
      .from('buildings')
      .select('stripe_price_id, subscription_status, cancel_at_period_end')
      .eq('id', buildingId)
      .single();

    const newPriceId = subscription.items.data[0].price.id;
    const oldPriceId = currentBuilding?.stripe_price_id;

    // Detect plan change (upgrade/downgrade)
    if (oldPriceId && oldPriceId !== newPriceId) {
      console.log(`[handleSubscriptionUpdate] ⚡ Plan changed from ${oldPriceId} to ${newPriceId}`);
    }

    // Detect reactivation (user canceled then changed their mind)
    if (currentBuilding?.cancel_at_period_end && !subscription.cancel_at_period_end) {
      console.log('[handleSubscriptionUpdate] ✅ Subscription reactivated (cancellation reversed)');
    }

    // Detect scheduled cancellation
    if (!currentBuilding?.cancel_at_period_end && subscription.cancel_at_period_end) {
      console.log('[handleSubscriptionUpdate] ⚠️ Subscription scheduled for cancellation at period end');
    }

    // Get period dates from subscription item
    const subscriptionItem = subscription.items.data[0];
    const periodStart = (subscriptionItem as any).current_period_start;
    const periodEnd = (subscriptionItem as any).current_period_end;

    const { error } = await supabase
      .from('buildings')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: newPriceId,
        subscription_status: subscription.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('id', buildingId);

    if (error) {
      console.error('[handleSubscriptionUpdate] Database update error:', error);
      throw error;
    }

    console.log('[handleSubscriptionUpdate] Successfully updated building');
  } catch (error) {
    console.error('[handleSubscriptionUpdate] Error:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const buildingId = subscription.metadata?.buildingId;
  if (!buildingId) return;

  await supabase
    .from('buildings')
    .update({
      subscription_status: 'canceled',
      cancel_at_period_end: false,
    })
    .eq('id', buildingId);
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  // Get subscription from invoice
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const buildingId = subscription.metadata?.buildingId;
  if (!buildingId) return;

  // Update subscription status to active after successful payment
  await supabase
    .from('buildings')
    .update({
      subscription_status: 'active',
    })
    .eq('id', buildingId);
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  // Get subscription from invoice
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const buildingId = subscription.metadata?.buildingId;
  if (!buildingId) return;

  // Update subscription status to past_due
  await supabase
    .from('buildings')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', buildingId);

  // TODO: Send notification to admin about failed payment
}

// Disable body parsing, need raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
