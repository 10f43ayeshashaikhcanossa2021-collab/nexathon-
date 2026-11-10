/**
 * INKLOOM AI - Pixel Decoding & Scaling (server/vision/decode.ts)
 * Normalizes images with EXIF rotation, alpha flattening onto pure white,
 * downscaling to <= 1024px for pixel-precise processing, and SHA-256 hashing.
 */

import sharp from 'sharp';
import crypto from 'crypto';

export interface DecodedImage {
  sha256: string;
  origWidth: number;
  origHeight: number;
  width: number;
  height: number;
  scaleFactorX: number;
  scaleFactorY: number;
  channels: number;
  rawBuffer: Buffer; // RGB raw bytes: R, G, B, R, G, B ...
}

export const MAX_ANALYSIS_DIMENSION = 1024;

export async function decodeAndNormalizeImage(buffer: Buffer): Promise<DecodedImage> {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // Read metadata
  const meta = await sharp(buffer).metadata();
  const origWidth = meta.width || 1024;
  const origHeight = meta.height || 1024;

  // Pipeline: EXIF rotate -> flatten alpha on white -> resize if > 1024px -> raw RGB
  let pipeline = sharp(buffer)
    .rotate()
    .flatten({ background: { r: 255, g: 255, b: 255 } });

  if (origWidth > MAX_ANALYSIS_DIMENSION || origHeight > MAX_ANALYSIS_DIMENSION) {
    pipeline = pipeline.resize(MAX_ANALYSIS_DIMENSION, MAX_ANALYSIS_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const { data, info } = await pipeline
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const scaleFactorX = origWidth / info.width;
  const scaleFactorY = origHeight / info.height;

  return {
    sha256,
    origWidth,
    origHeight,
    width: info.width,
    height: info.height,
    scaleFactorX,
    scaleFactorY,
    channels: info.channels, // 3 channels (R, G, B)
    rawBuffer: data,
  };
}
