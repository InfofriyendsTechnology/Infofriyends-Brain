'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getNotesAction() {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, notes }
  } catch (error: any) {
    console.error('Fetch notes error:', error)
    return { success: false, error: error.message || 'Failed to fetch notes' }
  }
}

export async function createNoteAction(data: {
  title: string
  content: string
  color?: string
  reminderAt?: string | null
}) {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    const note = await prisma.note.create({
      data: {
        title: data.title || 'Untitled Note',
        content: data.content || '',
        color: data.color || '#63BDF2',
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        userId: session.user.id
      }
    })
    revalidatePath('/')
    return { success: true, note }
  } catch (error: any) {
    console.error('Create note error:', error)
    return { success: false, error: error.message || 'Failed to create note' }
  }
}

export async function updateNoteAction(
  id: string,
  data: {
    title?: string
    content?: string
    color?: string
    reminderAt?: string | null
  }
) {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    // Confirm ownership
    const note = await prisma.note.findUnique({ where: { id } })
    if (!note || note.userId !== session.user.id) {
      throw new Error('Note not found or unauthorized')
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        color: data.color,
        reminderAt: data.reminderAt !== undefined 
          ? (data.reminderAt ? new Date(data.reminderAt) : null)
          : undefined
      }
    })
    revalidatePath('/')
    return { success: true, note: updatedNote }
  } catch (error: any) {
    console.error('Update note error:', error)
    return { success: false, error: error.message || 'Failed to update note' }
  }
}

export async function deleteNoteAction(id: string) {
  const session = await getSession()
  if (!session || !session.user) {
    throw new Error('Not authenticated')
  }

  try {
    // Confirm ownership
    const note = await prisma.note.findUnique({ where: { id } })
    if (!note || note.userId !== session.user.id) {
      throw new Error('Note not found or unauthorized')
    }

    await prisma.note.delete({ where: { id } })
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Delete note error:', error)
    return { success: false, error: error.message || 'Failed to delete note' }
  }
}
