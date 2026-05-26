# AutoPracticas

Aplicacion web para administrar respuestas de empresas sobre practicas o pasantias, capturar correos desde Gmail u Outlook Web, extraer datos relevantes y exportar registros a Excel.

La version publicada esta disponible en:

[https://harmonious-crostata-ba20e7.netlify.app/](https://harmonious-crostata-ba20e7.netlify.app/)

## Funciones principales

- Registro e inicio de sesion local en el navegador.
- Bandeja para importar, revisar y procesar correos de empresas.
- Extension de Chrome/Edge para capturar correos desde Gmail y Outlook Web.
- Extraccion de informacion con regex por defecto y opcion de IA con API key propia.
- Gestion de grupos, plantillas, estados y datos de contacto.
- Exportacion a Excel.
- Modo claro/oscuro y almacenamiento persistente en `localStorage`.

## Usar la app publicada

1. Abre [AutoPracticas en Netlify](https://harmonious-crostata-ba20e7.netlify.app/).
2. Crea tu usuario, contrasena y palabra secreta de recuperacion.
3. Carga la extension del navegador si quieres capturar correos directamente.
4. Configura una API key en `Configuracion > IA` solo si quieres mejorar la extraccion automatica.

Importante: los datos se guardan en el navegador que uses. Si abres la app en otra computadora, otro navegador o modo incognito, tendras una base de datos local distinta.

## Instalacion local

Requisitos:

- Node.js 20 o superior.
- npm.

Instalacion manual:

```bash
npm install
npm run dev
```

La app local abre en `http://localhost:5173`.

En Windows tambien puedes usar:

- `INICIAR.bat`: instala dependencias si hace falta e inicia la app.
- `CREAR_ACCESO_DIRECTO.bat`: crea un acceso directo en el escritorio.
- `INICIAR_SILENCIOSO.vbs`: ejecuta el lanzador sin mostrar una ventana permanente.

## Compilar

```bash
npm run build
```

El resultado queda en `dist/`. Este proyecto usa `vite-plugin-singlefile`, por lo que la compilacion genera una app estatica lista para Netlify u otro hosting de archivos estaticos.

Para probar la compilacion localmente:

```bash
npm run preview
```

## Deploy en Netlify

El archivo `netlify.toml` ya deja configurado el deploy:

- Build command: `npm run build`
- Publish directory: `dist`

Pasos recomendados:

1. Sube el repositorio a GitHub.
2. En Netlify, selecciona `Add new site > Import an existing project`.
3. Conecta el repositorio.
4. Verifica que Netlify detecte `npm run build` y `dist`.
5. Publica el sitio.

No subas `node_modules/`, `dist/`, `.env`, `.netlify/` ni archivos `.zip`; ya estan ignorados en `.gitignore`.

## Extension del navegador

La carpeta `extension/` contiene una extension Manifest V3 para Chrome y Edge.

Instalacion:

1. Abre `chrome://extensions/` o `edge://extensions/`.
2. Activa `Modo de desarrollador`.
3. Haz clic en `Cargar descomprimida`.
4. Selecciona la carpeta `extension/`.

Uso:

1. Abre un correo en Gmail u Outlook Web.
2. Haz clic en el boton flotante `Capturar`.
3. Abre AutoPracticas.
4. Entra en `Bandeja de Correos`.
5. Usa la sincronizacion con la extension o importa el JSON copiado desde el popup.

La extension esta preparada para funcionar con:

- `http://localhost:5173`
- `http://localhost:4173`
- Sitios `*.netlify.app`
- Sitios `*.vercel.app`
- Gmail y Outlook Web

## Configuracion de IA

La app puede funcionar sin IA usando patrones de texto. Para mejor precision puedes activar un proveedor en `Configuracion > IA`.

Actualmente el servicio implementado soporta:

- Groq
- DeepSeek
- Sin IA

Cada usuario debe usar su propia API key. Las claves se cifran con Web Crypto usando la contrasena de acceso y se guardan en `localStorage`; no se deben escribir claves privadas dentro del codigo fuente.

## Privacidad y datos

- No hay base de datos remota incluida en este proyecto.
- Los registros, correos, grupos, plantillas, usuario y configuracion se guardan localmente en el navegador.
- Las API keys, si se configuran, se guardan cifradas en el mismo navegador.
- Si borras datos del navegador, cambias de navegador o usas otro equipo, los datos locales no se trasladan automaticamente.
- Para reiniciar la app: `Configuracion > Cuenta > Restablecer datos`.

## Estructura

```text
.
├── extension/              # Extension de navegador
├── src/
│   ├── components/         # Componentes React
│   ├── data/               # Datos iniciales
│   ├── services/           # Auth, cifrado e IA
│   ├── store/              # Estado y persistencia local
│   ├── App.tsx             # App principal
│   ├── main.tsx            # Entrada React
│   └── types.ts            # Tipos compartidos
├── index.html
├── netlify.toml
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## Preparar para GitHub

Antes de publicar:

```bash
npm run typecheck
npm run build
```

Revisa que no existan claves privadas en el codigo:

```bash
rg "api[_-]?key|secret|token|sk-|gsk_" src extension
```

Despues puedes inicializar el repositorio, crear el primer commit y subirlo:

```bash
git init
git add .
git commit -m "Initial AutoPracticas web app"
git branch -M main
git remote add origin <URL_DEL_REPOSITORIO>
git push -u origin main
```

## Nota de seguridad

`xlsx` reporta una vulnerabilidad conocida en `npm audit` y no hay parche oficial publicado para esa version. Para un entorno con requisitos estrictos de seguridad, considera reemplazarlo por `exceljs` o exportar CSV.
