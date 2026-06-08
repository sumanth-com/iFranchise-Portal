export type MessageSection = "admin" | "review" | "support";

export type MessageThread = {
  id: string;
  section: MessageSection;
  title: string;
  preview: string;
  body: string;
  sender: string;
  date: string | null;
  href: string;
  brandName: string;
  replyEnabled: boolean;
};

export const MESSAGE_SECTION_LABELS: Record<MessageSection, string> = {
  admin: "Admin Messages",
  review: "Review Team Messages",
  support: "Support Messages",
};
