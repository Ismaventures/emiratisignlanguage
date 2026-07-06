import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { prisma } from '@emirsign/database';

@Injectable()
export class ConversationsService {
  async create(userId: string, data: { title?: string; languagePair: string }) {
    return prisma.conversation.create({
      data: {
        userId,
        title: data.title || 'New Conversation',
        languagePair: data.languagePair,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId, status: 'ACTIVE' },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.conversation.count({
        where: { userId, status: 'ACTIVE' },
      }),
    ]);

    return {
      conversations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId: string, id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async delete(userId: string, id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return prisma.conversation.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async addMessage(
    userId: string,
    conversationId: string,
    data: {
      senderType: string;
      contentType: string;
      content: string;
      translationAr?: string;
      translationEn?: string;
      confidence?: number;
    },
  ) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return prisma.conversationMessage.create({
      data: {
        conversationId,
        senderType: data.senderType as any,
        contentType: data.contentType as any,
        content: data.content,
        translationAr: data.translationAr,
        translationEn: data.translationEn,
        confidence: data.confidence,
      },
    });
  }

  async getMessages(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
