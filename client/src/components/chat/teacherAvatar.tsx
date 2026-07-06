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
  Language,
  LiveAvatarSession,
  SessionEvent,
  SessionInteractivityMode,
  SessionState,
  type SessionDisconnectReason,
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
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const sessionRef = useRef<LiveAvatarSession | null>(null);
    const silenceTimerRef = useRef<number | null>(null);
    const inactivityTimerRef = useRef<number | null>(null);
    const lastUserTranscriptRef = useRef("");
    const ignoreUserTranscriptsRef = useRef(false);
    const isSessionClosingRef = useRef(false);
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
        await sessionRef.current.stop();
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

        try {
          setIsReplyPending(true);
          setErrorMessage("");
          markActivity();

          const replyResponse = await apiRequest("POST", "/api/generate-reply", {
            studentText: trimmedText,
            lessonContext,
          });
          const payload = (await replyResponse.json()) as GenerateReplyResponse;
          const generatedReply = payload.replyText?.trim();
          if (!generatedReply) {
            throw new Error("Empty reply generated");
          }

          setReplyText(generatedReply);
          await sessionRef.current.repeat(generatedReply);
        } catch (error) {
          console.error("Failed to generate or speak reply:", error);
          setErrorMessage("Could not generate teacher reply. Please try again.");
        } finally {
          setIsReplyPending(false);
        }
      },
      [lessonContext, markActivity],
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
        await sessionRef.current.repeat(cleaned);
      },
      [markActivity],
    );

    useImperativeHandle(ref, () => ({ speak }), [speak]);

    const connectSession = useCallback(async () => {
      if (sessionRef.current) return;

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
          onStreamDisconnected?.(reason);
          setErrorMessage(`Stream disconnected: ${reason}`);
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          setIsAvatarSpeaking(true);
          ignoreUserTranscriptsRef.current = true;
          onAvatarStartTalking?.();
          if (sessionRef.current && isListening) {
            void sessionRef.current.voiceChat.mute();
          }
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          setIsAvatarSpeaking(false);
          ignoreUserTranscriptsRef.current = false;
          onAvatarEndMessage?.();
          if (sessionRef.current && isListening) {
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
          if (mode === "voice") {
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
      mode,
      fetchReplyAndSpeak,
      markActivity,
      onAvatarEndMessage,
      onAvatarStartTalking,
      onStreamDisconnected,
      onUserSilence,
      onUserStart,
      onUserStop,
      resetSilenceTimer,
      isListening,
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
        stopVoiceMode();
        void closeSession();
      };
    }, [connectSession, closeSession, stopVoiceMode]);

    const languageLabel = language === "hi" ? "Hindi" : "English";
    const sdkLanguage = language === "hi" ? Language.hi : Language.en;

    useEffect(() => {
      // This keeps language intent explicit in UI state for lesson operators.
      // Token generation receives this language value for avatar persona setup.
      void sdkLanguage;
    }, [sdkLanguage]);

    return (
      <div className="space-y-4 p-4 border rounded-xl bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
          </div>
        )}

        <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
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

        {mode === "text" ? (
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!textQuestion.trim() || isReplyPending) return;
              void fetchReplyAndSpeak(textQuestion);
            }}
          >
            <Textarea
              placeholder="Ask the teacher in text mode..."
              value={textQuestion}
              onChange={(event) => setTextQuestion(event.target.value)}
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

        {replyText && (
          <div className="rounded-md border px-3 py-2 text-sm">
            <strong>Latest teacher reply:</strong>
            <div className="mt-1 whitespace-pre-wrap">{replyText}</div>
          </div>
        )}
      </div>
    );
  },
);
