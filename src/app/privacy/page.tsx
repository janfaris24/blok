"use client";

import { LandingLanguageProvider, useLandingLanguage } from "@/contexts/landing-language-context";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

function PrivacyContent() {
  const { language } = useLandingLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'es'
              ? 'Última actualización: 30 de octubre de 2024'
              : 'Last updated: October 30, 2024'}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {language === 'es' ? (
              <>
                <h2>1. Información que Recopilamos</h2>
                <p>
                  Blok ("nosotros", "nuestro" o "la Compañía") recopila la siguiente información cuando utiliza nuestros servicios:
                </p>
                <ul>
                  <li><strong>Información de Cuenta:</strong> Nombre, correo electrónico, número de teléfono y dirección del edificio.</li>
                  <li><strong>Información de Residentes:</strong> Nombres, unidades, números de teléfono, correos electrónicos y preferencias de comunicación.</li>
                  <li><strong>Mensajes:</strong> Contenido de las conversaciones entre administradores y residentes a través de WhatsApp.</li>
                  <li><strong>Datos de Uso:</strong> Información sobre cómo utiliza la plataforma, incluyendo funciones accedidas y tiempo de uso.</li>
                </ul>

                <h2>2. Cómo Utilizamos su Información</h2>
                <p>Utilizamos la información recopilada para:</p>
                <ul>
                  <li>Proporcionar y mantener nuestros servicios de gestión de condominios</li>
                  <li>Facilitar la comunicación entre administradores y residentes</li>
                  <li>Analizar mensajes automáticamente usando inteligencia artificial para proporcionar respuestas y gestión eficiente</li>
                  <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
                  <li>Enviar notificaciones importantes sobre el servicio</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>

                <h2>3. Compartir Información</h2>
                <p>No vendemos su información personal. Compartimos información únicamente:</p>
                <ul>
                  <li><strong>Con Proveedores de Servicios:</strong> Twilio (WhatsApp), Anthropic (IA), Supabase (base de datos), Resend (correo electrónico)</li>
                  <li><strong>Por Requerimiento Legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
                  <li><strong>Con su Consentimiento:</strong> Cuando usted autorice específicamente compartir su información</li>
                </ul>

                <h2>4. Seguridad de Datos</h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizacionales para proteger su información:
                </p>
                <ul>
                  <li>Encriptación de datos en tránsito y en reposo</li>
                  <li>Controles de acceso basados en roles (RLS)</li>
                  <li>Auditorías de seguridad regulares</li>
                  <li>Almacenamiento seguro en servidores certificados</li>
                </ul>

                <h2>5. Sus Derechos</h2>
                <p>Usted tiene derecho a:</p>
                <ul>
                  <li>Acceder a su información personal</li>
                  <li>Corregir información incorrecta</li>
                  <li>Solicitar la eliminación de su información</li>
                  <li>Exportar sus datos</li>
                  <li>Retirar su consentimiento para el procesamiento de datos</li>
                  <li>Presentar una queja ante una autoridad de protección de datos</li>
                </ul>

                <h2>6. WhatsApp y Mensajería</h2>
                <p>
                  Blok utiliza la API de WhatsApp Business a través de Twilio. Los mensajes enviados a través de WhatsApp:
                </p>
                <ul>
                  <li>Requieren consentimiento explícito del residente ("opt-in")</li>
                  <li>Se almacenan en nuestra base de datos para proporcionar el servicio</li>
                  <li>Son analizados por IA (Claude de Anthropic) para proporcionar respuestas automáticas</li>
                  <li>Los residentes pueden optar por no recibir mensajes ("opt-out") en cualquier momento</li>
                </ul>

                <h2>7. Inteligencia Artificial</h2>
                <p>
                  Utilizamos Claude (Anthropic) para analizar mensajes y generar respuestas automáticas. Los datos procesados:
                </p>
                <ul>
                  <li>Son enviados a Anthropic únicamente para procesamiento</li>
                  <li>No son utilizados por Anthropic para entrenar modelos</li>
                  <li>Son procesados de acuerdo con la política de privacidad de Anthropic</li>
                  <li>Los administradores pueden revisar todas las respuestas de IA</li>
                </ul>

                <h2>8. Retención de Datos</h2>
                <p>
                  Retenemos su información mientras su cuenta esté activa y durante un período razonable después para cumplir con obligaciones legales. Puede solicitar la eliminación de su información en cualquier momento.
                </p>

                <h2>9. Cookies y Tecnologías Similares</h2>
                <p>
                  Utilizamos cookies esenciales para el funcionamiento del servicio. No utilizamos cookies de seguimiento o publicidad de terceros.
                </p>

                <h2>10. Cambios a esta Política</h2>
                <p>
                  Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos de cambios significativos por correo electrónico o a través de la plataforma.
                </p>

                <h2>11. Contacto</h2>
                <p>
                  Para preguntas sobre esta política de privacidad o para ejercer sus derechos, contáctenos:
                </p>
                <ul>
                  <li>Email: privacy@blok.app</li>
                  <li>Dirección: San Juan, Puerto Rico</li>
                </ul>

                <h2>12. Jurisdicción</h2>
                <p>
                  Blok opera en Puerto Rico y cumple con las leyes de privacidad aplicables en Puerto Rico y Estados Unidos.
                </p>
              </>
            ) : (
              <>
                <h2>1. Information We Collect</h2>
                <p>
                  Blok ("we", "our", or "Company") collects the following information when you use our services:
                </p>
                <ul>
                  <li><strong>Account Information:</strong> Name, email, phone number, and building address.</li>
                  <li><strong>Resident Information:</strong> Names, units, phone numbers, emails, and communication preferences.</li>
                  <li><strong>Messages:</strong> Content of conversations between administrators and residents via WhatsApp.</li>
                  <li><strong>Usage Data:</strong> Information about how you use the platform, including features accessed and usage time.</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use collected information to:</p>
                <ul>
                  <li>Provide and maintain our condo management services</li>
                  <li>Facilitate communication between administrators and residents</li>
                  <li>Automatically analyze messages using artificial intelligence to provide efficient responses and management</li>
                  <li>Improve our services and develop new features</li>
                  <li>Send important service notifications</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2>3. Information Sharing</h2>
                <p>We do not sell your personal information. We share information only:</p>
                <ul>
                  <li><strong>With Service Providers:</strong> Twilio (WhatsApp), Anthropic (AI), Supabase (database), Resend (email)</li>
                  <li><strong>By Legal Requirement:</strong> When required by law or to protect our rights</li>
                  <li><strong>With Your Consent:</strong> When you specifically authorize sharing your information</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>
                  We implement technical and organizational security measures to protect your information:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Role-based access controls (RLS)</li>
                  <li>Regular security audits</li>
                  <li>Secure storage on certified servers</li>
                </ul>

                <h2>5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Correct incorrect information</li>
                  <li>Request deletion of your information</li>
                  <li>Export your data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>File a complaint with a data protection authority</li>
                </ul>

                <h2>6. WhatsApp and Messaging</h2>
                <p>
                  Blok uses the WhatsApp Business API through Twilio. Messages sent via WhatsApp:
                </p>
                <ul>
                  <li>Require explicit resident consent ("opt-in")</li>
                  <li>Are stored in our database to provide the service</li>
                  <li>Are analyzed by AI (Claude from Anthropic) to provide automatic responses</li>
                  <li>Residents can opt-out of receiving messages at any time</li>
                </ul>

                <h2>7. Artificial Intelligence</h2>
                <p>
                  We use Claude (Anthropic) to analyze messages and generate automatic responses. Processed data:
                </p>
                <ul>
                  <li>Is sent to Anthropic for processing only</li>
                  <li>Is not used by Anthropic to train models</li>
                  <li>Is processed according to Anthropic's privacy policy</li>
                  <li>Administrators can review all AI responses</li>
                </ul>

                <h2>8. Data Retention</h2>
                <p>
                  We retain your information while your account is active and for a reasonable period afterward to fulfill legal obligations. You may request deletion of your information at any time.
                </p>

                <h2>9. Cookies and Similar Technologies</h2>
                <p>
                  We use essential cookies for service functionality. We do not use third-party tracking or advertising cookies.
                </p>

                <h2>10. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy occasionally. We will notify you of significant changes by email or through the platform.
                </p>

                <h2>11. Contact</h2>
                <p>
                  For questions about this privacy policy or to exercise your rights, contact us:
                </p>
                <ul>
                  <li>Email: privacy@blok.app</li>
                  <li>Address: San Juan, Puerto Rico</li>
                </ul>

                <h2>12. Jurisdiction</h2>
                <p>
                  Blok operates in Puerto Rico and complies with applicable privacy laws in Puerto Rico and the United States.
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

export default function PrivacyPage() {
  return (
    <LandingLanguageProvider>
      <PrivacyContent />
    </LandingLanguageProvider>
  );
}
