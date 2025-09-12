import { ThreadBuilder } from '../ThreadBuilder'

export default function ThreadBuilderExample() {
  const handleThreadsChange = (threads: any[]) => {
    console.log('Threads updated:', threads)
  }

  return (
    <div className="h-[700px] p-4">
      <ThreadBuilder onThreadsChange={handleThreadsChange} />
    </div>
  )
}