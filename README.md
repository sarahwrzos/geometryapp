# Geometry App

## Abstract

Hyperbolic geometry is a non-Euclidean geometry in which the parallel postulate does not hold, allowing infinitely many lines through a point to be parallel to another line. This counterintuitive property challenges our Euclidean intuition and creates unique difficulties for visualization. To address this, mathematicians use multiple models, each with distinct advantages and disadvantages. The Poincaré disc provides a compact view of the entire space, while the upper half-plane extends infinitely and is convenient for analytic calculations. Möbius transformations map geometric objects between these models while preserving their structure. Visualizing these transformations and the relationships between the models is important for exploring hyperbolic space because it helps develop a deeper understanding of the geometry.

Existing tools for exploring hyperbolic geometry across multiple models are limited. I created software that lets users move between models and experiment with geometric objects, helping to build intuition about this unfamiliar space. My approach uses a model–view–controller (MVC) architecture, which separates the representation of geometric data from the user interface and the interaction logic. This structure allows the same objects to be viewed consistently across different models. 

This work illustrates how software can serve as a tool for exploring the relationships between models of hyperbolic geometry while providing an interactive framework for visualization and experimentation.


## Overview

This project is an interactive hyperbolic geometry visualizer built with SvelteKit and SVG.js.

It lets you:
- Draw points and hyperbolic geodesics
- View and compare two models side by side:
    - Poincare Disc model
    - Upper Half Plane model
- Sync geometry between models
- Drag points to dynamically update geodesics
- Run automated tests for geometry behavior

The app code lives in the nested `geometryapp/` folder inside this repository.

## Architecture Overview

The code follows a model-view-controller style split:

- Models: store geometric data and compute transformations/geodesics
- Views: render scenes, points, and lines in SVG
- Controller: coordinates tools, scene state, syncing, and user actions

### Main App Entry

- UI page and toolbar: `geometryapp/src/routes/+page.svelte`
- App coordination logic: `geometryapp/src/lib/geometry/AppController.js`

### Core Geometry Code

All major geometry logic is under:

- `geometryapp/src/lib/geometry/`

Important subfolders/files:

- Base geometry models:
    - `geometryapp/src/lib/geometry/models/PointModel.js`
    - `geometryapp/src/lib/geometry/models/LineModel.js`
    - `geometryapp/src/lib/geometry/models/SceneModel.js`
- Disc model geometry:
    - `geometryapp/src/lib/geometry/models/disc/DiscSceneModel.js`
    - `geometryapp/src/lib/geometry/models/disc/DiscLineCircleModel.js`
    - `geometryapp/src/lib/geometry/models/disc/DiscLineDiameterModel.js`
- Half-plane model geometry:
    - `geometryapp/src/lib/geometry/models/halfPlane/HalfPlaneSceneModel.js`
    - `geometryapp/src/lib/geometry/models/halfPlane/HalfPlaneSemiCircleModel.js`
    - `geometryapp/src/lib/geometry/models/halfPlane/HalfPlaneVerticalLineModel.js`
- Coordinate/model transforms:
    - `geometryapp/src/lib/geometry/GeometryTransformer.js`
- Rendering layer:
    - `geometryapp/src/lib/geometry/views/SceneView.js`
    - `geometryapp/src/lib/geometry/views/DiscSceneView.js`
    - `geometryapp/src/lib/geometry/views/HalfPlaneSceneView.js`
    - `geometryapp/src/lib/geometry/views/PointView.js`
    - `geometryapp/src/lib/geometry/views/LineView.js`

### Tests

Tests are in:

- `geometryapp/tests/`

Examples:

- `geometryapp/tests/GeometryTransformer.test.js`
- `geometryapp/tests/DragLine.test.js`
- `geometryapp/tests/HalfPlaneSceneModel.test.js`

## Setup and Running

### 1. Install Node.js and npm

Install Node.js LTS from: https://nodejs.org/

Verify install:

```bash
node -v
npm -v
```

### 2. Install project dependencies

From the repository root:

```bash
cd geometryapp
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Vite will print a local URL (usually http://localhost:5173).

### 4. Run tests

Run all tests:

```bash
npm test
```

Run one specific test file:

```bash
npm test -- tests/DragLine.test.js --run
```