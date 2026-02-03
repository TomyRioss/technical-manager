  
**TECHNICAL MANAGER**

Desglose Completo de Funcionalidades

SaaS para Locales de Reparación de Celulares

Febrero 2026 | Documento Interno

**Resumen de Features por Fase**

| \# | Feature | Prioridad | Fase |
| :---- | :---- | :---- | :---- |
| 01 | Orden de Trabajo | ALTA | Fase 1 \- MVP |
| 02 | Directorio de Clientes | ALTA | Fase 1 \- MVP |
| 03 | Estados \+ Mensaje Automático | ALTA | Fase 1 \- MVP |
| 04 | Vista Compartida entre Compañeros | ALTA | Fase 1 \- MVP |
| 05 | Foto del Equipo al Recibirlo | ALTA | Fase 1 \- MVP |
| 06 | Resumen de Caja | MEDIA | Fase 1 \- MVP |
| 07 | Link Público de Seguimiento | ALTA | Fase 1 \- MVP |
| 08 | Garantía con Vencimiento | MEDIA | Fase 2 |
| 09 | Notas Internas entre Técnicos | MEDIA | Fase 2 |
| 10 | Alerta de Equipos Sin Retirar | MEDIA | Fase 2 |
| 11 | Estadísticas del Negocio | MEDIA | Fase 2 |
| 12 | Detección de Clientes Frecuentes | BAJA | Fase 2 |
| 13 | Recibo Digital por WhatsApp | MEDIA | Fase 2 |
| 14 | Valoración Post-Servicio | BAJA | Fase 3 |
| 15 | Personalización de Marca | BAJA | Fase 3 |
| 16 | Roles y Permisos | MEDIA | Fase 2 |
| 17 | Exportar Datos | BAJA | Fase 3 |
| 18 | Catálogo del Proveedor Integrado | BAJA | Fase 3 |

**FEATURE 01**

**Orden de Trabajo**

*Reemplaza el boletero de papel*

| Prioridad: ALTA | Fase: Fase 1 \- MVP | Impacto: Crítico |
| :---- | :---- | :---- |

**¿Qué es?**

Formulario digital donde se registra cada reparación que entra al local. Captura toda la información que hoy se anota en papel, pero de forma estructurada y buscable.

**Detalle**

| Campo | Tipo | Obligatorio | Detalle |
| :---- | :---- | :---- | :---- |
| Cliente | Selector / Nuevo | Sí | Busca en directorio o crea uno nuevo |
| Modelo del equipo | Texto \+ autocompletado | Sí | Sugerencias de modelos frecuentes |
| Falla reportada | Texto \+ tags predefinidos | Sí | Pantalla rota, no enciende, agua, etc. |
| Precio acordado | Número | No | Se toma de la lista de precios o se ingresa manual |
| Foto del equipo | Imagen (cámara) | Recomendado | Estado físico al momento de recibir |
| Técnico asignado | Selector | Sí | Quién va a hacer la reparación |
| Notas internas | Texto libre | No | Solo visible para técnicos, no para el cliente |
| Días de garantía | Número | No | Se completa al entregar |
| Fecha de ingreso | Automático | Sí | Se genera solo al crear la orden |
| Código único | Automático | Sí | Ej: X7kM2p \- para el link público |

**¿Cómo funciona?**

Al recibir un celular, el técnico abre la app, completa el formulario en menos de 1 minuto, saca una foto rápida, y la orden queda creada. El cliente recibe automáticamente un mensaje con el resumen y el link de seguimiento.

**¿Por qué genera valor?**

Reemplaza completamente el boletero de papel. Todo queda guardado, buscable, y respaldado. No se pierde información nunca más.

**FEATURE 02**

**Directorio de Clientes**

*Base de datos de todos los clientes del local*

| Prioridad: ALTA | Fase: Fase 1 \- MVP | Impacto: Crítico |
| :---- | :---- | :---- |

**¿Qué es?**

Base de datos de clientes con toda su información de contacto e historial completo de reparaciones. Cada vez que un cliente vuelve, el técnico busca su nombre o teléfono y toda su info ya está cargada.

**Detalle**

| Campo | Tipo | Obligatorio | Detalle |
| :---- | :---- | :---- | :---- |
| Nombre completo | Texto | Sí | Nombre y apellido del cliente |
| Teléfono | Teléfono | Sí | Número principal de contacto |
| Email | Email | No | Opcional, para comunicaciones futuras |
| Notas del cliente | Texto libre | No | Ej: 'Trabaja con tierra, siempre trae equipos sucios' |
| Fecha primer visita | Automático | Sí | Se genera con la primera orden |
| Cantidad de visitas | Automático | Sí | Contador que se actualiza solo |
| Total gastado | Automático | Sí | Suma de todas las reparaciones |
| Tag cliente frecuente | Automático | Sí | Se activa con 3+ visitas |

**¿Cómo funciona?**

Al crear una orden nueva, el técnico empieza a escribir el nombre o teléfono. Si el cliente ya existe, se autocompleta todo. Si es nuevo, se crea con los datos mínimos (nombre \+ teléfono) y queda guardado para siempre.

**¿Por qué genera valor?**

Con el tiempo, esta base de datos se convierte en el activo más valioso del negocio. Saber que Juan vino 8 veces y gastó $X es información que no tiene precio. Es lo que hace imposible abandonar la plataforma.

**FEATURE 03**

**Estados \+ Mensaje Automático**

*Flujo de trabajo con notificación al cliente*

| Prioridad: ALTA | Fase: Fase 1 \- MVP | Impacto: Crítico |
| :---- | :---- | :---- |

**¿Qué es?**

Cada orden de trabajo tiene un estado que el técnico puede cambiar con un toque. Al pasar a ciertos estados, se dispara un mensaje automático por WhatsApp al cliente.

**Detalle**

| Estado | Disparador | Mensaje al cliente | Color |
| :---- | :---- | :---- | :---- |
| Pendiente | Al crear la orden | Recibimos tu equipo. Seguilo acá: \[link\] | Gris |
| Esperando repuesto | Manual | Estamos esperando el repuesto para tu equipo | Amarillo |
| En reparación | Manual | Tu equipo está siendo reparado | Azul |
| Listo para retirar | Manual | Tu equipo ya está listo. Pasá a retirarlo | Verde |
| Entregado | Manual | Gracias por confiar en nosotros. Link a encuesta | Verde oscuro |
| Sin retirar (+X días) | Automático | Tu equipo sigue acá. Recordatorio amigable | Rojo |

**¿Cómo funciona?**

David termina de reparar un celular, abre la app, toca 'Listo para retirar', y el cliente recibe un WhatsApp instantáneo con el link de seguimiento actualizado. Sin llamar, sin escribir manual, sin perder tiempo.

**¿Por qué genera valor?**

Esta es la killer feature. Le ahorra al técnico entre 30 minutos y 1 hora por día en comunicación con clientes. Además, elimina el '¿Ya está mi celular?' porque el cliente puede revisar solo.

**FEATURE 04**

**Vista Compartida entre Compañeros**

*Todos los técnicos ven todas las reparaciones*

| Prioridad: ALTA | Fase: Fase 1 \- MVP | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Panel donde cada técnico puede ver todas las órdenes activas del local, sin importar quién las creó. Filtrable por técnico, estado, fecha, o cliente.

**Detalle**

| Vista | Descripción | Uso principal | Acceso |
| :---- | :---- | :---- | :---- |
| Todas las órdenes | Lista completa de reparaciones activas | Visión general del local | Todos |
| Mis órdenes | Solo las asignadas al técnico logueado | Foco en mi trabajo | Individual |
| Órdenes de \[compañero\] | Filtro por técnico específico | Saber qué está haciendo el otro | Todos |
| Por estado | Filtro por pendiente, en proceso, listo | Priorizar trabajo | Todos |
| Urgentes | Órdenes con más de X días sin movimiento | No olvidar reparaciones | Todos |

**¿Cómo funciona?**

David entra a la app y ve de un vistazo: 3 pendientes, 5 en reparación (2 suyas, 3 de su compañero), y 2 listas para retirar. Si un cliente llama y David no sabe de su equipo, busca el nombre y ve todo aunque la orden sea de su compañero.

**¿Por qué genera valor?**

El papel no puede hacer esto. Si David no está y viene un cliente, su compañero tiene que buscar en el boletero y probablemente no encuentra nada. Con esto, la info está siempre disponible para todos.

**FEATURE 05**

**Foto del Equipo al Recibirlo**

*Evidencia fotográfica del estado al ingreso*

| Prioridad: ALTA | Fase: Fase 1 \- MVP | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Al crear una orden de trabajo, el técnico puede sacar una o varias fotos del celular mostrando su estado físico actual. Las fotos quedan vinculadas a la orden y son visibles en el link público del cliente.

**Detalle**

| Aspecto | Detalle | Importancia | Ejemplo |
| :---- | :---- | :---- | :---- |
| Cantidad de fotos | Mínimo 1, máximo 5 | Flexible | Frente, dorso, detalle del daño |
| Calidad | Compresión automática | Para no llenar storage | Se reduce a 1MB max por foto |
| Timestamp | Fecha y hora automática en la foto | Prueba legal | 02/02/2026 14:35 |
| Vinculación | Se adjunta a la orden | Trazabilidad | Orden X7kM2p tiene 3 fotos |
| Visibilidad | Técnico: todas. Cliente: opcional | Privacidad | El dueño decide qué muestra |

**¿Cómo funciona?**

Llega un cliente con un Samsung con pantalla rota. El técnico abre la orden, toca 'Agregar foto', saca 2 fotos rápidas con el celular del mostrador, y listo. Tarda 10 segundos extra y le puede ahorrar una discusión de 30 minutos.

**¿Por qué genera valor?**

El día que un cliente diga 'esto no estaba rayado cuando lo dejé', David abre la app, muestra la foto con fecha y hora, y la discusión termina. Esta feature se paga sola la primera vez que la usa.

**FEATURE 06**

**Resumen de Caja**

*Cuánto entra y cuánto sale, día a día*

| Prioridad: MEDIA | Fase: Fase 1 \- MVP | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Panel que muestra automáticamente cuánto dinero entró al local hoy, esta semana y este mes, basado en las órdenes cobradas. No requiere que el técnico haga nada extra: los datos ya están en las órdenes.

**Detalle**

| Métrica | Cálculo | Visualización | Utilidad |
| :---- | :---- | :---- | :---- |
| Ingreso del día | Suma de órdenes pagadas hoy | Número grande \+ gráfico | Control diario |
| Ingreso semanal | Suma de la semana actual | Gráfico de barras por día | Tendencia corta |
| Ingreso mensual | Suma del mes actual | Comparación con mes anterior | Visión de negocio |
| Promedio por reparación | Órdenes totales / ingreso | Número | Ticket promedio |
| Reparaciones del día | Conteo de órdenes cerradas hoy | Número | Productividad |

**¿Cómo funciona?**

David abre la sección de caja y ve: 'Hoy: $45.000, esta semana: $180.000, este mes: $620.000'. No tuvo que sumar nada. La app lo calculó automáticamente con los precios de las órdenes.

**¿Por qué genera valor?**

Hoy David no tiene idea de cuánto factura por mes. Una vez que vea estos números, se vuelve adicto. La visibilidad financiera es una de las features que más retención generan en SaaS para negocios.

**FEATURE 07**

**Link Público de Seguimiento**

*El cliente rastrea su reparación como un envío*

| Prioridad: ALTA | Fase: Fase 1 \- MVP | Impacto: Crítico |
| :---- | :---- | :---- |

**¿Qué es?**

Página web pública (no requiere app ni login) donde el cliente puede ver el estado de su reparación en tiempo real. Accesible desde un QR estático en el local o desde el link enviado por WhatsApp.

**Detalle**

| Elemento | Visible para el cliente | Ejemplo | Editable |
| :---- | :---- | :---- | :---- |
| Buscador | Campo para ingresar teléfono o código | Ingresá tu número o código | No |
| Estado actual | Indicador visual con colores | EN REPARACIÓN (azul) | No |
| Modelo y falla | Descripción del trabajo | Samsung A54 \- Cambio de módulo | No |
| Fecha de ingreso | Cuándo se dejó el equipo | 02/02/2026 | No |
| Foto del equipo | Estado al recibirlo (si el dueño activó esto) | Imagen del celular | No |
| Garantía | Fecha de vencimiento (post-entrega) | Válida hasta 02/03/2026 | No |
| Mensaje del técnico | Nota opcional | Esperando repuesto, llega mañana | Sí, por técnico |
| Botón WhatsApp | Contacto rápido con el local | Abre chat directo | No |
| Branding del local | Logo y nombre del negocio | David \- Soporte Técnico | Sí, configurable |
| Crédito de la plataforma | Pequeño texto abajo | Gestionado por \[tu marca\] | No |

**¿Cómo funciona?**

David tiene un QR impreso en el mostrador. El cliente escanea, ingresa su número de teléfono, y ve su reparación al instante. También recibe el link directo por WhatsApp al dejar el equipo. La URL es tudominio.com/david y el buscador filtra por teléfono o código único.

**¿Por qué genera valor?**

Triple valor: (1) El cliente no molesta más preguntando el estado. (2) El local se ve ultra profesional. (3) Cada link es publicidad gratuita para tu plataforma, porque otros locales y clientes ven tu marca.

**FEATURE 08**

**Garantía con Vencimiento**

*Control automático de garantías*

| Prioridad: MEDIA | Fase: Fase 2 | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Al entregar un equipo reparado, el técnico indica cuántos días de garantía ofrece. El sistema calcula la fecha de vencimiento y permite verificar al instante si un reclamo está en garantía o no.

**Detalle**

| Campo | Tipo | Detalle | Automatización |
| :---- | :---- | :---- | :---- |
| Días de garantía | Número (7, 15, 30, 60, 90\) | Configurable por tipo de reparación | Sugiere el default del local |
| Fecha inicio garantía | Automático | Fecha de entrega del equipo | Se genera al marcar 'Entregado' |
| Fecha vencimiento | Automático | Inicio \+ días de garantía | Cálculo automático |
| Estado garantía | Automático | Vigente / Vencida | Se actualiza diariamente |
| Visible al cliente | Sí, en el link público | Muestra fecha de vencimiento | Transparencia total |

**¿Cómo funciona?**

Un cliente vuelve diciendo que la pantalla se despegó. David busca la orden, ve 'Garantía: vigente hasta 15/03/2026' y sabe al instante que corresponde repararla sin costo. Si dice 'Garantía: vencida el 10/01/2026', le cobra sin discusión. Todo está registrado.

**¿Por qué genera valor?**

Elimina discusiones con clientes. El sistema es el árbitro objetivo. Además, el cliente ve la fecha de garantía en su link, lo que genera confianza y profesionalismo.

**FEATURE 09**

**Notas Internas entre Técnicos**

*Comunicación interna invisible para el cliente*

| Prioridad: MEDIA | Fase: Fase 2 | Impacto: Medio |
| :---- | :---- | :---- |

**¿Qué es?**

Campo de notas dentro de cada orden de trabajo que solo es visible para los técnicos del local. Permite dejar observaciones, advertencias o instrucciones sin que el cliente las vea.

**Detalle**

| Tipo de nota | Ejemplo | Quién la ve | Cuándo se usa |
| :---- | :---- | :---- | :---- |
| Observación técnica | Tiene corrosión interna por agua, aunque dijo que se le cayó | Solo técnicos | Al diagnosticar |
| Advertencia | Cliente conflictivo, revisar bien antes de entregar | Solo técnicos | Prevención |
| Instrucción | No tocar la placa, solo cambiar el módulo | Solo técnicos | Si otro técnico termina el trabajo |
| Seguimiento | Se le pidió repuesto a proveedor X, llega el jueves | Solo técnicos | Gestión de tiempos |

**¿Cómo funciona?**

David recibe un celular que dice que se cayó, pero al abrirlo ve corrosión por agua. Escribe en notas internas: 'Tiene daño por líquido, el cliente no lo mencionó. Revisar bien placa antes de cerrar.' Su compañero ve esa nota cuando agarra la reparación.

**¿Por qué genera valor?**

La memoria compartida del equipo. Evita malentendidos entre técnicos y protege al local ante clientes problemáticos. Es especialmente valiosa cuando hay más de un técnico.

**FEATURE 10**

**Alerta de Equipos Sin Retirar**

*Recordatorios automáticos para equipos olvidados*

| Prioridad: MEDIA | Fase: Fase 2 | Impacto: Medio |
| :---- | :---- | :---- |

**¿Qué es?**

Detección automática de órdenes en estado 'Listo para retirar' que llevan más de X días sin ser recogidas. Envía recordatorios al cliente y alerta al técnico.

**Detalle**

| Regla | Tiempo | Acción | Mensaje |
| :---- | :---- | :---- | :---- |
| Primer recordatorio | 3 días sin retirar | WhatsApp al cliente | Tu equipo está listo. Acordá retirarlo |
| Segundo recordatorio | 7 días sin retirar | WhatsApp al cliente | Tu equipo sigue esperando. Retiralo pronto |
| Alerta al técnico | 7 días sin retirar | Notificación interna | Equipo de Juan lleva 7 días sin retirar |
| Último aviso | 15 días sin retirar | WhatsApp al cliente | Último aviso: si no retirás tu equipo en 7 días... |
| Configurable | El dueño elige los días | Flexible | Cada local define sus tiempos |

**¿Cómo funciona?**

David terminó una reparación hace 5 días y el cliente no vino. La app le muestra un badge rojo: '3 equipos sin retirar' y ya le mandó un recordatorio automático al cliente. David no tuvo que hacer nada.

**¿Por qué genera valor?**

Equipos sin retirar son plata parada y espacio ocupado. Esta feature recupera clientes olvidadizos sin esfuerzo manual.

**FEATURE 11**

**Estadísticas del Negocio**

*Dashboard con métricas clave*

| Prioridad: MEDIA | Fase: Fase 2 | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Panel visual con los datos más importantes del negocio, calculados automáticamente a partir de las órdenes. No requiere que el técnico haga nada extra.

**Detalle**

| Métrica | Cálculo | Para qué sirve | Frecuencia |
| :---- | :---- | :---- | :---- |
| Reparaciones por mes | Conteo mensual | Ver si el negocio crece | Mensual |
| Comparativa mes actual vs anterior | Diferencia porcentual | Tendencia de crecimiento | Mensual |
| Reparación más común | Falla con más ocurrencias | Stockear repuestos correctos | Mensual |
| Modelo que más se rompe | Modelo con más órdenes | Anticipar demanda | Mensual |
| Ticket promedio | Ingreso total / cantidad de órdenes | Saber cuánto vale cada cliente | Semanal |
| Tiempo promedio de reparación | Promedio entre ingreso y entrega | Medir eficiencia | Semanal |
| Reparaciones por técnico | Conteo por persona | Medir productividad | Semanal |

**¿Cómo funciona?**

David abre el dashboard un lunes y ve: 'Este mes: 47 reparaciones (12% más que el mes pasado). Reparación más común: pantalla. Modelo que más se rompe: Samsung A34. Ticket promedio: $15.000.' Ahora sabe exactamente cómo va su negocio.

**¿Por qué genera valor?**

Los dueños de negocios que ven sus números se obsesionan. Esta feature genera una dependencia emocional con la plataforma porque les da algo que nunca tuvieron: claridad sobre su propio negocio.

**FEATURE 12**

**Detección de Clientes Frecuentes**

*Identifica y premia a los mejores clientes*

| Prioridad: BAJA | Fase: Fase 2 | Impacto: Medio |
| :---- | :---- | :---- |

**¿Qué es?**

El sistema identifica automáticamente a los clientes que visitaron el local 3 o más veces y los marca como 'frecuentes'. Esto permite darles trato preferencial, descuentos, o simplemente reconocerlos.

**Detalle**

| Criterio | Condición | Etiqueta | Acción sugerida |
| :---- | :---- | :---- | :---- |
| Cliente nuevo | 1 visita | Nuevo | Experiencia estándar |
| Cliente recurrente | 2 visitas | Recurrente | Atención cuidada |
| Cliente frecuente | 3+ visitas | Frecuente (badge dorado) | Descuento, prioridad |
| Cliente VIP | 5+ visitas o $X gastado | VIP (badge especial) | Garantía extendida, promos |

**¿Cómo funciona?**

Llega un cliente y David busca su nombre. Ve un badge dorado que dice 'Cliente frecuente \- 5 visitas \- $75.000 gastados'. David sabe que es un cliente importante y lo trata en consecuencia, quizás le ofrece un descuento o prioridad.

**¿Por qué genera valor?**

Retener un cliente existente es 5 veces más barato que conseguir uno nuevo. Esta feature le da a David la información para tratar mejor a sus mejores clientes, lo que genera más fidelidad y más ingresos.

**FEATURE 13**

**Recibo Digital por WhatsApp**

*Comprobante profesional automático*

| Prioridad: MEDIA | Fase: Fase 2 | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Al crear una orden de trabajo, el cliente recibe automáticamente un mensaje por WhatsApp con un resumen profesional de lo que dejó, el precio acordado, y el link de seguimiento. Reemplaza el papelito que se pierde.

**Detalle**

| Elemento del recibo | Ejemplo | Fuente del dato | Formato |
| :---- | :---- | :---- | :---- |
| Nombre del local | David \- Soporte Técnico | Configuración del local | Encabezado |
| Número de orden | Orden \#X7kM2p | Generado automático | Código único |
| Fecha de ingreso | 02/02/2026 14:35 | Automático | Fecha y hora |
| Modelo del equipo | Samsung Galaxy A54 | Orden de trabajo | Texto |
| Falla reportada | Pantalla rota \- Cambio de módulo | Orden de trabajo | Texto |
| Precio acordado | $15.000 | Orden de trabajo | Monto |
| Estado de pago | Pagado por adelantado | Orden de trabajo | Tag |
| Link de seguimiento | tudominio.com/david?c=X7kM2p | Automático | Link clickeable |
| Garantía estimada | 30 días post-entrega | Configuración del local | Texto |

**¿Cómo funciona?**

David crea la orden y el cliente recibe al instante un WhatsApp con toda la info: qué dejó, cuánto le cobraron, y un link para seguir el estado. El cliente no pierde ningún dato y el local se ve profesional.

**¿Por qué genera valor?**

Profesionaliza el local instantáneamente. El cliente se siente seguro porque tiene todo por escrito. Además, el link de seguimiento en el recibo hace que el cliente use la plataforma activamente.

**FEATURE 14**

**Valoración Post-Servicio**

*Encuesta automática que sube reseñas en Google*

| Prioridad: BAJA | Fase: Fase 3 | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Cuando una orden pasa a 'Entregado', el cliente recibe un mensaje pidiendo que valore su experiencia con estrellas (1-5). Si pone 4 o 5, se lo redirige a Google Maps para dejar una reseña pública. Si pone menos, la queja queda interna.

**Detalle**

| Valoración | Acción | Dónde va | Beneficio |
| :---- | :---- | :---- | :---- |
| 5 estrellas | Redirige a Google Maps | Reseña pública | Sube rating del local |
| 4 estrellas | Redirige a Google Maps | Reseña pública | Sube rating del local |
| 3 estrellas | Formulario interno | Solo lo ve el dueño | Feedback para mejorar |
| 1-2 estrellas | Formulario interno \+ alerta | Dueño recibe notificación | Oportunidad de recuperar al cliente |

**¿Cómo funciona?**

Un cliente retira su celular, David marca 'Entregado', y al rato el cliente recibe: '¿Cómo fue tu experiencia? Valorá el servicio.' Si está contento, termina dejando 5 estrellas en Google Maps. David no hizo nada y su local subió de rating.

**¿Por qué genera valor?**

Las reseñas en Google Maps son el marketing más poderoso para un local. Esta feature automatiza algo que ningún local hace manualmente. Un local con 50+ reseñas de 4.8 estrellas atrae clientes sin gastar en publicidad.

**FEATURE 15**

**Personalización de Marca**

*Cada local se ve único*

| Prioridad: BAJA | Fase: Fase 3 | Impacto: Medio |
| :---- | :---- | :---- |

**¿Qué es?**

El dueño puede subir el logo de su local, elegir colores, y personalizar el nombre que aparece en los mensajes de WhatsApp, el link público, y los recibos digitales.

**Detalle**

| Elemento personalizable | Dónde aparece | Valor por defecto | Ejemplo personalizado |
| :---- | :---- | :---- | :---- |
| Logo del local | Link público, recibos | Sin logo | Logo de David Soporte Técnico |
| Nombre del local | Mensajes, link, recibos | Nombre del dueño | TechFix Reparaciones |
| Color principal | Link público | Azul estándar | Verde del logo del local |
| Mensaje de bienvenida | Link público | Genérico | Bienvenido a TechFix, tu equipo está en buenas manos |
| Firma en mensajes | WhatsApp automáticos | Genérico | Equipo TechFix \- Tel: 11-XXXX-XXXX |

**¿Cómo funciona?**

David entra a configuración, sube su logo, escribe el nombre de su local, elige su color, y ahora todo lo que el cliente ve tiene la identidad de su negocio. Se siente dueño de la plataforma.

**¿Por qué genera valor?**

Justifica cobrar más por el SaaS (plan 'Profesional' con branding vs plan básico sin branding). Además, cuando el dueño personalizó todo, siente que la plataforma es 'suya' y es más difícil que se vaya.

**FEATURE 16**

**Roles y Permisos**

*Dueño ve todo, técnico ve lo necesario*

| Prioridad: MEDIA | Fase: Fase 2 | Impacto: Alto |
| :---- | :---- | :---- |

**¿Qué es?**

Sistema de dos niveles de acceso: Dueño (admin) y Técnico (operador). El dueño ve toda la información financiera y configuración. El técnico solo ve reparaciones y clientes.

**Detalle**

| Funcionalidad | Dueño (Admin) | Técnico (Operador) | Justificación |
| :---- | :---- | :---- | :---- |
| Crear órdenes | Sí | Sí | Ambos reciben equipos |
| Cambiar estados | Sí | Sí | Ambos reparan |
| Ver todas las órdenes | Sí | Sí | Coordinación |
| Ver resumen de caja | Sí | No | Info financiera sensible |
| Ver estadísticas | Sí | Solo las propias | Privacidad de métricas |
| Configuración del local | Sí | No | Solo el dueño decide |
| Agregar/quitar técnicos | Sí | No | Gestión de equipo |
| Exportar datos | Sí | No | Datos sensibles |
| Eliminar órdenes | Sí | No | Prevenir errores |

**¿Cómo funciona?**

David es el dueño, crea una cuenta de técnico para su compañero. El compañero entra con su usuario y puede crear órdenes, cambiar estados, y ver todo el trabajo, pero no puede ver cuánta plata entra ni cambiar la configuración del local.

**¿Por qué genera valor?**

Fundamental para escalar. Cuando le vendas a un local con 5 empleados, no van a querer que todos vean la plata. Esta feature es lo que diferencia un SaaS amateur de uno profesional.

**FEATURE 17**

**Exportar Datos**

*Toda la info del negocio en un Excel*

| Prioridad: BAJA | Fase: Fase 3 | Impacto: Medio |
| :---- | :---- | :---- |

**¿Qué es?**

El dueño puede descargar un archivo Excel con todas las reparaciones, clientes, y montos de un período específico. Útil para contadores, impuestos, o respaldo personal.

**Detalle**

| Reporte exportable | Contenido | Formato | Uso común |
| :---- | :---- | :---- | :---- |
| Reparaciones del mes | Todas las órdenes con detalles | Excel (.xlsx) | Control mensual |
| Listado de clientes | Nombre, teléfono, visitas, gasto total | Excel (.xlsx) | Marketing, contacto |
| Resumen financiero | Ingresos por día/semana/mes | Excel (.xlsx) o PDF | Contador, impuestos |
| Historial de garantías | Reparaciones con garantía vigente/vencida | Excel (.xlsx) | Control legal |

**¿Cómo funciona?**

David necesita pasar los números al contador a fin de mes. Abre la app, toca 'Exportar', selecciona 'Enero 2026', y descarga un Excel con todas las reparaciones, montos, y clientes. Se lo manda al contador por mail. Listo.

**¿Por qué genera valor?**

Paradójicamente, la posibilidad de exportar datos hace que los usuarios confíen más en la plataforma. Saben que no están 'atrapados' y eso reduce la ansiedad de depender de un servicio externo. Resultado: se quedan más tiempo.

**FEATURE 18**

**Catálogo del Proveedor Integrado**

*Buscar repuestos sin salir de la app*

| Prioridad: BAJA | Fase: Fase 3 | Impacto: Medio |
| :---- | :---- | :---- |

**¿Qué es?**

Integración con la página del proveedor de repuestos para poder buscar disponibilidad y precios directamente desde la plataforma, sin abrir otra pestaña ni otra página.

**Detalle**

| Funcionalidad | Versión básica (Fase 3a) | Versión completa (Fase 3b) | Complejidad |
| :---- | :---- | :---- | :---- |
| Búsqueda de repuestos | Link directo a la web del proveedor | Buscador integrado en la app | Básica vs Alta |
| Precios | Ve los precios en la web del proveedor | Precios dentro de la app, actualizados | Básica vs Alta |
| Disponibilidad | Revisa en la web del proveedor | Indicador de stock en la app | Básica vs Alta |
| Pedido | Hace el pedido en la web del proveedor | Botón de pedido directo desde la app | Básica vs Alta |
| Actualización de precios | Manual (el dueño actualiza su lista) | Automática via API o scraping | Básica vs Alta |

**¿Cómo funciona?**

Versión básica: David está creando una orden y necesita un repuesto que no tiene en su lista. Toca 'Buscar en proveedor' y se abre la página del proveedor con el modelo pre-buscado. Versión completa: busca directamente dentro de la app y pide con un botón.

**¿Por qué genera valor?**

Empezá con la versión básica (link directo) que es fácil de implementar. La versión completa requiere que el proveedor tenga API o que hagas scraping, lo cual es técnicamente complejo y frágil. Dejalo para cuando ya tengas tracción.