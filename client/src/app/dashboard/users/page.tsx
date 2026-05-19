// app/dashboard/users/page.tsx
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
import { Trash2, ShieldCheck, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: "active" | "inactive" | "banned";
  listings: number;
}

export default function UsersPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const router = useRouter();

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
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage platform users and their accounts
            </p>
          </div>

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
        </>
      )}
    </div>
  );
}
