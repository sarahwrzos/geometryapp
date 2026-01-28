<script>
  import { onMount } from 'svelte'
  import { SVG } from '@svgdotjs/svg.js'

  let container

  onMount(() => {
    const draw = SVG().addTo(container).size(500, 500)

        draw.on("click", (e) => {
        const point = draw.node.createSVGPoint()
        point.x = e.clientX
        point.y = e.clientY

        const svgCoords = point.matrixTransform(
            draw.node.getScreenCTM().inverse()
        )

        console.log(svgCoords.x, svgCoords.y)
        })
  })

  onMount
</script>

<div bind:this={container}></div>
