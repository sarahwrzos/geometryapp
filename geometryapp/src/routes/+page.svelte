<script>
import { onMount } from "svelte";
import { SVG } from "@svgdotjs/svg.js";
import "@svgdotjs/svg.draggable.js";

import { AppController } from "$lib/geometry/AppController.js";
import { PointModel } from "$lib/geometry/models/PointModel.js";

let container;
let draw;
let controller;

let saveName = "default";

function addVerticalLine() {
  if (!controller) return;

  // convert math → screen so we can reuse addPoint
  const sceneView = controller.currentSceneView;

  const p1Screen = sceneView.mathToScreen({ x: 0.5, y: 1 });
  const p2Screen = sceneView.mathToScreen({ x: 0.5, y: 2 });

  const p1 = controller.addPoint(p1Screen.x, p1Screen.y);
  const p2 = controller.addPoint(p2Screen.x, p2Screen.y);

  const line = sceneView.sceneModel.addLine(p1, p2, "red");

  console.log("DEBUG LINE:", line, line.type);
}

function handleClick(event) {

  const pt = draw.node.createSVGPoint();

  pt.x = event.clientX;
  pt.y = event.clientY;

  const coords =
    pt.matrixTransform(draw.node.getScreenCTM().inverse());

  controller.handleClick(coords.x, coords.y);
}

onMount(() => {

  draw =
    SVG().addTo(container)
      .size(container.clientWidth, container.clientHeight);

  controller =
    new AppController(draw, container);

  controller.init("halfPlane");

  draw.on("click", handleClick);
});

</script>

<div style="position:absolute;top:10px;left:10px;z-index:1000">

<!-- <input bind:value={saveName} placeholder="Save name" /> -->

<button on:click={() => controller.setTool("point")}>
Draw Point
</button>

<button on:click={() => controller.setTool("hyperbolicLine")}>
Draw Hyperbolic Line
</button>

<button on:click={() => controller.syncTo()}>
Sync
</button>

<button on:click={() => controller.switchSides()}>
Switch Sides
</button>

<button on:click={() => controller.clear()}>
Clear All
</button>

<button on:click={addVerticalLine}>
Add Vertical Line (Debug)
</button>

</div>

<div
bind:this={container}
style="width:100vw;height:calc(100vh - 50px);margin-top:50px">
</div>