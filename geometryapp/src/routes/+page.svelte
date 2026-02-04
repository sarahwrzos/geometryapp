
<script>
  import { onMount } from 'svelte'
  import { SVG } from '@svgdotjs/svg.js'
  import { createLineTool } from '$lib/tools/lineTool'
  import { createhLineTool } from '$lib/tools/hlineTool'

  import { circleCenter } from '$lib/circleStore.js'

  let container
  let draw
  let activeTool = null

  onMount(() => {
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight)

    // create unit circle
    const centerX = container.clientWidth / 2
    const centerY = container.clientHeight / 2
    const diameter = container.clientHeight / 2
    const radius = diameter / 2

    draw.circle(diameter) // diameter
        .center(centerX, centerY)
        .fill('none')
        .stroke({ width: 2, color: '#000' })

    circleCenter.set({ x: centerX, y: centerY , r: radius})

    draw.on("click", (e) => {
      console.log("active tool:", activeTool)
      
      if (!activeTool) return
      const pt = draw.node.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgCoords = pt.matrixTransform(
        draw.node.getScreenCTM().inverse()
      )
      activeTool.onClick(svgCoords)
    })

    window.addEventListener('resize', updateSize)

    return () => window.removeEventListener('resize', updateSize)
  })

  function useLineTool() {
    activeTool?.reset()
    activeTool = createLineTool(draw)
  }

  function usehLineTool(){
    activeTool?.reset()
    activeTool = createhLineTool(draw)
  }

  function updateSize() {
    if (draw && container) draw.size(container.clientWidth, container.clientHeight)
  }

</script>

<button on:click={useLineTool}>
  Draw Line
</button>

<button on:click={usehLineTool}>
  Draw Hyperbolic Line
</button>

<div bind:this={container} style="width: 100vw; height: 100vh;"></div>


