<script>
  import { onMount } from 'svelte';
  import { SVG } from '@svgdotjs/svg.js';
  import '@svgdotjs/svg.draggable.js';

  import { SceneModel } from '$lib/geometry/SceneModel.js';
  import { SceneView } from '$lib/geometry/SceneView.js';
  import { PointModel } from '$lib/geometry/PointModel.js';
  import { PointView } from '$lib/geometry/PointView.js';
  import { DiskLineModel } from '$lib/geometry/DiskLineModel.js';
  import { DiskLineView } from '$lib/geometry/DiskLineView.js';
   import { HalfPlaneLineView } from '$lib/geometry/HalfPlaneLineView.js';

  let container;
  let draw;
  let sceneModel;
  let sceneView;
  let saveName = 'default';

  let activeTool = null;
  let tempPoint = null;

  // Get SVG-relative coordinates
  function getClickCoords(event) {
    const pt = draw.node.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(draw.node.getScreenCTM().inverse());
  }

  function startHyperbolicLineTool() {
    activeTool = 'hyperbolicLine';
    tempPoint = null; // reset first click
  }

  function startPointTool() {
    activeTool = 'point';
  }

  // Optional: helper for adding buttons to lines
  function addButton(x, y, label, action) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.position = 'absolute';
    btn.style.top = `${y}px`;
    btn.style.left = `${x}px`;
    btn.style.zIndex = 1000;
    btn.style.margin = '2px';
    btn.onclick = action;
    document.body.appendChild(btn);
    return btn;
  }

  function makeLineActions(lineView) {
    if (!lineView.element) return;

    lineView.element.on('click', (e) => {
      e.stopPropagation();

      document.querySelectorAll('button.line-action').forEach(b => b.remove());

      addButton(e.clientX, e.clientY, 'Remove', () => {
        lineView.element.remove();
        sceneModel.removeLine(lineView.model);
        
        // remove the two points
        lineView.model.p1.view?.element.remove();
        lineView.model.p2.view?.element.remove();

        // remove action buttons
        document.querySelectorAll('button.line-action')
        .forEach(b => b.remove());
      }).classList.add('line-action');

      addButton(e.clientX + 60, e.clientY, 'Color', () => {
        const newColor = prompt('Enter color (e.g., red or #00ff00):', 'black');
        if (newColor) {
          lineView.model.color = newColor;
          lineView.element.stroke({ color: newColor });
        }

        // remove action buttons
        document.querySelectorAll('button.line-action')
        .forEach(b => b.remove());
      }).classList.add('line-action');
    });

    lineView.element.on('mouseover', () => lineView.element.stroke({ color: 'red' }));
    lineView.element.on('mouseout', () => lineView.element.stroke({ color: lineView.model.color }));
  }

  function drawLine(lineModel) {
    if (sceneView.sceneModel.sceneType === "Disk"){
      const lineView = new DiskLineView(lineModel, draw, sceneView);
      lineView.draw();
      makeLineActions(lineView);
      sceneView.lineViews.push(lineView);
    }
    else{
      const lineView = new HalfPlaneLineView(lineModel, draw, sceneView);
      lineView.draw();
      makeLineActions(lineView);
      sceneView.lineViews.push(lineView);
    }
  }

  function saveConstruction(name) {
    const pointIndexMap = new Map();

    sceneModel.points.forEach((p, i) => {
      pointIndexMap.set(p, i);
    });

    const data = {
      points: sceneModel.points.map(p => p.toJSON()),
      lines: sceneModel.lines.map(l => ({
        p1: pointIndexMap.get(l.p1),
        p2: pointIndexMap.get(l.p2),
        color: l.color
      }))
    };

    localStorage.setItem(name, JSON.stringify(data));
    console.log("Saved construction:", name);
  }

  function loadConstruction(name, unitCircleCenter, unitCircleRadius) {
    const json = localStorage.getItem(name);
    if (!json) return;

    const data = JSON.parse(json);

    // Clear existing scene
    sceneModel.clear();
    sceneView.pointViews.forEach(v => v.element.remove());
    sceneView.lineViews.forEach(v => v.element.remove());
    sceneView.pointViews = [];
    sceneView.lineViews = [];

    // Restore points
    const points = data.points.map(pData => {
      const pt = sceneModel.addPoint(pData.x, pData.y);
      const view = new PointView(pt, draw);
      view.draw();
      view.enableDrag();
      sceneView.pointViews.push(view);
      return pt;
    });

    // Restore lines
    data.lines.forEach(lData => {
      const lineModel = sceneModel.addLine(
        points[lData.p1],
        points[lData.p2]
      );
      lineModel.color = lData.color || "black";

      const lineView = new DiskLineView(lineModel, draw, sceneView, lineModel.color);
      lineView.draw();
      makeLineActions(lineView);
      sceneView.lineViews.push(lineView);
    });

    console.log("Loaded construction:", name);
  }

  function switchToDisk() {
    sceneView.switchModel("Disk");
  }

  function switchToHalfPlane() {
    sceneView.switchModel("HalfPlane");
  }

  function clearAll() {
    sceneView.clear();
  }

  onMount(() => {
    // Initialize SVG
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight);

    // Unit circle
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    const diameter = container.clientHeight / 2;
    const radius = diameter / 2;

    // Initialize SceneModel and SceneView
    sceneModel = new SceneModel(centerX, centerY, radius);
    sceneView = new SceneView(sceneModel, draw);

    sceneView.unitCircleClip = draw.clip().add(
        draw.circle(diameter).center(centerX, centerY)
    );

    // Handle clicks
    draw.on('click', (event) => {
      const coords = getClickCoords(event);

      if (activeTool === 'point') {
        const pointModel = sceneModel.addPoint(coords.x, coords.y);
        const pointView = new PointView(pointModel, draw);
        pointView.draw();
        pointView.enableDrag();
        sceneView.pointViews.push(pointView);
        activeTool = null;
      }

      if (activeTool === 'hyperbolicLine') {
        const pointModel = sceneModel.addPoint(coords.x, coords.y);
        const pointView = new PointView(pointModel, draw);
        pointView.draw();
        pointView.enableDrag();
        sceneView.pointViews.push(pointView);

        if (tempPoint === null) {
          tempPoint = pointModel;
        } else {
          const lineModel = sceneModel.addLine(tempPoint, pointModel);
          drawLine(lineModel);
          tempPoint = null;
          activeTool = null; // deactivate after one line
        }
      }
    });
  });
</script>

<div style="position: absolute; top: 10px; left: 10px; z-index: 1000;">
  <input bind:value={saveName} placeholder="Save name" />
  <button on:click={saveConstruction}>Save</button>
  <button on:click={loadConstruction}>Load</button>
  <button on:click={startHyperbolicLineTool}>Draw Hyperbolic Line</button>
  <button on:click={startPointTool}>Draw Point</button>
  <button on:click={switchToDisk}>Switch to Poincare Disk Model</button>
  <button on:click={switchToHalfPlane}>Switch to Upper Half Plane Model</button>
  <button on:click={clearAll}>Clear All</button>
</div>

<div bind:this={container} style="width: 100vw; height: calc(100vh - 50px); margin-top: 50px;"></div>
