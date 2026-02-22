'use server'

import { revalidateTag, revalidatePath } from 'next/cache'

// Call these server actions after mutations to bust the cache

export async function invalidateProfile(username: string) {
  revalidateTag(`profile-${username}`, 'page')
  revalidatePath(`/${username}`, 'page')
}

export async function invalidateSessions(userId: string, username: string) {
  revalidateTag(`sessions-${userId}`, 'page')
  revalidatePath(`/${username}/journal`, 'page')
}

export async function invalidateSession(sessionId: string, username: string) {
  revalidateTag(`session-${sessionId}`, 'page')
  revalidatePath(`/${username}/journal/${sessionId}`, 'page')
}

export async function invalidatePalmares(userId: string, username: string) {
  revalidateTag(`palmares-${userId}`, 'page')
  revalidatePath(`/${username}`, 'page')
}

export async function invalidatePRs(userId: string, username: string) {
  revalidateTag(`prs-${userId}`, 'page')
  revalidatePath(`/${username}`, 'page')
}

export async function invalidateFollows(profileId: string) {
  revalidateTag(`follows-${profileId}`, 'page')
}

export async function invalidateFeed() {
  revalidateTag('feed', 'page')
  revalidatePath('/feed', 'page')
}

export async function invalidateMyProfile(userId: string) {
  revalidateTag(`my-profile-${userId}`, 'page')
}