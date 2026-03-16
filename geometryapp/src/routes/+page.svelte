<script>
  import { onMount } from "svelte";
  import { SVG } from "@svgdotjs/svg.js";
  import "@svgdotjs/svg.draggable.js";

  import { SceneView } from "$lib/geometry/views/SceneView.js";
  import { DiscSceneView } from "$lib/geometry/views/DiscSceneView.js";
  import { HalfPlaneSceneView } from "$lib/geometry/views/HalfPlaneSceneView.js";
  import { PointView } from "$lib/geometry/views/PointView.js";
  import { LineView } from "$lib/geometry/views/LineView.js";
  import { CircleView } from "$lib/geometry/views/CircleView.js";
  import { AppController } from "$lib/geometry/AppController.js";
  import { DiscSceneModel } from "$lib/geometry/models/disc/DiscSceneModel";
  import { PointModel } from "$lib/geometry/models/PointModel";

  let container;
  let draw;
  let appController;
  let activeTool = null;
  let tempPoint = null;
  let currentSceneView;
  let saveName = "default";

  function startPointTool() {
    activeTool = "point";
  }

  function startHyperbolicLineTool() {
    activeTool = "hyperbolicLine";
    tempPoint = null;
  }

  function makeLineActions(lineView, sceneView) {
    if (!lineView.element) return;

    lineView.element.on("click", (e) => {
      e.stopPropagation();

      document.querySelectorAll("button.line-action").forEach(b => b.remove());

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.classList.add("line-action");

      removeBtn.style.position = "absolute";
      removeBtn.style.top = `${e.clientY}px`;
      removeBtn.style.left = `${e.clientX}px`;

      removeBtn.onclick = () => {
        sceneView.sceneModel.removeLine(lineView.model);
        document.querySelectorAll("button.line-action").forEach(b => b.remove());
      };
      document.body.appendChild(removeBtn);

      const colorBtn = document.createElement("button");
      colorBtn.textContent = "Color";
      colorBtn.classList.add("line-action");
      colorBtn.style.position = "absolute";
      colorBtn.style.top = `${e.clientY}px`;
      colorBtn.style.left = `${e.clientX + 60}px`;
      colorBtn.onclick = () => {
        const newColor = prompt("Enter color (e.g., red or #00ff00):", "black");
        if (newColor) {
          lineView.model.color = newColor;
          lineView.element.stroke({ color: newColor });
        }
        document.querySelectorAll("button.line-action").forEach(b => b.remove());
      };
      document.body.appendChild(colorBtn);
    });

    lineView.element.on("mouseover", () => lineView.element.stroke({ color: "red" }));
    lineView.element.on("mouseout", () => lineView.element.stroke({ color: lineView.model.color }));
  }

  function drawLine(lineModel, sceneView) {
    let lineView;
    if (lineModel.type === "Line") {
      lineView = LineView.create(LineView, lineModel, sceneView);
    }
    else {
      lineView = CircleView.create(CircleView, lineModel, sceneView);
    }
    makeLineActions(lineView, sceneView);
    sceneView.lineViews.push(lineView);
    //sceneView.updateClip();
  }

  function addPointAt(x, y) {
    const mathPoint = currentSceneView.screenToMathPoint(x, y);

    currentSceneView.sceneModel.addPoint(mathPoint);

    const pointView = PointView.createDraggable(mathPoint, currentSceneView);
    currentSceneView.pointViews.push(pointView);
    //currentSceneView.updateClip();

    return mathPoint;
  }

  function handleClick(event) {
    const pt = draw.node.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const coords = pt.matrixTransform(draw.node.getScreenCTM().inverse());

    if (activeTool === "point") {
      addPointAt(coords.x, coords.y);
      activeTool = null;
    } else if (activeTool === "hyperbolicLine") {
      const newPoint = addPointAt(coords.x, coords.y);
      if (!tempPoint) {
        tempPoint = newPoint;
      } else {
        const lineModel = currentSceneView.sceneModel.addLine(tempPoint, newPoint);
        drawLine(lineModel, currentSceneView);
        tempPoint = null;
        activeTool = null;
      }
    }
  }

  function switchToDisk() {
    const sceneModel = currentSceneView.sceneModel; // reuse model if desired
    currentSceneView.removeScene();
    currentSceneView = DiscSceneView.create(sceneModel, draw, container.clientHeight, container.clientWidth);
  }

  function switchToHalfPlane() {
    const sceneModel = currentSceneView.sceneModel; // reuse model
    currentSceneView.removeScene();
    currentSceneView = HalfPlaneSceneView.create(sceneModel, draw, container.clientHeight, container.clientWidth);
  }

  function clearAll() {
    currentSceneView.removeScene();
  }

  onMount(() => {
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight);
    appController = new AppController();

    // initialize default scene
    const sceneModel = new DiscSceneModel();
    currentSceneView = DiscSceneView.create(sceneModel, draw, container.clientHeight, container.clientWidth);

    draw.on("click", handleClick);
  });
</script>

<div style="position: absolute; top: 10px; left: 10px; z-index: 1000;">
  <input bind:value={saveName} placeholder="Save name" />
  <button on:click={startPointTool}>Draw Point</button>
  <button on:click={startHyperbolicLineTool}>Draw Hyperbolic Line</button>
  <button on:click={switchToDisk}>Switch to Poincare Disk Model</button>
  <button on:click={switchToHalfPlane}>Switch to Upper Half Plane Model</button>
  <button on:click={clearAll}>Clear All</button>
</div>

<div bind:this={container} style="width: 100vw; height: calc(100vh - 50px); margin-top: 50px;"></div>