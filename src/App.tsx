import { useEffect } from "react";
import { useGameStore, hydrateFromStorage } from "@/store/gameStore";
import SetupPage from "@/pages/SetupPage";
import GamePage from "@/pages/GamePage";

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const hydrated = useGameStore((s) => s.hydrated);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  // 居中「手机框」：桌面端限制宽度，移动端全屏
  return (
    <div className="min-h-full w-full flex items-stretch justify-center bg-app">
      <div className="w-full max-w-[480px] min-h-screen bg-base relative shadow-frame">
        {!hydrated ? (
          <div className="flex h-screen items-center justify-center text-ink-mute text-sm">
            加载中…
          </div>
        ) : phase === "playing" ? (
          <GamePage />
        ) : (
          <SetupPage />
        )}
      </div>
    </div>
  );
}
