export const resizeCanvasIfNeeded = (canvas, maxDim = 800) => {
  let width = canvas.width;
  let height = canvas.height;
  if (width <= maxDim && height <= maxDim) return null;
  const scale = Math.min(maxDim / width, maxDim / height);
  const newWidth = Math.floor(width * scale);
  const newHeight = Math.floor(height * scale);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = newWidth;
  tempCanvas.height = newHeight;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
  return { tempCanvas, scale };
};