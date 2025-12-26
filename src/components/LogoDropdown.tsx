// simple logo dropdown component that can be used to go to the landing page or sign out for the user

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Home, LogOut, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { DataBackupDialog } from "@/components/DataBackupDialog";

export function LogoDropdown() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [showBackup, setShowBackup] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <img
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleGoHome} className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            Landing Page
          </DropdownMenuItem>
          
          {isAuthenticated && (
            <>
              <DropdownMenuItem 
                onClick={() => setShowBackup(true)} 
                className="cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Backup Data
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DataBackupDialog open={showBackup} onOpenChange={setShowBackup} />
    </>
  );
}