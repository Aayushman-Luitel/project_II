import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/tool.css';

export default function RotateTool() {
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

  const rotate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const temp = document.createElement('canvas');
    const tctx = temp.getContext('2d');
    temp.width = canvas.height;
    temp.height = canvas.width;
    tctx.translate(temp.width / 2, temp.height / 2);
    tctx.rotate(Math.PI / 2);
    tctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    canvas.width = temp.width;
    canvas.height = temp.height;
    ctx.drawImage(temp, 0, 0);
    const newImg = new Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setOriginalImage(newImg);
      recordTool('rotate');
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
        <h2>Rotate Tool</h2>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        <div className="tool-controls">
          <button onClick={rotate}>Rotate 90°</button>
          <button onClick={download}>Download</button>
          <button onClick={resetToPristine}>Reset</button>
          <button onClick={() => navigate('/tools')}>Back to Tools</button>
        </div>
      </div>
      <Footer />
    </>
  );
}