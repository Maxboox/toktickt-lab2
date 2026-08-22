import { PrismaClient, RequestedPriority, TicketStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Créer les Catégories
  console.log('📁 Creating categories...')
  const categories = [
    { name: 'Account and Access', description: 'Problems with accounts, passwords, permissions' },
    { name: 'Hardware', description: 'Physical device issues (laptops, printers, etc.)' },
    { name: 'Software', description: 'Application and software problems' },
    { name: 'Network', description: 'Connectivity and network issues' }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    })
  }
  console.log(`✅ ${categories.length} categories created`)

  // 2. Créer les Systèmes
  console.log('💻 Creating systems...')
  const systems = [
    'Email',
    'Campus Wi-Fi',
    'VPN',
    'LEB2 App',
    'Grade Submission App',
    'Printer',
    'Corporate Laptop'
  ]

  for (const name of systems) {
    await prisma.system.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }
  console.log(`✅ ${systems.length} systems created`)

  // 3. Créer les Requesters
  console.log('👤 Creating requesters...')
  const requesters = [
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', isActive: true },
    { name: 'Bob Smith', email: 'bob.smith@example.com', isActive: true },
    { name: 'Carol Davis', email: 'carol.davis@example.com', isActive: true },
    { name: 'David Wilson', email: 'david.wilson@example.com', isActive: true },
    // Requester inactif (ne doit PAS apparaître dans le sélecteur)
    { name: 'Eve Adams', email: 'eve.adams@example.com', isActive: false }
  ]

  for (const req of requesters) {
    await prisma.requester.upsert({
      where: { email: req.email },
      update: {},
      create: req
    })
  }
  console.log(`✅ ${requesters.length} requesters created (1 inactive)`)

  // 4. Créer un ticket de démo pour Alice
  console.log('🎫 Creating demo tickets...')
  
  const alice = await prisma.requester.findUnique({ 
    where: { email: 'alice.johnson@example.com' } 
  })
  const hardware = await prisma.category.findUnique({ 
    where: { name: 'Hardware' } 
  })
  const laptop = await prisma.system.findUnique({ 
    where: { name: 'Corporate Laptop' } 
  })

  if (alice && hardware && laptop) {
    await prisma.ticket.upsert({
      where: { ticketNumber: 'TK-2026-001' },
      update: {},
      create: {
        ticketNumber: 'TK-2026-001',
        requesterId: alice.id,
        categoryId: hardware.id,
        systemId: laptop.id,
        summary: 'Laptop battery drains too quickly',
        requestedPriority: RequestedPriority.MEDIUM,
        currentStatus: TicketStatus.NEW,
        description: 'My corporate laptop battery only lasts about 2 hours instead of the expected 6 hours. I need a replacement battery or a new laptop.'
      }
    })
    console.log('✅ Demo ticket created for Alice')
  }

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
