import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/tool.css';

export default function CropTool() {
  const navigate = useNavigate();
  const { originalImage, canvasRef, setOriginalImage, resetToPristine } = useImage();
  const { recordTool } = useSessionHistory();
  const [cropMode, setCropMode] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
  }, [canvasRef, originalImage]);

  const getMouseCoord = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x: Math.min(Math.max(x, 0), canvas.width), y: Math.min(Math.max(y, 0), canvas.height) };
  };

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    ctx.clearRect(x, y, w, h);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  };

  const onMouseDown = (e) => {
    if (!cropMode) return;
    setDragging(true);
    const coord = getMouseCoord(e);
    setStart(coord);
    setEnd(coord);
  };

  const onMouseMove = (e) => {
    if (!cropMode || !dragging) return;
    const coord = getMouseCoord(e);
    setEnd(coord);
    drawOverlay();
  };

  const onMouseUp = () => setDragging(false);

  const applyCrop = () => {
    const canvas = canvasRef.current;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    if (w < 5 || h < 5) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(originalImage, x, y, w, h, 0, 0, w, h);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(tempCanvas, 0, 0);
    const newImg = new Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setOriginalImage(newImg);
      setCropMode(false);
      recordTool('crop');
    };
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="tool-container">
        <h2>Crop Tool</h2>
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          style={{ maxWidth: '100%', border: '1px solid #ccc', cursor: cropMode ? 'crosshair' : 'default' }}
        />
        <div className="tool-controls">
          <button onClick={() => setCropMode(!cropMode)}>{cropMode ? 'Cancel Crop' : 'Enable Crop'}</button>
          <button onClick={applyCrop} disabled={!cropMode}>Apply Crop</button>
          <button onClick={download}>Download</button>
          <button onClick={resetToPristine}>Reset</button>
          <button onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
      </div>
      <Footer />
    </>
  );
}