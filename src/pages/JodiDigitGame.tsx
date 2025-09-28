import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const JodiDigitGame = () => {
  const { bookId } = useParams();
  const { toast } = useToast();
  const bookName = bookNames[bookId || ""] || "Unknown Book";
  
  const [selectedJodi, setSelectedJodi] = useState("");
  const [betAmount, setBetAmount] = useState(10);

  const generateJodiNumbers = () => {
    const jodis = [];
    for (let i = 0; i <= 99; i++) {
      jodis.push(i.toString().padStart(2, '0'));
    }
    return jodis;
  };

  const jodiNumbers = generateJodiNumbers();
  const popularJodis = ["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"];

  const placeBet = () => {
    if (!selectedJodi) {
      toast({
        title: "No jodi selected",
        description: "Please select a jodi number before placing bet.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bet placed successfully!",
      description: `Jodi: ${selectedJodi}, Amount: ₹${betAmount}. Good luck!`,
    });

    setSelectedJodi("");
    setBetAmount(10);
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
              <h1 className="text-lg font-bold">{bookName} - Jodi Digit</h1>
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
        <Card className="mb-6 border-l-4 border-l-matka-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-matka-green rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              Jodi Digit Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Payout Rate:</span> 1:95
              </div>
              <div>
                <span className="font-medium">Range:</span> 00-99
              </div>
              <div>
                <span className="font-medium">Min Bet:</span> ₹10
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Betting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jodi Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Jodi Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Popular Jodis */}
                <div>
                  <h4 className="font-medium mb-2">Popular Jodis</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {popularJodis.map((jodi) => (
                      <Button
                        key={jodi}
                        variant={selectedJodi === jodi ? "default" : "outline"}
                        onClick={() => setSelectedJodi(jodi)}
                        className="h-12 text-lg"
                      >
                        {jodi}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Manual Input */}
                <div>
                  <h4 className="font-medium mb-2">Or Enter Manually</h4>
                  <Input
                    type="text"
                    placeholder="Enter jodi (00-99)"
                    value={selectedJodi}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
                        setSelectedJodi(value.padStart(2, '0'));
                      }
                    }}
                    className="text-center text-2xl font-mono"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bet Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Bet Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
                    className="text-center text-2xl font-bold"
                    min="10"
                    max="10000"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setBetAmount(amount)}
                      className="text-sm"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>

                {/* Potential Winning */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 mb-1">Potential Winning</div>
                  <div className="text-2xl font-bold text-green-700">
                    ₹{(betAmount * 95).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Selection */}
        {selectedJodi && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600">Selected Jodi</div>
                  <div className="text-3xl font-mono font-bold text-blue-800">{selectedJodi}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">Bet Amount</div>
                  <div className="text-3xl font-bold text-blue-800">₹{betAmount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Button
          onClick={placeBet}
          disabled={!selectedJodi}
          className="w-full h-12 text-lg bg-matka-green hover:bg-matka-green/90"
        >
          <Wallet className="h-5 w-5 mr-2" />
          Place Bet - ₹{betAmount}
        </Button>

        {/* Rules */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-yellow-800 mb-3">Jodi Game Rules:</h3>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Choose any two-digit number from 00 to 99</li>
              <li>• If your jodi appears in the result, you win</li>
              <li>• Winning amount = Bet amount × 95</li>
              <li>• Results are declared at market closing time</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JodiDigitGame;