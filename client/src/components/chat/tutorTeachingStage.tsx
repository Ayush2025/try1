import { useEffect, useMemo, useState } from "react";

interface TutorTeachingStageProps {
  tutorName: string;
  subject?: string | null;
  modelEmbedUrl?: string | null;
  boardTheme?: "black" | "green";
  language?: string;
  isSpeaking?: boolean;
  latestTutorText?: string;
}

function normalizeEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Convert standard Sketchfab model page URL to embed URL.
  const sketchfabModelMatch = trimmed.match(/sketchfab\.com\/3d-models\/([a-zA-Z0-9-]+)/);
  if (sketchfabModelMatch) {
    return `https://sketchfab.com/models/${sketchfabModelMatch[1]}/embed?autostart=1&ui_infos=0&ui_controls=0&ui_stop=0&ui_watermark=0&ui_help=0`;
  }

  return trimmed;
}

export function TutorTeachingStage({
  tutorName,
  subject,
  modelEmbedUrl,
  boardTheme = "green",
  language = "English",
  isSpeaking = false,
  latestTutorText = "",
}: TutorTeachingStageProps) {
  const [writtenText, setWrittenText] = useState("");
  const normalizedEmbed = useMemo(
    () => (modelEmbedUrl ? normalizeEmbedUrl(modelEmbedUrl) : ""),
    [modelEmbedUrl],
  );

  useEffect(() => {
    const text = (latestTutorText || "").trim();
    if (!text) {
      setWrittenText("");
      return;
    }

    let cursor = 0;
    setWrittenText("");
    const timer = window.setInterval(() => {
      cursor += 4;
      setWrittenText(text.slice(0, cursor));
      if (cursor >= text.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [latestTutorText]);

  const boardClass =
    boardTheme === "black"
      ? "bg-[#1b1f22] border-[#31363b]"
      : "bg-[#1d3d2e] border-[#3d6651]";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950">
      <div className="px-4 py-2 bg-slate-900 text-slate-100 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {tutorName} Classroom Stage
          {subject ? ` · ${subject}` : ""}
        </div>
        <div className="text-xs opacity-80">
          {language} {isSpeaking ? "· Speaking" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[280px]">
        {/* Chalkboard area */}
        <div className={`relative p-4 md:p-5 border-r border-slate-800 ${boardClass}`}>
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="text-xs uppercase tracking-wider text-emerald-100/90 mb-3">
              Board Notes
            </div>
            <div className="text-[15px] leading-7 text-emerald-50 whitespace-pre-wrap break-words font-mono min-h-[200px]">
              {writtenText || "Ask a question to see the tutor write on the board..."}
            </div>
          </div>
        </div>

        {/* 3D tutor stage (waist-up crop) */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {normalizedEmbed ? (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={normalizedEmbed}
                title={`${tutorName} 3D tutor`}
                className="absolute inset-0 w-[130%] h-[135%] -left-[12%] -top-[10%] border-0"
                allow="autoplay; microphone; camera; xr-spatial-tracking"
              />
              {/* Classroom mask: keep focus on upper body/hand-board zone */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-300">
              <div>
                <div className="text-sm font-medium mb-2">3D Tutor Not Configured</div>
                <div className="text-xs opacity-80">
                  Add a platform-generated 3D tutor embed URL while creating this tutor
                  (HeyGen / Sketchfab / D-ID embed links supported).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
