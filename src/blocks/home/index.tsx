"use client";

import { useAuth } from "@/stores/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary" />
          </div>
          <p className="mt-6 text-muted-foreground font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="text-center max-w-3xl mx-auto px-4 relative z-10">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-purple-600 shadow-2xl shadow-primary/30 mb-8">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>

          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
            Sistem Pelaporan Prestasi
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
            Selamat Datang di{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-400">
              {process.env.NEXT_PUBLIC_APP_NAME || "SPPM"}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
            Platform modern untuk mengelola dan melaporkan prestasi mahasiswa
            dengan mudah, cepat, dan terorganisir.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                className="bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25"
                size="lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Masuk ke Sistem
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Pelajari Lebih Lanjut
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Verifikasi Cepat",
                desc: "Proses verifikasi prestasi yang efisien",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Laporan Lengkap",
                desc: "Analisis dan pelaporan komprehensif",
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Keamanan Data",
                desc: "Perlindungan data yang terjamin",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-purple-600/20 flex items-center justify-center border border-primary/20">
              <span className="text-xl font-bold text-primary">
                {(user?.fullName || user?.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Selamat Datang, {user?.fullName || user?.username}!
              </h1>
              <p className="text-muted-foreground">
                Kelola dan laporkan prestasi Anda dengan mudah.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Account Info Card */}
          <Card
            variant="glass"
            className="border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader padding="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Informasi Akun
                </h2>
              </div>
            </CardHeader>
            <CardContent padding="default" className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Username
                </p>
                <p className="font-medium text-foreground">{user?.username}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Nama Lengkap
                </p>
                <p className="font-medium text-foreground">{user?.fullName}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Role
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {user?.role}
                </Badge>
              </div>
              {user?.permissions && user.permissions.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map((perm) => (
                      <Badge
                        key={perm}
                        variant="outline"
                        className="border-border/50"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card
            variant="glass"
            className="border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader padding="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Prestasi
                </h2>
              </div>
            </CardHeader>
            <CardContent padding="default">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Kelola prestasi Anda, buat laporan baru, dan lihat status
                verifikasi.
              </p>
              <Link href="/achievements">
                <Button className="w-full bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Kelola Prestasi
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Reports Card */}
          <Card
            variant="glass"
            className="border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader padding="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Laporan
                </h2>
              </div>
            </CardHeader>
            <CardContent padding="default">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Lihat laporan prestasi mahasiswa dan lakukan verifikasi.
              </p>
              <Link href="/reports">
                <Button
                  variant="secondary"
                  className="w-full border-border/50 bg-card/50 hover:bg-card"
                >
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Lihat Laporan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
