import { getActiveKeyboardOverlay, keyboardEventLabels } from "@/lib/keyboardEvents";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardOverlayProps {
	events: KeyboardRecordingEvent[];
	timeMs: number;
	show: boolean;
	showSingleKeys: boolean;
	size: number;
	platform: string;
	canvasWidth: number;
	canvasHeight: number;
}

export function KeyboardOverlay({
	events,
	timeMs,
	show,
	showSingleKeys,
	size,
	platform,
	canvasWidth,
	canvasHeight,
}: KeyboardOverlayProps) {
	if (!show) return null;
	const active = getActiveKeyboardOverlay(events, timeMs, showSingleKeys);
	if (!active) return null;

	const unit = Math.max(10, Math.min(canvasWidth, canvasHeight) * 0.028 * size);
	const labels = keyboardEventLabels(active.event, platform);
	return (
		<div
			className="absolute left-1/2 flex -translate-x-1/2 items-center"
			style={{
				bottom: "5.5%",
				gap: unit * 0.3,
				padding: `${unit * 0.45}px ${unit * 0.55}px`,
				borderRadius: unit * 0.65,
				background: "rgba(10, 11, 14, 0.82)",
				boxShadow: `0 ${unit * 0.28}px ${unit}px rgba(0, 0, 0, 0.32), inset 0 0 0 1px rgba(255,255,255,0.12)`,
				backdropFilter: "blur(10px)",
				opacity: active.opacity,
				pointerEvents: "none",
				zIndex: 45,
			}}
			aria-hidden="true"
		>
			{labels.map((label, index) => (
				<div
					key={`${label}-${index}`}
					className="flex items-center justify-center font-semibold text-white"
					style={{
						minWidth: unit * 1.55,
						height: unit * 1.55,
						padding: `0 ${unit * 0.42}px`,
						borderRadius: unit * 0.38,
						fontSize: unit * 0.78,
						lineHeight: 1,
						background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
						boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18), 0 ${unit * 0.12}px ${unit * 0.2}px rgba(0,0,0,0.28)`,
					}}
				>
					{label}
				</div>
			))}
		</div>
	);
}
