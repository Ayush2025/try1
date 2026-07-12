import { type SeedBand, type SeedLesson } from "./types";

type ValidationResult = {
  passed: boolean;
  errors: string[];
  metrics: {
    hookWordCount: number;
    conceptWordCount: number;
    discussionPromptCount: number;
    quizCount: number;
    misconceptionMentions: number;
  };
};

const thirdPartyPatterns = [
  /\bncert\b/i,
  /\bday\s*of\s*ai\b/i,
  /\bstempedia\b/i,
  /\bbyju'?s\b/i,
  /\bkhan\s+academy\b/i,
  /\bcoursera\b/i,
  /\budemy\b/i,
  /\bgoogle\s+classroom\b/i,
];

function wordCount(text: string) {
  return text.split(/\s+/).map((token) => token.trim()).filter(Boolean).length;
}

export function validateLesson(lesson: SeedLesson, band: SeedBand): ValidationResult {
  const errors: string[] = [];
  const hookWordCount = wordCount(lesson.hook);
  const conceptWordCount = wordCount(lesson.conceptExplanation);
  const discussionPromptCount = lesson.discussionPrompts.length;
  const quizCount = lesson.quiz.length;
  const misconceptionMentions = (lesson.conceptExplanation.match(/misconception/gi) || []).length;

  const conceptMin = band === "band-c" || band === "band-d" ? 1200 : 900;
  const conceptMax = band === "band-c" || band === "band-d" ? 2000 : 1500;

  if (hookWordCount < 150 || hookWordCount > 250) {
    errors.push(`Hook word count out of range (150-250): ${hookWordCount}`);
  }
  if (conceptWordCount < conceptMin || conceptWordCount > conceptMax) {
    errors.push(`Concept word count out of range (${conceptMin}-${conceptMax}): ${conceptWordCount}`);
  }
  if (misconceptionMentions < 2) {
    errors.push(`Expected at least 2 explicit misconception mentions, found ${misconceptionMentions}`);
  }
  if (!lesson.workedExamples.length || lesson.workedExamples.every((example) => example.steps.length < 3)) {
    errors.push("At least one worked example with step-by-step detail is required");
  }
  if (
    !lesson.activity.title ||
    !lesson.activity.materials.length ||
    !lesson.activity.steps.length ||
    !lesson.activity.successCriteria.length ||
    !lesson.activity.facilitationNotes.length ||
    !Number.isFinite(lesson.activity.estimatedTimeMinutes)
  ) {
    errors.push("Activity must include title, materials, time estimate, steps, success criteria, and facilitation notes");
  }
  if (discussionPromptCount < 2 || discussionPromptCount > 3) {
    errors.push(`Discussion prompts must be 2-3, found ${discussionPromptCount}`);
  }
  if (quizCount < 8 || quizCount > 10) {
    errors.push(`Quiz must contain 8-10 questions, found ${quizCount}`);
  }
  const quizTypes = new Set(lesson.quiz.map((question) => question.type));
  if (!quizTypes.has("mcq") || !quizTypes.has("short") || !quizTypes.has("scenario")) {
    errors.push("Quiz must include mixed formats: mcq, short, and scenario");
  }
  if (lesson.quiz.some((question) => !question.explanation?.trim())) {
    errors.push("Every quiz question must include an explanation");
  }
  if (!lesson.extension.trim()) {
    errors.push("Extension task is required");
  }
  if (!lesson.realWorldConnection.trim()) {
    errors.push("Real-world connection is required");
  }
  if (thirdPartyPatterns.some((pattern) => pattern.test(JSON.stringify(lesson)))) {
    errors.push("Lesson contains restricted third-party curriculum/platform names");
  }

  return {
    passed: errors.length === 0,
    errors,
    metrics: {
      hookWordCount,
      conceptWordCount,
      discussionPromptCount,
      quizCount,
      misconceptionMentions,
    },
  };
}

export function validateCourseLessons(lessons: SeedLesson[], band: SeedBand) {
  const results = lessons.map((lesson) => ({ lesson: lesson.title, ...validateLesson(lesson, band) }));
  const failures = results.filter((result) => !result.passed);
  if (failures.length > 0) {
    const message = failures
      .map((failure) => `${failure.lesson}: ${failure.errors.join("; ")}`)
      .join(" | ");
    throw new Error(`Lesson validation failed for ${band}: ${message}`);
  }
  return results;
}
