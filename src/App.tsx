import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
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
const AuthenticatedLayout = () => (
  <ProtectedRoute>
    <div className="with-bottom-nav">
      <Outlet />
    </div>
    {/* Mobile bottom navigation */}
    <BottomNav />
  </ProtectedRoute>
);

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
