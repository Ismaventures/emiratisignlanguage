import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string };
}

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  async create(@Request() req: AuthenticatedRequest, @Body() body: { title?: string; languagePair: string }) {
    return this.conversationsService.create(req.user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'List user conversations' })
  async findAll(@Request() req: AuthenticatedRequest, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.conversationsService.findAll(req.user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  async findById(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.conversationsService.findById(req.user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  async delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.conversationsService.delete(req.user.sub, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to conversation' })
  async addMessage(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      senderType: string;
      contentType: string;
      content: string;
      translationAr?: string;
      translationEn?: string;
      confidence?: number;
    },
  ) {
    return this.conversationsService.addMessage(req.user.sub, id, body);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List conversation messages' })
  async getMessages(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.conversationsService.getMessages(req.user.sub, id);
  }
}
