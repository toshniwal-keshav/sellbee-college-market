import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Loader2, Phone, Mail, MessageCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string | null;
  listing_type: string;
  images: string[] | null;
  created_at: string;
  category_id: string | null;
  status: string | null;
  user_id: string;
  categories?: { name: string; type: string } | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [condition, setCondition] = useState("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("type")
      .order("name");
    
    if (data) setCategories(data);
  };

  const fetchListings = async () => {
    setLoading(true);
    
    // Fetch listings
    const { data: listingsData, error } = await supabase
      .from("listings")
      .select(`
        *,
        categories (name, type)
      `)
      .neq("status", "sold")
      .order("created_at", { ascending: false });

    if (error || !listingsData) {
      setLoading(false);
      return;
    }

    // Fetch profiles for all listings
    const userIds = [...new Set(listingsData.map(l => l.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, phone, whatsapp")
      .in("user_id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const listingsWithProfiles = listingsData.map(listing => ({
      ...listing,
      profiles: profilesMap.get(listing.user_id) || null
    }));

    setListings(listingsWithProfiles);
    setLoading(false);
  };

  const filteredListings = listings.filter((listing) => {
    // Search filter
    if (search && !listing.title.toLowerCase().includes(search.toLowerCase()) &&
        !listing.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all" && listing.category_id !== categoryFilter) {
      return false;
    }

    // Price filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      if (max) {
        if (listing.price < min || listing.price > max) return false;
      } else {
        if (listing.price < min) return false;
      }
    }

    // Condition filter
    if (condition !== "all" && listing.condition !== condition) {
      return false;
    }

    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar isAuthenticated />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-black">Marketplace</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-50">Under ₹50</SelectItem>
                  <SelectItem value="50-200">₹50 - ₹200</SelectItem>
                  <SelectItem value="200-500">₹200 - ₹500</SelectItem>
                  <SelectItem value="500-10000000">₹500+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Condition</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-honey" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-xl text-muted-foreground mb-4">No listings found</p>
            <p className="text-muted-foreground mb-6">
              {search || categoryFilter !== "all" || priceRange !== "all" || condition !== "all"
                ? "Try adjusting your filters"
                : "Be the first to post something!"}
            </p>
            <Link to="/add-listing">
              <Button>Post a Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Link key={listing.id} to={`/listing/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow hover:border-honey h-full">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl">📦</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {listing.categories?.name || listing.listing_type}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-honey mb-2">
                      {formatPrice(listing.price)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    
                    {/* Seller Contact Info */}
                    <div className="text-xs space-y-1 border-t pt-2">
                      <p className="font-medium text-sm">
                        {listing.profiles?.full_name || "Anonymous"}
                      </p>
                      {listing.profiles?.email && (
                        <a
                          href={`mailto:${listing.profiles.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-honey hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {listing.profiles.email}
                        </a>
                      )}
                      {listing.profiles?.phone && (
                        <a
                          href={`tel:${listing.profiles.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-honey hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {listing.profiles.phone}
                        </a>
                      )}
                      {listing.profiles?.whatsapp && (
                        <a
                          href={getWhatsAppLink(listing.profiles.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-green-600 hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(listing.created_at)}
                    </span>
                    {listing.condition && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {listing.condition.replace("-", " ")}
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
