# Hyades Control - AI Coding Guide

## Project Overview

Hyades Control is a 4X space strategy game built with Electron, using a modern TypeScript stack. The game features procedural star system generation, interactive 3D star maps using PixiJS, and a React-based UI.

## Architecture

### Core Structure

- **Main Process**: `src/main/main.ts` - Electron main process with logging setup
- **Renderer Process**: `src/renderer/` - React app with routing (HashRouter)
- **Preload Scripts**: `src/preload/` - Secure IPC bridge
- **Game Logic**: `src/renderer/components/game/` - Core game mechanics

### Key Components

- `Game.tsx` - Main game view with dual modes: `starMap` (galaxy view) and `starView` (system view)
- `aigenerator.ts` - Procedural star system generation with realistic astronomy calculations
- `ClusterView.tsx` - PixiJS-powered 3D star field visualization
- `Game.d.ts` - Complete type definitions for celestial objects (SystemType, PlanetType, etc.)

## Development Patterns

### Path Aliases (Critical)

Always use these Vite-configured aliases instead of relative imports:

- `@Assets` → `src/assets/`
- `@Components` → `src/renderer/components/`
- `@Lib` → `src/lib/`
- `@Main` → `src/main/`

### Component Organization

- UI components: `@Components/ui/` (shadcn/ui components)
- Canvas/Graphics: `@Components/canvas/` (PixiJS rendering)
- Game Logic: `@Components/game/` (system generation, resources)

### Data Flow

1. Star catalog loaded from `@Assets/data/nearest.json` (real astronomical data)
2. Procedural systems generated via `aigenerator.ts` with physics-based calculations
3. PixiJS renders interactive star fields in `ClusterView.tsx`
4. Game state managed through React hooks in `Game.tsx`

### Key Dependencies

- **PixiJS 7** with `@pixi/react` - All 3D rendering and interactions
- **Electron Forge** - Build system, not standard Electron
- **shadcn/ui + Tailwind** - UI component library
- **electron-log** - Logging in both main and renderer processes

## Development Commands

```bash
yarn start    # Start development (opens DevTools automatically)
yarn make     # Build production distributables
yarn package  # Package without installers
```

## Critical Implementation Details

### Star System Generation

The `aigenerator.ts` uses real astronomical formulas for:

- Habitable zone calculations based on stellar luminosity
- Planetary composition and albedo
- Orbital mechanics with realistic physics constants

### Canvas Rendering

PixiJS integration pattern in `ClusterView.tsx`:

- Uses `useApp()` hook to access PixiJS application
- Clears stage with `app.stage.removeChildren()` before re-render
- Delegates actual rendering to `starField.tsx` function

### Type Safety

All celestial objects follow strict TypeScript interfaces in `Game.d.ts`. Always extend these types rather than using `any` for game objects.

### Asset Loading

Static assets in `src/assets/` include:

- Star textures by spectral class (A, B, F, G, K, M, O)
- Real astronomical data (Hyades cluster coordinates)
- UI images (resources, planets, systems icons)

## Common Pitfalls

- Don't use relative imports - always use path aliases
- PixiJS components need proper cleanup in React lifecycle
- Electron main process logging is pre-configured - use `console.log`
- Game state should flow through `Game.tsx` - avoid direct state in canvas components
