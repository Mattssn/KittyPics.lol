const express = require('express');
const sharp = require('sharp');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('.')); // serve static files like index.html

async function addWatermark(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const image = sharp(Buffer.from(buffer));
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Create text overlay
    const text = 'kittypics.lol';
    const fontSize = 20;
    const textSvg = `<svg width="${width}" height="50">
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)"/>
      <text x="${width / 2}" y="30" font-size="${fontSize}" fill="white" font-family="Arial" text-anchor="middle">${text}</text>
    </svg>`;

    const watermarked = await image
      .composite([{ input: Buffer.from(textSvg), gravity: 'south' }])
      .png()
      .toBuffer();

    return watermarked;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
}

app.get('/breeds', async (req, res) => {
  try {
    const response = await fetch('https://api.thecatapi.com/v1/breeds');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching breeds');
  }
});

app.get('/images/search', async (req, res) => {
  try {
    const query = req.url.split('/search')[1] || '';
    const url = 'https://api.thecatapi.com/v1/images/search' + query;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching images');
  }
});

app.get('/cat', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.query.url);
    const buffer = await addWatermark(imageUrl);
    res.type('png').send(buffer);
  } catch (error) {
    res.status(500).send('Error processing image');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});