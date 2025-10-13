# Tier Limits & Usage Tracking

## Overview

Each subscription tier has specific limits. This document explains **where limits are defined**, **how usage is tracked**, and **where they're displayed in the UI**.

---

## Tier Limits Definition

### Location: `/src/lib/stripe-plans.ts`

```typescript
export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    maxUnits: 25,  // ⚠️ LIMIT: 25 units max
    features: [
      'WhatsApp messaging',
      'AI-powered responses',
      'Basic maintenance tracking',
      'Resident management',
      'Email support',
    ],
  },

  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
    maxUnits: 75,  // ⚠️ LIMIT: 75 units max
    features: [
      'Everything in Starter',
      'Broadcast messages',       // 🔒 Feature gate
      'Service provider management',
      'Advanced analytics',
      'Knowledge base',
      'Priority support',
    ],
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    maxUnits: 200,  // ⚠️ Effectively unlimited (very high limit)
    features: [
      'Everything in Professional',
      'Unlimited units',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      '24/7 priority support',
    ],
  },
};
```

---

## Usage Tracking

### Location: `/src/lib/usage-tracking.ts`

**Main Functions:**

#### 1. `getUsageStats(buildingId, subscription)`
Returns comprehensive usage data:

```typescript
interface UsageStats {
  units: {
    current: number;       // Current unit count
    limit: number;         // Max units for plan
    percentage: number;    // Usage percentage (0-100)
    remaining: number;     // Units remaining
    isNearLimit: boolean;  // True if ≥80% usage
    isAtLimit: boolean;    // True if ≥100% usage
  };

  broadcasts: {
    current: number;       // Broadcasts sent this month
    limit: number | null;  // null = unlimited
  };

  features: {
    broadcasts: boolean;         // Professional+
    analytics: boolean;          // Professional+
    serviceProviders: boolean;   // Professional+
    knowledgeBase: boolean;      // Professional+
  };

  plan: {
    name: string;     // "Starter", "Professional", "Enterprise"
    tier: PlanType;   // 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
    price: number;    // 29, 79, or 149
  };
}
```

#### 2. `getUnitCount(buildingId)`
Fast query to get just the unit count (for limit checks):

```typescript
const count = await getUnitCount(buildingId);
// Returns: number
```

#### 3. `canAddUnits(buildingId, subscription)`
Check if building can add more units:

```typescript
const canAdd = await canAddUnits(buildingId, subscription);
// Returns: boolean
// - Enterprise: always true (unlimited)
// - Others: true if current < limit
```

---

## Where Usage is Tracked in Database

### Queries Used:

#### Count Units:
```sql
SELECT COUNT(*) FROM units WHERE building_id = 'xxx';
```

#### Count Broadcasts (This Month):
```sql
SELECT COUNT(*)
FROM broadcasts
WHERE building_id = 'xxx'
  AND created_at >= '2025-10-01';  -- First day of month
```

---

## UI Display

### Location: `/src/components/dashboard/usage-stats-card.tsx`

The **UsageStatsCard** component displays all usage information in the Billing section.

**Features:**
- ✅ Progress bar showing unit usage
- ✅ Color-coded warnings (green → yellow → red)
- ✅ "Near limit" warning at 80% usage
- ✅ "Limit reached" error at 100% usage
- ✅ Remaining units count
- ✅ Broadcast count (for Professional+)
- ✅ Feature access checklist

**Example Display:**

```
┌─────────────────────────────────────┐
│ 📈 Uso del Plan                     │
│ Tu consumo actual del plan Starter  │
├─────────────────────────────────────┤
│                                     │
│ 🏢 Unidades        20 / 25   80%    │
│ ████████████████░░░░                │
│ 5 unidades disponibles              │
│                                     │
│ ⚠️ Estás cerca del límite de        │
│    unidades. Quedan 5 disponibles.  │
│                                     │
│ ───────────────────────────────────│
│ Funciones incluidas:                │
│ ✓ Mensajería WhatsApp              │
│ ✓ Respuestas AI                    │
│ ○ Anuncios masivos (locked)        │
│ ○ Análisis avanzado (locked)       │
└─────────────────────────────────────┘
```

### Where It's Rendered:

**Settings Page → Billing Tab**

1. **Server Component** (`/src/app/dashboard/settings/page.tsx`) fetches usage stats:
```typescript
const usageStats = await getUsageStats(building.id, subscription);
```

2. **Passed to SettingsManager**:
```typescript
<SettingsManager
  building={building}
  usageStats={usageStats}
/>
```

3. **Passed to BillingSection**:
```typescript
<BillingSection
  building={building}
  usageStats={usageStats}
/>
```

4. **Rendered in UI**:
```typescript
{usageStats && (
  <UsageStatsCard stats={usageStats} />
)}
```

---

## Warning States

### 1. Normal Usage (< 80%)
- ✅ Green progress bar
- ✅ Simple percentage badge
- ✅ No warnings

### 2. Near Limit (≥ 80%)
- ⚠️ Yellow progress bar
- ⚠️ "Cerca del límite" badge
- ⚠️ Warning alert: "Estás cerca del límite. Quedan X unidades disponibles."

### 3. At Limit (≥ 100%)
- ❌ Red progress bar
- ❌ "Límite alcanzado" destructive badge
- ❌ Error alert: "Has alcanzado el límite de X unidades. Mejora tu plan para agregar más."

---

## Limit Enforcement

### Current Implementation:

#### ✅ UI-Level Enforcement:
- Warnings shown in billing section
- Upgrade prompts when limits are reached

#### 🚧 API-Level Enforcement (TODO):
Need to add checks in:
- `/api/residents/create` → Check `canAddUnits()` before allowing
- `/api/units/create` → Check unit limit before creating

### Example API Enforcement:

```typescript
// In /api/residents/create/route.ts
import { canAddUnits } from '@/lib/usage-tracking';
import { getSubscription } from '@/lib/subscription-server';

export async function POST(req: NextRequest) {
  const subscription = await getSubscription();
  const { data: building } = await getBuildingForUser();

  // Check unit limit
  const allowed = await canAddUnits(building.id, subscription);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Unit limit reached',
        message: 'Upgrade your plan to add more units'
      },
      { status: 403 }
    );
  }

  // Proceed with creation...
}
```

---

## Feature Gates

### Location: `/src/lib/subscription.ts`

**Feature Requirements:**

| Feature | Required Plan |
|---------|--------------|
| Basic messaging | Starter+ |
| AI responses | Starter+ |
| **Broadcasts** | **Professional+** |
| **Analytics** | **Professional+** |
| **Service Providers** | **Professional+** |
| **Knowledge Base** | **Professional+** |

### How Feature Gating Works:

1. **Check user's plan tier**:
```typescript
const currentPlan = getPlanFromPriceId(subscription.stripe_price_id);
// Returns: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
```

2. **Check feature access**:
```typescript
const access = checkFeatureAccess(subscription, 'broadcasts');
// Returns: { hasAccess: boolean, requiredPlan: PlanType }
```

3. **UI Response**:
   - ✅ Has access → Show feature
   - ❌ No access → Show `<UpgradePrompt>` component

---

## Example: Checking Limits in Code

### Server-Side (API Routes):

```typescript
import { getUsageStats, canAddUnits } from '@/lib/usage-tracking';
import { getSubscription } from '@/lib/subscription-server';

// Get full usage stats
const subscription = await getSubscription();
const stats = await getUsageStats(buildingId, subscription);

console.log(`Units: ${stats.units.current}/${stats.units.limit}`);
console.log(`Near limit: ${stats.units.isNearLimit}`);
console.log(`At limit: ${stats.units.isAtLimit}`);

// Quick check if can add more units
const canAdd = await canAddUnits(buildingId, subscription);
if (!canAdd) {
  throw new Error('Unit limit reached');
}
```

### Client-Side (React Hooks):

```typescript
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const { currentPlan, unitCount, planDetails } = useSubscription();

  const isNearLimit = unitCount >= (planDetails.maxUnits * 0.8);

  return (
    <div>
      <p>Plan: {currentPlan}</p>
      <p>Units: {unitCount} / {planDetails.maxUnits}</p>
      {isNearLimit && <Alert>Near limit!</Alert>}
    </div>
  );
}
```

---

## Testing Usage Limits

### Test Scenario 1: Add Units Until Limit

1. Subscribe to **Starter** plan (25 units limit)
2. Create 20 units
3. **Expected:** Green progress bar, 80% usage, yellow warning
4. Create 5 more units (total 25)
5. **Expected:** Red progress bar, "Límite alcanzado" error
6. Try to create 26th unit
7. **Expected:** API returns 403 error (when enforcement is added)

### Test Scenario 2: Upgrade to Remove Limit

1. Start with Starter (25 units), at limit
2. Upgrade to Professional (75 units)
3. **Expected:** Usage drops to 33%, green bar, warnings disappear
4. Can now add 50 more units

### Test Scenario 3: Downgrade with Exceeded Limit

1. Professional plan with 50 units
2. Downgrade to Starter (25 limit)
3. **Expected:**
   - Still have access to all 50 units (grandfathered)
   - But can't add more until below limit
   - Red warning shown: "Has alcanzado el límite"

---

## Database Queries for Monitoring

### Get Buildings Near Limit:

```sql
WITH usage AS (
  SELECT
    b.id as building_id,
    b.name,
    b.stripe_price_id,
    COUNT(u.id) as unit_count,
    CASE
      WHEN b.stripe_price_id = 'price_1SHOUFB6sXQXR2eMZj4vMSCj' THEN 25  -- Starter
      WHEN b.stripe_price_id = 'price_1SHOUGB6sXQXR2eMZF3u2vc6' THEN 75  -- Professional
      WHEN b.stripe_price_id = 'price_1SHOUGB6sXQXR2eMMjJLjJDb' THEN 200 -- Enterprise
    END as max_units
  FROM buildings b
  LEFT JOIN units u ON u.building_id = b.id
  WHERE b.subscription_status = 'active'
  GROUP BY b.id
)
SELECT
  *,
  ROUND((unit_count::numeric / max_units * 100), 2) as usage_percentage
FROM usage
WHERE (unit_count::numeric / max_units) >= 0.8  -- 80% or more
ORDER BY usage_percentage DESC;
```

### Get Buildings Over Limit:

```sql
-- Same query but filter by >= 1.0 (100%)
WHERE (unit_count::numeric / max_units) >= 1.0
```

---

## Summary

**Where Limits Are Defined:** `/src/lib/stripe-plans.ts`
- Starter: 25 units
- Professional: 75 units
- Enterprise: 200 units (unlimited)

**Where Usage is Tracked:** `/src/lib/usage-tracking.ts`
- `getUsageStats()` - Comprehensive stats
- `canAddUnits()` - Quick limit check
- Queries `units` and `broadcasts` tables

**Where It's Displayed:** `/src/components/dashboard/usage-stats-card.tsx`
- Progress bars
- Warning states (green/yellow/red)
- Alerts at 80% and 100%
- Feature checklist

**How to Access:**
- Go to **Settings** → **Billing** tab
- Usage card shows below subscription info
- Updates in real-time based on database

**Next Steps (TODO):**
- Add API-level enforcement in resident/unit creation
- Add usage stats to dashboard overview
- Add email notifications at 90% usage
- Add webhook to notify on limit reached
