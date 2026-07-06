import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AgentEventsEnum,
  LiveAvatarSession,
  SessionDisconnectReason,
  SessionEvent,
  SessionInteractivityMode,
  SessionState,
} from "@heygen/liveavatar-web-sdk";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AvatarLanguage = "en" | "hi";
type InteractionMode = "text" | "voice";

export interface TeacherAvatarRef {
  speak: (text: string) => Promise<void>;
}

interface TeacherAvatarProps {
  avatarId?: string;
  tutorId?: number;
  voiceId?: string;
  language?: AvatarLanguage;
  quality?: "low" | "medium" | "high";
  lessonContext?: string;
  activityIdleTimeout?: number;
  onAvatarStartTalking?: () => void;
  onAvatarEndMessage?: () => void;
  onUserStart?: () => void;
  onUserStop?: () => void;
  onUserSilence?: () => void;
  onStreamDisconnected?: (reason: string) => void;
  className?: string;
}

interface AccessTokenResponse {
  sessionToken: string;
  sessionId?: string;
}

interface GenerateReplyResponse {
  replyText: string;
}

export const TeacherAvatar = forwardRef<TeacherAvatarRef, TeacherAvatarProps>(
  function TeacherAvatar(
    {
      avatarId,
      tutorId,
      voiceId,
      language = "en",
      lessonContext,
      activityIdleTimeout = 180,
      onAvatarStartTalking,
      onAvatarEndMessage,
      onUserStart,
      onUserStop,
      onUserSilence,
      onStreamDisconnected,
      className,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const sessionRef = useRef<LiveAvatarSession | null>(null);
    const silenceTimerRef = useRef<number | null>(null);
    const inactivityTimerRef = useRef<number | null>(null);
    const speakFallbackTimerRef = useRef<number | null>(null);
    const avatarSpeechStartedRef = useRef(false);
    const lastUserTranscriptRef = useRef("");
    const ignoreUserTranscriptsRef = useRef(false);
    const isSessionClosingRef = useRef(false);
    const modeRef = useRef<InteractionMode>("text");
    const isListeningRef = useRef(false);
    const [mode, setMode] = useState<InteractionMode>("text");
    const [textQuestion, setTextQuestion] = useState("");
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [replyText, setReplyText] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [sessionState, setSessionState] = useState<SessionState>(SessionState.INACTIVE);
    const [isReplyPending, setIsReplyPending] = useState(false);
    const [boardText, setBoardText] = useState("");
    const [latestQuestion, setLatestQuestion] = useState("");

    useEffect(() => {
      modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
      isListeningRef.current = isListening;
    }, [isListening]);

    const markActivity = useCallback(() => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = window.setTimeout(() => {
        void closeSession();
      }, Math.max(30, activityIdleTimeout) * 1000);
    }, [activityIdleTimeout]);

    const closeSession = useCallback(async () => {
      if (!sessionRef.current || isSessionClosingRef.current) return;
      isSessionClosingRef.current = true;
      try {
        setIsListening(false);
        setIsConnected(false);
        setSessionState(SessionState.DISCONNECTED);
        // Avoid SDK stop() in UI teardown path; its internal async cleanup can throw
        // non-fatal "Session not found" errors that bubble as unhandled runtime crashes.
      } catch (error) {
        console.error("Failed to close avatar session:", error);
      } finally {
        sessionRef.current = null;
        isSessionClosingRef.current = false;
      }
    }, []);

    const resetSilenceTimer = useCallback(() => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = window.setTimeout(() => {
        onUserSilence?.();
      }, 4000);
    }, [onUserSilence]);

    const fetchReplyAndSpeak = useCallback(
      async (studentText: string) => {
        const trimmedText = studentText.trim();
        if (!trimmedText || !sessionRef.current) return;

        let generatedReply = "";
        try {
          setIsReplyPending(true);
          setErrorMessage("");
          markActivity();
          setLatestQuestion(trimmedText);

          const replyResponse = await apiRequest("POST", "/api/generate-reply", {
            studentText: trimmedText,
            lessonContext,
            tutorId,
            language: language === "hi" ? "Hindi" : "English",
          });
          const payload = (await replyResponse.json()) as GenerateReplyResponse;
          generatedReply = payload.replyText?.trim();
          if (!generatedReply) {
            throw new Error("Empty reply generated");
          }

          setReplyText(generatedReply);
          setBoardText(generatedReply);
        } catch (error) {
          console.error("Failed to generate teacher reply:", error);
          setErrorMessage("Could not generate teacher reply. Please try again.");
          return;
        }

        const speakInBrowser = () => {
          if (!window.speechSynthesis) return false;
          try {
            const utterance = new SpeechSynthesisUtterance(generatedReply);
            utterance.lang = language === "hi" ? "hi-IN" : "en-US";
            utterance.rate = language === "hi" ? 0.95 : 1.0;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
            return true;
          } catch (error) {
            console.warn("Browser speech fallback failed:", error);
            return false;
          }
        };

        try {
          avatarSpeechStartedRef.current = false;
          if (speakFallbackTimerRef.current) {
            window.clearTimeout(speakFallbackTimerRef.current);
          }
          sessionRef.current.repeat(generatedReply);
          sessionRef.current.message(generatedReply);
          speakFallbackTimerRef.current = window.setTimeout(() => {
            if (!avatarSpeechStartedRef.current) {
              const fallbackStarted = speakInBrowser();
              if (fallbackStarted) {
                setErrorMessage("");
              }
            }
          }, 1800);
          setErrorMessage("");
        } catch (error) {
          console.error("Failed to speak generated reply:", error);
          const fallbackStarted = speakInBrowser();
          if (fallbackStarted) {
            setErrorMessage("");
          } else {
            setErrorMessage("Reply generated, but voice playback failed.");
          }
        } finally {
          setIsReplyPending(false);
        }
      },
      [lessonContext, markActivity, tutorId, language],
    );

    const speak = useCallback(
      async (text: string) => {
        if (!sessionRef.current) {
          setErrorMessage("Avatar session is not connected yet.");
          return;
        }
        const cleaned = text.trim();
        if (!cleaned) return;
        markActivity();
        setReplyText(cleaned);
        setBoardText(cleaned);
        try {
          sessionRef.current.repeat(cleaned);
          sessionRef.current.message(cleaned);
          setErrorMessage("");
        } catch (error) {
          console.error("Failed to speak manual reply:", error);
          setErrorMessage("Reply text was generated, but avatar voice failed for this message.");
        }
      },
      [markActivity],
    );

    useImperativeHandle(ref, () => ({ speak }), [speak]);

    const connectSession = useCallback(async () => {
      if (sessionRef.current) {
        if (
          sessionRef.current.state === SessionState.CONNECTED ||
          sessionRef.current.state === SessionState.CONNECTING
        ) {
          return;
        }
        sessionRef.current = null;
      }

      try {
        setIsConnecting(true);
        setErrorMessage("");

        const tokenResponse = await apiRequest("POST", "/api/get-access-token", {
          ...(avatarId ? { avatarId } : {}),
          ...(voiceId ? { voiceId } : {}),
          language,
          mode: "LITE",
          activityIdleTimeout,
        });
        const tokenPayload = (await tokenResponse.json()) as AccessTokenResponse;

        if (!tokenPayload.sessionToken) {
          throw new Error("Access token not returned by server");
        }

        const session = new LiveAvatarSession(tokenPayload.sessionToken, {
          voiceChat: {
            mode: SessionInteractivityMode.CONVERSATIONAL,
            defaultMuted: false,
          },
        });
        sessionRef.current = session;

        session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
          setSessionState(state);
          setIsConnected(state === SessionState.CONNECTED);
        });

        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (videoRef.current) {
            try {
              session.attach(videoRef.current);
            } catch (error) {
              console.error("Failed to attach media stream:", error);
              setErrorMessage("Connected, but video stream could not be attached.");
            }
          }
        });

        session.on(SessionEvent.SESSION_DISCONNECTED, (reason: SessionDisconnectReason) => {
          setIsConnected(false);
          setIsListening(false);
          sessionRef.current = null;
          onStreamDisconnected?.(reason);
          if (reason === SessionDisconnectReason.CLIENT_INITIATED) {
            setErrorMessage("");
          } else {
            setErrorMessage(`Stream disconnected: ${reason}`);
          }
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          avatarSpeechStartedRef.current = true;
          if (speakFallbackTimerRef.current) {
            window.clearTimeout(speakFallbackTimerRef.current);
            speakFallbackTimerRef.current = null;
          }
          setIsAvatarSpeaking(true);
          ignoreUserTranscriptsRef.current = true;
          onAvatarStartTalking?.();
          if (sessionRef.current && isListeningRef.current) {
            void sessionRef.current.voiceChat.mute();
          }
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          setIsAvatarSpeaking(false);
          ignoreUserTranscriptsRef.current = false;
          onAvatarEndMessage?.();
          if (sessionRef.current && isListeningRef.current) {
            void sessionRef.current.voiceChat.unmute();
          }
        });

        session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
          onUserStart?.();
          resetSilenceTimer();
        });

        session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
          onUserStop?.();
          if (!lastUserTranscriptRef.current.trim()) {
            onUserSilence?.();
          }
        });

        session.on(AgentEventsEnum.USER_TRANSCRIPTION_CHUNK, (event) => {
          if (ignoreUserTranscriptsRef.current) return;
          setVoiceTranscript(event.text);
          resetSilenceTimer();
        });

        session.on(AgentEventsEnum.USER_TRANSCRIPTION, (event) => {
          if (ignoreUserTranscriptsRef.current) return;
          const finalTranscript = (event.text || "").trim();
          if (!finalTranscript) {
            onUserSilence?.();
            return;
          }
          lastUserTranscriptRef.current = finalTranscript;
          setVoiceTranscript(finalTranscript);
          if (modeRef.current === "voice") {
            void fetchReplyAndSpeak(finalTranscript);
          }
        });

        await session.start();
        markActivity();
      } catch (error: any) {
        console.error("Failed to connect avatar session:", error);
        const messageText = String(error?.message || "Failed to start avatar session");
        if (messageText.toLowerCase().includes("limit") || messageText.toLowerCase().includes("concurrent")) {
          setErrorMessage("Concurrent session limit reached. Please close existing avatar sessions and retry.");
        } else {
          setErrorMessage(messageText);
        }
      } finally {
        setIsConnecting(false);
      }
    }, [
      activityIdleTimeout,
      avatarId,
      voiceId,
      language,
      fetchReplyAndSpeak,
      markActivity,
      onAvatarEndMessage,
      onAvatarStartTalking,
      onStreamDisconnected,
      onUserSilence,
      onUserStart,
      onUserStop,
      resetSilenceTimer,
    ]);

    const startVoiceMode = useCallback(async () => {
      if (!sessionRef.current) return;
      try {
        setErrorMessage("");
        await sessionRef.current.voiceChat.start({
          mode: SessionInteractivityMode.CONVERSATIONAL,
          defaultMuted: false,
        });
        setIsListening(true);
        markActivity();
      } catch (error: any) {
        console.error("Failed to start voice chat:", error);
        const messageText = String(error?.message || "Failed to start voice chat");
        if (messageText.toLowerCase().includes("permission")) {
          setErrorMessage("Microphone permission denied. Please allow mic access and retry.");
        } else {
          setErrorMessage(messageText);
        }
      }
    }, [markActivity]);

    const stopVoiceMode = useCallback(() => {
      if (!sessionRef.current) return;
      try {
        sessionRef.current.voiceChat.stop();
      } finally {
        setIsListening(false);
      }
    }, []);

    useEffect(() => {
      void connectSession();

      return () => {
        if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
        if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
        if (speakFallbackTimerRef.current) window.clearTimeout(speakFallbackTimerRef.current);
        stopVoiceMode();
        void closeSession();
      };
      // Intentionally run once to avoid reconnect/disconnect loops on local UI state changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const languageLabel = language === "hi" ? "Hindi" : "English";

    return (
      <div className={`h-full flex flex-col gap-3 p-3 md:p-4 border rounded-xl bg-card ${className || ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            <h3 className="text-lg font-semibold">AI Teacher Avatar</h3>
            <p className="text-sm text-muted-foreground">
              Language: {languageLabel} · State: {sessionState}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "text" ? "default" : "outline"}
              onClick={() => setMode("text")}
            >
              Text mode
            </Button>
            <Button
              variant={mode === "voice" ? "default" : "outline"}
              onClick={() => setMode("voice")}
            >
              Voice chat mode
            </Button>
          </div>
        </div>

        {isConnecting && (
          <div className="text-sm rounded-md border border-blue-300 bg-blue-50 text-blue-700 px-3 py-2">
            Connecting to LiveAvatar...
          </div>
        )}

        {errorMessage && (
          <div className="text-sm rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">
            {errorMessage}
            {sessionState === SessionState.DISCONNECTED && (
              <Button
                variant="link"
                className="ml-2 h-auto p-0 text-red-700 underline"
                onClick={() => {
                  setErrorMessage("");
                  void connectSession();
                }}
              >
                Reconnect
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
          <div className="relative w-full h-56 md:h-72 overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 flex gap-2">
              {isAvatarSpeaking && (
                <span className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">
                  Avatar speaking
                </span>
              )}
              {isListening && (
                <span className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">
                  Listening to you
                </span>
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
                  if (!textQuestion.trim() || isReplyPending) return;
                  void fetchReplyAndSpeak(textQuestion);
                  setTextQuestion("");
                }}
              >
                <Textarea
                  placeholder="Ask the teacher in text mode..."
                  value={textQuestion}
                  onChange={(event) => setTextQuestion(event.target.value)}
                  className="min-h-[72px]"
                />
                <Button type="submit" disabled={!textQuestion.trim() || isReplyPending || !isConnected}>
                  {isReplyPending ? "Generating..." : "Ask the teacher"}
                </Button>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {!isListening ? (
                    <Button onClick={() => void startVoiceMode()} disabled={!isConnected}>
                      Start talking
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopVoiceMode}>
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
