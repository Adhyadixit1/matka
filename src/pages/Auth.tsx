import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/home';
  
  const isSignIn = mode === "signin";
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(redirectTo, { replace: true });
      }
    };
    
    checkSession();
  }, [navigate, redirectTo]);
  
  // Winning confetti effect on successful auth
  const triggerConfetti = () => {
    const confetti = document.createElement('div');
    confetti.innerHTML = '🎉';
    confetti.style.position = 'fixed';
    confetti.style.fontSize = '24px';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '1000';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-50px';
    confetti.style.animation = 'fall linear forwards';
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Trigger confetti on successful login
        for (let i = 0; i < 20; i++) {
          setTimeout(triggerConfetti, i * 300);
        }
        
        toast({ 
          title: "Welcome back! 🎉",
          description: "You've successfully signed in.",
          className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
        });
        
        // Navigate to the intended page or home after a short delay to show the toast
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1500);
        
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + '/home'
          },
        });
        
        if (error) throw error;
        
        // Trigger confetti for signup too
        for (let i = 0; i < 20; i++) {
          setTimeout(triggerConfetti, i * 300);
        }
        
        toast({ 
          title: "Account created! 🎉", 
          description: "Check your email to confirm your account.",
          className: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        });
        
        // Reset form after successful signup
        setEmail('');
        setPassword('');
        setFullName('');
        setMode('signin');
      }
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#0f2040] to-[#0b132b] p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        
        {/* Floating coins */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-yellow-400 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            {['₹', '💵', '💰', '💸', '💲', '🪙'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>
      
      {/* Main card */}
      <Card className="w-full max-w-md border-0 bg-white/5 backdrop-blur-sm relative overflow-hidden border border-white/10 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/20 rounded-full filter blur-3xl"></div>
        
        {/* Winning badge */}
        <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-4 py-1.5 rounded-full text-xs transform rotate-12 shadow-lg">
          WINNERS PLAY HERE!
        </div>
        
        <div className="relative z-10">
          <CardHeader className="pb-2">
            <div className="text-center mb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                {isSignIn ? "Welcome Back!" : "Join the Winners"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isSignIn ? "Sign in to continue your winning journey" : "Create your account to get started"}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form className="space-y-5" onSubmit={onSubmit}>
            {mode === "signup" && (
              <div className="space-y-2 group">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full name</Label>
                <div className="relative">
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    className="h-12 bg-white/5 border-gray-600/50 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 text-white placeholder-gray-400 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-12 bg-white/5 border-gray-600/50 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30 text-white placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                {isSignIn && (
                  <a href="#" className="text-xs text-yellow-400 hover:underline">Forgot password?</a>
                )}
              </div>
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold text-base rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-0.5" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : isSignIn ? (
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Sign In
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Create Account
                </span>
              )}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0b132b] text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 bg-white/5 border-gray-600 hover:bg-white/10 text-gray-300">
                <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                  <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd"/>
                </svg>
                Facebook
              </Button>
              <Button variant="outline" className="h-11 bg-white/5 border-gray-600 hover:bg-white/10 text-gray-300">
                <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                  <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
                </svg>
                Google
              </Button>
            </div>
            
            <div className="text-sm text-center mt-6 text-gray-400">
              {isSignIn ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setMode("signup")} 
                    className="text-yellow-400 hover:text-yellow-300 font-medium hover:underline focus:outline-none"
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    onClick={() => setMode("signin")} 
                    className="text-yellow-400 hover:text-yellow-300 font-medium hover:underline focus:outline-none"
                  >
                    Sign in
                  </button>
                </p>
              )}
              
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">Start winning today</h3>
                  <div className="mt-1 text-xs text-yellow-100/80">
                    <p>Join thousands of players and experience the thrill of Matka!</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
