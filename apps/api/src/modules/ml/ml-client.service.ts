import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, retry, catchError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import type { AxiosResponse } from 'axios';

@Injectable()
export class MlClientService {
  private readonly logger = new Logger(MlClientService.name);
  private readonly visionUrl: string;
  private readonly nlpUrl: string;
  private readonly speechUrl: string;

  constructor(
    private config: ConfigService,
    private http: HttpService,
  ) {
    this.visionUrl = this.config.get<string>('VISION_SERVICE_URL', 'http://localhost:8001');
    this.nlpUrl = this.config.get<string>('NLP_SERVICE_URL', 'http://localhost:8002');
    this.speechUrl = this.config.get<string>('SPEECH_SERVICE_URL', 'http://localhost:8003');
  }

  async visionHealth(): Promise<boolean> {
    return this.healthCheck(this.visionUrl);
  }

  async nlpHealth(): Promise<boolean> {
    return this.healthCheck(this.nlpUrl);
  }

  async speechHealth(): Promise<boolean> {
    return this.healthCheck(this.speechUrl);
  }

  async recognizeGesture(landmarks: number[][], topK: number = 3): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await this.post(`${this.visionUrl}/api/v1/gesture/recognize`, {
        landmarks,
        top_k: topK,
      });
      this.logger.log(`Gesture recognition completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`Gesture recognition failed: ${error?.message || error}`);
      throw new HttpException(
        'Gesture recognition service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await this.post(`${this.nlpUrl}/api/v1/translate`, {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      });
      this.logger.log(`Translation completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`Translation failed: ${error?.message || error}`);
      throw new HttpException(
        'Translation service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async textToSpeech(text: string, locale: string, rate?: number): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await this.post(`${this.speechUrl}/api/v1/tts/synthesize`, {
        text,
        locale,
        rate: rate || 1.0,
      });
      this.logger.log(`TTS completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`TTS failed: ${error?.message || error}`);
      throw new HttpException(
        'Text-to-speech service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async speechToText(audioBase64: string, locale: string): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await this.post(`${this.speechUrl}/api/v1/asr/transcribe`, {
        audio: audioBase64,
        locale,
      });
      this.logger.log(`ASR completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`ASR failed: ${error?.message || error}`);
      throw new HttpException(
        'Speech recognition service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async classifyGesture(landmarks: number[][]): Promise<any> {
    const startTime = Date.now();
    try {
      const result = await this.post(`${this.visionUrl}/api/v1/gesture/classify`, {
        landmarks,
      });
      this.logger.log(`Gesture classification completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error: any) {
      this.logger.error(`Gesture classification failed: ${error?.message || error}`);
      throw new HttpException(
        'Gesture classification service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async healthCheck(url: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${url}/health`).pipe(
          timeout(5000),
          catchError(() => [{ status: 503 }]),
        ),
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private async post(url: string, data: any): Promise<any> {
    const response: AxiosResponse = await firstValueFrom(
      this.http.post(url, data).pipe(
        timeout(30000),
        retry({
          count: 2,
          delay: 1000,
          resetOnSuccess: true,
        }),
        catchError((error) => {
          this.logger.error(`ML service request failed: ${error.message}`);
          throw error;
        }),
      ),
    );
    return response.data;
  }

  async postToService(url: string, data: any): Promise<any> {
    return this.post(url, data);
  }
}
