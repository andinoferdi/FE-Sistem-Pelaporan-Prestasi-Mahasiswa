"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ username, password });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa username dan password Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME || "SPPM"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Masuk untuk mengelola prestasi mahasiswa
          </p>
        </div>

        <Card variant="glass" className="border-border/50">
          <CardHeader padding="default">
            <h2 className="text-xl font-semibold text-card-foreground">
              Selamat Datang
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan kredensial Anda untuk melanjutkan
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent padding="default" className="space-y-5">
              {error && (
                <Alert variant="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <Input
                label="Username atau Email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Masukkan username atau email"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Masukkan password"
              />
            </CardContent>

            <CardFooter padding="default">
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground cursor-pointer disabled:cursor-not-allowed"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                ) : (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                Masuk ke Akun
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Kredensial Demo
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Username:{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary">
                  admin
                </code>{" "}
                / Password:{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary">
                  12345678
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
