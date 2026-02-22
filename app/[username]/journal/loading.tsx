import LoadingShell from '@/components/LoadingShell'
import { ListSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <LoadingShell activeTab="log">
      <ListSkeleton rows={6} />
    </LoadingShell>
  )
}