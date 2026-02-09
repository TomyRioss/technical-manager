# Technical Manager - Project Instructions

## Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (CSS-first config, sin tailwind.config)
- shadcn/ui para componentes UI
- react-icons + lucide-react para iconos
- Prisma como ORM + Supabase como base de datos

## Estilos
- Solo usar Tailwind CSS. No CSS puro, no CSS modules, no tocar globals.css manualmente
- Usar `cn()` de `@/lib/utils` para clases condicionales
- Diseño responsivo obligatorio en todas las vistas
- UI clara e intuitiva

## Componentes
- Usar componentes de shadcn/ui. Agregar con `npx shadcn@latest add <component>`
- Iconos: react-icons y lucide-react (ya incluido por shadcn)

## Arquitectura
- Server Components por defecto
- Usar "use client" solo cuando sea estrictamente necesario (eventos, hooks, estado)
- Trabajo modular: NUNCA generar archivos de componentes mayores a 500 líneas. Extraer modales, formularios, tablas y secciones grandes en componentes separados. Evitar monolitos a toda costa

## Base de datos
- Prisma como ORM con Supabase
- NUNCA ejecutar comandos de Prisma, migraciones ni comandos que toquen la base de datos

## Investigacion
- Antes de realizar integraciones o investigaciones: leer documentacion oficial y buscar en StackOverflow, Reddit y publicaciones similares

## UX obligatoria
- SIEMPRE manejar errores en uploads y operaciones async del lado del cliente. Mostrar mensaje de error visible (rojo) al usuario. NUNCA fallar silenciosamente
- SIEMPRE validar tipos de archivo en JS antes de enviar al server (no confiar solo en el atributo `accept` del input)
- Cada acción del usuario debe tener feedback claro de éxito o error

## API Routes
- SIEMPRE loguear errores con console.error en rutas API. NUNCA silenciar excepciones con catch vacío
- Usar `Uint8Array` en lugar de `Buffer.from()` para uploads en Next.js API routes
- SIEMPRE manejar errores de Prisma en catch blocks: detectar códigos como P2002 (unique constraint), P2025 (record not found) y devolver mensajes de error claros en español al usuario. NUNCA devolver "Error del servidor" genérico cuando el error tiene una causa conocida
- Todo catch en API routes DEBE devolver mensajes descriptivos y en español (ej: "Ya existe una cuenta con ese email", "Usuario no encontrado")

## Reglas
- No ejecutar comandos destructivos de git (reset --hard, push --force, etc.)
- No hacer mas de lo pedido. Seguir requerimientos al pie de la letra
- Ser concreto y directo en cada respuesta
- NUNCA hardcodear información. Todos los datos deben ser obtenidos desde la base de datos
