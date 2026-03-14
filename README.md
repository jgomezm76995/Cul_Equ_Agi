# Asistente Conversacional de Transporte Especial en Bogotá (MVP)

MVP en WhatsApp para atención inicial de usuarios que necesitan transporte especial en Bogotá.

El bot está construido con:

- BuilderBot
- TypeScript
- Provider Baileys
- Memoria en `MemoryDB`

El objetivo del MVP es orientar al usuario en el primer contacto: explicar el servicio, responder preguntas frecuentes, capturar una pre-solicitud y dejar claro que la confirmación final depende de revisión humana.

---

## Qué resuelve este MVP

- Bienvenida y menú principal de opciones
- Información básica del servicio y su alcance
- Respuestas a preguntas frecuentes
- Captura guiada de pre-solicitud (datos mínimos)
- Derivación a atención humana / revisión posterior
- Comandos de navegación (`menu`, `salir`, etc.)

---

## Alcance (y límites)

Incluye únicamente la etapa de atención inicial conversacional.

No incluye:

- pagos
- despacho real
- geolocalización/mapas
- CRM o integraciones empresariales
- autenticación de usuarios
- base de datos persistente

---

## Estructura principal

```text
src/
  app.ts
  flows/
    welcome.flow.ts
    service-info.flow.ts
    faq.flow.ts
    pre-request.flow.ts
    human-handoff.flow.ts
    goodbye.flow.ts
    shared/
      navigation.ts
  utils/
    conversation-logger.ts
```

- `app.ts` ensambla flujos, provider, DB y endpoints.
- `src/flows/` contiene la lógica conversacional por responsabilidad.
- `conversation-logger.ts` imprime conversación por contacto con colores.

---

## Requisitos

- Node.js 22+
- pnpm 10+
- Cuenta de WhatsApp para vincular por QR

---

## Variables de entorno

Usa `.env` (puedes partir de `.env.example`):

```env
PORT=3008
USE_PAIRING_CODE=false
PHONE_NUMBER=573156789900
```

Notas:

- Para flujo QR recomendado: `USE_PAIRING_CODE=false`.
- `PHONE_NUMBER` se mantiene como ejemplo anonimizado.

---

## Ejecución local

Instalar dependencias:

```bash
pnpm install
```

Desarrollo (lint + nodemon):

```bash
pnpm run dev
```

Build:

```bash
pnpm run build
```

---

## Cómo probar rápido

1. Ejecuta `pnpm run dev`.
2. Escanea el QR cuando aparezca `⚡⚡ ACTION REQUIRED ⚡⚡`.
3. Escribe por WhatsApp:
   - `hola`
   - `1` / `info`
   - `2` / `faq`
   - `3` / `solicitar`
   - `4` / `humano`
   - `menu`
   - `salir`

Endpoints expuestos:

- `POST /v1/messages`
- `POST /v1/register`
- `POST /v1/samples`
- `POST /v1/blacklist`
- `GET /v1/blacklist/list`

---

## CI / GitHub Actions

Hay dos workflows:

- `lint.yml`
- `build.yml`

Ambos corren en `push` a `main` y `dev`, y en `pull_request` hacia `main`.

---

## Rama de trabajo

El desarrollo se realiza sobre `dev`.

Flujo sugerido:

1. trabajar en `dev`
2. validar CI
3. abrir Pull Request a `main`

---

## Equipo

- Juan Fernando Gómez Mayorca
- Armando José Laguna Herrera
- Néstor Mauricio Díaz Muñoz
- Rubén Enrique Cabarcas Mendoza
- Rodrigo Alejandro Medina Pulido

Docente: Mauricio Javier Guerrero Cabarcas