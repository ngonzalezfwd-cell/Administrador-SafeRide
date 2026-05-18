# 🤖 Manual Operativo: Orquestador de Quejas SafeRide (IA Powered)

Este documento detalla el funcionamiento técnico, mantenimiento y resolución de problemas del Agente de Sincronización de quejas de SafeRide.

---

## 1. Arquitectura del Flujo
El sistema funciona como un **Orquestador Autónomo** sin tocar el backend principal de Node.js:
1. **Origen**: El pasajero envía un correo a `saferidefwd@gmail.com`.
2. **Activación**: Se ejecuta el script `sync_complaints.cjs` (vía `npm run sync-complaints`).
3. **Cerebro (IA)**: El script envía el contenido a **Google Gemini 1.5 Flash**.
4. **Procesamiento**: La IA extrae: Categoría, TripID, Asunto y un resumen ejecutivo.
5. **Persistencia**: Se guarda en `src/data/complaints.json`.
6. **Visualización**: El Admin Panel (React) detecta el cambio y actualiza la tabla automáticamente.

---

## 2. Gestión de Credenciales (Archivo `.env`)
Si el sistema deja de sincronizar, lo primero es revisar el archivo `.env` en la raíz del proyecto.

| Variable | Descripción | Dónde conseguirla |
| :--- | :--- | :--- |
| `SUPPORT_EMAIL` | Correo de soporte de SafeRide | `saferidefwd@gmail.com` |
| `SUPPORT_EMAIL_PASSWORD` | Contraseña de Aplicación de 16 letras | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `GEMINI_API_KEY` | Llave de Inteligencia Artificial | [Google AI Studio](https://aistudio.google.com/) |

---

## 3. Resolución de Problemas (Troubleshooting)

### ❌ Error: "Invalid credentials (Failure)"
**Causa:** Google revocó la contraseña de aplicación o el IMAP está desactivado.
**Solución:**
1. Entra a Gmail -> Configuración -> Reenvío y correo POP/IMAP -> Asegúrate que **"Habilitar IMAP"** esté activo.
2. Si el error persiste, borra la contraseña de aplicación anterior en Google y crea una nueva.
3. **Importante:** La contraseña en el `.env` debe ir **sin espacios** (ej: `xtppwvgvuexpoznk`).

### ❌ Error: "API_KEY_INVALID" o Quota Exceeded
**Causa:** La Gemini API Key falló o se alcanzó el límite gratuito.
**Solución:** Genera una nueva API Key en Google AI Studio y actualiza el `.env`.

### ❌ Error: "ReferenceError: require is not defined"
**Causa:** Se intentó correr el script con extensión `.js` en un proyecto de tipo ESM.
**Solución:** Asegúrate de que el script tenga la extensión `.cjs` y ejecútalo siempre con `npm run sync-complaints`.

---

## 4. Mantenimiento de Datos
El archivo `src/data/complaints.json` guarda el historial. 
* **Si el panel se vuelve lento:** Abre el archivo JSON y borra los registros antiguos (deja solo los últimos 50).
* **Backup:** Antes de borrar, puedes copiar el contenido a un archivo `.txt` como respaldo histórico.

---

## 5. Comandos Rápidos
* **Sincronizar ahora:** `npm run sync-complaints`
* **Modo Desarrollo:** `npm run dev`

---
**Desarrollado por Antigravity (Google DeepMind Team) para SafeRide.**

--- COMO FUNCIONA

Sincronización Total: Cada vez que ejecutas el agente, el Admin Panel se "limpia" y se llena únicamente con lo que está sin leer en tu Gmail.
Gmail es el Control Remoto:
Si tienes 5 correos sin leer, verás 5 quejas en el Panel.
Si vas a tu Gmail y marcas 3 como "Leídos", la próxima vez que sincronices, el Panel solo mostrará las 2 restantes.
Sin Basura: El archivo complaints.json ya no crecerá eternamente; solo guardará lo que tengas pendiente de atender.
Pruébalo ahora mismo:
Marca un par de correos como "Leídos" en tu Gmail.
Ejecuta: npm run sync-complaints
Mira cómo tu Admin Panel se actualiza y solo te muestra lo que realmente tienes pendiente.
Este es el flujo de trabajo más eficiente para un administrador, ya que usas las herramientas que ya conoces para gestionar el estado de las tareas