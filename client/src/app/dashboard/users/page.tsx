// // app/dashboard/users/page.tsx
"use client";

import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  ShieldCheck,
  Menu,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  Eye,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "@/store/apis/userApi";
import { toast } from "sonner";

export default function UsersPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchedText, setSearchedText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAllUsersQuery({
    page,
    limit: 5,
    search: searchedText || undefined,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "inactive"
          ? false
          : undefined,
  });

  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleSearch = () => {
    setSearchedText(search);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const result = await updateUserStatus({
        userId: user.id,
        isActive: !user.isActive,
      }).unwrap();
      if (result.success) {
        toast.success(
          `User ${!user.isActive ? "activated" : "deactivated"} successfully`,
        );
        refetch();
      } else {
        toast.error(result.message || "Failed to update user status");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user status");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const result = await deleteUser(userToDelete.id).unwrap();
      if (result.success) {
        toast.success("User deleted successfully");
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        refetch();
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin")) {
      return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
    } else if (roles.includes("broker")) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Broker</Badge>;
    } else {
      return <Badge variant="outline">User</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">
          You don't have permission to view this page.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage platform users and their accounts
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">
              Users{" "}
              {data?.data?.pagination && `(${data.data.pagination.total})`}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Button onClick={handleSearch} size="sm" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load users</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : data?.data?.users?.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <div className="min-w-[1000px] lg:min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          User
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Email
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Phone
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Role
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="whitespace-nowrap">KYC</TableHead>
                        <TableHead className="whitespace-nowrap">
                          Coins
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Joined
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data?.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {user.firstName?.[0]}
                                  {user.lastName?.[0]}
                                </span>
                              </div>
                              <span>
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {user.email}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {user.phone || "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getRoleBadge(user.roles)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(user.isActive)}
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={() => handleToggleStatus(user)}
                                disabled={isUpdatingStatus}
                                className="data-[state=checked]:bg-green-500"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {user.isKYCVerified ? (
                              <Badge className="bg-green-500">Verified</Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono">
                            {user.coins}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {data?.data?.pagination && data.data.pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 sm:px-0">
                  <div className="flex items-center gap-2 order-2 sm:order-1">
                    <p className="text-sm text-muted-foreground">
                      Showing {(data.data.pagination.page - 1) * limit + 1} to{" "}
                      {Math.min(
                        data.data.pagination.page * limit,
                        data.data.pagination.total,
                      )}{" "}
                      of {data.data.pagination.total} entries
                    </p>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(parseInt(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.data.pagination.pages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user{" "}
              <span className="font-medium">
                {userToDelete?.firstName} {userToDelete?.lastName}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
