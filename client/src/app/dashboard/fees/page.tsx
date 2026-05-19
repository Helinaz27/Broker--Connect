// app/dashboard/fees/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, ShieldCheck, Menu } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

interface PlatformFee {
  id: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  category: "house" | "car" | "otherService";
}

export default function FeesPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const router = useRouter();

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

  const handleFeeUpdate = (
    id: string,
    field: "amount" | "percentage",
    value: number,
  ) => {
    setFees(
      fees.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee)),
    );
  };

  const handleSave = () => {
    toast.success("Platform fees updated successfully!");
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Broker Console</h1>
      </div>

      {!isAdmin ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">
            You don't have permission to view this page.
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Go back to Dashboard
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Platform Fees
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure and manage platform fees
            </p>
          </div>

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
                      <Label
                        htmlFor={`amount-${fee.id}`}
                        className="font-medium"
                      >
                        Fixed Amount (ETB)
                      </Label>
                      <Input
                        id={`amount-${fee.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={fee.amount}
                        onChange={(e) =>
                          handleFeeUpdate(
                            fee.id,
                            "amount",
                            parseFloat(e.target.value),
                          )
                        }
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`percentage-${fee.id}`}
                        className="font-medium"
                      >
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
                          handleFeeUpdate(
                            fee.id,
                            "percentage",
                            parseFloat(e.target.value),
                          )
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
