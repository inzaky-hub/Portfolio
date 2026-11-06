import { useState, useEffect } from 'react';
import type { ProfileData, ProfileValidationError } from '../types/profile';
import { validate } from '../utils/profileValidator';

interface UseProfileDataResult {
  data: ProfileData | null;
  error: ProfileValidationError | null;
  loading: boolean;
}

export function useProfileData(): UseProfileDataResult {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<ProfileValidationError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/profil.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load profil.json: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        const errors = validate(raw);
        if (errors.length > 0) {
          errors.forEach((e) => {
            console.error(`[ProfileData] validation error — field "${e.field}": ${e.message}`);
          });
          setError(errors[0]);
          setData(null);
        } else {
          setData(raw as ProfileData);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Unknown error loading profil.json';
        console.error(`[ProfileData] load error: ${message}`);
        setError({ field: 'load', message });
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading };
}

export default useProfileData;
