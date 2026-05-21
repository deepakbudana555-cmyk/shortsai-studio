const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpeg = path.join(__dirname, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
const uploadDir = path.join(__dirname, 'public', 'uploads');

const id = 'test_final_' + Date.now();
const totalSecs = 15;
const colors = ['0xcc1070', '0xdd4400', '0x8800cc'];
const chunks = ['5 reasons why you', 'should wake up early', 'Start your day right'];

// Step 1: Make 3 segments
const segPaths = [];
for (let i = 0; i < 3; i++) {
  const seg = path.join(uploadDir, `${id}_seg${i}.mp4`);
  const l1 = chunks[i * 2] || '';
  const l2 = chunks[i * 2 + 1] || '';
  const safeL1 = l1.replace(/['"\\:]/g, ' ');
  const safeL2 = l2.replace(/['"\\:]/g, ' ');
  const dur = Math.floor(totalSecs / 3);

  const args = [
    '-y', '-f', 'lavfi', '-i', `color=c=${colors[i]}:size=1080x1920:duration=${dur}:rate=30`,
    '-vf', [
      `drawbox=x=0:y=750:w=1080:h=420:color=black@0.55:t=fill`,
      `drawtext=text='${safeL1}':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=800`,
      `drawtext=text='${safeL2}':fontcolor=yellow:fontsize=48:x=(w-text_w)/2:y=880`,
      `fade=t=in:st=0:d=0.35,fade=t=out:st=${dur - 0.35}:d=0.35`,
    ].join(','),
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-movflags', '+faststart', seg,
  ];

  const r = spawnSync(ffmpeg, args, { encoding: 'utf8', timeout: 30000 });
  console.log(`Seg ${i}: status=${r.status} exists=${fs.existsSync(seg)}`);
  if (!fs.existsSync(seg)) console.log('  Error:', r.stderr?.slice(-300));
  else segPaths.push(seg);
}

// Step 2: Concat
const concatTxt = path.join(uploadDir, `${id}_concat.txt`);
const concatMp4 = path.join(uploadDir, `${id}_raw.mp4`);
fs.writeFileSync(concatTxt, segPaths.map(p => `file '${p.replace(/\\/g,'/')}'`).join('\n'));
const rc = spawnSync(ffmpeg, ['-y','-f','concat','-safe','0','-i',concatTxt,'-c','copy',concatMp4], {encoding:'utf8',timeout:60000});
console.log(`Concat: status=${rc.status} exists=${fs.existsSync(concatMp4)}`);

// Step 3: TTS
const wavPath = path.join(uploadDir, `${id}.wav`);
const ps = `Add-Type -AssemblyName System.Speech\n$s=New-Object System.Speech.Synthesis.SpeechSynthesizer\n$s.SetOutputToWaveFile("${wavPath.replace(/\\/g,'\\\\')}")\n$s.Speak("5 reasons why you should wake up early. Start your day right now.")\n$s.Dispose()\nWrite-Output "DONE"`;
const psFile = wavPath + '.ps1';
fs.writeFileSync(psFile, ps, 'utf8');
const rt = spawnSync('powershell', ['-ExecutionPolicy','Bypass','-File',psFile], {encoding:'utf8',timeout:15000});
try { fs.unlinkSync(psFile); } catch {}
console.log(`TTS: exists=${fs.existsSync(wavPath)} out=${rt.stdout?.trim()}`);

// Step 4: Mux
const finalMp4 = path.join(uploadDir, `${id}.mp4`);
if (fs.existsSync(wavPath) && fs.existsSync(concatMp4)) {
  const rm = spawnSync(ffmpeg, ['-y','-i',concatMp4,'-i',wavPath,'-c:v','copy','-c:a','aac','-shortest','-movflags','+faststart',finalMp4], {timeout:60000});
  console.log(`Mux: status=${rm.status} exists=${fs.existsSync(finalMp4)}`);
}

console.log('\n=== FINAL:', fs.existsSync(finalMp4) ? '✓ SUCCESS → /uploads/' + id + '.mp4' : '✗ FAILED');
