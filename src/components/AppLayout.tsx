import { useState } from "react";
import { Search, Settings, ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  activeTab: "search" | "admin";
  onTabChange: (tab: "search" | "admin") => void;
}

export function AppLayout({ children, sidebar, activeTab, onTabChange }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar transition-all duration-300 relative",
          sidebarOpen ? "w-[380px]" : "w-0"
        )}
      >
        {sidebarOpen && (
          <>
            {/* Tab switcher */}
            <div className="flex gap-2 p-4">
              <Button
                variant={activeTab === "search" ? "coral" : "surface"}
                className="flex-1 gap-1.5 text-xs"
                onClick={() => onTabChange("search")}
              >
                <Search className="h-3.5 w-3.5" />
                Поиск
              </Button>
              <Button
                variant={activeTab === "project" ? "coral" : "surface"}
                className="flex-1 gap-1.5 text-xs"
                onClick={() => onTabChange("project")}
              >
                <FolderKanban className="h-3.5 w-3.5" />
                Проект
              </Button>
              <Button
                variant={activeTab === "admin" ? "coral" : "surface"}
                className="flex-1 gap-1.5 text-xs"
                onClick={() => onTabChange("admin")}
              >
                <Settings className="h-3.5 w-3.5" />
                Админ
              </Button>
            </div>

            <div className="border-b border-border" />

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {sidebar}
            </div>
          </>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
