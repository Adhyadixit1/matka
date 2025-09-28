import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        if (isMounted) setLoading(true);
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If no session, redirect to login (admin routes use dedicated admin auth page)
        if (error || !session) {
          console.log('No active session, redirecting to login');
          const redirectTo = encodeURIComponent(location.pathname + location.search);
          const loginPath = requireAdmin ? '/admin/auth' : '/auth';
          if (isMounted) navigate(`${loginPath}?redirectTo=${redirectTo}`, { replace: true });
          return false;
        }

        // If admin check is not required, allow access
        if (!requireAdmin) {
          console.log('Admin check not required, allowing access');
          return true;
        }

        // Admin check - get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, auth_user_id")
          .eq("auth_user_id", session.user.id)
          .single();

        // If admin check fails, redirect to home
        if (profileError || !profile || profile.role !== "admin") {
          console.log('Admin check failed, redirecting to home');
          if (isMounted) navigate("/home", { replace: true });
          return false;
        }

        console.log('Admin access granted');
        return true;
      } catch (error) {
        console.error("Auth error:", error);
        if (isMounted) navigate("/home", { replace: true });
        return false;
      }
    };

    // Initial auth check
    const initAuth = async () => {
      const isAuthorized = await checkAuth();
      if (isMounted) {
        setAllowed(isAuthorized);
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;
      
      // If auth state changes, re-run the auth check
      if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
        console.log(`Auth state changed: ${event}, re-checking auth...`);
        checkAuth().then(isAuthorized => {
          if (isMounted) {
            setAllowed(isAuthorized);
            setLoading(false);
          }
        });
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate, requireAdmin, location]);

  // Show loading state
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b132b] to-[#1e1b4b]">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
          <p className="text-gray-300">Securing your session...</p>
        </div>
      </div>
    );
  }

  // Only render children if allowed
  return allowed ? <>{children}</> : null;
}
