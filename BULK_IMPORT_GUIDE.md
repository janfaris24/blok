# Guía de Importación Masiva de Residentes

## ¿Qué formatos son compatibles?

El sistema acepta archivos en formato:
- **CSV** (`.csv`)
- **Excel** (`.xlsx`, `.xls`)

## Nombres de Columnas Flexibles

**No necesitas cambiar los nombres de tus columnas**. El sistema reconoce automáticamente muchas variaciones comunes:

### 📍 Número de Apartamento/Unidad
Cualquiera de estos nombres funciona:
- `unit_number`, `Unit Number`, `UNIT NUMBER`
- `apt`, `Apt`, `APT`, `Apt #`, `Apt#`
- `apartamento`, `Apartamento`
- `apto`, `Apto`
- `unit`, `Unit`
- `número`, `numero`, `No`, `#`

**Ejemplos válidos:**
- `101`, `102A`, `PH-1`, `Penthouse`

---

### 👤 Nombre
Cualquiera de estos nombres funciona:
- `first_name`, `First Name`
- `nombre`, `Nombre`
- `name`, `Name`
- `primer_nombre`, `Primer Nombre`

**Ejemplos válidos:**
- `Juan`, `María`, `José`

---

### 👤 Apellido
Cualquiera de estos nombres funciona:
- `last_name`, `Last Name`
- `apellido`, `Apellido`
- `apellidos`, `Apellidos`
- `surname`, `Surname`

**Ejemplos válidos:**
- `Pérez`, `García`, `Rodríguez`

---

### 📧 Email (Recomendado)
Cualquiera de estos nombres funciona:
- `email`, `Email`, `E-mail`
- `correo`, `Correo`
- `correo_electrónico`, `correo electronico`

**Ejemplos válidos:**
- `juan@gmail.com`
- `maria.perez@hotmail.com`

**💡 RECOMENDADO** - Si no se proporciona, el residente no podrá recibir comunicaciones por email. Puedes agregarlo manualmente después.

---

### 📱 Teléfono (Recomendado)
Cualquiera de estos nombres funciona:
- `phone`, `Phone`
- `telefono`, `teléfono`, `Telefono`
- `tel`, `Tel`
- `celular`, `Celular`
- `móvil`, `movil`, `mobile`
- `cell`, `Cell`

**Formatos aceptados:**
- `7875551234` (se convierte a +17875551234)
- `+17875551234`
- `787-555-1234`
- `(787) 555-1234`

**💡 RECOMENDADO** - Si no se proporciona, el residente no podrá recibir mensajes de WhatsApp. Puedes agregarlo manualmente después.

---

### 💬 WhatsApp (Opcional)
Cualquiera de estos nombres funciona:
- `whatsapp`, `WhatsApp`, `Whatsapp Number`
- `wa`, `WA`

**Nota:** Si no se especifica, se usa el mismo número de teléfono.

---

### 🏠 Tipo de Residente (Recomendado)
Cualquiera de estos nombres funciona:
- `type`, `Type`
- `tipo`, `Tipo`

**Valores aceptados para INQUILINO:**
- `renter`, `Renter`
- `inquilino`, `Inquilino`
- `tenant`, `Tenant`
- `arrendatario`, `Arrendatario`

**Valores aceptados para DUEÑO:**
- `owner`, `Owner`
- `dueño`, `Dueño`
- `propietario`, `Propietario`

**💡 RECOMENDADO** - Si no se proporciona, se asignará como dueño por defecto. Puedes cambiarlo manualmente después.

---

## Ejemplos de Archivos Válidos

### Ejemplo 1: Formato Simple en Español
```csv
Apt,Nombre,Apellido,Email,Teléfono,Tipo
101,Juan,Pérez,juan@email.com,7875551234,dueño
102,María,García,maria@email.com,7875555678,inquilino
```

### Ejemplo 2: Formato Completo en Inglés
```csv
Unit Number,First Name,Last Name,Email,Phone,Type
101,Juan,Pérez,juan@email.com,+17875551234,owner
102,María,García,maria@email.com,787-555-5678,renter
```

### Ejemplo 3: Formato Mixto con Acentos
```csv
Apartamento,Nombre,Apellido,Correo,Celular,Tipo
101,José,Rodríguez,jose@email.com,(787) 555-1234,propietario
102,Ana,Martínez,ana@email.com,787 555 5678,inquilino
```

### Ejemplo 4: Formato con Símbolos
```csv
#,Nombre,Apellido,E-mail,Móvil,Tipo
101,Carlos,López,carlos@email.com,787-555-1234,owner
102,Laura,Díaz,laura@email.com,939-555-5678,renter
```

---

## ¿Qué hacer si mi Excel no tiene este formato?

### Opción 1: Dejar el Excel como está ✅ RECOMENDADO
**No necesitas hacer nada**. El sistema reconocerá automáticamente las columnas más comunes en español e inglés.

Solo asegúrate de tener **los campos requeridos mínimos**:
- ✅ **Requerido:** Número de apartamento (cualquier nombre que incluya "apt", "unit", "apartamento", "#", etc.)
- ✅ **Requerido:** Nombre (cualquier nombre que incluya "nombre", "name", "first", etc.)
- ✅ **Requerido:** Apellido (cualquier nombre que incluya "apellido", "last", etc.)
- 💡 **Recomendado:** Email (necesario para comunicaciones por email)
- 💡 **Recomendado:** Teléfono (necesario para WhatsApp)
- 💡 **Recomendado:** Tipo (dueño/owner o inquilino/renter, por defecto será dueño)

### Opción 2: Renombrar Columnas
Si el sistema no reconoce automáticamente tus columnas, simplemente renombra los encabezados en Excel usando cualquiera de los nombres listados arriba.

### Opción 3: Descargar Plantilla
Haz clic en "Descargar Plantilla" en el diálogo de importación para obtener un archivo de ejemplo con el formato correcto.

---

## Validaciones Automáticas

El sistema valida automáticamente y muestra dos tipos de mensajes:

### ❌ Errores (Bloquean la importación):
- **Número de unidad vacío** - Debe corregirse
- **Nombre vacío** - Debe corregirse
- **Apellido vacío** - Debe corregirse
- **Email inválido** - Formato incorrecto (si se proporciona)
- **Teléfono inválido** - Formato incorrecto (si se proporciona)

### ⚠️ Advertencias (Permiten importar):
- **Sin email** - Se puede importar y agregar después
- **Sin teléfono** - Se puede importar y agregar después
- **Sin tipo** - Se asignará como dueño por defecto

**Si hay errores:** Debes corregirlos antes de importar.
**Si solo hay advertencias:** Puedes importar y completar la información manualmente después.

---

## Características Automáticas

🔧 **Creación automática de unidades:** Si el apartamento no existe, se crea automáticamente
📞 **Formateo de teléfonos:** Números de Puerto Rico se formatean automáticamente (+1787...)
🇵🇷 **Idioma por defecto:** Español (Puerto Rico)
✅ **Opt-ins por defecto:** WhatsApp y Email habilitados, SMS deshabilitado

---

## Consejos

💡 **Limpia espacios extra** - El sistema ignora espacios al inicio/final
💡 **Mayúsculas/minúsculas** - No importan, `APT` = `apt` = `Apt`
💡 **Acentos** - Funcionan con y sin acentos (`teléfono` = `telefono`)
💡 **Filas vacías** - Se ignoran automáticamente

---

## Soporte

¿Tu formato no es reconocido? Contáctanos y añadiremos soporte para tu formato específico.
