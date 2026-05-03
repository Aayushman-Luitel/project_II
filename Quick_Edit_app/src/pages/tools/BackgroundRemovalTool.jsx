import React, { useEffect, useState } from 'react';
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
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [jpegQuality, setJpegQuality] = useState(0.9);

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
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(workingCanvas, 0, 0, canvas.width, canvas.height);
      }
      const newImg = new Image();
      newImg.src = canvas.toDataURL();
      newImg.onload = () => {
        setOriginalImage(newImg);
        recordTool('remove-bg');
      };
    } catch (err) {
      setError('Background removal failed. Try a different image.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    const mime = downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = downloadFormat === 'jpeg' ? 'jpg' : 'png';
    const link = document.createElement('a');
    link.download = `bg_removed.${ext}`;
    if (downloadFormat === 'jpeg') {
      link.href = canvas.toDataURL(mime, jpegQuality);
    } else {
      link.href = canvas.toDataURL(mime);
    }
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="tool-container">
        <h2>🎭 Background Removal</h2>
        <div className="tool-controls-group">
          <div className="control-item">
            <label>💾 Download as:</label>
            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
          {downloadFormat === 'jpeg' && (
            <div className="control-item">
              <label>✨ JPEG Quality: {Math.round(jpegQuality*100)}%</label>
              <input type="range" min="0.1" max="1" step="0.01" value={jpegQuality} onChange={(e) => setJpegQuality(parseFloat(e.target.value))} />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        <div className="action-buttons">
          <button onClick={removeBg} disabled={processing}>✨ Remove Background</button>
          <button onClick={download}>📥 Download</button>
          <button onClick={resetToPristine}>🔄 Reset</button>
          <button onClick={() => navigate('/tools')}>⬅ Back to Tools</button>
        </div>
        {processing && <div className="loading-overlay"><div className="spinner"></div><p>Processing...</p></div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      <Footer />
    </>
  );
}