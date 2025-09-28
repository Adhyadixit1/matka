import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  User,
  Wallet,
  Download,
  Trophy,
  History,
  Tag,
  MessageSquare,
  HelpCircle,
  Users,
  Settings,
  LogOut
} from "lucide-react";

interface ProfileInfo {
  name?: string | null;
  phone?: string | null;
}

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

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<ProfileInfo>({});
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
        if (data) setP({ name: (data as any).name, phone: (data as any).phone });
      } catch {}
    })();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/", { replace: true });
  };

  const initials = (p.name || "User").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
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
              <SheetTitle className="text-lg font-semibold leading-tight">{p.name || "Player"}</SheetTitle>
              <p className="text-sm opacity-90">{p.phone || "—"}</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="py-3">
          <MenuLink to="/profile" icon={User} label="User Profile" />
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
}
