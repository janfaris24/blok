import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all service providers for the building
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const buildingId = building.id;

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const recommendedOnly = searchParams.get('recommended') === 'true';

    // Build query
    let query = supabase
      .from('service_providers')
      .select('*')
      .eq('building_id', buildingId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (recommendedOnly) {
      query = query.eq('is_recommended', true);
    }

    const { data: providers, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching service providers:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch service providers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: providers || [],
    });

  } catch (error) {
    console.error('Error in GET service providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new service provider
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const buildingId = building.id;

    // Get request body
    const body = await request.json();
    const {
      name,
      category,
      phone,
      whatsapp_number,
      email,
      description,
      rating,
      is_recommended
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'plumber',
      'electrician',
      'handyman',
      'ac_technician',
      'washer_dryer_technician',
      'painter',
      'locksmith',
      'pest_control',
      'cleaning',
      'security',
      'landscaping',
      'elevator',
      'pool_maintenance',
      'other'
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert the service provider
    const { data: newProvider, error: insertError } = await supabase
      .from('service_providers')
      .insert({
        building_id: buildingId,
        name: name.trim(),
        category,
        phone: phone?.trim() || null,
        whatsapp_number: whatsapp_number?.trim() || null,
        email: email?.trim() || null,
        description: description?.trim() || null,
        rating: rating || null,
        is_recommended: is_recommended !== undefined ? is_recommended : true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating service provider:', insertError);
      return NextResponse.json(
        { error: 'Failed to create service provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newProvider,
    });

  } catch (error) {
    console.error('Error in POST service providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a service provider
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const buildingId = building.id;

    // Get request body
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Verify the provider belongs to this building
    const { data: existingProvider, error: fetchError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', id)
      .eq('building_id', buildingId)
      .single();

    if (fetchError || !existingProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }

    // Update the provider
    const { data: updatedProvider, error: updateError } = await supabase
      .from('service_providers')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating service provider:', updateError);
      return NextResponse.json(
        { error: 'Failed to update service provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProvider,
    });

  } catch (error) {
    console.error('Error in PATCH service providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service provider
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (buildingError || !building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const buildingId = building.id;

    // Get provider ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Verify the provider belongs to this building
    const { data: existingProvider, error: fetchError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', id)
      .eq('building_id', buildingId)
      .single();

    if (fetchError || !existingProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      );
    }

    // Delete the provider
    const { error: deleteError } = await supabase
      .from('service_providers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting service provider:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete service provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service provider deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE service providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
