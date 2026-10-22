# Seguridad de Senderos

## Cómo reportar un problema

No abras un issue público con datos personales, credenciales ni detalles de
explotación. Usá **Security → Report a vulnerability** en este repositorio (si
está habilitado) o escribí a **modernizacion.munigm@gmail.com**.

## Alcance

- El sitio publicado en GitHub Pages (`main`).
- La app React + Vite de `app/`.
- El Web App de Apps Script (`apps-script/Code.gs`) y la planilla privada.
- No incluye Google Workspace, GitHub ni servicios de terceros.

## Reglas del proyecto

- La planilla y el formulario son **privados**. La app sólo habla con el Web
  App de Apps Script.
- El ranking público devuelve el **primer nombre completo y la inicial de cada
  palabra siguiente** (`Daniela Pérez` → `Daniela P.`; `Daniela Pérez Gómez` →
  `Daniela P. G.`), sendero, tiempo, categoría, fecha y sólo los
  **comentarios aprobados**. **Nunca** devuelve emails ni teléfonos.
- El **email** es opcional y se guarda en una columna interna para verificar
  identidad si alguien pide una baja. No se publica.
- No commitear `.env`, claves, tokens ni datos personales.
- Los comentarios se guardan en la planilla; sólo se publican si Modernización
  tilda **Comentario aprobado** en esa fila.
- Los menores aparecen con el nombre y la inicial del apellido, con autorización
  de un adulto responsable (se informa en el consentimiento y el aviso de
  privacidad).

## Antes de publicar

1. `npm run lint` y `npm run build` en `app/`.
2. Confirmar que la planilla no esté publicada como CSV.
3. Confirmar que el formulario de Google no acepte respuestas.
4. Probar el ranking y un alta de punta a punta.
5. Revisar que el build no tenga `2PACX`, `docs.google.com/forms` ni `entry.`.
6. Confirmar que el ranking no devuelva comentarios sin aprobar ni emails.

## Historial

Si se commiteó algo sensible por error, no alcanza con borrarlo: hay que
rotarlo y limpiar el historial con `git filter-repo` o BFG. Avisar antes de
reescribir historia.
