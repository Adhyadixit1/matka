import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b132b] via-[#0f2040] to-[#0b132b] text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            {['₹', '💵', '💰', '💸', '💲', '🪙'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-yellow-500/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-10 -left-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
              <span className="text-yellow-300 text-sm font-medium">🎉 Join thousands of winners today!</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">
                Play. Win. <span className="whitespace-nowrap">Experience the Thrill</span>
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-emerald-100/90 leading-relaxed">
              From ₹1,000 to lakhs – discover how India's most famous number game has changed lives. 
              <span className="block mt-2 text-yellow-300 font-medium">Start playing in less than 30 seconds!</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link to="/auth" className="w-full sm:w-auto block group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <Button 
                  size="lg" 
                  className="relative w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold px-8 py-7 text-lg shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get Started – It's Free
                  </span>
                </Button>
              </Link>
              <a 
                href="#how-it-works" 
                className="px-6 py-3.5 text-sm font-medium text-white hover:text-emerald-200 transition-colors flex items-center gap-2"
              >
                <span>Learn How It Works</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-90">
            {[
              { label: "Trusted", value: "100K+ players" },
              { label: "Payouts", value: "Lakhs daily" },
              { label: "Speed", value: "Live results" },
              { label: "Security", value: "Safe & Fast" },
            ].map((i) => (
              <Card key={i.label} className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <div className="text-xs text-emerald-200">{i.label}</div>
                  <div className="text-lg font-semibold text-emerald-100">{i.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What is Matka */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-300">What is Matka?</h2>
            <p className="text-emerald-100/90">
              Matka is a historic Indian number game that began in the 1960s. Players pick numbers and win based on the draw results.
              It’s thrilling, fast, and has created countless winning stories across India.
            </p>
            <ul className="space-y-2 text-emerald-100/90 list-disc list-inside">
              <li>Origin and evolution from traditional draws to digital platforms.</li>
              <li>Simple number mechanics with multiple popular formats.</li>
              <li>Excitement from live updates and rapid results.</li>
            </ul>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Pick Numbers" },
              { step: "02", title: "Place Bet" },
              { step: "03", title: "Win or Learn" },
            ].map((s) => (
              <div key={s.step} className="rounded-xl p-4 bg-white/5 border border-white/10">
                <div className="text-yellow-300 font-bold">{s.step}</div>
                <div className="text-emerald-50 text-lg font-semibold">{s.title}</div>
                <div className="text-emerald-200/80 text-sm mt-1">Follow the simple flow and watch results live.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Famous Books */}
      <section className="bg-gradient-to-br from-[#0f1a35] to-[#0c162b] py-16 md:py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-300">Famous Matka Books in India</h2>
          <p className="text-center text-emerald-100/80 mt-2">Explore popular markets trusted by players across the country.</p>
          <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Milan Day", desc: "A classic favorite with consistent draws." },
              { name: "Kalyan", desc: "India’s legendary book with a rich history." },
              { name: "Rajdhani", desc: "Fast-paced and exciting play patterns." },
              { name: "Worli", desc: "Traditional charm with loyal followers." },
              { name: "Time Bazar", desc: "Timely draws and energetic momentum." },
              { name: "Main Mumbai", desc: "Iconic market with massive reach." },
            ].map((b) => (
              <Card key={b.name} className="bg-white/5 border-white/10 hover:translate-y-[-2px] transition-transform">
                <CardContent className="p-5">
                  <div className="text-xl font-semibold text-emerald-50">{b.name}</div>
                  <div className="text-emerald-200/80 text-sm mt-1">{b.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Factor */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-600/10 via-transparent to-amber-500/10 p-6 md:p-10">
          <h3 className="text-2xl md:text-3xl font-bold text-red-300">Transparency Matters: Risk Factor</h3>
          <p className="text-emerald-100/90 mt-2">
            Matka involves real money and carries risks. Play responsibly. Never invest more than you can afford to lose.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0c162b] py-16 md:py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-300">Winning Stories & Testimonials</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { name: "Arjun", quote: "I invested just ₹2,000 and won ₹1.5 lakhs in a single game!" },
              { name: "Priya", quote: "Matka changed my life – it’s not just a game, it’s an opportunity." },
              { name: "Vikram", quote: "Live results and smooth UI – I love this app!" },
            ].map((t) => (
              <Card key={t.name} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-yellow-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                  <p className="mt-3 text-emerald-50">“{t.quote}”</p>
                  <div className="mt-3 text-sm text-emerald-200/80">— {t.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why People Love This App */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-300">Why People Love This App</h2>
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          {[
            { title: "Live Results & Updates", desc: "Track outcomes in real-time with precision." },
            { title: "Multiple Networks", desc: "Play across India’s most famous books in one place." },
            { title: "Anytime, Anywhere", desc: "Mobile-friendly, optimized experience." },
            { title: "Secure & Fast", desc: "Safe access and lightning-fast performance." },
          ].map((f) => (
            <Card key={f.title} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="text-lg font-semibold text-emerald-50">{f.title}</div>
                <div className="text-emerald-200/80 text-sm mt-2">{f.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Play & Win Counters (static numbers for light JS) */}
      <section className="bg-gradient-to-br from-[#0f1a35] to-[#0c162b] py-16 md:py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-300">Play & Win</h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { label: "Total Players", value: "100,000+" },
              { label: "Lakhs Won", value: "₹25+ Cr" },
              { label: "Daily Draws", value: "500+" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl p-6 bg-white/5 border border-white/10">
                <div className="text-3xl font-extrabold text-emerald-200">{c.value}</div>
                <div className="text-sm text-emerald-300/80 mt-1">{c.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-emerald-100/80 mt-6">Lakhs are waiting. All it takes is a small step.</p>
          <div className="flex justify-center mt-6">
            <Link to="/auth">
              <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold px-8 shadow-[0_0_40px_rgba(250,204,21,0.35)]">
                Join the Game – Start Playing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews & Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-300">Loved by Players Across India</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  ))}
                </div>
                <div className="text-emerald-50 mt-3">“World-class experience. Secure, fast, and thrilling.”</div>
                <div className="text-emerald-200/80 text-sm mt-2">5.0 • Verified Player</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-emerald-200/80">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Safe</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Trusted</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">100K+ Players</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Trending in India</span>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0c162b] py-16 md:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-yellow-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">Are you ready to try your luck?</span>
          </h2>
          <div className="mt-6">
            <Link to="/auth">
              <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold px-8 shadow-[0_0_40px_rgba(250,204,21,0.35)]">
                Start Now – Experience the Thrill
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
