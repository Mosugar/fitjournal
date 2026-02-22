import LoadingShell from '@/components/LoadingShell'
import { SessionSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <LoadingShell activeTab="log">
      <SessionSkeleton />
    </LoadingShell>
  )
}