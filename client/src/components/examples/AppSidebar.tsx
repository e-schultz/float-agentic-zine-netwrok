import { AppSidebar } from '../AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-[600px] w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          <h2 className="font-mono text-lg">Main Content Area</h2>
          <p className="text-muted-foreground">The sidebar is displayed on the left.</p>
        </div>
      </div>
    </SidebarProvider>
  )
}