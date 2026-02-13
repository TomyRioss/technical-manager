export interface ArticleSection {
  id: string;
  title: string;
  body: string;
}

export interface Article {
  label: string;
  sections: ArticleSection[];
}

export interface Category {
  title: string;
  items: Article[];
}

export const sections: Category[] = [
  {
    title: "EMPEZANDO",
    items: [
      {
        label: "Cómo registrarte",
        sections: [
          {
            id: "registro-acceder",
            title: "Acceder a la página de registro",
            body: "Ingresá a la página principal de Koldesk y hacé clic en el botón \"Registrarte\" ubicado en la barra de navegación superior. Se abre el formulario de registro donde vas a elegir cómo querés usar la plataforma.",
          },
          {
            id: "registro-datos",
            title: "Completar tus datos",
            body: "Ingresá tu nombre completo, correo electrónico y contraseña. Antes de completar el registro, tenés que elegir entre dos opciones: \"Crear mi tienda\" si sos el dueño del negocio (se te asigna el rol OWNER y se te redirige al onboarding para configurar tu tienda), o \"Unirme a una tienda\" si alguien te invitó a su equipo.",
          },
          {
            id: "registro-unirse",
            title: "Unirte a una tienda existente",
            body: "Si elegiste \"Unirme a una tienda\", necesitás ingresar el código de invitación que te dio el dueño del negocio. Este código lo genera el dueño desde su panel de configuración. Al registrarte con el código, se te asigna el rol TECHNICIAN y accedés directamente al dashboard de la tienda.",
          },
        ],
      },
      {
        label: "Cómo añadir alguien a tu equipo",
        sections: [
          {
            id: "equipo-acceder",
            title: "Acceder a la configuración del equipo",
            body: "Desde el dashboard, hacé clic en \"Configuración\" en la barra de navegación superior y luego seleccioná la sección \"Equipo\". Ahí vas a ver la lista de miembros actuales de tu equipo con sus roles.",
          },
          {
            id: "equipo-invitar",
            title: "Obtener el código de invitación",
            body: "En la sección Equipo vas a encontrar tu código de invitación. Copiá ese código y enviáselo a la persona que querés sumar (por WhatsApp, email, o como prefieras). La persona debe usar ese código cuando se registre en Koldesk eligiendo la opción \"Unirme a una tienda\".",
          },
          {
            id: "equipo-roles",
            title: "Roles y permisos",
            body: "Existen dos roles: OWNER (dueño) y TECHNICIAN (técnico). El OWNER tiene acceso completo a todas las funciones: inventario, recibos, estadísticas, exportación y configuración. El TECHNICIAN tiene acceso al dashboard, órdenes, clientes y caja, pero no puede gestionar inventario, recibos ni la configuración de la tienda.",
          },
        ],
      },
      {
        label: "Cómo entrar a tu inventario",
        sections: [
          {
            id: "inventario-acceder",
            title: "Acceder al inventario",
            body: "Desde el dashboard, hacé clic en \"Inventario\" en la barra de navegación superior. Esta sección solo está disponible para usuarios con rol OWNER. Se abre la vista del inventario donde podés ver y gestionar todos tus productos.",
          },
          {
            id: "inventario-navegacion",
            title: "Navegar por el inventario",
            body: "El inventario muestra una tabla con las columnas: Imagen, Nombre, Categoría, SKU, Precio, Stock y Estado. Usá la barra de búsqueda para encontrar productos por nombre o SKU. También podés filtrar por estado (Todos, Activos, Pendientes) y por categorías.",
          },
          {
            id: "inventario-agregar",
            title: "Agregar productos",
            body: "Para añadir un nuevo producto, hacé clic en el botón \"Agregar producto\". Completá los campos: nombre, categoría, SKU, precio de venta, costo, stock y estado. Podés subir una imagen del producto. La plataforma calcula automáticamente la utilidad (precio de venta menos costo) de cada producto.",
          },
        ],
      },
      {
        label: "Cómo configurar tu catálogo",
        sections: [
          {
            id: "config-categorias",
            title: "Crear y organizar categorías",
            body: "Andá a Configuración > Categorías para crear las categorías que van a organizar tus productos. Desde ahí podés agregar, editar o eliminar categorías. Cada producto de tu inventario puede asignarse a una categoría para mantener todo ordenado.",
          },
          {
            id: "config-precios",
            title: "Configurar precios y costos",
            body: "En cada producto podés definir el precio de venta (salePrice) y el costo del producto (costPrice). La plataforma calcula automáticamente la utilidad de cada producto como la diferencia entre el precio de venta y el costo. Esto te permite saber tu margen de ganancia por artículo.",
          },
          {
            id: "config-inventario",
            title: "Gestionar el stock",
            body: "Cada producto tiene un campo de stock que podés actualizar desde su ficha de edición. En el dashboard principal se muestra una sección de \"Bajo stock\" con los productos que tienen 5 unidades o menos, para que puedas identificar rápidamente qué necesitás reponer.",
          },
        ],
      },
      {
        label: "Cómo entrar a tu buscador",
        sections: [
          {
            id: "buscador-acceder",
            title: "¿Qué es el buscador de órdenes?",
            body: "El buscador de órdenes es una página pública que permite a tus clientes consultar el estado de su reparación. Cada tienda tiene su propio buscador con una URL única basada en el slug de tu tienda.",
          },
          {
            id: "buscador-encontrar",
            title: "Encontrar el link del buscador",
            body: "Desde el Dashboard (Inicio), vas a ver una sección con el link de tu \"Buscador de órdenes\". Ahí se muestra la URL completa, un botón para copiarla al portapapeles y un código QR que podés imprimir o compartir con tus clientes.",
          },
        ],
      },
      {
        label: "Cómo usar tu buscador",
        sections: [
          {
            id: "usar-buscador-cliente",
            title: "Cómo lo usa tu cliente",
            body: "Tu cliente accede al buscador desde el link o escaneando el código QR. En la página del buscador, ingresa el código de su orden de reparación. El sistema busca la orden y muestra el resultado.",
          },
          {
            id: "usar-buscador-resultado",
            title: "Qué información ve el cliente",
            body: "Al encontrar la orden, el cliente ve: el estado actual de la reparación (Recibido, En revisión, Esperando repuesto, En reparación, Listo para retirar, Entregado o Sin reparación), el modelo del equipo, la falla reportada y el técnico asignado.",
          },
          {
            id: "usar-buscador-beneficio",
            title: "Beneficio para tu negocio",
            body: "El buscador permite que tus clientes consulten el estado de su reparación sin necesidad de llamarte o escribirte. Podés imprimir el QR y colocarlo en tu local, o enviárselo a cada cliente junto con el código de su orden.",
          },
        ],
      },
      {
        label: "Cómo crear una orden",
        sections: [
          {
            id: "orden-nueva",
            title: "Iniciar una nueva orden",
            body: "Andá a Órdenes y hacé clic en \"Nueva orden\". Las órdenes en Koldesk son de reparación o servicio técnico, no de venta de productos. Se abre un formulario con varios pasos para completar los datos de la reparación.",
          },
          {
            id: "orden-cliente",
            title: "Seleccionar o crear cliente",
            body: "El primer paso es seleccionar el cliente. Podés buscar entre tus clientes existentes o crear uno nuevo directamente desde el formulario sin salir de la pantalla de creación de orden.",
          },
          {
            id: "orden-equipo",
            title: "Datos del equipo y la reparación",
            body: "Completá el modelo del equipo usando el autocompletado del catálogo de dispositivos, y describí la falla reportada por el cliente. Definí el precio acordado por la reparación y el costo de repuestos. La plataforma calcula automáticamente la utilidad (precio acordado menos costo de repuestos).",
          },
          {
            id: "orden-opcionales",
            title: "Datos opcionales y estados",
            body: "Opcionalmente podés asignar un técnico, definir los días de garantía, agregar notas internas y subir fotos del equipo. Las órdenes pasan por estos estados: Recibido → En revisión → Esperando repuesto → En reparación → Listo para retirar → Entregado. También existe el estado \"Sin reparación\" para casos donde no se puede reparar.",
          },
        ],
      },
    ],
  },
  {
    title: "PREGUNTAS GENERALES",
    items: [
      {
        label: "Cómo exportar tus datos",
        sections: [
          {
            id: "exportar-acceder",
            title: "Acceder a la exportación",
            body: "Andá a Configuración > Exportar. Desde esta sección podés descargar tus datos en distintos formatos. La exportación está disponible solo para usuarios con rol OWNER.",
          },
          {
            id: "exportar-tipos",
            title: "Tipos de datos exportables",
            body: "Podés exportar tres tipos de datos: Órdenes de Trabajo (historial de reparaciones), Clientes (base de datos de clientes) y Recibos (historial de recibos). Cada tipo tiene su propio selector de formato y botón de descarga independiente.",
          },
          {
            id: "exportar-formatos",
            title: "Formatos disponibles",
            body: "Para cada tipo de dato podés elegir entre tres formatos: Excel (.xlsx) ideal para abrir con hojas de cálculo, CSV (.csv) compatible con cualquier software de gestión, y JSON (.json) útil para integraciones técnicas o backups de datos.",
          },
        ],
      },
      {
        label: "Cómo calcular utilidades netas",
        sections: [
          {
            id: "utilidades-concepto",
            title: "¿Qué son las utilidades netas?",
            body: "Las utilidades netas son la ganancia real de tu negocio. En cada orden de reparación definís un precio acordado con el cliente y un costo de repuestos. La utilidad se calcula automáticamente como la diferencia: precio acordado menos costo de repuestos.",
          },
          {
            id: "utilidades-dashboard",
            title: "Ver utilidades en el dashboard",
            body: "En el Dashboard (Inicio) hay una card de \"Utilidades Netas\" que muestra el total acumulado del mes actual. También muestra la comparación con el mes anterior y el porcentaje de cambio, para que puedas ver si tu negocio está mejorando.",
          },
          {
            id: "utilidades-detalle",
            title: "Ver detalle de utilidades",
            body: "Para un detalle más específico, podés ir a la sección de Ventas desde el dashboard. Ahí se muestra el desglose por recibos y órdenes del mes actual, para que puedas ver de dónde vienen tus ingresos y cuánto ganaste en cada operación.",
          },
        ],
      },
      {
        label: "Cómo usar los recibos",
        sections: [
          {
            id: "recibos-crear",
            title: "Crear un recibo",
            body: "Los recibos se crean manualmente. Andá a Recibos y hacé clic en \"Nuevo recibo\". Esta sección solo está disponible para usuarios con rol OWNER. Se abre un formulario donde cargás los datos de la venta.",
          },
          {
            id: "recibos-datos",
            title: "Datos del recibo",
            body: "Cada recibo incluye: número de recibo (generado automáticamente), método de pago, items (productos de tu inventario), subtotal, comisión según el método de pago y total. Podés agregar varios productos del inventario a un mismo recibo.",
          },
          {
            id: "recibos-gestion",
            title: "Gestión de recibos",
            body: "Los recibos tienen tres estados: pagado, pendiente y anulado. Podés archivar recibos que ya no necesités ver en la lista principal. Usá la barra de búsqueda para encontrar recibos por número o por método de pago.",
          },
        ],
      },
      {
        label: "Cómo personalizar tu tienda",
        sections: [
          {
            id: "tienda-logo",
            title: "Subir tu logo",
            body: "Andá a Configuración > General y hacé clic en el área del logo para subir tu imagen. Los formatos aceptados son PNG, JPG, WebP y SVG. El logo aparece en tu tienda pública y le da identidad visual a tu negocio dentro de la plataforma.",
          },
          {
            id: "tienda-info",
            title: "Nombre y color de tu tienda",
            body: "Desde Configuración > General podés cambiar el nombre de tu tienda y elegir un color principal. El color se aplica a distintos elementos visuales de tu tienda pública. Estos datos también se configuran inicialmente durante el onboarding.",
          },
          {
            id: "tienda-onboarding",
            title: "Configuración inicial (Onboarding)",
            body: "Cuando creás tu tienda por primera vez, pasás por un proceso de onboarding donde configurás: número de WhatsApp, ubicación y URL de Google Maps, horarios de atención, nombre de tu equipo, logo y redes sociales. Todos estos datos se pueden editar después desde Configuración > General.",
          },
        ],
      },
      {
        label: "Cómo conseguir tu link de Google Maps",
        sections: [
          {
            id: "maps-buscar",
            title: "Buscar tu negocio en Google Maps",
            body: "Abrí Google Maps (maps.google.com) y buscá la dirección de tu negocio. Si tu negocio ya está registrado en Google, va a aparecer como resultado con su nombre y dirección. Si no aparece, buscá la dirección física directamente.",
          },
          {
            id: "maps-copiar",
            title: "Copiar el enlace de compartir",
            body: "Una vez que tenés tu ubicación en el mapa, hacé clic en el botón \"Compartir\" (ícono de compartir). Se abre un cuadro con la opción \"Enviar un vínculo\". Copiá el link. Ese es tu enlace de Google Maps. También podés copiar la URL directamente desde la barra de direcciones del navegador.",
          },
          {
            id: "maps-agregar",
            title: "Agregar el link a tu tienda",
            body: "La URL de Google Maps se configura durante el onboarding en el paso de Ubicación, donde completás la dirección y pegás la URL de Maps. Si necesitás editarla después, podés hacerlo desde Configuración > General. El sistema resuelve automáticamente la URL para que funcione correctamente en tu tienda pública.",
          },
        ],
      },
    ],
  },
  {
    title: "SOPORTE",
    items: [
      {
        label: "Contacto con soporte",
        sections: [
          {
            id: "soporte-canales",
            title: "Canales de contacto",
            body: "Podés comunicarte con nuestro equipo de soporte desde la página de Contacto. Tenés dos opciones: completar el formulario de \"Quiero que me llamen\" (con tu nombre, teléfono, email y mensaje) o contactarnos directamente por WhatsApp o teléfono al +54 11 3408-3140.",
          },
          {
            id: "soporte-formulario",
            title: "Formulario de contacto",
            body: "Si elegís \"Quiero que me llamen\", completá el formulario con tu nombre, número de teléfono, correo electrónico y un mensaje describiendo tu consulta. Nuestro equipo se va a comunicar con vos a la brevedad por el medio que hayas indicado.",
          },
          {
            id: "soporte-directo",
            title: "Contacto directo",
            body: "Si preferís una respuesta inmediata, elegí la opción \"Quiero llamar\". Podés escribirnos por WhatsApp o llamar directamente al +54 11 3408-3140. Esta es la vía más rápida para resolver consultas urgentes.",
          },
        ],
      },
      {
        label: "Cómo reportar un error",
        sections: [
          {
            id: "error-identificar",
            title: "Identificar el error",
            body: "Si algo no funciona como esperabas, primero intentá reproducir el error: repetí los mismos pasos para confirmar que el problema es consistente. Anotá qué estabas haciendo cuando ocurrió, qué esperabas que pasara y qué pasó en su lugar.",
          },
          {
            id: "error-reportar",
            title: "Enviar el reporte",
            body: "Para reportar un error, andá a la página de Contacto y usá el formulario de \"Quiero que me llamen\" describiendo el problema en el campo de mensaje. También podés contactarnos directamente por WhatsApp al +54 11 3408-3140 para reportarlo de forma inmediata.",
          },
          {
            id: "error-info",
            title: "Qué información incluir",
            body: "Para que podamos ayudarte más rápido, incluí en tu reporte: qué estabas haciendo cuando ocurrió el error, los pasos para reproducirlo, capturas de pantalla si es posible, y el navegador y dispositivo que estás usando. Cuanta más información nos des, más rápido podemos resolverlo.",
          },
        ],
      },
      {
        label: "Cómo sugerir mejoras",
        sections: [
          {
            id: "mejoras-enviar",
            title: "Enviar una sugerencia",
            body: "Valoramos tus ideas para mejorar la plataforma. Para enviarnos una sugerencia, andá a la página de Contacto y usá el formulario de \"Quiero que me llamen\" describiendo tu idea en el campo de mensaje. También podés escribirnos directamente por WhatsApp al +54 11 3408-3140.",
          },
          {
            id: "mejoras-detalle",
            title: "Cómo describir tu sugerencia",
            body: "Contanos qué funcionalidad te gustaría ver, cómo la usarías en tu día a día y por qué sería útil para tu negocio. Cuanto más detallada sea tu sugerencia, mejor podemos evaluar cómo implementarla en la plataforma.",
          },
          {
            id: "mejoras-proceso",
            title: "Qué pasa con tu sugerencia",
            body: "Todas las sugerencias son revisadas por nuestro equipo. Las evaluamos según el impacto para los usuarios y la viabilidad técnica. Si tu sugerencia es seleccionada para desarrollo, nos vamos a comunicar con vos para contarte.",
          },
        ],
      },
    ],
  },
];

export const allItems = sections.flatMap((s) => s.items);
