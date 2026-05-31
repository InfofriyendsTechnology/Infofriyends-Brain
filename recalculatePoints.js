const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching all users...')
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

  console.log('Done recalculating points via ledger!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
