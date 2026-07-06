import { IsString, IsArray, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GestureRecognizeDto {
  @ApiProperty({ type: [Number], description: 'Flat array of landmark coordinates [x,y,z, x,y,z, ...]' })
  @IsArray()
  landmarks!: number[];

  @ApiPropertyOptional({ description: 'Number of top results to return' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  topK?: number;
}

export class GestureRecognizeResult {
  gestureId!: string;
  name!: string;
  arabicName!: string;
  confidence!: number;
}

export class TranslationDto {
  @ApiProperty({ description: 'Text to translate' })
  @IsString()
  text!: string;

  @ApiProperty({ enum: ['esl', 'asl', 'ar', 'en'], description: 'Source language' })
  @IsEnum(['esl', 'asl', 'ar', 'en'])
  sourceLang!: string;

  @ApiProperty({ enum: ['esl', 'asl', 'ar', 'en'], description: 'Target language' })
  @IsEnum(['esl', 'asl', 'ar', 'en'])
  targetLang!: string;
}

export class TranslationResult {
  originalText!: string;
  translatedText!: string;
  sourceLang!: string;
  targetLang!: string;
  confidence!: number;
  alternatives?: string[];
}

export class TtsDto {
  @ApiProperty({ description: 'Text to synthesize' })
  @IsString()
  text!: string;

  @ApiProperty({ enum: ['ar-AE', 'en-US'], description: 'Voice locale' })
  @IsEnum(['ar-AE', 'en-US'])
  locale!: string;

  @ApiPropertyOptional({ description: 'Speaking rate (0.5-2.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  rate?: number;
}

export class TtsResult {
  audioBase64!: string;
  durationMs!: number;
  format!: string;
}

export class AsrDto {
  @ApiProperty({ description: 'Base64 encoded audio data' })
  @IsString()
  audioBase64!: string;

  @ApiProperty({ enum: ['ar-AE', 'en-US'], description: 'Audio language' })
  @IsEnum(['ar-AE', 'en-US'])
  locale!: string;
}

export class AsrResult {
  transcript!: string;
  confidence!: number;
  language!: string;
  alternatives?: { text: string; confidence: number }[];
}

export class TrainingDto {
  @ApiProperty({ description: 'Dataset ID to train on' })
  @IsString()
  datasetId!: string;

  @ApiPropertyOptional({ description: 'Training configuration' })
  @IsOptional()
  config?: {
    epochs?: number;
    learningRate?: number;
    batchSize?: number;
  };
}

export class TrainingResult {
  modelId!: string;
  accuracy!: number;
  loss!: number;
  epochs!: number;
  status!: 'completed' | 'failed';
  trainedAt!: string;
}
