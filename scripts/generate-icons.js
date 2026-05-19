import { Jimp } from 'jimp';
import path from 'path';

async function generateIcons() {
  try {
    const logoPath = path.resolve('public/IB_LOGO.png');
    console.log('Reading base logo:', logoPath);
    const img = await Jimp.read(logoPath);
    
    console.log(`Original logo dimensions: ${img.width}x${img.height}`);
    
    // We want the logo to occupy at most 80% of the square canvas height/width to respect PWA safe zones.
    // Since height (1521) is larger than width (818), height is the limiting factor.
    const maxDim = Math.max(img.width, img.height);
    const canvasSize = Math.ceil(maxDim / 0.80);
    
    console.log(`Creating canvas of size: ${canvasSize}x${canvasSize}`);
    const canvas = new Jimp({
      width: canvasSize,
      height: canvasSize,
      color: 0x09090bff // solid dark black background matching app theme (#09090b)
    });
    
    const x = Math.round((canvasSize - img.width) / 2);
    const y = Math.round((canvasSize - img.height) / 2);
    
    console.log(`Compositing logo at x: ${x}, y: ${y}`);
    canvas.composite(img, x, y);
    
    const targets = [
      { size: 512, name: 'icon.png' },
      { size: 512, name: 'icon-512.png' },
      { size: 192, name: 'icon-192.png' },
      { size: 180, name: 'apple-icon.png' }
    ];
    
    for (const target of targets) {
      const outputPath = path.resolve('public', target.name);
      console.log(`Generating ${target.size}x${target.size} icon: ${outputPath}`);
      const resized = canvas.clone().resize({ w: target.size, h: target.size });
      await resized.write(outputPath);
    }
    
    console.log('PWA Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
