import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BurgerMenu from "@/components/BurgerMenu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Popularity = "very-high" | "high" | "medium" | "low";

interface UiBook {
  id: string; // slug
  name: string; // label upper
  result: string; // formatted from latest results
  openTime: string; // HH:mm in IST
  closeTime: string; // HH:mm in IST
  status: "open" | "closed" | "upcoming"; // derived from IST time vs windows
  popularity: Popularity; // placeholder logic
}

function formatResult(r?: { open_digit?: string | null; close_digit?: string | null; jodi?: string | null; open_panna?: string | null; close_panna?: string | null; }) {
  if (!r) return "***-**-***";
  const open = r.open_panna ?? r.open_digit ?? "**";
  const mid = r.jodi ?? "**";
  const close = r.close_panna ?? r.close_digit ?? "**";
  return `${open}-${mid}-${close}`;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge variant="default" className="bg-matka-green text-white">Betting Open</Badge>;
    case "closed":
      return <Badge variant="secondary" className="bg-red-500 text-white">Betting Closed</Badge>;
    case "upcoming":
      return <Badge variant="outline" className="border-matka-orange text-matka-orange">Upcoming</Badge>;
    default:
      return null;
  }
};

const getPropularityIcon = (popularity: string) => {
  switch (popularity) {
    case "very-high":
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case "high":
      return <BarChart3 className="h-4 w-4 text-matka-orange" />;
    case "medium":
      return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    default:
      return <BarChart3 className="h-4 w-4 text-gray-400" />;
  }
};

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [books, setBooks] = useState<UiBook[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, wallet_balance')
          .eq('auth_user_id', session.user.id)
          .single();
          
        if (!error) {
          setWalletBalance(Number((profile as any)?.wallet_balance ?? 0));
        }

        if (!error && profile?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const loadBooksAndResults = async () => {
      try {
        // Load books
        const { data: bookRows, error: bookErr } = await supabase
          .from('books')
          .select('id, slug, label, is_active, open_time, close_time')
          .order('label');
        if (bookErr) throw bookErr;

        // Load recent results (we'll take the first seen per book as latest)
        const { data: resultRows, error: resErr } = await supabase
          .from('results')
          .select('book_id, open_digit, close_digit, jodi, open_panna, close_panna, created_at')
          .order('created_at', { ascending: false })
          .limit(500);
        if (resErr) throw resErr;

        const latestByBook: Record<string, any> = {};
        (resultRows || []).forEach((r) => {
          if (!latestByBook[r.book_id]) latestByBook[r.book_id] = r;
        });

        // Get current IST time for status calculation
        const nowIst = new Date(
          new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            .format(new Date())
            .replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:00Z')
        );

        const booksArr = (bookRows as any[]) || [];
        const ui: UiBook[] = booksArr.map((b) => {
          const ot = (b.open_time as string | null) || '10:00:00';
          const ct = (b.close_time as string | null) || '20:00:00';
          const openStr = ot.slice(0,5);
          const closeStr = ct.slice(0,5);

          // Build comparable times in IST for today
          const [oh, om] = openStr.split(':').map(Number);
          const [ch, cm] = closeStr.split(':').map(Number);
          const todayIst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
          const openIst = new Date(todayIst);
          openIst.setHours(oh, om, 0, 0);
          const closeIst = new Date(todayIst);
          closeIst.setHours(ch, cm, 0, 0);

          let status: UiBook['status'] = 'closed';
          if (b.is_active) {
            status = nowIst >= openIst && nowIst <= closeIst ? 'open' : 'closed';
          } else {
            status = 'closed';
          }

          return {
            id: b.slug,
            name: b.label?.toUpperCase?.() || b.slug,
            result: formatResult(latestByBook[b.id]),
            openTime: openStr,
            closeTime: closeStr,
            status,
            popularity: 'high',
          };
        });

        setBooks(ui);
      } catch (e) {
        console.error('Failed to load books/results', e);
      }
    };

    loadBooksAndResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-matka-orange-light to-white flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">MG</span>
              </div>
              <h1 className="text-2xl font-bold">MATKA GAME</h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white text-primary">
                ₹ {walletBalance.toFixed(2)}
              </Badge>
              <BurgerMenu />
              {isAdmin && (
                <Link to="/admin" className="text-sm text-primary-foreground/80 hover:text-primary-foreground underline">
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content with padding to account for fixed header and bottom nav */}
      <main className="flex-1 pt-24 pb-24 overflow-y-auto">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Famous Matka Books</h2>
            <p className="text-gray-600">Select your favorite matka book to view results and start playing</p>
          </div>

        {/* Matka Books Grid */}
        <div className="grid gap-4 md:gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Book Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{book.name}</h3>
                      {getPropularityIcon(book.popularity)}
                      {getStatusBadge(book.status)}
                    </div>
                    
                    {/* Result */}
                    <div className="mb-3">
                      <span className="text-sm text-gray-600 mr-2">Latest Result:</span>
                      <span className="text-xl font-mono font-bold text-matka-green">
                        {book.result}
                      </span>
                    </div>

                    {/* Timing */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Open: {book.openTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Close: {book.closeTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                    <Link to={`/book/${book.id}/results`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Results
                      </Button>
                    </Link>
                    {book.status === "closed" ? (
                      <Button 
                        size="sm" 
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        disabled
                        aria-disabled
                      >
                        Play Now
                      </Button>
                    ) : (
                      <Link to={`/book/${book.id}/games`}>
                        <Button 
                          size="sm" 
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        >
                          Play Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

          {/* Footer Info */}
          <div className="mt-12 text-center text-sm text-gray-600">
            <p className="mb-2">⚠️ Play responsibly. This is a demo application for educational purposes only.</p>
            <p>Market timings are indicative and may vary. Please check official sources for accurate information.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;