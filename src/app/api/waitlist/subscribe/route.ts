import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, building, language = 'es' } = body;

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: language === 'es' ? 'El correo electrónico es requerido' : 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: language === 'es' ? 'Correo electrónico inválido' : 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get analytics data from request
    const referrerUrl = request.headers.get('referer') || request.headers.get('referrer') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Check if email already exists
    const { data: existingEntry } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingEntry) {
      return NextResponse.json(
        {
          error: language === 'es'
            ? 'Este correo ya está registrado en la lista de espera'
            : 'This email is already on the waitlist',
          alreadySubscribed: true
        },
        { status: 409 }
      );
    }

    // Insert into waitlist table
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        building: building?.trim() || null,
        source: 'landing_page',
        referrer_url: referrerUrl,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      return NextResponse.json(
        { error: language === 'es' ? 'Error al registrarse' : 'Error subscribing to waitlist' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailContent = language === 'es' ? {
        subject: '¡Bienvenido a la lista de espera de Blok! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px 20px; }
                .card { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                h1 { margin: 0; font-size: 28px; }
                h2 { color: #111827; margin-top: 0; }
                .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>¡Gracias por unirte! 🎉</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.95;">Estás en la lista de espera de Blok</p>
                </div>

                <div class="content">
                  <div class="card">
                    <h2>Hola${name ? ` ${name}` : ''},</h2>
                    <p>Gracias por tu interés en <strong>Blok</strong>, la plataforma de comunicación inteligente para condominios en Puerto Rico.</p>
                    <p>Te confirmamos que tu correo <span class="highlight">${email}</span> ha sido añadido a nuestra lista de espera.</p>
                  </div>

                  <div class="card">
                    <h2>¿Qué sigue?</h2>
                    <ul style="padding-left: 20px;">
                      <li>Serás de los primeros en enterarte cuando lancemos</li>
                      <li>Recibirás acceso anticipado a la plataforma</li>
                    </ul>
                  </div>

                  <div class="card">
                    <h2>Mientras tanto...</h2>
                    <p>Estamos trabajando duro para crear la mejor experiencia posible. Si tienes alguna pregunta o sugerencia, no dudes en responder a este correo.</p>
                    <p style="text-align: center;">
                      <a href="https://blokpr.co" class="button">Visitar Blok</a>
                    </p>
                  </div>
                </div>

                <div class="footer">
                  <p><strong>Blok</strong> - Comunicación inteligente para condominios</p>
                  <p style="font-size: 12px; margin-top: 10px;">
                    Este correo fue enviado a ${email} porque te registraste en blokpr.co
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      } : {
        subject: 'Welcome to the Blok Waitlist! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px 20px; }
                .card { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                h1 { margin: 0; font-size: 28px; }
                h2 { color: #111827; margin-top: 0; }
                .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Thanks for joining! 🎉</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.95;">You're on the Blok waitlist</p>
                </div>

                <div class="content">
                  <div class="card">
                    <h2>Hello${name ? ` ${name}` : ''},</h2>
                    <p>Thank you for your interest in <strong>Blok</strong>, the smart communication platform for condominiums in Puerto Rico.</p>
                    <p>We confirm that your email <span class="highlight">${email}</span> has been added to our waitlist.</p>
                  </div>

                  <div class="card">
                    <h2>What's next?</h2>
                    <ul style="padding-left: 20px;">
                      <li>You'll be among the first to know when we launch</li>
                      <li>You'll receive early access to the platform</li>
                    </ul>
                  </div>

                  <div class="card">
                    <h2>In the meantime...</h2>
                    <p>We're working hard to create the best possible experience. If you have any questions or suggestions, feel free to reply to this email.</p>
                    <p style="text-align: center;">
                      <a href="https://blokpr.co" class="button">Visit Blok</a>
                    </p>
                  </div>
                </div>

                <div class="footer">
                  <p><strong>Blok</strong> - Smart communication for condominiums</p>
                  <p style="font-size: 12px; margin-top: 10px;">
                    This email was sent to ${email} because you signed up at blokpr.co
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      await resend.emails.send({
        from: 'Blok <waitlist@blokpr.co>',
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails - they're still on the waitlist
    }

    return NextResponse.json({
      success: true,
      message: language === 'es'
        ? '¡Gracias! Te avisaremos cuando Blok esté listo.'
        : 'Thank you! We\'ll notify you when Blok is ready.',
      data: {
        email: waitlistEntry.email,
        subscribed_at: waitlistEntry.subscribed_at,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Waitlist subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
