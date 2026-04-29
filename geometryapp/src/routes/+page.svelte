<script>
  import { onMount } from "svelte";
  import { SVG } from "@svgdotjs/svg.js";
  import "@svgdotjs/svg.draggable.js";

  import { AppController } from "$lib/geometry/AppController.js";

  let container;
  let draw;
  let controller;
  let axesVisible = false;
  let showHelp = false;
  let showAbout = false;

  function addVerticalLine() {
    if (!controller) return;

    const sceneView = controller.currentSceneView;
    const p1Screen = sceneView.mathToScreen({ x: 0.5, y: 1 });
    const p2Screen = sceneView.mathToScreen({ x: 0.5, y: 2 });

    const p1 = controller.addPoint(p1Screen.x, p1Screen.y);
    const p2 = controller.addPoint(p2Screen.x, p2Screen.y);

    sceneView.sceneModel.addLine(p1, p2, "red");
  }

  function handleClick(event) {
    const pt = draw.node.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const coords = pt.matrixTransform(draw.node.getScreenCTM().inverse());
    controller.handleClick(coords.x, coords.y);
  }

  function toggleAxes() {
    if (!controller) return;
    axesVisible = !axesVisible;
    controller.setDiscAxesVisible(axesVisible);
  }

  function toggleHelp() {
    showHelp = !showHelp;
  }

  onMount(() => {
    draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight);

    controller = new AppController(draw, container);
    controller.init("halfPlane");

    draw.on("click", handleClick);
  });
</script>

<svelte:head>
  <title>Hyperbolic Geometry</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="app-shell">
  <header class="toolbar">
    <div class="brand">
      <!-- <div class="brand-kicker">Hyperbolic Geometry</div> -->
      <h1>Hyperbolic Geometry Lab</h1>
      <p>See the transformation of lines across the Poincare Disc and Upper Half Plane models</p>
    </div>

    <div class="button-group">
      <button on:click={() => controller.setTool("point")}>Draw Point</button>
      <button on:click={() => controller.setTool("hyperbolicLine")}>Draw Hyperbolic Line</button>
      <button on:click={() => controller.syncTo()}>Sync</button>
      <button on:click={() => controller.switchSides()}>Switch Sides</button>
      <button on:click={() => controller.clear()}>Clear All</button>
      <button on:click={toggleAxes} class:active={axesVisible}>
        {axesVisible ? "Hide Axes" : "Show Axes"}
      </button>
      <button on:click={toggleHelp} class="help-btn" aria-label="Help">?</button>
      <button on:click={() => (showAbout = !showAbout)} class="about-btn" aria-label="About">About</button>

      <!-- <button on:click={addVerticalLine}>Add Vertical Line (Debug)</button> -->
    </div>
  </header>

  {#if showHelp}
    <div class="help-panel" role="dialog" aria-label="Help">
      <div class="help-header">
        <h2>Help</h2>
      </div>
      
      <ul>
        <li>The left side acts as the editor</li>
        <li><strong>Draw Point</strong>: Click once in the left scene.</li>
        <li><strong>Draw Hyperbolic Line</strong>: Click two points to create a hyperbolic line. Button is automatically 
        toggled after one line is added.</li>
        <li><strong>Sync</strong>: Transforms points and lines from left model to the right model.</li>
        <li><strong>Switch Sides</strong>: Swaps left and right scenes. Left side is still the editable side.</li>
        <li><strong>Clear All</strong>: Removes all drawn objects from the active scene.</li>
        <li><strong>Show Axes</strong>: Toggles guide axes in the scene views.</li>
        <li>Click on a point to drag the line around.</li>
        <li>Click on a line to remove or change colors.</li>
      </ul>
    </div>
  {/if}

  {#if showAbout}
    <div class="about-panel" role="dialog" aria-label="About">
      <div class="about-header">
        <h2>About</h2>
        <button on:click={() => (showAbout = false)} class="close-btn" aria-label="Close">×</button>
      </div>
      
      <div class="about-content">
        <p>
          Hyperbolic geometry is a non-Euclidean geometry in which the parallel postulate does not hold,
          allowing infinitely many lines through a point to be parallel to another line. This counterintuitive
          property challenges our Euclidean intuition and creates unique difficulties for visualization. To
          address this, mathematicians use multiple models, each with distinct advantages and disadvantages.
          The Poincaré disc provides a compact view of the entire space, while the upper half-plane extends
          infinitely and is convenient for analytic calculations. Möbius transformations map geometric objects
          between these models while preserving their structure. Visualizing these transformations and the
          relationships between the models is important for exploring hyperbolic space because it helps develop
          a deeper understanding of the geometry.
        </p>
        
        <div class="about-section">
          <h3>Creator</h3>
          <p><strong>Sarah Wrzos</strong></p>
        </div>
        
        <div class="about-section">
          <h3>Email</h3>
          <p>contact [at] hyperbolic-geometry.com</p>
        </div>
        
        <div class="about-section">
          <h3>Resources</h3>
          <p>
            <a href="https://github.com/sarahwrzos/geometryapp" target="_blank" rel="noopener noreferrer">View on GitHub</a>
          </p>
        </div>
      </div>
    </div>
  {/if}


  <main class="scene-shell">
    <div bind:this={container} class="scene-container"></div>
  </main>

  <footer class="app-footer">
    <p>© 2026 Sarah Wrzos</p>
    <p>Built for educational purposes.</p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background:
      radial-gradient(circle at top, rgba(91, 140, 255, 0.16), transparent 35%),
      linear-gradient(180deg, #f7f9fc 0%, #eef2f7 100%);
    color: #1f2937;
  }

  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .toolbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  }

  .brand {
    display: grid;
    gap: 0.2rem;
  }

  .brand h1 {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.1;
  }

  .brand p {
    margin: 0;
    color: #64748b;
    font-size: 0.92rem;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    align-items: center;
    justify-content: flex-end;
  }

  button {
    appearance: none;
    border: 1px solid rgba(99, 102, 241, 0.18);
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    color: #1e293b;
    padding: 0.7rem 1rem;
    border-radius: 999px;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }

  button:hover {
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  }

  button:active {
    transform: translateY(0);
  }

  button.active {
    background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border-color: transparent;
  }
  

  .help-btn {
    width: 42px;
    height: 42px;
    padding: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .help-panel {
    position: absolute;
    top: 92px;
    right: 20px;
    width: min(420px, calc(100vw - 2rem));
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 14px;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
    padding: 0.9rem 1rem;
    z-index: 1100;
  }

  .help-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .help-header h2 {
    margin: 0;
    font-size: 1rem;
  }

  .help-panel ul {
    margin: 0;
    padding-left: 1.1rem;
    color: #334155;
  }

  .help-panel li {
    margin: 0.35rem 0;
    line-height: 1.35;
  }

  .about-btn {
    padding: 0.7rem 1.2rem;
  }

  .about-panel {
    position: absolute;
    top: 92px;
    right: 20px;
    width: min(420px, calc(100vw - 2rem));
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 14px;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
    padding: 0.9rem 1rem;
    z-index: 1100;
    max-height: 80vh;
    overflow-y: auto;
  }

  .about-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .about-header h2 {
    margin: 0;
    font-size: 1rem;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 1.5rem;
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: rgba(148, 163, 184, 0.12);
    color: #1e293b;
    box-shadow: none;
    transform: none;
  }

  .about-content {
    color: #334155;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .about-content p {
    margin: 0 0 1rem 0;
  }

  .about-section {
    margin-top: 1.2rem;
  }

  .about-section h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: #1e293b;
  }

  .about-section p {
    margin: 0;
  }

  .about-content a {
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s ease;
  }

  .about-content a:hover {
    color: #4f46e5;
    text-decoration: underline;
  }

  .scene-shell {
    flex: 1;
    padding: 1rem;
  }

  .scene-container {
    width: 100%;
    height: calc(100vh - 104px);
    min-height: 560px;
    border-radius: 24px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.64)),
      #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 900px) {
    .toolbar {
      align-items: flex-start;
    }

    .button-group {
      justify-content: flex-start;
    }

    .scene-container {
      height: calc(100vh - 180px);
      min-height: 480px;
    }
  }

  .app-footer {
    padding: 1.5rem 1.25rem;
    background: rgba(248, 250, 252, 0.6);
    border-top: 1px solid rgba(148, 163, 184, 0.18);
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .app-footer p {
    margin: 0.25rem 0;
  }
</style>