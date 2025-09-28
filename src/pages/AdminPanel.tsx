import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { LayoutDashboard, Users, Clock, BarChart3, Menu, X, LogOut, CreditCard, CheckCircle2, Image as ImageIcon, Trophy, FilterX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function AdminPanelContent() {
  const { books, users, transactions, results, declareResult, addTransaction } = useAdmin();
  const [selectedBook, setSelectedBook] = useState(books[0]?.slug || "kalyan");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [utrs, setUtrs] = useState<Array<{id: string; user_id: string; amount: number; utr_no: string; status: string; created_at: string; approved_at: string | null;}>>([]);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [resultData, setResultData] = useState({
    openDigit: "",
    closeDigit: "",
    jodi: "",
    openPanna: "",
    closePanna: ""
  });
  // Played Bets state
  const [gameTypes, setGameTypes] = useState<Array<{id?: string; slug: string; name: string}>>([]);
  const [activeGameSlug, setActiveGameSlug] = useState<string>("all");
  const [bets, setBets] = useState<Array<{id:string; user_id:string; amount:number; details:string; status:string|null; created_at:string; book_id:string; game_type_id:string}>>([]);
  const [betFilterBook, setBetFilterBook] = useState<string>("all");
  const [betFilterValue, setBetFilterValue] = useState<string>("");
  const [betSelection, setBetSelection] = useState<Record<string, boolean>>({});
  const [customMultiplier, setCustomMultiplier] = useState<string>("");
  const booksById = useMemo(() => Object.fromEntries(books.map(b => [b.id, b])), [books]);
  const booksBySlug = useMemo(() => Object.fromEntries(books.map(b => [b.slug, b])), [books]);

  // Derived: filtered bets list
  const filteredBets = useMemo(() => {
    let rows = bets;
    // Filter by book slug if chosen
    if (betFilterBook && betFilterBook !== 'all') {
      rows = rows.filter(b => {
        const book = booksById[b.book_id];
        return book?.slug === betFilterBook;
      });
    }
    // Filter by value if provided
    if (betFilterValue) {
      const v = betFilterValue.trim();
      rows = rows.filter(b => String(b.details).trim() === v);
    }
    // Show pending first
    rows = [...rows].sort((a, b) => ((a.status ? 1 : 0) - (b.status ? 1 : 0)) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    return rows;
  }, [bets, betFilterBook, betFilterValue, booksById]);

  // Latest results map keyed by book slug
  const latestResultByBook = useMemo(() => {
    const map: Record<string, typeof resultData> = {};
    for (const r of results) {
      const key = r.book;
      // results are loaded ordered by created_at desc in context, so first seen is latest
      if (!map[key]) {
        map[key] = {
          openDigit: r.openDigit || "",
          closeDigit: r.closeDigit || "",
          jodi: r.jodi || "",
          openPanna: r.openPanna || "",
          closePanna: r.closePanna || "",
        };
      }
    }
    return map;
  }, [results]);

  // Row component for managing a single book's editable result
  function BookResultRow({
    bookSlug,
    bookLabel,
  }: { bookSlug: string; bookLabel: string }) {
    const [rowState, setRowState] = useState({
      openDigit: latestResultByBook[bookSlug]?.openDigit || "",
      closeDigit: latestResultByBook[bookSlug]?.closeDigit || "",
      jodi: latestResultByBook[bookSlug]?.jodi || "",
      openPanna: latestResultByBook[bookSlug]?.openPanna || "",
      closePanna: latestResultByBook[bookSlug]?.closePanna || "",
      time: new Date().toLocaleTimeString(),
    });

    const onSave = async () => {
      try {
        await declareResult(bookSlug, {
          date: new Date().toISOString().split('T')[0],
          time: rowState.time,
          openDigit: rowState.openDigit,
          closeDigit: rowState.closeDigit,
          jodi: rowState.jodi,
          openPanna: rowState.openPanna,
          closePanna: rowState.closePanna,
        });
        toast({ title: 'Saved', description: `Result saved for ${bookLabel}` });
      } catch (e: any) {
        toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
      }
    };

    return (
      <TableRow key={bookSlug}>
        <TableCell className="font-medium">{bookLabel}</TableCell>
        <TableCell>
          <Input value={rowState.openDigit} maxLength={1} placeholder="0-9" onChange={(e) => setRowState({ ...rowState, openDigit: e.target.value })} />
        </TableCell>
        <TableCell>
          <Input value={rowState.closeDigit} maxLength={1} placeholder="0-9" onChange={(e) => setRowState({ ...rowState, closeDigit: e.target.value })} />
        </TableCell>
        <TableCell>
          <Input value={rowState.jodi} maxLength={2} placeholder="00-99" onChange={(e) => setRowState({ ...rowState, jodi: e.target.value })} />
        </TableCell>
        <TableCell>
          <Input value={rowState.openPanna} maxLength={3} placeholder="000-999" onChange={(e) => setRowState({ ...rowState, openPanna: e.target.value })} />
        </TableCell>
        <TableCell>
          <Input value={rowState.closePanna} maxLength={3} placeholder="000-999" onChange={(e) => setRowState({ ...rowState, closePanna: e.target.value })} />
        </TableCell>
        <TableCell>
          <Input value={rowState.time} onChange={(e) => setRowState({ ...rowState, time: e.target.value })} />
        </TableCell>
        <TableCell>
          <Button size="sm" onClick={onSave}>Save</Button>
        </TableCell>
      </TableRow>
    );
  }

  const handleDeclareResult = () => {
    if (!resultData.openDigit || !resultData.closeDigit || !resultData.jodi) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    declareResult(selectedBook, {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      openDigit: resultData.openDigit,
      closeDigit: resultData.closeDigit,
      jodi: resultData.jodi,
      openPanna: resultData.openPanna || "",
      closePanna: resultData.closePanna || ""
    });

    // Reset form
    setResultData({
      openDigit: "",
      closeDigit: "",
      jodi: "",
      openPanna: "",
      closePanna: "",
    });

    toast({
      title: "Success",
      description: `Result declared for ${books.find(b => b.slug === selectedBook)?.label || selectedBook}`,
    });
  };

  const totalUsers = users.length;
  const totalWalletBalance = users.reduce((sum, user) => sum + user.walletBalance, 0);
  const totalTransactions = transactions.length;

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "declare-result", label: "Declare Result", icon: BarChart3 },
    { id: "manage-results", label: "Manage Results", icon: BarChart3 },
    { id: "played-bets", label: "Played Bets", icon: Trophy },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "users", label: "Users", icon: Users },
    { id: "transactions", label: "Transactions", icon: Clock },
    { id: "results", label: "Results History", icon: BarChart3 },
  ];

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();
  
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({
      title: "Successfully logged out",
      description: "You have been signed out of the admin panel"
    });
  }, [navigate]);

  // Helper: get latest QR public URL by listing objects
  const fetchLatestQrUrl = useCallback(async () => {
    try {
      const candidates: { path: string; updatedAt?: string }[] = [];
      const root = await supabase.storage.from('payment-qr').list('', { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } as any });
      if (!root.error && root.data) {
        candidates.push(...root.data
          .filter((o: any) => /\.(png|jpg|jpeg|webp|gif)$/i.test(o.name))
          .map((o: any) => ({ path: o.name, updatedAt: o.updated_at }))
        );
      }
      const sub = await supabase.storage.from('payment-qr').list('qr', { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } as any });
      if (!sub.error && sub.data) {
        candidates.push(...sub.data
          .filter((o: any) => /\.(png|jpg|jpeg|webp|gif)$/i.test(o.name))
          .map((o: any) => ({ path: `qr/${o.name}`, updatedAt: o.updated_at }))
        );
      }
      if (candidates.length > 0) {
        // Prefer ones with 'qr' in name, then newest
        candidates.sort((a, b) => (/(^|\/)qr/i.test(b.path) ? 1 : 0) - (/(^|\/)qr/i.test(a.path) ? 1 : 0));
        const latest = candidates[0];
        const { data: pub } = supabase.storage.from('payment-qr').getPublicUrl(latest.path);
        if (pub?.publicUrl) setQrUrl(pub.publicUrl + `?t=${Date.now()}`);
      }
    } catch (_) { /* ignore */ }
  }, []);

  // Load QR public URL and UTR list
  const loadPaymentsData = useCallback(async () => {
    await fetchLatestQrUrl();
    const { data: utrRows, error } = await (supabase.from as any)('utr')
      .select('id, user_id, amount, utr_no, status, created_at, approved_at')
      .order('created_at', { ascending: false });
    if (!error) setUtrs((utrRows as any[]) || []);
  }, [fetchLatestQrUrl]);

  // Load on section switch to payments or on mount
  useEffect(() => {
    if (activeSection === 'payments') {
      loadPaymentsData();
    }
    if (activeSection === 'played-bets') {
      (async () => {
        // Load game types once
        if (gameTypes.length === 0) {
          try {
            const resp = await (supabase.from as any)('game_types').select('id, slug, name');
            const gts = (resp.data as any[]) || [];
            if (gts.length > 0) {
              setGameTypes(gts.map(g => ({ id: g.id, slug: g.slug, name: g.name })));
            } else {
              setGameTypes([]);
            }
          } catch (_) {
            // Fallback: leave empty and rely on 'All Games'
            setGameTypes([]);
          }
        }
        // Load bets for active game type
        let query = (supabase.from as any)('bets')
          .select('id, user_id, amount, details, status, created_at, book_id, game_type_id')
          .order('created_at', { ascending: false })
          .limit(1000);
        const gtList = gameTypes.length ? gameTypes : [];
        if (activeGameSlug !== 'all') {
          const activeGT = gtList.find((x:any)=>x.slug===activeGameSlug);
          if (activeGT?.id) {
            query = query.eq('game_type_id', activeGT.id);
          }
        }
        const { data: betRows, error: betErr } = await query;
        if (!betErr) {
          setBets(betRows as any[]);
          setBetSelection({});
        }
      })();
    }
  }, [activeSection, loadPaymentsData]);

  // Reload bets when game tab filter changes
  useEffect(() => {
    if (activeSection !== 'played-bets' || !activeGameSlug) return;
    (async () => {
      let query = (supabase.from as any)('bets')
        .select('id, user_id, amount, details, status, created_at, book_id, game_type_id')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (activeGameSlug !== 'all') {
        // Try to find id locally; if missing, skip filter
        const activeGT = gameTypes.find(g => g.slug === activeGameSlug);
        if (activeGT?.id) query = query.eq('game_type_id', activeGT.id);
      }
      const { data: betRows, error: betErr } = await query;
      if (!betErr) {
        setBets(betRows as any[]);
        setBetSelection({});
      }
    })();
  }, [activeGameSlug, activeSection]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          <button 
            onClick={toggleSidebar} 
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isSidebarOpen && <div className="md:h-0 h-8"></div>} {/* Spacer for mobile */}
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {navItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-muted-foreground">
                {activeSection === 'dashboard' && 'Overview of your application'}
                {activeSection === 'declare-result' && 'Declare new results for games'}
                {activeSection === 'manage-results' && 'Edit and save results for all books'}
                {activeSection === 'users' && 'Manage user accounts and permissions'}
                {activeSection === 'transactions' && 'View and manage transactions'}
                {activeSection === 'results' && 'View historical results'}
              </p>
            </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{totalWalletBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{books.length}</div>
            </CardContent>
          </Card>
        </div>


          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹{totalWalletBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12.3% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">+8.5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{books.length}</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Played Bets Section */}
          {activeSection === 'played-bets' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Played Bets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Game sub-tabs */}
                <div className="flex flex-wrap gap-2">
                  <Button variant={activeGameSlug==='all'? 'default':'outline'} size="sm" onClick={()=>setActiveGameSlug('all')}>
                    All Games
                  </Button>
                  {gameTypes.map(gt => (
                    <Button key={gt.slug} variant={activeGameSlug===gt.slug? 'default':'outline'} size="sm" onClick={()=>setActiveGameSlug(gt.slug)}>
                      {gt.name}
                    </Button>
                  ))}
                </div>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Book</Label>
                    <Select value={betFilterBook} onValueChange={setBetFilterBook}>
                      <SelectTrigger><SelectValue placeholder="All books" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All books</SelectItem>
                        {books.map(b => (
                          <SelectItem key={b.slug} value={b.slug}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Winning Value</Label>
                    <Input value={betFilterValue} onChange={(e)=>setBetFilterValue(e.target.value)} placeholder="e.g., 5 or 57 or 123" />
                  </div>
                  <div>
                    <Label>Custom Multiplier (optional)</Label>
                    <Input type="number" step="0.01" value={customMultiplier} onChange={(e)=>setCustomMultiplier(e.target.value)} placeholder="defaults to book multiplier" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="mt-6" onClick={()=>{ setBetFilterBook("all"); setBetFilterValue(""); }}>Clear <FilterX className="h-4 w-4 ml-1"/></Button>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!activeGameSlug || !betFilterValue || !betFilterBook}
                    onClick={async ()=>{
                      try {
                        const m = customMultiplier ? Number(customMultiplier) : null;
                        const { error } = await (supabase.rpc as any)('settle_bets', {
                          p_book_slug: betFilterBook,
                          p_game_type_slug: activeGameSlug,
                          p_winning_value: betFilterValue,
                          p_multiplier: m,
                          p_mark_lose: true,
                        });
                        if (error) throw error;
                        toast({ title: 'Settled', description: 'Winners credited, others marked lose.' });
                        // reload
                        setCustomMultiplier("");
                        setBetSelection({});
                        const { data: allGT } = await (supabase.from as any)('game_types').select('id, slug');
                        const gt = (allGT as any[]) || [];
                        const activeGT = gt.find((x:any)=>x.slug===activeGameSlug);
                        if (activeGT) {
                          const { data: betRows } = await (supabase.from as any)('bets')
                            .select('id, user_id, amount, details, status, created_at, book_id, game_type_id')
                            .eq('game_type_id', activeGT.id)
                            .order('created_at', { ascending: false })
                            .limit(1000);
                          setBets((betRows as any[])||[]);
                        }
                      } catch (err:any) {
                        toast({ title: 'Settle failed', description: err.message, variant: 'destructive' });
                      }
                    }}
                  >Settle Winners (apply filter)</Button>
                  <Button
                    variant="outline"
                    disabled={Object.keys(betSelection).length===0}
                    onClick={async ()=>{
                      try {
                        const selectedIds = Object.keys(betSelection).filter(k=>betSelection[k]);
                        if (selectedIds.length===0) return;
                        const { error } = await (supabase.from as any)('bets').update({ status: 'lose' }).in('id', selectedIds);
                        if (error) throw error;
                        toast({ title: 'Updated', description: 'Selected bets marked as lose.' });
                        setBetSelection({});
                        // soft reload
                        setBets(prev => prev.map(b => selectedIds.includes(b.id) ? { ...b, status: 'lose' } : b));
                      } catch (err:any) {
                        toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
                      }
                    }}
                  >Mark Selected Lose</Button>
                </div>

                {/* Bets Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><input type="checkbox" onChange={(e)=>{
                        const checked = e.currentTarget.checked;
                        const next: Record<string,boolean> = {};
                        filteredBets.forEach(b => { next[b.id] = checked; });
                        setBetSelection(next);
                      }} /></TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBets.map(b => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <input type="checkbox" checked={!!betSelection[b.id]} onChange={(e)=>setBetSelection(prev=>({ ...prev, [b.id]: e.currentTarget.checked }))} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{b.user_id}</TableCell>
                        <TableCell>{booksById[b.book_id]?.label || b.book_id}</TableCell>
                        <TableCell>₹{Number(b.amount).toFixed(2)}</TableCell>
                        <TableCell className="font-mono">{b.details}</TableCell>
                        <TableCell>
                          <Badge variant={!b.status ? 'outline' : b.status==='win' ? 'default' : 'secondary'}>
                            {b.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(b.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {filteredBets.length===0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">No bets match the filters.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Payment QR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Payment QR" className="w-80 h-80 md:w-96 md:h-96 object-contain border rounded-md bg-white" />
                  ) : (
                    <div className="w-80 h-80 md:w-96 md:h-96 border rounded-md flex items-center justify-center text-gray-400 bg-white">No QR uploaded</div>
                  )}
                  <div>
                    <Label htmlFor="qrUpload">Upload/Replace QR (PNG/JPG)</Label>
                    <input
                      id="qrUpload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={async (e) => {
                        const inputEl = e.currentTarget as HTMLInputElement | null;
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Optionally reset immediately so selecting same file again re-triggers change
                        if (inputEl) inputEl.value = '';
                        if (file.size > 5 * 1024 * 1024) {
                          toast({ title: 'File too large', description: 'Please upload under 5MB', variant: 'destructive' });
                          return;
                        }
                        const contentType = file.type || 'image/png';
                        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
                        const ts = Date.now();
                        let objectPath = `qr-${ts}.${ext}`;
                        setUploading(true);
                        try {
                          // Wrap to ensure consistent metadata in some browsers
                          const wrapped = new File([file], `qr-${ts}.${ext}`, { type: contentType, lastModified: Date.now() });
                          let up = await supabase.storage
                            .from('payment-qr')
                            .upload(objectPath, wrapped, { cacheControl: '3600', contentType });
                          if (up.error) {
                            // Fallback: try update when upload fails
                            const upd = await supabase.storage
                              .from('payment-qr')
                              .update(objectPath, wrapped, { cacheControl: '3600', contentType });
                            if (upd.error) {
                              // Try alternate path inside a folder in case root path is blocked by policy
                              objectPath = `qr/qr-${ts}.${ext}`;
                              up = await supabase.storage
                                .from('payment-qr')
                                .upload(objectPath, wrapped, { cacheControl: '3600', contentType });
                              if (up.error) {
                                console.error('QR upload alt path error:', up.error);
                                throw up.error;
                              }
                            }
                          }
                          await fetchLatestQrUrl();
                          toast({ title: 'QR updated successfully' });
                        } catch (err: any) {
                          console.error('QR upload failed:', err);
                          toast({ title: 'Upload failed', description: (err?.error?.message || err?.message || String(err)), variant: 'destructive' });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="block mt-2"
                      disabled={uploading}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* UTR List and Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> UTR Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>UTR</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {utrs.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs">{u.user_id}</TableCell>
                          <TableCell>₹{Number(u.amount).toFixed(2)}</TableCell>
                          <TableCell className="font-mono">{u.utr_no}</TableCell>
                          <TableCell>
                            <Badge variant={u.status === 'approved' ? 'default' : u.status === 'rejected' ? 'secondary' : 'outline'}>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(u.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            {u.status === 'pending' ? (
                              <Button size="sm" onClick={async () => {
                                try {
                                  const { error } = await (supabase.rpc as any)('approve_utr', { p_utr_id: u.id });
                                  if (error) throw error;
                                  toast({ title: 'Approved', description: 'Wallet credited and transaction recorded' });
                                  loadPaymentsData();
                                } catch (rpcErr: any) {
                                  // Fallback: perform approval client-side (admin-only actions)
                                  console.error('approve_utr RPC failed, falling back to client-side flow:', rpcErr);
                                  try {
                                    // 1) Load UTR row
                                    const { data: utrRow, error: selErr } = await (supabase.from as any)('utr')
                                      .select('id, user_id, amount, utr_no, status')
                                      .eq('id', u.id)
                                      .single();
                                    if (selErr || !utrRow) throw selErr || new Error('UTR not found');
                                    // 2) Mark approved if pending
                                    if (!utrRow.status || utrRow.status === 'pending') {
                                      const { error: updErr } = await (supabase.from as any)('utr')
                                        .update({ status: 'approved', approved_at: new Date().toISOString() })
                                        .eq('id', utrRow.id);
                                      if (updErr) throw updErr;
                                    }
                                    // 3) Insert transaction (let DB-side logic handle wallet credit)
                                    const { error: txErr } = await (supabase.from as any)('transactions').insert({
                                      user_id: utrRow.user_id,
                                      type: 'deposit',
                                      amount: Number(utrRow.amount || 0),
                                      game: 'Wallet Recharge',
                                      status: 'completed',
                                      details: `Approved via UTR ${utrRow.utr_no}`,
                                    });
                                    if (txErr) throw txErr;
                                    toast({ title: 'Approved (fallback)', description: 'Wallet credited and transaction recorded' });
                                    loadPaymentsData();
                                  } catch (fbErr: any) {
                                    console.error('Client-side approval failed:', fbErr);
                                    toast({ title: 'Approval failed', description: (fbErr?.message || 'Unknown error'), variant: 'destructive' });
                                  }
                                }
                              }} className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Approve
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {utrs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">No UTR submissions yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Declare Result Section */}
          {activeSection === 'declare-result' && (
            <Card>
              <CardHeader>
                <CardTitle>Declare Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="book">Select Book</Label>
                    <Select value={selectedBook} onValueChange={setSelectedBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((book) => (
                          <SelectItem key={book.slug} value={book.slug}>
                            {book.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openDigit">Open Digit *</Label>
                    <Input
                      id="openDigit"
                      value={resultData.openDigit}
                      onChange={(e) => setResultData({...resultData, openDigit: e.target.value})}
                      placeholder="0-9"
                      maxLength={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeDigit">Close Digit *</Label>
                    <Input
                      id="closeDigit"
                      value={resultData.closeDigit}
                      onChange={(e) => setResultData({...resultData, closeDigit: e.target.value})}
                      placeholder="0-9"
                      maxLength={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jodi">Jodi *</Label>
                    <Input
                      id="jodi"
                      value={resultData.jodi}
                      onChange={(e) => setResultData({...resultData, jodi: e.target.value})}
                      placeholder="00-99"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openPanna">Open Panna</Label>
                    <Input
                      id="openPanna"
                      value={resultData.openPanna}
                      onChange={(e) => setResultData({...resultData, openPanna: e.target.value})}
                      placeholder="000-999"
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closePanna">Close Panna</Label>
                    <Input
                      id="closePanna"
                      value={resultData.closePanna}
                      onChange={(e) => setResultData({...resultData, closePanna: e.target.value})}
                      placeholder="000-999"
                      maxLength={3}
                    />
                  </div>
                </div>

                <Button onClick={handleDeclareResult} className="w-full">
                  Declare Result
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Manage Results Section */}
          {activeSection === 'manage-results' && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Open</TableHead>
                      <TableHead>Close</TableHead>
                      <TableHead>Jodi</TableHead>
                      <TableHead>Open Panna</TableHead>
                      <TableHead>Close Panna</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((b) => (
                      <BookResultRow key={b.id} bookSlug={b.slug} bookLabel={b.label} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono">{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <span className={user.walletBalance > 0 ? "text-green-600" : "text-red-600"}>
                            ₹{user.walletBalance.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Transactions Section */}
          {activeSection === 'transactions' && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono">{transaction.id}</TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "win" ? "default" : transaction.type === "bet" ? "secondary" : "outline"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={transaction.type === "win" ? "text-green-600" : transaction.type === "bet" ? "text-red-600" : "text-blue-600"}>
                            {transaction.type === "bet" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.game}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Results History Section */}
          {activeSection === 'results' && (
            <Card>
              <CardHeader>
                <CardTitle>Results History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Open</TableHead>
                      <TableHead>Close</TableHead>
                      <TableHead>Jodi</TableHead>
                      <TableHead>Open Panna</TableHead>
                      <TableHead>Close Panna</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium capitalize">{result.book.replace('-', ' ')}</TableCell>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>{result.time}</TableCell>
                        <TableCell className="font-bold text-primary">{result.openDigit}</TableCell>
                        <TableCell className="font-bold text-primary">{result.closeDigit}</TableCell>
                        <TableCell className="font-bold text-amber-600">{result.jodi}</TableCell>
                        <TableCell>{result.openPanna || "-"}</TableCell>
                        <TableCell>{result.closePanna || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AdminProvider>
      <AdminPanelContent />
    </AdminProvider>
  );
}