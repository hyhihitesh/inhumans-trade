import { BookOpen, Clock3, GraduationCap, Users } from "lucide-react";
import {
  addCourseLessonAction,
  addCourseModuleAction,
  createCohortAction,
  createCourseAction,
  enrollInCourseAction,
  joinCohortWaitlistAction,
} from "@/app/(protected)/app/courses/actions";
import { SupabaseLearningRepository } from "@/domain/datasources/supabase-learning";
import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUserProfile("/app/courses");
  const repo = new SupabaseLearningRepository(await createClient());
  const courses = await repo.listCourses(profile.id, { creatorId: profile.role === "creator" ? profile.id : undefined });
  const expanded = await Promise.all(
    courses.map(async (course) => ({
      course,
      modules: await repo.listCourseModules(course.id),
      lessons: await repo.listCourseLessons(course.id),
      cohorts: await repo.listCohorts(course.id),
    }))
  );

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Courses & Cohorts</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Recorded curriculum with cohort operations built into the creator stack</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Courses stay close to subscriptions and verified trading context. Creators can publish structured lessons, while learners can enroll, track access, and join waitlists for cohorts.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      {profile.role === "creator" ? (
        <form action={createCourseAction} className="grid gap-3 rounded-2xl border border-border bg-card p-5 lg:grid-cols-2">
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-lg font-semibold">Publish a course</h2>
          </div>
          <input name="title" placeholder="Price action playbook" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input name="subtitle" placeholder="Short subtitle" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <textarea
            name="description"
            rows={4}
            placeholder="What the learner gets, why it matters, how the course is structured."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm lg:col-span-2"
          />
          <input name="priceInr" type="number" min={0} placeholder="Price INR" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <select name="visibilityTier" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">No extra tier gate</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <input
            name="coverImageUrl"
            placeholder="Optional cover image URL"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm lg:col-span-2"
          />
          <button className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create course</button>
        </form>
      ) : null}

      <div className="space-y-5">
        {expanded.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            No courses are live yet. Once creators publish curriculum, this area will become the long-form learning layer for Inhumans.
          </div>
        ) : (
          expanded.map(({ course, modules, lessons, cohorts }) => (
            <article key={course.id} className="space-y-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <BookOpen size={14} />
                    @{course.creatorHandle}
                  </div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-sm text-muted-foreground">{course.description || "Course description coming soon."}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1">{course.moduleCount} modules</span>
                    <span className="rounded-full border border-border px-2 py-1">{course.lessonCount} lessons</span>
                    <span className="rounded-full border border-border px-2 py-1">{course.enrollmentCount} learners</span>
                    {course.visibilityTier ? <span className="rounded-full border border-border px-2 py-1">Tier {course.visibilityTier}</span> : null}
                    <span className="rounded-full border border-border px-2 py-1">INR {course.priceInr}</span>
                  </div>
                </div>

                {profile.role === "follower" ? (
                  <form action={enrollInCourseAction}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      {course.isEnrolled ? "Re-open course" : "Enroll now"}
                    </button>
                  </form>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                  <h3 className="text-sm font-semibold">Curriculum</h3>
                  {modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No modules yet.</p>
                  ) : (
                    modules.map((module) => (
                      <div key={module.id} className="rounded-lg border border-border bg-card p-3">
                        <p className="text-sm font-semibold">{module.position}. {module.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{module.description || "No module notes yet."}</p>
                        <div className="mt-2 space-y-2">
                          {lessons
                            .filter((lesson) => lesson.moduleId === module.id)
                            .map((lesson) => (
                              <div key={lesson.id} className="rounded-md border border-border px-3 py-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <span>{lesson.position}. {lesson.title}</span>
                                  <span className="text-xs text-muted-foreground">{lesson.durationMinutes ?? 0} min</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                  <h3 className="text-sm font-semibold">Cohorts</h3>
                  {cohorts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No cohorts scheduled yet.</p>
                  ) : (
                    cohorts.map((cohort) => (
                      <div key={cohort.id} className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{cohort.title}</p>
                          <span className="text-xs text-muted-foreground">{cohort.enrolledCount}/{cohort.seatLimit}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(cohort.startsAt)}</p>
                        {profile.role === "follower" ? (
                          <form action={joinCohortWaitlistAction} className="mt-3">
                            <input type="hidden" name="cohortId" value={cohort.id} />
                            <button className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                              Join waitlist
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {profile.role === "creator" ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  <form action={addCourseModuleAction} className="space-y-3 rounded-xl border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold">Add module</h3>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input name="title" placeholder="Module title" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <textarea name="description" rows={3} placeholder="Module description" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Save module</button>
                  </form>

                  <form action={addCourseLessonAction} className="space-y-3 rounded-xl border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold">Add lesson</h3>
                    <input type="hidden" name="courseId" value={course.id} />
                    <select name="moduleId" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
                      <option value="">Choose module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                    <input name="title" placeholder="Lesson title" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <input name="videoUrl" placeholder="Lesson video URL" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <input name="durationMinutes" type="number" min={1} placeholder="Minutes" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    </div>
                    <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Save lesson</button>
                  </form>

                  <form action={createCohortAction} className="space-y-3 rounded-xl border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold">Create cohort</h3>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input name="title" placeholder="July cohort" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <input name="startsAt" type="datetime-local" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <input name="seatLimit" type="number" min={1} placeholder="Seat limit" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" name="waitlistEnabled" defaultChecked />
                      Enable waitlist
                    </label>
                    <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Publish cohort</button>
                  </form>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><GraduationCap size={16} /> Recorded modules</div>
          <p className="mt-2 text-sm text-muted-foreground">Course pages are storage-video ready and can later move to richer lesson delivery without changing the domain shape.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Users size={16} /> Cohort ops</div>
          <p className="mt-2 text-sm text-muted-foreground">Seat caps, waitlists, and enrollment state are modeled now so later automation can stay incremental.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={16} /> Progress-friendly</div>
          <p className="mt-2 text-sm text-muted-foreground">Lesson progress tables are in place even though the first UI pass focuses on publishing and enrollment, not certificates.</p>
        </div>
      </div>
    </section>
  );
}
