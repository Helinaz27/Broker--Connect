"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Bell, Lock, Shield } from "lucide-react";
import { Footer } from "react-day-picker";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container px-4 py-12 max-w-2xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Settings
        </h1>
        <div className="space-y-4">
          <Link
            href="/profile"
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Profile</p>
              <p className="text-sm text-muted-foreground">
                Edit your name, email, and phone
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card opacity-90">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Notifications</p>
              <p className="text-sm text-muted-foreground">
                Email and push preferences
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card opacity-90">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Password</p>
              <p className="text-sm text-muted-foreground">
                Change your password
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card opacity-90">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Privacy</p>
              <p className="text-sm text-muted-foreground">
                Data and privacy settings
              </p>
            </div>
            <Link href="/privacy">
              <Button variant="ghost" size="sm">
                View policy
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
