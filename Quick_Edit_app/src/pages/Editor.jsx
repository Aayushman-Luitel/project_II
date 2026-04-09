import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../contexts/ImageContext';
import { sessionApi } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SampleImages from '../components/SampleImages';
import '../styles/editor.css';

export default function Editor() {
  const navigate = useNavigate();
  const { setOriginalImage, setPristineImage } = useImage();
  const [dragActive, setDragActive] = useState(false);

  const handleImage = useCallback(async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      setOriginalImage(img);
      setPristineImage(img);
      // Create session for this user
      try {
        await sessionApi.create('editor');
        console.log('Session created');
      } catch (err) {
        console.error('Session creation failed:', err);
      }
      navigate('/tools');
    };
  }, [setOriginalImage, setPristineImage, navigate]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  }, [handleImage]);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = () => setDragActive(false);

  const loadSample = (url) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
        handleImage(file);
      });
  };

  return (
    <>
      <Navbar />
      <div className="editor-page">
        <div className={`upload-area ${dragActive ? 'drag-active' : ''}`}
             onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
          <div className="upload-content">
            <span className="upload-icon">📸</span>
            <h3>Drag or upload your own images</h3>
            <input type="file" id="file-input" accept="image/*"
                   onChange={(e) => e.target.files[0] && handleImage(e.target.files[0])}
                   style={{ display: 'none' }} />
            <label htmlFor="file-input" className="upload-btn">Upload Image</label>
          </div>
        </div>
        <div className="sample-section">
          <p>No photo? Try one of ours.</p>
          <SampleImages onSelect={loadSample} />
        </div>
      </div>
      <Footer />
    </>
  );
}