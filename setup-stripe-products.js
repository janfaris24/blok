#!/usr/bin/env node

const Stripe = require('stripe');

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is not set.');
  console.error('Please set it in your .env.local file or export it:');
  console.error('  export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function createProducts() {
  console.log('🚀 Creating Blok subscription products in Stripe...\n');

  try {
    // Product 1: Starter
    console.log('Creating Starter plan...');
    const starterProduct = await stripe.products.create({
      name: 'Blok Starter',
      description: 'Perfect for small condo buildings (1-25 units)',
      metadata: {
        plan_tier: 'starter',
        max_units: '25',
      },
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      currency: 'usd',
      unit_amount: 2900, // $29.00
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_tier: 'starter',
      },
    });

    console.log(`✅ Starter Product ID: ${starterProduct.id}`);
    console.log(`✅ Starter Price ID: ${starterPrice.id}\n`);

    // Product 2: Professional
    console.log('Creating Professional plan...');
    const professionalProduct = await stripe.products.create({
      name: 'Blok Professional',
      description: 'Advanced features for growing buildings (26-75 units)',
      metadata: {
        plan_tier: 'professional',
        max_units: '75',
      },
    });

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      currency: 'usd',
      unit_amount: 7900, // $79.00
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_tier: 'professional',
      },
    });

    console.log(`✅ Professional Product ID: ${professionalProduct.id}`);
    console.log(`✅ Professional Price ID: ${professionalPrice.id}\n`);

    // Product 3: Enterprise
    console.log('Creating Enterprise plan...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Blok Enterprise',
      description: 'Complete solution for large buildings (76-200 units)',
      metadata: {
        plan_tier: 'enterprise',
        max_units: '200',
      },
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      currency: 'usd',
      unit_amount: 14900, // $149.00
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_tier: 'enterprise',
      },
    });

    console.log(`✅ Enterprise Product ID: ${enterpriseProduct.id}`);
    console.log(`✅ Enterprise Price ID: ${enterprisePrice.id}\n`);

    // Print environment variables
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Add these to your .env.local file:\n');
    console.log(`STRIPE_STARTER_PRICE_ID=${starterPrice.id}`);
    console.log(`STRIPE_PROFESSIONAL_PRICE_ID=${professionalPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ All products created successfully!');
    console.log('🔗 View in Stripe Dashboard: https://dashboard.stripe.com/test/products\n');

    return {
      starter: starterPrice.id,
      professional: professionalPrice.id,
      enterprise: enterprisePrice.id,
    };
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    throw error;
  }
}

// Run the script
createProducts()
  .then(() => {
    console.log('Done! 🎉');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
