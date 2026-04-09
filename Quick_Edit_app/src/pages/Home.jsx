import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const nav = useNavigate();

  const features = [
    { name: 'Background Removal', icon: '🎭', path: '/editor' },
    { name: 'Cartoon Effect', icon: '🎨', path: '/editor' },
    { name: 'Crop', icon: '✂️', path: '/editor' },
    { name: 'Grayscale', icon: '⚫', path: '/editor' },
    { name: 'Resize', icon: '🔍', path: '/editor' },
    { name: 'Rotate', icon: '🔄', path: '/editor' },
  ];

  return (
    <>
      <Navbar />
      <div className="home">
        <div className="hero">
          <h1>Professional Image Editing Made Simple</h1>
          <p>Transform your photos with ease and smooth. Remove backgrounds, apply filters, black and white conversion, and much more—all in your browser, instantly.</p>
          <button className="cta-button" onClick={() => nav('/editor')}>
            Edit Photos for Free
          </button>
        </div>

        <div className="features-section">
          <h2>Our Features</h2>
          <div className="features-grid">
            {features.map((feat) => (
              <div key={feat.name} className="feature-card" onClick={() => nav(feat.path)}>
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}