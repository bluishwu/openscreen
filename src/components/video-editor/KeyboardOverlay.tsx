import type { KeyboardOverlayPosition, KeyboardOverlayStyle } from "@/lib/keyboardEvents";
import { getActiveKeyboardOverlay, keyboardEventLabels } from "@/lib/keyboardEvents";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardOverlayProps {
	events: KeyboardRecordingEvent[];
	timeMs: number;
	show: boolean;
	showSingleKeys: boolean;
	size: number;
	style: KeyboardOverlayStyle;
	position: KeyboardOverlayPosition;
	backgroundOpacity: number;
	offset: number;
	disabledEventIds: string[];
	platform: string;
	canvasWidth: number;
	canvasHeight: number;
}

function placementStyle(position: KeyboardOverlayPosition, offset: number): React.CSSProperties {
	const [vertical, horizontal] = position.split("-") as ["top" | "bottom", string];
	const placement: React.CSSProperties = { [vertical]: `${offset * 100}%` };
	if (horizontal === "center") {
		placement.left = "50%";
		placement.transform = "translateX(-50%)";
	} else {
		placement[horizontal as "left" | "right"] = `${offset * 100}%`;
	}
	return placement;
}

function overlayTheme(style: KeyboardOverlayStyle, opacity: number) {
	const alpha = Math.max(0.25, Math.min(1, opacity));
	switch (style) {
		case "dark":
			return {
				panel: `rgba(4, 5, 7, ${alpha})`,
				panelBorder: "rgba(255,255,255,0.08)",
				key: "linear-gradient(180deg, #34363c, #18191d)",
				keyBorder: "rgba(255,255,255,0.18)",
				text: "#ffffff",
				shadow: "0 14px 38px rgba(0,0,0,0.42)",
				keyShadow: "inset 0 1px rgba(255,255,255,0.14), 0 3px 0 rgba(0,0,0,0.55)",
				blur: "none",
			};
		case "light":
			return {
				panel: `rgba(246, 247, 250, ${alpha})`,
				panelBorder: "rgba(15,23,42,0.12)",
				key: "linear-gradient(180deg, #ffffff, #e7e9ee)",
				keyBorder: "rgba(15,23,42,0.16)",
				text: "#15171c",
				shadow: "0 14px 38px rgba(15,23,42,0.2)",
				keyShadow: "inset 0 1px rgba(255,255,255,0.9), 0 3px 0 rgba(15,23,42,0.16)",
				blur: "blur(10px)",
			};
		case "minimal":
			return {
				panel: "transparent",
				panelBorder: "transparent",
				key: `rgba(9, 10, 13, ${alpha})`,
				keyBorder: "rgba(255,255,255,0.14)",
				text: "#ffffff",
				shadow: "none",
				keyShadow: "0 8px 24px rgba(0,0,0,0.3)",
				blur: "none",
			};
		default:
			return {
				panel: `rgba(10, 11, 14, ${alpha})`,
				panelBorder: "rgba(255,255,255,0.12)",
				key: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
				keyBorder: "rgba(255,255,255,0.18)",
				text: "#ffffff",
				shadow: "0 14px 38px rgba(0,0,0,0.32)",
				keyShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), 0 3px 7px rgba(0,0,0,0.28)",
				blur: "blur(10px)",
			};
	}
}

export function KeyboardOverlay({
	events,
	timeMs,
	show,
	showSingleKeys,
	size,
	style,
	position,
	backgroundOpacity,
	offset,
	disabledEventIds,
	platform,
	canvasWidth,
	canvasHeight,
}: KeyboardOverlayProps) {
	if (!show) return null;
	const active = getActiveKeyboardOverlay(events, timeMs, showSingleKeys, disabledEventIds);
	if (!active) return null;

	const unit = Math.max(10, Math.min(canvasWidth, canvasHeight) * 0.028 * size);
	const labels = keyboardEventLabels(active.event, platform);
	const theme = overlayTheme(style, backgroundOpacity);
	const minimal = style === "minimal";
	return (
		<div
			className="absolute flex items-center"
			style={{
				...placementStyle(position, offset),
				gap: unit * 0.3,
				padding: minimal ? 0 : `${unit * 0.45}px ${unit * 0.55}px`,
				borderRadius: unit * 0.65,
				background: theme.panel,
				border: `1px solid ${theme.panelBorder}`,
				boxShadow: theme.shadow,
				backdropFilter: theme.blur,
				opacity: active.opacity,
				pointerEvents: "none",
				zIndex: 45,
			}}
			aria-hidden="true"
		>
			{labels.map((label, index) => (
				<div
					key={`${label}-${index}`}
					className="flex items-center justify-center font-semibold"
					style={{
						minWidth: unit * 1.55,
						height: unit * 1.55,
						padding: `0 ${unit * 0.42}px`,
						borderRadius: unit * 0.38,
						fontSize: unit * 0.78,
						lineHeight: 1,
						color: theme.text,
						background: theme.key,
						border: `1px solid ${theme.keyBorder}`,
						boxShadow: theme.keyShadow,
					}}
				>
					{label}
				</div>
			))}
		</div>
	);
}
