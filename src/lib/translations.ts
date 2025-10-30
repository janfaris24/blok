export const translations = {
  es: {
    // Navigation
    nav: {
      dashboard: 'Resumen',
      conversations: 'Conversaciones',
      maintenance: 'Mantenimiento',
      providers: 'Proveedores',
      broadcasts: 'Anuncios',
      residents: 'Residentes',
      building: 'Edificio',
      knowledge: 'Base de Conocimiento',
      settings: 'Configuración',
      help: 'Ayuda',
      logout: 'Salir',
      administration: 'Administración',
      administrator: 'Administrador',
      general: 'GENERAL',
      tools: 'HERRAMIENTAS',
      support: 'SOPORTE',
      expand: 'Expandir',
      collapse: 'Contraer',
      // Landing page
      features: 'Características',
      pricing: 'Precios',
      feedback: 'Feedback',
      login: 'Iniciar sesión',
      signup: 'Comenzar ahora',
      waitlist: 'Lista de Espera',
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      summary: 'Resumen general de',
      aiSummary: 'Resumen Inteligente',
      activeConversations: 'Conversaciones Activas',
      totalResidents: 'Total Residentes',
      openRequests: 'Solicitudes Abiertas',
      inProgress: 'En Progreso',
      total: 'total',
      maintenanceTasks: 'Maintenance tasks',
      recentConversations: 'Conversaciones Recientes',
      maintenanceRequests: 'Solicitudes de Mantenimiento',
      noConversations: 'No hay conversaciones todavía',
      noRequests: 'No hay solicitudes todavía',
      active: 'Activa',
      closed: 'Cerrada',
      ownersAndRenters: 'Propietarios e inquilinos',
    },

    // Maintenance
    maintenance: {
      title: 'Mantenimiento',
      pageDescription: 'Gestiona las solicitudes de mantenimiento del edificio',
      referredToProvider: 'Referido a Proveedor',
      referred: 'Referido',
      open: 'Abiertas',
      opened: 'Abierta',
      inProgress: 'En Progreso',
      resolved: 'Resueltas',
      resolved_single: 'Resuelta',
      closed: 'Cerradas',
      closed_single: 'Cerrada',
      noRequests: 'Sin solicitudes',
      category: 'Categoría',
      resident: 'Residente',
      priority: 'Prioridad',
      emergency: 'Emergencia',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      reported: 'Reportado',
      location: 'Ubicación',
      description: 'Descripción',
      status: 'Estado',
      photos: 'Fotos',
      comments: 'Comentarios',
      addComment: 'Agregar comentario',
      writeComment: 'Escribe un comentario...',
      send: 'Enviar',
      changeStatus: 'Cambiar estado',
      close: 'Cerrar',
      total: 'Total',
      urgent: 'Urgente',
      searchPlaceholder: 'Buscar por título, descripción, categoría, residente o unidad...',
      allPriorities: 'Todas las Prioridades',
      allCategories: 'Todas las Categorías',
      issue: 'solicitud',
      issues: 'solicitudes',
      noIssues: 'Sin solicitudes',
      dragHere: 'Arrastra tarjetas aquí',
      noResults: 'No se encontraron resultados',
      noResultsDesc: 'No se encontraron solicitudes que coincidan con tu búsqueda',
      noResultsFilters: 'No se encontraron solicitudes con los filtros seleccionados',
      clearFilters: 'Limpiar filtros',
      categoryNames: {
        plumbing: 'Plomería',
        electrical: 'Eléctrico',
        hvac: 'A/C',
        appliance: 'Electrodoméstico',
        structural: 'Estructural',
        cleaning: 'Limpieza',
        security: 'Seguridad',
        elevator: 'Ascensor',
        parking: 'Estacionamiento',
        landscaping: 'Jardinería',
        noise: 'Ruido',
        pest_control: 'Plagas',
        general: 'General',
        handyman: 'Mantenimiento',
        washer_dryer_technician: 'Lavadora/Secadora',
      },
    },

    // Service Providers
    providers: {
      title: 'Proveedores de Servicio',
      pageDescription: 'Gestiona tu directorio de proveedores recomendados',
      addProvider: 'Agregar Proveedor',
      editProvider: 'Editar Proveedor',
      deleteProvider: 'Eliminar Proveedor',
      noProviders: 'No hay proveedores todavía',
      addFirst: 'Agrega tu primer proveedor recomendado',
      filterCategory: 'Filtrar por categoría',
      allCategories: 'Todas las categorías',
      name: 'Nombre',
      category: 'Categoría',
      phone: 'Teléfono',
      whatsapp: 'WhatsApp',
      email: 'Correo electrónico',
      description: 'Descripción',
      rating: 'Calificación',
      recommended: 'Recomendado',
      markRecommended: 'Marcar como recomendado',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      update: 'Actualizar',
      add: 'Agregar',
      saving: 'Guardando...',
      selectCategory: 'Selecciona una categoría',
      confirmDelete: '¿Estás seguro de eliminar este proveedor?',
      categories: {
        plumber: 'Plomero',
        electrician: 'Electricista',
        handyman: 'Mantenimiento General',
        ac_technician: 'Técnico A/C',
        washer_dryer_technician: 'Técnico Lavadora/Secadora',
        painter: 'Pintor',
        locksmith: 'Cerrajero',
        pest_control: 'Control de Plagas',
        cleaning: 'Limpieza',
        security: 'Seguridad',
        landscaping: 'Jardinería',
        elevator: 'Ascensor',
        pool_maintenance: 'Mantenimiento Piscina',
        other: 'Otros',
      },
    },

    // Building
    building: {
      title: 'Edificio',
      pageTitle: 'Información del Edificio',
      description: 'Gestiona las unidades de',
      manageUnits: 'Gestiona la información y configuración del edificio',
      buildingInfo: 'Información del Edificio',
      name: 'Nombre',
      buildingName: 'Nombre del edificio',
      address: 'Dirección',
      city: 'Ciudad',
      whatsapp: 'WhatsApp Business',
      whatsappBusiness: 'Número WhatsApp Business',
      notConfigured: 'No configurado',
      maintenanceModel: 'Modelo de mantenimiento',
      residentResponsible: 'Residente Responsable',
      adminResponsible: 'Admin Responsable',
      residentDesc: 'Admin recomienda proveedores, residente contrata directamente',
      adminDesc: 'Admin asigna proveedor y gestiona las reparaciones',
      maintenanceModelDesc: 'Define quién es responsable de las reparaciones en las unidades',
      selectModel: 'Selecciona modelo',
      edit: 'Editar',
      editBuilding: 'Editar Información del Edificio',
      save: 'Guardar cambios',
      cancel: 'Cancelar',
      saving: 'Guardando...',
      totalUnits: 'Total Unidades',
      floors: 'Pisos',
      floor: 'Piso',
      occupied: 'Ocupadas',
      units: 'unidades',
      unit: 'unidad',
      available: 'Disponible',
      addUnit: 'Agregar Unidad',
      createBulkUnits: 'Crear Unidades en Masa',
      deleteAllUnits: 'Eliminar Todas las Unidades',
      unitsByFloor: 'Unidades por Piso',
      unitNumber: 'Número de Unidad',
      unitNumberRequired: 'Número de unidad requerido',
      unitNumberHelp: 'Puede ser cualquier formato: 101, A-5, PH-1, etc.',
      unitCreated: 'Unidad creada exitosamente',
      unitsWithoutFloor: 'Unidades Sin Piso Asignado',
      noUnitsYet: 'No hay unidades creadas todavía',
      createUnitsNow: 'Crear Unidades Ahora',
      createUnitsAutomatically: 'Crea múltiples unidades automáticamente',
      numberOfFloors: 'Número de Pisos',
      unitsPerFloor: 'Unidades por Piso',
      startFloor: 'Piso Inicial',
      preview: 'Vista Previa:',
      willCreate: 'Se crearán',
      willBeCreated: 'unidades',
      example: 'Ejemplo:',
      create: 'Crear',
      creating: 'Creando...',
      confirmDeleteAll: '⚠️ ¿Estás seguro? Esto eliminará TODAS las unidades del edificio. Esta acción no se puede deshacer.',
      confirmDeleteAllSecond: '¿REALMENTE seguro? Se perderán todas las asociaciones con residentes.',
      unitsCreated: 'unidades creadas exitosamente!',
      duplicateError: 'Error: Algunas unidades ya existen. Usa "Eliminar Todas las Unidades" primero si quieres empezar de nuevo.',
      errorCreating: 'Error al crear unidades. Intenta nuevamente.',
      allUnitsDeleted: '✅ Todas las unidades han sido eliminadas',
      errorDeleting: 'Error al eliminar unidades. Intenta nuevamente.',
      buildingUpdated: '✅ Información del edificio actualizada',
      errorUpdating: 'Error al actualizar el edificio',
      nameAndAddressRequired: 'Nombre y dirección son requeridos',
      whatsappFormat: 'Formato: +1787XXXXXXX (incluye código de país)',
    },

    // Usage Stats
    usage: {
      planUsage: 'Uso del Plan',
      currentUsage: 'Tu consumo actual del plan',
      units: 'Unidades',
      limitReached: 'Límite alcanzado',
      nearLimit: 'Cerca del límite',
      unitsAvailable: 'unidades disponibles',
      noUnitsAvailable: 'No hay unidades disponibles',
      used: 'usado',
      limitReachedWarning: 'Has alcanzado el límite de {limit} unidades para el plan {plan}. Mejora tu plan para agregar más unidades.',
      nearLimitWarning: 'Estás cerca del límite de unidades. Quedan {remaining} unidades disponibles.',
      broadcastsThisMonth: 'Anuncios este mes',
      unlimited: 'Ilimitado',
      includedFeatures: 'Funciones incluidas:',
      whatsappMessaging: 'Mensajería WhatsApp',
      aiResponses: 'Respuestas AI',
      massBroadcasts: 'Anuncios masivos',
      advancedAnalytics: 'Análisis avanzado',
    },

    // Settings
    settings: {
      title: 'Configuración',
      description: 'Gestiona las preferencias de tu cuenta y del edificio',
      // Tabs
      generalTab: 'General',
      buildingTab: 'Edificio',
      billingTab: 'Facturación',
      // General
      language: 'Idioma',
      languageDesc: 'Selecciona el idioma preferido para la interfaz y las comunicaciones',
      interfaceLanguage: 'Idioma de la interfaz',
      languageNote: 'Este idioma se utilizará para la interfaz del administrador y las notificaciones automáticas',
      adminProfile: 'Perfil de Administrador',
      profileDesc: 'Información de tu cuenta de administrador',
      fullName: 'Nombre completo',
      fullNameNote: 'Este nombre se mostrará en la barra de navegación',
      email: 'Correo electrónico',
      emailNote: 'El correo electrónico no se puede cambiar',
      buildingInfo: 'Información del Edificio',
      buildingInfoDesc: 'Información básica del edificio (editar en Edificio)',
      buildingName: 'Nombre del edificio',
      address: 'Dirección',
      save: 'Guardar configuración',
      saving: 'Guardando...',
      // Toast messages
      changesSaved: 'Cambios guardados correctamente',
      subscriptionUpdated: 'Tu suscripción ha sido actualizada.',
      subscriptionActivated: '¡Suscripción activada!',
      welcomeMessage: 'Bienvenido a Blok. Tu pago se procesó correctamente.',
      paymentCanceled: 'Pago cancelado',
      paymentCanceledDesc: 'No se realizó ningún cargo. Puedes intentarlo nuevamente cuando quieras.',
      // Billing
      currentSubscription: 'Suscripción Actual',
      manageSubscription: 'Gestiona tu plan y método de pago',
      plan: 'Plan',
      active: 'Activo',
      pastDue: 'Pago Vencido',
      renewsOn: 'Se renueva el',
      cancelsOn: 'Se cancela el',
      perMonth: '/mes',
      pastDueWarning: 'Tu pago está vencido. Por favor actualiza tu método de pago para evitar la interrupción del servicio.',
      manageBilling: 'Gestionar Suscripción',
      loading: 'Cargando...',
      changePlan: 'Cambiar Plan',
      choosePlan: 'Elige tu Plan',
      currentPlan: 'Plan Actual',
      selectPlan: 'Seleccionar Plan',
      processing: 'Procesando...',
      upTo: 'Hasta',
      units: 'unidades',
      mostPopular: 'Más Popular',
    },

    // Residents
    residents: {
      title: 'Residentes',
      description: 'Gestiona los propietarios e inquilinos del edificio',
      manageInfo: 'Gestiona la información de tus residentes',
      addResident: 'Agregar Residente',
      editResident: 'Editar Residente',
      bulkImport: 'Importar en Masa',
      bulkEdit: 'Editar Seleccionados',
      owners: 'Propietarios',
      renters: 'Inquilinos',
      all: 'Todos',
      total: 'Total',
      activeWhatsApp: 'WhatsApp Activos',
      allResidents: 'Todos los Residentes',
      unit: 'Unidad',
      name: 'Nombre',
      firstName: 'Nombre',
      lastName: 'Apellido',
      type: 'Tipo',
      phone: 'Teléfono',
      email: 'Email',
      whatsapp: 'WhatsApp',
      actions: 'Acciones',
      owner: 'Propietario',
      renter: 'Inquilino',
      active: 'Activo',
      inactive: 'Inactivo',
      noResidents: 'No hay residentes registrados',
      preferredLanguage: 'Idioma Preferido',
      whatsappEnabled: 'WhatsApp habilitado',
      saveChanges: 'Guardar Cambios',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      confirmDelete: '¿Estás seguro de eliminar este residente?',
      confirmBulkDelete: '¿Estás seguro de eliminar los {count} residentes seleccionados?',
      errorSaving: 'Error al guardar residente',
      errorDeleting: 'Error al eliminar residente. Intenta nuevamente.',
      unassigned: 'Sin asignar',
      selected: 'seleccionados',
      selectAll: 'Seleccionar todos',
      deselectAll: 'Deseleccionar todos',

      // Bulk Import
      bulkImportTitle: 'Importar Residentes en Masa',
      uploadDescription: 'Sube un archivo Excel o CSV con la información de múltiples residentes',
      firstTime: '¿Primera vez?',
      downloadTemplateDesc: 'Descarga la plantilla para empezar',
      downloadTemplate: 'Descargar Plantilla',
      differentColumns: '¿Tu Excel tiene columnas diferentes?',
      noNeedChange: '<strong>No necesitas cambiar nada.</strong> El sistema reconoce automáticamente estos nombres de columnas:',
      unitApartment: 'Unidad/Apartamento',
      required: 'Requerido',
      recommended: 'Recomendado',
      requiredFieldsNote: '<strong>Requerido:</strong> Unidad, Nombre, Apellido. <strong>Recomendado:</strong> Email, Teléfono, Tipo. Puedes importar con datos incompletos y agregar el resto después manualmente.',
      dragFile: 'Arrastra tu archivo aquí o haz clic para seleccionar',
      supportedFormats: 'Soporta archivos CSV y Excel (.xlsx)',
      selectFile: 'Seleccionar Archivo',
      processing: 'Procesando archivo...',
      complete: 'Completos',
      errors: 'Errores',
      warnings: 'Advertencias',
      criticalErrors: '{count} errores críticos - deben corregirse',
      warningsCanImport: '{count} advertencias - puedes importar y completar después',
      andMore: '... y {count} más',
      importComplete: 'Importación completada',
      residentsImported: '{count} residentes importados',
      unitsCreated: '{count} unidades creadas',
      duplicatesSkipped: '{count} duplicados omitidos',
      failed: '{count} fallidos',
      importButton: 'Importar {count} Residentes',
      importing: 'Importando...',
      invalidFormat: 'Formato inválido',
      invalidFormatDesc: 'Por favor sube un archivo CSV o Excel (.xlsx)',
      errorReadingCSV: 'Error al leer CSV',
      errorReadingExcel: 'Error al leer Excel',
      errorProcessingFile: 'Error al procesar archivo',
      errorsFound: '{count} errores encontrados',
      fixErrors: 'Corrige los errores antes de importar',
      canCompleteLater: 'Puedes importar y completar la información después',
      readyToImport: '{count} residentes listos para importar',
      criticalErrorsData: 'Hay errores críticos en los datos',
      fixBeforeImport: 'Por favor corrige los errores antes de importar',
      errorImporting: 'Error al importar',
      unexpectedError: 'Ocurrió un error inesperado',
      templateDownloaded: 'Plantilla descargada',
      openAndAdd: 'Abre el archivo y agrega tus residentes',
      showing: 'Mostrando {shown} de {total} residentes',
      noEmail: 'Sin email',
      noPhone: 'Sin teléfono',
      defaultOwner: 'Por defecto: Dueño',
      row: 'Fila',

      // Bulk Edit
      bulkEditTitle: 'Editar Residentes en Masa',
      bulkEditDescription: 'Edita múltiples residentes seleccionados a la vez',
      selectedResidents: '{count} residentes seleccionados',
      changeType: 'Cambiar Tipo',
      changeUnit: 'Cambiar Unidad',
      changeLanguage: 'Cambiar Idioma',
      enableWhatsApp: 'Activar WhatsApp',
      disableWhatsApp: 'Desactivar WhatsApp',
      deleteSelected: 'Eliminar Seleccionados',
      noChange: 'Sin cambios',
      applyChanges: 'Aplicar Cambios',
      applying: 'Aplicando...',
      bulkEditSuccess: '{count} residentes actualizados',
      bulkEditError: 'Error al actualizar residentes',
      selectFirst: 'Selecciona al menos un residente',
    },

    // Conversations
    conversations: {
      title: 'Conversaciones',
      description: 'Todas las conversaciones con residentes',
      noConversations: 'No hay conversaciones',
      startConversation: 'Las conversaciones aparecerán aquí cuando los residentes escriban',
      selectConversation: 'Selecciona una conversación para ver los mensajes',
      writeMessage: 'Escribe un mensaje...',
      send: 'Enviar',
      active: 'Activa',
      lastMessage: 'Último mensaje',
      loadMore: 'Cargar mensajes anteriores',
      loading: 'Cargando...',
      noMessages: 'No hay mensajes todavía',
    },

    // Broadcasts
    broadcasts: {
      title: 'Anuncios',
      description: 'Envía mensajes masivos a residentes',
      create: 'Crear Anuncio',
      history: 'Historial',
      noHistory: 'No hay anuncios enviados',
      createFirst: 'Crea tu primer anuncio masivo',
    },

    // Knowledge Base
    knowledge: {
      title: 'Base de Conocimiento',
      description: 'Gestiona las preguntas frecuentes y respuestas automáticas',
      addEntry: 'Agregar Entrada',
      noEntries: 'No hay entradas todavía',
      question: 'Pregunta',
      answer: 'Respuesta',
      category: 'Categoría',
      active: 'Activa',
    },

    // Help & Support
    help: {
      title: 'Ayuda y Soporte',
      description: 'Encuentra respuestas a las preguntas más frecuentes',
      searchTitle: 'Buscar en la ayuda',
      searchDescription: 'Escribe tu pregunta o palabra clave',
      searchPlaceholder: '¿Qué necesitas saber?',
      categoriesTitle: 'Categorías',
      allCategories: 'Todas',
      faqTitle: 'Preguntas Frecuentes',
      totalQuestions: 'preguntas en total',
      questionsInCategory: 'preguntas en esta categoría',
      noResults: 'No se encontraron resultados',
      clearFilters: 'Limpiar filtros',

      categories: {
        gettingStarted: 'Primeros Pasos',
        residents: 'Residentes',
        conversations: 'Conversaciones',
        maintenance: 'Mantenimiento',
        broadcasts: 'Anuncios',
        ai: 'Inteligencia Artificial',
      },

      support: {
        title: '¿Necesitas más ayuda?',
        description: 'Nuestro equipo de soporte está aquí para ayudarte',
        hours: 'Lunes a Viernes, 9:00 AM - 6:00 PM',
      },

      faqs: {
        q1: {
          category: 'getting-started',
          question: '¿Cómo empiezo a usar Blok?',
          answer: `Para comenzar a usar Blok:

1. Agrega las unidades de tu edificio desde "Edificio"
2. Importa o agrega manualmente a tus residentes
3. Configura tu número de WhatsApp Business
4. ¡Listo! Los residentes pueden empezar a escribir

Tip: Puedes crear unidades en masa usando la función "Crear Unidades en Masa" para ahorrar tiempo.`,
        },
        q2: {
          category: 'getting-started',
          question: '¿Necesito conocimientos técnicos para usar Blok?',
          answer: `No, Blok está diseñado para ser muy fácil de usar. No necesitas conocimientos técnicos especiales.

Todo es visual y con botones simples. Si sabes usar WhatsApp, puedes usar Blok sin problemas.`,
        },
        q3: {
          category: 'residents',
          question: '¿Cómo agrego residentes?',
          answer: `Hay dos formas de agregar residentes:

1. MANUALMENTE: Ve a "Residentes" y haz clic en "Agregar Residente"
2. EN MASA: Usa la función "Importar" para subir una hoja de Excel con todos tus residentes

Asegúrate de incluir: nombre, teléfono, correo y unidad.`,
        },
        q4: {
          category: 'residents',
          question: '¿Cuál es la diferencia entre propietario e inquilino?',
          answer: `PROPIETARIO: Dueño de la unidad. Recibe información sobre pagos y decisiones importantes.

INQUILINO: Persona que renta. Solo recibe información sobre mantenimiento y reglas del edificio.

Esto es importante porque Blok envía mensajes diferentes según el tipo de residente.`,
        },
        q5: {
          category: 'residents',
          question: '¿Los residentes necesitan instalar algo?',
          answer: `¡NO! Los residentes solo necesitan WhatsApp, que probablemente ya tienen instalado.

No necesitan:
- Descargar ninguna app
- Crear ninguna cuenta
- Aprender algo nuevo

Simplemente escriben al número de WhatsApp de tu edificio como si fuera cualquier contacto.`,
        },
        q6: {
          category: 'conversations',
          question: '¿Cómo veo los mensajes de los residentes?',
          answer: `Ve a la sección "Conversaciones" en el menú.

Ahí verás:
- Todas las conversaciones activas
- El último mensaje de cada residente
- Cuándo fue el último mensaje

Haz clic en cualquier conversación para ver todos los mensajes y responder.`,
        },
        q7: {
          category: 'conversations',
          question: '¿Cómo respondo a un residente?',
          answer: `Es muy fácil:

1. Ve a "Conversaciones"
2. Haz clic en la conversación del residente
3. Escribe tu mensaje en la caja de abajo
4. Presiona el botón de enviar (o Enter)

Tu mensaje se enviará inmediatamente por WhatsApp al residente.`,
        },
        q8: {
          category: 'ai',
          question: '¿La IA responde automáticamente a los residentes?',
          answer: `Sí, la IA de Blok responde automáticamente a preguntas comunes como:
- Horarios de amenidades
- Información de pagos
- Reglas del edificio
- Preguntas frecuentes

PERO la IA es inteligente y sabe cuándo un humano debe responder. En esos casos, te notifica para que respondas tú.`,
        },
        q9: {
          category: 'ai',
          question: '¿Cómo sabe la IA qué responder?',
          answer: `La IA aprende de la Base de Conocimiento que tú configuras.

Puedes agregar información sobre:
- Horarios de piscina, gym, áreas comunes
- Reglas del edificio
- Días de recogido de basura
- Contactos importantes
- Y cualquier otra información frecuente

Entre más información agregues, mejores serán las respuestas automáticas.`,
        },
        q10: {
          category: 'ai',
          question: '¿Puedo revisar lo que la IA responde?',
          answer: `¡SÍ! Puedes ver todas las respuestas de la IA en "Conversaciones".

Los mensajes de la IA están marcados con un ícono especial de robot para que los identifiques fácilmente.

Si algo no está bien, puedes corregirlo o agregar más información a la Base de Conocimiento.`,
        },
        q11: {
          category: 'maintenance',
          question: '¿Cómo funcionan las solicitudes de mantenimiento?',
          answer: `Cuando un residente reporta un problema por WhatsApp, la IA:

1. Detecta automáticamente que es una solicitud de mantenimiento
2. Crea un ticket en el tablero de "Mantenimiento"
3. Clasifica la urgencia (baja, media, alta, emergencia)
4. Te notifica

Tú puedes entonces mover el ticket por las columnas: Abierta → En Progreso → Resuelta → Cerrada`,
        },
        q12: {
          category: 'maintenance',
          question: '¿Cómo organizo las solicitudes de mantenimiento?',
          answer: `Usa el tablero Kanban en "Mantenimiento":

ABIERTA: Solicitudes nuevas que debes revisar
EN PROGRESO: Estás trabajando en ellas
RESUELTA: Problema arreglado, esperando confirmación
CERRADA: Todo completado

Solo arrastra las tarjetas entre columnas. ¡Es muy visual y fácil!`,
        },
        q13: {
          category: 'maintenance',
          question: '¿Los residentes son notificados cuando resuelvo algo?',
          answer: `Sí, automáticamente.

Cuando mueves una solicitud a "Cerrada", el residente recibe un mensaje por WhatsApp confirmando que su problema fue resuelto.

No necesitas hacer nada extra, Blok lo hace por ti.`,
        },
        q14: {
          category: 'broadcasts',
          question: '¿Cómo envío un anuncio a todos los residentes?',
          answer: `Ve a "Anuncios" y:

1. Haz clic en "Crear Anuncio"
2. Escribe tu mensaje
3. Selecciona a quién enviarlo:
   - Todos los residentes
   - Solo propietarios
   - Solo inquilinos
4. Haz clic en "Enviar"

¡Todos recibirán el mensaje por WhatsApp al mismo tiempo!`,
        },
        q15: {
          category: 'broadcasts',
          question: '¿Cuántos mensajes puedo enviar a la vez?',
          answer: `Puedes enviar a TODOS tus residentes de una sola vez.

Blok maneja el envío automáticamente, respetando los límites de WhatsApp para evitar problemas.

No importa si tienes 20 o 200 residentes, Blok se encarga de todo.`,
        },
        q16: {
          category: 'broadcasts',
          question: '¿Puedo enviar anuncios solo a algunos residentes?',
          answer: `Sí, puedes seleccionar:
- TODOS los residentes
- Solo PROPIETARIOS
- Solo INQUILINOS

Por ejemplo, si es información sobre cuotas de mantenimiento, envíalo solo a propietarios.

Si es sobre reglas del edificio, envíalo a todos.`,
        },
      },
    },

    // Common
    common: {
      search: 'Buscar',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      actions: 'Acciones',
      details: 'Detalles',
      view: 'Ver',
      download: 'Descargar',
      upload: 'Subir',
      filter: 'Filtrar',
      sort: 'Ordenar',
      refresh: 'Actualizar',
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
    },

    // Status messages
    messages: {
      saved: 'Guardado correctamente',
      deleted: 'Eliminado correctamente',
      error: 'Ocurrió un error',
      loading: 'Cargando...',
      noData: 'No hay datos',
      confirmDelete: '¿Estás seguro de que deseas eliminar esto?',
    },

    // Languages
    languages: {
      es: 'Español',
      en: 'English',
    },

    // Landing Page
    paperFlyerPain: {
      headline: '¿Aún Imprimiendo Avisos?',
      subheadline: 'Hay Una Mejor Manera',
      description: 'Deje de imprimir. Deje de pegar papel en el elevador. Deje de perder tiempo. Blok lleva sus anuncios a cada residente en segundos.',
    },

    hero: {
      eyebrow: 'Comunicación Profesional para Tu Condominio',
      headline: 'Respuestas Instantáneas 24/7. Administración Organizada. Residentes Satisfechos.',
      subheadline: 'Inteligencia Artificial (IA) que atiende residentes automáticamente, mientras tu equipo se enfoca en lo importante. Mejora el servicio, reduce costos operativos.',
      audience: 'Para Administradores, Juntas y Property Managers de Condominios en Puerto Rico',
      cta: 'Comenzar Gratis',
      waitlist: 'Reserva tu Acceso',
      waitlistSubtext: 'Acceso Anticipado',
      talkToFounder: 'Hablar con Jan (Fundador)',
      login: 'Iniciar Sesión',
      socialProof: 'Confiado por más de {count} condominios en Puerto Rico',
      comingSoon: 'Próximamente disponible',
    },

    problem: {
      headline: 'Los Administradores Pierden Tiempo en Mensajes Repetitivos',
      problems: {
        fragmented: {
          title: 'Comunicación Fragmentada',
          description: 'Mensajes perdidos entre WhatsApp, email y llamadas sin registro centralizado',
        },
        announcements: {
          title: 'Anuncios Ineficientes',
          description: 'Mensajes uno por uno a cada residente tomando horas de trabajo manual',
        },
        maintenance: {
          title: 'Solicitudes Desorganizadas',
          description: 'Reportes de mantenimiento perdidos o sin seguimiento adecuado',
        },
      },
    },

    solution: {
      headline: 'Blok Automatiza Todo',
      subheadline: 'Los residentes escriben por WhatsApp como siempre. Blok responde automáticamente.',
      steps: {
        step1: {
          title: 'Residente Escribe',
          subtitle: 'Mensaje enviado por WhatsApp al número del condominio',
          example: '"La planta eléctrica no prendió"',
        },
        step2: {
          title: 'Sistema Analiza',
          subtitle: 'Detecta intención, urgencia y categoría automáticamente',
          example: 'priority: emergency',
        },
        step3: {
          title: 'Acción Inmediata',
          subtitle: 'Crea ticket, responde al residente y notifica al admin',
          example: 'Ticket #123 creado',
        },
      },
    },

    dashboardPreview: {
      headline: 'Dashboard Moderno y Centralizado',
      subheadline: 'Gestiona todas las comunicaciones, solicitudes de mantenimiento y anuncios desde un solo lugar.',
      cta: 'Ver Demo',
    },

    features: {
      headline: 'Recupera Tu Dinero. Recupera Tu Tiempo.',
      list: {
        payments: {
          title: 'Deja de Perder $15K al Año (Ejemplo)',
          description: 'Rastrea cuotas pendientes. Recordatorios automáticos por WhatsApp. Cobra lo que te deben.',
        },
        aiResponses: {
          title: 'Deja de Contestar a las 11pm',
          description: 'La IA responde "¿A qué hora cierra la piscina?" mientras duermes. Sin WhatsApp personal.',
        },
        smartRouting: {
          title: 'Nada Se Pierde en el Chat',
          description: 'Solicitudes importantes nunca se pierden entre 200 mensajes. Todo organizado automáticamente.',
        },
        autoTickets: {
          title: 'Seguimiento Automático',
          description: 'Crea boletos de mantenimiento y recomienda proveedores dependiendo de la necesidad. Da seguimiento hasta resolver cada solicitud.',
        },
        broadcasts: {
          title: 'Anuncios en 10 Segundos',
          description: 'Ya no más copiar-pegar a 100 personas. Un clic. Listo.',
        },
        realtime: {
          title: 'Ve Todo de un Vistazo',
          description: 'Quién escribió, qué necesita, qué está pendiente. Todo en una pantalla.',
        },
      },
    },

    showcase: {
      headline: 'Cómo Funciona Blok en Tu Condominio',
      subheadline: 'Una plataforma que beneficia a todos: junta, administrador y residentes',
      items: {
        dashboard: {
          title: 'Control Total en Tiempo Real',
          description: 'La junta ve métricas clave. El administrador gestiona todo desde una pantalla. Reportes instantáneos.',
        },
        conversations: {
          title: 'Servicio Profesional 24/7',
          description: 'Residentes reciben respuestas inmediatas. Administrador trabaja desde el sistema. Todo queda documentado.',
        },
        maintenance: {
          title: 'Solicitudes Que No Se Pierden',
          description: 'Residentes reportan problemas fácilmente. Administrador rastrea todo. Junta ve progreso en tiempo real.',
        },
      },
    },

    comparison: {
      headline: 'Antes vs. Ahora',
      subheadline: 'Vea la Diferencia Real',
      before: {
        title: 'ANTES: Método Tradicional',
        steps: [
          'Imprimir 100 avisos: $50',
          'Pegar en lobby y elevadores: 30 minutos',
          'Residentes no ven el aviso: 50%',
          'Llamadas preguntando lo mismo: 1 hora',
        ],
        total: 'Total: $50 + 1.5 horas + Frustración',
      },
      after: {
        title: 'CON BLOK: Comunicación Moderna',
        steps: [
          'Escribir mensaje: 2 minutos',
          'Enviar a todos: 10 segundos',
          'Confirmación instantánea: 100%',
          'Llamadas de seguimiento: 0',
        ],
        total: 'Total: $0 + 2 minutos + Tranquilidad',
      },
    },

    ai: {
      headline: 'Usted Siempre Tiene Control.',
      headlineAccent: 'La IA Sólo Ayuda.',
      control: {
        title: 'Control Total en Sus Manos',
        description: 'Apague la IA cuando quiera. Responda manualmente cualquier mensaje. Revise cada conversación. Usted decide.',
        features: [
          'Desactive la IA con un clic',
          'Responda manualmente cuando prefiera',
          'Revise todas las conversaciones',
          'Configure qué preguntas responde la IA',
        ],
      },
      capabilities: {
        intent: {
          title: 'Entiende Sin Que Le Expliques',
          description: 'Identifica automáticamente si es pregunta simple, emergencia real o solicitud de mantenimiento. Sin configuración.',
        },
        priority: {
          title: 'Sabe Qué Es Urgente De Verdad',
          description: 'No más interrupciones por preguntas simples. La IA detecta emergencias reales y te alerta inmediatamente.',
        },
        knowledge: {
          title: 'Aprende de Tu Condominio',
          description: 'Sube el reglamento y FAQs una vez. La IA responde con tu información exacta, sin inventar.',
        },
      },
      demo: {
        title: 'Ver en Acción',
        subtitle: 'Ejemplo de conversación real con IA',
        input: 'Mensaje del Residente',
        output: 'Análisis de IA',
        exampleMessage: 'El elevador del edificio no funciona desde esta mañana. Estoy en el piso 8 y necesito bajar urgente.',
        exampleIntent: 'maintenance_request',
        exampleCategory: 'elevator',
        examplePriority: 'emergency',
        exampleAction: 'create_ticket',
      },
    },

    pricing: {
      headline: 'Precio Simple y Transparente',
      subheadline: 'Sin costos ocultos. Cancela cuando quieras.',
      features: {
        title: 'Todo Plan Incluye',
        list: [
          'WhatsApp Business ilimitado',
          'Respuestas automáticas con IA',
          'Dashboard centralizado',
          'Anuncios masivos',
          'Soporte por email',
          'Actualizaciones gratuitas',
        ],
      },
      plans: {
        basic: {
          name: 'Starter',
          units: 'Hasta 50 unidades',
          ideal: 'Ideal para edificios pequeños',
        },
        premium: {
          name: 'Professional',
          units: 'Hasta 150 unidades',
          ideal: 'Ideal para condominios medianos',
          badge: 'Más Popular',
        },
        enterprise: {
          name: 'Enterprise',
          units: 'Unidades ilimitadas',
          ideal: 'Ideal para edificios grandes',
        },
      },
      cta: 'Empezar Ahora',
      contact: 'Contactar Ventas',
    },

    why: {
      headline: 'Diseñado para Puerto Rico',
      features: {
        whatsapp: {
          title: 'WhatsApp es Cultura',
          description: 'En PR, WhatsApp no es opcional—es esencial. Blok se integra donde ya están tus residentes',
        },
        language: {
          title: 'Español Primero',
          description: 'IA entrenada en español puertorriqueño con contexto local',
        },
        local: {
          title: 'Soporte Local',
          description: 'Equipo que entiende el mercado y las necesidades de condominios en PR',
        },
      },
    },

    stats: {
      responseTime: {
        value: '< 3 seg',
        label: 'Tiempo de Respuesta',
      },
      timeSaved: {
        value: '80%',
        label: 'Reducción de Tiempo',
      },
      accuracy: {
        value: '95%',
        label: 'Precisión de IA',
      },
      adoption: {
        value: '100%',
        label: 'Adopción Residentes',
      },
    },

    faq: {
      headline: 'Preguntas Frecuentes',
      questions: {
        q1: '¿Cómo funciona el sistema automático?',
        a1: 'Blok analiza mensajes automáticamente, detecta la intención y genera respuestas en español basadas en tu base de conocimiento. El sistema aprende de las respuestas anteriores.',
        q2: '¿Qué pasa si el sistema no sabe responder?',
        a2: 'Si el sistema detecta una consulta compleja o emergencia, escala automáticamente al administrador para respuesta manual.',
        q3: '¿Necesito un número de WhatsApp Business?',
        a3: 'Sí, te ayudamos a configurar un número de WhatsApp Business para tu condominio. Es requerido por WhatsApp para uso comercial.',
        q4: '¿Cuánto tiempo toma implementar?',
        a4: 'La configuración inicial toma 1-2 horas. Incluye conectar WhatsApp, cargar residentes y entrenar la IA con info básica.',
        q5: '¿Puedo cancelar en cualquier momento?',
        a5: 'Sí, sin penalidad. Cancelas cuando quieras y mantienes acceso hasta fin del período pagado.',
      },
    },

    cta: {
      headline: 'Empieza a Automatizar Hoy',
      subheadline: 'Únete a los condominios que ya usan IA para gestionar comunicaciones',
      button: 'Crear Cuenta Gratis',
      demo: 'Ver Demo',
    },

    finalCta: {
      headline: 'Moderniza la Comunicación de Tu Condominio',
      subheadline: 'Únete a las juntas que ya mejoraron su servicio con IA. Prueba gratis 30 días, sin compromiso.',
      cta: 'Prueba Gratis 30 Días',
      waitlist: 'Únete a la Lista de Espera',
      trial: 'Sin tarjeta de crédito • Configuración en 15 min • Cancela cuando quieras',
    },

    about: {
      headline: 'Conoce al Fundador',
      subheadline: 'Ingeniero de Microsoft construyendo soluciones para Puerto Rico fuera del horario laboral',
      founder: {
        name: 'Jan Faris',
        title: 'Fundador & CEO',
        experience: 'Ingeniero de Software @ Microsoft',
        storyTitle: 'Un Proyecto Personal con Impacto Real',
        story: 'Trabajo como ingeniero de software en Microsoft, pero fuera de mi horario laboral, dedico mi tiempo a resolver problemas reales de Puerto Rico. Viviendo en condominios en San Juan y hablando con amigos en otros edificios, he visto la misma frustración: mensajes perdidos, preguntas repetitivas sin respuesta, confusión constante. Blok es mi proyecto personal para cambiar eso.',
        locationTitle: 'Por Qué Construí Esto',
        location: 'Soy egresado de UPR Mayagüez y entiendo cómo nos comunicamos en Puerto Rico. Blok no es una solución importada—está diseñada específicamente para nuestra realidad puertorriqueña. Es mi manera de contribuir al ecosistema tecnológico de Puerto Rico.',
        mission: 'Mi misión: demostrar que desde Puerto Rico podemos construir tecnología de clase mundial. Blok es mi pasión fuera del trabajo.',
      },
      company: {
        founded: 'Fundado',
        based: 'San Juan, PR',
        technology: 'Inteligencia Artificial',
      },
    },

    footer: {
      description: 'Plataforma de comunicación con IA para condominios en Puerto Rico',
      product: 'Producto',
      company: 'Compañía',
      legal: 'Legal',
      links: {
        features: 'Características',
        pricing: 'Precios',
        docs: 'Documentación',
        about: 'Nosotros',
        blog: 'Blog',
        contact: 'Contacto',
        privacy: 'Privacidad',
        terms: 'Términos',
      },
      contact: {
        title: 'Contacto',
        address: 'Dirección:',
        website: 'Sitio Web:',
      },
      about: {
        title: 'Sobre Nosotros',
        founder: 'Fundador:',
        description: 'Blok es una plataforma de IA diseñada específicamente para condominios en Puerto Rico, fundada para modernizar la comunicación y gestión de comunidades.',
      },
      rights: 'Todos los derechos reservados',
    },
  },

  en: {
    // Navigation
    nav: {
      dashboard: 'Overview',
      conversations: 'Conversations',
      maintenance: 'Maintenance',
      providers: 'Providers',
      broadcasts: 'Broadcasts',
      residents: 'Residents',
      building: 'Building',
      knowledge: 'Knowledge Base',
      settings: 'Settings',
      help: 'Help',
      logout: 'Logout',
      administration: 'Administration',
      administrator: 'Administrator',
      general: 'GENERAL',
      tools: 'TOOLS',
      support: 'SUPPORT',
      expand: 'Expand',
      collapse: 'Collapse',
      // Landing page
      features: 'Features',
      pricing: 'Pricing',
      feedback: 'Feedback',
      login: 'Log in',
      signup: 'Get started',
      waitlist: 'Waitlist',
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      summary: 'Overview of',
      aiSummary: 'Intelligent Summary',
      activeConversations: 'Active Conversations',
      totalResidents: 'Total Residents',
      openRequests: 'Open Requests',
      inProgress: 'In Progress',
      total: 'total',
      maintenanceTasks: 'Maintenance tasks',
      recentConversations: 'Recent Conversations',
      maintenanceRequests: 'Maintenance Requests',
      noConversations: 'No conversations yet',
      noRequests: 'No requests yet',
      active: 'Active',
      closed: 'Closed',
      ownersAndRenters: 'Owners & renters',
    },

    // Maintenance
    maintenance: {
      title: 'Maintenance',
      pageDescription: 'Manage building maintenance requests',
      referredToProvider: 'Referred to Provider',
      referred: 'Referred',
      open: 'Open',
      opened: 'Open',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      resolved_single: 'Resolved',
      closed: 'Closed',
      closed_single: 'Closed',
      noRequests: 'No requests',
      category: 'Category',
      resident: 'Resident',
      priority: 'Priority',
      emergency: 'Emergency',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      reported: 'Reported',
      location: 'Location',
      description: 'Description',
      status: 'Status',
      photos: 'Photos',
      comments: 'Comments',
      addComment: 'Add comment',
      writeComment: 'Write a comment...',
      send: 'Send',
      changeStatus: 'Change status',
      close: 'Close',
      total: 'Total',
      urgent: 'Urgent',
      searchPlaceholder: 'Search by title, description, category, resident or unit...',
      allPriorities: 'All Priorities',
      allCategories: 'All Categories',
      issue: 'issue',
      issues: 'issues',
      noIssues: 'No issues',
      dragHere: 'Drag cards here',
      noResults: 'No results found',
      noResultsDesc: 'No requests match your search',
      noResultsFilters: 'No requests found with the selected filters',
      clearFilters: 'Clear filters',
      categoryNames: {
        plumbing: 'Plumbing',
        electrical: 'Electrical',
        hvac: 'HVAC',
        appliance: 'Appliance',
        structural: 'Structural',
        cleaning: 'Cleaning',
        security: 'Security',
        elevator: 'Elevator',
        parking: 'Parking',
        landscaping: 'Landscaping',
        noise: 'Noise',
        pest_control: 'Pest Control',
        general: 'General',
        handyman: 'Handyman',
        washer_dryer_technician: 'Washer/Dryer',
      },
    },

    // Service Providers
    providers: {
      title: 'Service Providers',
      pageDescription: 'Manage your recommended service providers directory',
      addProvider: 'Add Provider',
      editProvider: 'Edit Provider',
      deleteProvider: 'Delete Provider',
      noProviders: 'No providers yet',
      addFirst: 'Add your first recommended provider',
      filterCategory: 'Filter by category',
      allCategories: 'All categories',
      name: 'Name',
      category: 'Category',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      email: 'Email',
      description: 'Description',
      rating: 'Rating',
      recommended: 'Recommended',
      markRecommended: 'Mark as recommended',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      update: 'Update',
      add: 'Add',
      saving: 'Saving...',
      selectCategory: 'Select a category',
      confirmDelete: 'Are you sure you want to delete this provider?',
      categories: {
        plumber: 'Plumber',
        electrician: 'Electrician',
        handyman: 'Handyman',
        ac_technician: 'A/C Technician',
        washer_dryer_technician: 'Washer/Dryer Technician',
        painter: 'Painter',
        locksmith: 'Locksmith',
        pest_control: 'Pest Control',
        cleaning: 'Cleaning',
        security: 'Security',
        landscaping: 'Landscaping',
        elevator: 'Elevator',
        pool_maintenance: 'Pool Maintenance',
        other: 'Other',
      },
    },

    // Building
    building: {
      title: 'Building',
      pageTitle: 'Building Information',
      description: 'Manage units of',
      manageUnits: 'Manage building information and settings',
      buildingInfo: 'Building Information',
      name: 'Name',
      buildingName: 'Building name',
      address: 'Address',
      city: 'City',
      whatsapp: 'WhatsApp Business',
      whatsappBusiness: 'WhatsApp Business Number',
      notConfigured: 'Not configured',
      maintenanceModel: 'Maintenance model',
      residentResponsible: 'Resident Responsible',
      adminResponsible: 'Admin Responsible',
      residentDesc: 'Admin recommends providers, resident hires directly',
      adminDesc: 'Admin assigns provider and manages repairs',
      maintenanceModelDesc: 'Define who is responsible for unit repairs',
      selectModel: 'Select model',
      edit: 'Edit',
      editBuilding: 'Edit Building Information',
      save: 'Save changes',
      cancel: 'Cancel',
      saving: 'Saving...',
      totalUnits: 'Total Units',
      floors: 'Floors',
      floor: 'Floor',
      occupied: 'Occupied',
      units: 'units',
      unit: 'unit',
      available: 'Available',
      addUnit: 'Add Unit',
      createBulkUnits: 'Bulk Create Units',
      deleteAllUnits: 'Delete All Units',
      unitsByFloor: 'Units by Floor',
      unitNumber: 'Unit Number',
      unitNumberRequired: 'Unit number required',
      unitNumberHelp: 'Can be any format: 101, A-5, PH-1, etc.',
      unitCreated: 'Unit created successfully',
      unitsWithoutFloor: 'Units Without Assigned Floor',
      noUnitsYet: 'No units created yet',
      createUnitsNow: 'Create Units Now',
      createUnitsAutomatically: 'Create multiple units automatically',
      numberOfFloors: 'Number of Floors',
      unitsPerFloor: 'Units per Floor',
      startFloor: 'Start Floor',
      preview: 'Preview:',
      willCreate: 'Will create',
      willBeCreated: 'units',
      example: 'Example:',
      create: 'Create',
      creating: 'Creating...',
      confirmDeleteAll: '⚠️ Are you sure? This will delete ALL units in the building. This action cannot be undone.',
      confirmDeleteAllSecond: 'REALLY sure? All resident associations will be lost.',
      unitsCreated: 'units created successfully!',
      duplicateError: 'Error: Some units already exist. Use "Delete All Units" first if you want to start over.',
      errorCreating: 'Error creating units. Please try again.',
      allUnitsDeleted: '✅ All units have been deleted',
      errorDeleting: 'Error deleting units. Please try again.',
      buildingUpdated: '✅ Building information updated',
      errorUpdating: 'Error updating building',
      nameAndAddressRequired: 'Name and address are required',
      whatsappFormat: 'Format: +1787XXXXXXX (include country code)',
    },

    // Usage Stats
    usage: {
      planUsage: 'Plan Usage',
      currentUsage: 'Your current usage for the',
      units: 'Units',
      limitReached: 'Limit reached',
      nearLimit: 'Near limit',
      unitsAvailable: 'units available',
      noUnitsAvailable: 'No units available',
      used: 'used',
      limitReachedWarning: 'You\'ve reached the limit of {limit} units for the {plan} plan. Upgrade your plan to add more units.',
      nearLimitWarning: 'You\'re near the unit limit. {remaining} units remaining.',
      broadcastsThisMonth: 'Broadcasts this month',
      unlimited: 'Unlimited',
      includedFeatures: 'Included features:',
      whatsappMessaging: 'WhatsApp Messaging',
      aiResponses: 'AI Responses',
      massBroadcasts: 'Mass Broadcasts',
      advancedAnalytics: 'Advanced Analytics',
    },

    // Settings
    settings: {
      title: 'Settings',
      description: 'Manage your account and building preferences',
      // Tabs
      generalTab: 'General',
      buildingTab: 'Building',
      billingTab: 'Billing',
      // General
      language: 'Language',
      languageDesc: 'Select your preferred language for the interface and communications',
      interfaceLanguage: 'Interface language',
      languageNote: 'This language will be used for the admin interface and automated notifications',
      adminProfile: 'Admin Profile',
      profileDesc: 'Your administrator account information',
      fullName: 'Full name',
      fullNameNote: 'This name will be displayed in the navigation bar',
      email: 'Email',
      emailNote: 'Email cannot be changed',
      buildingInfo: 'Building Information',
      buildingInfoDesc: 'Basic building information (edit in Building)',
      buildingName: 'Building name',
      address: 'Address',
      save: 'Save settings',
      saving: 'Saving...',
      // Toast messages
      changesSaved: 'Changes saved successfully',
      subscriptionUpdated: 'Your subscription has been updated.',
      subscriptionActivated: 'Subscription activated!',
      welcomeMessage: 'Welcome to Blok. Your payment was processed successfully.',
      paymentCanceled: 'Payment canceled',
      paymentCanceledDesc: 'No charge was made. You can try again whenever you want.',
      // Billing
      currentSubscription: 'Current Subscription',
      manageSubscription: 'Manage your plan and payment method',
      plan: 'Plan',
      active: 'Active',
      pastDue: 'Past Due',
      renewsOn: 'Renews on',
      cancelsOn: 'Cancels on',
      perMonth: '/month',
      pastDueWarning: 'Your payment is past due. Please update your payment method to avoid service interruption.',
      manageBilling: 'Manage Subscription',
      loading: 'Loading...',
      changePlan: 'Change Plan',
      choosePlan: 'Choose Your Plan',
      currentPlan: 'Current Plan',
      selectPlan: 'Select Plan',
      processing: 'Processing...',
      upTo: 'Up to',
      units: 'units',
      mostPopular: 'Most Popular',
    },

    // Residents
    residents: {
      title: 'Residents',
      description: 'Manage building owners and renters',
      manageInfo: 'Manage your residents information',
      addResident: 'Add Resident',
      editResident: 'Edit Resident',
      bulkImport: 'Bulk Import',
      bulkEdit: 'Edit Selected',
      owners: 'Owners',
      renters: 'Renters',
      all: 'All',
      total: 'Total',
      activeWhatsApp: 'Active WhatsApp',
      allResidents: 'All Residents',
      unit: 'Unit',
      name: 'Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      type: 'Type',
      phone: 'Phone',
      email: 'Email',
      whatsapp: 'WhatsApp',
      actions: 'Actions',
      owner: 'Owner',
      renter: 'Renter',
      active: 'Active',
      inactive: 'Inactive',
      noResidents: 'No residents registered',
      preferredLanguage: 'Preferred Language',
      whatsappEnabled: 'WhatsApp enabled',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this resident?',
      confirmBulkDelete: 'Are you sure you want to delete the {count} selected residents?',
      errorSaving: 'Error saving resident',
      errorDeleting: 'Error deleting resident. Please try again.',
      unassigned: 'Unassigned',
      selected: 'selected',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',

      // Bulk Import
      bulkImportTitle: 'Bulk Import Residents',
      uploadDescription: 'Upload an Excel or CSV file with information for multiple residents',
      firstTime: 'First time?',
      downloadTemplateDesc: 'Download the template to get started',
      downloadTemplate: 'Download Template',
      differentColumns: 'Does your Excel have different columns?',
      noNeedChange: '<strong>No need to change anything.</strong> The system automatically recognizes these column names:',
      unitApartment: 'Unit/Apartment',
      required: 'Required',
      recommended: 'Recommended',
      requiredFieldsNote: '<strong>Required:</strong> Unit, First Name, Last Name. <strong>Recommended:</strong> Email, Phone, Type. You can import with incomplete data and add the rest manually later.',
      dragFile: 'Drag your file here or click to select',
      supportedFormats: 'Supports CSV and Excel (.xlsx) files',
      selectFile: 'Select File',
      processing: 'Processing file...',
      complete: 'Complete',
      errors: 'Errors',
      warnings: 'Warnings',
      criticalErrors: '{count} critical errors - must be fixed',
      warningsCanImport: '{count} warnings - you can import and complete later',
      andMore: '... and {count} more',
      importComplete: 'Import completed',
      residentsImported: '{count} residents imported',
      unitsCreated: '{count} units created',
      duplicatesSkipped: '{count} duplicates skipped',
      failed: '{count} failed',
      importButton: 'Import {count} Residents',
      importing: 'Importing...',
      invalidFormat: 'Invalid format',
      invalidFormatDesc: 'Please upload a CSV or Excel (.xlsx) file',
      errorReadingCSV: 'Error reading CSV',
      errorReadingExcel: 'Error reading Excel',
      errorProcessingFile: 'Error processing file',
      errorsFound: '{count} errors found',
      fixErrors: 'Fix errors before importing',
      canCompleteLater: 'You can import and complete the information later',
      readyToImport: '{count} residents ready to import',
      criticalErrorsData: 'There are critical errors in the data',
      fixBeforeImport: 'Please fix errors before importing',
      errorImporting: 'Error importing',
      unexpectedError: 'An unexpected error occurred',
      templateDownloaded: 'Template downloaded',
      openAndAdd: 'Open the file and add your residents',
      showing: 'Showing {shown} of {total} residents',
      noEmail: 'No email',
      noPhone: 'No phone',
      defaultOwner: 'Default: Owner',
      row: 'Row',

      // Bulk Edit
      bulkEditTitle: 'Bulk Edit Residents',
      bulkEditDescription: 'Edit multiple selected residents at once',
      selectedResidents: '{count} residents selected',
      changeType: 'Change Type',
      changeUnit: 'Change Unit',
      changeLanguage: 'Change Language',
      enableWhatsApp: 'Enable WhatsApp',
      disableWhatsApp: 'Disable WhatsApp',
      deleteSelected: 'Delete Selected',
      noChange: 'No change',
      applyChanges: 'Apply Changes',
      applying: 'Applying...',
      bulkEditSuccess: '{count} residents updated',
      bulkEditError: 'Error updating residents',
      selectFirst: 'Select at least one resident',
    },

    // Conversations
    conversations: {
      title: 'Conversations',
      description: 'All conversations with residents',
      noConversations: 'No conversations',
      startConversation: 'Conversations will appear here when residents message',
      selectConversation: 'Select a conversation to view messages',
      writeMessage: 'Write a message...',
      send: 'Send',
      active: 'Active',
      lastMessage: 'Last message',
      loadMore: 'Load previous messages',
      loading: 'Loading...',
      noMessages: 'No messages yet',
    },

    // Broadcasts
    broadcasts: {
      title: 'Broadcasts',
      description: 'Send mass messages to residents',
      create: 'Create Broadcast',
      history: 'History',
      noHistory: 'No broadcasts sent',
      createFirst: 'Create your first broadcast',
    },

    // Knowledge Base
    knowledge: {
      title: 'Knowledge Base',
      description: 'Manage FAQs and automated responses',
      addEntry: 'Add Entry',
      noEntries: 'No entries yet',
      question: 'Question',
      answer: 'Answer',
      category: 'Category',
      active: 'Active',
    },

    // Help & Support
    help: {
      title: 'Help & Support',
      description: 'Find answers to the most frequently asked questions',
      searchTitle: 'Search help',
      searchDescription: 'Type your question or keyword',
      searchPlaceholder: 'What do you need to know?',
      categoriesTitle: 'Categories',
      allCategories: 'All',
      faqTitle: 'Frequently Asked Questions',
      totalQuestions: 'questions total',
      questionsInCategory: 'questions in this category',
      noResults: 'No results found',
      clearFilters: 'Clear filters',

      categories: {
        gettingStarted: 'Getting Started',
        residents: 'Residents',
        conversations: 'Conversations',
        maintenance: 'Maintenance',
        broadcasts: 'Broadcasts',
        ai: 'Artificial Intelligence',
      },

      support: {
        title: 'Need more help?',
        description: 'Our support team is here to help you',
        hours: 'Monday to Friday, 9:00 AM - 6:00 PM',
      },

      faqs: {
        q1: {
          category: 'getting-started',
          question: 'How do I start using Blok?',
          answer: `To start using Blok:

1. Add your building units from "Building"
2. Import or manually add your residents
3. Configure your WhatsApp Business number
4. Ready! Residents can start messaging

Tip: You can bulk create units using "Bulk Create Units" to save time.`,
        },
        q2: {
          category: 'getting-started',
          question: 'Do I need technical knowledge to use Blok?',
          answer: `No, Blok is designed to be very easy to use. You don't need any special technical knowledge.

Everything is visual with simple buttons. If you know how to use WhatsApp, you can use Blok without problems.`,
        },
        q3: {
          category: 'residents',
          question: 'How do I add residents?',
          answer: `There are two ways to add residents:

1. MANUALLY: Go to "Residents" and click "Add Resident"
2. IN BULK: Use the "Import" function to upload an Excel sheet with all your residents

Make sure to include: name, phone, email, and unit.`,
        },
        q4: {
          category: 'residents',
          question: 'What\'s the difference between owner and renter?',
          answer: `OWNER: Unit owner. Receives information about payments and important decisions.

RENTER: Person who rents. Only receives information about maintenance and building rules.

This is important because Blok sends different messages depending on the resident type.`,
        },
        q5: {
          category: 'residents',
          question: 'Do residents need to install anything?',
          answer: `NO! Residents only need WhatsApp, which they probably already have installed.

They don't need to:
- Download any app
- Create any account
- Learn anything new

They simply message your building's WhatsApp number like any other contact.`,
        },
        q6: {
          category: 'conversations',
          question: 'How do I see resident messages?',
          answer: `Go to the "Conversations" section in the menu.

There you'll see:
- All active conversations
- The last message from each resident
- When the last message was sent

Click on any conversation to see all messages and respond.`,
        },
        q7: {
          category: 'conversations',
          question: 'How do I respond to a resident?',
          answer: `It's very easy:

1. Go to "Conversations"
2. Click on the resident's conversation
3. Type your message in the box below
4. Press the send button (or Enter)

Your message will be sent immediately via WhatsApp to the resident.`,
        },
        q8: {
          category: 'ai',
          question: 'Does the AI automatically respond to residents?',
          answer: `Yes, Blok's AI automatically responds to common questions like:
- Amenity schedules
- Payment information
- Building rules
- Frequently asked questions

BUT the AI is smart and knows when a human should respond. In those cases, it notifies you so you can respond.`,
        },
        q9: {
          category: 'ai',
          question: 'How does the AI know what to respond?',
          answer: `The AI learns from the Knowledge Base that you configure.

You can add information about:
- Pool, gym, common area schedules
- Building rules
- Trash collection days
- Important contacts
- And any other frequent information

The more information you add, the better the automatic responses will be.`,
        },
        q10: {
          category: 'ai',
          question: 'Can I review what the AI responds?',
          answer: `YES! You can see all AI responses in "Conversations".

AI messages are marked with a special robot icon so you can easily identify them.

If something isn't right, you can correct it or add more information to the Knowledge Base.`,
        },
        q11: {
          category: 'maintenance',
          question: 'How do maintenance requests work?',
          answer: `When a resident reports a problem via WhatsApp, the AI:

1. Automatically detects it's a maintenance request
2. Creates a ticket on the "Maintenance" board
3. Classifies the urgency (low, medium, high, emergency)
4. Notifies you

You can then move the ticket through the columns: Open → In Progress → Resolved → Closed`,
        },
        q12: {
          category: 'maintenance',
          question: 'How do I organize maintenance requests?',
          answer: `Use the Kanban board in "Maintenance":

OPEN: New requests you need to review
IN PROGRESS: You're working on them
RESOLVED: Problem fixed, awaiting confirmation
CLOSED: Everything completed

Just drag cards between columns. It's very visual and easy!`,
        },
        q13: {
          category: 'maintenance',
          question: 'Are residents notified when I resolve something?',
          answer: `Yes, automatically.

When you move a request to "Closed", the resident receives a WhatsApp message confirming their problem was resolved.

You don't need to do anything extra, Blok does it for you.`,
        },
        q14: {
          category: 'broadcasts',
          question: 'How do I send an announcement to all residents?',
          answer: `Go to "Broadcasts" and:

1. Click "Create Broadcast"
2. Write your message
3. Select who to send to:
   - All residents
   - Only owners
   - Only renters
4. Click "Send"

Everyone will receive the message via WhatsApp at the same time!`,
        },
        q15: {
          category: 'broadcasts',
          question: 'How many messages can I send at once?',
          answer: `You can send to ALL your residents at once.

Blok handles the sending automatically, respecting WhatsApp limits to avoid problems.

It doesn't matter if you have 20 or 200 residents, Blok takes care of everything.`,
        },
        q16: {
          category: 'broadcasts',
          question: 'Can I send announcements to only some residents?',
          answer: `Yes, you can select:
- ALL residents
- Only OWNERS
- Only RENTERS

For example, if it's information about maintenance fees, send it only to owners.

If it's about building rules, send it to everyone.`,
        },
      },
    },

    // Common
    common: {
      search: 'Search',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      actions: 'Actions',
      details: 'Details',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    },

    // Status messages
    messages: {
      saved: 'Saved successfully',
      deleted: 'Deleted successfully',
      error: 'An error occurred',
      loading: 'Loading...',
      noData: 'No data',
      confirmDelete: 'Are you sure you want to delete this?',
    },

    // Languages
    languages: {
      es: 'Español',
      en: 'English',
    },

    // Landing Page
    paperFlyerPain: {
      headline: 'Still Printing Flyers?',
      subheadline: 'There\'s a Better Way',
      description: 'Stop printing. Stop taping paper in the elevator. Stop wasting time. Blok delivers your announcements to every resident in seconds.',
    },

    hero: {
      eyebrow: 'Professional Communication for Your Condo',
      headline: 'Instant 24/7 Responses. Organized Management. Happy Residents.',
      subheadline: 'AI that handles residents automatically, while your team focuses on what matters. Better service, lower operating costs.',
      audience: 'For Condo Administrators, Boards, and Property Managers in Puerto Rico',
      cta: 'Get Started Free',
      waitlist: 'Reserve Your Access',
      waitlistSubtext: 'Early Access',
      talkToFounder: 'Talk to Jan (Founder)',
      login: 'Log In',
      socialProof: 'Trusted by over {count} condos in Puerto Rico',
      comingSoon: 'Coming soon',
    },

    problem: {
      headline: 'Admins Waste Time on Repetitive Messages',
      problems: {
        fragmented: {
          title: 'Fragmented Communication',
          description: 'Messages lost between WhatsApp, email, and calls with no centralized record',
        },
        announcements: {
          title: 'Inefficient Announcements',
          description: 'One-by-one messages to each resident taking hours of manual work',
        },
        maintenance: {
          title: 'Disorganized Requests',
          description: 'Maintenance reports lost or without proper follow-up',
        },
      },
    },

    solution: {
      headline: 'Blok Automates Everything',
      subheadline: 'Residents message via WhatsApp as usual. Blok responds automatically.',
      steps: {
        step1: {
          title: 'Resident Writes',
          subtitle: 'Message sent via WhatsApp to condo number',
          example: '"The generator didn\'t turn on"',
        },
        step2: {
          title: 'System Analyzes',
          subtitle: 'Detects intent, urgency, and category automatically',
          example: 'priority: emergency',
        },
        step3: {
          title: 'Immediate Action',
          subtitle: 'Creates ticket, responds to resident, and notifies admin',
          example: 'Ticket #123 created',
        },
      },
    },

    dashboardPreview: {
      headline: 'Modern and Centralized Dashboard',
      subheadline: 'Manage all communications, maintenance requests, and broadcasts from one place.',
      cta: 'See Demo',
    },

    features: {
      headline: 'Get Your Money Back. Get Your Time Back.',
      list: {
        payments: {
          title: 'Stop Losing $15K Per Year',
          description: 'Track pending fees. Automatic WhatsApp reminders. Collect what you\'re owed.',
        },
        aiResponses: {
          title: 'Stop Answering at 11pm',
          description: 'AI responds to "What time does the pool close?" while you sleep. No personal WhatsApp.',
        },
        smartRouting: {
          title: 'Nothing Gets Lost in Chat',
          description: 'Important requests never buried in 200 messages. Everything auto-organized.',
        },
        autoTickets: {
          title: 'Say Goodbye to Excel Sheets',
          description: 'Every issue becomes a ticket. Visual tracking. Zero paper.',
        },
        broadcasts: {
          title: 'Announcements in 10 Seconds',
          description: 'No more copy-paste to 100 people. One click. Done.',
        },
        realtime: {
          title: 'See Everything at a Glance',
          description: 'Who messaged, what they need, what\'s pending. One screen.',
        },
      },
    },

    showcase: {
      headline: 'How Blok Works in Your Condo',
      subheadline: 'A platform that benefits everyone: board, administrator, and residents',
      items: {
        dashboard: {
          title: 'Total Real-Time Control',
          description: 'Board sees key metrics. Administrator manages everything from one screen. Instant reports.',
        },
        conversations: {
          title: 'Professional 24/7 Service',
          description: 'Residents get immediate responses. Administrator works from the system. Everything documented.',
        },
        maintenance: {
          title: 'Requests That Don\'t Get Lost',
          description: 'Residents report problems easily. Administrator tracks everything. Board sees real-time progress.',
        },
      },
    },

    comparison: {
      headline: 'Before vs. Now',
      subheadline: 'See the Real Difference',
      before: {
        title: 'BEFORE: Traditional Method',
        steps: [
          'Print 100 flyers: $50',
          'Post in lobby and elevators: 30 minutes',
          'Residents don\'t see notice: 50%',
          'Calls asking the same thing: 1 hour',
        ],
        total: 'Total: $50 + 1.5 hours + Frustration',
      },
      after: {
        title: 'WITH BLOK: Modern Communication',
        steps: [
          'Write message: 2 minutes',
          'Send to everyone: 10 seconds',
          'Instant confirmation: 100%',
          'Follow-up calls: 0',
        ],
        total: 'Total: $0 + 2 minutes + Peace of Mind',
      },
    },

    ai: {
      headline: 'You Always Have Control.',
      headlineAccent: 'AI Only Helps.',
      control: {
        title: 'Total Control in Your Hands',
        description: 'Turn off AI whenever you want. Respond manually to any message. Review every conversation. You decide.',
        features: [
          'Disable AI with one click',
          'Respond manually when you prefer',
          'Review all conversations',
          'Configure which questions AI answers',
        ],
      },
      capabilities: {
        intent: {
          title: 'Understands Without Explaining',
          description: 'Automatically identifies simple questions, real emergencies, or maintenance requests. No configuration needed.',
        },
        priority: {
          title: 'Knows What\'s Actually Urgent',
          description: 'No more interruptions for simple questions. AI detects real emergencies and alerts you immediately.',
        },
        knowledge: {
          title: 'Learns Your Condo',
          description: 'Upload regulations and FAQs once. AI responds with your exact info, without making things up.',
        },
      },
      demo: {
        title: 'See It in Action',
        subtitle: 'Real AI conversation example',
        input: 'Resident Message',
        output: 'AI Analysis',
        exampleMessage: 'The building elevator has not been working since this morning. I\'m on the 8th floor and need to get down urgently.',
        exampleIntent: 'maintenance_request',
        exampleCategory: 'elevator',
        examplePriority: 'emergency',
        exampleAction: 'create_ticket',
      },
    },

    pricing: {
      headline: 'Simple and Transparent Pricing',
      subheadline: 'No hidden costs. Cancel anytime.',
      features: {
        title: 'Every Plan Includes',
        list: [
          'Unlimited WhatsApp Business',
          'AI auto-responses',
          'Centralized dashboard',
          'Mass broadcasts',
          'Email support',
          'Free updates',
        ],
      },
      plans: {
        basic: {
          name: 'Starter',
          units: 'Up to 50 units',
          ideal: 'Ideal for small buildings',
        },
        premium: {
          name: 'Professional',
          units: 'Up to 150 units',
          ideal: 'Ideal for medium condos',
          badge: 'Most Popular',
        },
        enterprise: {
          name: 'Enterprise',
          units: 'Unlimited units',
          ideal: 'Ideal for large buildings',
        },
      },
      cta: 'Get Started',
      contact: 'Contact Sales',
    },

    why: {
      headline: 'Built for Puerto Rico',
      emoji: '🇵🇷',
      features: {
        whatsapp: {
          title: 'WhatsApp is Culture',
          description: 'In PR, WhatsApp isn\'t optional—it\'s essential. Blok integrates where your residents already are',
        },
        language: {
          title: 'Spanish First',
          description: 'AI trained in Puerto Rican Spanish with local context',
        },
        local: {
          title: 'Local Support',
          description: 'Team that understands the market and needs of condos in PR',
        },
      },
    },

    stats: {
      responseTime: {
        value: '< 3 sec',
        label: 'Response Time',
      },
      timeSaved: {
        value: '80%',
        label: 'Time Reduction',
      },
      accuracy: {
        value: '95%',
        label: 'AI Accuracy',
      },
      adoption: {
        value: '100%',
        label: 'Resident Adoption',
      },
    },

    faq: {
      headline: 'Frequently Asked Questions',
      questions: {
        q1: 'How does the automatic system work?',
        a1: 'Blok automatically analyzes messages, detects intent, and generates responses in Spanish based on your knowledge base. The system learns from previous responses.',
        q2: 'What if the system doesn\'t know the answer?',
        a2: 'If the system detects a complex query or emergency, it automatically escalates to the admin for manual response.',
        q3: 'Do I need a WhatsApp Business number?',
        a3: 'Yes, we help you set up a WhatsApp Business number for your condo. It\'s required by WhatsApp for commercial use.',
        q4: 'How long does implementation take?',
        a4: 'Initial setup takes 1-2 hours. Includes connecting WhatsApp, loading residents, and training AI with basic info.',
        q5: 'Can I cancel anytime?',
        a5: 'Yes, no penalty. Cancel whenever you want and keep access until the end of your paid period.',
      },
    },

    cta: {
      headline: 'Start Automating Today',
      subheadline: 'Join the condos already using AI to manage communications',
      button: 'Create Free Account',
      demo: 'See Demo',
    },

    finalCta: {
      headline: 'Modernize Your Condo Communication',
      subheadline: 'Join the boards that already improved their service with AI. Try free for 30 days, no commitment.',
      cta: 'Try Free for 30 Days',
      waitlist: 'Join the Waitlist',
      trial: 'No credit card • 15 min setup • Cancel anytime',
    },

    about: {
      headline: 'Meet the Founder',
      subheadline: 'Microsoft engineer building solutions for Puerto Rico outside of work hours',
      founder: {
        name: 'Jan Faris',
        title: 'Founder & CEO',
        experience: 'Software Engineer @ Microsoft',
        storyTitle: 'A Personal Project with Real Impact',
        story: 'I work as a software engineer at Microsoft, but outside of my work hours, I dedicate my time to solving real problems in Puerto Rico. Living in condos in San Juan and talking to friends in other buildings, I\'ve seen the same frustration: lost messages, repetitive unanswered questions, constant confusion. Blok is my personal project to change that.',
        locationTitle: 'Why I Built This',
        location: 'I graduated from UPR Mayagüez and understand how we communicate in Puerto Rico. Blok isn\'t an imported solution—it\'s designed specifically for our Puerto Rican reality. It\'s my way to contribute to Puerto Rico\'s tech ecosystem.',
        mission: 'My mission: prove that from Puerto Rico we can build world-class technology. Blok is my passion outside of work.',
      },
      company: {
        founded: 'Founded',
        based: 'San Juan, PR',
        technology: 'Artificial Intelligence',
      },
    },

    footer: {
      description: 'AI-powered communication platform for condos in Puerto Rico',
      product: 'Product',
      company: 'Company',
      legal: 'Legal',
      links: {
        features: 'Features',
        pricing: 'Pricing',
        docs: 'Documentation',
        about: 'About',
        blog: 'Blog',
        contact: 'Contact',
        privacy: 'Privacy',
        terms: 'Terms',
      },
      contact: {
        title: 'Contact',
        address: 'Address:',
        website: 'Website:',
      },
      about: {
        title: 'About Us',
        founder: 'Founder:',
        description: 'Blok is an AI platform designed specifically for condominiums in Puerto Rico, founded to modernize community communication and management.',
      },
      rights: 'All rights reserved',
    },
  },
} as const;

export type Language = 'es' | 'en';
export type Translations = typeof translations.es;
