# AutoPracticas - Extension de navegador

Extension Manifest V3 para capturar correos de empresas desde Gmail y Outlook Web y enviarlos a AutoPracticas.

## Instalacion

1. Abre `chrome://extensions/` o `edge://extensions/`.
2. Activa `Modo de desarrollador`.
3. Haz clic en `Cargar descomprimida`.
4. Selecciona esta carpeta: `extension/`.
5. Fija la extension en la barra del navegador para tenerla a mano.

Los iconos PNG ya estan incluidos. El archivo `icons/generate-icons.html` queda solo como utilidad si necesitas regenerarlos.

## Sitios compatibles

Correos:

- Outlook Web: `https://outlook.office.com/*`
- Outlook 365: `https://outlook.office365.com/*`
- Outlook Live: `https://outlook.live.com/*`
- Gmail: `https://mail.google.com/*`

Aplicacion:

- `http://localhost:5173/*`
- `http://localhost:4173/*`
- `https://*.netlify.app/*`
- `https://*.vercel.app/*`

La app publicada actual es:

[https://harmonious-crostata-ba20e7.netlify.app/](https://harmonious-crostata-ba20e7.netlify.app/)

## Uso

1. Abre un correo en Gmail u Outlook Web.
2. Haz clic en el boton flotante `Capturar`.
3. Repite el proceso con los correos que necesites.
4. Abre AutoPracticas.
5. En `Bandeja de Correos`, importa o sincroniza los correos capturados.

Tambien puedes abrir el popup de la extension y usar `Copiar Todo` para pegar el JSON manualmente en la app.

## Privacidad

- Los correos capturados se guardan en `chrome.storage.local`.
- La extension no envia datos a servidores propios.
- El usuario decide cuando importar o copiar los correos hacia la app.
- Puedes borrar correos capturados desde el popup de la extension.

## Solucion de problemas

Si no aparece el boton `Capturar`:

- Verifica que la extension este activada.
- Recarga Gmail u Outlook Web.
- Asegurate de tener un correo abierto, no solo la lista.
- Revisa que el sitio este incluido en `manifest.json`.

Si la app no recibe correos:

- Confirma que estas usando la app en Netlify, Vercel, `localhost:5173` o `localhost:4173`.
- Recarga la app despues de instalar o actualizar la extension.
- Usa `Copiar Todo` como alternativa manual.
