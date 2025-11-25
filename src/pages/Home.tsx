import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Users, TrendingUp, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="relative inline-block">
            <div className="text-5xl mb-4 animate-float drop-shadow-2xl">🐝</div>
            <div className="absolute inset-0 blur-3xl bg-honey opacity-30 animate-pulse-glow"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-honey via-honey-light to-honey bg-clip-text text-transparent drop-shadow-lg animate-fade-in">
            Your Campus Marketplace
          </h1>
          <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Buy and sell used items within your college community. From textbooks to gadgets, find everything you need or give your unused items a new home.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/marketplace">Browse Items</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Skills Offered Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-honey to-honey-light bg-clip-text text-transparent">
            Skills & Services Offered
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Connect with talented students offering various skills and services
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-background rounded-lg border border-border hover:border-honey transition-colors">
                <h3 className="text-sm font-semibold mb-1 text-honey">Tutoring</h3>
                <p className="text-xs text-muted-foreground">Academic support across subjects</p>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border hover:border-honey transition-colors">
                <h3 className="text-sm font-semibold mb-1 text-honey">Design & Creative</h3>
                <p className="text-xs text-muted-foreground">Graphics, video editing, photography</p>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border hover:border-honey transition-colors">
                <h3 className="text-sm font-semibold mb-1 text-honey">Tech & Development</h3>
                <p className="text-xs text-muted-foreground">Web development, app creation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-card p-4 rounded-xl border border-border hover:border-honey transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-honey/20 cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-honey/20 group-hover:scale-110 transition-all duration-300">
              <ShoppingBag className="h-5 w-5 text-honey group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-base font-semibold mb-1 group-hover:text-honey transition-colors">Easy Buying & Selling</h3>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">List items in minutes and connect with buyers instantly</p>
          </div>

          <div className="group bg-card p-4 rounded-xl border border-border hover:border-honey transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-honey/20 cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-honey/20 group-hover:scale-110 transition-all duration-300">
              <Users className="h-5 w-5 text-honey group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-base font-semibold mb-1 group-hover:text-honey transition-colors">College Community</h3>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Trade safely within your trusted campus network</p>
          </div>

          <div className="group bg-card p-4 rounded-xl border border-border hover:border-honey transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-honey/20 cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-honey/20 group-hover:scale-110 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-honey group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-base font-semibold mb-1 group-hover:text-honey transition-colors">Great Deals</h3>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Find amazing prices on pre-loved items from students</p>
          </div>

          <div className="group bg-card p-4 rounded-xl border border-border hover:border-honey transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-honey/20 cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-honey/20 group-hover:scale-110 transition-all duration-300">
              <Shield className="h-5 w-5 text-honey group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="text-base font-semibold mb-1 group-hover:text-honey transition-colors">Secure Contact</h3>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Connect via WhatsApp or Telegram for safe transactions</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-honey/10 to-honey-dark/10 rounded-2xl p-8 text-center border border-honey/20">
          <h2 className="text-2xl font-bold mb-3">Ready to start trading?</h2>
          <p className="text-base text-muted-foreground mb-6">Join your campus marketplace today</p>
          <Button asChild>
            <Link to="/auth">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 SellBee. Your trusted campus marketplace.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
