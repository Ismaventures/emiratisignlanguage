import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MlService } from './ml.service';
import {
  GestureRecognizeDto,
  TranslationDto,
  TtsDto,
  AsrDto,
  TrainingDto,
} from './dto/ml.dto';

@ApiTags('ML')
@Controller('ml')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MlController {
  constructor(private mlService: MlService) {}

  @Post('gesture/recognize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recognize gesture from hand landmarks' })
  @ApiResponse({ status: 200, description: 'Gesture recognition results' })
  @ApiResponse({ status: 502, description: 'ML service unavailable' })
  async recognizeGesture(@Body() dto: GestureRecognizeDto) {
    return this.mlService.recognizeGesture(dto);
  }

  @Post('gesture/classify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Classify gesture using ML model' })
  async classifyGesture(@Body() body: { landmarks: number[][] }) {
    return this.mlService.classifyGesture(body.landmarks);
  }

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Translate text between languages' })
  @ApiResponse({ status: 200, description: 'Translation result' })
  @ApiResponse({ status: 502, description: 'ML service unavailable' })
  async translate(@Body() dto: TranslationDto) {
    return this.mlService.translate(dto);
  }

  @Post('tts/synthesize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synthesize speech from text' })
  @ApiResponse({ status: 200, description: 'Audio data' })
  @ApiResponse({ status: 502, description: 'ML service unavailable' })
  async textToSpeech(@Body() dto: TtsDto) {
    return this.mlService.textToSpeech(dto);
  }

  @Post('asr/transcribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transcribe speech to text' })
  @ApiResponse({ status: 200, description: 'Transcription result' })
  @ApiResponse({ status: 502, description: 'ML service unavailable' })
  async speechToText(@Body() dto: AsrDto) {
    return this.mlService.speechToText(dto);
  }

  @Post('train')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Train gesture recognition model' })
  async trainModel(@Body() dto: TrainingDto) {
    return this.mlService.trainModel(dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check ML service health' })
  async getHealth() {
    return this.mlService.getHealthStatus();
  }
}
