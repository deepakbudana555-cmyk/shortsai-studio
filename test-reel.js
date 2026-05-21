const { spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ffmpeg = path.join(__dirname, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
const uploadDir = path.join(__dirname, 'public', 'uploads');

// Test 1: Impact font exists?
const impactFont = 'C:/Windows/Fonts/impact.ttf';
const arialBold = 'C:/Windows/Fonts/arialbd.ttf';
console.log('Impact font:', fs.existsSync(impactFont) ? '✓' : '✗');
console.log('Arial Bold:', fs.existsSync(arialBold) ? '✓' : '✗');

// Test 2: Download image
async function test() {
  const imgPath = path.join(uploadDir, 'test_bg.jpg');
  console.log('\nDownloading background image...');
  try {
    const res = await fetch('https://picsum.photos/seed/200/1080/1920.jpg');
    const buf = await res.arrayBuffer();
    fs.writeFileSync(imgPath, Buffer.from(buf));
    console.log('Image downloaded:', fs.existsSync(imgPath), fs.statSync(imgPath).size, 'bytes');
  } catch(e) {
    console.log('Download failed:', e.message);
    return;
  }

  // Test 3: FFmpeg with image + Impact font + Ken Burns
  const outPath = path.join(uploadDir, 'test_reel_final.mp4');
  console.log('\nRendering reel with image + font...');
  
  const vf = [
    'scale=1200:2133:force_original_aspect_ratio=increase',
    'crop=1080:1920',
    "zoompan=z='min(zoom+0.0015,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30",
    'drawbox=x=0:y=0:w=1080:h=1920:color=black@0.45:t=fill',
    'drawbox=x=0:y=1500:w=1080:h=420:color=black@0.75:t=fill',
    "drawtext=fontfile='C\\:/Windows/Fonts/impact.ttf':text='5 REASONS TO WAKE':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=1530:borderw=3:bordercolor=black@0.8",
    "drawtext=fontfile='C\\:/Windows/Fonts/impact.ttf':text='UP AT 5AM':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=1625:borderw=3:bordercolor=black@0.8",
    "drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':text='#productivity #viral':fontcolor=yellow:fontsize=44:x=(w-text_w)/2:y=1720:borderw=2:bordercolor=black",
    'fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5',
  ].join(',');

  const r = spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-t', '5', '-i', imgPath,
    '-vf', vf,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-r', '30',
    '-movflags', '+faststart', outPath,
  ], { encoding: 'utf8', timeout: 60000 });

  console.log('Status:', r.status, '| Output:', fs.existsSync(outPath));
  if (r.status !== 0) console.log('Error:', r.stderr?.slice(-500));
  else console.log('\n✓ Test reel created at: /uploads/test_reel_final.mp4');

  // Cleanup
  try { fs.unlinkSync(imgPath); } catch {}
}

test();
