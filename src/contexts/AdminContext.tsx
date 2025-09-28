import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  // Using DB UUID for id to keep relations consistent
  id: string;
  name: string;
  phone: string;
  walletBalance: number;
  status: "active" | "inactive";
  lastActive: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "bet" | "win" | "deposit" | "withdrawal";
  amount: number;
  game: string;
  status: "completed" | "pending" | "failed";
  date: string;
  details?: string;
}

export interface GameResult {
  book: string;
  date: string;
  time: string;
  openDigit: string;
  closeDigit: string;
  jodi: string;
  openPanna: string;
  closePanna: string;
}

export interface Book {
  id: string;
  slug: string;
  label: string;
  is_active: boolean;
  open_time?: string | null;
  close_time?: string | null;
}

interface AdminContextType {
  books: Book[];
  users: User[];
  transactions: Transaction[];
  results: GameResult[];
  declareResult: (book: string, result: Omit<GameResult, 'book'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateUserWallet: (userId: string, amount: number, type: 'add' | 'subtract') => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);

  // Local caches for mapping
  const [profilesMap, setProfilesMap] = useState<Record<string, { name: string }>>({});
  const [booksMap, setBooksMap] = useState<Record<string, { slug: string }>>({});

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, phone, wallet_balance, status, last_active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const mapped: User[] = (data || []).map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone || '',
      walletBalance: Number(u.wallet_balance || 0),
      status: (u.status as 'active' | 'inactive') || 'active',
      lastActive: u.last_active ? new Date(u.last_active).toLocaleString() : ''
    }));
    setUsers(mapped);
    const pmap: Record<string, { name: string }> = {};
    mapped.forEach((u) => { pmap[u.id] = { name: u.name }; });
    setProfilesMap(pmap);
  };

  const loadBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('id, slug, label, is_active, open_time, close_time')
      .order('label');
    if (error) throw error;
    const bmap: Record<string, { slug: string }> = {};
    const rows = (data as any[]) || [];
    const blist: Book[] = rows.map((b) => {
      bmap[b.id] = { slug: b.slug };
      return { id: b.id, slug: b.slug, label: b.label, is_active: !!b.is_active, open_time: b.open_time, close_time: b.close_time };
    });
    setBooksMap(bmap);
    setBooks(blist);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, type, amount, game, status, details, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const mapped: Transaction[] = (data || []).map((t) => ({
      id: t.id,
      userId: t.user_id,
      userName: profilesMap[t.user_id]?.name || '',
      type: t.type as Transaction['type'],
      amount: Number(t.amount || 0),
      game: t.game || '',
      status: t.status as Transaction['status'],
      date: t.created_at ? new Date(t.created_at).toLocaleString() : '',
      details: t.details || undefined,
    }));
    setTransactions(mapped);
  };

  const loadResults = async () => {
    const { data, error } = await supabase
      .from('results')
      .select('book_id, date, time, open_digit, close_digit, jodi, open_panna, close_panna')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const mapped: GameResult[] = (data || []).map((r) => ({
      book: booksMap[r.book_id]?.slug || '',
      date: r.date,
      time: r.time,
      openDigit: r.open_digit || '',
      closeDigit: r.close_digit || '',
      jodi: r.jodi || '',
      openPanna: r.open_panna || '',
      closePanna: r.close_panna || '',
    }));
    setResults(mapped);
  };

  const refreshAll = async () => {
    await loadBooks();
    await loadUsers();
    await loadTransactions();
    await loadResults();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const declareResult = async (book: string, result: Omit<GameResult, 'book'>) => {
    const { error } = await supabase.rpc('declare_result_and_compute_winners', {
      p_book_slug: book,
      p_date: result.date,
      p_time: result.time,
      p_open_digit: result.openDigit || null,
      p_close_digit: result.closeDigit || null,
      p_jodi: result.jodi || null,
      p_open_panna: result.openPanna || null,
      p_close_panna: result.closePanna || null,
    });
    if (error) throw error;
    await loadResults();
    await loadTransactions();
    await loadUsers(); // wallet balances updated by trigger
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const { error } = await supabase.from('transactions').insert({
      user_id: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      game: transaction.game,
      status: transaction.status,
      details: transaction.details || null,
    });
    if (error) throw error;
    await loadTransactions();
    await loadUsers();
  };

  const updateUserWallet = async (userId: string, amount: number, type: 'add' | 'subtract') => {
    const txType = type === 'add' ? 'deposit' : 'withdrawal';
    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type: txType,
      amount,
      game: txType === 'deposit' ? 'Wallet Recharge' : 'Wallet Withdrawal',
      status: 'completed',
      details: null,
    });
    if (error) throw error;
    await loadTransactions();
    await loadUsers();
  };

  const value: AdminContextType = {
    books,
    users,
    transactions,
    results,
    declareResult,
    addTransaction,
    updateUserWallet
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}