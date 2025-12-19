// src/components/layout/AppSidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  CheckSquare,
  Users,
  DollarSign,
  Target,
  Bot,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoSvg from "@/assets/Logo-Light.svg";
import sidebarToggleIcon from "@/assets/sidebar-toggle.svg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";

const menuGroups = [
  {
    title: "Captação Inteligente",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Leads", icon: Target, path: "/leads" },
      { label: "Agendamentos", icon: Calendar, path: "/agendamentos" },
      { label: "Agentes", icon: Bot, path: "/dashboard/agentes" },
    ],
  },
  {
    title: "Operação Clínica",
    items: [
      { label: "Consultas", icon: ClipboardList, path: "/consultas" },
      { label: "Pacientes", icon: Users, path: "/pacientes" },
      { label: "Tarefas", icon: CheckSquare, path: "/tarefas" },
    ],
  },
  {
    title: "Gestão Financeira",
    items: [{ label: "Financeiro", icon: DollarSign, path: "/financeiro" }],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  open?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({
  collapsed,
  onToggle,
  isMobile = false,
  open = true,
  onNavigate,
}: AppSidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    menuGroups.map((group) => group.title)
  );

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  return (
    <>
      {/* Backdrop no mobile */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-primary border-r border-border flex flex-col z-50",
          "transition-all duration-300 ease-in-out transform",
          collapsed ? "w-[72px]" : "w-[272px]",
          isMobile && !open && "-translate-x-full pointer-events-none",
          isMobile && open && "pointer-events-auto shadow-lg",
          !isMobile && "translate-x-0" // desktop sempre visÃ­vel
        )}
        aria-hidden={isMobile && !open}
      >
        {/* Logo + Toggle */}
        <div
          className={cn(
            "border-b border-muted flex bg-primary",
            collapsed
              ? "flex-col items-center py-4 px-2 gap-4"
              : "flex-row items-center justify-between h-[119px] px-6"
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-end items-end gap-0 px-2" : "gap-3"
            )}
          >
            <img
              src={logoSvg}
              alt="Logo Dotô IA"
              className="w-[40px] h-[40px]"
            />
            {!collapsed && (
              <div>
                <p className="font-bold text-lg text-accent-foreground">
                  Dotô IA
                </p>
              </div>
            )}
          </div>

          {/* Botão toggle / fechar */}
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center hover:opacity-80",
              collapsed && "w-full"
            )}
            aria-label={
              isMobile
                ? "Fechar menu"
                : collapsed
                ? "Expandir sidebar"
                : "Recolher sidebar"
            }
          >
            {isMobile ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <img
                src={sidebarToggleIcon}
                alt="Toggle sidebar"
                className={cn("w-7 h-7", collapsed && "rotate-180")}
              />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto sidebar-scroll">
          <TooltipProvider delayDuration={0}>
            <Accordion
              type="multiple"
              value={openGroups}
              onValueChange={setOpenGroups}
              className="space-y-2"
            >
              {menuGroups.map((group) => (
                <AccordionItem
                  key={group.title}
                  value={group.title}
                  className="border-none"
                >
                  {!collapsed && (
                    <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide hover:no-underline">
                      {group.title}
                    </AccordionTrigger>
                  )}

                  <AccordionContent className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;

                      const linkContent = (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "group flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#dbeafe] text-[#0b68f7]"
                              : "text-slate-50 hover:bg-[#dbeafe] hover:text-[#0b68f7]",
                            collapsed && "justify-center px-2"
                          )}
                          onClick={handleNavClick}
                        >
                          <item.icon
                            className={cn(
                              "w-5 h-5 transition-colors",
                              isActive && "text-[#0b68f7]",
                              !isActive && "group-hover:text-[#0b68f7]"
                            )}
                          />
                          {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                      );

                      if (collapsed) {
                        return (
                          <Tooltip key={item.path}>
                            <TooltipTrigger asChild>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return linkContent;
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TooltipProvider>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <TooltipProvider delayDuration={0}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-text-accent-foreground/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent-foreground font-semibold text-sm">
                        DR
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p className="font-medium">Dotô IA</p>
                  <p className="text-xs text-muted-foreground">
                    email@medms.com
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-foreground font-semibold text-sm">
                    DR
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-accent-foreground truncate">
                    Dotô IA
                  </p>
                  <p className="text-xs text-white truncate">email@doto.com</p>
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="w-6 h-6  hover:opacity-50" />
                </Button>
              </div>
            )}
          </TooltipProvider>
        </div>
      </aside>
    </>
  );
}
