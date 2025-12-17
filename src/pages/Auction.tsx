import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Gavel, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AuctionListing {
  id: string;
  title: string;
  price: number;
  images: string[] | null;
  auction_end_date: string | null;
  created_at: string;
  user_id: string;
  categories?: { name: string } | null;
  highest_bid?: number;
  total_bids?: number;
}

const Auction = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchAuctions();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

  const fetchAuctions = async () => {
    setLoading(true);

    // Fetch active auction listings (not expired)
    const { data: listingsData, error } = await supabase
      .from("listings")
      .select(`
        id, title, price, images, auction_end_date, created_at, user_id,
        categories (name)
      `)
      .eq("is_auction", true)
      .eq("status", "active")
      .gte("auction_end_date", new Date().toISOString())
      .order("auction_end_date", { ascending: true });

    if (error || !listingsData) {
      setLoading(false);
      return;
    }

    // Fetch bids for each listing
    const listingIds = listingsData.map(l => l.id);
    const { data: bidsData } = await supabase
      .from("bids")
      .select("listing_id, amount")
      .in("listing_id", listingIds);

    // Calculate highest bid and total bids per listing
    const bidsMap = new Map<string, { highest: number; count: number }>();
    bidsData?.forEach(bid => {
      const current = bidsMap.get(bid.listing_id) || { highest: 0, count: 0 };
      bidsMap.set(bid.listing_id, {
        highest: Math.max(current.highest, bid.amount),
        count: current.count + 1
      });
    });

    const auctionsWithBids = listingsData.map(listing => ({
      ...listing,
      highest_bid: bidsMap.get(listing.id)?.highest || listing.price * 0.5,
      total_bids: bidsMap.get(listing.id)?.count || 0
    }));

    setAuctions(auctionsWithBids);
    setLoading(false);
  };

  // Calculate time remaining for each auction
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      
      auctions.forEach(auction => {
        if (!auction.auction_end_date) {
          newTimeLeft[auction.id] = "No end date";
          return;
        }
        
        const now = new Date().getTime();
        const end = new Date(auction.auction_end_date).getTime();
        const distance = end - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          
          newTimeLeft[auction.id] = `${days}d ${hours}h ${minutes}m`;
        } else {
          newTimeLeft[auction.id] = "Ended";
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [auctions]);

  const openBidDialog = (auction: AuctionListing) => {
    if (!currentUserId) {
      toast.error("Please login to place a bid");
      navigate("/auth");
      return;
    }
    setSelectedAuction(auction);
    setBidAmount(String((auction.highest_bid || auction.price * 0.5) + 10));
  };

  const handlePlaceBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    
    if (!currentUserId) {
      toast.error("Please login to place a bid");
      navigate("/auth");
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = selectedAuction.highest_bid || selectedAuction.price * 0.5;

    if (amount <= minBid) {
      toast.error(`Bid must be higher than ₹${minBid}`);
      return;
    }

    setSubmittingBid(true);

    const { error } = await supabase
      .from("bids")
      .insert({
        listing_id: selectedAuction.id,
        user_id: currentUserId,
        amount: amount
      });

    if (error) {
      toast.error("Failed to place bid");
    } else {
      toast.success("Bid placed successfully!");
      setSelectedAuction(null);
      setBidAmount("");
      fetchAuctions(); // Refresh to show new bid
    }

    setSubmittingBid(false);
  };

  const filteredAuctions = auctions.filter(auction =>
    auction.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar isAuthenticated />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-black">Live Auction</h1>
          <p className="text-muted-foreground mb-6">
            Unsold items automatically enter auction at 50% base price after 30 days
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-honey" />
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-xl text-muted-foreground mb-4">No active auctions</p>
            <p className="text-muted-foreground">
              Items will appear here after 30 days without selling
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuctions.map((auction) => (
              <Card key={auction.id} className="overflow-hidden hover:border-honey transition-colors">
                <CardHeader className="p-0 relative">
                  <div className="aspect-square bg-muted">
                    {auction.images?.[0] ? (
                      <img
                        src={auction.images[0]}
                        alt={auction.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                    )}
                  </div>
                  <Badge className="absolute top-2 right-2 bg-honey text-honey-foreground">
                    <Gavel className="h-3 w-3 mr-1" />
                    Auction
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {auction.categories?.name || "General"}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{auction.title}</h3>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Base Price:</span>
                      <span className="text-sm font-medium">₹{Math.round(auction.price * 0.5)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Bid:</span>
                      <span className="text-xl font-bold text-honey">₹{auction.highest_bid}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Bids:</span>
                      <span className="text-sm font-medium">{auction.total_bids}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Ends in: {timeLeft[auction.id] || "Calculating..."}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => openBidDialog(auction)}
                    disabled={timeLeft[auction.id] === "Ended"}
                  >
                    {timeLeft[auction.id] === "Ended" ? "Auction Ended" : "Place Bid"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bid Dialog */}
      <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
            <DialogDescription>
              {selectedAuction?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span>Current Highest Bid:</span>
              <span className="font-bold text-honey">
                ₹{selectedAuction?.highest_bid || 0}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bid">Your Bid (₹)</Label>
              <Input
                id="bid"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={(selectedAuction?.highest_bid || 0) + 1}
              />
              <p className="text-sm text-muted-foreground">
                Minimum bid: ₹{(selectedAuction?.highest_bid || 0) + 1}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAuction(null)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBid} disabled={submittingBid}>
              {submittingBid && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auction;
