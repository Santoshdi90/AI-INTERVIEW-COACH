import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiinterviewcoach.com' },
    update: {},
    create: {
      email: 'admin@aiinterviewcoach.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
      targetRole: 'Platform Administrator',
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Demo user
  const demoPassword = await bcrypt.hash('Demo@1234', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@aiinterviewcoach.com' },
    update: {},
    create: {
      email: 'demo@aiinterviewcoach.com',
      passwordHash: demoPassword,
      name: 'Demo User',
      role: 'USER',
      isVerified: true,
      education: "B.Tech Computer Science, IIT Delhi",
      experience: '3 years',
      targetCompany: 'Google',
      targetRole: 'Senior Software Engineer',
      bio: 'Passionate software engineer with experience in full-stack development.',
    },
  });
  console.log(`✅ Demo user: ${demo.email}`);

  // Demo skills
  const skills = [
    { name: 'JavaScript', proficiency: 85 },
    { name: 'TypeScript', proficiency: 80 },
    { name: 'React', proficiency: 82 },
    { name: 'Node.js', proficiency: 75 },
    { name: 'PostgreSQL', proficiency: 70 },
    { name: 'Docker', proficiency: 60 },
    { name: 'System Design', proficiency: 55 },
    { name: 'Python', proficiency: 65 },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { userId_name: { userId: demo.id, name: skill.name } },
      update: { proficiency: skill.proficiency },
      create: { userId: demo.id, name: skill.name, proficiency: skill.proficiency, source: 'MANUAL' },
    });
  }
  console.log(`✅ Demo skills seeded`);

  // Demo analytics
  const metrics = ['INTERVIEW_SCORE', 'GRAMMAR_SCORE', 'CONFIDENCE_SCORE', 'TECHNICAL_SCORE', 'COMMUNICATION_SCORE'] as const;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (i % 3 === 0) {
      for (const metric of metrics) {
        const base = metric === 'INTERVIEW_SCORE' ? 65 : 60;
        const value = base + Math.floor(Math.random() * 30) + (30 - i) * 0.3;
        await prisma.analytic.create({
          data: { userId: demo.id, metric, value: Math.min(Math.round(value), 95), date },
        });
      }
    }
  }
  console.log(`✅ Demo analytics seeded`);

  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo credentials:');
  console.log('  User:  demo@aiinterviewcoach.com / Demo@1234');
  console.log('  Admin: admin@aiinterviewcoach.com / Admin@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
