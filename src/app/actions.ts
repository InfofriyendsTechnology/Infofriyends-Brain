'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

async function logActivity(action: string, userId: string, workId?: string, details?: string) {
  if (!process.env.DATABASE_URL) return
  await prisma.activityLog.create({
    data: { action, details, workId, userId }
  })
}

// Work Actions
export async function createWork(formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  if (session.user.role === 'ADMIN') return { success: false, error: 'Admins cannot participate in ideas' }
  const user = session.user

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string || 'MEDIUM'
  const status = formData.get('status') as string || 'IDEA'
  const dueDateStr = formData.get('dueDate') as string
  const parentWorkId = formData.get('parentWorkId') as string || null
  
  // Assignees
  const assigneeIdsRaw = formData.getAll('assigneeIds') as string[]
  
  // Person Mentions from form data
  const personMentionsRaw = formData.get('personMentions') as string
  let personMentionIds: string[] = []
  if (personMentionsRaw) {
    try {
      personMentionIds = JSON.parse(personMentionsRaw)
    } catch(e) {
      personMentionIds = personMentionsRaw.split(',').map(id => id.trim()).filter(Boolean)
    }
  }

  if (!name || !description) return { success: false, error: 'Missing required fields' }

  let dueDate: Date | null = null
  if (dueDateStr) {
    try {
      dueDate = new Date(dueDateStr)
    } catch (e) {}
  }

  try {
    const work = await prisma.work.create({
      data: {
        name,
        description,
        status,
        priority,
        dueDate,
        creatorId: user.id,
        parentWorkId: parentWorkId || null,
        assignees: {
          connect: assigneeIdsRaw.filter(Boolean).map(id => ({ id }))
        }
      },
    })
    
    // Points are NOT awarded here anymore; they are deferred until work completion.
    // We just record the person mentions with pointsAwarded = false
    for (const mentionedId of personMentionIds) {
      await prisma.personMention.create({
        data: {
          workId: work.id,
          userId: mentionedId,
          pointsAwarded: false
        }
      })
      await prisma.notification.create({
        data: {
          title: 'You were mentioned in an Idea!',
          message: `${user.name} mentioned you as an idea creator in "${work.name}". You'll receive 10 points when it's completed!`,
          type: 'INFO',
          userId: mentionedId
        }
      })
    }

    // Log creation
    await logActivity('CREATED_WORK', user.id, work.id, `Created work: "${name}" (Status: ${status}, Priority: ${priority})`)
    
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create work:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function editWork(id: string, formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const assigneeIdsRaw = formData.getAll('assigneeIds') as string[]
  const priority = formData.get('priority') as string || 'MEDIUM'
  const dueDateStr = formData.get('dueDate') as string

  if (!name || !description) return { success: false, error: 'Missing required fields' }

  let dueDate: Date | null = null
  if (dueDateStr) {
    try { dueDate = new Date(dueDateStr) } catch (e) {}
  }

  try {
    const work = await prisma.work.findUnique({ where: { id } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized to edit' }

    // Compare fields to track detailed changes
    const changes: string[] = []
    if (work.name !== name) {
      changes.push(`Title changed from "${work.name}" to "${name}"`)
    }
    if (work.priority !== priority) {
      changes.push(`Priority changed from "${work.priority}" to "${priority}"`)
    }
    if (work.description !== description) {
      changes.push(`Description updated`)
    }
    const logMsg = changes.length > 0 
      ? `Edited details: ${changes.join(', ')}` 
      : `Edited details of work: "${name}"`

    await prisma.work.update({
      where: { id },
      data: {
        name,
        description,
        priority,
        dueDate,
        assignees: {
          set: assigneeIdsRaw.filter(Boolean).map(id => ({ id }))
        },
        ...(user.role === 'ADMIN' && work.creatorId !== user.id && {
          editedByAdminId: user.id,
          editReason: 'Admin edited work details'
        })
      }
    })

    await logActivity('UPDATED_WORK', user.id, id, logMsg)
    
    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to edit work:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function updateWorkStatus(id: string, newStatus: string, blockedReason?: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ 
      where: { id }, 
      include: { creator: true, assignees: true, personMentions: true, parentWork: true } 
    })
    if (!work) return { success: false, error: 'Work not found' }

    // Admins can do anything. Members can update if they are creator or assignee.
    const isAssignee = work.assignees.some(a => a.id === user.id)
    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id || isAssignee
    if (!isAuthorized) {
      return { success: false, error: 'You are not authorized to update this work item' }
    }

    const isEditedByAdmin = user.role === 'ADMIN' && work.creatorId !== user.id

    // Update status and blockedReason if BLOCKED/DELETED
    await prisma.work.update({
      where: { id },
      data: { 
        status: newStatus,
        blockedReason: (newStatus === 'BLOCKED' || newStatus === 'DELETED') ? (blockedReason || 'No reason provided') : null,
        ...(isEditedByAdmin && {
          originalOwnerId: work.creatorId,
          editedByAdminId: user.id,
          editReason: `Status changed to ${newStatus} by admin`,
        })
      },
    })

    // Award Points if completed and idea points haven't been awarded yet
    if (newStatus === 'COMPLETED' && !work.ideaPointsAwarded) {
      if (work.parentWorkId) {
        await prisma.user.update({
          where: { id: work.creatorId },
          data: { totalPoints: { increment: 10 } }
        })
        await prisma.pointTransaction.create({
          data: { amount: 10, reason: 'WORK_MENTION', userId: work.creatorId, workId: work.id }
        })
      }

      for (const mention of work.personMentions) {
        if (!mention.pointsAwarded) {
          await prisma.personMention.update({
            where: { id: mention.id },
            data: { pointsAwarded: true }
          })
          await prisma.user.update({
            where: { id: mention.userId },
            data: { totalPoints: { increment: 10 } }
          })
          await prisma.pointTransaction.create({
            data: { amount: 10, reason: 'PERSON_MENTION', userId: mention.userId, workId: work.id }
          })
          await prisma.notification.create({
            data: {
              title: 'Idea Completed! Points Awarded!',
              message: `The idea "${work.name}" you were mentioned in has been completed. You received 10 points!`,
              type: 'INFO',
              userId: mention.userId
            }
          })
        }
      }

      await prisma.work.update({
        where: { id },
        data: { ideaPointsAwarded: true }
      })
    }

    // Log the action
    let logMsg = `Status changed to ${newStatus}.`
    if (newStatus === 'BLOCKED') {
      logMsg += ` Reason: "${blockedReason || 'None'}"`
    }
    await logActivity('STATUS_CHANGE', user.id, id, logMsg)
    
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update work:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function addWorkUpdate(workId: string, content: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  if (!content || !content.trim()) return { success: false, error: 'Update content is required' }

  try {
    await prisma.workUpdate.create({
      data: {
        content,
        workId,
        userId: user.id
      }
    })

    await logActivity('WORK_UPDATE', user.id, workId, `Posted update: "${content}"`)
    
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to add work update:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function getWorks() {
  try {
    const data = await prisma.work.findMany({
      include: {
        creator: { select: { id: true, name: true, profilePhoto: true, role: true } },
        assignees: { select: { id: true, name: true, profilePhoto: true, role: true } },
        editedByAdmin: { select: { name: true } },
        workUpdates: {
          include: {
            user: { select: { name: true, profilePhoto: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        activityLogs: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        parentWork: { select: { id: true, name: true } },
        personMentions: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true } }
          }
        },
        timeLogs: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Failed to fetch works:', error)
    return []
  }
}
// Time Mention / Logging
export async function logWorkTime(workId: string, hours: number) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  if (hours <= 0) return { success: false, error: 'Hours must be greater than 0' }

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }
    
    // Calculate points (1h=1pt, 2h=2pt, 4h=5pt)
    let points = 0;
    if (user.role !== 'NEUTRAL') {
      if (hours >= 4) points = 5;
      else if (hours >= 2) points = 2;
      else if (hours >= 1) points = 1;
    }
    
    if (points > 0) {
      await prisma.timeLog.create({
        data: {
          hours,
          points,
          workId,
          userId: user.id
        }
      })

      await prisma.user.update({
        where: { id: user.id },
        data: { totalPoints: { increment: points } }
      })

      await prisma.pointTransaction.create({
        data: {
          amount: points,
          reason: 'TIME_LOG',
          userId: user.id,
          workId
        }
      })
    }

    await logActivity('TIME_LOGGED', user.id, workId, `Logged ${hours} hours and earned ${points} points.`)
    
    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/members')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to log time:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

// Community Actions
export async function createCommunityPost(formData: FormData) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  
  const content = formData.get('content') as string
  const type = formData.get('type') as string

  if (!content) return { success: false, error: 'Post content is required' }

  try {
    await prisma.communityPost.create({
      data: {
        content,
        type,
        userId: session.user.id
      },
    })
    await logActivity('COMMUNITY_POST', session.user.id, undefined, `Posted a ${type}`)
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create post:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function getCommunityPosts() {
  try {
    const data = await prisma.communityPost.findMany({
      include: {
        user: { select: { name: true, role: true, profilePhoto: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return []
  }
}

// Idea & Proposal Agreement Actions
export async function getIdeasWithSupports() {
  try {
    const data = await prisma.work.findMany({
      where: {
        status: { in: ['IDEA', 'QUEUED', 'DECLINED', 'SHELVED', 'DELETED'] }
      },
      include: {
        creator: { select: { id: true, name: true, profilePhoto: true, role: true } },
        assignees: { select: { id: true, name: true, profilePhoto: true, role: true } },
        personMentions: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: true } }
          }
        },
        supports: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        disagrees: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: true } },
            replies: {
              include: {
                user: { select: { id: true, name: true, profilePhoto: true, role: true } }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        activityLogs: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: [
        { priority: 'asc' }, // URGENT first
        { createdAt: 'desc' }
      ],
    })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Failed to get ideas with supports:', error)
    return []
  }
}

export async function queueIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized' }

    const newStatus = work.status === 'QUEUED' ? 'IDEA' : 'QUEUED'
    
    await prisma.work.update({
      where: { id: workId },
      data: { status: newStatus }
    })

    await logActivity(
      newStatus === 'QUEUED' ? 'QUEUE_IDEA' : 'UNQUEUE_IDEA', 
      user.id, 
      workId, 
      newStatus === 'QUEUED' ? `Added proposal "${work.name}" to the execution queue.` : `Removed proposal "${work.name}" from the execution queue.`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to queue idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function toggleIdeaSupport(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user
  if (user.role === 'ADMIN') return { success: false, error: 'Admins cannot vote on ideas' }
  const userId = user.id

  try {
    const existing = await prisma.ideaSupport.findUnique({
      where: {
        workId_userId: { workId, userId }
      }
    })

    if (existing) {
      await prisma.ideaSupport.delete({
        where: {
          workId_userId: { workId, userId }
        }
      })
      await logActivity('REMOVE_IDEA_SUPPORT', userId, workId, `Removed agreement/support for this Idea.`)
    } else {
      await prisma.ideaSupport.create({
        data: { workId, userId }
      })
      // If agreed, remove disagree if exists
      await prisma.ideaDisagree.deleteMany({
        where: { workId, userId }
      })
      await logActivity('ADD_IDEA_SUPPORT', userId, workId, `Voted AGREE/SUPPORT for this Idea.`)
    }

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to toggle idea support:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function adminAllAgree(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user
  if (user.role !== 'ADMIN') return { success: false, error: 'Only Super Admin can use All Agree' }

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }
    if (work.status !== 'IDEA' && work.status !== 'QUEUED') {
      return { success: false, error: 'Can only use All Agree on open/queued proposals' }
    }

    // Check if anyone has disagreed — if yes, block All Agree
    const disagreeCount = await prisma.ideaDisagree.count({ where: { workId } })
    if (disagreeCount > 0) {
      return { success: false, error: 'Cannot use All Agree when someone has disagreed. Please resolve disagreements first.' }
    }

    // Get all non-ADMIN members
    const allMembers = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, name: true }
    })

    // Get existing supports so we don't duplicate
    const existingSupports = await prisma.ideaSupport.findMany({
      where: { workId },
      select: { userId: true }
    })
    const alreadyAgreedIds = new Set(existingSupports.map(s => s.userId))

    // Create supports only for members who haven't agreed yet (pending members)
    const newAgreements: string[] = []
    for (const member of allMembers) {
      if (!alreadyAgreedIds.has(member.id)) {
        await prisma.ideaSupport.create({
          data: { workId, userId: member.id }
        })
        newAgreements.push(member.name)
      }
    }

    // Log the activity with clear attribution
    const allNames = allMembers.map(m => m.name).join(', ')
    await logActivity(
      'ALL_AGREE_BY_ADMIN',
      user.id,
      workId,
      `✅ All Agree used by Super Admin (${user.name}). All members marked as agreed: ${allNames}`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true, agreedCount: newAgreements.length }
  } catch (error: any) {
    console.error('Failed to execute All Agree:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function declineIdea(workId: string, reason: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  if (!reason || !reason.trim()) return { success: false, error: 'Decline reason is required' }

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized to decline' }

    await prisma.work.update({
      where: { id: workId },
      data: {
        status: 'DECLINED',
        blockedReason: reason.trim()
      }
    })

    await logActivity(
      'DECLINED_IDEA',
      user.id,
      workId,
      `Declined proposal "${work.name}" — Reason: "${reason.trim()}"`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to decline idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function shelveIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized' }

    await prisma.work.update({
      where: { id: workId },
      data: { status: 'SHELVED' }
    })

    await logActivity(
      'SHELVED_IDEA',
      user.id,
      workId,
      `Shelved proposal "${work.name}" — saved for future reconsideration`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to shelve idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function reviveIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    const isAuthorized = user.role === 'ADMIN' || work.creatorId === user.id
    if (!isAuthorized) return { success: false, error: 'Not authorized to revive' }

    await prisma.work.update({
      where: { id: workId },
      data: { status: 'IDEA', blockedReason: null }
    })

    await logActivity(
      'REVIVED_IDEA',
      user.id,
      workId,
      `Revived proposal "${work.name}" — reopened for team review`
    )

    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to revive idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function deleteIdea(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    const work = await prisma.work.findUnique({
      where: { id: workId }
    })
    if (!work) return { success: false, error: 'Work not found' }

    // Only creator or admin can delete
    if (work.creatorId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Only the proposal creator or admin can delete' }
    }

    // Soft delete: set status to 'DELETED'
    await prisma.work.update({
      where: { id: workId },
      data: { status: 'DELETED' }
    })

    await logActivity(
      'DELETED_IDEA',
      user.id,
      workId,
      `Deleted proposal "${work.name}" — moved to deleted archives`
    )

    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete idea:', error)
    return { success: false, error: `Database error: ${error.message || error}` }
  }
}

export async function disagreeWithIdea(workId: string, reason: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user
  if (user.role === 'ADMIN') return { success: false, error: 'Admins cannot vote on ideas' }
  const userId = user.id

  if (!reason || !reason.trim()) return { success: false, error: 'Reason is required' }

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }

    // If they already agreed, remove their agreement
    await prisma.ideaSupport.deleteMany({
      where: { workId, userId }
    })

    // Upsert disagree
    const disagree = await prisma.ideaDisagree.findUnique({
      where: { workId_userId: { workId, userId } }
    })

    if (disagree) {
      await prisma.ideaDisagree.update({
        where: { id: disagree.id },
        data: { reason }
      })
    } else {
      await prisma.ideaDisagree.create({
        data: { workId, userId, reason }
      })
    }

    await logActivity('IDEA_DISAGREE', userId, workId, `Disagreed with proposal. Reason: ${reason}`)
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to disagree:', error)
    return { success: false, error: error.message }
  }
}

export async function replyToDisagree(disagreeId: string, content: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const userId = session.user.id

  if (!content || !content.trim()) return { success: false, error: 'Reply cannot be empty' }

  try {
    const disagree = await prisma.ideaDisagree.findUnique({ where: { id: disagreeId } })
    if (!disagree) return { success: false, error: 'Disagreement not found' }

    await prisma.ideaDisagreeReply.create({
      data: {
        content,
        disagreeId,
        userId
      }
    })

    await logActivity('DISAGREE_REPLY', userId, disagree.workId, `Replied to a disagreement: "${content}"`)
    revalidatePath('/')
    revalidatePath('/works')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to reply to disagree:', error)
    return { success: false, error: error.message }
  }
}

export async function removeDisagree(workId: string) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }
  const userId = session.user.id

  try {
    await prisma.ideaDisagree.deleteMany({
      where: { workId, userId }
    })
    
    await logActivity('REMOVE_DISAGREE', userId, workId, `Removed disagreement for this Idea.`)
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

  try {
    const work = await prisma.work.findUnique({ where: { id: workId } })
    if (!work) return { success: false, error: 'Work not found' }
    
    await prisma.work.update({
      where: { id: workId },
      data: {
        status: 'ACTIVE',
        expectedDurationHours,
        assignees: {
          connect: assigneeIdsRaw.filter(Boolean).map(id => ({ id }))
        }
      }
    })

    await logActivity('CONVERT_WORK', user.id, workId, `Converted proposal to Active Work.`)
    revalidatePath('/')
    revalidatePath('/works')
    revalidatePath('/proposals')
    return { success: true }
  } catch(error: any) {
    return { success: false, error: error.message }
  }
}
