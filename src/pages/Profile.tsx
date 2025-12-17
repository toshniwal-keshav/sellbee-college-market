import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Package, Edit, Briefcase, Loader2, Camera, Trash2, Check, X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string | null;
  images: string[] | null;
}

interface Notification {
  id: string;
  listing_id: string | null;
  type: string;
  message: string;
  read: boolean;
  action_taken: boolean;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editingImageListingId, setEditingImageListingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processingNotification, setProcessingNotification] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
        whatsapp: profileData.whatsapp || "",
        email: profileData.email || session.user.email || "",
        bio: profileData.bio || "",
      });
    } else {
      // Create profile if doesn't exist
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          user_id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name,
        })
        .select()
        .single();
      
      if (newProfile) {
        setProfile(newProfile);
        setFormData({
          full_name: newProfile.full_name || "",
          phone: newProfile.phone || "",
          whatsapp: newProfile.whatsapp || "",
          email: newProfile.email || session.user.email || "",
          bio: newProfile.bio || "",
        });
      }
    }

    // Fetch user's listings
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, title, price, status, images")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (listingsData) {
      setListings(listingsData);
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("action_taken", false)
      .order("created_at", { ascending: false });

    if (notificationsData) {
      setNotifications(notificationsData as Notification[]);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        bio: formData.bio,
      })
      .eq("user_id", profile.user_id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      setProfile({ ...profile, ...formData });
      setIsEditingProfile(false);
    }
    setSaving(false);
  };

  const handleSaveSkills = async () => {
    if (!profile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ bio: formData.bio })
      .eq("user_id", profile.user_id);

    if (error) {
      toast.error("Failed to update skills");
    } else {
      toast.success("Skills updated successfully");
      setProfile({ ...profile, bio: formData.bio });
      setIsEditingSkills(false);
    }
    setSaving(false);
  };

  const handleImageUpload = async (listingId: string, file: File) => {
    setUploadingImage(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${listingId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      // Update listing with new image
      const listing = listings.find(l => l.id === listingId);
      const currentImages = listing?.images || [];
      const newImages = [publicUrl, ...currentImages.slice(0, 4)]; // Keep max 5 images

      const { error: updateError } = await supabase
        .from("listings")
        .update({ images: newImages })
        .eq("id", listingId);

      if (updateError) throw updateError;

      // Update local state
      setListings(listings.map(l => 
        l.id === listingId ? { ...l, images: newImages } : l
      ));

      toast.success("Image updated successfully");
      setEditingImageListingId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMarkAsSold = async (listingId: string) => {
    const { error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", listingId);

    if (error) {
      toast.error("Failed to mark as sold");
    } else {
      setListings(listings.map(l => 
        l.id === listingId ? { ...l, status: "sold" } : l
      ));
      toast.success("Listing marked as sold");
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      toast.error("Failed to delete listing");
    } else {
      setListings(listings.filter(l => l.id !== listingId));
      toast.success("Listing deleted");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleApproveAuction = async (notificationId: string) => {
    setProcessingNotification(notificationId);
    try {
      const { error } = await supabase.rpc("approve_auction_move", { notification_id: notificationId });
      if (error) throw error;
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success("Item moved to auction!");
      checkAuthAndFetchData(); // Refresh listings
    } catch (error: any) {
      toast.error(error.message || "Failed to approve auction");
    } finally {
      setProcessingNotification(null);
    }
  };

  const handleDeclineAuction = async (notificationId: string) => {
    setProcessingNotification(notificationId);
    try {
      const { error } = await supabase.rpc("decline_auction_move", { notification_id: notificationId });
      if (error) throw error;
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success("Auction declined");
    } catch (error: any) {
      toast.error(error.message || "Failed to decline");
    } finally {
      setProcessingNotification(null);
    }
  };

  const activeListings = listings.filter(l => l.status !== "sold");
  const soldListings = listings.filter(l => l.status === "sold");

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-fredoka">
        <Navbar isAuthenticated onLogout={handleLogout} />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-honey" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar isAuthenticated onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-honey to-honey-light bg-clip-text text-transparent">
            My Profile
          </h1>

          {/* Notifications */}
          {notifications.length > 0 && (
            <Card className="border-honey/50 bg-honey/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-honey" />
                  Notifications ({notifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <p className="text-sm flex-1">{notification.message}</p>
                    {notification.type === "auction_permission" && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproveAuction(notification.id)}
                          disabled={processingNotification === notification.id}
                        >
                          {processingNotification === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineAuction(notification.id)}
                          disabled={processingNotification === notification.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                {!isEditingProfile ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingProfile ? (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-lg font-semibold">{profile?.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold">{formData.email || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg font-semibold">{profile?.phone || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="text-lg font-semibold">{profile?.whatsapp || "Not set"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills & Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Skills & Services Offered
                </CardTitle>
                {!isEditingSkills ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSkills(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveSkills} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingSkills(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingSkills ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your skills and services you offer..."
                  rows={4}
                />
              ) : (
                <p className="text-lg">{profile?.bio || "No skills or services listed yet."}</p>
              )}
            </CardContent>
          </Card>

          {/* My Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Listings ({activeListings.length} active of 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  You haven't posted any listings yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div 
                      key={listing.id} 
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {listing.images?.[0] ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          )}
                          {editingImageListingId !== listing.id && (
                            <button
                              onClick={() => setEditingImageListingId(listing.id)}
                              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Camera className="h-5 w-5 text-white" />
                            </button>
                          )}
                        </div>
                        
                        {editingImageListingId === listing.id && (
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(listing.id, file);
                              }}
                              disabled={uploadingImage}
                              className="text-sm"
                            />
                            {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingImageListingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {editingImageListingId !== listing.id && (
                          <div>
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-honey font-semibold">₹{listing.price}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.status === "sold" ? "secondary" : "default"}>
                          {listing.status === "sold" ? "Sold" : "Active"}
                        </Badge>
                        {listing.status !== "sold" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsSold(listing.id)}
                          >
                            Mark Sold
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteListing(listing.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
