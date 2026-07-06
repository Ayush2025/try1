import { useRef, useState } from "react";
import { TeacherAvatar, type TeacherAvatarRef } from "@/components/chat/simliTeacherAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AvatarDemoPage() {
  const avatarRef = useRef<TeacherAvatarRef | null>(null);
  const [faceId, setFaceId] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Simli Teacher Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="face-id">Face ID (optional)</Label>
                <Input
                  id="face-id"
                  value={faceId}
                  onChange={(e) => setFaceId(e.target.value)}
                  placeholder="Simli face id (or use SIMLI_FACE_ID env)"
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
              faceId={faceId || undefined}
              language={language}
              lessonContext="Current lesson: Intro to linear equations for grade 8."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
