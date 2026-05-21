import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Clearing old data from DB...')
  await prisma.activityLog.deleteMany({})
  await prisma.communityPost.deleteMany({})
  await prisma.dailyUpdate.deleteMany({})
  await prisma.chatMessage.deleteMany({})
  await prisma.pointTransaction.deleteMany({})
  await prisma.personMention.deleteMany({})
  await prisma.timeLog.deleteMany({})
  await prisma.ideaSupport.deleteMany({})
  await prisma.ideaDisagreeReply.deleteMany({})
  await prisma.ideaDisagree.deleteMany({})
  await prisma.workUpdate.deleteMany({})
  await prisma.note.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.work.deleteMany({})
  console.log('Successfully cleared all project data. Only Users remain.')
}

main()
  .catch(e => { console.error('Error clearing data:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
