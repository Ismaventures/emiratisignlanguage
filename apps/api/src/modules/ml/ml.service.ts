import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MlClientService } from './ml-client.service';
import {
  GestureRecognizeDto,
  GestureRecognizeResult,
  TranslationDto,
  TranslationResult,
  TtsDto,
  TtsResult,
  AsrDto,
  AsrResult,
  TrainingDto,
  TrainingResult,
} from './dto/ml.dto';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private config: ConfigService,
    private mlClient: MlClientService,
  ) {}

  private getCacheKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async recognizeGesture(dto: GestureRecognizeDto): Promise<GestureRecognizeResult[]> {
    const cacheKey = this.getCacheKey('gesture', { landmarks: dto.landmarks.slice(0, 10), topK: dto.topK });
    const cached = this.getFromCache<GestureRecognizeResult[]>(cacheKey);
    if (cached) {
      this.logger.debug('Gesture recognition cache hit');
      return cached;
    }

    // Reshape flat array to number[][] (groups of 3 for x,y,z)
    const landmarksArray: number[][] = [];
    const flatLandmarks = dto.landmarks;
    for (let i = 0; i < flatLandmarks.length; i += 3) {
      landmarksArray.push(flatLandmarks.slice(i, i + 3));
    }

    const result = await this.mlClient.recognizeGesture(landmarksArray, dto.topK || 3);
    const results: GestureRecognizeResult[] = result.results || result;

    this.setCache(cacheKey, results);
    return results;
  }

  async translate(dto: TranslationDto): Promise<TranslationResult> {
    const cacheKey = this.getCacheKey('translate', { text: dto.text, source: dto.sourceLang, target: dto.targetLang });
    const cached = this.getFromCache<TranslationResult>(cacheKey);
    if (cached) {
      this.logger.debug('Translation cache hit');
      return cached;
    }

    const result = await this.mlClient.translate(dto.text, dto.sourceLang, dto.targetLang);

    const translationResult: TranslationResult = {
      originalText: dto.text,
      translatedText: result.translated_text || result.translation || dto.text,
      sourceLang: dto.sourceLang,
      targetLang: dto.targetLang,
      confidence: result.confidence || 0.9,
      alternatives: result.alternatives || [],
    };

    this.setCache(cacheKey, translationResult);
    return translationResult;
  }

  async textToSpeech(dto: TtsDto): Promise<TtsResult> {
    const cacheKey = this.getCacheKey('tts', { text: dto.text, locale: dto.locale, rate: dto.rate });
    const cached = this.getFromCache<TtsResult>(cacheKey);
    if (cached) {
      this.logger.debug('TTS cache hit');
      return cached;
    }

    const result = await this.mlClient.textToSpeech(dto.text, dto.locale, dto.rate);

    const ttsResult: TtsResult = {
      audioBase64: result.audio_base64 || result.audio || '',
      durationMs: result.duration_ms || result.duration || 0,
      format: result.format || 'wav',
    };

    this.setCache(cacheKey, ttsResult);
    return ttsResult;
  }

  async speechToText(dto: AsrDto): Promise<AsrResult> {
    const result = await this.mlClient.speechToText(dto.audioBase64, dto.locale);

    return {
      transcript: result.transcript || result.text || '',
      confidence: result.confidence || 0,
      language: result.language || dto.locale,
      alternatives: result.alternatives || [],
    };
  }

  async classifyGesture(landmarks: number[][]): Promise<any> {
    const result = await this.mlClient.classifyGesture(landmarks);
    return result;
  }

  async trainModel(dto: TrainingDto): Promise<TrainingResult> {
    this.logger.log(`Starting training for dataset ${dto.datasetId}`);

    // In production, this would:
    // 1. Load dataset from database
    // 2. Send to training service (Python FastAPI with PyTorch/TF)
    // 3. Wait for completion
    // 4. Store model artifacts
    // 5. Return metrics

    const result = await this.mlClient.postToService(`${this.config.get('VISION_SERVICE_URL', 'http://localhost:8001')}/api/v1/train`, {
      dataset_id: dto.datasetId,
      config: dto.config || {},
    }).catch(() => null);

    if (result) {
      return {
        modelId: result.model_id || `model-${Date.now()}`,
        accuracy: result.accuracy || 0,
        loss: result.loss || 0,
        epochs: result.epochs || 0,
        status: 'completed',
        trainedAt: new Date().toISOString(),
      };
    }

    return {
      modelId: `model-${Date.now()}`,
      accuracy: 0,
      loss: 0,
      epochs: 0,
      status: 'failed',
      trainedAt: new Date().toISOString(),
    };
  }

  async getHealthStatus(): Promise<{ vision: boolean; nlp: boolean; speech: boolean }> {
    const [vision, nlp, speech] = await Promise.allSettled([
      this.mlClient.visionHealth(),
      this.mlClient.nlpHealth(),
      this.mlClient.speechHealth(),
    ]);

    return {
      vision: vision.status === 'fulfilled' && vision.value,
      nlp: nlp.status === 'fulfilled' && nlp.value,
      speech: speech.status === 'fulfilled' && speech.value,
    };
  }
}
