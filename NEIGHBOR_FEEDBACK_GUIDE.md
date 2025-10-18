# Guía para Recopilar Feedback de Vecinos

## 📱 Mensaje para WhatsApp

Copia y pega este mensaje en tu grupo de WhatsApp del edificio:

```
¡Hola vecinos! 👋

Les quiero compartir algo en lo que he estado trabajando: *Blok* - una plataforma para mejorar la comunicación en nuestro condominio.

🏢 *¿Qué es Blok?*
Una app que conecta a la junta con todos nosotros vía WhatsApp. Permite reportar mantenimientos, recibir avisos importantes, y comunicarnos mejor - todo desde WhatsApp.

📊 *Necesito su opinión*
Como vecinos, su feedback es super valioso. Les pido 5 minutos para:

1️⃣ Ver la página web: https://blokpr.co
2️⃣ Llenar este formulario corto: https://blokpr.co/feedback

*Es confidencial.* Solo quiero saber si les parece útil, qué mejorarías, y si lo usarían.

💡 *¿Por qué?*
Quiero crear algo que realmente nos ayude a todos. Su opinión me ayudará a hacerlo mejor antes de lanzarlo oficialmente.

¿Preguntas? Escríbanme directo.

¡Gracias! 🙏

Jan
```

---

## 🎯 Versión Corta (para grupos grandes):

```
Vecinos! 👋

Estoy creando *Blok* - una app para mejorar la comunicación de nuestro condominio vía WhatsApp.

🌐 Web: https://blokpr.co
📝 Feedback (5 min): https://blokpr.co/feedback

Necesito su opinión antes de lanzar. ¿Me ayudan?

Gracias! 🙏 - Jan
```

---

## 📧 Mensaje para Email (alternativo):

**Asunto:** Feedback sobre Blok - Nueva app para nuestro condominio

```
Hola vecinos,

Espero estén bien. Les escribo porque he estado trabajando en un proyecto que podría beneficiarnos a todos: Blok.

¿Qué es Blok?
Blok es una plataforma diseñada específicamente para condominios en Puerto Rico que facilita la comunicación entre la junta y residentes a través de WhatsApp.

Características principales:
• Reportar mantenimientos desde WhatsApp
• Recibir notificaciones importantes
• Comunicación directa con la administración
• Todo en español, diseñado para Puerto Rico

¿Por qué les pido feedback?
Como vecinos, ustedes son los expertos en lo que funciona y lo que no en nuestro edificio. Su opinión me ayudará a hacer Blok mejor antes del lanzamiento oficial.

¿Cómo pueden ayudar?
1. Visiten: https://blokpr.co (toma 2 minutos ver la demo)
2. Llenen el formulario: https://blokpr.co/feedback (5 minutos máximo)

Todo es confidencial y sus respuestas serán muy valiosas.

Si tienen preguntas, con gusto las contesto.

¡Muchas gracias de antemano!

Jan Faris
Apt 504
787-343-2647
```

---

## 🎬 Próximos Pasos

### 1. Antes de enviar el mensaje:

**a) Asegúrate que el sitio esté funcionando:**
```bash
cd /Users/janfaris/condosync
npm run dev
```

Visita:
- Landing page: http://localhost:3000
- Feedback form: http://localhost:3000/feedback

**b) Prueba el formulario:**
- Llena el form con datos de prueba
- Verifica que se guarde en la base de datos

### 2. Deploy a producción:

```bash
# Asegúrate de estar en main
git checkout main

# Crea commit con los nuevos cambios
git add .
git commit -m "Add feedback form for neighbor testing"

# Deploy a Vercel
vercel --prod
```

### 3. Envía el mensaje:

- **Mejor hora**: 7-9 PM (cuando más gente está activa)
- **Mejor día**: Jueves o Viernes
- **Tip**: Si puedes, ancla el mensaje al grupo para que no se pierda

### 4. Seguimiento (3-5 días después):

```
Gracias a los que ya dieron feedback! 🙏

Para los que no han podido, les dejo el link de nuevo:
https://blokpr.co/feedback

¿Dudas? Pregunten!
```

---

## 📊 Ver las Respuestas

### Opción A: Desde la base de datos (Supabase)

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Table Editor** → **feedback**
4. Verás todas las respuestas en tiempo real

### Opción B: Crear un dashboard simple

Puedes crear una página en `/dashboard/feedback` para ver las respuestas.

---

## 💡 Tips para Maximizar Respuestas

1. **Sé personal**: No copies y pegues sin contexto
2. **Explica por qué**: "Estoy creando esto PARA nosotros"
3. **Hazlo fácil**: Links directos, formulario corto
4. **Seguimiento suave**: Un recordatorio amable 3-5 días después
5. **Agradece públicamente**: "Gracias a los X vecinos que ya respondieron!"
6. **Incentivo (opcional)**: "Los primeros 20 en responder entran en un sorteo de..."

---

## 🎯 Métricas de Éxito

**Bueno:**
- 20-30% de respuestas (6-9 vecinos de 30 unidades)
- NPS promedio > 7
- Al menos 3 interesados en probar

**Excelente:**
- 40%+ de respuestas (12+ vecinos)
- NPS promedio > 8
- 5+ interesados en probar
- Feedback constructivo

---

## ❓ Preguntas Frecuentes que Puedan Tener

**Q: ¿Cuánto cuesta?**
A: Eso lo decide la junta. Primero quiero saber si les parece útil como residentes.

**Q: ¿Cuándo estaría disponible?**
A: Depende del feedback. Si les interesa, podría estar en 2-4 semanas.

**Q: ¿La junta ya sabe de esto?**
A: Estoy recopilando feedback de vecinos primero. Si hay interés, se lo presentaré a la junta.

**Q: ¿Funciona con nuestro sistema actual?**
A: Blok es independiente - solo necesita WhatsApp. No reemplaza nada, solo añade mejor comunicación.

---

## 🚀 ¿Listo?

1. ✅ Lee el mensaje
2. ✅ Personalízalo si quieres
3. ✅ Copia y pega al grupo
4. ✅ Espera respuestas
5. ✅ Revisa feedback en Supabase
6. ✅ Itera basado en lo que dicen

¡Buena suerte! 🎉
