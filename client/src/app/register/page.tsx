// "use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import Register from "@/components/auth/register";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <Register />
      </main>
      <Footer />
      <Chat />
    </div>
  );
}
