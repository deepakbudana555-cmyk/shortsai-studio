const { execSync } = require('child_process');
const p = require('@ffmpeg-installer/ffmpeg');
try {
  const out = execSync(`"${p.path}" -version`, { encoding: 'utf8' });
  console.log('FFmpeg works:', out.slice(0, 100));
} catch(e) {
  console.error('FFmpeg failed:', e.message);
}
