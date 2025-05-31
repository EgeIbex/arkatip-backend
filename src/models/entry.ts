import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EntryData {
  content: string;
  interpretation?: string;
  userId: string;
  date: Date;
}

export class Entry {
  static async create(data: EntryData) {
    return prisma.entry.create({
      data
    });
  }

  static async findById(id: string) {
    return prisma.entry.findUnique({
      where: { id }
    });
  }

  static async findByUserId(userId: string) {
    return prisma.entry.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
  }

  static async update(id: string, data: Partial<EntryData>) {
    return prisma.entry.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.entry.delete({
      where: { id }
    });
  }
} 