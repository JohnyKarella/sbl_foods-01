# Sri Bhagyalakshmi Foods — Website

The marketing website for **Sri Bhagyalakshmi Foods (SBL)**, a Bengaluru food processing group founded in 1972 with roots going back to 1947. SBL makes dals, flours, rice, suji, flakes, spices and more.

This version ("Version B · Cinematic Scroll Story") is a light, editorial design with an ivory and ink base, wine and saffron accents, Fraunces serif headlines and animations driven by scrolling.

**Live site:** https://johnykarella.github.io/sbl_foods-01/ (once GitHub Pages is turned on, see [Deploy](#deploy))

## Pages

| Page | File | What's on it |
|---|---|---|
| Home | `index.html` | 3D product carousel, categories, the SBL journey timeline, process and markets highlights |
| About | `about.html` | Founder's legacy, leadership team, journey timeline (1947–2024), group companies |
| Products | `products.html` | Full product catalogue with filters, search and an enquiry drawer |
| Operations | `operations.html` | Sourcing, processing, quality and infrastructure |
| Markets | `markets.html` | Retail, HoReCa, institutional and export reach |
| Contact | `contact.html` | Enquiry form and office addresses |

## Features

- **Preloader** on the first visit, then **curtain transitions** between pages
- **Smooth scrolling** (Lenis) synced with **GSAP ScrollTrigger**
- **Hero:** a draggable **3D carousel of product packets** over a **WebGL "silk"** background
- **Zig-zag journey timeline** (1947–2024) that stays pinned while you scroll sideways through it, with a rolling year counter and buttons to jump to an era. It becomes a vertical timeline on phones.
- Word-by-word **text reveals**, **odometer counters** and a **clip-path image** that grows to full screen
- **Stacking process cards** (Farm → Retail / HoReCa / Exports)
- **Product catalogue** with 3D flip cards, filters, search and deep links such as `products.html#rice`
- **Custom cursor** and **magnetic buttons** (desktop only)
- **Accessible:** skip link and keyboard support. With `prefers-reduced-motion` turned on, the animations, pinning and smooth scrolling are switched off and all content stays visible.

## Project structure

```
.
├── index.html          Home page. CSS and JS are inline in this file.
├── about.html
├── products.html
├── operations.html
├── markets.html
├── contact.html
└── assets/
    ├── css/style.css   Shared styles for every page except index.html
    ├── js/app.js       Shared behaviour: preloader, transitions, scroll animations, timeline
    ├── js/shop.js      Product filters, search and enquiry drawer (products page only)
    ├── js/vendor/      GSAP 3 + ScrollTrigger and Lenis, bundled locally (no CDN)
    ├── fonts/          Fraunces and Plus Jakarta Sans (.woff2)
    └── img/            Photos, product packs, team portraits, client logos, icons
```

> **Note for editors:** `index.html` carries its own copy of the CSS and JavaScript. If you change something that appears on both the home page and other pages (such as the journey timeline or the header), update it in `index.html` **and** in `assets/css/style.css` / `assets/js/app.js`.

## Run locally

It's a plain static site, so there's nothing to install or build. You can open `index.html` directly in a browser, but a local server works best:

```bash
# from this folder
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

**GitHub Pages:** in this repo, go to **Settings → Pages**, set **Branch** to `main` and the folder to `/ (root)`, then save. The site goes live at https://johnykarella.github.io/sbl_foods-01/ within a couple of minutes.

**Any other host:** upload the folder as it is, for example to cPanel `public_html`, Netlify or Vercel.

## Forms

The site has no server, so the contact and product enquiry forms open the visitor's email app with a message to `sbaf@sblfoods.com` already filled in. To receive submissions directly instead, connect a form service such as Formspree or a backend.

## Contact

**Sri Bhagyalakshmi Agro Foods Pvt. Ltd.**
#321/A, Opp. BHEL, Mysore Road, Bengaluru 560039
+91-80-26741561 · sbaf@sblfoods.com

© Sri Bhagyalakshmi Foods. All rights reserved.
