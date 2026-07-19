import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800">우리 반 체크리스트</h1>
        <p className="text-slate-500">숙제, 옷, 준비물을 한눈에 확인해요</p>

        <div className="space-y-3 pt-6">
          <Link
            href="/create-room"
            className="block w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow"
          >
            반 만들기 (반장)
          </Link>
          <Link
            href="/login"
            className="block w-full rounded-xl bg-white border border-slate-200 py-3 text-slate-700 font-semibold shadow-sm"
          >
            로그인
          </Link>
        </div>
      </div>
    </main>
  )
}
