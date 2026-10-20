const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourcePath = path.join(__dirname, '..', 'public', 'ma-gogas.jpeg');

async function createCircularMask(size, radiusRatio = 0.884) {
  const r = Math.round((size / 2) * radiusRatio);
  const cx = Math.round(size / 2);
  const cy = Math.round(size / 2);
  const svg = `<svg width="${size}" height="${size}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" /></svg>`;
  return Buffer.from(svg);
}

async function run() {
  console.log('🚀 Generating all web and Android assets from', sourcePath);

  // 1. Generate transparent-corner version of emblem
  const origMeta = await sharp(sourcePath).metadata();
  const baseSize = origMeta.width; // 1254
  const maskBuffer = await createCircularMask(baseSize, 0.886);

  // High quality circular transparent emblem
  const circularEmblem = await sharp(sourcePath)
    .composite([{ input: maskBuffer, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Update public/logo.png (512x512)
  await sharp(circularEmblem)
    .resize(512, 512, { fit: 'contain' })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'logo.png'));
  console.log('✅ Created public/logo.png (512x512)');

  // 3. Update assets/logo.png (512x512)
  await sharp(circularEmblem)
    .resize(512, 512, { fit: 'contain' })
    .png()
    .toFile(path.join(__dirname, '..', 'assets', 'logo.png'));
  console.log('✅ Created assets/logo.png (512x512)');

  // 4. Android Mipmaps
  const mipmapDensities = [
    { dir: 'mipmap-ldpi', iconSize: 36, adaptiveSize: 81 },
    { dir: 'mipmap-mdpi', iconSize: 48, adaptiveSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, adaptiveSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, adaptiveSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, adaptiveSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, adaptiveSize: 432 },
  ];

  const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

  for (const { dir, iconSize, adaptiveSize } of mipmapDensities) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) continue;

    // ic_launcher.png (legacy square/standard icon on white)
    await sharp(sourcePath)
      .resize(iconSize, iconSize, { fit: 'contain', background: '#ffffff' })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png (legacy round icon)
    await sharp(circularEmblem)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (adaptive foreground)
    await sharp(circularEmblem)
      .resize(adaptiveSize, adaptiveSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    // ic_launcher_background.png (pure white background)
    await sharp({
      create: {
        width: adaptiveSize,
        height: adaptiveSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_background.png'));

    console.log(`✅ Generated mipmap icons for ${dir}`);
  }

  // 5. Android Splash Screens
  const drawables = fs.readdirSync(resDir).filter((f) => f.startsWith('drawable'));
  for (const d of drawables) {
    const splashPath = path.join(resDir, d, 'splash.png');
    if (!fs.existsSync(splashPath)) continue;

    const meta = await sharp(splashPath).metadata();
    const width = meta.width;
    const height = meta.height;
    const isNight = d.includes('night');
    const bg = isNight ? { r: 17, g: 17, b: 17, alpha: 1 } : { r: 255, g: 255, b: 255, alpha: 1 };

    // Logo size in splash: ~45% of min dimension
    const minDim = Math.min(width, height);
    const logoSize = Math.max(80, Math.round(minDim * 0.45));

    const resizedLogo = await sharp(circularEmblem)
      .resize(logoSize, logoSize, { fit: 'contain' })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: bg,
      },
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(splashPath);

    console.log(`✅ Generated splash for ${d} (${width}x${height}, isNight: ${isNight})`);
  }

  console.log('🎉 All web & Android icons and splash assets successfully generated!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
