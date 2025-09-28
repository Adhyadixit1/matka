import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BurgerMenu from "@/components/BurgerMenu";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, Download, Upload, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OverviewRow {
  deposited_amount: number | null;
  winnings_amount: number | null;
  tx_id: string | null;
  tx_type: "deposit" | "withdraw" | "win" | "bet" | "adjustment" | null;
  tx_amount: number | null;
  tx_status: "pending" | "success" | "failed" | null;
  tx_created_at: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewRow[]>([]);
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [utrNo, setUtrNo] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [profileId, setProfileId] = useState<string>("");
  const [walletsDeposited, setWalletsDeposited] = useState<number>(0);
  const [walletsWinnings, setWalletsWinnings] = useState<number>(0);
  const [txs, setTxs] = useState<Array<{id:string; type:string; amount:number; status:string; created_at:string; details:string|null}>>([]);

  const balances = useMemo(() => {
    const first = overview[0];
    return {
      deposited: Number(first?.deposited_amount ?? 0),
      winnings: Number(first?.winnings_amount ?? 0),
    };
  }, [overview]);

  const fetchOverview = async () => {
    setLoading(true);
    const { data, error } = await (supabase.rpc as any)("wallet_overview", { p_limit: 50 });
    if (error) {
      console.error("wallet_overview error", error);
    } else {
      setOverview((data as unknown) as OverviewRow[]);
    }
    setLoading(false);
  };

  const fetchWalletBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('id, wallet_balance')
        .eq('auth_user_id', user.id)
        .single();
      if (!error && prof) {
        setWalletBalance(Number(prof.wallet_balance || 0));
        setProfileId(prof.id as string);
      }
    } catch (e) {
      console.error('fetchWalletBalance error', e);
    }
  };

  const fetchWalletsBreakdown = async (uid?: string) => {
    try {
      const userId = uid || profileId;
      if (!userId) return;
      const { data, error } = await (supabase.from as any)
        ('wallets')
        .select('deposited_amount, winnings_amount')
        .eq('user_id', userId)
        .single();
      if (!error && data) {
        setWalletsDeposited(Number(data.deposited_amount || 0));
        setWalletsWinnings(Number(data.winnings_amount || 0));
      } else {
        setWalletsDeposited(0);
        setWalletsWinnings(0);
      }
    } catch (e) {
      console.error('fetchWalletsBreakdown error', e);
    }
  };

  const fetchRecentTransactions = async (uid?: string) => {
    try {
      const userId = uid || profileId;
      if (!userId) return;
      const { data, error } = await (supabase.from as any)
        ('transactions')
        .select('id, type, amount, status, created_at, details')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        setTxs(data as any);
      } else {
        setTxs([]);
      }
    } catch (e) {
      console.error('fetchRecentTransactions error', e);
    }
  };

  const onDeposit = async () => {
    // Deprecated direct deposit RPC in favor of UTR-based flow
    toast({ title: "Use UTR Deposit", description: "Please scan the QR and submit your UTR below." });
  };

  const onWithdraw = async () => {
    if (!amount || amount <= 0) return;
    setBusy(true);
    const { error } = await (supabase.rpc as any)("withdraw", { p_amount: amount });
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setAmount(0);
    fetchOverview();
  };

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    fetchOverview();
    fetchWalletBalance();
    // After wallet balance fetch resolves, also load wallets breakdown and transactions
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        const uid = (prof as any)?.id as string | undefined;
        if (uid) {
          setProfileId(uid);
          await fetchWalletsBreakdown(uid);
          await fetchRecentTransactions(uid);
        }
      } catch {}
    })();
    // Load latest QR by listing bucket (root and 'qr/' subfolder)
    (async () => {
      try {
        const candidates: { path: string; updatedAt?: string }[] = [];
        const root = await supabase.storage.from('payment-qr').list('', { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } as any });
        if (!root.error && root.data) {
          candidates.push(...root.data.map((o: any) => ({ path: o.name, updatedAt: (o as any).updated_at })));
        }
        const sub = await supabase.storage.from('payment-qr').list('qr', { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } as any });
        if (!sub.error && sub.data) {
          candidates.push(...sub.data.map((o: any) => ({ path: `qr/${o.name}`, updatedAt: (o as any).updated_at })));
        }
        if (candidates.length > 0) {
          candidates.sort((a, b) => (/(^|\/)qr/i.test(b.path) ? 1 : 0) - (/(^|\/)qr/i.test(a.path) ? 1 : 0));
          const latest = candidates[0];
          const { data: pub } = supabase.storage.from('payment-qr').getPublicUrl(latest.path);
          if (pub?.publicUrl) setQrUrl(pub.publicUrl + `?t=${Date.now()}`);
        }
      } catch (_) { /* ignore */ }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-matka-orange-light to-white">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl">MG</span>
            </div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="text-primary" onClick={() => navigate('/home')}>Home</Button>
            <BurgerMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Wallet</h2>
                </div>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg border bg-white">
                  <div className="text-sm text-gray-500">Total Wallet Balance</div>
                  <div className="text-2xl font-bold">₹ {Number(walletBalance).toFixed(2)}</div>
                  <Badge variant="default" className="mt-2">Live</Badge>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <div className="text-sm text-gray-500">Deposited Balance</div>
                  <div className="text-2xl font-bold">₹ {Number(walletsDeposited).toFixed(2)}</div>
                  <Badge variant="secondary" className="mt-2">Tracked from deposits</Badge>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <div className="text-sm text-gray-500">Winnings Balance</div>
                  <div className="text-2xl font-bold">₹ {Number(walletsWinnings).toFixed(2)}</div>
                  <Badge variant="default" className="mt-2">Tracked from wins</Badge>
                </div>
              </div>

              {/* QR-based Deposit via UTR */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <div className="text-sm font-medium mb-2">Scan and Pay (UPI QR)</div>
                  {qrUrl ? (
                    <img src={qrUrl} alt="Payment QR" className="w-80 h-80 md:w-[28rem] md:h-[28rem] object-contain border rounded-md bg-white" />
                  ) : (
                    <div className="w-80 h-80 md:w-[28rem] md:h-[28rem] border rounded-md flex items-center justify-center text-gray-400 bg-white">QR not available</div>
                  )}
                </div>
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Enter amount" />
                  </div>
                  <div>
                    <Label htmlFor="utr">UTR Number</Label>
                    <Input id="utr" value={utrNo} onChange={(e) => setUtrNo(e.target.value)} placeholder="Enter your bank UTR" />
                  </div>
                  <div className="sm:col-span-2 flex gap-2 items-end">
                    <Button onClick={async () => {
                      if (!amount || amount <= 0 || !utrNo) {
                        toast({ title: 'Missing details', description: 'Enter amount and UTR', variant: 'destructive' });
                        return;
                      }
                      setBusy(true);
                      try {
                        // Insert UTR row for current user
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) throw new Error('Not authenticated');
                        // Get profile id for current auth uid
                        const { data: prof, error: perr } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
                        if (perr || !prof) throw perr || new Error('Profile not found');
                        const { error } = await (supabase.from as any)('utr').insert({
                          user_id: prof.id,
                          amount,
                          utr_no: utrNo,
                        });
                        if (error) throw error;
                        toast({ title: 'UTR submitted', description: 'We will verify and credit shortly.' });
                        setAmount(0); setUtrNo("");
                      } catch (err: any) {
                        toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
                      } finally {
                        setBusy(false);
                      }
                    }} disabled={busy} className="w-full sm:w-auto">
                      <Upload className="h-4 w-4 mr-2" /> Submit UTR
                    </Button>
                    <Button onClick={onWithdraw} disabled={busy || !amount || amount <= 0} variant="secondary" className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" /> Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Type</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Details</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((tx) => (
                      <tr key={tx.id} className="border-t">
                        <td className="py-2 capitalize">{tx.type}</td>
                        <td className="py-2">₹ {Number(tx.amount).toFixed(2)}</td>
                        <td className="py-2">{tx.status}</td>
                        <td className="py-2 text-gray-600">{tx.details || '-'}</td>
                        <td className="py-2">{new Date(tx.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {txs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No recent transactions.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
