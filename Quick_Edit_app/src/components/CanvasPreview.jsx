// client/src/components/CanvasPreview.jsx
import { useEffect, useRef } from 'react';
import { useImage } from '../contexts/ImageContext';

export default function CanvasPreview({ onCanvasReady }) {
  const { canvasRef: contextCanvasRef, originalImage } = useImage();
  const localCanvas = useRef(null);
  const canvas = contextCanvasRef || localCanvas;

  useEffect(() => {
    if (!originalImage || !canvas.current) return;
    const ctx = canvas.current.getContext('2d');
    canvas.current.width = originalImage.width;
    canvas.current.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    if (onCanvasReady) onCanvasReady(canvas.current);
  }, [originalImage, canvas, onCanvasReady]); // added dependencies

  return <canvas ref={canvas} className="main-canvas"></canvas>;
}