import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const bookNames: { [key: string]: string } = {
  "rajdhani-day": "RAJDHANI DAY",
  "supreme-day": "SUPREME DAY",
  "kalyan": "KALYAN",
  "madhur-night": "MADHUR NIGHT",
  "sridevi": "SRIDEVI",
  "time-bazaar": "TIME BAZAAR",
  "mh-morning": "MH MORNING",
  "milan-morning": "MILAN MORNING"
};

const SingleDigitGame = () => {
  const { bookId } = useParams();
  const { toast } = useToast();
  const bookName = bookNames[bookId || ""] || "Unknown Book";
  
  const [bets, setBets] = useState<{ [key: number]: number }>({});
  const [totalBet, setTotalBet] = useState(0);

  const updateBet = (digit: number, amount: number) => {
    const newBets = { ...bets };
    const currentAmount = newBets[digit] || 0;
    const newAmount = Math.max(0, currentAmount + amount);
    
    if (newAmount === 0) {
      delete newBets[digit];
    } else {
      newBets[digit] = newAmount;
    }
    
    setBets(newBets);
    
    // Calculate total bet
    const total = Object.values(newBets).reduce((sum, amt) => sum + amt, 0);
    setTotalBet(total);
  };

  const setBetAmount = (digit: number, amount: string) => {
    const newBets = { ...bets };
    const numAmount = parseInt(amount) || 0;
    
    if (numAmount === 0) {
      delete newBets[digit];
    } else {
      newBets[digit] = numAmount;
    }
    
    setBets(newBets);
    
    // Calculate total bet
    const total = Object.values(newBets).reduce((sum, amt) => sum + amt, 0);
    setTotalBet(total);
  };

  const placeBets = () => {
    if (totalBet === 0) {
      toast({
        title: "No bets placed",
        description: "Please place at least one bet before proceeding.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bets placed successfully!",
      description: `Total bet amount: ₹${totalBet}. Good luck!`,
    });

    // Clear bets after placing
    setBets({});
    setTotalBet(0);
  };

  const addAllBets = () => {
    const newBets: { [key: number]: number } = {};
    digits.forEach(digit => {
      newBets[digit] = 10; // Default amount
    });
    setBets(newBets);
    setTotalBet(100); // 10 * 10 digits
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-matka-orange-light to-white">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/book/${bookId}/games`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-lg font-bold">{bookName} - Single Digit</h1>
            </div>
            <Badge variant="secondary" className="bg-white text-primary">
              ₹ 0.00
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Game Info */}
        <Card className="mb-6 border-l-4 border-l-matka-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-matka-purple rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              Single Digit Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Payout Rate:</span> 1:9.5
              </div>
              <div>
                <span className="font-medium">Min Bet:</span> ₹10
              </div>
              <div>
                <span className="font-medium">Max Bet:</span> ₹10,000
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Betting Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {digits.map((digit) => (
            <Card key={digit} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {digit}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Current Bet</div>
                    <div className="font-bold text-primary">₹{bets[digit] || 0}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Amount Input */}
                  <div>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={bets[digit] || ""}
                      onChange={(e) => setBetAmount(digit, e.target.value)}
                      className="text-center"
                      min="0"
                      max="10000"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => updateBet(digit, -10)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => updateBet(digit, 10)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Quick Set Buttons */}
                  <div className="grid grid-cols-3 gap-1">
                    {[50, 100, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(digit, amount.toString())}
                        className="text-xs px-2 py-1"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total and Actions */}
        <div className="space-y-4">
          {/* Total Bet Display */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Bet Amount:</span>
                </div>
                <div className="text-2xl font-bold text-primary">₹{totalBet}</div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={addAllBets}
              className="h-12 text-lg border-primary text-primary hover:bg-primary hover:text-white"
            >
              Add All (₹10 each)
            </Button>
            
            <Button
              onClick={placeBets}
              disabled={totalBet === 0}
              className="h-12 text-lg bg-primary hover:bg-primary/90"
            >
              Place Bets (₹{totalBet})
            </Button>
          </div>
        </div>

        {/* Rules */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-yellow-800 mb-3">Game Rules:</h3>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Choose any digit from 0-9</li>
              <li>• If your chosen digit appears in the result, you win</li>
              <li>• Winning amount = Bet amount × 9.5</li>
              <li>• Results are declared at market closing time</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SingleDigitGame;