import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Function to check if a user is an admin
async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', userId)  // Changed from 'id' to 'auth_user_id'
    .single();

  if (error || !data) {
    console.error('Error checking admin status:', error);
    return false;
  }

  console.log('User role:', data.role); // Debug log
  return data.role === 'admin';
}


export default function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  // Check for existing session and role on mount
  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }
      
      console.log('Session:', session);
      
      if (session) {
        console.log('User ID:', session.user.id);
        const isAdmin = await isUserAdmin(session.user.id);
        console.log('Is admin:', isAdmin);
        
        if (isAdmin) {
          console.log('User is admin, redirecting to:', redirectTo);
          navigate(redirectTo, { replace: true });
        } else {
          console.log('User is not an admin, signing out...');
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Your account does not have admin privileges.",
            variant: "destructive",
          });
          navigate("/home", { replace: true });
        }
      } else {
        console.log('No active session');
      }
    };

    checkSession().catch(console.error);
  }, [navigate, redirectTo]);

  const triggerConfetti = () => {
    const confetti = document.createElement("div");
    confetti.innerHTML = "🎉";
    confetti.style.position = "fixed";
    confetti.style.fontSize = "24px";
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "1000";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-50px";
    confetti.style.animation = "fall linear forwards";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Attempting to sign in with:', email);
    
    try {
      // Sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      if (!data.session) {
        console.error('No session after sign in');
        throw new Error("No session after sign in");
      }

      console.log('Sign in successful, checking admin status for user:', data.user.id);
      
      // Check if user is an admin
      const isAdmin = await isUserAdmin(data.user.id);
      console.log('Is admin after sign in:', isAdmin);
      
      if (!isAdmin) {
        console.log('User is not an admin, signing out...');
        await supabase.auth.signOut();
        throw new Error("This account does not have admin privileges.");
      }

      // Show success message
      console.log('Admin login successful, redirecting to:', redirectTo);
      toast({
        title: "Welcome Admin! 🎉",
        description: "You have successfully signed in to the admin panel.",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
      });

      // Redirect to admin dashboard
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create Admin UI has been removed for security. Only sign-in is available.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#0f2040] to-[#0b132b] p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-400 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            {["🔒", "🔑", "👑", "⚙️", "🛡️", "🔐"][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-md border-0 bg-white/5 backdrop-blur-sm relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/20 rounded-full filter blur-3xl"></div>

        <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-4 py-1.5 rounded-full text-xs transform rotate-12 shadow-lg">
          ADMIN ACCESS
        </div>

        <div className="relative z-10">
          <CardHeader className="pb-2">
            <div className="text-center mb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Admin Sign In
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Restricted area. Authorized admins only.</p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <>
                <form className="space-y-5" onSubmit={handleAdminSignIn}>
                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-white/5 border-gray-600/50 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter admin email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-white/5 border-gray-600/50 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold text-base rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        Sign In
                      </span>
                    )}
                  </Button>
                </form>
            </>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
