# MercaAndes Documentation

Sitio de documentación de MercaAndes (Docusaurus). Incluye tema claro/oscuro e
interfaz en inglés y español.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run start
```

Abre el sitio en inglés con recarga en vivo.

> Docusaurus solo levanta un idioma en el servidor de desarrollo. Si abres
> `/es/` con `npm run start`, verás "Page Not Found". Para editar el español:

```bash
npm run start:es
```

## Ver ambos idiomas

```bash
npm run preview
```

Este comando compila el sitio y lo sirve en `http://localhost:3001/MercaAndes_Documentation/`.
El inglés está en la raíz y el español en `/es/`. También puedes hacerlo por
separado con `npm run build` y `npm run serve`.

## Compilar

```bash
npm run build
```

Genera el sitio estático en la carpeta `build`.
