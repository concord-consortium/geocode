# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GeoCode is a scaffolded visual programming platform for teaching geological sciences. Students use Blockly to explore volcanic hazards through interactive simulations. There are three units: **Tephra** (ashfall modeling), **Seismic** (earthquake deformation), and **LavaCoder** (lava flow modeling with CesiumJS 3D visualization).

## Build & Development Commands

```bash
npm install --legacy-peer-deps   # Install dependencies (--legacy-peer-deps required)
npm start                        # Dev server with HMR at http://localhost:8080/
npm run build                    # Production build (lint + clean + webpack)
npm run build:webpack            # Webpack production build only
npm run build:compile            # TypeScript compilation check (no emit)
```

### Linting
```bash
npm run lint                     # ESLint check
npm run lint:build               # ESLint with build config
npm run lint:fix                 # Auto-fix ESLint issues
npm run lint:unused              # Check for unused variables via tsc
```

### Testing
```bash
npm test                         # Jest unit tests
npm run test:watch               # Jest watch mode
npm run test:coverage            # Jest with coverage
npm run test:full                # Jest + Cypress
npm run test:cypress             # Cypress E2E headless
npm run test:cypress:open        # Cypress interactive runner
```

Jest tests live alongside source as `*.test.ts(x)` files. Cypress E2E tests are in `cypress/integration/`.

## Tech Stack

- **React 17** with TypeScript (strict mode, experimentalDecorators)
- **Blockly 12** for visual programming, executed via **js-interpreter**
- **MobX 6 + MobX State Tree 7** for state management
- **CesiumJS** (@cesium/engine) for LavaCoder 3D visualization
- **PixiJS 7** + @pixi/react for 2D graphics
- **D3 7** + ReactFauxDOM for charts
- **Leaflet** + react-leaflet 2 for 2D maps
- **styled-components 5** for CSS-in-JS
- **Webpack 5** build system with ts-loader

Many dependencies are pinned to older versions due to migration blockers. See `dependencies-notes.md` for details.

## Architecture

### Entry Points (Webpack)
- `src/index.tsx` — Main app entry, sets up LARA iframe communication
- `src/report-item/index.tsx` — Report item viewer for LARA portal

### State Management (MobX State Tree)
All stores live in `src/stores/`:
- **unit-store** — Active unit: "Tephra", "Seismic", or "LavaCoder"
- **blockly-store** — Blockly workspace code and execution state
- **tephra-simulation-store** — Tephra eruption parameters and results
- **seismic-simulation-store** — Seismic/GPS station data
- **lava-simulation-store** — Lava flow simulation state
- **ui-store** — UI visibility, tabs, authoring options
- **charts-store** — Chart/visualization state
- **samples-collections-store** — Sample collection state

State is serialized/deserialized for LARA integration with versioned migration (`src/utilities/migrate-state.ts`). Author and student state are persisted separately.

### Blockly Integration
- `src/blockly/blockly-controller.ts` — Manages Blockly execution lifecycle
- `src/blockly/interpreter.ts` — JS-Interpreter setup with custom function bindings
- `src/blockly-blocks/` — Custom block definitions (38+ blocks), organized by unit subdirectory (tephra/, seismic/, lava/, deformation/)
- Toolbox configs: `src/assets/blockly-authoring/toolbox/{first,full}-toolbox.xml`
- Default programs: `src/assets/blockly-authoring/code/{basic-setup,nested-loops}.xml`

To add a new Blockly block: create a block definition file in `src/blockly-blocks/`, import it in `blocks.ts`, register any custom functions in `interpreter.ts` via `addFunc()`, and add the block to a toolbox XML. Functions returning data must wrap in `{ data: value }`.

### Simulation Engines
- `src/tephra2.ts` — Tephra2 ashfall distribution algorithm
- `src/deformation.ts` — Block-and-spring seismic deformation model
- `src/simulations/lava-coder/lava-simulation.ts` — MOLASSES lava flow algorithm

### LavaCoder (CesiumJS)
- Components in `src/components/lava-coder/` (23 files)
- Custom hooks in `src/hooks/lava-coder/` (15 hooks for viewer, terrain, mouse events, overlays)
- Requires `CESIUM_ION_ACCESS_TOKEN` in `.env` file at project root

### LARA Integration
Communication via `iframe-phone`. Modes: "student", "author", "report". Author state controls UI/toolbox settings; student state persists Blockly code and simulation parameters.

## Configuration

- **TypeScript**: ES2018 target, strict mode, CommonJS modules, React JSX transform
- **ESLint**: Flat config format (`eslint.config.mjs`) with TypeScript, React, React-Hooks, Import, Jest, Cypress plugins
- **Jest**: jsdom environment, ts-jest transform, SVG/asset mocks, identity-obj-proxy for CSS
- **Webpack**: Dual entry points (app + report-item), worker-loader for Web Workers, @svgr/webpack for SVG components, CesiumJS assets copied via CopyWebpackPlugin

## URL Parameters

- `unit=Tephra|Seismic` — Set the active unit
- `hide-model-options` — Hide the authoring dialog
