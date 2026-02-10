
<script>
  import { onMount } from 'svelte'
  import { SVG } from '@svgdotjs/svg.js'

	import { Shapes } from '$lib/geometry/Shapes';
  import { Point } from '$lib/geometry/Point.js';
  import { DiskHyperbolicLine } from '$lib/geometry/DiskHyperbolicLine.js';

  let container
  let draw
  let activeTool = null
  let shapes
  let tempPoint = null

  // Function to get x,y coordinates of click relative to SVG
  function getClickCoords(event) {
    const pt = draw.node.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    return pt.matrixTransform(draw.node.getScreenCTM().inverse())
  }

  // for testing
  function addDiameterLine() {
    const r = shapes.unitCircleRadius;
    const cx = shapes.unitCircleCenter.x;
    const cy = shapes.unitCircleCenter.y;

    // Points along a horizontal diameter
    const left = new Point(cx, cy);
    const right = new Point(cx + 20, cy+1);

    shapes.addPoint(cx, cy)
    shapes.addPoint(cx + 20, cy+1)

    const dline = shapes.addClickableLine(left, right);

    // console.log(dline.isDiameter)
  }

  function startHyperbolicLineTool() {
    activeTool = 'hyperbolicLine';
    tempPoint = null; // reset first click
  }

  onMount(() => {
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight)

    // create unit circle custom to window
    const centerX = container.clientWidth / 2
    const centerY = container.clientHeight / 2
    const diameter = container.clientHeight / 2
    const radius = diameter / 2

    const unitCircle = new Point(centerX, centerY)

    draw.circle(diameter)
        .center(centerX, centerY)
        .fill('none')
        .stroke({ width: 2, color: '#000' })

    shapes = new Shapes(centerX, centerY, radius)

    // addDiameterLine()
    // console.log(shapes.points)
    shapes.drawAll(draw)

    // Example: initial line
    // shapes.addClickableLine(
    //   new Point(centerX - 50, centerY),
    //   new Point(centerX + 50, centerY),
    //   draw
    // );

    draw.on('click', (event) => {
      const coords = getClickCoords(event)
      const point = shapes.addPoint(coords.x, coords.y)

      if (activeTool === 'hyperbolicLine') {
        // Use two clicks to create a hyperbolic line
        if (tempPoint === null) {
          tempPoint = point
        } else {
          shapes.addClickableLine(tempPoint, point, draw)
          tempPoint = null
          activeTool = null  // optionally deactivate tool after one line
        }
      }

    });

  })


</script>

<div style="margin: 1em;">
  <button on:click={startHyperbolicLineTool}>
    Draw Hyperbolic Line
  </button>
</div>

<div bind:this={container} style="width: 100vw; height: 100vh;"></div>


