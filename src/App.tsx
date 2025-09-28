import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import BurgerMenu from "@/components/BurgerMenu";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import BookGames from "./pages/BookGames";
import BookResults from "./pages/BookResults";
import SingleDigitGame from "./pages/SingleDigitGame";
import JodiDigitGame from "./pages/JodiDigitGame";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Layout component for authenticated routes
const AuthenticatedLayout = () => {
  // Add a class to body when component mounts to ensure proper scrolling
  useEffect(() => {
    document.body.classList.add('has-fixed-header');
    return () => {
      document.body.classList.remove('has-fixed-header');
    };
  }, []);

  return (
    <ProtectedRoute>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground shadow-md z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BurgerMenu />
            <h1 className="text-xl font-bold">MATKA GAME</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">₹ 0.00</div>
          </div>
        </div>
      </header>
      
      <div className="pt-16 pb-20">
        <Outlet />
      </div>
    </ProtectedRoute>
  );
};

// Layout for admin routes
const AdminLayout = () => (
  <ProtectedRoute requireAdmin>
    <Outlet />
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/" element={<Landing />} />
          
          {/* Authenticated routes */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/home" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/book/:bookId/games" element={<BookGames />} />
            <Route path="/book/:bookId/results" element={<BookResults />} />
            <Route path="/book/:bookId/game/single-digit" element={<SingleDigitGame />} />
            <Route path="/book/:bookId/game/jodi-digit" element={<JodiDigitGame />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
