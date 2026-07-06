import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { LogLevel, SimliClient } from "simli-client/dist/client.js";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AvatarLanguage = "en" | "hi";
type InteractionMode = "text" | "voice";

type GenerateReplyResponse = { replyText: string };
type SimliTokenResponse = { token: string };

interface TeacherAvatarProps {
  faceId?: string;
  tutorId?: number;
  language?: AvatarLanguage;
  lessonContext?: string;
  idleTimeoutSeconds?: number;
  className?: string;
}

export interface TeacherAvatarRef {
  speakText: (text: string, isRawStudentInput?: boolean) => Promise<void>;
}

type RecognitionLike = SpeechRecognition & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};

export const TeacherAvatar = forwardRef<TeacherAvatarRef, TeacherAvatarProps>(
  function TeacherAvatar(
    {
      faceId,
      tutorId,
      language = "en",
      lessonContext = "",
      idleTimeoutSeconds = 120,
      className,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const simliRef = useRef<SimliClient | null>(null);
    const recognitionRef = useRef<RecognitionLike | null>(null);
    const idleTimerRef = useRef<number | null>(null);
    const modeRef = useRef<InteractionMode>("text");
    const speakingRef = useRef(false);
    const listeningRef = useRef(false);

    const [mode, setMode] = useState<InteractionMode>("text");
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [textQuestion, setTextQuestion] = useState("");
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [boardText, setBoardText] = useState("");
    const [latestQuestion, setLatestQuestion] = useState("");

    useEffect(() => {
      modeRef.current = mode;
    }, [mode]);

    const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        void simliRef.current?.stop();
        simliRef.current = null;
        setStatus("disconnected");
      }, Math.max(30, idleTimeoutSeconds) * 1000);
    }, [idleTimeoutSeconds]);

    const stopRecognition = useCallback(() => {
      const rec = recognitionRef.current;
      if (!rec) return;
      try {
        rec.stop();
      } catch (_error) {
        // no-op
      }
      setIsListening(false);
      listeningRef.current = false;
    }, []);

    const startRecognition = useCallback(() => {
      const rec = recognitionRef.current;
      if (!rec || speakingRef.current) return;
      try {
        rec.start();
        setIsListening(true);
        listeningRef.current = true;
      } catch (_error) {
        // no-op
      }
    }, []);

    const closeSimli = useCallback(async () => {
      stopRecognition();
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      const client = simliRef.current;
      simliRef.current = null;
      if (client) {
        try {
          await client.stop();
        } catch (error) {
          console.warn("Simli stop warning:", error);
        }
      }
      setStatus("disconnected");
    }, [stopRecognition]);

    const feedAudioToSimli = useCallback(async (audioBlob: Blob) => {
      const client = simliRef.current;
      if (!client) throw new Error("Simli session is not connected");

      const blobUrl = URL.createObjectURL(audioBlob);
      try {
        const ttsAudio = new Audio(blobUrl);
        ttsAudio.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          ttsAudio.onloadedmetadata = () => resolve();
          ttsAudio.onerror = () => reject(new Error("Unable to load TTS audio"));
        });
        const stream = ttsAudio.captureStream?.();
        const track = stream?.getAudioTracks?.()[0];
        if (!track) {
          throw new Error("Unable to capture audio track from TTS response");
        }
        client.listenToMediastreamTrack(track);
        await ttsAudio.play();
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    }, []);

    const speakText = useCallback(
      async (text: string, isRawStudentInput = true) => {
        const input = text.trim();
        if (!input) return;
        if (!simliRef.current) {
          setErrorMessage("Avatar is not connected.");
          return;
        }

        setIsBusy(true);
        setErrorMessage("");
        resetIdleTimer();

        try {
          let replyText = input;
          if (isRawStudentInput) {
            const replyRes = await apiRequest("POST", "/api/generate-reply", {
              studentText: input,
              lessonContext,
              tutorId,
              language: language === "hi" ? "Hindi" : "English",
            });
            const replyPayload = (await replyRes.json()) as GenerateReplyResponse;
            replyText = String(replyPayload.replyText || "").trim();
            if (!replyText) {
              throw new Error("Reply generation returned empty text");
            }
            setLatestQuestion(input);
          }

          setBoardText(replyText);

          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: replyText }),
          });
          if (!ttsRes.ok) {
            const msg = await ttsRes.text();
            throw new Error(`TTS failed: ${msg}`);
          }
          const ttsBlob = await ttsRes.blob();
          await feedAudioToSimli(ttsBlob);
        } catch (error: any) {
          console.error("speakText failed:", error);
          setErrorMessage(String(error?.message || "Failed to speak response"));
        } finally {
          setIsBusy(false);
        }
      },
      [feedAudioToSimli, language, lessonContext, resetIdleTimer, tutorId],
    );

    useImperativeHandle(ref, () => ({ speakText }), [speakText]);

    const initSpeechRecognition = useCallback(() => {
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) return;

      const rec: RecognitionLike = new SpeechRecognitionCtor();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === "hi" ? "hi-IN" : "en-US";

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        setVoiceTranscript((finalText || interim).trim());
        if (finalText.trim()) {
          void speakText(finalText.trim(), true);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied. Please allow microphone access.");
        } else {
          setErrorMessage(`Voice recognition error: ${event.error || "unknown"}`);
        }
        setIsListening(false);
        listeningRef.current = false;
      };

      rec.onend = () => {
        setIsListening(false);
        listeningRef.current = false;
        if (modeRef.current === "voice" && !speakingRef.current) {
          // Stay in voice mode by restarting recognizer.
          window.setTimeout(() => startRecognition(), 250);
        }
      };

      recognitionRef.current = rec;
    }, [language, speakText, startRecognition]);

    const startSimli = useCallback(async () => {
      if (simliRef.current || !videoRef.current || !audioRef.current) return;

      try {
        setStatus("connecting");
        setErrorMessage("");

        const tokenRes = await apiRequest("POST", "/api/get-simli-token", {
          faceId,
        });
        const tokenPayload = (await tokenRes.json()) as SimliTokenResponse;
        if (!tokenPayload.token) {
          throw new Error("Could not obtain Simli session token");
        }

        const simli = new SimliClient(
          tokenPayload.token,
          videoRef.current,
          audioRef.current,
          null,
          LogLevel.warn,
          "livekit",
          "websockets",
        );

        simli.on("start", () => {
          setStatus("connected");
          setErrorMessage("");
          resetIdleTimer();
        });
        simli.on("stop", () => {
          setStatus("disconnected");
        });
        simli.on("speaking", () => {
          speakingRef.current = true;
          setIsAvatarSpeaking(true);
          if (listeningRef.current) {
            stopRecognition();
          }
        });
        simli.on("silent", () => {
          speakingRef.current = false;
          setIsAvatarSpeaking(false);
          if (modeRef.current === "voice") {
            startRecognition();
          }
        });
        simli.on("startup_error", (message: string) => {
          setErrorMessage(
            `Avatar startup error: ${message}. Check Face ID validity and Simli minutes balance.`,
          );
        });
        simli.on("error", (message: string) => {
          setErrorMessage(`Simli error: ${message}`);
        });
        (simli as any).on?.("connected", () => setStatus("connected"));
        (simli as any).on?.("disconnected", () => setStatus("disconnected"));
        (simli as any).on?.("failed", (message: string) =>
          setErrorMessage(`WebRTC connection failed: ${message || "unknown error"}`),
        );

        simliRef.current = simli;
        await simli.start();
      } catch (error: any) {
        console.error("Failed to start Simli:", error);
        setStatus("disconnected");
        setErrorMessage(String(error?.message || "Failed to initialize Simli avatar session"));
      }
    }, [faceId, resetIdleTimer, startRecognition, stopRecognition]);

    useEffect(() => {
      initSpeechRecognition();
      void startSimli();
      return () => {
        void closeSimli();
      };
      // run once on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className={`h-full flex flex-col gap-3 p-3 md:p-4 border rounded-xl bg-card ${className || ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            <h3 className="text-lg font-semibold">AI Teacher Avatar</h3>
            <p className="text-sm text-muted-foreground">
              Language: {language === "hi" ? "Hindi" : "English"} · State: {status.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>
              Text mode
            </Button>
            <Button variant={mode === "voice" ? "default" : "outline"} onClick={() => setMode("voice")}>
              Voice chat mode
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                simliRef.current?.ClearBuffer?.();
              }}
            >
              Skip
            </Button>
          </div>
        </div>

        {status === "connecting" && (
          <div className="text-sm rounded-md border border-blue-300 bg-blue-50 text-blue-700 px-3 py-2">
            Connecting...
          </div>
        )}
        {errorMessage && (
          <div className="text-sm rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
          <div className="relative w-full h-56 md:h-72 overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <audio ref={audioRef} autoPlay />
            <div className="absolute top-2 left-2 flex gap-2">
              {isAvatarSpeaking && (
                <span className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">Avatar speaking</span>
              )}
              {isListening && (
                <span className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Listening to you</span>
              )}
            </div>
          </div>
          <div className="h-56 md:h-72 rounded-lg border border-[#3d6651] bg-[#1d3d2e] text-emerald-50 p-3 overflow-y-auto">
            <div className="text-xs uppercase tracking-wider opacity-90 mb-2">Board Notes</div>
            <div className="whitespace-pre-wrap text-sm leading-6">
              {boardText || "Ask a question and the tutor answer appears here on the board."}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 rounded-lg border bg-background/70 flex flex-col overflow-hidden">
          <div className="border-t p-3 space-y-2">
            {latestQuestion && (
              <div className="text-xs text-muted-foreground">
                Latest question: <span className="font-medium">{latestQuestion}</span>
              </div>
            )}

            {mode === "text" ? (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!textQuestion.trim() || isBusy || status !== "connected") return;
                  void speakText(textQuestion, true);
                  setTextQuestion("");
                }}
              >
                <Textarea
                  placeholder="Ask the teacher in text mode..."
                  value={textQuestion}
                  onChange={(event) => setTextQuestion(event.target.value)}
                  className="min-h-[72px]"
                />
                <Button type="submit" disabled={!textQuestion.trim() || isBusy || status !== "connected"}>
                  {isBusy ? "Working..." : "Ask the teacher"}
                </Button>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {!isListening ? (
                    <Button
                      onClick={() => {
                        setVoiceTranscript("");
                        startRecognition();
                      }}
                      disabled={status !== "connected"}
                    >
                      Start talking
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopRecognition}>
                      Stop talking
                    </Button>
                  )}
                </div>
                <Input readOnly value={voiceTranscript} placeholder="Your transcript appears here..." />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
