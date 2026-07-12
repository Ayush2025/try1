import { type IStorage } from "../storage";
import { bandACourseSeed } from "./bandAContent";

export async function seedOrUpdateBandA(storage: IStorage, creatorId: string) {
  const existingCourses = await storage.listAllAiCourses();
  const existingBandA = existingCourses.find(
    (course) => course.band === "band-a" && course.title === bandACourseSeed.title,
  );

  let courseId: number;
  if (existingBandA) {
    const updatedCourse = await storage.updateAiCourse(existingBandA.id, {
      band: bandACourseSeed.band as any,
      gradeRange: bandACourseSeed.gradeRange,
      title: bandACourseSeed.title,
      description: bandACourseSeed.description,
      overview: bandACourseSeed.overview,
      prerequisites: bandACourseSeed.prerequisites,
      totalDurationMinutes: bandACourseSeed.totalDurationMinutes,
      glossary: bandACourseSeed.glossary as any,
      teacherGuide: bandACourseSeed.teacherGuide as any,
      capstoneProject: bandACourseSeed.capstoneProject as any,
      isPublished: true,
      createdBy: existingBandA.createdBy ?? creatorId,
    });
    courseId = updatedCourse.id;
  } else {
    const course = await storage.createAiCourse({
      band: bandACourseSeed.band as any,
      gradeRange: bandACourseSeed.gradeRange,
      title: bandACourseSeed.title,
      description: bandACourseSeed.description,
      overview: bandACourseSeed.overview,
      prerequisites: bandACourseSeed.prerequisites,
      totalDurationMinutes: bandACourseSeed.totalDurationMinutes,
      glossary: bandACourseSeed.glossary as any,
      teacherGuide: bandACourseSeed.teacherGuide as any,
      capstoneProject: bandACourseSeed.capstoneProject as any,
      isPublished: true,
      createdBy: creatorId,
    });
    courseId = course.id;
  }

  const existingLessons = await storage.listAiLessonsByCourse(courseId);
  for (const lesson of existingLessons) {
    await storage.deleteAiLesson(lesson.id);
  }

  for (const lesson of bandACourseSeed.lessons) {
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
