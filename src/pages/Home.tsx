import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Users, TrendingUp, Shield, AlertCircle, Sparkles, BookOpen, Palette, Code, ArrowRight, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const features = [
    { icon: ShoppingBag, title: "Easy Buying & Selling", description: "List items in minutes and connect with buyers instantly" },
    { icon: Users, title: "College Community", description: "Trade safely within your trusted campus network" },
    { icon: TrendingUp, title: "Great Deals", description: "Find amazing prices on pre-loved items from students" },
    { icon: Shield, title: "Secure Contact", description: "Connect via WhatsApp or Telegram for safe transactions" },
  ];

  const skills = [
    { icon: BookOpen, title: "Tutoring", description: "Academic support across subjects", link: "/marketplace?category=Tutoring", color: "from-pastel-lavender to-pastel-pink" },
    { icon: Palette, title: "Design & Creative", description: "Graphics, video editing, photography", link: "/marketplace?category=Design", color: "from-pastel-pink to-pastel-mint" },
    { icon: Code, title: "Tech & Development", description: "Web development, app creation", link: "/marketplace?category=Development", color: "from-pastel-mint to-pastel-lavender" },
  ];

  const testimonials = [
    { name: "Rahul K.", role: "Engineering Student", quote: "Sold my old textbooks in just 2 days! The campus-only marketplace makes it so much safer and convenient.", avatar: "👨‍🎓" },
    { name: "Priya S.", role: "Design Student", quote: "Found amazing deals on electronics from seniors. Love how easy it is to connect with other students!", avatar: "👩‍💻" },
    { name: "Arjun M.", role: "MBA Student", quote: "The skills marketplace helped me find a tutor for my course. Great platform for students helping students!", avatar: "👨‍🔬" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar isAuthenticated={!!user} onLogout={handleLogout} />
      
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-honey/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pastel-lavender/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-pastel-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-pastel-mint/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "0.5s" }} />
      </div>
      
      {/* Auth Status & Login Requirement Message */}
      <section className="container mx-auto px-4 pt-6">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="text-center animate-fade-in-up">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-honey border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : user ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-honey/30 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-foreground font-medium">
                  Logged in as: <span className="text-honey font-semibold">{profile?.full_name || profile?.username || user.email}</span>
                </p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <p className="text-muted-foreground">You are not logged in</p>
              </div>
            )}
          </div>
          
          {!user && !loading && (
            <Alert className="border-honey/50 bg-gradient-to-r from-honey/5 to-honey/10 animate-fade-in-up backdrop-blur-sm" style={{ animationDelay: "0.2s" }}>
              <AlertCircle className="h-4 w-4 text-honey animate-bounce-subtle" />
              <AlertDescription className="text-foreground">
                You must be logged in to post an ad or place a bid.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-honey/5 via-pastel-lavender/10 to-pastel-pink/5 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(43_85%_65%_/_0.1),transparent_50%)] -z-10" />
        
        <div className="max-w-4xl mx-auto">
          {/* Animated bee with sparkles */}
          <div className="relative inline-block mb-6">
            <div className="text-7xl animate-float drop-shadow-2xl cursor-pointer hover:animate-wiggle transition-all duration-300">🐝</div>
            <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-honey animate-bounce-subtle" />
            <Sparkles className="absolute -bottom-1 -left-4 w-4 h-4 text-honey-light animate-bounce-subtle" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-0 blur-3xl bg-honey opacity-20 animate-pulse-glow -z-10 scale-150" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="bg-gradient-to-r from-foreground via-honey-dark to-foreground bg-clip-text text-transparent">
              Your Campus
            </span>
            <br />
            <span className="bg-gradient-to-r from-honey via-honey-dark to-honey bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer">
              Marketplace
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.3s" }}>
            From textbooks and gadgets to tutoring, designing, editing, and tech support — 
            <span className="text-honey font-semibold"> SellBee</span> lets you buy, sell, and offer services within your own BMS college community.
          </p>

          <div className="flex gap-4 justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Button asChild size="lg" className="group relative overflow-hidden px-8 py-6 text-lg shadow-lg shadow-honey/20 hover:shadow-xl hover:shadow-honey/30 transition-all duration-300">
              <Link to="/marketplace" className="flex items-center gap-2">
                Browse Items
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-honey group-hover:scale-110 transition-transform">500+</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-honey group-hover:scale-110 transition-transform">1000+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-honey group-hover:scale-110 transition-transform">₹50K+</div>
              <div className="text-sm text-muted-foreground">Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Offered Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Skills & Services <span className="text-honey">Offered</span>
            </h2>
            <p className="text-muted-foreground text-lg opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Connect with talented students offering various skills and services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <Link 
                key={skill.title} 
                to={skill.link} 
                className="group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className={`relative p-6 bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:border-honey hover:shadow-xl hover:shadow-honey/10 hover:-translate-y-2`}>
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-honey/10 flex items-center justify-center mb-4 group-hover:bg-honey/20 group-hover:scale-110 transition-all duration-300">
                      <skill.icon className="w-7 h-7 text-honey group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-honey transition-colors">
                      {skill.title}
                    </h3>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {skill.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-honey opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Why Choose <span className="text-honey">SellBee</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need for campus trading
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group relative bg-card p-6 rounded-2xl border border-border cursor-pointer transition-all duration-500 hover:border-honey hover:shadow-2xl hover:shadow-honey/20 hover:-translate-y-3"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Animated border gradient */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-honey via-honey-light to-honey opacity-0 transition-opacity duration-300 ${hoveredFeature === index ? 'opacity-100' : ''}`} style={{ padding: '2px' }}>
                <div className="absolute inset-[2px] rounded-2xl bg-card" />
              </div>
              
              <div className="relative z-10">
                <div className="h-14 w-14 rounded-xl bg-honey/10 flex items-center justify-center mb-5 group-hover:bg-honey/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-honey group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-honey transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              What Students <span className="text-honey">Say</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of students who trust SellBee
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="group relative bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:border-honey hover:shadow-xl hover:shadow-honey/10 hover:-translate-y-2"
              >
                {/* Quote icon */}
                <div className="absolute top-4 right-4 text-6xl text-honey/10 font-serif group-hover:text-honey/20 transition-colors">
                  "
                </div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-honey/20 to-honey/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base group-hover:text-honey transition-colors">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed relative z-10 group-hover:text-foreground transition-colors">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-honey text-honey" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-br from-honey/10 via-honey/5 to-pastel-lavender/10 rounded-3xl p-12 text-center border border-honey/20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-honey/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pastel-pink/20 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/4 text-6xl opacity-10 animate-float">🐝</div>
          <div className="absolute top-1/3 right-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: "1s" }}>🍯</div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to start <span className="text-honey">trading</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Join your campus marketplace today and discover amazing deals
            </p>
            <Button asChild size="lg" className="group px-8 py-6 text-lg shadow-lg shadow-honey/20 hover:shadow-xl hover:shadow-honey/30 transition-all duration-300">
              <Link to="/auth" className="flex items-center gap-2">
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐝</span>
              <span className="font-bold text-lg">SellBee</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 SellBee. Your trusted campus marketplace.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="hover:text-honey cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-honey cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-honey cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
