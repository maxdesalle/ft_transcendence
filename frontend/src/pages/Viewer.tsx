import { Component, onCleanup, onMount } from "solid-js";
import { initViewerSocket, viewerSketch } from "../game/viewer";
import p5Type from "p5";

const Viewer: Component = () => {
  let ref: any;
  let ws: WebSocket;
  let p5: p5Type;

  onMount(() => {
    ws = initViewerSocket();
    p5 = new p5Type(viewerSketch, ref);
  });

  onCleanup(() => {
    p5.remove();
    ws.close();
  });

  return (
    <div class="flex flex-col items-center pt-3">
      <div ref={ref}></div>
    </div>
  );
};

export default Viewer;
