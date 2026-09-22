"use client";

import * as React from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, ImagePlus, EyeOff, Eye } from "lucide-react";
import { MediaPicker, type MediaItem } from "@/components/admin/media/media-picker";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  key: string;
  mediaId: string;
  url: string;
  caption: string;
  altText: string;
  focal: string;
  aspect: string;
  visible: boolean;
}

const FOCALS = ["CENTER", "TOP", "BOTTOM", "LEFT", "RIGHT", "TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"];
const ASPECTS = ["ORIGINAL", "PORTRAIT", "LANDSCAPE", "SQUARE", "PANORAMIC"];

let uid = 0;
const nextKey = () => `g${Date.now()}_${uid++}`;

export function GalleryEditor({ name, defaultImages = [] }: { name: string; defaultImages?: GalleryImage[] }) {
  const [images, setImages] = React.useState<GalleryImage[]>(defaultImages);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const update = (key: string, patch: Partial<GalleryImage>) =>
    setImages((prev) => prev.map((img) => (img.key === key ? { ...img, ...patch } : img)));
  const remove = (key: string) => setImages((prev) => prev.filter((img) => img.key !== key));

  function addMany(media: MediaItem[]) {
    setImages((prev) => [
      ...prev,
      ...media.map((m) => ({
        key: nextKey(),
        mediaId: m.id,
        url: m.url,
        caption: "",
        altText: m.altText ?? "",
        focal: "CENTER",
        aspect: "ORIGINAL",
        visible: true,
      })),
    ]);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((prev) => {
      const oldIndex = prev.findIndex((i) => i.key === active.id);
      const newIndex = prev.findIndex((i) => i.key === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const serialized = JSON.stringify(
    images.map((img, i) => ({
      mediaId: img.mediaId,
      caption: img.caption,
      altText: img.altText,
      focal: img.focal,
      aspect: img.aspect,
      visible: img.visible,
      sortOrder: i,
    }))
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialized} />

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-stone-300 bg-stone-50 py-12 text-stone-400 hover:border-ink hover:text-ink"
        >
          <ImagePlus className="h-7 w-7" />
          <span className="text-sm font-medium">Add gallery images</span>
        </button>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={images.map((i) => i.key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {images.map((img) => (
                  <GalleryRow key={img.key} img={img} onUpdate={update} onRemove={remove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <ImagePlus className="h-4 w-4" /> Add more images
          </Button>
        </>
      )}

      <p className="text-xs text-stone-500">
        Any orientation · long edge ~2000-2400px. Images are auto-optimised on upload; set a focal point
        per image for consistent cropping.
      </p>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        onSelectMany={addMany}
        folder="portfolio"
      />
    </div>
  );
}

function GalleryRow({
  img,
  onUpdate,
  onRemove,
}: {
  img: GalleryImage;
  onUpdate: (key: string, patch: Partial<GalleryImage>) => void;
  onRemove: (key: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.key });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      className={cn("flex gap-3 rounded-lg border border-stone-200 bg-white p-3", !img.visible && "opacity-60")}
    >
      <button type="button" className="cursor-grab text-stone-300 hover:text-stone-500" {...attributes} {...listeners} aria-label="Reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={img.caption}
          onChange={(e) => onUpdate(img.key, { caption: e.target.value })}
          placeholder="Caption (optional)"
          className="h-9 border border-stone-200 px-2 text-sm outline-none focus:border-ink"
        />
        <input
          value={img.altText}
          onChange={(e) => onUpdate(img.key, { altText: e.target.value })}
          placeholder="Alt text"
          className="h-9 border border-stone-200 px-2 text-sm outline-none focus:border-ink"
        />
        <Select value={img.focal} onChange={(e) => onUpdate(img.key, { focal: e.target.value })} className="h-9">
          {FOCALS.map((f) => (
            <option key={f} value={f}>Focal: {f.replace("_", " ").toLowerCase()}</option>
          ))}
        </Select>
        <Select value={img.aspect} onChange={(e) => onUpdate(img.key, { aspect: e.target.value })} className="h-9">
          {ASPECTS.map((a) => (
            <option key={a} value={a}>Aspect: {a.toLowerCase()}</option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdate(img.key, { visible: !img.visible })}
          className="text-stone-400 hover:text-ink"
          title={img.visible ? "Hide" : "Show"}
        >
          {img.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => onRemove(img.key)} className="text-stone-400 hover:text-red-600" title="Remove">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
