import { LinkButton } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl">🎈</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">Asobou</h1>
          <p className="text-base leading-relaxed text-ink-soft">
            みんなの空きと、やりたいを合わせて、
            <br />
            次の遊びを決めよう。
          </p>
        </div>

        <LinkButton href="/create" className="text-lg">
          グループを作る
        </LinkButton>

        <ul className="flex flex-col gap-2 text-sm text-ink-soft">
          <li className="flex items-center justify-center gap-2">
            <span className="text-mint-600">✓</span>
            ログイン不要
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-mint-600">✓</span>
            リンクを友達に送るだけ
          </li>
        </ul>
      </div>
    </main>
  );
}
