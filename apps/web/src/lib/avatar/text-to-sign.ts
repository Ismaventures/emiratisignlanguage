'use client';

import { ESL_SIGNS } from './esl-sign-database';
import { SSL_SIGNS } from './ssl-sign-database';

export interface SignToken {
  text: string;
  uppercase: string;
  hasAnimation: boolean;
  needsFingerspelling: boolean;
}

export interface TranslationResult {
  originalText: string;
  normalizedText: string;
  tokens: SignToken[];
  cachedAt?: number;
}

const SIGN_GRAMMAR_MAP: Record<string, string> = {
  'i am': 'I',
  "i'm": 'I',
  'you are': 'YOU',
  "you're": 'YOU',
  'he is': 'HE',
  'she is': 'SHE',
  'it is': 'IT',
  'we are': 'WE',
  'they are': 'THEY',
  'do you': 'YOU',
  'can you': 'YOU',
  'going to': 'GO',
  'want to': 'WANT',
  'need to': 'NEED',
  'have to': 'MUST',
  'should': 'SHOULD',
  'will': 'WILL',
  'please': 'PLEASE',
  'thank you': 'THANK_YOU',
  'thanks': 'THANK_YOU',
  'good morning': 'GOOD_MORNING',
  'good night': 'GOOD_NIGHT',
  'good afternoon': 'GOOD_MORNING',
  'good evening': 'GOOD_MORNING',
  'how are you': 'HOW_YOU',
  'my name is': 'NAME',
  'what is your name': 'WHAT_NAME',
  'i love you': 'LOVE',
  'see you later': 'GOODBYE',
  'excuse me': 'PLEASE',
  "i don't understand": 'DONT_UNDERSTAND',
  'i understand': 'KNOW',
  'yes': 'YES',
  'no': 'NO',
};

const ARTICLES = new Set(['the', 'a', 'an']);
const PREPOSITIONS = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from']);
const AUXILIARY = new Set(['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'has', 'have', 'had']);
const PRONOUNS: Record<string, string> = {
  'i': 'I', 'me': 'I', 'my': 'I', 'mine': 'I', 'myself': 'I',
  'you': 'YOU', 'your': 'YOU', 'yours': 'YOU', 'yourself': 'YOU',
  'he': 'HE', 'him': 'HE', 'his': 'HE', 'himself': 'HE',
  'she': 'SHE', 'her': 'SHE', 'hers': 'SHE', 'herself': 'SHE',
  'it': 'IT', 'its': 'IT', 'itself': 'IT',
  'we': 'WE', 'us': 'WE', 'our': 'WE', 'ours': 'WE', 'ourselves': 'WE',
  'they': 'THEY', 'them': 'THEY', 'their': 'THEY', 'theirs': 'THEY', 'themselves': 'THEY',
};

const translationCache = new Map<string, TranslationResult>();

export function normalizeText(input: string): string {
  let text = input.toLowerCase().trim();
  text = text.replace(/[.,!?;:'"()\-—–]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

export function convertToSignGrammar(normalizedText: string): string[] {
  const words = normalizedText.split(' ').filter(Boolean);
  const result: string[] = [];
  let i = 0;

  while (i < words.length) {
    let matched = false;

    for (const [phrase, sign] of Object.entries(SIGN_GRAMMAR_MAP)) {
      const phraseWords = phrase.split(' ');
      const slice = words.slice(i, i + phraseWords.length).join(' ');
      if (slice === phrase) {
        result.push(sign);
        i += phraseWords.length;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const word = words[i];

    if (ARTICLES.has(word) || PREPOSITIONS.has(word) || AUXILIARY.has(word)) {
      i++;
      continue;
    }

    if (PRONOUNS[word]) {
      result.push(PRONOUNS[word]);
      i++;
      continue;
    }

    if (word === 'not' || word === "don't" || word === "doesn't" || word === "didn't") {
      result.push('NO');
      i++;
      continue;
    }

    if (word === 'hello' || word === 'hi' || word === 'hey') {
      result.push('HELLO');
      i++;
      continue;
    }

    if (word === 'bye' || word === 'goodbye') {
      result.push('GOODBYE');
      i++;
      continue;
    }

    if (word === 'sorry') {
      result.push('SORRY');
      i++;
      continue;
    }

    result.push(word.toUpperCase());
    i++;
  }

  return result;
}

export function lookupSign(word: string, dialect: 'ESL' | 'SSL' = 'SSL') {
  const upperWord = word.toUpperCase();
  
  if (dialect === 'SSL') {
    // Check SSL dictionary first (using English or Arabic mapping)
    for (const [key, entry] of Object.entries(SSL_SIGNS)) {
      if (key === upperWord || entry.english.toUpperCase() === upperWord || entry.arabic === word) {
        return { key, entry, dialect: 'SSL' };
      }
    }
  }

  // Fallback to ESL dictionary
  if (ESL_SIGNS[upperWord]) {
    return { key: upperWord, entry: ESL_SIGNS[upperWord], dialect: 'ESL' };
  }
  
  // Try to find a partial match in ESL
  for (const [key, entry] of Object.entries(ESL_SIGNS)) {
    if (entry.english.toUpperCase() === upperWord) {
      return { key, entry, dialect: 'ESL' };
    }
  }
  
  return null;
}

export function tokenizeForSigning(signTokens: string[], dialect: 'ESL' | 'SSL' = 'SSL'): SignToken[] {
  const finalTokens: SignToken[] = [];
  
  for (const token of signTokens) {
    const entry = lookupSign(token, dialect);
    if (entry) {
      finalTokens.push({
        text: token.toLowerCase(),
        uppercase: token,
        hasAnimation: true,
        needsFingerspelling: false,
      });
    } else {
      // Split into letters for fingerspelling
      for (const char of token) {
        if (/[A-Z]/.test(char.toUpperCase())) {
          finalTokens.push({
            text: char.toLowerCase(),
            uppercase: char.toUpperCase(),
            hasAnimation: false,
            needsFingerspelling: true,
          });
        }
      }
    }
  }
  return finalTokens;
}

export async function translateToSignLanguage(
  text: string,
  useHuggingFace = true,
  dialect: 'ESL' | 'SSL' = 'SSL'
): Promise<TranslationResult> {
  const cacheKey = text.toLowerCase().trim();
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - (cached.cachedAt || 0) < 3600000) {
    return cached;
  }

  const normalized = normalizeText(text);
  let signTokens: string[];

  if (useHuggingFace) {
    try {
      signTokens = await huggingFaceTranslate(normalized);
    } catch {
      signTokens = convertToSignGrammar(normalized);
    }
  } else {
    signTokens = convertToSignGrammar(normalized);
  }

  const tokens = tokenizeForSigning(signTokens);
  const result: TranslationResult = {
    originalText: text,
    normalizedText: normalized,
    tokens,
    cachedAt: Date.now(),
  };

  translationCache.set(cacheKey, result);
  return result;
}

async function huggingFaceTranslate(normalizedText: string): Promise<string[]> {
  const response = await fetch('/api/hf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: normalizedText }),
  });

  if (!response.ok) {
    throw new Error(`HF proxy ${response.status}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  const tokens: string[] = data.tokens || [];
  return tokens.length > 0 ? tokens : convertToSignGrammar(normalizedText);
}

export function getCachedTranslation(text: string): TranslationResult | null {
  return translationCache.get(text.toLowerCase().trim()) || null;
}

export function clearTranslationCache(): void {
  translationCache.clear();
}
