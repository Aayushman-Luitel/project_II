import { useEffect, useState } from 'react';
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
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="tool-container">
        <h2>Resize Tool</h2>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        <div className="tool-controls">
          <label>
            Scale: {Math.round(scale * 100)}%
            <input type="range" min="0.1" max="2" step="0.01" value={scale}
                   onChange={(e) => setScale(parseFloat(e.target.value))} />
          </label>
          <button onClick={resize}>Apply Resize</button>
          <button onClick={download}>Download</button>
          <button onClick={resetToPristine}>Reset</button>
          <button onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
      </div>
      <Footer />
    </>
  );
}