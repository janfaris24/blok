import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log('User:', user?.id, 'Error:', userError);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get building for this admin
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    console.log('Building:', building, 'Error:', buildingError);

    if (buildingError || !building) {
      console.error('Building error:', buildingError);
      return NextResponse.json(
        { error: 'Edificio no encontrado' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, address, city, whatsapp_business_number } = body;

    console.log('Update data:', { name, address, city, whatsapp_business_number });

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Nombre y dirección son requeridos' },
        { status: 400 }
      );
    }

    // Update building
    const { error: updateError } = await supabase
      .from('buildings')
      .update({
        name,
        address,
        city: city || 'San Juan',
        whatsapp_business_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', building.id);

    console.log('Update error:', updateError);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el edificio', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      building: {
        id: building.id,
        name,
        address,
        city: city || 'San Juan',
        whatsapp_business_number
      }
    });
  } catch (error: any) {
    console.error('Error in building update:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
