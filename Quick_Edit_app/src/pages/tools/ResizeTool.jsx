import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/tool.css';

export default function ResizeTool() {
  const navigate = useNavigate();
  const { originalImage, canvasRef, setOriginalImage, resetToPristine } = useImage();
  const { recordTool } = useSessionHistory();
  const [scale, setScale] = useState(0.7);
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

  const resize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const newWidth = originalImage.width * scale;
    const newHeight = originalImage.height * scale;
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
    const newImg = new Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setOriginalImage(newImg);
      recordTool('resize');
    };
  };

  const download = () => {
    const canvas = canvasRef.current;
    const mime = downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = downloadFormat === 'jpeg' ? 'jpg' : 'png';
    const link = document.createElement('a');
    link.download = `resized.${ext}`;
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
        <h2>🔍 Resize Tool</h2>
        <div className="tool-controls-group">
          <div className="control-item">
            <label>📏 Scale: {Math.round(scale * 100)}%</label>
            <input type="range" min="0.1" max="2" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
          </div>
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
          <button onClick={resize}>✨ Apply Resize</button>
          <button onClick={download}>📥 Download</button>
          <button onClick={resetToPristine}>🔄 Reset</button>
          <button onClick={() => navigate('/tools')}>⬅ Back to Tools</button>
        </div>
      </div>
      <Footer />
    </>
  );
}