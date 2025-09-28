import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, TrendingUp } from "lucide-react";

const resultHistory = [
  { date: "2024-01-15", result: "568-94-138", day: "Today" },
  { date: "2024-01-14", result: "432-76-502", day: "Yesterday" },
  { date: "2024-01-13", result: "789-12-456", day: "2 days ago" },
  { date: "2024-01-12", result: "156-89-234", day: "3 days ago" },
  { date: "2024-01-11", result: "901-45-678", day: "4 days ago" },
  { date: "2024-01-10", result: "234-67-890", day: "5 days ago" },
  { date: "2024-01-09", result: "678-23-145", day: "6 days ago" }
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

const BookResults = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const bookName = bookNames[bookId || ""] || "Unknown Book";

  return (
    <div className="min-h-screen bg-gradient-to-br from-matka-orange-light to-white">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">{bookName} Results</h1>
            </div>
            <Link to={`/book/${bookId}/games`}>
              <Button variant="secondary" size="sm" className="bg-white text-primary">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Current Result Card */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Latest Result
              </span>
              <Badge variant="default" className="bg-matka-green">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-matka-green mb-4">
                568-94-138
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>January 15, 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>5:00 PM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result History */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Result History</h2>
        </div>

        <div className="grid gap-4">
          {resultHistory.map((record, index) => (
            <Card key={record.date} className={`transition-all duration-300 hover:shadow-md ${index === 0 ? 'border-primary border-2' : ''}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="font-medium">{record.date}</div>
                      <div className="text-xs text-primary">{record.day}</div>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Result</div>
                      <div className="text-2xl font-mono font-bold text-gray-800">
                        {record.result}
                      </div>
                    </div>
                  </div>
                  
                  {index === 0 && (
                    <Badge variant="outline" className="border-primary text-primary w-fit">
                      Latest
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts & Analytics */}
        <div className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Result Analytics</h3>
              <p className="text-blue-600 mb-4">
                Detailed charts and analytics coming soon! Track winning patterns, frequency analysis, and more.
              </p>
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Section */}
        <div className="mt-8 text-center">
          <Link to={`/book/${bookId}/games`}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              Start Playing Now
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BookResults;