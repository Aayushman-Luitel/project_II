import { createContext, useContext, useState, useRef } from 'react';

const ImageContext = createContext();

export function ImageProvider({ children }) {
    const [originalImage, setOriginalImage] = useState(null);
    const [pristineImage, setPristineImage] = useState(null);
    const canvasRef = useRef(null);
  
    const resetToPristine = () => {
      if (pristineImage) {
        setOriginalImage(pristineImage);
      }
    };
  
    return (
      <ImageContext.Provider value={{
        originalImage, setOriginalImage,
        pristineImage, setPristineImage,
        resetToPristine,
        canvasRef
      }}>
        {children}
      </ImageContext.Provider>
    );
  }

// eslint-disable-next-line react-refresh/only-export-components
export function useImage() {
  return useContext(ImageContext);
}