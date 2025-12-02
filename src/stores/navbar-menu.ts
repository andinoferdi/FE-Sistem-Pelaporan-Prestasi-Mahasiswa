export interface NavbarMenuItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
  roles?: string[];
}

export const navbarMenu: NavbarMenuItem[] = [
  {
    label: "Beranda",
    href: "/",
    requiresAuth: false,
  },
  {
    label: "Prestasi",
    href: "/achievements",
    requiresAuth: true,
  },
  {
    label: "Laporan",
    href: "/reports",
    requiresAuth: true,
    roles: ["Admin", "Dosen Wali"],
  },
  {
    label: "Pengguna",
    href: "/users",
    requiresAuth: true,
    roles: ["Admin"],
  },
];

