import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const app = express();
const PORT = process.env.PORT || 10000;
const MAX_FILE_MB = Number(process.env.MAX_FILE_MB || 500);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(s => s.trim()) : true }));
app.use(express.json({ limit: '1mb' }));
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 1 } });

app.get('/health', (_req, res) => res.json({ ok: true, service: 'clip-machine-backend', version: '0.1.0' }));
app.get('/api/status', (_req, res) => res.json({
  ok: true,
  capabilities: { localUpload: true, ffmpegTrim: true, liveStreams: false, vodPlatformIngestion: false, aiAnalysis: false },
  message: 'Backend inicial. La ingestión de plataformas y el análisis IA aún no están configurados.'
}));

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args);
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); if (stderr.length > 12000) stderr = stderr.slice(-12000); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg terminó con código ${code}: ${stderr.slice(-2500)}`)));
  });
}

app.post('/api/clips/trim', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Adjunta un archivo en el campo video.' });
  const start = Number(req.body.start);
  const end = Number(req.body.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end - start > 600) {
    await fs.rm(req.file.path, { force: true });
    return res.status(400).json({ error: 'Rango inválido. Usa segundos; máximo 10 minutos por clip.' });
  }
  const id = crypto.randomUUID();
  const output = path.join(os.tmpdir(), `${id}.mp4`);
  try {
    await runFfmpeg(['-y', '-ss', String(start), '-i', req.file.path, '-t', String(end - start), '-map', '0:v:0?', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', '-movflags', '+faststart', output]);
    res.download(output, `clip-${id}.mp4`, async () => {
      await fs.rm(req.file.path, { force: true });
      await fs.rm(output, { force: true });
    });
  } catch (error) {
    await fs.rm(req.file.path, { force: true });
    await fs.rm(output, { force: true });
    res.status(500).json({ error: 'No se pudo procesar el vídeo.', detail: error.message });
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(413).json({ error: `Carga rechazada: ${err.message}` });
  res.status(500).json({ error: 'Error interno del servidor.' });
});
app.listen(PORT, '0.0.0.0', () => console.log(`Clip Machine backend listening on ${PORT}`));
