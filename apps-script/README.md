# API de Senderos en Apps Script

La planilla y el formulario quedan **privados**. La app habla con este Web App,
que devuelve sólo datos sanitizados y valida las altas.

> El proyecto de Apps Script **no vive en el repo**. Vive dentro de la planilla
> de Google. `apps-script/Code.gs` es la copia fuente que se pega en el editor
> de la planilla; no hay que “instalarlo” desde GitHub.

## Qué hace

| Acción | Para qué |
|---|---|
| `GET ?action=rankings&callback=...` | Ranking público del mes: primer nombre completo y la inicial de cada palabra siguiente (ej. `Daniela P.`; con dos apellidos, `Daniela P. G.`), sendero, tiempo, categoría, fecha y **sólo los comentarios aprobados**. Sin email. |
| `GET ?action=challenge&callback=...` | Desafío anti-bot de un solo uso (suma simple). |
| `POST action=submit` | Valida y agrega una marca a la planilla privada. |

## Instalación

1. Abrí la **planilla de respuestas** con la cuenta dueña (no el formulario).
   Si estás en el formulario, andá a **Respuestas → Ver en Hojas de cálculo**.
2. **Extensiones → Apps Script**. Se abre un proyecto nuevo asociado a esa
   planilla. Ponele un nombre, por ejemplo `Senderos API`.
3. En el editor, seleccioná todo el contenido de `Código.gs`, borralo y pegá
   todo el contenido de `apps-script/Code.gs`.
4. Guardá y ejecutá `setup` una vez. Autorizá los permisos. Si la hoja de
   respuestas no es la primera pestaña, poné su nombre exacto en `SHEET_NAME`
   (arriba de `Code.gs`). `setup` agrega las columnas **Categoría**,
   **Comentario aprobado** y **Email** si faltan, y pone las casillas de
   moderación en **Comentario aprobado**.
5. Ejecutá `selftest`. Tiene que mostrar `selftest OK` en el registro.
6. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona**.
   - Implementar y copiar la URL (`https://script.google.com/macros/s/.../exec`).
7. Pegá esa URL en `app/src/api.ts`, reemplazando `REEMPLAZAR` en
   `API_URL_FALLBACK`, o compilá con `VITE_SENDEROS_API` definida.
8. En Google Forms, **Respuestas → No aceptar respuestas**. El formulario ya no
   se usa para altas; queda como respaldo interno.
9. En la planilla, **Archivo → Compartir → Publicar en la web → Detener
   publicación**. Esto es obligatorio: si el CSV sigue publicado, la URL vieja
   sigue exponiendo nombres y comentarios aunque la app ya no la use.
10. Probá el ranking en el navegador:
    `https://script.google.com/macros/s/.../exec?action=rankings&callback=probar`
    tiene que devolver `probar([...]);` sin emails ni comentarios sin aprobar.
11. Si más adelante editás `Code.gs`, no crees otra URL: **Implementar →
    Gestionar implementaciones → editar → Nueva versión**. Si no, el Web App
    sigue sirviendo la versión vieja.

### Si no aparece “Extensiones → Apps Script”

- Asegurate de estar en la **planilla**, no en el formulario ni en una vista
  publicada.
- La cuenta tiene que ser **dueña o editora** del archivo.
- Si la planilla es un `.xlsx` importado, convertila a Hoja de cálculo de Google.
- Alternativa: creá el proyecto desde `script.google.com` (Nuevo proyecto),
  pegá `Code.gs`, y completá `SPREADSHEET_ID` con el ID de la planilla (la parte
  entre `/d/` y `/edit` en la URL). En ese caso `SHEET_NAME` tiene que ser el
  nombre exacto de la pestaña de respuestas. Un proyecto independiente no puede
  usar `getActiveSpreadsheet()`.

## Moderación de comentarios

1. Abrí la planilla privada y mirá la columna **Comentarios**.
2. Si el comentario se puede publicar, tildá la casilla de **Comentario
   aprobado** en esa misma fila. Si no, dejala destildada.
3. El ranking se actualiza solo en un minuto como máximo (caché de 60 s). Si
   acabás de cargar una marca, el POST ya limpia la caché del mes.
4. Los comentarios viejos también arrancan **sin aprobar**: hay que revisarlos
   antes de que aparezcan en la web.
5. El **Email** es opcional y queda sólo para uso interno (verificar identidad
   si alguien pide una baja). Nunca se devuelve en el ranking.
6. Para una baja, buscá la fila por nombre y fecha, verificá que el pedido venga
   del email cargado y borrá la fila (o el comentario) desde la planilla. No hay
   endpoint público de borrado.

## Ranking por mes

El ranking público muestra **sólo el mes calendario actual**, según la fecha del
recorrido. La planilla conserva todos los meses. La tabla histórica de primeros
puestos y el resumen anual quedan para implementar más adelante.

## Seguridad

- La URL del Web App es pública por diseño: el navegador necesita llamarla.
  Lo privado es la planilla, no la URL.
- El ranking devuelve el **primer nombre completo y la inicial de cada palabra
  siguiente** (`Daniela Pérez` → `Daniela P.`; `Daniela Pérez Gómez` →
  `Daniela P. G.`), también para menores. El formulario avisa que se publica así
  y pide autorización del adulto responsable para menores.
- El **comentario** se guarda siempre en la planilla, pero sólo se devuelve si
  la casilla **Comentario aprobado** está tildada por Modernización.
- El **email** es opcional, se guarda en la columna interna **Email** y nunca se
  devuelve en el ranking. Sirve para verificar identidad si alguien pide borrar
  un tiempo o un comentario.
- Cada alta valida: nombre, sendero, categoría, tiempo (1 min a 12 h), fecha
  (últimos 2 años), hora, longitud del comentario, email si viene y fórmulas de
  hoja de cálculo.
- Anti-abuso: captcha con nonce de un solo uso, honeypot, tiempo mínimo de
  completado, deduplicación y límites por dispositivo/nombre/hora.
- Los envíos sin señal (`queued=1`) no usan captcha porque se resuelven cuando
  vuelve la conexión; igual pasan por validación, deduplicación y límites. Es un
  compromiso: alguien podría declarar `queued=1` para saltear la suma. Por eso
  la defensa real son los límites y la deduplicación, no el captcha.

## Límites conocidos de Apps Script

- No se puede leer la IP del visitante. El límite por dispositivo usa un ID
  anónimo guardado en el navegador; un atacante puede rotarlo.
- `CacheService` dura como máximo 6 horas, así que los límites son ventanas,
  no cuotas diarias exactas.
- Si el volumen crece, el siguiente paso es un Worker/backend real con WAF.
  Para el uso actual (ranking municipal de bajo tráfico) alcanza.
