"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AVATAR_CROP_VIEW_SIZE,
  exportCroppedAvatar,
  type AvatarCropParams,
} from "@/lib/profile/crop-avatar";
import { cn } from "@/lib/utils";

type AvatarCropDialogProps = {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
};

export function AvatarCropDialog({
  imageSrc,
  onCancel,
  onConfirm,
}: AvatarCropDialogProps) {
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [applying, setApplying] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNatural({ width: img.width, height: img.height });
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const coverScale =
    natural.width && natural.height
      ? Math.max(
          AVATAR_CROP_VIEW_SIZE / natural.width,
          AVATAR_CROP_VIEW_SIZE / natural.height,
        )
      : 1;
  const displayScale = coverScale * scale;
  const displayW = natural.width * displayScale;
  const displayH = natural.height * displayScale;

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = () => setDragging(false);

  const handleApply = useCallback(async () => {
    setApplying(true);
    try {
      const params: AvatarCropParams = {
        scale,
        offsetX: offset.x,
        offsetY: offset.y,
      };
      const dataUrl = await exportCroppedAvatar(imageSrc, params);
      onConfirm(dataUrl);
    } finally {
      setApplying(false);
    }
  }, [imageSrc, scale, offset, onConfirm]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <h2 id="avatar-crop-title" className="text-lg font-bold text-slate-900">
          Crop your photo
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Drag to reposition and use the slider to zoom. Your crop is saved when
          you tap Apply.
        </p>

        <div
          className={cn(
            "relative mx-auto mt-5 overflow-hidden rounded-2xl bg-slate-900 ring-2 ring-[#6D28D9]/30",
            dragging && "cursor-grabbing",
            !dragging && "cursor-grab",
          )}
          style={{ width: AVATAR_CROP_VIEW_SIZE, height: AVATAR_CROP_VIEW_SIZE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              width: displayW || AVATAR_CROP_VIEW_SIZE,
              height: displayH || AVATAR_CROP_VIEW_SIZE,
              left: (AVATAR_CROP_VIEW_SIZE - displayW) / 2 + offset.x,
              top: (AVATAR_CROP_VIEW_SIZE - displayH) / 2 + offset.y,
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-white/25" />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ZoomIn className="h-3.5 w-3.5" />
            Zoom
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-[#6D28D9]"
            aria-label="Zoom"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={applying || !natural.width}
            className="dash-cta-purple !text-white"
            onClick={() => void handleApply()}
          >
            {applying ? "Applying…" : "Apply crop"}
          </Button>
        </div>
      </div>
    </div>
  );
}
