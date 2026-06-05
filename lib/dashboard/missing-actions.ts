import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type ActionPriority = "high" | "medium" | "low";

export type MissingAction = {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  estimatedMinutes: number;
  href: string;
};

export function getMissingActions(
  brand: Brand | null,
  assets: BrandAssetsBundle,
): MissingAction[] {
  const actions: MissingAction[] = [];

  if (!assets.logo) {
    actions.push({
      id: "logo",
      title: "Upload Logo",
      description: "Add your brand logo for marketplace visibility.",
      priority: "high",
      estimatedMinutes: 2,
      href: "/dashboard/onboarding?step=2",
    });
  }

  if (assets.documents.length === 0) {
    actions.push({
      id: "brochure",
      title: "Add Brochure PDF",
      description: "Upload your franchise brochure for investor review.",
      priority: "high",
      estimatedMinutes: 3,
      href: "/dashboard/onboarding?step=8",
    });
  }

  if (
    assets.gallery.length === 0 &&
    assets.storePhotos.length === 0 &&
    assets.productPhotos.length === 0
  ) {
    actions.push({
      id: "gallery",
      title: "Add Gallery Images",
      description: "Showcase your stores and products with photos.",
      priority: "high",
      estimatedMinutes: 5,
      href: "/dashboard/onboarding?step=2",
    });
  }

  if (!brand || brand.investment_min == null || brand.franchise_fee == null) {
    actions.push({
      id: "investment",
      title: "Complete Investment Details",
      description: "Add investment range, fees, and ROI expectations.",
      priority: "medium",
      estimatedMinutes: 8,
      href: "/dashboard/onboarding?step=3",
    });
  }

  if (!brand || brand.franchise_models.length === 0) {
    actions.push({
      id: "franchise_model",
      title: "Select Franchise Model",
      description: "Choose FOFO, FOCO, unit, or master franchise models.",
      priority: "medium",
      estimatedMinutes: 4,
      href: "/dashboard/onboarding?step=4",
    });
  }

  if (!brand || brand.target_cities.length === 0) {
    actions.push({
      id: "expansion",
      title: "Add Expansion Plan",
      description: "Define target cities and tier expansion strategy.",
      priority: "medium",
      estimatedMinutes: 6,
      href: "/dashboard/onboarding?step=6",
    });
  }

  if (!brand) {
    actions.push({
      id: "create_brand",
      title: "Create Brand Profile",
      description: "Start your franchise listing with basic brand information.",
      priority: "high",
      estimatedMinutes: 10,
      href: "/dashboard/onboarding?step=1",
    });
  } else if (!brand.description || !brand.industry) {
    actions.push({
      id: "brand_info",
      title: "Complete Brand Information",
      description: "Add industry, category, and brand story.",
      priority: "medium",
      estimatedMinutes: 7,
      href: "/dashboard/onboarding?step=1",
    });
  }

  const priorityOrder: Record<ActionPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
