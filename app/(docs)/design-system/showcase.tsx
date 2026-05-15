"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/actions/Button";
import { ButtonGroup } from "@/design-system/components/actions/ButtonGroup";
import { Card } from "@/design-system/components/surfaces/Card";
import { Text } from "@/design-system/components/data-display/Text";
import { Divider } from "@/design-system/components/data-display/Divider";
import { Badge } from "@/design-system/components/data-display/Badge";
import { Chip } from "@/design-system/components/data-display/Chip";
import { Input } from "@/design-system/components/forms/Input";
import { Textarea } from "@/design-system/components/forms/Textarea";
import { Modal } from "@/design-system/components/overlay/Modal";
import { Alert } from "@/design-system/components/feedback/Alert";
import { useToast } from "@/design-system/components/feedback/Toast";

export function Showcase() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="max-w-6xl space-y-10">
      <header className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-2">
          <Text as="h1" variant="display" className="tracking-tight">Design System</Text>
          <Text tone="muted">A quick visual grid for foundations + core components.</Text>
        </div>
        <Button variant="secondary" href="/">Back home</Button>
      </header>

      <section className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <Text as="h2" variant="h2" className="font-display">Typography</Text>
          <Divider />
          <Text variant="display">Display — Archivo</Text>
          <Text variant="h1" className="font-display">H1 — Archivo</Text>
          <Text variant="h2" className="font-display">H2 — Archivo</Text>
          <Text>
            Body — Ubuntu. The universe is weird, and that’s a feature, not a bug.
          </Text>
          <Text tone="muted" size="sm">Muted small text for captions and helper copy.</Text>
          <Text as="code" className="font-mono text-sm bg-muted px-2 py-1 rounded">ID: GENDIS-00042</Text>
        </Card>

        <Card className="p-6 space-y-4">
          <Text as="h2" variant="h2" className="font-display">Actions</Text>
          <Divider />
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <ButtonGroup>
            <Button size="sm">One</Button>
            <Button size="sm" variant="secondary">Two</Button>
            <Button size="sm" variant="secondary">Three</Button>
          </ButtonGroup>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge>Badge</Badge>
            <Badge tone="danger">Critical</Badge>
            <Chip>Chip</Chip>
            <Chip tone="success">Approved</Chip>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <Text as="h2" variant="h2" className="font-display">Forms</Text>
          <Divider />
          <Input label="Project name" placeholder="ProTransición" />
          <Input label="Email" placeholder="name@domain.com" />
          <Textarea label="Notes" placeholder="Write something useful…" />
        </Card>

        <Card className="p-6 space-y-4">
          <Text as="h2" variant="h2" className="font-display">Overlays + Feedback</Text>
          <Divider />

          <Alert title="Heads up" tone="info">
            This is a minimal skeleton. Expand components gradually, but keep tokens consistent.
          </Alert>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setOpen(true)}>Open Modal</Button>
            <Button onClick={() => toast({ title: "Saved", description: "Your changes are live." })}>
              Show Toast
            </Button>
          </div>

          <Modal
            open={open}
            onOpenChange={setOpen}
            title="Modal title"
            description="Native <dialog> backed modal with token-driven styling."
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast({ title: "Done", description: "Modal confirmed." }); }}>
                  Confirm
                </Button>
              </div>
            }
          >
            <Text tone="muted">
              Put any content here. For larger projects, you&apos;ll likely swap this to Radix Dialog for more features.
            </Text>
          </Modal>
        </Card>
      </section>
    </div>
  );
}
