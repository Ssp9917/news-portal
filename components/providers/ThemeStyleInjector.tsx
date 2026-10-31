"use client";

import { useEffect, useState } from "react";

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  darkBg?: string;
  lightBg?: string;
  borderRadius?: string;
  glassBlur?: string;
  glassOpacity?: number;
}

export default function ThemeStyleInjector({
  initialTheme,
}: {
  initialTheme?: ThemeSettings | null;
}) {
  const [theme, setTheme] = useState<ThemeSettings | null>(initialTheme || null);

  useEffect(() => {
    // Listen for live preview changes triggered from the Theme Customizer
    const handleThemeUpdate = (e: CustomEvent<ThemeSettings>) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };

    window.addEventListener(
      "dl-theme-preview" as unknown as keyof WindowEventMap,
      handleThemeUpdate as EventListener
    );

    // If initialTheme wasn't provided, fetch published theme from API
    if (!initialTheme) {
      fetch("/api/admin/theme")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.isPublished) {
            setTheme(data);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener(
        "dl-theme-preview" as unknown as keyof WindowEventMap,
        handleThemeUpdate as EventListener
      );
    };
  }, [initialTheme]);

  if (!theme) return null;

  const css = `
    :root {
      ${theme.primaryColor ? `--theme-primary: ${theme.primaryColor};` : ""}
      ${theme.secondaryColor ? `--theme-secondary: ${theme.secondaryColor};` : ""}
      ${theme.accentColor ? `--theme-accent: ${theme.accentColor};` : ""}
      ${theme.borderRadius ? `--theme-radius: ${theme.borderRadius};` : ""}
      ${theme.glassBlur ? `--theme-blur: ${theme.glassBlur};` : ""}
      ${theme.glassOpacity ? `--theme-glass-opacity: ${theme.glassOpacity};` : ""}
      ${theme.lightBg ? `--background: ${theme.lightBg};` : ""}
    }
    .dark {
      ${theme.darkBg ? `--background: ${theme.darkBg};` : ""}
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
