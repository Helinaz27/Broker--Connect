"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface PlatformFee {
  id: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  category: "house" | "car" | "otherService";
}

export default function FeesPage() {
  const isAdmin = true; // Mock - in real app, check user role

  // Mock fees data
  const [fees, setFees] = useState<PlatformFee[]>([
    {
      id: "1",
      name: "House Posting Fee",
      description: "Fee for posting a house listing",
      amount: 0,
      percentage: 5,
      category: "house",
    },
    {
      id: "2",
      name: "Car Posting Fee",
      description: "Fee for posting a car listing",
      amount: 0,
      percentage: 3,
      category: "car",
    },
    {
      id: "3",
      name: "Service Posting Fee",
      description: "Fee for posting a service listing",
      amount: 0,
      percentage: 2,
      category: "otherService",
    },
  ]);

  const handleFeeUpdate = (id: string, field: "amount" | "percentage", value: number) => {
    setFees(
      fees.map((fee) =>
        fee.id === id ? { ...fee, [field]: value } : fee
      )
    );
  };

  const handleSave = () => {
    // API call to save fees would go here
    toast.success("Platform fees updated successfully!");
  };

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">
              Access denied. Admin only.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar isAdmin={isAdmin} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Platform Fees
              </h1>
              <p className="text-muted-foreground mt-2">
                Configure and manage platform fees
              </p>
            </div>

            {/* Fees Management */}
            <div className="space-y-4">
              {fees.map((fee) => (
                <Card key={fee.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{fee.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {fee.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {fee.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${fee.id}`} className="font-medium">
                          Fixed Amount (ETB)
                        </Label>
                        <Input
                          id={`amount-${fee.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={fee.amount}
                          onChange={(e) =>
                            handleFeeUpdate(fee.id, "amount", parseFloat(e.target.value))
                          }
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`percentage-${fee.id}`} className="font-medium">
                          Percentage (%)
                        </Label>
                        <Input
                          id={`percentage-${fee.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={fee.percentage}
                          onChange={(e) =>
                            handleFeeUpdate(fee.id, "percentage", parseFloat(e.target.value))
                          }
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
