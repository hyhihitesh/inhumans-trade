import {
  Cohort,
  Course,
  CourseEnrollment,
  CourseLesson,
  CourseModule,
  WaitlistEntry,
  SubscriptionTierName,
} from "@/domain/types";

export interface LearningRepository {
  listCourses(viewerId: string, options?: { creatorId?: string; limit?: number }): Promise<Course[]>;
  listCourseModules(courseId: string): Promise<CourseModule[]>;
  listCourseLessons(courseId: string): Promise<CourseLesson[]>;
  listCohorts(courseId: string): Promise<Cohort[]>;
  createCourse(input: {
    creatorId: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    priceInr?: number;
    visibilityTier?: SubscriptionTierName | null;
    coverImageUrl?: string | null;
  }): Promise<Course>;
  addCourseModule(input: {
    courseId: string;
    title: string;
    description?: string | null;
  }): Promise<CourseModule>;
  addCourseLesson(input: {
    courseId: string;
    moduleId: string;
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    durationMinutes?: number | null;
  }): Promise<CourseLesson>;
  createCohort(input: {
    courseId: string;
    title: string;
    startsAt: string;
    seatLimit?: number;
    waitlistEnabled?: boolean;
  }): Promise<Cohort>;
  enrollInCourse(input: { courseId: string; userId: string }): Promise<CourseEnrollment>;
  joinCohortWaitlist(input: { cohortId: string; userId: string }): Promise<WaitlistEntry>;
}
