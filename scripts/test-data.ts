import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing test data...')
  
  // Create or get some test users
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Super Admin',
      username: 'admin',
      passwordHash: 'password',
      role: 'ADMIN',
    }
  })

  const member1 = await prisma.user.upsert({
    where: { username: 'testuser1' },
    update: {},
    create: {
      name: 'Alice Developer',
      username: 'testuser1',
      passwordHash: 'password',
      role: 'MEMBER',
    }
  })

  const member2 = await prisma.user.upsert({
    where: { username: 'testuser2' },
    update: {},
    create: {
      name: 'Bob Designer',
      username: 'testuser2',
      passwordHash: 'password',
      role: 'MEMBER',
    }
  })

  console.log('Creating 5 Proposals (IDEA status)...')
  
  // Proposal 1: Unanimous agreement
  const idea1 = await prisma.work.create({
    data: {
      name: 'Migrate to Next.js 15 App Router',
      description: 'Upgrade the entire codebase to use Next.js 15 features, including Server Components and async params.',
      status: 'IDEA',
      priority: 'HIGH',
      creatorId: member1.id,
      personMentions: {
        create: [{ userId: member2.id }]
      }
    }
  })

  // Proposal 2: Queued
  const idea2 = await prisma.work.create({
    data: {
      name: 'Redesign Landing Page',
      description: 'Implement a new modern, dark-themed landing page with glassmorphism effects.',
      status: 'QUEUED',
      priority: 'MEDIUM',
      creatorId: member2.id,
    }
  })

  // Proposal 3: Declined
  const idea3 = await prisma.work.create({
    data: {
      name: 'Switch to MongoDB',
      description: 'Replace PostgreSQL with MongoDB for faster document storage.',
      status: 'DECLINED',
      priority: 'LOW',
      creatorId: member1.id,
      blockedReason: 'We need relational data integrity, MongoDB is not suitable for our schema.',
    }
  })

  // Proposal 4: Shelved
  const idea4 = await prisma.work.create({
    data: {
      name: 'Implement Mobile App',
      description: 'Create a React Native mobile app for iOS and Android.',
      status: 'SHELVED',
      priority: 'HIGH',
      creatorId: member2.id,
    }
  })

  // Proposal 5: Open Idea waiting for support
  const idea5 = await prisma.work.create({
    data: {
      name: 'Add Dark Mode Toggle',
      description: 'Allow users to switch between light and dark themes.',
      status: 'IDEA',
      priority: 'LOW',
      creatorId: member1.id,
      personMentions: {
        create: [{ userId: member1.id }, { userId: member2.id }]
      }
    }
  })

  // Add some supports
  await prisma.ideaSupport.create({ data: { workId: idea1.id, userId: member2.id } })
  await prisma.ideaSupport.create({ data: { workId: idea1.id, userId: member1.id } })
  await prisma.ideaSupport.create({ data: { workId: idea5.id, userId: member2.id } })

  console.log('Creating 5 Works (ACTIVE/COMPLETED status)...')

  // Work 1: Active
  const work1 = await prisma.work.create({
    data: {
      name: 'Setup Prisma ORM',
      description: 'Configure Prisma schema and connect to Supabase PostgreSQL.',
      status: 'ACTIVE',
      priority: 'HIGH',
      creatorId: member1.id,
      assigneeId: member1.id,
    }
  })

  // Work 2: Completed
  const work2 = await prisma.work.create({
    data: {
      name: 'Design Logo',
      description: 'Create a new vector logo for the startup.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      creatorId: member2.id,
      assigneeId: member2.id,
    }
  })

  // Work 3: Active with updates
  const work3 = await prisma.work.create({
    data: {
      name: 'Implement Authentication',
      description: 'Build login and registration using custom session cookies.',
      status: 'ACTIVE',
      priority: 'URGENT',
      creatorId: member1.id,
      assigneeId: member1.id,
    }
  })

  // Work 4: Active
  const work4 = await prisma.work.create({
    data: {
      name: 'Create UI Components',
      description: 'Build reusable WorkCard and ProposalCard components.',
      status: 'ACTIVE',
      priority: 'HIGH',
      creatorId: member2.id,
      assigneeId: member2.id,
    }
  })

  // Work 5: Completed
  const work5 = await prisma.work.create({
    data: {
      name: 'Initial Repository Setup',
      description: 'Initialize Git, configure ESLint and Prettier.',
      status: 'COMPLETED',
      priority: 'LOW',
      creatorId: adminUser.id,
      assigneeId: member1.id,
    }
  })

  console.log('Creating Updates (Logs) for Works...')

  // Updates for Work 1
  await prisma.workUpdate.create({
    data: { content: 'Schema is ready, running migrations.', workId: work1.id, userId: member1.id }
  })
  
  // Updates for Work 3
  await prisma.workUpdate.create({
    data: { content: 'Built the login form UI.', workId: work3.id, userId: member1.id }
  })
  await prisma.workUpdate.create({
    data: { content: 'Struggling with cookie serialization, need help.', workId: work3.id, userId: member1.id }
  })

  // Activity logs to update scores
  await prisma.activityLog.create({
    data: { action: 'CREATED_WORK', details: 'Design Logo', workId: work2.id, userId: member2.id }
  })
  await prisma.activityLog.create({
    data: { action: 'COMPLETED_WORK', details: 'Design Logo', workId: work2.id, userId: member2.id }
  })
  
  // Update member points
  await prisma.user.update({ where: { id: member2.id }, data: { totalPoints: 10 } })
  await prisma.user.update({ where: { id: member1.id }, data: { totalPoints: 15 } })

  console.log('Test data generation completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
