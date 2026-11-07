/**
 * INKLOOM AI - Revision Builder & Word-Level LCS Diff Algorithm (Part F.9)
 */

import { DetectedIssue, DiffChunk } from '../types/inkloom';

interface ReplacementSpan {
  start: number;
  end: number;
  newText: string;
}

export function buildSuggestedRevision(
  originalDraft: string,
  issues: DetectedIssue[]
): string {
  const spans: ReplacementSpan[] = [];

  for (const issue of issues) {
    if (!issue.suggestion) continue;

    // Only apply if accepted or edited
    if (issue.suggestion.status !== 'accepted' && issue.suggestion.status !== 'edited') {
      continue;
    }

    const replacement =
      issue.suggestion.status === 'edited' && issue.suggestion.final_text !== undefined
        ? issue.suggestion.final_text
        : issue.suggestion.suggested_text;

    spans.push({
      start: issue.start_offset,
      end: issue.end_offset,
      newText: replacement,
    });
  }

  // Sort descending by start offset (reverse-offset application avoids index shifting)
  spans.sort((a, b) => b.start - a.start);

  let result = originalDraft;
  for (const span of spans) {
    result = result.slice(0, span.start) + span.newText + result.slice(span.end);
  }

  // Post-processing cleanup:
  // 1. Double spaces to single space
  result = result.replace(/[ \t]{2,}/g, ' ');
  // 2. Trailing dangling conjunctions before punctuation (e.g. "and !" -> "!")
  result = result.replace(/\s+(and|or|but)\s*([!.,?;:])/gi, '$2');
  // 3. Space before punctuation
  result = result.replace(/\s+([!.,?;:])/g, '$1');
  // 4. Repeated spaces around commas
  result = result.replace(/\s*,\s*/g, ', ');

  return result.trim();
}

/**
 * Word-Level Longest Common Subsequence (LCS) Diff
 */
export function computeWordDiff(oldText: string, newText: string): DiffChunk[] {
  const tokenize = (text: string) => {
    return text.match(/\S+|\s+/g) || [];
  };

  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);

  const m = oldTokens.length;
  const n = newTokens.length;

  // LCS Matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldTokens[i] === newTokens[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack
  const chunks: DiffChunk[] = [];
  let i = m;
  let j = n;

  const stack: DiffChunk[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      stack.push({ type: 'unchanged', value: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'inserted', value: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      stack.push({ type: 'deleted', value: oldTokens[i - 1] });
      i--;
    }
  }

  const rawChunks = stack.reverse();

  // Merge consecutive tokens of same type
  for (const token of rawChunks) {
    if (chunks.length > 0 && chunks[chunks.length - 1].type === token.type) {
      chunks[chunks.length - 1].value += token.value;
    } else {
      chunks.push({ ...token });
    }
  }

  return chunks;
}
