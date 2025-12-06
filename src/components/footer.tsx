"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { footerMenu } from "@/stores/footer-menu";
import {
  UIFooter,
  UIFooterContainer,
  UIFooterLink,
  UIFooterSection,
} from "@/components/ui/ui-footer";

type SocialItem = { label: string; href: string; svgPath: string };

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "SPPM";
  const appRightLabel =
    process.env.NEXT_PUBLIC_APP_FOOTER_RIGHT_LABEL ||
    "Sistem Pelaporan Prestasi Mahasiswa";

  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "";
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "";

  const socialItems = useMemo<SocialItem[]>(() => {
    const items: SocialItem[] = [];

    if (githubUrl) {
      items.push({
        label: "GitHub",
        href: githubUrl,
        svgPath:
          "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
      });
    }

    if (websiteUrl) {
      items.push({
        label: "Website",
        href: websiteUrl,
        svgPath:
          "M12 2a10 10 0 100 20 10 10 0 000-20Zm7.93 9h-3.11a15.6 15.6 0 00-1.6-6.02A8.03 8.03 0 0119.93 11ZM12 4c.93 1.12 1.9 3.4 2.25 7H9.75C10.1 7.4 11.07 5.12 12 4Zm-3.22.98A15.6 15.6 0 007.18 11H4.07a8.03 8.03 0 014.71-6.02ZM4.07 13h3.11c.2 2.18.73 4.25 1.6 6.02A8.03 8.03 0 014.07 13Zm5.68 0h4.5c-.35 3.6-1.32 5.88-2.25 7-.93-1.12-1.9-3.4-2.25-7Zm5.47 6.02c.87-1.77 1.4-3.84 1.6-6.02h3.11a8.03 8.03 0 01-4.71 6.02Z",
      });
    }

    return items;
  }, [githubUrl, websiteUrl]);

  return (
    <UIFooter>
      <UIFooterContainer size="wide" className="py-14 sm:py-16">
        {/* Top border - shortened */}
        <div className="max-w-6xl mx-auto mb-8 border-t border-border/60" />
        {/* Main content - constrained to same width as border */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Brand */}
            <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden relative bg-transparent">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground leading-tight">
                  {appName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pelaporan & verifikasi prestasi mahasiswa
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
              Sistem untuk mengelola, menyimpan, dan mengajukan prestasi mahasiswa
              agar proses verifikasi lebih rapi dan mudah ditelusuri.
            </p>
            {socialItems.length ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Temukan Kami
                </p>
                <div className="flex items-center gap-3">
                  {socialItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      tabIndex={0}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={item.svgPath} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {footerMenu.map((section) => (
                <UIFooterSection key={section.title} title={section.title}>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <UIFooterLink href={item.href} external={false}>
                          {item.label}
                        </UIFooterLink>
                      </li>
                    ))}
                  </ul>
                </UIFooterSection>
              ))}

              <UIFooterSection title="Akses Sistem">
                <ul className="space-y-3">
                  <li>
                    <UIFooterLink href="/login" ariaLabel="Login ke sistem">
                      Login
                    </UIFooterLink>
                  </li>
                  <li>
                    <UIFooterLink
                      href="/achievements"
                      ariaLabel="Buka halaman prestasi"
                    >
                      Prestasi Saya
                    </UIFooterLink>
                  </li>
                  <li>
                    <UIFooterLink
                      href="/achievements/create"
                      ariaLabel="Tambah prestasi baru"
                    >
                      Tambah Prestasi
                    </UIFooterLink>
                  </li>
                </ul>
              </UIFooterSection>
            </div>
          </div>
        </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12">
          {/* Bottom border - shortened, same length as top */}
          <div className="max-w-6xl mx-auto border-t border-border/60" />
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                © {currentYear} {appName}. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">{appRightLabel}</p>
            </div>
            <p className="mt-6 text-xs text-muted-foreground/80 leading-relaxed">
              Data prestasi yang kamu input dapat diproses untuk keperluan verifikasi
              internal. Pastikan informasi dan bukti yang diunggah valid karena dapat
              diminta klarifikasi oleh pihak verifikator.
            </p>
          </div>
        </div>
      </UIFooterContainer>
    </UIFooter>
  );
}
