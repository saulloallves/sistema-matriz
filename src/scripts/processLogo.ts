import { removeBackground, loadImage } from '../utils/removeBackground';

async function processLogoHeader() {
  try {
    // Load the header logo
    const response = await fetch('/src/assets/logo-header.png');
    const blob = await response.blob();
    const image = await loadImage(blob);
    
    // Remove background
    console.log('Processing logo-header.png...');
    const resultBlob = await removeBackground(image);
    
    // Create download link
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logo-header-no-bg.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Logo processado com sucesso!');
  } catch (error) {
    console.error('Erro ao processar logo:', error);
  }
}

// Execute if running in browser
if (typeof window !== 'undefined') {
  processLogoHeader();
}
