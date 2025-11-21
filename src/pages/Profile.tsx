import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Package, Edit, Briefcase } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const [skills, setSkills] = useState("Web Development, Graphic Design, Content Writing");
  const [services, setServices] = useState("Tutoring for Math and Physics, Resume Building");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  
  // Mock data
  const user = {
    name: "Rahul Kumar",
    email: "rahul@college.edu",
    collegeId: "BMSCE2024",
  };

  const myListings = [
    { id: 1, title: "Engineering Textbooks", price: 800, status: "active" },
    { id: 2, title: "Laptop Charger", price: 300, status: "sold" },
  ];

  return (
    <div className="min-h-screen bg-background font-fredoka">
      <Navbar isAuthenticated />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-honey to-honey-light bg-clip-text text-transparent">
            My Profile
          </h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">College ID</p>
                <p className="text-lg font-semibold">{user.collegeId}</p>
              </div>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Skills & Services Offered
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingSkills(!isEditingSkills)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditingSkills ? "Save" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                {isEditingSkills ? (
                  <Textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Enter your skills..."
                    rows={2}
                  />
                ) : (
                  <p className="text-lg">{skills}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Services Offered</p>
                {isEditingSkills ? (
                  <Textarea
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="Enter services you offer..."
                    rows={2}
                  />
                ) : (
                  <p className="text-lg">{services}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Listings (2 of 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-honey font-semibold">₹{listing.price}</p>
                    </div>
                    <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                      {listing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
