import type { ProfileData, ProfileValidationError } from '../types/profile';

function isBilingualString(val: unknown): val is { fr: string; en: string } {
  return (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as Record<string, unknown>).fr === 'string' &&
    typeof (val as Record<string, unknown>).en === 'string'
  );
}

export function validate(data: unknown): ProfileValidationError[] {
  const errors: ProfileValidationError[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push({ field: 'root', message: 'ProfileData must be a non-null object' });
    return errors;
  }

  const d = data as Record<string, unknown>;

  // name: string, 1–100 chars
  if (typeof d.name !== 'string' || d.name.length < 1 || d.name.length > 100) {
    errors.push({ field: 'name', message: 'name must be a string between 1 and 100 characters' });
  }

  // role: BilingualString, each 1–100 chars
  if (!isBilingualString(d.role) || d.role.fr.length < 1 || d.role.fr.length > 100 || d.role.en.length < 1 || d.role.en.length > 100) {
    errors.push({ field: 'role', message: 'role must be a BilingualString with fr and en each 1–100 characters' });
  }

  // biography: BilingualString, each 1–2000 chars
  if (!isBilingualString(d.biography) || d.biography.fr.length < 1 || d.biography.fr.length > 2000 || d.biography.en.length < 1 || d.biography.en.length > 2000) {
    errors.push({ field: 'biography', message: 'biography must be a BilingualString with fr and en each 1–2000 characters' });
  }

  // skills: array, min 1 item
  if (!Array.isArray(d.skills) || d.skills.length < 1) {
    errors.push({ field: 'skills', message: 'skills must be an array with at least 1 item' });
  }

  // projects: array, min 1 item
  if (!Array.isArray(d.projects) || d.projects.length < 1) {
    errors.push({ field: 'projects', message: 'projects must be an array with at least 1 item' });
  }

  // chatResponses: object, min 1 key
  if (
    typeof d.chatResponses !== 'object' ||
    d.chatResponses === null ||
    Array.isArray(d.chatResponses) ||
    Object.keys(d.chatResponses as object).length < 1
  ) {
    errors.push({ field: 'chatResponses', message: 'chatResponses must be an object with at least 1 key' });
  }

  return errors;
}

export function isValid(data: unknown): data is ProfileData {
  return validate(data).length === 0;
}
