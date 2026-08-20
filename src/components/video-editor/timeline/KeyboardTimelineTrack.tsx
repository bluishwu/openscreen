import type { Span } from "dnd-timeline";
import { useItem, useTimelineContext } from "dnd-timeline";
import { Eye, EyeOff, Keyboard, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useScopedT } from "@/contexts/I18nContext";
import {
	keyboardDisplayDurationMs,
	keyboardEventLabels,
	keyboardRecordingEventId,
} from "@/lib/keyboardEvents";
import { cn } from "@/lib/utils";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardTimelineTrackProps {
	events: KeyboardRecordingEvent[];
	disabledEventIds: string[];
	platform: string;
	rowId: string;
	onToggleEvent?: (eventId: string) => void;
	onEditEvent?: (eventId: string, displayText: string) => void;
	onDeleteEvent?: (eventId: string) => void;
}

interface KeyboardTimelineItemProps {
	id: string;
	span: Span;
	rowId: string;
	label: string;
	durationMs: number;
	isDisabled: boolean;
	onToggle?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

function KeyboardTimelineItem({
	id,
	span,
	rowId,
	label,
	durationMs,
	isDisabled,
	onToggle,
	onEdit,
	onDelete,
}: KeyboardTimelineItemProps) {
	const t = useScopedT("timeline");
	const { setNodeRef, attributes, listeners, itemStyle, itemContentStyle } = useItem({
		id,
		span,
		data: { rowId },
	});

	return (
		<div
			ref={setNodeRef}
			style={{ ...itemStyle, minWidth: 6 }}
			{...listeners}
			{...attributes}
			className="group"
			onDoubleClick={(event) => {
				event.stopPropagation();
				onEdit?.();
			}}
		>
			<div style={{ ...itemContentStyle, minWidth: 28 }}>
				<div
					className={cn(
						"relative flex h-[30px] w-full cursor-grab items-center gap-1 overflow-hidden rounded-md border px-2 text-[10px] font-semibold active:cursor-grabbing",
						isDisabled
							? "border-white/[0.06] bg-white/[0.035] text-white/25 line-through"
							: "border-violet-300/25 bg-violet-500/20 text-violet-100 hover:border-violet-300/40 hover:bg-violet-500/30",
					)}
					title={`${label} · ${Math.round(durationMs)} ms · ${t("keyboard.doubleClickToEdit")}`}
				>
					<div
						className="absolute inset-y-0 left-0 z-20 w-2 cursor-col-resize bg-violet-300/35 opacity-0 transition-opacity group-hover:opacity-100"
						title={t("keyboard.resizeStart")}
					/>
					<div
						className="absolute inset-y-0 right-0 z-20 w-2 cursor-col-resize bg-violet-300/35 opacity-0 transition-opacity group-hover:opacity-100"
						title={t("keyboard.resizeEnd")}
					/>
					<Keyboard className="h-3 w-3 shrink-0" />
					<span className="min-w-0 flex-1 truncate">{label}</span>
					<Pencil className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-60" />
					<button
						type="button"
						className="relative z-30 flex h-5 w-5 shrink-0 items-center justify-center rounded text-red-200/70 hover:bg-red-500/15 hover:text-red-100"
						title={t("keyboard.delete")}
						onPointerDown={(event) => event.stopPropagation()}
						onClick={(event) => {
							event.stopPropagation();
							onDelete?.();
						}}
					>
						<Trash2 className="h-3 w-3" />
					</button>
					<button
						type="button"
						className="relative z-30 flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-white/10"
						title={isDisabled ? t("keyboard.enable") : t("keyboard.disable")}
						onPointerDown={(event) => event.stopPropagation()}
						onClick={(event) => {
							event.stopPropagation();
							onToggle?.();
						}}
					>
						{isDisabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function KeyboardTimelineTrack({
	events,
	disabledEventIds,
	platform,
	rowId,
	onToggleEvent,
	onEditEvent,
	onDeleteEvent,
}: KeyboardTimelineTrackProps) {
	const t = useScopedT("timeline");
	const { range } = useTimelineContext();
	const disabled = useMemo(() => new Set(disabledEventIds), [disabledEventIds]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState("");
	const visibleEvents = useMemo(
		() =>
			events
				.map((event, index) => {
					const durationMs = keyboardDisplayDurationMs(event);
					return {
						id: keyboardRecordingEventId(event, index),
						span: { start: event.timeMs, end: event.timeMs + durationMs },
						durationMs,
						label: keyboardEventLabels(event, platform).join(" + "),
					};
				})
				.filter((item) => item.span.start <= range.end && item.span.end >= range.start),
		[events, platform, range.end, range.start],
	);

	const beginEdit = (id: string, label: string) => {
		setEditingId(id);
		setDraft(label);
	};

	const saveEdit = () => {
		if (!editingId) return;
		onEditEvent?.(editingId, draft.trim());
		setEditingId(null);
	};

	return (
		<>
			<div className="absolute inset-0 z-20 overflow-hidden">
				{visibleEvents.map((item) => (
					<KeyboardTimelineItem
						key={item.id}
						id={item.id}
						span={item.span}
						rowId={rowId}
						label={item.label}
						durationMs={item.durationMs}
						isDisabled={disabled.has(item.id)}
						onToggle={() => onToggleEvent?.(item.id)}
						onEdit={() => beginEdit(item.id, item.label)}
						onDelete={() => onDeleteEvent?.(item.id)}
					/>
				))}
			</div>
			<Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t("keyboard.editTitle")}</DialogTitle>
						<DialogDescription>{t("keyboard.editDescription")}</DialogDescription>
					</DialogHeader>
					<Input
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") saveEdit();
						}}
						autoFocus
						placeholder={t("keyboard.editPlaceholder")}
					/>
					<DialogFooter>
						{editingId && onDeleteEvent && (
							<Button
								variant="destructive"
								className="sm:mr-auto"
								onClick={() => {
									onDeleteEvent(editingId);
									setEditingId(null);
								}}
							>
								<Trash2 className="mr-1.5 h-3.5 w-3.5" />
								{t("keyboard.delete")}
							</Button>
						)}
						<Button variant="outline" onClick={() => setEditingId(null)}>
							{t("keyboard.cancel")}
						</Button>
						<Button onClick={saveEdit}>{t("keyboard.save")}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
