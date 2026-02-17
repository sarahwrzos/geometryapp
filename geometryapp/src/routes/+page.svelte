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

  let container;
  let draw;
  let sceneModel;
  let sceneView;

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
        const index = sceneModel.lines.indexOf(lineView.model);
        if (index > -1) sceneModel.lines.splice(index, 1);
      }).classList.add('line-action');

      addButton(e.clientX + 60, e.clientY, 'Color', () => {
        const newColor = prompt('Enter color (e.g., red or #00ff00):', 'black');
        if (newColor) lineView.element.stroke({ color: newColor });
      }).classList.add('line-action');
    });

    lineView.element.on('mouseover', () => lineView.element.stroke({ color: 'red' }));
    lineView.element.on('mouseout', () => lineView.element.stroke({ color: 'black' }));
  }

  function drawLine(lineModel) {
    const lineView = new DiskLineView(lineModel, draw, sceneView);
    lineView.draw();
    makeLineActions(lineView);
    sceneView.lineViews.push(lineView);
  }

  onMount(() => {
    // Initialize SVG
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight);

    // Unit circle
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    const diameter = container.clientHeight / 2;
    const radius = diameter / 2;

    draw.circle(diameter)
        .center(centerX, centerY)
        .fill('none')
        .stroke({ width: 2, color: '#000' });

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
          activeTool = null; // optional: deactivate after one line
        }
      }
    });
  });
</script>

<div style="margin: 1em;">
  <button on:click={startHyperbolicLineTool}>Draw Hyperbolic Line</button>
  <button on:click={startPointTool}>Draw Point</button>
</div>

<div bind:this={container} style="width: 100vw; height: 100vh;"></div>