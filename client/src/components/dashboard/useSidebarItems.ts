import {
  Home,
  Car,
  Wrench,
  ShieldCheck,
  Users,
  DollarSign,
} from "lucide-react";

export const useMenuItems = () => [
  {
    id: "houses",
    label: "Houses",
    icon: Home,
    post: "house_post",
    view: "house_view",
    href: "/dashboard",
    color: "text-primary",
  },
  {
    id: "cars",
    label: "Cars",
    icon: Car,
    post: "car_post",
    view: "car_view",
    href: "/dashboard",
    color: "text-blue-500",
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench,
    post: "service_post",
    view: "service_view",
    href: "/dashboard",
    color: "text-emerald-500",
  },
];

export const useAdminItems = () => [
  {
    id: "admin_fees",
    label: "Platform Fees",
    icon: DollarSign,
    href: "/dashboard/fees",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    id: "admin_kyc",
    label: "KYC Requests",
    icon: ShieldCheck,
    href: "/dashboard/kyc",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "admin_users",
    label: "User Directory",
    icon: Users,
    href: "/dashboard/users",
    color: "bg-primary/10 text-primary",
  },
];
