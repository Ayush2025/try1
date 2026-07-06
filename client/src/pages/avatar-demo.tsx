import { useRef, useState } from "react";
import { TeacherAvatar, type TeacherAvatarRef } from "@/components/chat/teacherAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AvatarDemoPage() {
  const avatarRef = useRef<TeacherAvatarRef | null>(null);
  const [avatarId, setAvatarId] = useState("28ea726f665349f3878b5188ccb4d1bf");
  const [voiceId, setVoiceId] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = (event: string) => {
    setEventLog((prev) => [`${new Date().toLocaleTimeString()} · ${event}`, ...prev].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HeyGen LiveAvatar Teacher Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-id">Avatar ID</Label>
                <Input
                  id="avatar-id"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  placeholder="HeyGen avatar id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-id">Voice ID (optional)</Label>
                <Input
                  id="voice-id"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="HeyGen voice id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Language code</Label>
                <Input
                  id="lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value === "hi" ? "hi" : "en")}
                  placeholder="en or hi"
                />
              </div>
            </div>

            {/*
              lessonContext should come from the real lesson runtime:
              - current topic/course ID
              - selected chapter/objective
              - user proficiency or curriculum metadata
              This demo uses a static placeholder string.
            */}
            <TeacherAvatar
              ref={avatarRef}
              avatarId={avatarId}
              voiceId={voiceId || undefined}
              language={language}
              lessonContext="Current lesson: Intro to linear equations for grade 8."
              onAvatarStartTalking={() => logEvent("AVATAR_START_TALKING")}
              onAvatarEndMessage={() => logEvent("AVATAR_END_MESSAGE")}
              onUserStart={() => logEvent("USER_START")}
              onUserStop={() => logEvent("USER_STOP")}
              onUserSilence={() => logEvent("USER_SILENCE")}
              onStreamDisconnected={(reason) => logEvent(`STREAM_DISCONNECTED (${reason})`)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {eventLog.length === 0 ? (
                <div className="text-muted-foreground">No events yet.</div>
              ) : (
                eventLog.map((entry, idx) => <div key={`${entry}-${idx}`}>{entry}</div>)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
