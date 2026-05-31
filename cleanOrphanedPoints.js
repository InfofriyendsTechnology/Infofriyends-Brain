const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up orphaned PointTransactions...')
  
  // 1. Get all point transactions that have a workId
  const transactions = await prisma.pointTransaction.findMany({
    where: {
      workId: { not: null }
    }
  })

  let deletedCount = 0

  // 2. Check if the work still exists, if not, delete the transaction
  for (const tx of transactions) {
    const workExists = await prisma.work.findUnique({
      where: { id: tx.workId }
    })
    
    if (!workExists || workExists.status === 'DELETED') {
      await prisma.pointTransaction.delete({
        where: { id: tx.id }
      })
      deletedCount++
    }
  }

  console.log(`Deleted ${deletedCount} orphaned PointTransaction records.`)

  // 3. Recalculate points for all users
  console.log('Recalculating user points...')
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    const txs = await prisma.pointTransaction.findMany({
      where: { userId: user.id }
    })
    const calculatedPoints = txs.reduce((acc, tx) => acc + tx.amount, 0)

    await prisma.user.update({
      where: { id: user.id },
      data: { totalPoints: calculatedPoints }
    })

    console.log(`Updated user ${user.name} -> ${calculatedPoints} points`)
  }

  console.log('Done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
