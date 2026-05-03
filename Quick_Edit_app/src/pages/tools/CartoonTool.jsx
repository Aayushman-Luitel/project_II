import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '../../contexts/ImageContext';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/cartoon.css';

export default function CartoonTool() {
  const navigate = useNavigate();
  const { originalImage, setOriginalImage } = useImage();
  const { recordTool } = useSessionHistory();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('anime');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [jpegQuality, setJpegQuality] = useState(0.9);
  const fileInputRef = useRef(null);
  const nextId = useRef(1);
  const contextAdded = useRef(false); // prevents infinite loop

  // Parameter states
  const [edgeThreshold, setEdgeThreshold] = useState(50);
  const [colorLevels, setColorLevels] = useState(8);
  const [blurAmount, setBlurAmount] = useState(0);
  const [saturation, setSaturation] = useState(1.2);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [edgeDarken, setEdgeDarken] = useState(true);

  // Presets
  const presets = {
    anime:   { edgeThreshold:50, colorLevels:8, blurAmount:0, saturation:1.2, brightness:0, contrast:0, edgeDarken:true },
    pencil:  { edgeThreshold:30, colorLevels:2, blurAmount:1, saturation:0,   brightness:10, contrast:20, edgeDarken:true },
    watercolor:{ edgeThreshold:70, colorLevels:10, blurAmount:2, saturation:0.8, brightness:5, contrast:-10, edgeDarken:false },
    oil:     { edgeThreshold:60, colorLevels:6, blurAmount:3, saturation:1.1, brightness:0, contrast:15, edgeDarken:true }
  };

  useEffect(() => {
    const p = presets[selectedStyle];
    if (p) {
      setEdgeThreshold(p.edgeThreshold);
      setColorLevels(p.colorLevels);
      setBlurAmount(p.blurAmount);
      setSaturation(p.saturation);
      setBrightness(p.brightness);
      setContrast(p.contrast);
      setEdgeDarken(p.edgeDarken);
    }
  }, [selectedStyle]);

  // Load image from context only once
  useEffect(() => {
    if (originalImage && !contextAdded.current) {
      contextAdded.current = true;
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0);
      setImages(prev => [...prev, {
        id: nextId.current++,
        originalUrl: canvas.toDataURL(),
        processedCanvas: null,
        fromContext: true
      }]);
    }
  }, [originalImage]);

  // handle files upload (max 4 total)
  const handleFiles = (files) => {
    const currentCount = images.length;
    const available = 4 - currentCount;
    if (available <= 0) {
      setError('Maximum 4 images allowed. Remove some first.');
      return;
    }
    const newImages = Array.from(files).slice(0, available).map((file) => ({
      id: nextId.current++,
      originalUrl: URL.createObjectURL(file),
      processedCanvas: null,
    }));
    setImages(prev => [...prev, ...newImages]);
    setError(null);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // core cartoon processing (unchanged)
  const processCanvas = (canvas, params) => {
    const { edgeThreshold, colorLevels, blurAmount, saturation, brightness, contrast, edgeDarken } = params;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    let imgData = ctx.getImageData(0, 0, width, height);
    let data = imgData.data;

    if (blurAmount > 0) {
      for (let b = 0; b < blurAmount; b++) {
        const temp = new Uint8ClampedArray(data);
        for (let y = 1; y < height-1; y++) {
          for (let x = 1; x < width-1; x++) {
            const idx = (y*width + x)*4;
            let r=0,g=0,b=0;
            for (let dy=-1; dy<=1; dy++) {
              for (let dx=-1; dx<=1; dx++) {
                const nidx = ((y+dy)*width + (x+dx))*4;
                r += temp[nidx];
                g += temp[nidx+1];
                b += temp[nidx+2];
              }
            }
            data[idx] = r/9; data[idx+1] = g/9; data[idx+2] = b/9;
          }
        }
      }
    }

    const step = 255 / (colorLevels - 1);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / step) * step;
      data[i+1] = Math.round(data[i+1] / step) * step;
      data[i+2] = Math.round(data[i+2] / step) * step;
    }

    if (saturation !== 1) {
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3*data[i] + 0.59*data[i+1] + 0.11*data[i+2];
        data[i] = gray + (data[i] - gray) * saturation;
        data[i+1] = gray + (data[i+1] - gray) * saturation;
        data[i+2] = gray + (data[i+2] - gray) * saturation;
      }
    }

    const grayArr = new Uint8ClampedArray(width*height);
    for (let i = 0; i < data.length; i+=4) {
      grayArr[i/4] = 0.3*data[i] + 0.59*data[i+1] + 0.11*data[i+2];
    }
    const edges = new Uint8ClampedArray(width*height);
    for (let y = 1; y < height-1; y++) {
      for (let x = 1; x < width-1; x++) {
        const idx = y*width + x;
        const gx = grayArr[idx+1] - grayArr[idx-1];
        const gy = grayArr[idx+width] - grayArr[idx-width];
        const mag = Math.hypot(gx, gy);
        edges[idx] = mag > edgeThreshold ? 0 : 255;
      }
    }

    for (let i = 0; i < data.length; i+=4) {
      if (edges[i/4] === 0) {
        if (edgeDarken) {
          data[i] = 0; data[i+1] = 0; data[i+2] = 0;
        } else {
          data[i] = 255; data[i+1] = 255; data[i+2] = 255;
        }
      }
    }

    if (brightness !== 0 || contrast !== 0) {
      const factor = 1 + contrast/50;
      for (let i = 0; i < data.length; i+=4) {
        data[i] = Math.min(255, Math.max(0, data[i] * factor + brightness));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] * factor + brightness));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] * factor + brightness));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  const applyToSingle = async (imageObj) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          let workCanvas = canvas;
          const maxDim = 600;
          if (canvas.width > maxDim || canvas.height > maxDim) {
            const scale = Math.min(maxDim/canvas.width, maxDim/canvas.height);
            const w = Math.floor(canvas.width * scale);
            const h = Math.floor(canvas.height * scale);
            const temp = document.createElement('canvas');
            temp.width = w; temp.height = h;
            const tctx = temp.getContext('2d');
            tctx.drawImage(canvas, 0, 0, w, h);
            workCanvas = temp;
          }
          const processed = processCanvas(workCanvas, {
            edgeThreshold, colorLevels, blurAmount, saturation, brightness, contrast, edgeDarken
          });
          if (processed !== canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const finalCtx = canvas.getContext('2d');
            finalCtx.drawImage(processed, 0, 0, img.width, img.height);
          }
          resolve(canvas);
        } catch (err) { reject(err); }
      };
      img.onerror = reject;
      img.src = imageObj.originalUrl;
    });
  };

  const applyToAll = async () => {
    if (images.length === 0) {
      setError('Please add at least one image.');
      return;
    }
    setProcessing(true);
    setError(null);
    const newImages = [...images];
    for (let i = 0; i < newImages.length; i++) {
      try {
        const processedCanvas = await applyToSingle(newImages[i]);
        newImages[i].processedCanvas = processedCanvas;
      } catch (err) {
        setError(`Failed on image ${i+1}: ${err.message}`);
        setProcessing(false);
        return;
      }
    }
    setImages(newImages);
    setProcessing(false);
    recordTool(`cartoon_${selectedStyle}_custom`);
  };

  const downloadImage = (canvas, idx) => {
    const ext = downloadFormat === 'jpeg' ? 'jpg' : 'png';
    const mime = downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = `cartoon_${idx+1}.${ext}`;
    if (downloadFormat === 'jpeg') {
      link.href = canvas.toDataURL(mime, jpegQuality);
    } else {
      link.href = canvas.toDataURL(mime);
    }
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, i) => {
      if (img.processedCanvas) {
        setTimeout(() => downloadImage(img.processedCanvas, i), i*300);
      }
    });
  };

  // ✅ Save the first image (processed or original) to global context before navigating back
  const handleBack = () => {
    if (images.length > 0) {
      const firstImage = images[0];
      if (firstImage.processedCanvas) {
        // Use the processed canvas
        const img = new Image();
        img.src = firstImage.processedCanvas.toDataURL();
        img.onload = () => {
          setOriginalImage(img);
          navigate('/tools');
        };
      } else {
        // Use the original image
        const img = new Image();
        img.src = firstImage.originalUrl;
        img.onload = () => {
          setOriginalImage(img);
          navigate('/tools');
        };
      }
    } else {
      // No images, just go back
      navigate('/tools');
    }
  };

  return (
    <>
      <Navbar />
      <div className="cartoon-container">
        <h2>🎨 AI Cartoon Studio</h2>
        <div className="cartoon-controls">
          <div className="control-group">
            <label>Style Preset</label>
            <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}>
              <option value="anime">Anime</option>
              <option value="pencil">Pencil Sketch</option>
              <option value="watercolor">Watercolor</option>
              <option value="oil">Oil Painting</option>
            </select>
          </div>
          <div className="control-group">
            <label>Edge Threshold: {edgeThreshold}</label>
            <input type="range" min="10" max="200" step="5" value={edgeThreshold} onChange={e => setEdgeThreshold(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Color Levels: {colorLevels}</label>
            <input type="range" min="2" max="16" step="1" value={colorLevels} onChange={e => setColorLevels(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Blur: {blurAmount}</label>
            <input type="range" min="0" max="4" step="1" value={blurAmount} onChange={e => setBlurAmount(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Saturation: {saturation.toFixed(1)}</label>
            <input type="range" min="0" max="2" step="0.05" value={saturation} onChange={e => setSaturation(parseFloat(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Brightness: {brightness}</label>
            <input type="range" min="-100" max="100" step="5" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Contrast: {contrast}</label>
            <input type="range" min="-50" max="50" step="5" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Edge Style</label>
            <select value={edgeDarken} onChange={e => setEdgeDarken(e.target.value === 'true')}>
              <option value="true">Dark Outlines</option>
              <option value="false">Light Outlines</option>
            </select>
          </div>
          <div className="control-group">
            <label>Download Format</label>
            <select value={downloadFormat} onChange={e => setDownloadFormat(e.target.value)}>
              <option value="png">PNG (lossless)</option>
              <option value="jpeg">JPEG (compressed)</option>
            </select>
          </div>
          {downloadFormat === 'jpeg' && (
            <div className="control-group">
              <label>JPEG Quality: {Math.round(jpegQuality*100)}%</label>
              <input type="range" min="0.1" max="1" step="0.01" value={jpegQuality} onChange={e => setJpegQuality(parseFloat(e.target.value))} />
            </div>
          )}
        </div>
        <div className="batch-upload">
          <input type="file" accept="image/*" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          <button onClick={() => fileInputRef.current.click()}>📁 Add Images (max 4 total)</button>
          {images.length > 0 && <button onClick={applyToAll} disabled={processing}>✨ Apply Cartoon to All</button>}
          {images.length > 0 && <button onClick={downloadAll}>💾 Download All</button>}
          <button onClick={handleBack}>⬅ Back to Tools</button>  {/* ✅ use handleBack */}
        </div>
        <div className="image-grid">
          {images.map((img, idx) => (
            <div key={img.id} className="image-card">
              <div className="image-preview">
                {img.processedCanvas ? (
                  <img src={img.processedCanvas.toDataURL()} alt="processed" />
                ) : (
                  <img src={img.originalUrl} alt="original" />
                )}
              </div>
              <div className="image-actions">
                {img.processedCanvas && <button onClick={() => downloadImage(img.processedCanvas, idx)}>⬇ Download</button>}
                <button onClick={() => removeImage(img.id)}>🗑 Remove</button>
              </div>
            </div>
          ))}
        </div>
        {processing && <div className="loading-overlay"><div className="spinner"></div><p>Applying cartoon style...</p></div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      <Footer />
    </>
  );
}