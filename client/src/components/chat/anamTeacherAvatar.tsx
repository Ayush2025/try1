import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient, AnamEvent, type AnamClient, type Message } from "@anam-ai/js-sdk";
import "./anamTeacherAvatar.css";

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
  personaName?: string;
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

const parseJsonResponse = async <T,>(response: Response, endpoint: string): Promise<T> => {
  const bodyText = await response.text();
  if (!response.ok) {
    let parsedError: any = null;
    try {
      parsedError = bodyText ? JSON.parse(bodyText) : null;
    } catch (_error) {
      parsedError = null;
    }
    const message =
      parsedError?.message ||
      parsedError?.error ||
      bodyText ||
      `${endpoint} failed with status ${response.status}`;
    throw new Error(String(message));
  }

  let parsed: T | null = null;
  try {
    parsed = bodyText ? (JSON.parse(bodyText) as T) : null;
  } catch (_error) {
    parsed = null;
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

const unwrapTutorReply = (rawReply: string) => {
  const trimmed = String(rawReply || "").trim();
  if (!trimmed) return "";

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fencedMatch?.[1] || trimmed).trim();

  const contentFromObject = (value: any) => {
    if (!value || typeof value !== "object") return null;
    const content = value.content;
    return typeof content === "string" ? content.trim() : null;
  };

  try {
    const parsed = JSON.parse(candidate);
    const extracted = contentFromObject(parsed);
    if (extracted) return extracted;
  } catch (_error) {
    // no-op
  }

  // Handle common malformed JSON cases where the model emits escaped content.
  const contentRegex =
    /"content"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"emotion"\s*:|,\s*"suggestions"\s*:|,\s*"needsClarification"\s*:|,\s*"resources"\s*:|\})/i;
  const contentMatch = candidate.match(contentRegex);
  if (contentMatch?.[1]) {
    return contentMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .trim();
  }

  return trimmed;
};

export const TeacherAvatar = forwardRef<TeacherAvatarRef, TeacherAvatarProps>(function TeacherAvatar(
  {
    avatarId,
    voiceId,
    personaName = "AI Teacher",
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
  const [micPermissionState, setMicPermissionState] = useState<"unknown" | "granted" | "denied" | "prompt">(
    "unknown",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [textQuestion, setTextQuestion] = useState("");
  const [boardText, setBoardText] = useState("");
  const [latestUserCaption, setLatestUserCaption] = useState("");
  const [latestPersonaCaption, setLatestPersonaCaption] = useState("");
  const boardBody = useMemo(() => {
    if (boardText.trim()) return boardText.trim();
    if (mode === "voice" && latestPersonaCaption.trim()) return latestPersonaCaption.trim();
    return "Ask a question in text mode, or speak in voice chat mode.";
  }, [boardText, mode, latestPersonaCaption]);
  const boardLines = useMemo(
    () =>
      boardBody
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0),
    [boardBody],
  );
  const statusText = errorMessage
    ? errorMessage
    : status === "connecting"
      ? "Connecting to tutor session..."
      : status === "connected"
        ? micPermissionState === "denied"
          ? "Live session active, but microphone access is denied."
          : "Live classroom session active."
        : "Not connected. Tap Connect to begin.";

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

    const shouldUnmuteAfter = isMicActive;
    try {
      // Prevent self-interruption while persona is talking.
      client.muteInputAudio();
    } catch (_error) {
      // no-op
    }

    try {
      const stream = client.createTalkMessageStream();
      const chunks = splitIntoChunks(replyText);
      if (chunks.length === 0) {
        return;
      }

      for (let i = 0; i < chunks.length; i++) {
        await stream.streamMessageChunk(chunks[i], i === chunks.length - 1);
      }
      await stream.endMessage();
    } finally {
      if (shouldUnmuteAfter) {
        try {
          client.unmuteInputAudio();
        } catch (_error) {
          // no-op
        }
      }
    }
  }, [isMicActive]);

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
      const replyText = unwrapTutorReply(payload.replyText || "");
      if (!replyText) throw new Error("LLM returned empty reply text");
      setBoardText(replyText);
      await streamReplyToPersona(replyText);
    },
    [languageCode, lessonContext, streamReplyToPersona, tutorId],
  );

  const generateAndSpeakReply = useCallback(
    async (studentText: string) => {
      const cleaned = studentText.trim();
      if (!cleaned) return;
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentText: cleaned,
          tutorId,
          lessonContext,
          language: (normalizeAnamLanguageCode(languageCode) || "en").startsWith("hi")
            ? "Hindi"
            : "English",
        }),
      });
      const payload = await parseJsonResponse<GenerateReplyResponse>(response, "/api/generate-reply");
      const replyText = unwrapTutorReply(payload.replyText || "");
      if (!replyText) {
        throw new Error("Generated reply was empty.");
      }
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
        const shouldUnmuteAfter = isMicActive;
        try {
          client.muteInputAudio();
        } catch (_error) {
          // no-op
        }
        try {
          await client.talk(cleaned);
        } finally {
          if (shouldUnmuteAfter) {
            try {
              client.unmuteInputAudio();
            } catch (_error) {
              // no-op
            }
          }
        }
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
        setMicPermissionState("granted");
      });

      addListener(AnamEvent.MIC_PERMISSION_PENDING, () => {
        setIsMicPermissionPending(true);
        setMicPermissionState("prompt");
      });

      addListener(AnamEvent.MIC_PERMISSION_GRANTED, () => {
        setIsMicPermissionPending(false);
        setMicPermissionState("granted");
      });

      addListener(AnamEvent.MIC_PERMISSION_DENIED, (error) => {
        setIsMicActive(false);
        setIsMicPermissionPending(false);
        setMicPermissionState("denied");
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
            setErrorMessage(formatAnamErrorMessage(error, "Failed to generate reply for voice chat"));
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
    if (!("permissions" in navigator)) return;
    let cancelled = false;
    // Best-effort browser permissions introspection (not all browsers support this).
    void (navigator as any).permissions
      ?.query?.({ name: "microphone" })
      .then((result: any) => {
        if (cancelled || !result?.state) return;
        const next = String(result.state);
        if (next === "granted" || next === "denied" || next === "prompt") {
          setMicPermissionState(next);
        }
        result.onchange = () => {
          const updated = String(result.state);
          if (updated === "granted" || updated === "denied" || updated === "prompt") {
            setMicPermissionState(updated);
          }
        };
      })
      .catch(() => {
        // no-op
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      void stopStreaming();
    };
  }, [stopStreaming]);

  return (
    <section className={`anam-classroom ${className || ""}`} aria-label="AI teacher avatar classroom">
      <div className="anam-header">
        <div className="anam-heading">
          <h3>AI Teacher</h3>
          <p>A focused one-on-one tutoring window</p>
        </div>
        <div className="anam-controls-bar">
          <div className="anam-segmented-toggle" role="tablist" aria-label="Interaction mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "text"}
              className={`anam-segment-btn ${mode === "text" ? "is-active" : ""}`}
              onClick={() => setMode("text")}
            >
              Text mode
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "voice"}
              className={`anam-segment-btn ${mode === "voice" ? "is-active" : ""}`}
              onClick={() => setMode("voice")}
            >
              Voice chat mode
            </button>
          </div>
          <button type="button" className="anam-btn anam-btn-ghost" onClick={() => anamRef.current?.interruptPersona()}>
            Skip
          </button>
          <button
            type="button"
            className={`anam-btn anam-btn-connect ${status === "connected" ? "is-live" : ""}`}
            onClick={() => {
              if (status === "connected") {
                void stopStreaming();
              } else {
                void startStreaming();
              }
            }}
          >
            {status === "connected" ? "Live · Disconnect" : status === "connecting" ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>

      <p
        className={`anam-status-line ${errorMessage ? "is-error" : ""}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {status === "connecting" && !errorMessage ? "Connecting..." : statusText}
      </p>

      <div className="anam-stage-grid">
        <div className="anam-avatar-frame">
          <div className="anam-avatar-inner">
            <video id={videoElementId} autoPlay playsInline className="anam-avatar-video" />
            {(status !== "connected" || !isVideoReady) && (
              <div className="anam-avatar-placeholder" aria-hidden="true">
                <div className="anam-placeholder-mark">✦</div>
                <div className="anam-placeholder-text">Not connected</div>
              </div>
            )}
            <div className="anam-nameplate">
              <span className={`anam-status-dot status-${status}`} />
              <span className="anam-nameplate-name">{personaName}</span>
              <span className="anam-nameplate-state">
                {status === "connected" ? "Live" : status === "connecting" ? "Connecting" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="anam-board">
          <div className="anam-board-label">BOARD NOTES</div>
          <div className="anam-board-content">
            {boardLines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className="anam-board-line"
                style={{ animationDelay: `${Math.min(index * 70, 500)}ms` }}
              >
                {line}
              </p>
            ))}
            {mode === "voice" && (
              <div className="anam-caption-meta">
                <p>
                  <strong>You:</strong> {latestUserCaption || "..."}
                </p>
                <p>
                  <strong>Tutor:</strong> {latestPersonaCaption || (isReplying ? "Thinking..." : "...")}
                </p>
              </div>
            )}
          </div>
          <div className="anam-board-tray" aria-hidden="true" />
        </div>
      </div>

      <div className="anam-input-shell">
        {mode === "text" ? (
          <form
            className="anam-input-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!textQuestion.trim() || status !== "connected" || isReplying) return;
              void generateAndSpeakReply(textQuestion.trim()).catch((error: any) => {
                setErrorMessage(formatAnamErrorMessage(error, "Failed to generate teacher response"));
              });
              setTextQuestion("");
            }}
          >
            <textarea
              className="anam-text-input"
              placeholder="Type text to make the teacher speak directly..."
              value={textQuestion}
              onChange={(event) => setTextQuestion(event.target.value)}
              rows={2}
            />
            <button
              type="submit"
              className="anam-btn anam-btn-ask"
              disabled={!textQuestion.trim() || status !== "connected" || isReplying}
            >
              {isReplying ? "Working..." : "Ask the teacher"}
            </button>
          </form>
        ) : (
          <div className="anam-voice-hint">
            <p>
              {isMicPermissionPending
                ? "Waiting for microphone permission..."
                : isMicActive
                  ? "Voice chat mode is live. Speak naturally; Anam transcribes automatically."
                  : micPermissionState === "denied"
                    ? "Microphone is blocked in your browser settings."
                    : "Voice chat mode is selected. Connect and allow mic to start speaking."}
            </p>
            <p>
              {isReplying
                ? "Tutor is responding..."
                : "If the tutor starts speaking while you talk, interrupted speech will reset automatically."}
            </p>
            <div className="anam-live-flags">
              <span className={`anam-flag ${isReplying ? "is-on" : ""}`}>Avatar speaking</span>
              <span className={`anam-flag ${isMicActive ? "is-on" : ""}`}>Listening to you</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
