export type SeedBand = "band-a" | "band-b" | "band-c" | "band-d";

export type SeedQuizQuestion = {
  type: "mcq" | "short" | "scenario";
  question: string;
  options?: string[];
  answer?: string;
  answerKeywords?: string[];
  explanation: string;
};

export type SeedLesson = {
  orderIndex: number;
  slug: string;
  title: string;
  estimatedDurationMinutes: number;
  tags: string[];
  hook: string;
  conceptExplanation: string;
  workedExamples: Array<{ title: string; steps: string[]; summary: string }>;
  activity: {
    title: string;
    materials: string[];
    estimatedTimeMinutes: number;
    steps: string[];
    successCriteria: string[];
    facilitationNotes: string[];
  };
  discussionPrompts: string[];
  quiz: SeedQuizQuestion[];
  extension: string;
  realWorldConnection: string;
};

export type SeedCourse = {
  band: SeedBand;
  gradeRange: string;
  title: string;
  description: string;
  prerequisites: string;
  totalDurationMinutes: number;
  overview: string;
  glossary: Array<{ term: string; definition: string }>;
  teacherGuide: Record<string, unknown>;
  capstoneProject: Record<string, unknown>;
  lessons: SeedLesson[];
};
