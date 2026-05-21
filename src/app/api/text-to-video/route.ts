import { NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync, unlinkSync, copyFileSync } from 'fs';

function getFFmpegPath(): string {
  const platform = process.platform + '-' + process.arch;
  const binary = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  
  const paths = [
    join(process.cwd(), 'node_modules', '@ffmpeg-installer', platform, binary),
    join(process.cwd(), '..', 'node_modules', '@ffmpeg-installer', platform, binary),
    join(__dirname, '..', '..', '..', 'node_modules', '@ffmpeg-installer', platform, binary),
    join(__dirname, '..', '..', 'node_modules', '@ffmpeg-installer', platform, binary),
    join(__dirname, '..', 'node_modules', '@ffmpeg-installer', platform, binary),
    join(__dirname, 'node_modules', '@ffmpeg-installer', platform, binary),
  ];

  for (const p of paths) {
    if (existsSync(p)) {
      return p;
    }
  }
  return binary; // fallback
}

const ffmpegPath = getFFmpegPath();


const FONTS = {
  impact:    'C\\:/Windows/Fonts/impact.ttf',
  arialBold: 'C\\:/Windows/Fonts/arialbd.ttf',
  verdana:   'C\\:/Windows/Fonts/verdanab.ttf',
};

const STYLE_OVERLAY: Record<string, string> = {
  cinematic: 'black@0.60',
  viral:     'black@0.45',
  news:      'black@0.70',
  neon:      'black@0.65',
  nature:    'black@0.35',
  minimal:   'black@0.15',
};

const STYLE_ACCENT: Record<string, string> = {
  cinematic: '0x4488ff',
  viral:     'yellow',
  news:      'white',
  neon:      '0x00ffff',
  nature:    '0x88ffaa',
  minimal:   '0x222222',
};

const DURATION_SECS: Record<string, number> = {
  '15s': 15, '30s': 30, '45s': 45, '60s': 60,
};

// Image art style → Pollinations.ai prompt suffix
const IMAGE_STYLE_PROMPTS: Record<string, string> = {
  realistic:  'ultra realistic professional photography, 8K, sharp focus, DSLR',
  sketch:     'detailed pencil sketch, hand-drawn, artistic pencil drawing, black and white',
  watercolor: 'beautiful watercolor painting, soft brushstrokes, watercolor illustration, artistic',
  oilpaint:   'oil painting, thick impasto brushstrokes, classical oil painting, museum quality art',
  anime:      'anime art style, detailed anime illustration, Studio Ghibli inspired, vibrant',
  comic:      'comic book art, bold ink lines, pop art style, Marvel comic illustration',
  '3d':       '3D render, Cinema 4D, octane render, photorealistic CGI, volumetric lighting',
  filmnoir:   'black and white film noir, dramatic shadows, high contrast monochrome photography',
  fantasy:    'epic fantasy art, magical atmosphere, digital concept art, ArtStation trending',
  digital:    'vibrant digital painting, digital concept art, highly detailed illustration',
  vintage:    'vintage retro film photograph, Kodak film grain, faded colors, nostalgic 1970s',
  minimalist: 'minimalist flat design, clean vector illustration, simple geometric shapes',
};

// Build AI image prompt combining scene content + art style
function buildImagePrompt(sceneText: string, style: string, imageStyle: string): string {
  const styleHints: Record<string, string> = {
    cinematic: 'dramatic lighting, dark moody atmosphere',
    viral:     'vibrant energetic colors, social media aesthetic',
    news:      'professional editorial setting, clean',
    neon:      'neon cyberpunk atmosphere, glowing lights',
    nature:    'golden hour, beautiful natural landscape',
    minimal:   'clean minimalist setting, simple elegant',
  };
  const styleHint = styleHints[style] || '';
  const artStyle = IMAGE_STYLE_PROMPTS[imageStyle] || IMAGE_STYLE_PROMPTS.realistic;
  return `${sceneText}, ${styleHint}, ${artStyle}, 9:16 vertical portrait, no text, no watermark`;
}

// Generate AI image using Pollinations.ai (free, no API key)
async function generateAIImage(sceneText: string, style: string, imageStyle: string, destPath: string): Promise<boolean> {
  const imagePrompt = buildImagePrompt(sceneText, style, imageStyle);
  console.log(`[AI-IMG] "${imagePrompt.slice(0, 70)}…"`);

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ShortsAI/1.0' } });
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) return false;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 5000) return false;
    writeFileSync(destPath, Buffer.from(buf));
    console.log(`[AI-IMG] ✓ ${(buf.byteLength / 1024).toFixed(0)}KB`);
    return existsSync(destPath);
  } catch (e: any) {
    console.warn(`[AI-IMG] Failed: ${e.message}`);
    return false;
  }
}

// Human-sounding TTS using Windows Neural voices with SSML
function generateTTS(text: string, wavPath: string): boolean {
  const safe = text
    .replace(/&/g, 'and')
    .replace(/[<>'"`;]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .slice(0, 600);

  // SSML with prosody for more natural speech + try neural voices first
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <prosody rate="0.95" pitch="+2st" volume="loud">
    <s>${safe}</s>
  </prosody>
</speak>`.replace(/\n/g, ' ');

  const ps = `
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $s.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }

# Prefer neural voices (Windows 11 / updated Win10)
$neuralVoices = $voices | Where-Object { $_ -match 'Neural' }
$preferredVoices = @('Microsoft AvaNeural', 'Microsoft JennyNeural', 'Microsoft GuyNeural',
                     'Microsoft AriaNeural', 'Microsoft EricNeural', 'Microsoft ChristopherNeural')

$selectedVoice = $null
foreach ($pv in $preferredVoices) {
  if ($voices -contains $pv) { $selectedVoice = $pv; break }
}
if (-not $selectedVoice -and $neuralVoices) { $selectedVoice = $neuralVoices[0] }
if (-not $selectedVoice) { $selectedVoice = 'Microsoft David Desktop' }

Write-Host "Using voice: $selectedVoice"
$s.SelectVoice($selectedVoice)
$s.Rate = -1
$s.Volume = 100
$s.SetOutputToWaveFile("${wavPath.replace(/\\/g, '\\\\')}")

$ssml = '${ssml.replace(/'/g, "''")}'
try {
  $s.SpeakSsml($ssml)
} catch {
  $s.Speak("${safe.replace(/'/g, "''")}") 
}
$s.Dispose()
Write-Host "DONE"
`;

  const tmp = wavPath + '.ps1';
  writeFileSync(tmp, ps, 'utf8');
  const r = spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-File', tmp], { encoding: 'utf8', timeout: 60000 });
  try { unlinkSync(tmp); } catch {}
  console.log('[TTS]', r.stdout?.trim()?.split('\n').slice(-2).join(' '));
  return existsSync(wavPath);
}

// Build one professional scene
function buildScene(
  imagePath: string | null,
  overlayOpacity: string,
  accentColor: string,
  lines: string[],
  sceneDuration: number,
  outPath: string
): boolean {
  const clean = (s: string) => s.replace(/['"\\:]/g, ' ').replace(/[^\x20-\x7E]/g, '').slice(0, 32);
  const dur = sceneDuration;

  let inputArgs: string[];
  let baseFilter: string;

  if (imagePath && existsSync(imagePath)) {
    inputArgs = ['-loop', '1', '-t', String(dur), '-i', imagePath];
    baseFilter = `scale=1200:2133:force_original_aspect_ratio=increase,crop=1080:1920`;
  } else {
    inputArgs = ['-f', 'lavfi', '-i', `color=c=0x0d0d0d:size=1080x1920:duration=${dur}:rate=30`];
    baseFilter = `scale=1080:1920`;
  }

  // Professional caption layout — large Impact text centered bottom third
  const captionLines = lines.slice(0, 3).map(clean).filter(Boolean);
  const lineY = [1520, 1620, 1710];
  const lineSz = [80, 76, 52];
  const lineClr = [
    'white',
    'white',
    accentColor,
  ];

  const captionFilters = captionLines.map((line, i) => {
    const font = i < 2 ? FONTS.impact : FONTS.arialBold;
    const sz = lineSz[i];
    const clr = lineClr[i];
    return `drawtext=fontfile='${font}':text='${line.toUpperCase()}':fontcolor=${clr}:fontsize=${sz}:x=(w-text_w)/2:y=${lineY[i]}:borderw=4:bordercolor=black@0.95:shadowx=2:shadowy=2:shadowcolor=black@0.7`;
  });

  const textFilters = [
    // Full image dark overlay
    `drawbox=x=0:y=0:w=1080:h=1920:color=${overlayOpacity}:t=fill`,
    // Gradient caption panel at bottom (tall)
    `drawbox=x=0:y=1440:w=1080:h=480:color=black@0.85:t=fill`,
    // Subtle top brand bar
    `drawbox=x=0:y=0:w=1080:h=80:color=black@0.60:t=fill`,
    `drawtext=fontfile='${FONTS.arialBold}':text='ShortsAI':fontcolor=white@0.6:fontsize=24:x=28:y=26`,
    // Accent line at top of caption panel
    `drawbox=x=40:y=1448:w=1000:h=4:color=${accentColor}:t=fill`,
    // Caption text lines
    ...captionFilters,
    // Smooth fade in / fade out
    `fade=t=in:st=0:d=0.6,fade=t=out:st=${dur - 0.6}:d=0.6`,
  ];

  const vf = `${baseFilter},${textFilters.join(',')}`;

  const args = [
    '-y', ...inputArgs,
    '-vf', vf,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-r', '30',
    '-movflags', '+faststart', outPath,
  ];

  const r = spawnSync(ffmpegPath, args, { encoding: 'utf8', timeout: 120000 });

  if (!existsSync(outPath)) {
    console.warn('[Scene] Failed:', r.stderr?.slice(-300));
    // Fallback: solid dark background with captions
    const fallbackArgs = [
      '-y', '-f', 'lavfi', '-i', `color=c=0x0d0d0d:size=1080x1920:duration=${dur}:rate=30`,
      '-vf', [...captionFilters, `fade=t=in:st=0:d=0.6,fade=t=out:st=${dur - 0.6}:d=0.6`].join(','),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-movflags', '+faststart', outPath,
    ];
    spawnSync(ffmpegPath, fallbackArgs, { timeout: 60000 });
  }

  return existsSync(outPath);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style = 'viral', duration = '30s', imageStyle = 'realistic' } = body;
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    mkdirSync(uploadDir, { recursive: true });

    const id = `t2v_${Math.random().toString(36).slice(2, 9)}`;
    const totalSecs = DURATION_SECS[duration] || 30;
    const overlay = STYLE_OVERLAY[style] || 'black@0.5';
    const accent = STYLE_ACCENT[style] || 'yellow';

    // Split prompt into word chunks (~5 words per line)
    const words = prompt.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > 26) { lines.push(cur.trim()); cur = w; }
      else cur = (cur + ' ' + w).trim();
    }
    if (cur) lines.push(cur);

    const sceneCount = 3;
    const sceneSecs = Math.floor(totalSecs / sceneCount);
    const linesPerScene = Math.ceil(lines.length / sceneCount);
    const segPaths: string[] = [];

    console.log(`[T2V] ${sceneCount} scenes × ${sceneSecs}s | style=${style} | imageStyle=${imageStyle}`);

    for (let i = 0; i < sceneCount; i++) {
      const sceneLines = lines.slice(i * linesPerScene, (i + 1) * linesPerScene);
      const sceneText = sceneLines.join(' ') || prompt;

      // Generate AI image matching scene text + selected art style
      const imgPath = join(uploadDir, `${id}_img${i}.jpg`);
      const hasImg = await generateAIImage(sceneText, style, imageStyle, imgPath);

      const seg = join(uploadDir, `${id}_seg${i}.mp4`);
      const ok = buildScene(
        hasImg ? imgPath : null,
        overlay, accent,
        sceneLines,
        sceneSecs, seg
      );

      try { unlinkSync(imgPath); } catch {}
      if (ok) { segPaths.push(seg); console.log(`[T2V] Scene ${i}: ✓`); }
      else console.warn(`[T2V] Scene ${i}: ✗`);
    }

    if (segPaths.length === 0) {
      return NextResponse.json({ error: 'All scenes failed to render.' }, { status: 500 });
    }

    // Concat
    const concatTxt = join(uploadDir, `${id}_c.txt`);
    const concatMp4 = join(uploadDir, `${id}_raw.mp4`);
    writeFileSync(concatTxt, segPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'), 'utf8');
    spawnSync(ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', concatTxt, '-c', 'copy', concatMp4], { timeout: 120000 });
    try { unlinkSync(concatTxt); } catch {}
    for (const p of segPaths) { try { unlinkSync(p); } catch {} }

    if (!existsSync(concatMp4)) return NextResponse.json({ error: 'Concat failed.' }, { status: 500 });

    // Human-sounding TTS voice
    const wavPath = join(uploadDir, `${id}.wav`);
    const hasAudio = generateTTS(prompt, wavPath);
    console.log('[TTS]', hasAudio ? '✓ voice ready' : '✗ no audio');

    // Mux audio + video
    const finalMp4 = join(uploadDir, `${id}.mp4`);
    if (hasAudio) {
      spawnSync(ffmpegPath, [
        '-y', '-i', concatMp4, '-i', wavPath,
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', finalMp4,
      ], { timeout: 120000 });
      try { unlinkSync(wavPath); } catch {}
    }
    if (!existsSync(finalMp4)) copyFileSync(concatMp4, finalMp4);
    try { unlinkSync(concatMp4); } catch {}

    if (!existsSync(finalMp4)) return NextResponse.json({ error: 'Final assembly failed.' }, { status: 500 });

    console.log('[T2V] ✓ Done:', `${id}.mp4`);
    return NextResponse.json({
      success: true,
      video_url: `/uploads/${id}.mp4`,
      style, duration, imageStyle,
      has_audio: hasAudio,
      resolution: '1080×1920',
    });

  } catch (err: any) {
    console.error('[T2V CRASH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
