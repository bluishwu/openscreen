import { useTimelineContext } from "dnd-timeline";
import { Keyboard } from "lucide-react";
import { useMemo } from "react";
import {
	keyboardEventLabels,
	keyboardPressDurationMs,
	keyboardRecordingEventId,
} from "@/lib/keyboardEvents";
import { cn } from "@/lib/utils";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardTimelineTrackProps {
	events: KeyboardRecordingEvent[];
	disabledEventIds: string[];
	platform: string;
	onToggleEvent?: (eventId: string) => void;
}

export default function KeyboardTimelineTrack({
	events,
	disabledEventIds,
	platform,
	onToggleEvent,
}: KeyboardTimelineTrackProps) {
	const { range, direction, valueToPixels } = useTimelineContext();
	const sideProperty = direction === "rtl" ? "right" : "left";
	const disabled = useMemo(() => new Set(disabledEventIds), [disabledEventIds]);
	const visibleEvents = useMemo(
		() =>
			events
				.map((event, index) => {
					const durationMs = keyboardPressDurationMs(event);
					return {
						event,
						id: keyboardRecordingEventId(event, index),
						startMs: event.timeMs,
						endMs: event.timeMs + durationMs,
						durationMs,
						label: keyboardEventLabels(event, platform).join(" + "),
					};
				})
				.filter((item) => item.startMs <= range.end && item.endMs >= range.start),
		[events, platform, range.end, range.start],
	);

	return (
		<div className="absolute inset-0 z-20 overflow-hidden">
			{visibleEvents.map((item) => {
				const visibleStart = Math.max(item.startMs, range.start);
				const visibleEnd = Math.min(item.endMs, range.end);
				const offset = valueToPixels(visibleStart - range.start);
				const width = Math.max(2, valueToPixels(Math.max(visibleEnd - visibleStart, 1)) - 2);
				const isDisabled = disabled.has(item.id);
				return (
					<button
						type="button"
						key={item.id}
						className={cn(
							"absolute top-[3px] flex h-[30px] items-center gap-1 overflow-hidden rounded-md border px-2 text-[10px] font-semibold transition-all",
							isDisabled
								? "border-white/[0.06] bg-white/[0.035] text-white/25 line-through"
								: "border-violet-300/25 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30 hover:border-violet-300/40",
						)}
						style={{ [sideProperty]: offset, width }}
						title={`${item.label} · ${Math.round(item.durationMs)} ms · ${isDisabled ? "Enable" : "Disable"}`}
						onPointerDown={(event) => event.stopPropagation()}
						onClick={(event) => {
							event.stopPropagation();
							onToggleEvent?.(item.id);
						}}
					>
						<Keyboard className="h-3 w-3 shrink-0" />
						<span className="truncate">{item.label}</span>
					</button>
				);
			})}
		</div>
	);
}
