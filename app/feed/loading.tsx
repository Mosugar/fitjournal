import LoadingShell from '@/components/LoadingShell'
import { FeedSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <LoadingShell activeTab="feed">
      <FeedSkeleton />
    </LoadingShell>
  )
}