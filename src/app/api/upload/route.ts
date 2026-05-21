import { NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Writable } from 'stream';

// Stream a Web ReadableStream → Node.js file write (no RAM limit)
async function streamToFile(readable: ReadableStream<Uint8Array>, destPath: string): Promise<void> {
  const writer = createWriteStream(destPath);
  const nodeWritable = Writable.toWeb(writer) as WritableStream<Uint8Array>;
  await readable.pipeTo(nodeWritable);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const projectId = Math.random().toString(36).substring(7);
    const safeFileName = `${projectId}_input.mp4`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const inputPath = join(uploadDir, safeFileName);

    // ── Stream directly to disk — no RAM limit ──────────────────────────────
    console.log(`[Upload] Streaming "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB) to disk…`);
    await streamToFile(file.stream(), inputPath);
    console.log(`[Upload] ✓ Saved: ${inputPath}`);

    return NextResponse.json({ success: true, inputPath, projectId, safeFileName });

  } catch (error: any) {
    console.error('[Upload] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
