import LoadingShell from '@/components/LoadingShell'
import { ListSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <LoadingShell activeTab="msg">
      <ListSkeleton rows={5} />
    </LoadingShell>
  )
}