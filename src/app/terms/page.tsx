"use client";

import { LandingLanguageProvider, useLandingLanguage } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

function TermsContent() {
  const { language } = useLandingLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            {language === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'es'
              ? 'Última actualización: 30 de octubre de 2024'
              : 'Last updated: October 30, 2024'}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {language === 'es' ? (
              <>
                <h2>1. Aceptación de los Términos</h2>
                <p>
                  Al acceder y utilizar Blok ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones ("Términos"). Si no está de acuerdo con estos Términos, no utilice el Servicio.
                </p>

                <h2>2. Descripción del Servicio</h2>
                <p>
                  Blok es una plataforma de comunicación y gestión para condominios que:
                </p>
                <ul>
                  <li>Facilita la comunicación entre administradores y residentes a través de WhatsApp</li>
                  <li>Utiliza inteligencia artificial para analizar mensajes y generar respuestas automáticas</li>
                  <li>Gestiona solicitudes de mantenimiento y anuncios masivos</li>
                  <li>Proporciona un dashboard centralizado para administradores</li>
                </ul>

                <h2>3. Cuenta de Usuario</h2>
                <p>
                  Para usar Blok, debe:
                </p>
                <ul>
                  <li>Ser administrador, miembro de junta, o property manager de un condominio</li>
                  <li>Proporcionar información precisa y completa</li>
                  <li>Mantener la seguridad de su contraseña</li>
                  <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
                  <li>Tener al menos 18 años de edad</li>
                </ul>
                <p>
                  Usted es responsable de todas las actividades que ocurran bajo su cuenta.
                </p>

                <h2>4. Suscripción y Pago</h2>
                <h3>4.1 Planes de Suscripción</h3>
                <ul>
                  <li><strong>Starter:</strong> Hasta 50 unidades</li>
                  <li><strong>Professional:</strong> Hasta 150 unidades</li>
                  <li><strong>Enterprise:</strong> Unidades ilimitadas</li>
                </ul>

                <h3>4.2 Facturación</h3>
                <ul>
                  <li>Las suscripciones se facturan mensualmente por adelantado</li>
                  <li>Los pagos se procesan a través de Stripe</li>
                  <li>Los precios pueden cambiar con aviso de 30 días</li>
                  <li>No hay reembolsos por cancelaciones anticipadas</li>
                </ul>

                <h3>4.3 Prueba Gratuita</h3>
                <ul>
                  <li>Ofrecemos una prueba gratuita de 30 días</li>
                  <li>No se requiere tarjeta de crédito para la prueba</li>
                  <li>Después de la prueba, debe suscribirse para continuar usando el servicio</li>
                </ul>

                <h2>5. Uso Aceptable</h2>
                <p>
                  Al usar Blok, usted acepta NO:
                </p>
                <ul>
                  <li>Usar el servicio para propósitos ilegales</li>
                  <li>Enviar spam o contenido no solicitado a residentes</li>
                  <li>Acosar, amenazar o discriminar a otros usuarios</li>
                  <li>Intentar acceder a cuentas de otros usuarios</li>
                  <li>Interferir con el funcionamiento del servicio</li>
                  <li>Hacer ingeniería inversa del software</li>
                  <li>Utilizar el servicio para violar la privacidad de los residentes</li>
                </ul>

                <h2>6. WhatsApp y Consentimiento</h2>
                <p>
                  Al usar las funciones de mensajería de WhatsApp:
                </p>
                <ul>
                  <li>Debe obtener consentimiento explícito ("opt-in") de cada residente antes de enviar mensajes</li>
                  <li>Debe honrar las solicitudes de "opt-out" inmediatamente</li>
                  <li>Debe cumplir con las políticas de WhatsApp Business</li>
                  <li>Es responsable del contenido de los mensajes enviados</li>
                </ul>
                <p>
                  El incumplimiento puede resultar en la suspensión del servicio.
                </p>

                <h2>7. Inteligencia Artificial</h2>
                <p>
                  Nuestro servicio de IA:
                </p>
                <ul>
                  <li>Analiza mensajes automáticamente para generar respuestas</li>
                  <li>Puede cometer errores - usted es responsable de revisar las respuestas</li>
                  <li>No sustituye el juicio humano en situaciones críticas</li>
                  <li>Puede ser desactivado en cualquier momento desde su configuración</li>
                </ul>

                <h2>8. Propiedad Intelectual</h2>
                <p>
                  Blok y todo su contenido (software, diseño, textos, logos) son propiedad de Blok o sus licenciantes. Usted recibe una licencia limitada, no exclusiva, no transferible para usar el servicio.
                </p>
                <p>
                  Los datos que usted ingresa (información de residentes, mensajes, etc.) permanecen de su propiedad.
                </p>

                <h2>9. Datos y Privacidad</h2>
                <p>
                  El uso de sus datos está regulado por nuestra <a href="/privacy" className="text-primary underline">Política de Privacidad</a>.
                </p>
                <ul>
                  <li>Usted es el controlador de los datos de sus residentes</li>
                  <li>Blok actúa como procesador de datos en su nombre</li>
                  <li>Debe cumplir con leyes de privacidad aplicables</li>
                  <li>Puede exportar o eliminar sus datos en cualquier momento</li>
                </ul>

                <h2>10. Cancelación y Suspensión</h2>
                <h3>10.1 Cancelación por Su Parte</h3>
                <ul>
                  <li>Puede cancelar su suscripción en cualquier momento desde Configuración</li>
                  <li>El acceso continúa hasta el final del período pagado</li>
                  <li>No hay reembolsos por cancelaciones anticipadas</li>
                </ul>

                <h3>10.2 Suspensión por Nuestra Parte</h3>
                <p>
                  Podemos suspender o terminar su cuenta si:
                </p>
                <ul>
                  <li>Viola estos Términos</li>
                  <li>Su pago está vencido</li>
                  <li>Usa el servicio de manera fraudulenta o abusiva</li>
                  <li>Recibimos una orden judicial</li>
                </ul>

                <h2>11. Limitación de Responsabilidad</h2>
                <p>
                  <strong>EL SERVICIO SE PROPORCIONA "TAL CUAL" SIN GARANTÍAS DE NINGÚN TIPO.</strong>
                </p>
                <p>
                  EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, BLOK NO SERÁ RESPONSABLE POR:
                </p>
                <ul>
                  <li>Daños indirectos, incidentales o consecuentes</li>
                  <li>Pérdida de datos, ganancias o ingresos</li>
                  <li>Interrupciones del servicio</li>
                  <li>Errores en respuestas generadas por IA</li>
                  <li>Acciones tomadas basándose en el contenido del servicio</li>
                </ul>
                <p>
                  Nuestra responsabilidad máxima está limitada al monto pagado en los últimos 12 meses.
                </p>

                <h2>12. Indemnización</h2>
                <p>
                  Usted acepta indemnizar y mantener a Blok libre de cualquier reclamo resultante de:
                </p>
                <ul>
                  <li>Su uso del servicio</li>
                  <li>Violación de estos Términos</li>
                  <li>Violación de derechos de terceros</li>
                  <li>Mensajes enviados a residentes sin consentimiento</li>
                </ul>

                <h2>13. Modificaciones al Servicio</h2>
                <p>
                  Nos reservamos el derecho de:
                </p>
                <ul>
                  <li>Modificar o descontinuar el servicio con aviso de 30 días</li>
                  <li>Actualizar funcionalidades sin previo aviso</li>
                  <li>Cambiar estos Términos (le notificaremos los cambios significativos)</li>
                </ul>

                <h2>14. Exportación de Datos</h2>
                <p>
                  Usted puede exportar sus datos en cualquier momento:
                </p>
                <ul>
                  <li>Información de residentes en formato CSV/Excel</li>
                  <li>Historial de conversaciones</li>
                  <li>Solicitudes de mantenimiento</li>
                </ul>

                <h2>15. Ley Aplicable y Jurisdicción</h2>
                <p>
                  Estos Términos se rigen por las leyes de Puerto Rico y Estados Unidos. Cualquier disputa será resuelta en los tribunales de San Juan, Puerto Rico.
                </p>

                <h2>16. Acuerdo Completo</h2>
                <p>
                  Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y Blok.
                </p>

                <h2>17. Divisibilidad</h2>
                <p>
                  Si alguna disposición de estos Términos es inválida, las demás disposiciones permanecen en vigor.
                </p>

                <h2>18. Contacto</h2>
                <p>
                  Para preguntas sobre estos Términos:
                </p>
                <ul>
                  <li>Email: legal@blok.app</li>
                  <li>Dirección: San Juan, Puerto Rico</li>
                </ul>

                <p className="mt-8 text-sm text-muted-foreground italic">
                  Al usar Blok, usted confirma que ha leído, entendido y aceptado estos Términos y Condiciones.
                </p>
              </>
            ) : (
              <>
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Blok ("the Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with these Terms, do not use the Service.
                </p>

                <h2>2. Service Description</h2>
                <p>
                  Blok is a communication and management platform for condominiums that:
                </p>
                <ul>
                  <li>Facilitates communication between administrators and residents via WhatsApp</li>
                  <li>Uses artificial intelligence to analyze messages and generate automatic responses</li>
                  <li>Manages maintenance requests and mass broadcasts</li>
                  <li>Provides a centralized dashboard for administrators</li>
                </ul>

                <h2>3. User Account</h2>
                <p>
                  To use Blok, you must:
                </p>
                <ul>
                  <li>Be an administrator, board member, or property manager of a condominium</li>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be at least 18 years old</li>
                </ul>
                <p>
                  You are responsible for all activities that occur under your account.
                </p>

                <h2>4. Subscription and Payment</h2>
                <h3>4.1 Subscription Plans</h3>
                <ul>
                  <li><strong>Starter:</strong> Up to 50 units</li>
                  <li><strong>Professional:</strong> Up to 150 units</li>
                  <li><strong>Enterprise:</strong> Unlimited units</li>
                </ul>

                <h3>4.2 Billing</h3>
                <ul>
                  <li>Subscriptions are billed monthly in advance</li>
                  <li>Payments are processed through Stripe</li>
                  <li>Prices may change with 30 days notice</li>
                  <li>No refunds for early cancellations</li>
                </ul>

                <h3>4.3 Free Trial</h3>
                <ul>
                  <li>We offer a 30-day free trial</li>
                  <li>No credit card required for trial</li>
                  <li>After trial, you must subscribe to continue using the service</li>
                </ul>

                <h2>5. Acceptable Use</h2>
                <p>
                  By using Blok, you agree NOT to:
                </p>
                <ul>
                  <li>Use the service for illegal purposes</li>
                  <li>Send spam or unsolicited content to residents</li>
                  <li>Harass, threaten, or discriminate against other users</li>
                  <li>Attempt to access other users' accounts</li>
                  <li>Interfere with the service's operation</li>
                  <li>Reverse engineer the software</li>
                  <li>Use the service to violate residents' privacy</li>
                </ul>

                <h2>6. WhatsApp and Consent</h2>
                <p>
                  When using WhatsApp messaging features:
                </p>
                <ul>
                  <li>You must obtain explicit consent ("opt-in") from each resident before sending messages</li>
                  <li>You must honor "opt-out" requests immediately</li>
                  <li>You must comply with WhatsApp Business policies</li>
                  <li>You are responsible for the content of messages sent</li>
                </ul>
                <p>
                  Non-compliance may result in service suspension.
                </p>

                <h2>7. Artificial Intelligence</h2>
                <p>
                  Our AI service:
                </p>
                <ul>
                  <li>Automatically analyzes messages to generate responses</li>
                  <li>May make mistakes - you are responsible for reviewing responses</li>
                  <li>Does not replace human judgment in critical situations</li>
                  <li>Can be disabled at any time from your settings</li>
                </ul>

                <h2>8. Intellectual Property</h2>
                <p>
                  Blok and all its content (software, design, text, logos) are property of Blok or its licensors. You receive a limited, non-exclusive, non-transferable license to use the service.
                </p>
                <p>
                  Data you input (resident information, messages, etc.) remains your property.
                </p>

                <h2>9. Data and Privacy</h2>
                <p>
                  Use of your data is governed by our <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
                </p>
                <ul>
                  <li>You are the data controller for your residents' data</li>
                  <li>Blok acts as data processor on your behalf</li>
                  <li>You must comply with applicable privacy laws</li>
                  <li>You can export or delete your data at any time</li>
                </ul>

                <h2>10. Cancellation and Suspension</h2>
                <h3>10.1 Cancellation by You</h3>
                <ul>
                  <li>You can cancel your subscription at any time from Settings</li>
                  <li>Access continues until the end of the paid period</li>
                  <li>No refunds for early cancellations</li>
                </ul>

                <h3>10.2 Suspension by Us</h3>
                <p>
                  We may suspend or terminate your account if:
                </p>
                <ul>
                  <li>You violate these Terms</li>
                  <li>Your payment is overdue</li>
                  <li>You use the service fraudulently or abusively</li>
                  <li>We receive a court order</li>
                </ul>

                <h2>11. Limitation of Liability</h2>
                <p>
                  <strong>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</strong>
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLOK WILL NOT BE LIABLE FOR:
                </p>
                <ul>
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of data, profits, or revenue</li>
                  <li>Service interruptions</li>
                  <li>Errors in AI-generated responses</li>
                  <li>Actions taken based on service content</li>
                </ul>
                <p>
                  Our maximum liability is limited to the amount paid in the last 12 months.
                </p>

                <h2>12. Indemnification</h2>
                <p>
                  You agree to indemnify and hold Blok harmless from any claims resulting from:
                </p>
                <ul>
                  <li>Your use of the service</li>
                  <li>Violation of these Terms</li>
                  <li>Violation of third-party rights</li>
                  <li>Messages sent to residents without consent</li>
                </ul>

                <h2>13. Service Modifications</h2>
                <p>
                  We reserve the right to:
                </p>
                <ul>
                  <li>Modify or discontinue the service with 30 days notice</li>
                  <li>Update features without prior notice</li>
                  <li>Change these Terms (we will notify you of significant changes)</li>
                </ul>

                <h2>14. Data Export</h2>
                <p>
                  You can export your data at any time:
                </p>
                <ul>
                  <li>Resident information in CSV/Excel format</li>
                  <li>Conversation history</li>
                  <li>Maintenance requests</li>
                </ul>

                <h2>15. Governing Law and Jurisdiction</h2>
                <p>
                  These Terms are governed by the laws of Puerto Rico and the United States. Any disputes will be resolved in the courts of San Juan, Puerto Rico.
                </p>

                <h2>16. Entire Agreement</h2>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Blok.
                </p>

                <h2>17. Severability</h2>
                <p>
                  If any provision of these Terms is invalid, the remaining provisions remain in effect.
                </p>

                <h2>18. Contact</h2>
                <p>
                  For questions about these Terms:
                </p>
                <ul>
                  <li>Email: legal@blok.app</li>
                  <li>Address: San Juan, Puerto Rico</li>
                </ul>

                <p className="mt-8 text-sm text-muted-foreground italic">
                  By using Blok, you confirm that you have read, understood, and accepted these Terms and Conditions.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TermsPage() {
  return (
    <LandingLanguageProvider>
      <TermsContent />
    </LandingLanguageProvider>
  );
}
