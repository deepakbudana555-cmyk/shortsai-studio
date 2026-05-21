const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpeg = path.join(__dirname, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
const wavPath = path.join(__dirname, 'public', 'uploads', 'test_tts.wav');
const outPath = path.join(__dirname, 'public', 'uploads', 'test_t2v.mp4');

console.log('WAV exists:', fs.existsSync(wavPath));
console.log('FFmpeg exists:', fs.existsSync(ffmpeg));

// Build a simple 5s test video with audio
const args = [
  '-y',
  '-f', 'lavfi', '-i', 'color=c=0xe91e8c:size=1080x1920:duration=5:rate=30',
  '-i', wavPath,
  '-vf', 'drawbox=x=100:y=800:w=880:h=300:color=black@0.5:t=fill',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
  '-c:a', 'aac', '-shortest',
  '-movflags', '+faststart',
  outPath,
];

console.log('Running FFmpeg...');
const r = spawnSync(ffmpeg, args, { encoding: 'utf8', timeout: 30000 });
console.log('Status:', r.status);
if (r.stderr) console.log('Stderr (last 500):', r.stderr.slice(-500));
console.log('Output exists:', fs.existsSync(outPath));
