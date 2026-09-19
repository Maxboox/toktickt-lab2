import { PrismaClient, Role, RequestedPriority, ITPriority, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mot de passe de test pour TOUS les utilisateurs seedés.
// Ils devront le changer à la première connexion.
const DEFAULT_PASSWORD = 'Password123!';

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await hash(DEFAULT_PASSWORD);

  // ==========================================================
  // 1. USERS
  // ==========================================================
  console.log('👤 Creating users...');

  const users = [
    // Requesters actifs
    { name: 'Alice Johnson',   email: 'alice.johnson@example.com',   role: Role.REQUESTER,     isActive: true },
    { name: 'Bob Smith',       email: 'bob.smith@example.com',       role: Role.REQUESTER,     isActive: true },
    { name: 'Carol Davis',     email: 'carol.davis@example.com',     role: Role.REQUESTER,     isActive: true },
    { name: 'David Wilson',    email: 'david.wilson@example.com',    role: Role.REQUESTER,     isActive: true },
    // Requester inactif (ne doit PAS pouvoir se connecter)
    { name: 'Eve Adams',       email: 'eve.adams@example.com',       role: Role.REQUESTER,     isActive: false },

    // IT Staff actifs
    { name: 'Michael Brown',   email: 'michael.brown@tiktockit.com', role: Role.IT_STAFF,      isActive: true },
    { name: 'Sarah Johnson',   email: 'sarah.johnson@tiktockit.com', role: Role.IT_STAFF,      isActive: true },
    { name: 'Kevin Patel',     email: 'kevin.patel@tiktockit.com',   role: Role.IT_STAFF,      isActive: true },
    // IT Staff inactif
    { name: 'Linda Garcia',    email: 'linda.garcia@tiktockit.com',  role: Role.IT_STAFF,      isActive: false },

    // Administrator
    { name: 'John Smith',      email: 'john.smith@tiktockit.com',    role: Role.ADMINISTRATOR, isActive: true },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: {
        name:               u.name,
        email:              u.email,
        passwordHash,
        role:               u.role,
        isActive:           u.isActive,
        mustChangePassword: true,
      },
    });
  }
  console.log(`✅ ${users.length} users created`);

  // ==========================================================
  // 2. CATEGORIES
  // ==========================================================
  console.log('📂 Creating categories...');
  const categories = [
    { name: 'Account and Access', description: 'Problems with accounts, passwords, permissions' },
    { name: 'Hardware',           description: 'Physical device issues (laptops, printers, etc.)' },
    { name: 'Software',           description: 'Application and software problems' },
    { name: 'Network',            description: 'Connectivity and network issues' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
  }
  console.log(`✅ ${categories.length} categories created`);

  // ==========================================================
  // 3. SYSTEMS
  // ==========================================================
  console.log('🖥️  Creating systems...');
  const systems = [
    'Email', 'Campus Wi-Fi', 'VPN', 'LEB2 App',
    'Grade Submission App', 'Printer', 'Corporate Laptop',
  ];
  for (const name of systems) {
    await prisma.system.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`✅ ${systems.length} systems created`);

  // ==========================================================
  // 4. TICKETS (quelques exemples)
  // ==========================================================
  console.log('🎫 Creating tickets...');

  const alice   = await prisma.user.findUnique({ where: { email: 'alice.johnson@example.com' } });
  const bob     = await prisma.user.findUnique({ where: { email: 'bob.smith@example.com' } });
  const carol   = await prisma.user.findUnique({ where: { email: 'carol.davis@example.com' } });
  const michael = await prisma.user.findUnique({ where: { email: 'michael.brown@tiktockit.com' } });
  const sarah   = await prisma.user.findUnique({ where: { email: 'sarah.johnson@tiktockit.com' } });
  const hardware = await prisma.category.findUnique({ where: { name: 'Hardware' } });
  const software = await prisma.category.findUnique({ where: { name: 'Software' } });
  const network  = await prisma.category.findUnique({ where: { name: 'Network' } });
  const laptop   = await prisma.system.findUnique({ where: { name: 'Corporate Laptop' } });
  const vpn      = await prisma.system.findUnique({ where: { name: 'VPN' } });
  const app      = await prisma.system.findUnique({ where: { name: 'LEB2 App' } });

  if (!alice || !bob || !carol || !michael || !sarah) throw new Error('Users not seeded');
  if (!hardware || !software || !network || !laptop || !vpn || !app) throw new Error('Categories/Systems not seeded');

  const year = new Date().getFullYear();
  let counter = 0;

  const ticketsData = [
    {
      summary: 'Laptop battery drains quickly',
      description: 'My laptop is draining much faster than usual even when the system is idle. This started happening after last week\'s Windows update.',
      requesterId: alice.id,
      categoryId: hardware.id,
      systemId: laptop.id,
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ITPriority.MEDIUM,
      currentStatus: TicketStatus.IN_PROGRESS,
      ownerId: michael.id,
    },
    {
      summary: 'Cannot connect to VPN from home',
      description: 'VPN client shows "authentication failed" when I try to connect from home. Works fine from campus.',
      requesterId: bob.id,
      categoryId: network.id,
      systemId: vpn.id,
      requestedPriority: RequestedPriority.URGENT,
      itPriority: ITPriority.HIGH,
      currentStatus: TicketStatus.OPEN,
      ownerId: null,
    },
    {
      summary: 'LEB2 App crashes when submitting grades',
      description: 'The application crashes whenever I click the "Submit" button on the grade submission page.',
      requesterId: carol.id,
      categoryId: software.id,
      systemId: app.id,
      requestedPriority: RequestedPriority.MEDIUM,
      itPriority: ITPriority.MEDIUM,
      currentStatus: TicketStatus.NEW,
      ownerId: null,
    },
    {
      summary: 'Screen flickering on Dell XPS',
      description: 'The screen flickers occasionally, especially when scrolling.',
      requesterId: alice.id,
      categoryId: hardware.id,
      systemId: laptop.id,
      requestedPriority: RequestedPriority.LOW,
      itPriority: null,
      currentStatus: TicketStatus.NEW,
      ownerId: null,
    },
    {
      summary: 'Wi-Fi drops every 10 minutes',
      description: 'Wi-Fi disconnects every 10 minutes on the 3rd floor of the library.',
      requesterId: bob.id,
      categoryId: network.id,
      systemId: vpn.id,
      requestedPriority: RequestedPriority.HIGH,
      itPriority: ITPriority.HIGH,
      currentStatus: TicketStatus.WAITING_FOR_REQUESTER,
      ownerId: sarah.id,
    },
  ];

  for (const t of ticketsData) {
    counter++;
    const ticketNumber = `TK-${year}-${String(counter).padStart(3, '0')}`;
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        requesterId: t.requesterId,
        ownerId: t.ownerId,
        categoryId: t.categoryId,
        systemId: t.systemId,
        summary: t.summary,
        description: t.description,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        currentStatus: t.currentStatus,
      },
    });

    // Ajouter 1 commentaire public + 1 note interne sur le 1er ticket
    if (counter === 1) {
      await prisma.publicComment.create({
        data: {
          ticketId: ticket.id,
          authorId: michael.id,
          content: 'We are investigating the issue on your device. We will update you shortly.',
        },
      });
      await prisma.publicComment.create({
        data: {
          ticketId: ticket.id,
          authorId: alice.id,
          content: 'Thank you for the update. Please let me know if you need any additional information.',
        },
      });
      await prisma.internalNote.create({
        data: {
          ticketId: ticket.id,
          authorId: michael.id,
          content: 'Checked battery health — 87%. Recommended running Windows battery report.',
        },
      });
    }
  }
  console.log(`✅ ${counter} tickets created`);

  // ==========================================================
  // RÉSUMÉ
  // ==========================================================
  console.log('');
  console.log('✅ Seed complete!');
  console.log('');
  console.log('📋 Test credentials (must change password on first login):');
  console.log('   Requester:      alice.johnson@example.com / Password123!');
  console.log('   IT Staff:       michael.brown@tiktockit.com / Password123!');
  console.log('   Administrator:  john.smith@tiktockit.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
