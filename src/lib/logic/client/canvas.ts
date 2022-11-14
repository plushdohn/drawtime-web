import FloodFill from "q-floodfill";

export function floodFillCanvas(canvas: HTMLCanvasElement, x: number, y: number, color: string) {
  const context = canvas.getContext("2d");

  const imgData = context!.getImageData(0, 0, canvas.width, canvas.height);

  const floodFill = new FloodFill(imgData);

  floodFill.fill(color, Math.round(x), Math.round(y), 0);
  context!.putImageData(floodFill.imageData, 0, 0);
}
