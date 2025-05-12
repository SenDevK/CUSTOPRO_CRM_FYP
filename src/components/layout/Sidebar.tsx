
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Upload,
  MessagesSquare,
  Settings,
  LogOut,
  Mail,
  PanelTop
} from "lucide-react";
import { useTranslation } from "react-i18next";
import CustoProLogo from "@/components/CustoProLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
}

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    // In a real app, you would clear authentication state here
    navigate('/login');
  };

  const menuItems: SidebarItem[] = [
    {
      title: t('common.dashboard'),
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard"
    },
    {
      title: t('common.customers'),
      icon: <Users size={20} />,
      href: "/customers"
    },
    {
      title: t('common.analytics'),
      icon: <BarChart3 size={20} />,
      href: "/analytics"
    },
    {
      title: t('common.dataImport'),
      icon: <Upload size={20} />,
      href: "/import"
    },
    {
      title: t('common.marketing'),
      icon: <Mail size={20} />,
      href: "/marketing"
    },
    {
      title: t('common.settings'),
      icon: <Settings size={20} />,
      href: "/settings"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-4 flex items-center justify-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <CustoProLogo size="md" showText={!collapsed} />
        </Link>
      </div>

      <div className="flex-1 py-8">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          {!collapsed && <span>{t('common.logout')}</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
