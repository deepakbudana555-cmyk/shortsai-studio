const fs = require('fs');
const path = require('path');

const STOP_WORDS = new Set(['a','an','the','is','are','was','were','to','of','in','for','on','with','at','by','and','but','or','i','you','he','she','we','they','not','no','just','very','up','how','what','why','when','do','make','get','go','every','should','will','your','this','that','it','be','can','than','more','most','some','any','all','day','time','each','start','end','one','two','best','good','great','new','first','last','way']);

const TOPIC_MAP = {
  wake: ['morning','sunrise'],
  morning: ['sunrise','morning'],
  money: ['money','finance','wealth'],
  success: ['success','achievement','winner'],
  workout: ['fitness','gym','exercise'],
  fitness: ['gym','workout','health'],
  food: ['food','cooking','meal'],
  travel: ['travel','adventure','landscape'],
  ai: ['technology','digital','future'],
  motivation: ['motivation','success','inspiration'],
  productivity: ['productivity','work','focus'],
};

function extractKeywords(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const out = [];
  for (const w of words) {
    if (STOP_WORDS.has(w) || w.length < 3) continue;
    out.push(TOPIC_MAP[w] ? TOPIC_MAP[w][0] : w);
    if (out.length >= 2) break;
  }
  return out.length > 0 ? out.join(',') : 'motivation,success';
}

const prompts = [
  '5 reasons why you should wake up at 5AM every single day',
  'How to make money online in 2025 with zero investment',
  'The secret to building muscle fast with proper workout and food',
  'AI tools that will change your productivity forever',
];

async function test() {
  for (const p of prompts) {
    const kw = extractKeywords(p);
    const url = `https://source.unsplash.com/1080x1920/?${encodeURIComponent(kw)}`;
    console.log(`\nPrompt: "${p.slice(0,50)}"`);
    console.log(`Keywords: ${kw}`);
    console.log(`Image URL: ${url}`);
    
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const ct = res.headers.get('content-type');
      const size = res.headers.get('content-length');
      console.log(`Result: ${res.status} | ${ct} | ${size} bytes`);
    } catch(e) {
      console.log('Failed:', e.message);
    }
  }
}
test();
