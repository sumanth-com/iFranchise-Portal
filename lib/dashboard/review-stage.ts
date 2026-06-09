import type { Brand } from "@/types/brand";

export type ReviewStageId =
  | "submitted"
  | "under_review"
  | "approved"
  | "published";

export type ReviewStage = {
  id: ReviewStageId;
  label: string;
  status: "done" | "current" | "upcoming";
};

export function getPortfolioReviewStage(brands: Brand[]): {
  label: string;
  stages: ReviewStage[];
} {
  if (brands.length === 0) {
    return {
      label: "No listings yet",
      stages: [
        { id: "submitted", label: "Submitted", status: "upcoming" },
        { id: "under_review", label: "Under Review", status: "upcoming" },
        { id: "approved", label: "Approved", status: "upcoming" },
        { id: "published", label: "Published", status: "upcoming" },
      ],
    };
  }

  const hasPublished = brands.some(
    (b) => b.status === "approved" && Boolean(b.published_at),
  );
  const hasApproved = brands.some((b) => b.status === "approved");
  const inReview = brands.some(
    (b) => b.status === "submitted" || b.status === "changes_requested",
  );
  const hasSubmitted = brands.some((b) => Boolean(b.submitted_at));

  let current: ReviewStageId = "submitted";
  let label = "Complete your first submission";

  if (hasPublished) {
    current = "published";
    label = "Live on marketplace";
  } else if (hasApproved) {
    current = "approved";
    label = "Approved — publishing next";
  } else if (inReview) {
    current = "under_review";
    label = "Under iFranchise review";
  } else if (hasSubmitted) {
    current = "submitted";
    label = "Submitted for review";
  } else {
    label = "Draft — finish and submit";
  }

  const order: ReviewStageId[] = [
    "submitted",
    "under_review",
    "approved",
    "published",
  ];
  const currentIdx = order.indexOf(current);

  const stages: ReviewStage[] = (
    [
      { id: "submitted" as const, label: "Submitted", status: "upcoming" as const },
      { id: "under_review" as const, label: "Under Review", status: "upcoming" as const },
      { id: "approved" as const, label: "Approved", status: "upcoming" as const },
      { id: "published" as const, label: "Published", status: "upcoming" as const },
    ] satisfies ReviewStage[]
  ).map((s, i) => ({
    ...s,
    status:
      i < currentIdx ? ("done" as const) : i === currentIdx ? ("current" as const) : ("upcoming" as const),
  }));

  return { label, stages };
}
