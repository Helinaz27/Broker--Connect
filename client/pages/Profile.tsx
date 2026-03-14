import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { Coins, Edit, Lock, LogOut, Plus } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const [user] = useState({
    name: "Abebaw Tsega",
    email: "abebaw@example.com",
    phone: "+251912345678",
    coins: 5000,
    level: 1,
    joinedDate: "Jan 15, 2026",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getLevelBadge = (level: number) => {
    const badges = {
      0: { label: "Level 0 - Basic", color: "bg-gray-100 text-gray-800" },
      1: { label: "Level 1 - Verified", color: "bg-blue-100 text-blue-800" },
      2: { label: "Level 2 - Premium", color: "bg-purple-100 text-purple-800" },
    };
    return badges[level as keyof typeof badges] || badges[0];
  };

  const badge = getLevelBadge(user.level);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl">
          {/* Profile Header */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                />
                <Button size="sm" variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Update Profile
                </Button>
              </div>

              {/* User Info */}
              <div>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
                      {badge.label}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  Member since {user.joinedDate}
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-20">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-20">Phone:</span>
                    <span>{user.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coins Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Coins</h2>
                <Coins className="h-6 w-6 opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-4">{user.coins.toLocaleString()}</p>
              <p className="text-sm opacity-90 mb-6">
                1 Coin = 1 Birr • Use coins to access contact info and post services
              </p>
              <Button variant="secondary" size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Buy More Coins
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Active Posts</p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <p className="text-3xl font-bold">⭐ 4.8</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

            <div className="space-y-4">
              {/* Change Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">
                      Update your password regularly for security
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* KYC Status */}
              <div className="w-full flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500" />
                  <div className="text-left">
                    <p className="font-medium">KYC Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Verified • National ID
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>

              {/* Delete Account */}
              <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 text-red-500">🗑️</div>
                  <div className="text-left">
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and data
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => setShowPasswordModal(false)}>
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Chat Component */}
      <Chat />
    </div>
  );
}
