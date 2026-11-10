/**
 * INKLOOM AI - Multimodal Gemini Vision Second Opinion (server/vision/gemini.ts)
 * Calls Gemini Vision with strict JSON schemas and a multi-level validation gate.
 * Gracefully degrades if offline or unconfigured; never blocks deterministic results.
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  BrandProfile,
  BrandGuideline,
  BrandAsset,
  VisualBrandIssue,
  ExtractedColorItem,
} from '../../src/types/inkloom';
import { hexToLab, deltaE2000 } from './colour';

export interface GeminiVisionReviewResult {
  aiIssues: VisualBrandIssue[];
  modelUsed: string;
  aiAvailable: boolean;
  notes?: string;
}

export async function runGeminiVisionReview(params: {
  imageBuffer: Buffer;
  mimeType: string;
  imageName: string;
  profile: BrandProfile;
  guidelines: BrandGuideline[];
  assets: BrandAsset[];
  extractedColors: ExtractedColorItem[];
}): Promise<GeminiVisionReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !params.profile.external_ai_allowed) {
    return {
      aiIssues: [],
      modelUsed: 'none',
      aiAvailable: false,
      notes: !apiKey
        ? 'GEMINI_API_KEY not configured; operating in 100% deterministic local mode.'
        : 'External AI processing disabled by Brand Profile security settings.',
    };
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({});

  const visualGuidelines = params.guidelines.filter((g) => g.category === 'visual');
  const allowedRuleCodes = visualGuidelines.map((g) => g.code);

  const promptText = `
You are an expert brand governance auditor inspecting a visual marketing creative.
Brand Name: ${params.profile.name}
Approved Palette HEX: ${params.profile.palette?.join(', ') || '#0B1B3A, #139A93, #F4F6F9, #FFFFFF, #E65100'}
Approved Visual Guidelines:
${visualGuidelines.map((g) => `- [${g.code}] ${g.title}: ${g.rule_text}`).join('\n')}

Inspect the provided image and report any visual branding issues (unapproved logos, distortions, off-palette colors, layout violations).
Output strictly in JSON matching the requested schema.
`;

  try {
    const aiPromise = ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                data: params.imageBuffer.toString('base64'),
                mimeType: params.mimeType,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: ['logo_compliance', 'color_compliance', 'visual_consistency', 'layout_spacing'],
                  },
                  severity: {
                    type: Type.STRING,
                    enum: ['critical', 'high', 'medium', 'low'],
                  },
                  description: { type: Type.STRING },
                  expected_rule: { type: Type.STRING },
                  detected_result: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  rule_code: { type: Type.STRING },
                  cited_hex: { type: Type.STRING },
                  ymin: { type: Type.INTEGER },
                  xmin: { type: Type.INTEGER },
                  ymax: { type: Type.INTEGER },
                  xmax: { type: Type.INTEGER },
                  confidence: { type: Type.INTEGER },
                },
                required: ['title', 'category', 'severity', 'description', 'expected_rule', 'detected_result', 'recommendation'],
              },
            },
          },
        },
      },
    });

    // 20-second timeout guard
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini Vision API timeout after 20000ms')), 20000)
    );

    const response = (await Promise.race([aiPromise, timeoutPromise])) as any;
    const rawText = response.text?.() || response.text || '{}';
    const parsed = JSON.parse(rawText);
    const rawFindings: any[] = Array.isArray(parsed.findings) ? parsed.findings : [];

    // Validation Gate
    const validatedIssues: VisualBrandIssue[] = [];

    for (const item of rawFindings) {
      // 1. Box range check (0 to 1000 normalized)
      let region = undefined;
      if (
        typeof item.ymin === 'number' &&
        typeof item.xmin === 'number' &&
        typeof item.ymax === 'number' &&
        typeof item.xmax === 'number'
      ) {
        if (
          item.ymin >= 0 &&
          item.ymin <= 1000 &&
          item.xmin >= 0 &&
          item.xmin <= 1000 &&
          item.ymax > item.ymin &&
          item.xmax > item.xmin
        ) {
          region = {
            x: Math.round(item.xmin / 10),
            y: Math.round(item.ymin / 10),
            width: Math.round((item.xmax - item.xmin) / 10),
            height: Math.round((item.ymax - item.ymin) / 10),
          };
        }
      }

      // 2. Rule code check
      if (item.rule_code && !allowedRuleCodes.includes(item.rule_code)) {
        continue; // Drop hallucinated rule codes
      }

      // 3. Hex sanity check
      if (item.cited_hex && item.category === 'color_compliance') {
        const citedLab = hexToLab(item.cited_hex);
        const hasMatchingExtracted = params.extractedColors.some(
          (c) => deltaE2000(citedLab, hexToLab(c.hex)) <= 6.0
        );
        if (!hasMatchingExtracted) {
          continue; // Drop hallucinated colors not present in pixel clusters
        }
      }

      validatedIssues.push({
        issue_id: `vis-ai-${Math.random().toString(36).substring(2, 9)}`,
        image_name: params.imageName,
        title: item.title,
        category: item.category as any,
        severity: item.severity === 'critical' ? 'high' : (item.severity as any) || 'medium', // Cap standalone AI issues at High
        confidence: Math.min(90, Math.max(50, item.confidence || 75)),
        confidence_basis: {
          model: modelName,
          source: 'gemini_vision',
          rule_code: item.rule_code || null,
        },
        description: item.description,
        expected_rule: item.expected_rule,
        detected_result: item.detected_result,
        recommendation: item.recommendation,
        region,
        source: 'ai',
        classification: item.severity === 'low' ? 'possible_concern' : 'violation',
        review_status: 'unreviewed',
      });
    }

    return {
      aiIssues: validatedIssues,
      modelUsed: modelName,
      aiAvailable: true,
      notes: `Gemini Vision (${modelName}) evaluated design; ${validatedIssues.length} findings corroborated.`,
    };
  } catch (err: any) {
    return {
      aiIssues: [],
      modelUsed: modelName,
      aiAvailable: false,
      notes: `Gemini Vision unavailable: ${err?.message || 'call failed'}. Deterministic results retained.`,
    };
  }
}
