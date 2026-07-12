import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type AiCourse = {
  id: number;
  band: string;
  gradeRange: string;
  title: string;
  description: string;
  overview: string;
  prerequisites: string;
  totalDurationMinutes: number;
  glossary: any;
  teacherGuide: any;
  capstoneProject: any;
  isPublished: boolean;
};

type AiLesson = {
  id: number;
  courseId: number;
  orderIndex: number;
  slug: string;
  title: string;
  estimatedDurationMinutes: number;
  tags: string[];
  hook: string;
  conceptExplanation: string;
  workedExamples: any[];
  activity: any;
  discussionPrompts: string[];
  quiz: any[];
  extension: string;
  realWorldConnection: string;
};

type CourseWithLessons = AiCourse & { lessons: AiLesson[] };

type ProgressEntry = {
  lessonId: number;
  completed: boolean;
  quizScore: string;
};

function bandLabel(band: string) {
  const map: Record<string, string> = {
    "band-a": "Band A (Class 3-5)",
    "band-b": "Band B (Class 6-8)",
    "band-c": "Band C (Class 9-10)",
    "band-d": "Band D (Class 11-12)",
  };
  return map[band] ?? band;
}

function safeJson(text: string, fallback: any) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function conceptChunks(course: AiCourse | null, text: string) {
  if (!text) return [];
  if (course?.band !== "band-a") return [text];
  const byParagraph = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current: string[] = [];
  for (const paragraph of byParagraph) {
    current.push(paragraph);
    if (current.length >= 2) {
      chunks.push(current.join("\n\n"));
      current = [];
    }
  }
  if (current.length) chunks.push(current.join("\n\n"));
  return chunks;
}

export function AiCoursesSection({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [conceptPage, setConceptPage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [draftCourse, setDraftCourse] = useState<Partial<AiCourse>>({
    band: "band-a",
    gradeRange: "Class 3-5",
    title: "",
    description: "",
    overview: "",
    prerequisites: "",
    totalDurationMinutes: 0,
    glossary: [],
    teacherGuide: {},
    capstoneProject: {},
    isPublished: false,
  });
  const [selectedAdminCourseId, setSelectedAdminCourseId] = useState<number | null>(null);
  const [selectedAdminLessonId, setSelectedAdminLessonId] = useState<number | null>(null);
  const [lessonDraft, setLessonDraft] = useState<Partial<AiLesson>>({});

  const { data: catalog = [], isLoading: catalogLoading } = useQuery<AiCourse[]>({
    queryKey: ["/api/ai-courses"],
  });

  const { data: adminCourses = [] } = useQuery<AiCourse[]>({
    queryKey: ["/api/admin/ai-courses"],
    enabled: isAdmin,
  });

  const studentCourseUrl = selectedCourseId ? `/api/ai-courses/${selectedCourseId}` : "";
  const adminCourseUrl = selectedCourseId ? `/api/admin/ai-courses/${selectedCourseId}` : "";

  const { data: selectedCourse } = useQuery<CourseWithLessons>({
    queryKey: [isAdmin ? adminCourseUrl : studentCourseUrl],
    enabled: Boolean(selectedCourseId),
  });

  const { data: selectedAdminCourse } = useQuery<CourseWithLessons>({
    queryKey: [selectedAdminCourseId ? `/api/admin/ai-courses/${selectedAdminCourseId}` : ""],
    enabled: isAdmin && Boolean(selectedAdminCourseId),
  });

  const { data: progress = [] } = useQuery<ProgressEntry[]>({
    queryKey: [selectedCourseId ? `/api/ai-courses/${selectedCourseId}/progress` : ""],
    enabled: Boolean(selectedCourseId),
  });

  const groupedCourses = useMemo(() => {
    return catalog.reduce<Record<string, AiCourse[]>>((acc, course) => {
      if (!acc[course.band]) acc[course.band] = [];
      acc[course.band].push(course);
      return acc;
    }, {});
  }, [catalog]);

  const selectedLesson = useMemo(
    () => selectedCourse?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [selectedCourse, selectedLessonId],
  );

  const lessonProgressMap = useMemo(() => {
    const map = new Map<number, ProgressEntry>();
    for (const item of progress) map.set(item.lessonId, item);
    return map;
  }, [progress]);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, completed, quizScore }: { lessonId: number; completed: boolean; quizScore: number }) => {
      if (!selectedCourseId) throw new Error("No course selected");
      const response = await apiRequest(
        "POST",
        `/api/ai-courses/${selectedCourseId}/lessons/${lessonId}/progress`,
        { completed, quizScore: quizScore.toFixed(2) },
      );
      return response.json();
    },
    onSuccess: async () => {
      if (selectedCourseId) {
        await queryClient.invalidateQueries({ queryKey: [`/api/ai-courses/${selectedCourseId}/progress`] });
      }
      toast({ title: "Progress saved", description: "Lesson progress updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save progress", variant: "destructive" }),
  });

  const seedBandAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/ai-courses/seed-band-a");
      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/ai-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-courses"] });
      if (data?.id) {
        setSelectedCourseId(data.id);
        setSelectedAdminCourseId(data.id);
      }
      toast({ title: "Band A seeded", description: "Band A course and lessons are now available." });
    },
    onError: () => toast({ title: "Seed failed", description: "Could not seed Band A", variant: "destructive" }),
  });

  const seedBandBMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/ai-courses/seed-band-b");
      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/ai-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-courses"] });
      if (data?.id) {
        setSelectedCourseId(data.id);
        setSelectedAdminCourseId(data.id);
      }
      toast({ title: "Band B seeded", description: "Band B course and lessons are now available." });
    },
    onError: () => toast({ title: "Seed failed", description: "Could not seed Band B", variant: "destructive" }),
  });

  const saveCourseMutation = useMutation({
    mutationFn: async (payload: Partial<AiCourse>) => {
      if (selectedAdminCourseId) {
        const response = await apiRequest("PUT", `/api/admin/ai-courses/${selectedAdminCourseId}`, payload);
        return response.json();
      }
      const response = await apiRequest("POST", "/api/admin/ai-courses", payload);
      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-courses"] });
      if (data?.id) setSelectedAdminCourseId(data.id);
      toast({ title: "Saved", description: "Course saved successfully." });
    },
    onError: () => toast({ title: "Save failed", description: "Failed to save course", variant: "destructive" }),
  });

  const publishCourseMutation = useMutation({
    mutationFn: async ({ courseId, isPublished }: { courseId: number; isPublished: boolean }) => {
      const response = await apiRequest("POST", `/api/admin/ai-courses/${courseId}/publish`, { isPublished });
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/ai-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-courses"] });
      toast({ title: "Publish status updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update publish status", variant: "destructive" }),
  });

  const saveLessonMutation = useMutation({
    mutationFn: async (payload: Partial<AiLesson>) => {
      if (selectedAdminLessonId) {
        const response = await apiRequest("PUT", `/api/admin/ai-lessons/${selectedAdminLessonId}`, payload);
        return response.json();
      }
      if (!selectedAdminCourseId) throw new Error("No course selected");
      const response = await apiRequest("POST", `/api/admin/ai-courses/${selectedAdminCourseId}/lessons`, payload);
      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: [selectedAdminCourseId ? `/api/admin/ai-courses/${selectedAdminCourseId}` : ""] });
      if (data?.id) setSelectedAdminLessonId(data.id);
      toast({ title: "Lesson saved" });
    },
    onError: () => toast({ title: "Save failed", description: "Failed to save lesson", variant: "destructive" }),
  });

  const quizScore = useMemo(() => {
    if (!selectedLesson?.quiz?.length) return null;
    let correct = 0;
    for (let i = 0; i < selectedLesson.quiz.length; i += 1) {
      const question = selectedLesson.quiz[i];
      const answer = (quizAnswers[i] ?? "").trim().toLowerCase();
      if (!answer) continue;
      if (question.type === "mcq") {
        if ((question.answer ?? "").toLowerCase() === answer) correct += 1;
      } else {
        const keywords = (question.answerKeywords ?? []) as string[];
        if (keywords.some((keyword) => answer.includes(String(keyword).toLowerCase()))) correct += 1;
      }
    }
    return (correct / selectedLesson.quiz.length) * 100;
  }, [selectedLesson, quizAnswers]);

  const conceptPages = useMemo(
    () => conceptChunks(selectedCourse ?? null, selectedLesson?.conceptExplanation ?? ""),
    [selectedCourse, selectedLesson],
  );

  const totalCompleted = useMemo(() => {
    if (!selectedCourse?.lessons?.length) return 0;
    return selectedCourse.lessons.filter((lesson) => lessonProgressMap.get(lesson.id)?.completed).length;
  }, [selectedCourse, lessonProgressMap]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="student" className="w-full">
        <TabsList>
          <TabsTrigger value="student">Student View</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin View</TabsTrigger>}
        </TabsList>

        <TabsContent value="student" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Courses Catalog</CardTitle>
              <CardDescription>Browse by grade band and open a lesson player with quiz and progress tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              {catalogLoading ? (
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedCourses).map(([band, courses]) => (
                    <div key={band} className="space-y-3">
                      <h4 className="font-semibold">{bandLabel(band)}</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {courses.map((course) => (
                          <Card key={course.id}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium">{course.title}</p>
                                  <p className="text-xs text-muted-foreground">{course.gradeRange}</p>
                                </div>
                                <Badge>{Math.round((course.totalDurationMinutes || 0) / 60)}h</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{course.description}</p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedCourseId(course.id);
                                  setSelectedLessonId(null);
                                  setConceptPage(0);
                                }}
                              >
                                Open Course
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCourse && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCourse.title}</CardTitle>
                <CardDescription>{selectedCourse.overview}</CardDescription>
                <div className="text-sm text-muted-foreground">
                  Progress: {totalCompleted}/{selectedCourse.lessons.length} lessons completed
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedCourse.lessons.map((lesson) => {
                    const done = lessonProgressMap.get(lesson.id)?.completed;
                    return (
                      <Card key={lesson.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {lesson.orderIndex}. {lesson.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{lesson.estimatedDurationMinutes} minutes</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {done && <Badge variant="secondary">Completed</Badge>}
                            <Button
                              size="sm"
                              variant={selectedLessonId === lesson.id ? "default" : "outline"}
                              onClick={() => {
                                setSelectedLessonId(lesson.id);
                                setConceptPage(0);
                                setQuizAnswers({});
                                  setQuizSubmitted(false);
                              }}
                            >
                              Learn
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedLesson && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Lesson Player: {selectedLesson.title}</CardTitle>
                      <CardDescription>Hook → Concept → Example → Activity → Discussion → Quiz → Extension → Real-world.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <section>
                        <h4 className="font-semibold mb-2">Hook</h4>
                        <p className="whitespace-pre-wrap text-sm leading-6">{selectedLesson.hook}</p>
                      </section>
                      <Separator />
                      <section>
                        <h4 className="font-semibold mb-2">Core Concept</h4>
                        {conceptPages.length > 0 && (
                          <div className="space-y-3">
                            <Card>
                              <CardContent className="p-4">
                                <p className="whitespace-pre-wrap text-sm leading-6">{conceptPages[conceptPage]}</p>
                              </CardContent>
                            </Card>
                            {conceptPages.length > 1 && (
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConceptPage((v) => Math.max(v - 1, 0))}
                                  disabled={conceptPage === 0}
                                >
                                  Previous idea
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  Idea {conceptPage + 1} of {conceptPages.length}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConceptPage((v) => Math.min(v + 1, conceptPages.length - 1))}
                                  disabled={conceptPage >= conceptPages.length - 1}
                                >
                                  Next idea
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </section>
                      <Separator />
                      <section className="space-y-2">
                        <h4 className="font-semibold">Worked Example(s)</h4>
                        {selectedLesson.workedExamples?.map((example: any, idx: number) => (
                          <Card key={idx}>
                            <CardContent className="p-4 space-y-2">
                              <p className="font-medium">{example.title}</p>
                              <ol className="list-decimal pl-5 text-sm space-y-1">
                                {(example.steps ?? []).map((step: string, stepIdx: number) => (
                                  <li key={stepIdx}>{step}</li>
                                ))}
                              </ol>
                              <p className="text-sm text-muted-foreground">{example.summary}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </section>
                      <Separator />
                      <section className="space-y-2">
                        <h4 className="font-semibold">Hands-on Activity</h4>
                        <p className="font-medium text-sm">{selectedLesson.activity?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Estimated time: {selectedLesson.activity?.estimatedTimeMinutes} minutes
                        </p>
                        <p className="text-sm font-medium">Materials</p>
                        <ul className="list-disc pl-5 text-sm">
                          {(selectedLesson.activity?.materials ?? []).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                        <p className="text-sm font-medium">Steps</p>
                        <ol className="list-decimal pl-5 text-sm space-y-1">
                          {(selectedLesson.activity?.steps ?? []).map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                        <p className="text-sm font-medium">Success criteria</p>
                        <ul className="list-disc pl-5 text-sm">
                          {(selectedLesson.activity?.successCriteria ?? []).map((rule: string, idx: number) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                        <p className="text-sm font-medium">Teacher facilitation notes</p>
                        <ul className="list-disc pl-5 text-sm">
                          {(selectedLesson.activity?.facilitationNotes ?? []).map((note: string, idx: number) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </section>
                      <Separator />
                      <section>
                        <h4 className="font-semibold mb-2">Discussion prompts</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {(selectedLesson.discussionPrompts ?? []).map((prompt: string, idx: number) => (
                            <li key={idx}>{prompt}</li>
                          ))}
                        </ul>
                      </section>
                      <Separator />
                      <section className="space-y-3">
                        <h4 className="font-semibold">Quiz (scorable)</h4>
                        {(selectedLesson.quiz ?? []).map((question: any, idx: number) => (
                          <Card key={idx}>
                            <CardContent className="p-4 space-y-2">
                              <p className="font-medium">
                                Q{idx + 1}. {question.question}
                              </p>
                              {question.type === "mcq" ? (
                                <div className="space-y-2">
                                  {(question.options ?? []).map((option: string) => (
                                    <Button
                                      key={option}
                                      type="button"
                                      variant={quizAnswers[idx] === option ? "default" : "outline"}
                                      className="w-full justify-start"
                                      onClick={() => {
                                        setQuizAnswers((prev) => ({ ...prev, [idx]: option }));
                                        if (quizSubmitted) setQuizSubmitted(false);
                                      }}
                                    >
                                      {option}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <Textarea
                                  value={quizAnswers[idx] ?? ""}
                                  onChange={(event) => {
                                    setQuizAnswers((prev) => ({ ...prev, [idx]: event.target.value }));
                                    if (quizSubmitted) setQuizSubmitted(false);
                                  }}
                                  placeholder="Type your answer..."
                                />
                              )}
                              {quizSubmitted && (
                                <p className="text-xs text-muted-foreground">Explanation: {question.explanation}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            onClick={() => {
                              if (!selectedLesson || quizScore === null) return;
                              setQuizSubmitted(true);
                              updateProgressMutation.mutate({
                                lessonId: selectedLesson.id,
                                completed: true,
                                quizScore,
                              });
                            }}
                          >
                            Submit quiz & mark complete
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (!selectedLesson) return;
                              updateProgressMutation.mutate({
                                lessonId: selectedLesson.id,
                                completed: true,
                                quizScore: Number(lessonProgressMap.get(selectedLesson.id)?.quizScore || 0),
                              });
                            }}
                          >
                            Mark lesson complete
                          </Button>
                          {quizScore !== null && (
                            <Badge variant="secondary">Current score: {quizScore.toFixed(1)}%</Badge>
                          )}
                        </div>
                      </section>
                      <Separator />
                      <section>
                        <h4 className="font-semibold mb-2">Extension / Going further</h4>
                        <p className="text-sm">{selectedLesson.extension}</p>
                      </section>
                      <section>
                        <h4 className="font-semibold mb-2">Real-world connection (India)</h4>
                        <p className="text-sm">{selectedLesson.realWorldConnection}</p>
                      </section>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Course Manager</CardTitle>
                <CardDescription>Create, edit, publish/unpublish, and update lesson content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => seedBandAMutation.mutate()} disabled={seedBandAMutation.isPending}>
                    {seedBandAMutation.isPending ? "Seeding..." : "Seed/Refresh Band A"}
                  </Button>
                  <Button onClick={() => seedBandBMutation.mutate()} disabled={seedBandBMutation.isPending}>
                    {seedBandBMutation.isPending ? "Seeding..." : "Seed/Refresh Band B"}
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {adminCourses.map((course) => (
                    <Card key={course.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{bandLabel(course.band)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={course.isPublished ? "default" : "outline"}>
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdminCourseId(course.id);
                              setDraftCourse(course);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              publishCourseMutation.mutate({ courseId: course.id, isPublished: !course.isPublished })
                            }
                          >
                            {course.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Course editor</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Band</Label>
                      <Input
                        value={draftCourse.band ?? ""}
                        onChange={(event) => setDraftCourse((prev) => ({ ...prev, band: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade range</Label>
                      <Input
                        value={draftCourse.gradeRange ?? ""}
                        onChange={(event) => setDraftCourse((prev) => ({ ...prev, gradeRange: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={draftCourse.title ?? ""}
                      onChange={(event) => setDraftCourse((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={draftCourse.description ?? ""}
                      onChange={(event) => setDraftCourse((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overview</Label>
                    <Textarea
                      className="min-h-[140px]"
                      value={draftCourse.overview ?? ""}
                      onChange={(event) => setDraftCourse((prev) => ({ ...prev, overview: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <Textarea
                      value={draftCourse.prerequisites ?? ""}
                      onChange={(event) => setDraftCourse((prev) => ({ ...prev, prerequisites: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total duration minutes</Label>
                    <Input
                      type="number"
                      value={draftCourse.totalDurationMinutes ?? 0}
                      onChange={(event) =>
                        setDraftCourse((prev) => ({ ...prev, totalDurationMinutes: Number(event.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Glossary (JSON)</Label>
                    <Textarea
                      className="min-h-[120px]"
                      value={JSON.stringify(draftCourse.glossary ?? [], null, 2)}
                      onChange={(event) =>
                        setDraftCourse((prev) => ({ ...prev, glossary: safeJson(event.target.value, prev.glossary ?? []) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher guide (JSON)</Label>
                    <Textarea
                      className="min-h-[120px]"
                      value={JSON.stringify(draftCourse.teacherGuide ?? {}, null, 2)}
                      onChange={(event) =>
                        setDraftCourse((prev) => ({
                          ...prev,
                          teacherGuide: safeJson(event.target.value, prev.teacherGuide ?? {}),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capstone project (JSON)</Label>
                    <Textarea
                      className="min-h-[120px]"
                      value={JSON.stringify(draftCourse.capstoneProject ?? {}, null, 2)}
                      onChange={(event) =>
                        setDraftCourse((prev) => ({
                          ...prev,
                          capstoneProject: safeJson(event.target.value, prev.capstoneProject ?? {}),
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={() =>
                      saveCourseMutation.mutate({
                        ...draftCourse,
                        glossary: draftCourse.glossary ?? [],
                        teacherGuide: draftCourse.teacherGuide ?? {},
                        capstoneProject: draftCourse.capstoneProject ?? {},
                      })
                    }
                    disabled={saveCourseMutation.isPending}
                  >
                    {saveCourseMutation.isPending ? "Saving..." : "Save course"}
                  </Button>
                </div>

                {selectedAdminCourse && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold">Lesson editor</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedAdminCourse.lessons.map((lesson) => (
                          <Card key={lesson.id}>
                            <CardContent className="p-3 flex items-center justify-between gap-2">
                              <p className="text-sm">
                                {lesson.orderIndex}. {lesson.title}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAdminLessonId(lesson.id);
                                  setLessonDraft(lesson);
                                }}
                              >
                                Edit
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="grid gap-3">
                        <Input
                          placeholder="Order index"
                          type="number"
                          value={lessonDraft.orderIndex ?? 1}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({ ...prev, orderIndex: Number(event.target.value) }))
                          }
                        />
                        <Input
                          placeholder="Slug"
                          value={lessonDraft.slug ?? ""}
                          onChange={(event) => setLessonDraft((prev) => ({ ...prev, slug: event.target.value }))}
                        />
                        <Input
                          placeholder="Title"
                          value={lessonDraft.title ?? ""}
                          onChange={(event) => setLessonDraft((prev) => ({ ...prev, title: event.target.value }))}
                        />
                        <Textarea
                          placeholder="Hook"
                          className="min-h-[120px]"
                          value={lessonDraft.hook ?? ""}
                          onChange={(event) => setLessonDraft((prev) => ({ ...prev, hook: event.target.value }))}
                        />
                        <Textarea
                          placeholder="Concept explanation"
                          className="min-h-[220px]"
                          value={lessonDraft.conceptExplanation ?? ""}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({ ...prev, conceptExplanation: event.target.value }))
                          }
                        />
                        <Textarea
                          placeholder="Worked examples JSON"
                          className="min-h-[120px]"
                          value={JSON.stringify(lessonDraft.workedExamples ?? [], null, 2)}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({
                              ...prev,
                              workedExamples: safeJson(event.target.value, prev.workedExamples ?? []),
                            }))
                          }
                        />
                        <Textarea
                          placeholder="Activity JSON"
                          className="min-h-[120px]"
                          value={JSON.stringify(lessonDraft.activity ?? {}, null, 2)}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({
                              ...prev,
                              activity: safeJson(event.target.value, prev.activity ?? {}),
                            }))
                          }
                        />
                        <Textarea
                          placeholder="Discussion prompts JSON array"
                          className="min-h-[80px]"
                          value={JSON.stringify(lessonDraft.discussionPrompts ?? [], null, 2)}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({
                              ...prev,
                              discussionPrompts: safeJson(event.target.value, prev.discussionPrompts ?? []),
                            }))
                          }
                        />
                        <Textarea
                          placeholder="Quiz JSON"
                          className="min-h-[140px]"
                          value={JSON.stringify(lessonDraft.quiz ?? [], null, 2)}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({ ...prev, quiz: safeJson(event.target.value, prev.quiz ?? []) }))
                          }
                        />
                        <Textarea
                          placeholder="Extension"
                          value={lessonDraft.extension ?? ""}
                          onChange={(event) => setLessonDraft((prev) => ({ ...prev, extension: event.target.value }))}
                        />
                        <Textarea
                          placeholder="Real world connection"
                          value={lessonDraft.realWorldConnection ?? ""}
                          onChange={(event) =>
                            setLessonDraft((prev) => ({ ...prev, realWorldConnection: event.target.value }))
                          }
                        />
                        <Button
                          onClick={() =>
                            saveLessonMutation.mutate({
                              ...lessonDraft,
                              courseId: selectedAdminCourseId ?? undefined,
                              tags: lessonDraft.tags ?? [],
                              workedExamples: lessonDraft.workedExamples ?? [],
                              activity: lessonDraft.activity ?? {},
                              discussionPrompts: lessonDraft.discussionPrompts ?? [],
                              quiz: lessonDraft.quiz ?? [],
                            })
                          }
                          disabled={saveLessonMutation.isPending}
                        >
                          {saveLessonMutation.isPending ? "Saving..." : "Save lesson"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
