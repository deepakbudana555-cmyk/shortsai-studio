const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'public', 'uploads');

async function testPollinations() {
  const prompts = [
    'person waking up at sunrise, motivational, cinematic, 9:16 vertical',
    'making money online, laptop, success, wealth, modern office',
    'gym workout, fitness, muscle, energy, professional photography',
    'artificial intelligence technology, futuristic, digital, glowing',
  ];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1080&height=1920&nologo=true`;
    console.log(`\nTest ${i+1}: "${p.slice(0,50)}"`);
    console.log(`URL: ${url.slice(0,80)}...`);
    
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ShortsAI/1.0' } });
      const ct = res.headers.get('content-type');
      console.log(`Status: ${res.status} | Content-Type: ${ct}`);
      
      if (res.ok && ct?.startsWith('image/')) {
        const buf = await res.arrayBuffer();
        const imgPath = path.join(uploadDir, `test_ai_img_${i}.jpg`);
        fs.writeFileSync(imgPath, Buffer.from(buf));
        console.log(`✓ Saved: ${buf.byteLength} bytes → ${imgPath}`);
      }
    } catch(e) {
      console.log('✗ Failed:', e.message);
    }
    // Rate limit: small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nDone! Check public/uploads/ for test_ai_img_*.jpg');
}

testPollinations();
