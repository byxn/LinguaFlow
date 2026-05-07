export interface PipelineContext {
  sourceLanguage: string;
  targetLanguage: string;
  url?: string;
  title?: string;
  domain?: string;
}

export interface PipelineOptions {
  preserveTerms?: boolean;
  mode?: "paragraph" | "sentence";
}

const MIN_CHUNK_SIZE = 100;
const MAX_CHUNK_SIZE = 1500;

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

function splitIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_SIZE) {
    return [text];
  }

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > MAX_CHUNK_SIZE) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += " " + sentence;
        }
      }
    } else if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += "\n\n" + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.filter((c) => c.length >= MIN_CHUNK_SIZE);
}

function detectLanguage(text: string): string {
  const chineseRegex = /[一-鿿]/;
  const japaneseRegex = /[぀-ゟ゠-ヿ]/;
  const koreanRegex = /[가-힯]/;

  if (chineseRegex.test(text)) return "zh";
  if (japaneseRegex.test(text)) return "ja";
  if (koreanRegex.test(text)) return "ko";

  return "en";
}

export interface TranslationInput {
  text: string;
  context?: PipelineContext;
  options?: PipelineOptions;
}

export interface TranslationOutput {
  originalText: string;
  translatedText: string;
  terms: Array<{ term: string; explanation: string }>;
  cached: boolean;
}

export class TranslationPipeline {
  async process(input: TranslationInput): Promise<TranslationOutput> {
    const normalized = normalizeText(input.text);
    const chunks = splitIntoChunks(normalized);
    const language = detectLanguage(input.text);

    return {
      originalText: input.text,
      translatedText: chunks.join("\n\n"),
      terms: [],
      cached: false,
    };
  }

  async processBatch(
    inputs: TranslationInput[]
  ): Promise<TranslationOutput[]> {
    return Promise.all(inputs.map((input) => this.process(input)));
  }
}

export function createPipeline(): TranslationPipeline {
  return new TranslationPipeline();
}
