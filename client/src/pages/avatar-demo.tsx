import { useRef, useState } from "react";
import { TeacherAvatar, type TeacherAvatarRef } from "@/components/chat/anamTeacherAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AvatarDemoPage() {
  const avatarRef = useRef<TeacherAvatarRef | null>(null);
  const [avatarId, setAvatarId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [languageCode, setLanguageCode] = useState<"en" | "hi">("en");

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Anam Teacher Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-id">Avatar ID (optional)</Label>
                <Input
                  id="avatar-id"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  placeholder="Anam avatar id (or use ANAM_AVATAR_ID env)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-id">Voice ID (optional)</Label>
                <Input
                  id="voice-id"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="Anam voice id (or use ANAM_VOICE_ID env)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Language code</Label>
                <Input
                  id="lang"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value === "hi" ? "hi" : "en")}
                  placeholder="en or hi"
                />
              </div>
            </div>

            {/*
              lessonContext should come from the real lesson runtime:
              - current topic/course ID
              - selected chapter/objective
              - user proficiency or curriculum metadata
              This demo uses a static placeholder string and passes it to both
              /api/session-token (system prompt context) and /api/generate-reply.
            */}
            <TeacherAvatar
              ref={avatarRef}
              avatarId={avatarId || undefined}
              voiceId={voiceId || undefined}
              languageCode={languageCode}
              lessonContext="Current lesson: Intro to linear equations for grade 8."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
