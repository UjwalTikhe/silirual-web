import { createFileRoute } from "@tanstack/react-router";
import SilirualApp from "@/components/SilirualApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SILIRUAL — Everyday Support with Care" },
      { name: "description", content: "An accessible companion for activities, memories, reminders and trusted care." },
      { property: "og:title", content: "SILIRUAL — Everyday Support with Care" },
      { property: "og:description", content: "A calm, accessible companion designed for elders and the people who care for them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SilirualApp,
});
