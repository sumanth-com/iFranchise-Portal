import type {
  AdminNotificationCategory,
  AdminNotificationMessage,
} from "./types";

type BuildMessageInput = {
  category: AdminNotificationCategory;
  brandName?: string;
  ownerName?: string;
  brandOwnerCount?: number;
  adminName: string;
};

export function buildAdminNotificationMessage(
  input: BuildMessageInput,
): AdminNotificationMessage {
  const { category, brandName, ownerName, brandOwnerCount = 0, adminName } =
    input;
  const greetingName = adminName.trim() || "Marketplace Admin";

  if (category === "owner_activity") {
    const count = brandOwnerCount;
    const ownerLabel = count === 1 ? "brand owner has" : "brand owners have";

    return {
      greetingName,
      paragraphs: [
        `We are pleased to inform you that recent registration activity has been recorded on the iFranchise Marketplace platform.`,
        `${count} ${ownerLabel} successfully registered and completed onboarding on the portal. This update keeps you informed about marketplace growth and brand owner engagement.`,
        `We recommend reviewing owner profiles periodically to ensure listings remain accurate and marketplace quality standards are upheld.`,
      ],
      highlight: {
        label: "Summary",
        value: `${count} brand owner${count === 1 ? "" : "s"} registered on the platform`,
      },
      instructions: {
        title: "Recommended actions",
        items: [
          "Review newly registered brand owner profiles from the admin brands directory.",
          "Confirm contact details and business information where required.",
          "Monitor upcoming listing submissions from these owners.",
        ],
      },
      notice: {
        title: "Please note",
        paragraphs: [
          "This notification is generated automatically from live platform activity.",
          "No immediate action is required unless your review workflow flags an owner profile for follow-up.",
        ],
      },
      closing:
        "Thank you for overseeing marketplace operations. We will continue to keep you informed of meaningful platform activity.",
      signOff: "Warm regards,\niFranchise Marketplace Operations",
    };
  }

  if (category === "resubmission") {
    const brand = brandName ? `"${brandName}"` : "A brand listing";
    const owner = ownerName ?? "the brand owner";

    return {
      greetingName,
      paragraphs: [
        `This message is to notify you that a brand listing has been resubmitted and is awaiting your review on the iFranchise Marketplace.`,
        `${brand} was resubmitted by ${owner} after updates were made to the listing. Please verify the revised information before proceeding with approval or requesting further changes.`,
        `Prompt review helps the brand owner move toward marketplace publication without unnecessary delay.`,
      ],
      highlight: {
        label: "Listing awaiting review",
        value: `${brand} — resubmitted by ${owner}`,
      },
      instructions: {
        title: "Review checklist",
        items: [
          "Open the brand review workspace and compare the latest submission with prior versions.",
          "Confirm all mandatory documents and business details are complete.",
          "Approve, request changes, or reject the listing according to marketplace policy.",
        ],
      },
      notice: {
        title: "Please note",
        paragraphs: [
          "Resubmitted listings remain in the review queue until an admin decision is recorded.",
          "Delayed reviews may affect the brand owner's marketplace launch timeline.",
        ],
      },
      closing:
        "We appreciate your timely attention to this resubmission and your continued support of marketplace quality.",
      signOff: "Warm regards,\niFranchise Marketplace Operations",
    };
  }

  const brand = brandName ? `"${brandName}"` : "A new brand listing";
  const owner = ownerName ?? "a registered brand owner";

  return {
    greetingName,
    paragraphs: [
      `We are writing to notify you that a new brand submission has been received on the iFranchise Marketplace and requires admin review.`,
      `${brand} was submitted by ${owner} and is currently marked as awaiting review. Please assess the listing to determine whether it meets marketplace listing standards.`,
      `Timely review helps maintain a smooth onboarding experience for brand owners and keeps the marketplace pipeline moving efficiently.`,
    ],
    highlight: {
      label: "New submission",
      value: `${brand} from ${owner} is awaiting review`,
    },
    instructions: {
      title: "Review checklist",
      items: [
        "Open the submission from the review queue or brand detail page.",
        "Validate business information, investment details, and uploaded assets.",
        "Approve for publication, request revisions, or reject with clear feedback.",
      ],
    },
    notice: {
      title: "Please note",
      paragraphs: [
        "New submissions remain pending until an administrator completes the review process.",
        "Brand owners are notified automatically when a review decision is recorded.",
      ],
    },
    closing:
      "Thank you for maintaining the quality and integrity of the iFranchise Marketplace.",
    signOff: "Warm regards,\niFranchise Marketplace Operations",
  };
}
