import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MAX_LISTINGS = 5;

const AddListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userListingCount, setUserListingCount] = useState(0);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    condition: "good",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUserId(session.user.id);

      // Fetch user's listing count
      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .neq("status", "sold");
      
      setUserListingCount(count || 0);
    };

    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("type")
        .order("name");
      
      if (data) setCategories(data);
    };

    checkAuth();
    fetchCategories();
  }, [navigate]);

  const handleImageUpload = async (files: FileList) => {
    if (!userId) return;
    if (imageUrls.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setUploadingImages(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length && imageUrls.length + newUrls.length < 5; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      newUrls.push(publicUrl);
    }

    setImageUrls([...imageUrls, ...newUrls]);
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userListingCount >= MAX_LISTINGS) {
      toast.error(`You've reached the maximum limit of ${MAX_LISTINGS} listings per account.`);
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to create a listing");
        navigate("/auth");
        return;
      }

      const selectedCategory = categories.find(c => c.id === formData.category_id);
      const listingType = selectedCategory?.type || "product";

      const { error } = await supabase.from("listings").insert({
        user_id: session.user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        condition: formData.condition,
        listing_type: listingType,
        images: imageUrls.length > 0 ? imageUrls : null,
        status: "active",
      });

      if (error) throw error;

      toast.success("Listing posted successfully!");
      navigate("/marketplace");
    } catch (error: any) {
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const productCategories = categories.filter(c => c.type === "product");
  const serviceCategories = categories.filter(c => c.type === "service");
  const selectedCategory = categories.find(c => c.id === formData.category_id);

  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar isAuthenticated />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-black">Post an Ad</h1>
          <p className="text-sm text-muted-foreground mb-8">
            You have {MAX_LISTINGS - userListingCount} listing(s) remaining
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Images (up to 5)</Label>
                  <div className="flex flex-wrap gap-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {imageUrls.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImages}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-honey transition-colors"
                      >
                        {uploadingImages ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Image className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Engineering Textbooks"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({...formData, category_id: value})}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.length > 0 && (
                          <>
                            <SelectItem value="header-products" disabled className="font-semibold text-muted-foreground">
                              Products
                            </SelectItem>
                            {productCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {serviceCategories.length > 0 && (
                          <>
                            <SelectItem value="header-services" disabled className="font-semibold text-muted-foreground mt-2">
                              Services
                            </SelectItem>
                            {serviceCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {selectedCategory?.type === "service" && (
                      <p className="text-sm text-muted-foreground">Note: Services cannot be listed for auction</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select 
                    value={formData.condition}
                    onValueChange={(value) => setFormData({...formData, condition: value})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Post Listing
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/marketplace")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
