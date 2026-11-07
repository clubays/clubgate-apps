import { CHAPTERS_DIFF } from "./chapters-diff";
import { CHAPTERS_INT } from "./chapters-int";
import { CHAPTERS_ADV } from "./chapters-advanced";
import { Chapter, FlatLessonItem } from "../types/curriculum";

export const CHAPTERS: Chapter[] = [...CHAPTERS_DIFF, ...CHAPTERS_INT, ...CHAPTERS_ADV];

export function getFlatLessons(): FlatLessonItem[] {
  const list: FlatLessonItem[] = [];
  for (const chap of CHAPTERS) {
    if (chap.status === "soon") continue;
    for (const les of chap.lessons) {
      list.push({ chapter: chap, lesson: les, path: `${chap.id}/${les.id}` });
    }
  }
  return list;
}

export function getChapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getLessonById(chapId: string, lessonId: string) {
  const chap = getChapterById(chapId);
  if (!chap) return null;
  const lesson = chap.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { chapter: chap, lesson };
}
