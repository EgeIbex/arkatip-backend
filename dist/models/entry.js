"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entry = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Entry {
    static async create(data) {
        return prisma.entry.create({
            data
        });
    }
    static async findById(id) {
        return prisma.entry.findUnique({
            where: { id }
        });
    }
    static async findByUserId(userId) {
        return prisma.entry.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
    }
    static async update(id, data) {
        return prisma.entry.update({
            where: { id },
            data
        });
    }
    static async delete(id) {
        return prisma.entry.delete({
            where: { id }
        });
    }
}
exports.Entry = Entry;
