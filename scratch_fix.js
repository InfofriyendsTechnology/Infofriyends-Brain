const fs = require('fs');
const file = 'c:/Users/SIS/OneDrive/Desktop/IMPORTANT/Infofriyends Brain/src/app/actions.ts';
let data = fs.readFileSync(file, 'utf8');

const startIdx = data.indexOf('export async function removeDisagree');

if (startIdx === -1) {
  console.log('Could not find removeDisagree');
  process.exit(1);
}

const newEnd = `export async function removeDisagree(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const userId = session.user.id

  try {
    await prisma.ideaDisagree.deleteMany({
      where: { workId, userId }
    })
    
    await logActivity('REMOVE_DISAGREE', userId, workId, \`Removed disagreement for this Idea.\`)
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to remove disagree:', error)
    return { success: false, error: error.message }
  }
}

export async function convertIdeaToWork(workId: string, formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user
  const assigneeIdsRaw = formData.getAll('assigneeIds') as string[]
  const expectedDurationRaw = formData.get('expectedDurationHours') as string
  const expectedDurationHours = expectedDurationRaw ? parseInt(expectedDurationRaw, 10) : null
  const dueDateRaw = formData.get('dueDate') as string
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }
    
    await prisma.work.update({
      where: { id: workId },
      data: {
        status: 'ACTIVE',
        expectedDurationHours,
        ...(dueDate && { dueDate }),
        assignees: {
          connect: assigneeIdsRaw.filter(Boolean).map(id => ({ id }))
        }
      }
    })

    await logActivity('CONVERT_WORK', user.id, workId, \`Converted proposal to Active Work.\`)
    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch(error: any) {
    return { success: false, error: error.message }
  }
}

export async function permanentlyDeleteWork(id: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id } })
    if (!work) return { success: false, error: 'Work not found' }

    // Only Admin or Creator can permanently delete
    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to permanently delete this item.' }
    }

    await prisma.work.delete({ where: { id } })

    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to permanently delete work:', error)
    return { success: false, error: \`Database error: \${error.message || error}\` }
  }
}
`

const newData = data.substring(0, startIdx) + newEnd;
fs.writeFileSync(file, newData);
console.log('Fixed actions.ts');
