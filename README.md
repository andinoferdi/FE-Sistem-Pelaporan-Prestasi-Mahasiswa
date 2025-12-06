# Sistem Pelaporan Prestasi Mahasiswa - Frontend

**Nama:** Andino Ferdiansah  
**NIM:** 434231065  
**Kelas:** C4

## Deskripsi

Frontend untuk Sistem Pelaporan Prestasi Mahasiswa yang dibangun dengan Next.js. Aplikasi ini memungkinkan mahasiswa untuk melaporkan prestasi mereka, dosen wali untuk memverifikasi, dan admin untuk mengelola sistem.

## Fitur Utama

- **Autentikasi**
  - Login dengan username atau email
  - Auto-refresh token
  - Server instance checking untuk deteksi restart server
  - Protected routes

- **Manajemen Prestasi**
  - Daftar prestasi
  - Buat prestasi baru
  - Edit prestasi
  - Detail prestasi
  - Submit prestasi
  - Hapus prestasi
  - Upload file attachment

- **UI/UX**
  - Responsive design
  - Modern UI dengan Tailwind CSS
  - Loading states
  - Error handling

## Teknologi yang Digunakan

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **State Management:** React Context API
- **Fonts:** Poppins, JetBrains Mono

## Prerequisites

- Node.js 18+ atau lebih tinggi
- npm, yarn, pnpm, atau bun
- Backend API sudah berjalan (lihat README backend)

## Setup & Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/andinoferdi/Sistem-Pelaporan-Prestasi-Mahasiswa.git
cd Sistem-Pelaporan-Prestasi-Mahasiswa/FE-Sistem-Pelaporan-Prestasi-Mahasiswa
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Sistem Pelaporan Prestasi Mahasiswa
```

**Catatan:** Pastikan backend API sudah berjalan di `http://localhost:3001` atau sesuaikan dengan URL backend Anda.

## Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Build untuk Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Struktur Proyek

```
FE-Sistem-Pelaporan-Prestasi-Mahasiswa/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── achievements/       # Halaman prestasi
│   │   │   ├── [id]/          # Detail & edit prestasi
│   │   │   ├── create/        # Buat prestasi baru
│   │   │   └── page.tsx       # Daftar prestasi
│   │   ├── login/             # Halaman login
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── blocks/                # Komponen halaman
│   │   ├── achievements/      # Komponen prestasi
│   │   └── home/              # Komponen home
│   ├── components/            # Komponen reusable
│   │   ├── ui/               # UI components (button, card, dll)
│   │   ├── navbar.tsx        # Navigation bar
│   │   ├── footer.tsx        # Footer
│   │   └── layout-wrapper.tsx # Layout wrapper
│   ├── services/             # API service layer
│   │   ├── auth.ts           # Auth service
│   │   └── achievement.ts    # Achievement service
│   ├── stores/               # State management
│   │   └── auth.tsx          # Auth context
│   ├── types/                # TypeScript types
│   │   ├── api.ts            # API types
│   │   ├── auth.ts           # Auth types
│   │   ├── achievement.ts    # Achievement types
│   │   └── user.ts           # User types
│   └── lib/                  # Utilities
│       ├── api.ts            # API client dengan auto-refresh
│       └── utils.ts         # Helper functions
├── public/                   # Static files
├── next.config.ts            # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies
```

## Fitur Autentikasi

### Auto-Refresh Token

Aplikasi secara otomatis akan refresh token ketika mendapat response 401. Token disimpan di `localStorage`.

### Server Instance Checking

Aplikasi akan mengecek server instance ID saat:
- Login
- Mount aplikasi (jika user sudah login)
- Health check

Jika server instance berbeda, user akan otomatis di-logout dan diarahkan ke halaman login.

### Protected Routes

Semua halaman kecuali login memerlukan autentikasi. Jika user belum login, akan diarahkan ke halaman login.

## Halaman yang Tersedia

- `/` - Home page
- `/login` - Halaman login
- `/achievements` - Daftar prestasi
- `/achievements/create` - Buat prestasi baru
- `/achievements/[id]` - Detail prestasi
- `/achievements/[id]/edit` - Edit prestasi

## Sample Data untuk Testing

Gunakan kredensial berikut untuk login:

**Admin:**
- Username: `admin` atau `admin@gmail.com`
- Password: `12345678`

**Dosen:**
- Username: `dosen1` atau `dosen1@gmail.com`
- Password: `12345678`

**Mahasiswa:**
- Username: `mahasiswa1` atau `mahasiswa1@gmail.com`
- Password: `12345678`

## Development

### Path Aliases

Proyek menggunakan path aliases untuk import yang lebih mudah:

```typescript
import { api } from "@/lib/api"
import { AuthProvider } from "@/stores/auth"
import { Button } from "@/components/ui/button"
```

### API Client

API client sudah dikonfigurasi dengan:
- Auto-refresh token
- Error handling
- Server instance checking
- TypeScript types

Contoh penggunaan:

```typescript
import { api } from "@/lib/api"

// GET request
const response = await api.get<Achievement[]>("/api/v1/achievements")

// POST request
const response = await api.post("/api/v1/achievements", data)

// Upload file
const formData = new FormData()
formData.append("file", file)
const response = await api.upload("/api/v1/achievements/upload", formData)
```

### State Management

Aplikasi menggunakan React Context API untuk state management:

```typescript
import { useAuth } from "@/stores/auth"

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // Gunakan state dan functions
}
```

## Build & Deploy

### Build untuk Production

```bash
npm run build
```

Build output akan berada di folder `.next`

### Deploy ke Vercel

Cara termudah untuk deploy adalah menggunakan Vercel:

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

Atau menggunakan Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | URL backend API | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_NAME` | Nama aplikasi | `Sistem Pelaporan Prestasi Mahasiswa` |

## Troubleshooting

### Error: Cannot connect to API

Pastikan:
1. Backend API sudah berjalan
2. `NEXT_PUBLIC_API_BASE_URL` sudah benar
3. CORS sudah dikonfigurasi di backend

### Error: Token expired

Aplikasi akan otomatis refresh token. Jika masih error, coba logout dan login lagi.

### Error: Server instance mismatch

Ini berarti server backend sudah restart. Logout dan login lagi untuk mendapatkan instance ID baru.

## License

Proyek ini dibuat untuk keperluan akademik.

## Author

**Andino Ferdiansah**  
NIM: 434231065  
Kelas: C4
