import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-magenta)] via-[var(--accent-violet)] to-[var(--accent-cyan)]">
            เช็คลิสต์ห้องเรียนของเรา
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            เช็คการบ้าน ชุดที่ต้องใส่ และอุปกรณ์ได้ในที่เดียว
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/create-room"
            className="btn-neon block w-full py-3.5"
          >
            สร้างห้องเรียน (หัวหน้าห้อง)
          </Link>
          <Link
            href="/login"
            className="btn-ghost block w-full py-3.5 font-semibold"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  )
}
