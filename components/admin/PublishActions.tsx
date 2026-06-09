"use client";

import { useActionState } from "react";
import { Globe, Lock } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publishBrand, unpublishBrand } from "@/lib/admin/actions";
import type { AdminBrandDetail } from "@/types/admin";
import {
  canAdminPublishBrand,
  canAdminUnpublishBrand,
  initialAdminActionState,
  isBrandPublished,
} from "@/types/admin";

type PublishActionsProps = {
  brand: AdminBrandDetail;
};

export function PublishActions({ brand }: PublishActionsProps) {
  const canPublish = canAdminPublishBrand(brand);
  const canUnpublish = canAdminUnpublishBrand(brand);
  const isPublished = isBrandPublished(brand);

  const [publishState, publishAction, isPublishing] = useActionState(
    publishBrand,
    initialAdminActionState,
  );
  const [unpublishState, unpublishAction, isUnpublishing] = useActionState(
    unpublishBrand,
    initialAdminActionState,
  );

  const isPending = isPublishing || isUnpublishing;
  const alertError = publishState.error ?? unpublishState.error;
  const alertMessage = publishState.message ?? unpublishState.message;

  if (brand.status !== "approved") {
    return null;
  }

  return (
    <Card padding="lg" className="border-violet-200 bg-violet-50/30">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          {isPublished ? (
            <Globe className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Publishing</h2>
          <p className="mt-1 text-sm text-slate-600">
            {isPublished
              ? "This brand is live on the public website."
              : "Approved brands are admin-only until you publish them."}
          </p>
        </div>
      </div>

      <div className="mt-4" aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {canPublish ? (
          <form>
            <input type="hidden" name="brandId" value={brand.id} />
            <Button
              type="submit"
              formAction={publishAction}
              disabled={isPending}
              className="w-full"
            >
              {isPublishing ? "Publishing..." : "Publish to website"}
            </Button>
          </form>
        ) : null}
        {canUnpublish ? (
          <form>
            <input type="hidden" name="brandId" value={brand.id} />
            <Button
              type="submit"
              variant="secondary"
              formAction={unpublishAction}
              disabled={isPending}
              className="w-full"
            >
              {isUnpublishing ? "Removing..." : "Unpublish from website"}
            </Button>
          </form>
        ) : null}
      </div>
    </Card>
  );
}
