"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AdminLoginProps {
  message?: string;
}

export function AdminLogin({ message }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Show success message if present
  const [successMessage, setSuccessMessage] = useState<string | null>(
    message || null
  );

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear success message

    try {
      const supabase = createClient();

      console.log("Attempting login with:", email);

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        console.error("Sign in error:", signInError);
        console.error("Error details:", {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name,
        });
        throw signInError;
      }

      console.log("Login successful, user:", data.user?.id);
      console.log("User email confirmed:", data.user?.email_confirmed_at);

      if (!data.user) {
        throw new Error("Login succeeded but no user data received");
      }

      // Verify session was established and wait for cookies to be set
      let session = null;
      let retries = 0;
      while (!session && retries < 5) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        session = currentSession;
        retries++;
        console.log(`Session check attempt ${retries}:`, !!session);
      }

      if (!session) {
        console.error("Session not established after login");
        throw new Error(
          "Session not established after login. Please try again."
        );
      }

      console.log("Session confirmed, user ID:", session.user?.id);

      // Verify session one more time and ensure it persists
      const {
        data: { user: verifiedUser },
      } = await supabase.auth.getUser();
      if (!verifiedUser) {
        throw new Error("Session verification failed");
      }
      console.log("User verified:", verifiedUser.id);

      // Check if cookies are set and log them for debugging
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const supabaseCookies = cookies.filter((c) => c.startsWith("sb-"));
      console.log("Supabase cookies found:", supabaseCookies.length);
      supabaseCookies.forEach((cookie) => {
        const [name] = cookie.split("=");
        console.log("Cookie:", name);
      });

      // Wait longer to ensure cookies are fully persisted
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Double-check session is still there
      const {
        data: { session: finalSession },
      } = await supabase.auth.getSession();
      if (!finalSession) {
        throw new Error("Session lost before redirect");
      }
      console.log("Final session check passed, verifying with server...");

      // Force a session refresh to ensure cookies are properly set
      await supabase.auth.refreshSession();
      console.log("Session refreshed");

      // Wait a bit more to ensure cookies are synced
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Test if server can see the session by making a fetch request
      let serverVerified = false;
      let verifyRetries = 0;

      while (!serverVerified && verifyRetries < 3) {
        try {
          const verifyResponse = await fetch("/api/auth/verify", {
            method: "GET",
            credentials: "include", // Important: include cookies
            cache: "no-store", // Ensure fresh request
          });

          const verifyData = await verifyResponse.json();
          console.log(
            `Server verification attempt ${verifyRetries + 1}:`,
            verifyData
          );

          if (verifyData.authenticated) {
            serverVerified = true;
            console.log("Server confirmed session, redirecting...");
            break;
          } else {
            console.warn("Server verification failed, retrying...");
            await new Promise((resolve) => setTimeout(resolve, 500));
            verifyRetries++;
          }
        } catch (verifyError: any) {
          console.error("Verification request failed:", verifyError);
          await new Promise((resolve) => setTimeout(resolve, 500));
          verifyRetries++;
        }
      }

      if (serverVerified) {
        // Use window.location.replace to ensure a full page load with cookies
        window.location.replace("/admin");
      } else {
        console.error("Server could not verify session after retries");
        // Still try to redirect - the middleware might handle it
        console.log(
          "Attempting redirect anyway - middleware should handle session refresh..."
        );
        window.location.replace("/admin");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Provide more helpful error messages
      if (
        err.message?.includes("Invalid login credentials") ||
        err.message?.includes("Invalid")
      ) {
        setError(
          "Invalid email or password. Please check your credentials or sign up if you don't have an account."
        );
      } else if (err.message?.includes("Email not confirmed")) {
        setError(
          "Please check your email and confirm your account before signing in."
        );
      } else {
        setError(err.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8"
    >
      <h1 className="text-3xl font-bold mb-2 text-center">Admin Login</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Sign in to manage your bookings
      </p>

      {successMessage && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">
            Or
          </span>
        </div>
      </div>

      <Button
        onClick={handleGoogleLogin}
        disabled={loading}
        variant="outline"
        className="w-full"
        size="lg"
      >
        Sign in with Google
      </Button>

      <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-6">
        Don&apos;t have an account?{" "}
        <a href="/admin/signup" className="text-amber-500 hover:text-amber-600">
          Sign up
        </a>
      </p>
    </motion.div>
  );
}
