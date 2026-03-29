import { SupabaseClient } from "@supabase/supabase-js";
import { LearningRepository } from "@/domain/repositories/learning-repository";
import {
  Cohort,
  Course,
  CourseEnrollment,
  CourseLesson,
  CourseModule,
  SubscriptionTierName,
  WaitlistEntry,
} from "@/domain/types";

type CourseRow = {
  id: string;
  creator_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price_inr: number;
  visibility_tier: SubscriptionTierName | null;
  status: Course["status"];
  cover_image_url: string | null;
  module_count: number;
  lesson_count: number;
  enrollment_count: number;
  is_enrolled: boolean;
  created_at: string;
  creator_handle: string | null;
  creator_name: string | null;
};

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    creatorId: row.creator_id,
    creatorHandle: row.creator_handle ?? "creator",
    creatorName: row.creator_name ?? row.creator_handle ?? "Creator",
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    priceInr: Number(row.price_inr ?? 0),
    visibilityTier: row.visibility_tier,
    status: row.status,
    coverImageUrl: row.cover_image_url,
    moduleCount: Number(row.module_count ?? 0),
    lessonCount: Number(row.lesson_count ?? 0),
    enrollmentCount: Number(row.enrollment_count ?? 0),
    isEnrolled: Boolean(row.is_enrolled),
    createdAt: row.created_at,
  };
}

export class SupabaseLearningRepository implements LearningRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listCourses(_viewerId: string, options?: { creatorId?: string; limit?: number }): Promise<Course[]> {
    const { data, error } = await this.supabase.rpc("list_courses_for_viewer", {
      p_limit: options?.limit ?? 20,
      p_creator_id: options?.creatorId ?? null,
    });
    if (error) throw error;
    return ((data as CourseRow[]) ?? []).map(toCourse);
  }

  async listCourseModules(courseId: string): Promise<CourseModule[]> {
    const { data, error } = await this.supabase
      .from("course_modules")
      .select("id, course_id, title, description, position")
      .eq("course_id", courseId)
      .order("position", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      courseId: row.course_id,
      title: row.title,
      description: row.description,
      position: row.position,
    }));
  }

  async listCourseLessons(courseId: string): Promise<CourseLesson[]> {
    const { data, error } = await this.supabase
      .from("course_lessons")
      .select("id, course_id, module_id, title, description, video_url, duration_minutes, position, discussion_locked")
      .eq("course_id", courseId)
      .order("position", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      courseId: row.course_id,
      moduleId: row.module_id,
      title: row.title,
      description: row.description,
      videoUrl: row.video_url,
      durationMinutes: row.duration_minutes,
      position: row.position,
      discussionLocked: row.discussion_locked,
    }));
  }

  async listCohorts(courseId: string): Promise<Cohort[]> {
    const { data, error } = await this.supabase.rpc("list_course_cohorts", { p_course_id: courseId });
    if (error) throw error;
    return ((data ?? []) as Array<{ id: string; course_id: string; title: string; starts_at: string; seat_limit: number; waitlist_enabled: boolean; enrolled_count: number }>).map((row) => ({
      id: row.id,
      courseId: row.course_id,
      title: row.title,
      startsAt: row.starts_at,
      seatLimit: row.seat_limit,
      waitlistEnabled: row.waitlist_enabled,
      enrolledCount: Number(row.enrolled_count ?? 0),
    }));
  }

  async createCourse(input: {
    creatorId: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    priceInr?: number;
    visibilityTier?: SubscriptionTierName | null;
    coverImageUrl?: string | null;
  }): Promise<Course> {
    const { data, error } = await this.supabase
      .from("courses")
      .insert({
        creator_id: input.creatorId,
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() || null,
        description: input.description?.trim() || null,
        price_inr: input.priceInr ?? 0,
        visibility_tier: input.visibilityTier ?? null,
        cover_image_url: input.coverImageUrl ?? null,
        status: "published",
      })
      .select("id, creator_id, title, subtitle, description, price_inr, visibility_tier, status, cover_image_url, created_at")
      .single();
    if (error) throw error;

    const { data: profile } = await this.supabase.from("profiles").select("handle, name").eq("id", input.creatorId).maybeSingle();
    return toCourse({
      ...(data as Omit<CourseRow, "module_count" | "lesson_count" | "enrollment_count" | "is_enrolled" | "creator_handle" | "creator_name">),
      module_count: 0,
      lesson_count: 0,
      enrollment_count: 0,
      is_enrolled: false,
      creator_handle: profile?.handle ?? null,
      creator_name: profile?.name ?? null,
    });
  }

  async addCourseModule(input: { courseId: string; title: string; description?: string | null }): Promise<CourseModule> {
    const { count } = await this.supabase.from("course_modules").select("*", { head: true, count: "exact" }).eq("course_id", input.courseId);
    const { data, error } = await this.supabase
      .from("course_modules")
      .insert({
        course_id: input.courseId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        position: (count ?? 0) + 1,
      })
      .select("id, course_id, title, description, position")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      position: data.position,
    };
  }

  async addCourseLesson(input: {
    courseId: string;
    moduleId: string;
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    durationMinutes?: number | null;
  }): Promise<CourseLesson> {
    const { count } = await this.supabase.from("course_lessons").select("*", { head: true, count: "exact" }).eq("module_id", input.moduleId);
    const { data, error } = await this.supabase
      .from("course_lessons")
      .insert({
        course_id: input.courseId,
        module_id: input.moduleId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        video_url: input.videoUrl ?? null,
        duration_minutes: input.durationMinutes ?? null,
        position: (count ?? 0) + 1,
      })
      .select("id, course_id, module_id, title, description, video_url, duration_minutes, position, discussion_locked")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      courseId: data.course_id,
      moduleId: data.module_id,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      durationMinutes: data.duration_minutes,
      position: data.position,
      discussionLocked: data.discussion_locked,
    };
  }

  async createCohort(input: {
    courseId: string;
    title: string;
    startsAt: string;
    seatLimit?: number;
    waitlistEnabled?: boolean;
  }): Promise<Cohort> {
    const { data, error } = await this.supabase
      .from("cohorts")
      .insert({
        course_id: input.courseId,
        title: input.title.trim(),
        starts_at: input.startsAt,
        seat_limit: input.seatLimit ?? 50,
        waitlist_enabled: input.waitlistEnabled ?? true,
      })
      .select("id, course_id, title, starts_at, seat_limit, waitlist_enabled")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      startsAt: data.starts_at,
      seatLimit: data.seat_limit,
      waitlistEnabled: data.waitlist_enabled,
      enrolledCount: 0,
    };
  }

  async enrollInCourse(input: { courseId: string; userId: string }): Promise<CourseEnrollment> {
    const { data, error } = await this.supabase
      .from("course_enrollments")
      .upsert(
        {
          course_id: input.courseId,
          user_id: input.userId,
          status: "active",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "course_id,user_id" }
      )
      .select("id, course_id, user_id, status, enrolled_at, progress_percent")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      courseId: data.course_id,
      userId: data.user_id,
      status: data.status,
      enrolledAt: data.enrolled_at,
      progressPercent: Number(data.progress_percent ?? 0),
    };
  }

  async joinCohortWaitlist(input: { cohortId: string; userId: string }): Promise<WaitlistEntry> {
    const { data, error } = await this.supabase
      .from("cohort_waitlist")
      .upsert(
        {
          cohort_id: input.cohortId,
          user_id: input.userId,
        },
        { onConflict: "cohort_id,user_id" }
      )
      .select("id, cohort_id, user_id, created_at")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      cohortId: data.cohort_id,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  }
}
