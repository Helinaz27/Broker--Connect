"use client";

import { useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProfileQuery } from "@/store/apis/userApi";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.user.token);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated,
  );

  const { data, isLoading, isError, refetch } = useGetProfileQuery(undefined);

  useEffect(() => {
    if (token && isAuthenticated && !isLoading && !isError) {
      refetch();
    }
  }, [token, isAuthenticated, refetch, isLoading, isError]);

  useEffect(() => {
    if (data?.data?.user) {
      dispatch(
        setUser({
          user: data.data.user,
          token: token || "",
        }),
      );
    }
  }, [data, dispatch, token]);

  useEffect(() => {
    if (isError && token) {
      dispatch(clearUser());
    }
  }, [isError, token, dispatch]);

  if (isLoading && token && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
