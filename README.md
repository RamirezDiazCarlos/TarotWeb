# Luz de Arcanos — Consultas de Tarot con IA

Aplicación web de lecturas de tarot personalizadas generadas en tiempo real por inteligencia artificial. El usuario ingresa su nombre y consulta, se revelan tres cartas animadas (pasado, presente y futuro), y la IA interpreta la tirada en lenguaje natural.

**[→ Ver demo en vivo](https://luzdearcanos.vercel.app/)**

---

## Qué se construyó

- Integración con **Google Gemini 2.5 Flash** para generar lecturas únicas en cada consulta
- Animaciones 3D de volteo de cartas con CSS puro (`transform-style: preserve-3d`)
- Video en loop como fondo, con overlay y diseño completamente responsivo
- Las cartas aparecen mientras la IA procesa la respuesta
- El texto de la lectura aparece párrafo por párrafo con fade-in escalonado
- Límite de 5 consultas por día por usuario via `localStorage`
- Fallback automático entre modelos de Gemini ante errores de cuota (429)
- SEO completo: Open Graph, Twitter Card, JSON-LD Schema.org, canonical, favicons para todos los dispositivos

## Stack

| Tecnología                                 | Uso                                 |
| ------------------------------------------ | ----------------------------------- |
| [Astro 5](https://astro.build)             | Framework — SSR con Server Actions  |
| [Google Gemini API](https://ai.google.dev) | Generación de lecturas con IA       |
| [Vercel](https://vercel.com)               | Deploy con adapter SSR              |
| TypeScript                                 | Tipado en acciones y componentes    |
| CSS puro                                   | Animaciones 3D, layout, tema visual |

## Correr el proyecto

```bash
bun install
bun dev
```

Requiere una variable de entorno `GEMINI_API_KEY` de [Google AI Studio](https://aistudio.google.com).

---
