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
import { Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: "active" | "inactive" | "banned";
  listings: number;
}

export default function UsersPage() {
  const isAdmin = true; // Mock - in real app, check user role

  // Mock users data
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      joinedAt: "2024-01-15",
      status: "active",
      listings: 5,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      joinedAt: "2024-02-20",
      status: "active",
      listings: 3,
    },
  ];

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    banned: "bg-red-100 text-red-800",
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
                User Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage platform users and their accounts
              </p>
            </div>

            {/* Users Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="font-semibold">Listings</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-sm">{user.joinedAt}</TableCell>
                        <TableCell className="text-sm">{user.listings}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[user.status]}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => console.log("Delete user", user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
