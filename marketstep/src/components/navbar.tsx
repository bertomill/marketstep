'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 px-2 py-1">MarketStep</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard" passHref>
                  <Button variant="ghost" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">Dashboard</Button>
                </Link>
                <Link href="/profile" passHref>
                  <Button variant="ghost" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">Profile</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Logout
                </Button>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-2">
                  {user.email}
                </span>
              </>
            ) : (
              <>
                <Link href="/auth/login" passHref>
                  <Button variant="ghost" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">Login</Button>
                </Link>
                <Link href="/auth/signup" passHref>
                  <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 