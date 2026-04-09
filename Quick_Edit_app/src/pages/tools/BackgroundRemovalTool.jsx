import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import { resizeCanvasIfNeeded } from '../../utils/imageHelpers';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/tool.css';

export default function BackgroundRemovalTool() {
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

  const removeBg = async () => {
    if (!window.cv || !window.cv.Mat) {
      setError('OpenCV not loaded. Please refresh.');
      return;
    }
    setProcessing(true);
    setError(null);
    const canvas = canvasRef.current;
    const cv = window.cv;

    await new Promise(resolve => setTimeout(resolve, 50));

    const maxDim = 300;
    let workingCanvas = canvas;
    if (canvas.width > maxDim || canvas.height > maxDim) {
      const scaled = resizeCanvasIfNeeded(canvas, maxDim);
      if (scaled) workingCanvas = scaled.tempCanvas;
    }

    try {
      const src = cv.imread(workingCanvas);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const mask = new cv.Mat();
      cv.threshold(gray, mask, 200, 255, cv.THRESH_BINARY_INV);
      const dst = new cv.Mat();
      src.copyTo(dst, mask);
      cv.imshow(workingCanvas, dst);
      src.delete(); gray.delete(); mask.delete(); dst.delete();

      if (workingCanvas !== canvas) {
        const finalCanvas = canvas;
        finalCanvas.width = originalImage.width;
        finalCanvas.height = originalImage.height;
        const ctx = finalCanvas.getContext('2d');
        ctx.drawImage(workingCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
      }
      const newImg = new Image();
      newImg.src = canvas.toDataURL();
      newImg.onload = () => {
        setOriginalImage(newImg);
        recordTool('remove-bg');
      };
    } catch (err) {
      setError('Background removal failed. Try a different image.', err);
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
        <h2>Background Removal (Threshold)</h2>
        {error && <div className="error-message">{error}</div>}
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        <div className="tool-controls">
          <button onClick={removeBg} disabled={processing}>Remove Background</button>
          <button onClick={download}>Download</button>
          <button onClick={resetToPristine}>Reset</button>
          <button onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
        {processing && <div className="loading-overlay"><div className="spinner"></div><p>Processing...</p></div>}
      </div>
      <Footer />
    </>
  );
}