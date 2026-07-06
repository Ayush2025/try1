import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createClient, AnamEvent, type AnamClient, type Message } from "@anam-ai/js-sdk";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type InteractionMode = "text" | "voice";

type GenerateReplyRequestMessage = {
  role: "user" | "assistant" | "persona" | "system";
  content: string;
};

type GenerateReplyResponse = {
  replyText: string;
};

type SessionTokenResponse = {
  sessionToken: string;
};

interface TeacherAvatarProps {
  avatarId?: string;
  voiceId?: string;
  tutorId?: number;
  languageCode?: string;
  lessonContext?: string;
  systemPrompt?: string;
  idleTimeoutSeconds?: number;
  className?: string;
}

export interface TeacherAvatarRef {
  speakText: (text: string) => Promise<void>;
}

const splitIntoChunks = (text: string, maxChars = 180): string[] => {
  const cleaned = text.trim();
  if (!cleaned) return [];
  const chunks: string[] = [];
  let remaining = cleaned;
  while (remaining.length > maxChars) {
    const pivot = remaining.lastIndexOf(" ", maxChars);
    const cut = pivot > 40 ? pivot : maxChars;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
};

const normalizeAnamLanguageCode = (languageCode?: string) => {
  const normalized = String(languageCode || "").trim();
  if (!normalized) return undefined;
  if (/^en(-|_)?us$/i.test(normalized)) return "en";
  if (/^hi(-|_)?in$/i.test(normalized)) return "hi";
  return normalized;
};

const parseJsonResponse = async <T>(response: Response, endpoint: string): Promise<T> => {
  const bodyText = await response.text();
  let parsed: T | null = null;
  try {
    parsed = bodyText ? (JSON.parse(bodyText) as T) : null;
  } catch (_error) {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      (parsed as any)?.message ||
      (parsed as any)?.error ||
      bodyText ||
      `${endpoint} failed with status ${response.status}`;
    throw new Error(String(message));
  }

  if (!parsed) {
    const snippet = bodyText.slice(0, 140).replace(/\s+/g, " ");
    throw new Error(
      `${endpoint} returned non-JSON response. If you just pulled code changes, restart the backend server. Response starts with: ${snippet}`,
    );
  }

  return parsed;
};

const formatAnamErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  const anyError = error as any;
  const base =
    String(anyError?.details?.cause || anyError?.message || anyError?.cause || "").trim() || fallback;
  if (/concurrent session limit/i.test(base)) {
    return "Anam concurrent session limit reached. Disconnect other active sessions (or wait a minute) and try Connect again.";
  }
  return base;
};

export const TeacherAvatar = forwardRef<TeacherAvatarRef, TeacherAvatarProps>(function TeacherAvatar(
  {
    avatarId,
    voiceId,
    tutorId,
    languageCode = "en",
    lessonContext = "",
    systemPrompt = "",
    idleTimeoutSeconds = 120,
    className,
  },
  ref,
) {
  const videoElementId = useId().replace(/:/g, "_");
  const anamRef = useRef<AnamClient | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const listenerCleanupRef = useRef<Array<() => void>>([]);
  const lastHandledUserMessageIdRef = useRef<string>("");

  const [mode, setMode] = useState<InteractionMode>("text");
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMicPermissionPending, setIsMicPermissionPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [textQuestion, setTextQuestion] = useState("");
  const [boardText, setBoardText] = useState("");
  const [latestUserCaption, setLatestUserCaption] = useState("");
  const [latestPersonaCaption, setLatestPersonaCaption] = useState("");

  const clearListeners = useCallback(() => {
    for (const cleanup of listenerCleanupRef.current) cleanup();
    listenerCleanupRef.current = [];
  }, []);

  const stopStreaming = useCallback(async () => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    clearListeners();
    const client = anamRef.current;
    anamRef.current = null;
    lastHandledUserMessageIdRef.current = "";
    if (client) {
      try {
        await client.stopStreaming();
      } catch (error) {
        console.warn("Anam stopStreaming warning:", error);
      }
    }
    setStatus("disconnected");
    setIsMicActive(false);
    setIsMicPermissionPending(false);
    setIsReplying(false);
  }, [clearListeners]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      void stopStreaming();
    }, Math.max(30, idleTimeoutSeconds) * 1000);
  }, [idleTimeoutSeconds, stopStreaming]);

  const streamReplyToPersona = useCallback(async (replyText: string) => {
    const client = anamRef.current;
    if (!client) throw new Error("Anam session is not connected");

    const stream = client.createTalkMessageStream();
    const chunks = splitIntoChunks(replyText);
    if (chunks.length === 0) {
      return;
    }

    for (let i = 0; i < chunks.length; i++) {
      await stream.streamMessageChunk(chunks[i], i === chunks.length - 1);
    }
    await stream.endMessage();
  }, []);

  const requestReplyFromHistory = useCallback(
    async (messages: Message[]) => {
      const normalizedLanguage = normalizeAnamLanguageCode(languageCode) || "en";
      const history: GenerateReplyRequestMessage[] = messages
        .map((message) => ({
          role:
            message.role === "persona"
              ? "persona"
              : message.role === "user"
                ? "user"
                : ("assistant" as const),
          content: String(message.content || "").trim(),
        }))
        .filter((message) => Boolean(message.content));

      if (!history.length) return;

      const response = await fetch("/api/generate-reply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history,
          tutorId,
          lessonContext,
          language: normalizedLanguage.startsWith("hi") ? "Hindi" : "English",
        }),
      });

      const payload = await parseJsonResponse<GenerateReplyResponse>(response, "/api/generate-reply");
      const replyText = String(payload.replyText || "").trim();
      if (!replyText) throw new Error("LLM returned empty reply text");
      setBoardText(replyText);
      await streamReplyToPersona(replyText);
    },
    [languageCode, lessonContext, streamReplyToPersona, tutorId],
  );

  const speakText = useCallback(
    async (text: string) => {
      const client = anamRef.current;
      if (!client) {
        setErrorMessage("Avatar is not connected.");
        return;
      }
      const cleaned = text.trim();
      if (!cleaned) return;
      setErrorMessage("");
      setIsReplying(true);
      resetIdleTimer();
      try {
        setBoardText(cleaned);
        await client.talk(cleaned);
      } catch (error: any) {
        setErrorMessage(formatAnamErrorMessage(error, "Failed to send text to avatar"));
      } finally {
        setIsReplying(false);
      }
    },
    [resetIdleTimer],
  );

  useImperativeHandle(ref, () => ({ speakText }), [speakText]);

  const startStreaming = useCallback(async () => {
    if (anamRef.current) return;
    try {
      setStatus("connecting");
      setErrorMessage("");
      setIsVideoReady(false);

      const normalizedLanguageCode = normalizeAnamLanguageCode(languageCode);
      const tokenResponse = await fetch("/api/session-token", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarId,
          voiceId,
          languageCode: normalizedLanguageCode,
          systemPrompt,
          lessonContext,
        }),
      });
      const tokenPayload = await parseJsonResponse<SessionTokenResponse>(
        tokenResponse,
        "/api/session-token",
      );
      if (!tokenPayload.sessionToken) {
        throw new Error("Session token response is missing sessionToken");
      }

      const anamClient = createClient(tokenPayload.sessionToken);
      anamRef.current = anamClient;

      const addListener = <K extends AnamEvent>(
        event: K,
        callback: Parameters<AnamClient["addListener"]>[1],
      ) => {
        anamClient.addListener(event, callback as any);
        listenerCleanupRef.current.push(() => {
          anamClient.removeListener(event, callback as any);
        });
      };

      addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
        setStatus("connected");
        setErrorMessage("");
        resetIdleTimer();
      });

      addListener(AnamEvent.CONNECTION_CLOSED, (_reason, details) => {
        setStatus("disconnected");
        setIsMicActive(false);
        setIsReplying(false);
        if (details) {
          setErrorMessage(`Connection closed: ${details}`);
        }
      });

      addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
        setIsVideoReady(true);
        resetIdleTimer();
      });

      addListener(AnamEvent.INPUT_AUDIO_STREAM_STARTED, () => {
        setIsMicActive(true);
        setIsMicPermissionPending(false);
      });

      addListener(AnamEvent.MIC_PERMISSION_PENDING, () => {
        setIsMicPermissionPending(true);
      });

      addListener(AnamEvent.MIC_PERMISSION_GRANTED, () => {
        setIsMicPermissionPending(false);
      });

      addListener(AnamEvent.MIC_PERMISSION_DENIED, (error) => {
        setIsMicActive(false);
        setIsMicPermissionPending(false);
        setErrorMessage(
          `Microphone permission denied: ${error || "Please allow mic access for voice mode."}`,
        );
      });

      addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (messageEvent) => {
        if (messageEvent.role === "user") {
          setLatestUserCaption(messageEvent.content || "");
        } else if (messageEvent.role === "persona") {
          setLatestPersonaCaption(messageEvent.content || "");
        }
      });

      addListener(AnamEvent.TALK_STREAM_INTERRUPTED, () => {
        setIsReplying(false);
      });

      addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages) => {
        resetIdleTimer();
        if (!messages?.length) return;
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== "user") return;
        if (lastMessage.id === lastHandledUserMessageIdRef.current) return;
        lastHandledUserMessageIdRef.current = lastMessage.id;
        setLatestUserCaption(lastMessage.content || "");
        setIsReplying(true);
        void requestReplyFromHistory(messages)
          .catch((error: any) => {
            setErrorMessage(String(error?.message || "Failed to generate reply for voice chat"));
          })
          .finally(() => {
            setIsReplying(false);
          });
      });

      await anamClient.streamToVideoElement(videoElementId);
      resetIdleTimer();
    } catch (error: any) {
      console.error("Failed to start Anam session:", error);
      try {
        await anamRef.current?.stopStreaming();
      } catch (_stopError) {
        // no-op
      }
      anamRef.current = null;
      setStatus("disconnected");
      setIsVideoReady(false);
      setErrorMessage(formatAnamErrorMessage(error, "Failed to start Anam streaming session"));
    }
  }, [
    avatarId,
    languageCode,
    lessonContext,
    requestReplyFromHistory,
    resetIdleTimer,
    systemPrompt,
    videoElementId,
    voiceId,
  ]);

  useEffect(() => {
    return () => {
      void stopStreaming();
    };
  }, [stopStreaming]);

  return (
    <div className={`h-full flex flex-col gap-3 p-3 md:p-4 border rounded-xl bg-card ${className || ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <h3 className="text-lg font-semibold">AI Teacher Avatar (Anam)</h3>
          <p className="text-sm text-muted-foreground">
            State: {status.toUpperCase()} · Mode: {mode === "text" ? "Text" : "Voice chat"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>
            Text mode
          </Button>
          <Button variant={mode === "voice" ? "default" : "outline"} onClick={() => setMode("voice")}>
            Voice chat mode
          </Button>
          <Button variant="outline" onClick={() => anamRef.current?.interruptPersona()}>
            Skip
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (status === "connected") {
                void stopStreaming();
              } else {
                void startStreaming();
              }
            }}
          >
            {status === "connected" ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </div>

      {status === "connecting" && !isVideoReady && (
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
          <video id={videoElementId} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex gap-2">
            {isReplying && (
              <span className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">Avatar speaking</span>
            )}
            {isMicActive && (
              <span className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Listening to you</span>
            )}
            {isMicPermissionPending && (
              <span className="text-xs px-2 py-1 rounded bg-amber-600 text-white">Mic permission pending</span>
            )}
          </div>
        </div>
        <div className="h-56 md:h-72 rounded-lg border border-[#3d6651] bg-[#1d3d2e] text-emerald-50 p-3 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider opacity-90 mb-2">Board Notes</div>
          <div className="whitespace-pre-wrap text-sm leading-6">
            {boardText || "Ask a question in text mode, or speak in voice chat mode."}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-lg border bg-background/70 flex flex-col overflow-hidden">
        <div className="border-t p-3 space-y-3">
          {mode === "text" ? (
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!textQuestion.trim() || status !== "connected" || isReplying) return;
                void speakText(textQuestion.trim());
                setTextQuestion("");
              }}
            >
              <Textarea
                placeholder="Type text to make the teacher speak directly..."
                value={textQuestion}
                onChange={(event) => setTextQuestion(event.target.value)}
                className="min-h-[72px]"
              />
              <Button type="submit" disabled={!textQuestion.trim() || status !== "connected" || isReplying}>
                {isReplying ? "Working..." : "Ask the teacher"}
              </Button>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Voice chat mode is active. Start speaking naturally — Anam handles listening and transcription.
              </p>
              <div className="rounded-md border bg-background p-2 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Live user caption</div>
                <div className="whitespace-pre-wrap">{latestUserCaption || "..."}</div>
              </div>
              <div className="rounded-md border bg-background p-2 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Live persona caption</div>
                <div className="whitespace-pre-wrap">{latestPersonaCaption || "..."}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
