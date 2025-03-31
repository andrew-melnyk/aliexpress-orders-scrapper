import fs from 'fs';
import { createCanvas } from 'canvas';

// Function to create an icon
function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = '#D3031C';  // AliExpress red
    ctx.fillRect(0, 0, size, size);

    // Set text properties
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.floor(size * 0.6)}px Arial`;

    // Draw the 'A'
    ctx.fillText('A', size/2, size/2);

    return canvas.toBuffer();
}

// Generate icons in different sizes
[16, 48, 128].forEach(size => {
    const iconBuffer = createIcon(size);
    fs.writeFileSync(`icons/icon${size}.png`, iconBuffer);
}); 