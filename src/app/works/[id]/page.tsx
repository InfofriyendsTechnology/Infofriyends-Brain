import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import WorkDetailClient from '@/components/WorkDetailClient'
import Sidebar from '@/components/Sidebar'

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const work = await prisma.work.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, profilePhoto: true, role: true, customRole: true } },
      assignees: { select: { id: true, name: true, profilePhoto: true, role: true, customRole: true } },
      editedByAdmin: { select: { name: true } },
      workUpdates: {
        include: {
          user: { select: { name: true, profilePhoto: true, role: true, customRole: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      activityLogs: {
        include: {
          user: { select: { name: true, profilePhoto: true, role: true, customRole: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      parentWork: { select: { id: true, name: true } },
      personMentions: {
        include: {
          user: { select: { id: true, name: true, profilePhoto: true, role: true, customRole: true } }
        }
      },
      timeLogs: {
        include: {
          user: { select: { id: true, name: true, profilePhoto: true, role: true, customRole: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!work) redirect('/works')

  // We need to fetch all users for assignees if user is ADMIN or Creator, but for now we just pass the work data
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, customRole: true, profilePhoto: true }
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0d12] relative">
      <Sidebar session={session} />
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar pt-14 md:pt-0 pb-20 md:pb-0">
        <WorkDetailClient work={JSON.parse(JSON.stringify(work))} currentUser={session.user} allUsers={JSON.parse(JSON.stringify(users))} />
      </main>
    </div>
  )
}
