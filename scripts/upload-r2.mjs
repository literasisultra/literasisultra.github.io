#!/usr/bin/env node
/**
 * Script upload media ke Cloudflare R2.
 *
 * Cara pakai:
 *   npm run upload -- gambar.jpg
 *   npm run upload -- gambar.jpg --key nama-unik.png
 *   npm run upload -- folder/*.jpg
 *
 * Hasilnya mencetak URL publik (r2.dev) yang bisa langsung dipakai
 * di field "URL Gambar Utama" pada editor artikel.
 *
 * Kredensial diambil dari environment:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET, R2_PUBLIC_URL
 * Bisa diset via .env.local atau variabel environment.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { glob } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { loadEnvFile } from 'node:process'

try {
  loadEnvFile(resolve(process.cwd(), '.env.local'))
} catch {}

const {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_ENDPOINT,
  R2_BUCKET = 'literasisultra-images',
  R2_PUBLIC_URL = ''
} = process.env

const args = process.argv.slice(2)
const keyIndex = args.indexOf('--key')
const keyOverride = keyIndex >= 0 ? args[keyIndex + 1] : null
const input = args.filter((a, i) => a !== '--key' && i !== keyIndex + 1)

if (input.length === 0) {
  console.error('Usage: npm run upload -- <file|glob> [--key nama.png]')
  process.exit(1)
}

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
  console.error('Kredensial R2 belum lengkap. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT di .env.local')
  process.exit(1)
}

const client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
})

function mime(name) {
  const ext = name.split('.').pop().toLowerCase()
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
    avif: 'image/avif', ico: 'image/x-icon', mp4: 'video/mp4',
    webm: 'video/webm', pdf: 'application/pdf'
  }
  return map[ext] || 'application/octet-stream'
}

async function upload(file) {
  const name = file.split(/[\\/]/).pop()
  const ext = name.split('.').pop()
  const hash = createHash('sha1').update(file + Date.now()).digest('hex').slice(0, 10)
  const key = keyOverride || `${Date.now()}-${hash}.${ext}`
  const data = await readFile(file)

  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: data,
    ContentType: mime(key)
  }))

  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
    : `https://${R2_ENDPOINT.replace(/^https?:\/\//, '').replace(/\/$/, '')}/${R2_BUCKET}/${key}`
  console.log('OK:', file, '->', url)
  return url
}

let files = []
for (const pattern of input) {
  if (pattern.includes('*')) {
    for await (const f of glob(resolve(pattern))) files.push(f)
  } else {
    files.push(resolve(pattern))
  }
}

if (files.length === 0) {
  console.error('Tidak ada file yang cocok.')
  process.exit(1)
}

for (const f of files) {
  try {
    await upload(f)
  } catch (e) {
    console.error('GAGAL:', f, '-', e.name, e.message)
  }
}
