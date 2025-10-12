import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get recommended providers for a category, formatted for WhatsApp
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get query params
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const category = searchParams.get('category');
    const language = searchParams.get('language') || 'es';

    if (!buildingId || !category) {
      return NextResponse.json(
        { error: 'Missing required parameters: buildingId, category' },
        { status: 400 }
      );
    }

    // Get recommended providers for this category
    const { data: providers, error: fetchError } = await supabase
      .from('service_providers')
      .select('*')
      .eq('building_id', buildingId)
      .eq('category', category)
      .eq('is_recommended', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true });

    if (fetchError) {
      console.error('Error fetching recommended providers:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      );
    }

    // Format for WhatsApp message
    let message = '';

    if (providers && providers.length > 0) {
      // Category labels in Spanish and English
      const categoryLabels: Record<string, { es: string; en: string }> = {
        plumber: { es: 'plomería', en: 'plumbing' },
        electrician: { es: 'electricidad', en: 'electrical' },
        handyman: { es: 'mantenimiento general', en: 'general maintenance' },
        ac_technician: { es: 'aire acondicionado', en: 'air conditioning' },
        washer_dryer_technician: { es: 'lavadora/secadora', en: 'washer/dryer' },
        painter: { es: 'pintura', en: 'painting' },
        locksmith: { es: 'cerrajería', en: 'locksmith' },
        pest_control: { es: 'control de plagas', en: 'pest control' },
        cleaning: { es: 'limpieza', en: 'cleaning' },
        security: { es: 'seguridad', en: 'security' },
        landscaping: { es: 'jardinería', en: 'landscaping' },
        elevator: { es: 'ascensor', en: 'elevator' },
        pool_maintenance: { es: 'mantenimiento de piscina', en: 'pool maintenance' },
        other: { es: 'otros servicios', en: 'other services' },
      };

      const categoryLabel = categoryLabels[category]?.[language as 'es' | 'en'] || category;

      if (language === 'es') {
        message = `🔧 *Proveedores Recomendados para ${categoryLabel}:*\n\n`;

        providers.forEach((provider, index) => {
          message += `${index + 1}. *${provider.name}*\n`;
          if (provider.whatsapp_number) {
            message += `   📱 WhatsApp: ${provider.whatsapp_number}\n`;
          }
          if (provider.phone) {
            message += `   ☎️ Teléfono: ${provider.phone}\n`;
          }
          if (provider.rating) {
            message += `   ⭐ Calificación: ${provider.rating}/5\n`;
          }
          if (provider.description) {
            message += `   💬 ${provider.description}\n`;
          }
          message += '\n';
        });

        message += 'Puedes contactar directamente a cualquiera de estos proveedores para solicitar el servicio.';
      } else {
        message = `🔧 *Recommended Providers for ${categoryLabel}:*\n\n`;

        providers.forEach((provider, index) => {
          message += `${index + 1}. *${provider.name}*\n`;
          if (provider.whatsapp_number) {
            message += `   📱 WhatsApp: ${provider.whatsapp_number}\n`;
          }
          if (provider.phone) {
            message += `   ☎️ Phone: ${provider.phone}\n`;
          }
          if (provider.rating) {
            message += `   ⭐ Rating: ${provider.rating}/5\n`;
          }
          if (provider.description) {
            message += `   💬 ${provider.description}\n`;
          }
          message += '\n';
        });

        message += 'You can contact any of these providers directly to request service.';
      }
    } else {
      message = language === 'es'
        ? '⚠️ Actualmente no tenemos proveedores recomendados para este tipo de servicio. Por favor, contacta a la administración para más información.'
        : '⚠️ We currently don\'t have recommended providers for this type of service. Please contact management for more information.';
    }

    return NextResponse.json({
      success: true,
      data: {
        providers: providers || [],
        message,
        count: providers?.length || 0,
      },
    });

  } catch (error) {
    console.error('Error in recommend providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
