import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Wallet, Download, Trophy, History, Tag, MessageSquare, HelpCircle, Users, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const MenuLink = ({ to, icon: Icon, label, onClick }: { to?: string; icon: any; label: string; onClick?: () => void }) => {
  const content = (
    <div className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted/60">
      <Icon className="w-5 h-5 text-[hsl(var(--matka-orange))]" />
      <span className="text-sm">{label}</span>
    </div>
  );
  if (to) {
    return (
      <NavLink to={to} className="block">
        {content}
      </NavLink>
    );
  }
  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
};

const iconClasses = "w-6 h-6";

function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5M5.25 9V21h13.5V9"
      />
    </svg>
  );
}

function TicketIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.5a2.5 2.5 0 0 0 0 5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5.5a2.5 2.5 0 0 0 0-5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"
      />
      <path d="M12 6v12" />
    </svg>
  );
}

function WalletIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a3 3 0 0 1 3-3h9a2 2 0 0 1 0 4H6a3 3 0 0 1-3-1zM3 7v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3a2 2 0 0 0-2-2h-3a2 2 0 1 1 0-4H8"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={iconClasses}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12c0 4.418-4.03 8-9 8-1.015 0-1.99-.147-2.9-.42L3 21l1.46-3.65C3.55 16.25 3 14.7 3 13c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

const BurgerMenu = () => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "User", phone: "" });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("auth_user_id", user.id)
          .single();
        if (data) setProfile({ name: (data as any).name, phone: (data as any).phone });
      } catch {}
    })();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/", { replace: true });
  };

  const initials = (profile.name || "User").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <SheetHeader className="p-6 bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-white text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <SheetTitle className="text-lg font-semibold leading-tight">{profile.name || "Player"}</SheetTitle>
              <p className="text-sm opacity-90">{profile.phone || "—"}</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="py-3">
          <MenuLink to="/profile" icon={Home} label="User Profile" />
          <MenuLink to="/profile?tab=wallet" icon={Wallet} label="Wallet" />
          <MenuLink to="/profile?tab=withdraw" icon={Download} label="Withdraw" />
          <MenuLink to="/profile?tab=win-history" icon={Trophy} label="Win History" />
          <MenuLink to="/profile?tab=bid-history" icon={History} label="Bid History" />
          <MenuLink to="/home?tab=game-rates" icon={Tag} label="Game Rates" />
          <MenuLink to="/home?tab=offers" icon={Tag} label="Offers" />
          <MenuLink to="/profile?tab=messages" icon={MessageSquare} label="Messages" />
          <MenuLink to="/profile?tab=support" icon={HelpCircle} label="Support" />
          <MenuLink to="/profile?tab=invite" icon={Users} label="Invite Friends" />
          <MenuLink to="/profile?tab=settings" icon={Settings} label="Settings" />
          <Separator className="my-2" />
          <MenuLink icon={LogOut} label="Sign Out" onClick={onLogout} />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

const BottomNav = () => {
  // Prevent touch events from interfering with scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default on the actual links/buttons
    if ((e.target as HTMLElement).tagName === 'A' || 
        (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    // Prevent default for other touch events to avoid scroll jank
    e.preventDefault();
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[hsl(var(--border))] safe-bottom shadow-[var(--shadow-card)]"
      style={{
        // Use transform for better performance
        transform: 'translateZ(0)',
        // Ensure it's above other content
        willChange: 'transform',
        // Prevent iOS rubber banding
        overscrollBehavior: 'none'
      }}
      onTouchStart={handleTouchStart}
    >
      <ul className="grid grid-cols-4 gap-1 px-2 py-1">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "text-[hsl(var(--matka-orange))]"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HomeIcon active={isActive} />
                <span className="mt-1">Home</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile?tab=bids"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "text-[hsl(var(--matka-orange))]"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <TicketIcon active={isActive} />
                <span className="mt-1">My Bids</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile?tab=wallet"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "text-[hsl(var(--matka-orange))]"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <WalletIcon active={isActive} />
                <span className="mt-1">Add Fund</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <a
            href="https://wa.me/917426874591"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChatIcon />
            <span className="mt-1">Live Chat</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
