export interface FooterMenuItem {
  label: string;
  href: string;
}

export interface FooterMenuSection {
  title: string;
  items: FooterMenuItem[];
}

export const footerMenu: FooterMenuSection[] = [
  {
    title: "Tentang",
    items: [
      {
        label: "Tentang Kami",
        href: "/about",
      },
      {
        label: "Kontak",
        href: "/contact",
      },
    ],
  },
  {
    title: "Bantuan",
    items: [
      {
        label: "FAQ",
        href: "/faq",
      },
      {
        label: "Panduan",
        href: "/guide",
      },
    ],
  },
  {
    title: "Legal",
    items: [
      {
        label: "Kebijakan Privasi",
        href: "/privacy",
      },
      {
        label: "Syarat & Ketentuan",
        href: "/terms",
      },
    ],
  },
];

