import { useState } from 'react'
import { CommandPalette } from '../CommandPalette'
import { Button } from '@/components/ui/button'

export default function CommandPaletteExample() {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  )
}