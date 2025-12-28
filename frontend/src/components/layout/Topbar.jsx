import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Menu, Settings, LogOut, User, HardDrive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/services/authservices";

function Topbar({ onMenuClick, title = "Dashboard" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Mock data - in real app this would come from props or context
  const storageUsed = 2.3;
  const storageLimit = 10;
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-border/20 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="fade-in-up">
            <h2 className="text-lg font-semibold text-primary-foreground">{title}</h2>
          </div>
        </div>

        {/* Right section - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Storage indicator */}
          <div className="hidden md:flex items-center gap-3 bg-primary-foreground/10 px-3 py-2 rounded-lg border border-primary-foreground/20">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                {storageUsed} GB / {storageLimit} GB
              </span>
            </div>
            <div className="w-16">
              <Progress
                value={storagePercentage}
                className="h-2"
                style={{
                  backgroundColor: 'hsl(var(--muted))'
                }}
              />
            </div>
          </div>


          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                aria-label="User menu"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src="" alt="User avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    UN
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-semibold leading-none">User Name</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${storagePercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {storagePercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="hover:bg-accent/50 transition-colors"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-3 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent/50 transition-colors"
                onClick={() => navigate('/preferences')}
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent/50 transition-colors"
                onClick={() => navigate('/storage')}
              >
                <HardDrive className="mr-3 h-4 w-4" />
                <span>Storage Management</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive hover:bg-destructive/10 transition-colors"
                onClick={logout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
