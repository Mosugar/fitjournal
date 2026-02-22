import LoadingShell from '@/components/LoadingShell'
import { ListSkeleton } from '@/components/Skeletons'

export default function Loading() {
  return (
    <LoadingShell>
      <ListSkeleton rows={8} />
    </LoadingShell>
  )
}