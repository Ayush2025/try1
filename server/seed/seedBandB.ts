import { type IStorage } from "../storage";
import { bandBCourseSeed } from "./bandBContent";
import { validateCourseLessons } from "./validateLesson";

export async function seedOrUpdateBandB(storage: IStorage, creatorId: string) {
  validateCourseLessons(bandBCourseSeed.lessons, "band-b");

  const existingCourses = await storage.listAllAiCourses();
  const existingBandB = existingCourses.find(
    (course) => course.band === "band-b" && course.title === bandBCourseSeed.title,
  );

  let courseId: number;
  if (existingBandB) {
    const updatedCourse = await storage.updateAiCourse(existingBandB.id, {
      band: bandBCourseSeed.band as any,
      gradeRange: bandBCourseSeed.gradeRange,
      title: bandBCourseSeed.title,
      description: bandBCourseSeed.description,
      overview: bandBCourseSeed.overview,
      prerequisites: bandBCourseSeed.prerequisites,
      totalDurationMinutes: bandBCourseSeed.totalDurationMinutes,
      glossary: bandBCourseSeed.glossary as any,
      teacherGuide: bandBCourseSeed.teacherGuide as any,
      capstoneProject: bandBCourseSeed.capstoneProject as any,
      isPublished: true,
      createdBy: existingBandB.createdBy ?? creatorId,
    });
    courseId = updatedCourse.id;
  } else {
    const course = await storage.createAiCourse({
      band: bandBCourseSeed.band as any,
      gradeRange: bandBCourseSeed.gradeRange,
      title: bandBCourseSeed.title,
      description: bandBCourseSeed.description,
      overview: bandBCourseSeed.overview,
      prerequisites: bandBCourseSeed.prerequisites,
      totalDurationMinutes: bandBCourseSeed.totalDurationMinutes,
      glossary: bandBCourseSeed.glossary as any,
      teacherGuide: bandBCourseSeed.teacherGuide as any,
      capstoneProject: bandBCourseSeed.capstoneProject as any,
      isPublished: true,
      createdBy: creatorId,
    });
    courseId = course.id;
  }

  const existingLessons = await storage.listAiLessonsByCourse(courseId);
  for (const lesson of existingLessons) {
    await storage.deleteAiLesson(lesson.id);
  }

  for (const lesson of bandBCourseSeed.lessons) {
    await storage.createAiLesson({
      courseId,
      orderIndex: lesson.orderIndex,
      slug: lesson.slug,
      title: lesson.title,
      estimatedDurationMinutes: lesson.estimatedDurationMinutes,
      tags: lesson.tags as any,
      hook: lesson.hook,
      conceptExplanation: lesson.conceptExplanation,
      workedExamples: lesson.workedExamples as any,
      activity: lesson.activity as any,
      discussionPrompts: lesson.discussionPrompts as any,
      quiz: lesson.quiz as any,
      extension: lesson.extension,
      realWorldConnection: lesson.realWorldConnection,
    });
  }

  return storage.getAiCourseWithLessons(courseId);
}
