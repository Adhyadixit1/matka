import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gamepad2 } from "lucide-react";

const gameTypes = [
  {
    id: "single-digit",
    name: "Single Digit",
    description: "Pick any single digit from 0-9",
    icon: "1",
    color: "purple",
    payout: "1:9.5"
  },
  {
    id: "jodi-digit", 
    name: "Jodi Digit",
    description: "Pick any two digit combination",
    icon: "2",
    color: "green",
    payout: "1:95"
  },
  {
    id: "single-panna",
    name: "Single Panna",
    description: "Pick any three digit combination", 
    icon: "3",
    color: "blue",
    payout: "1:142"
  },
  {
    id: "double-panna",
    name: "Double Panna", 
    description: "Pick double digit panna",
    icon: "22",
    color: "teal",
    payout: "1:285"
  },
  {
    id: "triple-panna",
    name: "Triple Panna",
    description: "Pick triple digit panna",
    icon: "333", 
    color: "orange",
    payout: "1:570"
  },
  {
    id: "half-sangam",
    name: "Half Sangam",
    description: "Half sangam combination",
    icon: "HS",
    color: "red",
    payout: "1:1425"
  }
];

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

const getColorClasses = (color: string) => {
  switch (color) {
    case "purple":
      return "bg-matka-purple hover:bg-matka-purple/90 text-white";
    case "green": 
      return "bg-matka-green hover:bg-matka-green/90 text-white";
    case "blue":
      return "bg-matka-blue hover:bg-matka-blue/90 text-white";
    case "teal":
      return "bg-matka-teal hover:bg-matka-teal/90 text-white";
    case "orange":
      return "bg-matka-orange hover:bg-matka-orange/90 text-white";
    case "red":
      return "bg-red-500 hover:bg-red-500/90 text-white";
    default:
      return "bg-primary hover:bg-primary/90 text-white";
  }
};

const BookGames = () => {
  const { bookId } = useParams();
  const bookName = bookNames[bookId || ""] || "Unknown Book";

  return (
    <div className="min-h-screen bg-gradient-to-br from-matka-orange-light to-white">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/home">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{bookName}</h1>
            </div>
            <Badge variant="secondary" className="bg-white text-primary">
              Open: 8:20 PM | Close: 10:20 PM
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Game Type</h2>
          <p className="text-gray-600">Choose your preferred game type to start playing</p>
        </div>

        {/* Game Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {gameTypes.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Game Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold ${getColorClasses(game.color)}`}>
                    {game.icon}
                  </div>

                  {/* Game Info */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                  
                  {/* Payout Info */}
                  <div className="mb-6">
                    <Badge variant="outline" className="border-primary text-primary">
                      Payout: {game.payout}
                    </Badge>
                  </div>

                  {/* Play Button */}
                  <Link to={`/book/${bookId}/game/${game.id}`} className="block">
                    <Button 
                      className={`w-full ${getColorClasses(game.color)} group-hover:scale-105 transition-transform`}
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Play {game.name}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">Game Rules & Information</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Minimum bet amount: ₹10</li>
                <li>• Maximum bet amount: ₹10,000</li>
                <li>• Results are declared at specified closing times</li>
                <li>• All bets must be placed before market closing time</li>
                <li>• Winnings are automatically credited to your account</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookGames;