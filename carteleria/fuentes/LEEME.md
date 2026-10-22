# Tipografías del sistema Senderos

Las dos familias que usa toda la cartelería (y la app). Son **libres** (SIL Open
Font License 1.1): se pueden usar, modificar y redistribuir sin pagar licencia.
Las licencias completas están en `OFL-SpaceGrotesk.txt` y `OFL-Inter.txt`.

| Archivo | Familia | Peso | Dónde se usa |
|---|---|---|---|
| `space-grotesk-v22-latin-600.ttf` | Space Grotesk | 600 (semibold) | Etiquetas y bajadas en mayúscula |
| `space-grotesk-v22-latin-700.ttf` | Space Grotesk | 700 (bold) | Títulos, nombres de sendero, números |
| `inter-v20-latin-regular.ttf` | Inter | 400 | Texto corrido, descripciones |
| `inter-v20-latin-500.ttf` | Inter | 500 | Datos (distancias, desniveles) |
| `inter-v20-latin-600.ttf` | Inter | 600 | Texto destacado |

Son las que usa `carteleria/mockups.html` y las que el generador
(`carteleria/herramientas/generar-imprenta.js`) usa para **convertir el texto a
curvas** en los SVG de `carteleria/imprenta/`. Por eso los archivos de imprenta
**no dependen de que estas fuentes estén instaladas**; están acá por si hay que
rehacer o reimprimir algún texto suelto.

Vienen del subconjunto **latino** (incluye acentos, ñ, ¿, ¡, ·), que es todo lo que
necesita la cartelería. Las bajó el script desde
[google-webfonts-helper](https://gwfh.mranftl.com/fonts) el 19/10/2026;
las versiones originales están en [Google Fonts](https://fonts.google.com).
