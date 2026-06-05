export type BrandFormValues = {
  businessName: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export function parseBrandFormData(formData: FormData): BrandFormValues {
  const trim = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value === "" ? null : value;
  };

  return {
    businessName: String(formData.get("businessName") ?? "").trim(),
    tagline: trim("tagline"),
    description: trim("description"),
    industry: trim("industry"),
    websiteUrl: trim("websiteUrl"),
    contactEmail: trim("contactEmail"),
    contactPhone: trim("contactPhone"),
  };
}

export function validateBrandValues(
  values: BrandFormValues,
  options: { requireAllForSubmit: boolean },
): string | null {
  if (!values.businessName) {
    return "Business name is required.";
  }

  if (values.businessName.length > 200) {
    return "Business name must be 200 characters or fewer.";
  }

  if (options.requireAllForSubmit) {
    if (!values.description) {
      return "Description is required before submitting for review.";
    }
    if (!values.industry) {
      return "Industry is required before submitting for review.";
    }
    if (!values.contactEmail) {
      return "Contact email is required before submitting for review.";
    }
  }

  if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    return "Contact email is not valid.";
  }

  if (values.websiteUrl) {
    try {
      const url = new URL(
        values.websiteUrl.startsWith("http")
          ? values.websiteUrl
          : `https://${values.websiteUrl}`,
      );
      if (!url.hostname) {
        return "Website URL is not valid.";
      }
    } catch {
      return "Website URL is not valid.";
    }
  }

  return null;
}

export function toBrandRow(values: BrandFormValues) {
  return {
    business_name: values.businessName,
    tagline: values.tagline,
    description: values.description,
    industry: values.industry,
    website_url: values.websiteUrl,
    contact_email: values.contactEmail,
    contact_phone: values.contactPhone,
  };
}
