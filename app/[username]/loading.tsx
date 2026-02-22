import LoadingShell from '@/components/LoadingShell'
import { ProfileSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <LoadingShell activeTab="profile">
      <ProfileSkeleton />
    </LoadingShell>
  )
}