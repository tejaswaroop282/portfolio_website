# The Kingdom of Code

An explorable, scroll-driven 3D medieval-fantasy portfolio for **Tejaswaroop Reddy Yanamala**.
A hooded explorer walks through five locations as you scroll; each location holds one part of the story.

| # | Location | Section | What is in it |
|---|----------|---------|----------------|
| 1 | The King's Landing | Home | Courtyard, keep, great gate, hero introduction |
| 2 | The Enchanted Forest | Skills | Six glowing standing stones (skill groups), ruins, a bridge |
| 3 | The Citadel | Projects | Library + workshop; five projects as tomes on lecterns |
| 4 | The Hall of Achievements | Journey | Education, internship, certification, DSA milestone as artifacts |
| 5 | The Northern Gate | Contact | Sunset gate; the doors open at the end of the scroll |

Stack: React 19 · Vite · JavaScript · Tailwind CSS (preflight/theme) · Three.js · React Three Fiber · Drei · GSAP + ScrollTrigger.
No backend, no external 3D assets: it is a static site (deploys to Vercel as-is).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview
```

Deploy: import the repo in Vercel (framework preset "Vite"; build `npm run build`, output `dist`). `vercel.json` is included.

## How the journey works

* `animations/scrollController.js` — GSAP **ScrollTrigger** turns page scroll into `world.target` (0..1). The 3D scene never reads the DOM.
* `world/journey.js` — maps scroll → position along the path with **plateaus** (the explorer slows and stops to appreciate a place) and lists the contextual animation for each stop.
* `world/WorldPath.js` — one Catmull-Rom curve through 22 waypoints; arc-length parameterised so speed is uniform.
* `world/Character.jsx` — owns the per-frame step: eases towards the target at ≤7.5 m/s, faces the direction of travel, derives walking speed from real movement and cross-fades **idle / walk / look / point / interact / celebrate** (`animations/characterAnimations.js`).
* `world/Camera.jsx` + `animations/cameraAnimations.js` — third-person orbit camera driven by profiles keyed to the path (no cuts; everything is damped).
* Navigation (`HOME · SKILLS · PROJECTS · JOURNEY · CONTACT`) never teleports: it scrolls the page and the explorer **sprints** along the path (26 m/s) to catch up.
* `world/envProfiles.js` — fog, sky, light and torch colour interpolate as you travel (overcast → green forest → candle-lit citadel → golden hall → sunset).

### Two layers
* **Layer A (world):** `src/world/*` (R3F).
* **Layer B (information):** `src/components/*`. The key facts of each place are always visible in a card (no need to click 3D objects); clicking a 3D object, or its row in the card, opens the same parchment panel.

### Fallbacks and accessibility
* **Classic view** (`components/ClassicView.jsx`): every fact on the site as a plain readable page. Used automatically when `prefers-reduced-motion` is on, when WebGL is unavailable or the context is lost, or when a render error occurs; also available from the nav ("Classic view"). The 3D code is a lazy chunk and is never downloaded in classic view.
* **Mobile / low-memory:** "lite" 3D — no shadows, lower pixel ratio, fewer trees/particles, bottom navigation bar, bottom-sheet cards.
* Skip: the loading screen has "Skip intro"; any scroll/key also ends the camera sweep. Panels trap focus, close on Esc, and nothing autoplays. **No audio** is implemented (nothing to mute).

## Content: where each fact comes from

All copy lives in `src/data/*` and is traceable to the resume PDF or a repository README:

* `profile.js` — name, links (GitHub, LinkedIn, LeetCode and e-mail were read from the resume PDF's link annotations).
* `skills.js` — only skills listed in the resume or used in a README; **no percentages**.
* `projects.js` — CareerPilot, PayBridge AI, CivicConnect, DevPilot AI, Cache Replacement Policy Simulator (+ three "archive" links). `live: null` means no verified public URL, so no button is shown.
* `achievements.js` — education, internship, AWS Certified AI Practitioner, DSA milestone. Two certifications that appear only on the GitHub profile README (MongoDB Associate Developer, Oracle Java SE 17) are kept in `unverified` and **not displayed**.

## Known gaps / things to confirm (see the end of the assistant's report)

* Public URLs for CareerPilot and PayBridge AI (none found) — add as `live:` in `data/projects.js`.
* Several numbers differ between the resume and the repository READMEs (PayBridge tests, CareerPilot evaluation sets, cache-simulator hit rates). The site shows the **README** figures; update the resume or the data file so they agree.
* The "Why it exists" text is drafted from each README, not from your own motivation — rewrite it in your voice if you like.
* The resume's "Live Demo" link is the placeholder `https://your-live-demo-link`; the CivicConnect button uses the Vercel URL from the repository's homepage field.

## Assets and licences

There are **no third-party 3D models, textures or audio**. The explorer, buildings, trees and textures are generated in code (canvas textures, primitive geometry). Fonts: Cinzel, Inter and JetBrains Mono (SIL OFL) from Google Fonts. To replace the explorer with a rigged Mixamo/GLB model, swap the contents of `Character.jsx`'s joint hierarchy and map the six animation names to `AnimationMixer` clips (see the header comment in `animations/characterAnimations.js`).

## Structure

```
src/
  components/   Navbar, LoadingScreen, Overlay, InfoPanel, SkillPanel, ProjectPanel,
                AchievementPanel, ContactPanel, ArchDiagram, ClassicView, Icons
  world/        World, Environment, Character, Camera, WorldPath, journey, envProfiles,
                terrain, materials, primitives, InteractiveObjects, Locations, locations/*
  animations/   characterAnimations, cameraAnimations, scrollController
  data/         profile, skills, projects, achievements
  hooks/        useWorldProgress (mutable world state + tiny reactive UI store)
  styles/       global.css, medieval-theme.css, ui.css
```

Development aids (dev server only): `window.__world` and `window.__jump(s)` expose the world state and teleport to a scroll position for automated testing.
