# Sri Bhagyalakshmi Foods — Website (Version B · Cinematic Scroll Story)

A light, editorial take on the SBL Foods site: ivory and ink base, wine and saffron accents, Fraunces serif headlines and scroll-driven storytelling.

## Motion & 3D features
- **Preloader** with counting number on first visit, then **page-transition curtains** between pages
- **Smooth scrolling** (Lenis) synced with **GSAP ScrollTrigger**
- **Hero:** draggable **3D carousel of real product packets** (CSS 3D, responds to drag, arrow keys, mouse tilt and scroll speed) over a **WebGL "silk" shader** background
- Word-by-word **split-text reveals**, **scroll-filled manifesto text**, **odometer counters**
- **Hover-expand category accordion**
- **Pinned horizontal timeline** (1947–2024) with live year indicator (swipeable on mobile)
- **Clip-path image reveal** that expands to full screen while pinned
- **Stacking process cards** (Farm → Retail/HoReCa/Exports)
- **3D flip product cards**, filters, search, deep links (`products.html#rice` etc.) and a **slide-in enquiry drawer**
- **Velocity marquees** that speed up and skew with scrolling
- **Custom cursor** with context labels and **magnetic buttons** (desktop only)
- Leadership list with a **cursor-following photo**, footer **giant wordmark** reveal

## Pages
index · about · products · operations · markets · contact

## Run / deploy
Upload the folder to any host (cPanel/Bluehost `public_html`, Netlify, Vercel…). No build step.
Local preview: `python3 -m http.server` in this folder, then open http://localhost:8000.

## Notes
- Forms open the visitor's email app pre-filled to `sbaf@sblfoods.com` (static site). Connect a backend or Formspree to receive submissions directly.
- `prefers-reduced-motion` disables smooth scroll, pinning and animations; all content stays visible.
- Libraries are bundled locally in `assets/js/vendor/` (GSAP 3.15 + ScrollTrigger, Lenis 1.3). No CDN needed.
