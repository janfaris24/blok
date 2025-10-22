import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { feeId, status, paidDate, paymentMethod, paymentReference, notes } = body;

    if (!feeId) {
      return NextResponse.json({ error: 'Fee ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user's building
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (!building) {
      return NextResponse.json({ error: 'No building found for user' }, { status: 403 });
    }

    // Verify fee belongs to user's building
    const { data: fee } = await supabase
      .from('maintenance_fees')
      .select('building_id')
      .eq('id', feeId)
      .single();

    if (!fee || fee.building_id !== building.id) {
      return NextResponse.json({ error: 'Fee not found or unauthorized' }, { status: 403 });
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (paidDate) updateData.paid_date = paidDate;
    if (paymentMethod) updateData.payment_method = paymentMethod;
    if (paymentReference) updateData.payment_reference = paymentReference;
    if (notes !== undefined) updateData.notes = notes;

    // If marking as paid, set paid_date to now if not provided
    if (status === 'paid' && !paidDate) {
      updateData.paid_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    const { data: updatedFee, error } = await supabase
      .from('maintenance_fees')
      .update(updateData)
      .eq('id', feeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating maintenance fee:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, fee: updatedFee });

  } catch (error) {
    console.error('Error in maintenance fee update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
