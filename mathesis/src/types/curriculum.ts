export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  no?: number;
  widget?: {
    id: string;
    props?: Record<string, any>;
    caption?: string;
  };
  blocks: Block[];
}

export interface Block {
  type: "h2" | "p" | "callout" | "eq" | "widget" | "details" | "example" | "mistakes" | "practice" | "recap";
  x?: string;
  title?: string;
  k?: "definition" | "theorem" | "tip" | "warning";
  name?: string;
  sheet?: boolean;
  id?: string;
  props?: Record<string, any>;
  steps?: string[];
  answer?: string;
  items?: any[];
}

export interface PracticeProblem {
  q: string;
  steps: string[];
  a: string;
}

export interface Chapter {
  id: string;
  no: number;
  title: string;
  blurb: string;
  status: "ready" | "soon";
  lessons: Lesson[];
}

export interface FlatLessonItem {
  chapter: Chapter;
  lesson: Lesson;
  path: string;
}
