import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting data cleanup...')

  // Delete all Works and related models (cascade will handle some, but let's be explicit where needed)
  await prisma.activityLog.deleteMany()
  await prisma.workUpdate.deleteMany()
  await prisma.ideaSupport.deleteMany()
  await prisma.ideaDisagreeReply.deleteMany()
  await prisma.ideaDisagree.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.personMention.deleteMany()
  await prisma.timeLog.deleteMany()
  
  // Extra features just to be safe
  await prisma.communityPost.deleteMany()
  await prisma.dailyUpdate.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.typingState.deleteMany()
  await prisma.chatChannel.deleteMany()
  await prisma.note.deleteMany()

  // Finally delete all works
  await prisma.work.deleteMany()

  // Reset user points
  await prisma.user.updateMany({
    data: {
      totalPoints: 0
    }
  })

  console.log('Data cleanup completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
