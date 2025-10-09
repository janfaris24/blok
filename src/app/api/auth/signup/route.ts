import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Sign up a new admin user and create their building
 *
 * POST /api/auth/signup
 * Body: {
 *   email: string;
 *   password: string;
 *   fullName: string;
 *   buildingName: string;
 *   language?: string; // 'es' | 'en'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, buildingName, language } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName || !buildingName) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create the auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          language: language || 'es', // Pass language preference
        },
        // Auto-confirm for development (remove in production)
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });

    if (signUpError) {
      console.error('[Signup] Auth error:', signUpError);
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

    // Note: User profile is auto-created by database trigger
    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create minimal building record
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .insert({
        name: buildingName,
        address: '', // Will be filled in onboarding
        total_units: 0, // Will be filled in onboarding
        admin_user_id: authData.user.id,
        city: 'San Juan',
        onboarding_completed: false,
      })
      .select()
      .single();

    if (buildingError) {
      console.error('[Signup] Building creation error:', buildingError);
      // Try to clean up the auth user (best effort)
      // Note: This won't work in production, you'd need admin API
      return NextResponse.json(
        { error: 'Error al crear el edificio. Por favor contacta soporte.' },
        { status: 500 }
      );
    }

    console.log('[Signup] ✅ User and building created:', {
      email,
      buildingId: building.id,
      buildingName,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      building: {
        id: building.id,
        name: building.name,
      },
      message: 'Cuenta creada exitosamente',
    });

  } catch (error) {
    console.error('[Signup] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
