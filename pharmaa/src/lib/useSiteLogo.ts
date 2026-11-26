"use client";

import { useEffect, useState } from 'react';
import { api } from './api';

const DEFAULT_LOGO = '/assets/images/Logo.png';
const CACHE_KEY = 'aura-site-logo';

// Logo managed from the dashboard (GET /api/settings). Falls back to the bundled logo.
// The last value is cached so returning visitors don't see the default logo flash.
export function useSiteLogo(): string | null {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setLogo(cached);
    } catch {
      // storage unavailable
    }
    api
      .get<{ data: { logo: string | null } }>('/settings')
      .then((res) => {
        if (cancelled) return;
        const value = res.data?.logo || DEFAULT_LOGO;
        setLogo(value);
        try {
          if (res.data?.logo) localStorage.setItem(CACHE_KEY, res.data.logo);
          else localStorage.removeItem(CACHE_KEY);
        } catch {
          // quota exceeded / storage unavailable
        }
      })
      .catch(() => {
        if (!cancelled) setLogo((current) => current || DEFAULT_LOGO);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return logo;
}
