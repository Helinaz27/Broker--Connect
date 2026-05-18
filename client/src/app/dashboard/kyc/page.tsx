"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface KYCRequest {
  id: string;
  userName: string;
  email: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function KYCPage() {
  const isAdmin = true; // Mock - in real app, check user role

  // Mock KYC data
  const kycRequests: KYCRequest[] = [
    {
      id: "1",
      userName: "John Doe",
      email: "john@example.com",
      submittedAt: "2024-05-15",
      status: "pending",
    },
    {
      id: "2",
      userName: "Jane Smith",
      email: "jane@example.com",
      submittedAt: "2024-05-14",
      status: "approved",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
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
                KYC Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Review and approve KYC requests from users
              </p>
            </div>

            {/* KYC Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>KYC Requests</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">User Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycRequests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{req.userName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.email}
                        </TableCell>
                        <TableCell className="text-sm">{req.submittedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[req.status]}
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => console.log("View KYC details for", req.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
