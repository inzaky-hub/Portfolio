export interface BilingualString {
  fr: string;
  en: string;
}

export interface SkillItem {
  name: BilingualString;
  level: BilingualString;
}

export interface SkillCategory {
  category: BilingualString;
  items: SkillItem[];
}

export interface ProjectMetrics {
  f1?: number;
  recall?: number;
  auc?: number;
  observations?: number;
}

export interface Project {
  id: string;
  featured: boolean;
  title: BilingualString;
  description: BilingualString;
  metrics?: ProjectMetrics;
  technologies: string[];
  link: string;
}

export interface ChatResponse {
  keywords: string[];
  response: BilingualString;
}

export interface ProfileData {
  name: string;           // 1–100 chars
  role: BilingualString;  // 1–100 chars each
  tagline: BilingualString;
  biography: BilingualString; // 1–2000 chars each
  skills: SkillCategory[];    // min 1 item
  projects: Project[];        // min 1 item
  chatResponses: Record<string, ChatResponse>; // min 1 key
}

export interface ProfileValidationError {
  field: string;
  message: string;
}
