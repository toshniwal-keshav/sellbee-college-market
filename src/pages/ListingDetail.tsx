import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, MessageCircle, Loader2 } from "lucide-react";
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

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      // Fetch listing with category
      const { data: listingData, error } = await supabase
        .from("listings")
        .select(`
          *,
          categories (name, type)
        `)
        .eq("id", id)
        .single();

      if (error || !listingData) {
        setLoading(false);
        return;
      }

      // Fetch profile separately
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone, whatsapp")
        .eq("user_id", listingData.user_id)
        .single();

      setListing({ 
        ...listingData, 
        profiles: profileData || null 
      });
      
      setLoading(false);
    };

    fetchListing();
  }, [id]);

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
      month: "long",
      year: "numeric",
    });
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-fredoka">
        <Navbar isAuthenticated />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-honey" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background font-fredoka">
        <Navbar isAuthenticated />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Link to="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar isAuthenticated />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  📦
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${
                      idx === currentImageIndex ? "border-honey" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {listing.categories?.name || listing.listing_type}
                </Badge>
                {listing.condition && (
                  <Badge variant="outline" className="capitalize">
                    {listing.condition.replace("-", " ")}
                  </Badge>
                )}
                {listing.status === "sold" && (
                  <Badge variant="destructive">Sold</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-4xl font-bold text-honey mb-4">
                {formatPrice(listing.price)}
              </p>
              <p className="text-sm text-muted-foreground">
                Posted on {formatDate(listing.created_at)}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || "No description provided"}
              </p>
            </div>

            {/* Seller Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Seller</h2>
                <div className="space-y-3">
                  <p className="font-medium">
                    {listing.profiles?.full_name || "Anonymous Seller"}
                  </p>
                  
                  {listing.profiles?.email && (
                    <a
                      href={`mailto:${listing.profiles.email}`}
                      className="flex items-center gap-2 text-honey hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {listing.profiles.email}
                    </a>
                  )}
                  
                  {listing.profiles?.phone && (
                    <a
                      href={`tel:${listing.profiles.phone}`}
                      className="flex items-center gap-2 text-honey hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {listing.profiles.phone}
                    </a>
                  )}
                  
                  {listing.profiles?.whatsapp && (
                    <a
                      href={getWhatsAppLink(listing.profiles.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp: {listing.profiles.whatsapp}
                    </a>
                  )}

                  {!listing.profiles?.email && !listing.profiles?.phone && !listing.profiles?.whatsapp && (
                    <p className="text-muted-foreground text-sm">
                      Seller has not provided contact information yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
