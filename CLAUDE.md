# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Publiser MX** — a static landing page for an advertising monitoring company in Mexico. No build step or package manager. Open `index.html` directly in a browser or serve it with any static HTTP server.

```bash
# Serve locally (Python)
python -m http.server 8080

# Or with PHP (needed to test the contact form)
php -S localhost:8080
```

## Architecture

| File | Role |
|------|------|
| `index.html` | Single-page layout — all sections live here (hero, servicios, casos, contacto, blog, footer) |
| `styles.css` | Full design system — CSS custom properties at `:root`, then component blocks |
| `main.js` | Vanilla JS IIFE — scroll effects, nav highlight, mobile hamburger, intersection-observer reveals, stat counters, testimonial carousel, contact form submit |
| `submit.php` | Contact form backend — validates input, rate-limits by IP (5/10 min), inserts into MySQL |
| `config.php` | DB credentials + `ALLOWED_ORIGIN` constant — **must stay out of public web root in production** |
| `uploads/` | Static images served directly |
| `fonts/` | Self-hosted Google Fonts (`google-fonts.css` + `.woff2` files) |
| `libs/lucide.min.js` | Bundled Lucide icons (no CDN dependency) |

## CSS Design System

All design tokens are CSS variables in `:root` inside `styles.css`:
- Brand colors: `--blue-600` (#0052CC) and `--orange-500` (#FF6B00)
- Dark palette: `--dark-900` → `--dark-400`
- Gradients: `--gradient-brand`, `--gradient-dark`, `--gradient-blue`
- Border radius scale: `--radius-sm/md/lg/xl`
- Shadows: `--shadow-sm/md/lg/shadow-glow`
- Single transition token: `--transition`

## JS Patterns

- All JS is one IIFE in `main.js` — no modules, no bundler.
- Scroll-triggered animations use `data-aos` + `data-delay` attributes on HTML elements; `IntersectionObserver` adds the `.visible` class.
- The contact form (`#contactForm`) POSTs JSON to `submit.php` and expects `{ ok: true }` or `{ ok: false, errors: [...] }`.
- Client-side validation mirrors server-side rules (field `LIMITS` object, `INJECTION` regex, email/tel format).

## Backend (submit.php)

- PHP 7.4+ with strict types, PDO with `ATTR_EMULATE_PREPARES: false` (real prepared statements).
- Rate limit state stored as JSON files in `sys_get_temp_dir()`.
- `config.php` defines DB constants and `ALLOWED_ORIGIN` for CORS — change `ALLOWED_ORIGIN` when deploying.
- DB table: `clientes(nombre, apellido, empresa, correo, telefono, servicio, mensaje)`.

## Branches

- `main` — production-ready code
- `dev` — integration branch
- `feature/landing-page` — current active feature branch
