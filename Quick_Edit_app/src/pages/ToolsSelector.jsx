import { useNavigate } from 'react-router-dom';
import { useImage } from '../contexts/ImageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CanvasPreview from '../components/CanvasPreview';
import '../styles/tool.css';

const tools = [
  { name: 'Resize', path: '/tools/resize', icon: '🔍' },
  { name: 'Grayscale', path: '/tools/grayscale', icon: '⚫' },
  { name: 'Background Removal', path: '/tools/remove-bg', icon: '🎭' },
  { name: 'Cartoon Effect', path: '/tools/cartoon', icon: '🎨' },
];

export default function ToolsSelector() {
  const navigate = useNavigate();
  const { originalImage } = useImage();

  if (!originalImage) {
    navigate('/editor');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="tools-selector">
        <div className="canvas-preview">
          <CanvasPreview />
        </div>
        <div className="tools-grid">
          {tools.map(tool => (
            <div key={tool.path} className="tool-card" onClick={() => navigate(tool.path)}>
              <div className="tool-icon">{tool.icon}</div>
              <h3>{tool.name}</h3>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}