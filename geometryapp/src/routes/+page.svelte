
<script>
  import { onMount } from 'svelte'
  import { SVG } from '@svgdotjs/svg.js'

	import { Shapes } from '$lib/geometry/Shapes';
  import { Point } from '$lib/geometry/Point.js';

  let container
  let draw
  let activeTool = null
  let shapes

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

    const dline = shapes.addLine(left, right);

    // console.log(dline.isDiameter)
  }

  onMount(() => {
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight)

    // create unit circle custom to window
    const centerX = container.clientWidth / 2
    const centerY = container.clientHeight / 2
    const diameter = container.clientHeight / 2
    const radius = diameter / 2

    draw.circle(diameter)
        .center(centerX, centerY)
        .fill('none')
        .stroke({ width: 2, color: '#000' })

    shapes = new Shapes(centerX, centerY, radius)

    addDiameterLine()
    console.log(shapes.points)
    shapes.drawAll(draw)

    let tempPoint = null

    draw.on("click", (event) => {
      const coords = getClickCoords(event);
      const point = shapes.addPoint(coords.x, coords.y);

      if (tempPoint === null) {
        tempPoint = point; // store the Point object
      } else {
        shapes.addLine(tempPoint, point); // pass Point objects
        tempPoint = null;
      }

      // Draw all points and lines
      draw.clear();
      draw.circle(diameter)
          .center(centerX, centerY)
          .fill('none')
          .stroke({ width: 2, color: '#000' });

      shapes.drawAll(draw);

      console.log(coords.x, coords.y); 
      console.log(shapes.lines)
    });



  //   draw.on("click", (e) => {
  //     console.log("active tool:", activeTool)
      
  //     if (!activeTool) return
  //     const pt = draw.node.createSVGPoint()
  //     pt.x = e.clientX
  //     pt.y = e.clientY
  //     const svgCoords = pt.matrixTransform(
  //       draw.node.getScreenCTM().inverse()
  //     )
  //     activeTool.onClick(svgCoords)
  //   })

  //   window.addEventListener('resize', updateSize)

  //   return () => window.removeEventListener('resize', updateSize)
  })

  // function updateSize() {
  //   if (draw && container) draw.size(container.clientWidth, container.clientHeight)
  // }

</script>

<div bind:this={container} style="width: 100vw; height: 100vh;"></div>


