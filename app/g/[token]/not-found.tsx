import Link from "next/link";

export default function GroupNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">🔍</p>
      <h1 className="text-xl font-extrabold text-ink">このグループは見つかりません</h1>
      <p className="text-sm text-ink-soft">URLが正しいか、招待してくれた人に確認してみてください。</p>
      <Link href="/" className="text-sm font-bold text-brand-600 hover:underline">
        トップへ戻る
      </Link>
    </main>
  );
}
