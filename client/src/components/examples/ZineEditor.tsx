import { ZineEditor } from '../ZineEditor'

export default function ZineEditorExample() {
  const handleSave = (zine: { title: string; sections: any[] }) => {
    console.log('Zine saved:', zine)
  }

  return (
    <div className="h-[700px] p-4">
      <ZineEditor onSave={handleSave} />
    </div>
  )
}