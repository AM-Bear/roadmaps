import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SIZE = 1024
const PAD = 80
const GAP = 40
const SQUARE = (SIZE - PAD * 2 - GAP) / 2

const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" rx="220" fill="#0d1117"/>
  <rect x="${PAD}" y="${PAD}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#22d3a5"/>
  <rect x="${PAD + SQUARE + GAP}" y="${PAD}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#818cf8"/>
  <rect x="${PAD}" y="${PAD + SQUARE + GAP}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#f472b6"/>
  <rect x="${PAD + SQUARE + GAP}" y="${PAD + SQUARE + GAP}" width="${SQUARE}" height="${SQUARE}" rx="60" fill="#60a5fa"/>
</svg>`

const outPath = path.join(__dirname, '../build/icon.png')

await sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png()
  .toFile(outPath)

console.log(`Icon written to ${outPath}`)
