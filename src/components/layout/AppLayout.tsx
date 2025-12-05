import { ReactNode, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // < lg
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);     // mobile começa fechada
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);      // desktop sempre aberta
        setSidebarCollapsed(false); // ou true, se quiser mini por padrão
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(prev => !prev);        // abre/fecha drawer
    } else {
      setSidebarCollapsed(prev => !prev);   // colapsa/expande desktop
    }
  };

  const handleNavigate = () => {
    if (isMobile) {
      setSidebarOpen(false);                // fecha ao clicar em link
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        isMobile={isMobile}
        open={sidebarOpen}
        onNavigate={handleNavigate}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-[padding-left] duration-300",
          !isMobile && (sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[272px]")
        )}
      >
        <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/60 backdrop-blur">
          <button
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-border bg-background"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex items-center justify-center lg:justify-start">
            <h1 className="font-semibold pr-8 text-sm sm:text-base md:text-lg text-primary">
              Dôtor
            </h1> 
          </div>    

          <div className="hidden sm:flex items-center gap-3">
          </div>
        </header>

        <main className="flex-1 w-full px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
