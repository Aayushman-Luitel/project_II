import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/tool.css';

export default function CartoonTool() {
  const navigate = useNavigate();
  const { originalImage, canvasRef, setOriginalImage, resetToPristine } = useImage();
  const { recordTool } = useSessionHistory();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
  }, [canvasRef, originalImage]);


  const posterize = (ctx, width, height, levels = 6) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const step = 255 / (levels - 1);
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = Math.round(imgData.data[i] / step) * step;
      imgData.data[i+1] = Math.round(imgData.data[i+1] / step) * step;
      imgData.data[i+2] = Math.round(imgData.data[i+2] / step) * step;
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const cartoon = async () => {
    setProcessing(true);
    setError(null);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

 
    let workingCanvas = canvas;
    const maxDim = 400;
    if (canvas.width > maxDim || canvas.height > maxDim) {
      const scale = Math.min(maxDim / canvas.width, maxDim / canvas.height);
      const newWidth = Math.floor(canvas.width * scale);
      const newHeight = Math.floor(canvas.height * scale);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
      workingCanvas = tempCanvas;
    }

    try {
      
      const workingCtx = workingCanvas.getContext('2d');
      const imgData = workingCtx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
      const gray = new Uint8ClampedArray(imgData.width * imgData.height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const g = 0.3 * imgData.data[i] + 0.59 * imgData.data[i+1] + 0.11 * imgData.data[i+2];
        gray[i/4] = g;
      }
  
      const edges = new Uint8ClampedArray(imgData.width * imgData.height);
      for (let y = 1; y < imgData.height-1; y++) {
        for (let x = 1; x < imgData.width-1; x++) {
          const idx = y * imgData.width + x;
          const gx = gray[idx+1] - gray[idx-1];
          const gy = gray[idx+imgData.width] - gray[idx-imgData.width];
          const mag = Math.hypot(gx, gy);
          edges[idx] = mag > 50 ? 0 : 255;
        }
      }
      
      for (let i = 0; i < imgData.data.length; i += 4) {
        const edgeVal = edges[i/4];
        if (edgeVal === 0) {
          imgData.data[i] = 0;
          imgData.data[i+1] = 0;
          imgData.data[i+2] = 0;
        }
      }
      workingCtx.putImageData(imgData, 0, 0);
      
      posterize(workingCtx, workingCanvas.width, workingCanvas.height, 6);

      if (workingCanvas !== canvas) {
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(workingCanvas, 0, 0, canvas.width, canvas.height);
      }
      const newImg = new Image();
      newImg.src = canvas.toDataURL();
      newImg.onload = () => {
        setOriginalImage(newImg);
        recordTool('cartoon');
      };
    } catch (err) {
      setError('Cartoon effect failed. Try a different image.', err);
    } finally {
      setProcessing(false);
    }
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
        <h2>Cartoon Effect</h2>
        {error && <div className="error-message">{error}</div>}
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        <div className="tool-controls">
          <button onClick={cartoon} disabled={processing}>Apply Cartoon</button>
          <button onClick={download}>Download</button>
          <button onClick={resetToPristine}>Reset</button>
          <button onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
        {processing && <div className="loading-overlay"><div className="spinner"></div><p>Applying cartoon effect...</p></div>}
      </div>
      <Footer />
    </>
  );
}