/**
 * INKLOOM AI - Image Validation & Magic Byte Sniffing (server/vision/validate.ts)
 * Enforces strict security bounds, format allow-lists, and decompression bomb protection.
 */

import sharp from 'sharp';

export interface ImageValidationResult {
  valid: boolean;
  statusCode?: 413 | 415 | 422;
  error?: string;
  message?: string;
  format?: 'png' | 'jpeg' | 'webp';
  width?: number;
  height?: number;
}

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_DIMENSION_PX = 200;
export const MAX_DIMENSION_PX = 8000;
export const MAX_TOTAL_PIXELS = 64_000_000; // 64 MP bomb limit

/**
 * Sniffs magic bytes at buffer head to detect genuine PNG, JPEG, or WebP.
 * Never trusts file extensions or client Content-Type headers.
 */
export function sniffImageFormat(buffer: Buffer): 'png' | 'jpeg' | 'webp' | null {
  if (!buffer || buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

/**
 * Validates image buffer integrity, format, dimensions, and size limits.
 */
export async function validateImageBuffer(buffer: Buffer): Promise<ImageValidationResult> {
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      statusCode: 422,
      error: 'empty_payload',
      message: 'Image buffer is empty.',
    };
  }

  if (buffer.length > MAX_FILE_BYTES) {
    return {
      valid: false,
      statusCode: 413,
      error: 'payload_too_large',
      message: `Image size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of 10 MB.`,
    };
  }

  const format = sniffImageFormat(buffer);
  if (!format) {
    return {
      valid: false,
      statusCode: 415,
      error: 'unsupported_media_type',
      message: 'Only PNG, JPEG, and WebP images are supported. File magic bytes did not match allowed image formats.',
    };
  }

  try {
    const meta = await sharp(buffer, { limitInputPixels: MAX_TOTAL_PIXELS }).metadata();
    const width = meta.width;
    const height = meta.height;

    if (!width || !height) {
      return {
        valid: false,
        statusCode: 422,
        error: 'image_unreadable',
        message: 'Could not extract valid width or height from image metadata.',
      };
    }

    if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
      return {
        valid: false,
        statusCode: 422,
        error: 'image_dimensions_too_small',
        message: `Image dimensions (${width}x${height}px) are below the minimum required ${MIN_DIMENSION_PX}x${MIN_DIMENSION_PX}px.`,
      };
    }

    if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
      return {
        valid: false,
        statusCode: 422,
        error: 'image_dimensions_too_large',
        message: `Image dimensions (${width}x${height}px) exceed the maximum allowed ${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}px.`,
      };
    }

    if (width * height > MAX_TOTAL_PIXELS) {
      return {
        valid: false,
        statusCode: 413,
        error: 'pixel_count_exceeded',
        message: 'Total pixel count exceeds 64 megapixels limit.',
      };
    }

    return {
      valid: true,
      format,
      width,
      height,
    };
  } catch (err: any) {
    return {
      valid: false,
      statusCode: 422,
      error: 'image_unreadable',
      message: `Corrupted image or decode failure: ${err?.message || 'unknown error'}`,
    };
  }
}
