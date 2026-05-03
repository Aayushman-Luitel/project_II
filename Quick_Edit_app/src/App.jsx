import { Routes, Route } from 'react-router-dom';
import { ImageProvider } from './contexts/ImageContext';
import Home from './pages/Home';
import Editor from './pages/Editor';
import ToolsSelector from './pages/ToolsSelector';
import ResizeTool from './pages/tools/ResizeTool';
import GrayscaleTool from './pages/tools/GrayscaleTool';
import BackgroundRemovalTool from './pages/tools/BackgroundRemovalTool';
import CartoonTool from './pages/tools/CartoonTool';

export default function App() {
  return (
    <ImageProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/tools" element={<ToolsSelector />} />
        <Route path="/tools/resize" element={<ResizeTool />} />
        <Route path="/tools/grayscale" element={<GrayscaleTool />} />
        <Route path="/tools/remove-bg" element={<BackgroundRemovalTool />} />
        <Route path="/tools/cartoon" element={<CartoonTool />} />
      </Routes> 
    </ImageProvider>
  );
}