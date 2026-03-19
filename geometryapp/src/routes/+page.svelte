<script>
import { onMount } from "svelte";
import { SVG } from "@svgdotjs/svg.js";
import "@svgdotjs/svg.draggable.js";

import { AppController } from "$lib/geometry/AppController.js";

let container;
let draw;
let controller;

let saveName = "default";

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

  // ✅ you can start in either
  controller.init("disc");

  draw.on("click", handleClick);
});
</script>

<div style="position:absolute;top:10px;left:10px;z-index:1000">

<input bind:value={saveName} placeholder="Save name" />

<button on:click={() => controller.setTool("point")}>
Draw Point
</button>

<button on:click={() => controller.setTool("hyperbolicLine")}>
Draw Hyperbolic Line
</button>

<!-- 🔥 CHANGED HERE -->
<button on:click={() => controller.switchScene("disc")}>
Switch to Poincare Disk Model
</button>

<button on:click={() => controller.switchScene("halfPlane")}>
Switch to Upper Half Plane Model
</button>

<button on:click={() => controller.clear()}>
Clear All
</button>

</div>

<div
bind:this={container}
style="width:100vw;height:calc(100vh - 50px);margin-top:50px">
</div>