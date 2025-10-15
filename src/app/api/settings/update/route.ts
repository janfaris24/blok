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

    if (buildingError || !building) {
      console.error('Building error:', buildingError);
      return NextResponse.json(
        { error: 'Edificio no encontrado' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { preferred_language, admin_name } = body;

    // Validate language
    if (preferred_language && !['es', 'en'].includes(preferred_language)) {
      return NextResponse.json(
        { error: 'Idioma inválido' },
        { status: 400 }
      );
    }

    // Update building language preference
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (preferred_language) {
      updateData.preferred_language = preferred_language;
    }

    console.log('[Settings Update] Updating building:', building.id, 'with data:', updateData);

    const { error: updateError } = await supabase
      .from('buildings')
      .update(updateData)
      .eq('id', building.id);

    if (updateError) {
      console.error('[Settings Update] Building update error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar configuración', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('[Settings Update] ✅ Building updated successfully');

    // Update user profile language preference
    if (preferred_language) {
      console.log('[Settings Update] Updating user_profiles:', user.id, 'language:', preferred_language);

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          language: preferred_language,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('[Settings Update] User profile update error:', profileError);
        // Don't fail the whole request if profile update fails
      } else {
        console.log('[Settings Update] ✅ User profile updated successfully');
      }
    }

    // Update user metadata for admin name
    if (admin_name) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: admin_name }
      });

      if (metadataError) {
        console.error('Metadata update error:', metadataError);
        // Don't fail the whole request if metadata update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
    });
  } catch (error: any) {
    console.error('Error in settings update:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
