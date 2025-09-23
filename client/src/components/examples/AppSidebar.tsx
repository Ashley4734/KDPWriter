import { AppSidebar } from '../app-sidebar'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full border rounded-md">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center p-2 border-b">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4">
            <p className="text-muted-foreground">Main content area</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}