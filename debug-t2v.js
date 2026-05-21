const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpeg = path.join(__dirname, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
const uploadDir = path.join(__dirname, 'public', 'uploads');
const outPath = path.join(uploadDir, 'debug_scene.mp4');

// Test 1: Simple color video (no drawtext)
console.log('\n=== Test 1: Simple color video ===');
let r = spawnSync(ffmpeg, [
  '-y', '-f', 'lavfi', '-i', 'color=c=0xe91e8c:size=1080x1920:duration=5:rate=30',
  '-vf', 'fade=t=in:st=0:d=0.4',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-movflags', '+faststart',
  outPath
], { encoding: 'utf8', timeout: 30000 });
console.log('Status:', r.status, '| File:', fs.existsSync(outPath));
if (r.status !== 0) console.log('Error:', r.stderr?.slice(-400));

// Test 2: With drawtext
const out2 = path.join(uploadDir, 'debug_drawtext.mp4');
console.log('\n=== Test 2: drawtext filter ===');
r = spawnSync(ffmpeg, [
  '-y', '-f', 'lavfi', '-i', 'color=c=0xe91e8c:size=1080x1920:duration=5:rate=30',
  '-vf', "drawtext=text='Hello World':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=(h-text_h)/2",
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-movflags', '+faststart',
  out2
], { encoding: 'utf8', timeout: 30000 });
console.log('Status:', r.status, '| File:', fs.existsSync(out2));
if (r.status !== 0) console.log('Error:', r.stderr?.slice(-600));

// Test 3: drawbox only (no fonts needed)
const out3 = path.join(uploadDir, 'debug_drawbox.mp4');
console.log('\n=== Test 3: drawbox only ===');
r = spawnSync(ffmpeg, [
  '-y', '-f', 'lavfi', '-i', 'color=c=0xe91e8c:size=1080x1920:duration=5:rate=30',
  '-vf', 'drawbox=x=80:y=800:w=920:h=300:color=black@0.5:t=fill',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-movflags', '+faststart',
  out3
], { encoding: 'utf8', timeout: 30000 });
console.log('Status:', r.status, '| File:', fs.existsSync(out3));
if (r.status !== 0) console.log('Error:', r.stderr?.slice(-400));

// Test 4: concat two segments
const seg1 = path.join(uploadDir, 'seg_0_debug.mp4');
const seg2 = path.join(uploadDir, 'seg_1_debug.mp4');
const concatFile = path.join(uploadDir, 'concat_debug.txt');
const concatOut = path.join(uploadDir, 'debug_concat.mp4');
console.log('\n=== Test 4: concat ===');
// Create seg1
spawnSync(ffmpeg, ['-y','-f','lavfi','-i','color=c=0xe91e8c:size=1080x1920:duration=5:rate=30','-c:v','libx264','-preset','fast','-crf','22',seg1], {timeout:30000});
// Create seg2
spawnSync(ffmpeg, ['-y','-f','lavfi','-i','color=c=0x0a0f1e:size=1080x1920:duration=5:rate=30','-c:v','libx264','-preset','fast','-crf','22',seg2], {timeout:30000});
fs.writeFileSync(concatFile, `file '${seg1.replace(/\\/g,'/')}'\nfile '${seg2.replace(/\\/g,'/')}'`);
r = spawnSync(ffmpeg, ['-y','-f','concat','-safe','0','-i',concatFile,'-c','copy',concatOut], {encoding:'utf8',timeout:60000});
console.log('Status:', r.status, '| File:', fs.existsSync(concatOut));
if (r.status !== 0) console.log('Error:', r.stderr?.slice(-400));

console.log('\nDone!');
