import { Routes, Route } from 'react-router-dom';
import { ImageProvider } from './contexts/ImageContext';
import Home from './pages/Home';
import Editor from './pages/Editor';
import ToolsSelector from './pages/ToolsSelector';
import ResizeTool from './pages/tools/ResizeTool';
import RotateTool from './pages/tools/RotateTool';
import GrayscaleTool from './pages/tools/GrayscaleTool';
import CropTool from './pages/tools/CropTool';
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
        <Route path="/tools/rotate" element={<RotateTool />} />
        <Route path="/tools/grayscale" element={<GrayscaleTool />} />
        <Route path="/tools/crop" element={<CropTool />} />
        <Route path="/tools/remove-bg" element={<BackgroundRemovalTool />} />
        <Route path="/tools/cartoon" element={<CartoonTool />} />
      </Routes>
    </ImageProvider>
  );
}