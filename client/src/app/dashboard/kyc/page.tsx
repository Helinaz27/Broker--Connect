// app/dashboard/kyc/page.tsx
"use client";

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
import { Eye, Menu, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

interface KYCRequest {
  id: string;
  userName: string;
  email: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function KYCPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const router = useRouter();

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
              KYC Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Review and approve KYC requests from users
            </p>
          </div>

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
                      <TableCell className="font-medium">
                        {req.userName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {req.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.submittedAt}
                      </TableCell>
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
                          onClick={() => console.log("View KYC", req.id)}
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
        </>
      )}
    </div>
  );
}
