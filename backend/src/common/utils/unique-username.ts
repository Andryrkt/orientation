import { PrismaService } from '../../prisma/prisma.service';
import { slugify } from './slugify';

export async function generateUniqueUsername(prisma: PrismaService, base: string): Promise<string> {
  const slug = slugify(base) || 'utilisateur';
  let candidate = slug;
  let i = 1;
  while (await prisma.utilisateur.findUnique({ where: { username: candidate } })) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
}
