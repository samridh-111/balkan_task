import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Upload,
  Settings,
  User,
  Menu,
  X,
  BarChart3,
  Shield
} from "lucide-react";

function Sidebar({ isOpen, onToggle, className = "" }) {
  const navigate = useNavigate();

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Files", href: "/files", icon: FileText },
    { name: "Upload", href: "/files/upload", icon: Upload },
    { name: "Admin", href: "/admin", icon: Shield, adminOnly: true },
  ];

  return (
    <aside className={`sidebar-container transition-all duration-300 ease-in-out ${className}`}>
      {/* Mobile sidebar header */}
      <header className="flex items-center justify-between p-6 lg:hidden border-b border-border">
        <h2 className="text-xl font-bold tracking-tight">Navigation</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="lg:hidden hover:bg-accent/10 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Main navigation */}
      <nav className="flex flex-col gap-1 p-4" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group relative w-full rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-black/5'
                    : 'hover:bg-black/5'
                }`
              }
              onClick={() => {
                if (window.innerWidth < 1024) onToggle();
              }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 px-4 font-medium"
              >
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                <span className="truncate">{item.name}</span>
              </Button>
            </NavLink>
          );
        })}
      </nav>

      <Separator className="my-2" />

      {/* Profile section - Bottom aligned */}
      <section className="p-4 mt-auto">
        <div
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Profile</p>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
