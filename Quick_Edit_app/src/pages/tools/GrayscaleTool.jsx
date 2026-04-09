import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/tool.css';

export default function GrayscaleTool() {
  const navigate = useNavigate();
  const { originalImage, canvasRef, setOriginalImage, resetToPristine } = useImage();
  const { recordTool } = useSessionHistory();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
  }, [canvasRef, originalImage]);

  const toGrayscale = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const gray = 0.3 * imgData.data[i] + 0.59 * imgData.data[i+1] + 0.11 * imgData.data[i+2];
      imgData.data[i] = gray;
      imgData.data[i+1] = gray;
      imgData.data[i+2] = gray;
    }
    ctx.putImageData(imgData, 0, 0);
    const newImg = new Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setOriginalImage(newImg);
      recordTool('grayscale');
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
        <h2>Grayscale Tool</h2>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        <div className="tool-controls">
          <button onClick={toGrayscale}>Convert to Grayscale</button>
          <button onClick={download}>Download</button>
          <button onClick={resetToPristine}>Reset</button>
          <button onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
      </div>
      <Footer />
    </>
  );
}