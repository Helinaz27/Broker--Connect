import AuthPageShell from "@/components/auth/AuthPageShell";
import Login from "@/components/auth/login";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)]" />
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
        <div className="w-full max-w-[460px] animate-fade-in">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-black/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />
            
            <div className="mb-10 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight italic mb-2">Sign in.</h1>
              <p className="text-sm text-muted-foreground font-medium">Access your professional broker console.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium placeholder:text-muted-foreground/50 ${
                    errors.email ? "border-destructive" : "border-border/60"
                  }`}
                />
                {errors.email && (
                  <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Secure Password
                  </label>
                  <Link href="/forgotten-password" university-link="true" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                    Reset?
                  </Link>
                </div>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium placeholder:text-muted-foreground/50 ${
                    errors.password ? "border-destructive" : "border-border/60"
                  }`}
                />
                {errors.password && (
                  <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-5 h-5 border-border/60 rounded-lg text-primary focus:ring-primary transition-all cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-[11px] text-muted-foreground font-black uppercase tracking-widest cursor-pointer select-none">
                  Remember this device
                </label>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Authorize Access
              </Button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/50 backdrop-blur-xl px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Legacy OAuth</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="h-12 w-full text-xs font-bold gap-3 rounded-xl border-border/60 hover:bg-muted/50 transition-all">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-10 font-bold uppercase tracking-widest">
              New to the platform?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 transition-colors ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <Chat />
    </div>
  );
}
