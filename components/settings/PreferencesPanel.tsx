"use client";

import { useTransition } from "react";
import { setUIPreferences } from "@/app/actions/preferences";
import { Card } from "@/design-system/components/surfaces/Card";
import { Text } from "@/design-system/components/data-display/Text";

export function PreferencesPanel() {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Text size="sm" tone="muted">Theme</Text>
        <select
          className="bg-bg text-fg border border-border rounded px-2 py-1"
          onChange={(e) => startTransition(() => {
            void setUIPreferences({ theme: e.target.value });
          })}
          disabled={pending}
          defaultValue="cafe-rey"
        >
          <option value="cafe-rey">Cafe Rey</option>
          <option value="cafe-rey-night">Cafe Rey Night</option>
          <option value="light">System / Default</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Text size="sm" tone="muted">UI scale</Text>
        <input
          type="range"
          min="0.9"
          max="1.15"
          step="0.05"
          defaultValue="1"
          onChange={(e) => startTransition(() => {
            void setUIPreferences({ scale: e.target.value });
          })}
          disabled={pending}
        />
      </div>

      {pending ? <Text size="xs" tone="muted">Updating…</Text> : null}
    </Card>
  );
}
