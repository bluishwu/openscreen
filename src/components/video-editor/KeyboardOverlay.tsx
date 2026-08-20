import type {
	KeyboardOverlayAnimation,
	KeyboardOverlayPosition,
	KeyboardOverlayStyle,
} from "@/lib/keyboardEvents";
import {
	getActiveKeyboardOverlay,
	getKeyboardOverlayMotion,
	keyboardEventLabels,
} from "@/lib/keyboardEvents";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardOverlayProps {
	events: KeyboardRecordingEvent[];
	timeMs: number;
	show: boolean;
	showSingleKeys: boolean;
	size: number;
	style: KeyboardOverlayStyle;
	animation: KeyboardOverlayAnimation;
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
				panelRadius: 0.65,
				keyRadius: 0.38,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0",
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
				panelRadius: 0.65,
				keyRadius: 0.38,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0",
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
				panelRadius: 0.65,
				keyRadius: 0.38,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0",
			};
		case "neon":
			return {
				panel: `rgba(2, 8, 23, ${alpha})`,
				panelBorder: "rgba(34,211,238,0.65)",
				key: "rgba(4, 12, 28, 0.92)",
				keyBorder: "#22d3ee",
				text: "#67e8f9",
				shadow: "0 0 28px rgba(34,211,238,0.38)",
				keyShadow: "inset 0 0 12px rgba(34,211,238,0.18), 0 0 12px rgba(34,211,238,0.45)",
				blur: "blur(8px)",
				panelRadius: 0.35,
				keyRadius: 0.2,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0.04em",
			};
		case "pastel":
			return {
				panel: `rgba(255, 245, 250, ${alpha})`,
				panelBorder: "rgba(244,114,182,0.28)",
				key: "linear-gradient(135deg, #fbcfe8, #c4b5fd 55%, #bae6fd)",
				keyBorder: "rgba(255,255,255,0.82)",
				text: "#4c1d5f",
				shadow: "0 15px 34px rgba(190,90,160,0.22)",
				keyShadow: "inset 0 1px rgba(255,255,255,0.9), 0 4px 10px rgba(126,34,206,0.16)",
				blur: "blur(10px)",
				panelRadius: 1,
				keyRadius: 0.75,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0",
			};
		case "retro":
			return {
				panel: `rgba(58, 45, 35, ${alpha})`,
				panelBorder: "#f8e2a7",
				key: "#f4c95d",
				keyBorder: "#fff0bd",
				text: "#3d2d20",
				shadow: "0 8px 0 rgba(44,31,22,0.75)",
				keyShadow: "0 5px 0 #a56832",
				blur: "none",
				panelRadius: 0.22,
				keyRadius: 0.14,
				fontFamily: "Georgia, serif",
				letterSpacing: "0.03em",
			};
		case "terminal":
			return {
				panel: `rgba(0, 8, 2, ${alpha})`,
				panelBorder: "rgba(74,222,128,0.45)",
				key: "rgba(0, 18, 5, 0.96)",
				keyBorder: "#22c55e",
				text: "#4ade80",
				shadow: "0 0 24px rgba(34,197,94,0.22)",
				keyShadow: "inset 0 0 10px rgba(34,197,94,0.14)",
				blur: "none",
				panelRadius: 0.08,
				keyRadius: 0.04,
				fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
				letterSpacing: "0.08em",
			};
		case "outline":
			return {
				panel: "transparent",
				panelBorder: "transparent",
				key: "transparent",
				keyBorder: `rgba(255,255,255,${alpha})`,
				text: "#ffffff",
				shadow: "none",
				keyShadow: "0 3px 16px rgba(0,0,0,0.5)",
				blur: "none",
				panelRadius: 0.65,
				keyRadius: 0.38,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0",
			};
		case "gradient":
			return {
				panel: `linear-gradient(135deg, rgba(124,58,237,${alpha}), rgba(37,99,235,${alpha}))`,
				panelBorder: "rgba(255,255,255,0.3)",
				key: "rgba(255,255,255,0.16)",
				keyBorder: "rgba(255,255,255,0.28)",
				text: "#ffffff",
				shadow: "0 16px 38px rgba(76,29,149,0.38)",
				keyShadow: "inset 0 1px rgba(255,255,255,0.24), 0 3px 8px rgba(30,27,75,0.25)",
				blur: "blur(8px)",
				panelRadius: 0.85,
				keyRadius: 0.5,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0.01em",
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
				panelRadius: 0.65,
				keyRadius: 0.38,
				fontFamily: "Inter, system-ui, sans-serif",
				letterSpacing: "0",
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
	animation,
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
	const motion = getKeyboardOverlayMotion(active, animation);
	return (
		<div
			className="absolute"
			style={{
				...placementStyle(position, offset),
				pointerEvents: "none",
				zIndex: 45,
			}}
			aria-hidden="true"
		>
			<div
				className="flex items-center"
				style={{
					gap: unit * 0.3,
					padding: minimal ? 0 : `${unit * 0.45}px ${unit * 0.55}px`,
					borderRadius: unit * theme.panelRadius,
					background: theme.panel,
					border: `1px solid ${theme.panelBorder}`,
					boxShadow: theme.shadow,
					backdropFilter: theme.blur,
					opacity: motion.opacity,
					transform: `translateY(${motion.translateY * unit}px) scale(${motion.scale})`,
					transformOrigin: position.startsWith("top") ? "top center" : "bottom center",
				}}
			>
				{labels.map((label, index) => (
					<div
						key={`${label}-${index}`}
						className="flex items-center justify-center font-semibold"
						style={{
							minWidth: unit * 1.55,
							height: unit * 1.55,
							padding: `0 ${unit * 0.42}px`,
							borderRadius: unit * theme.keyRadius,
							fontSize: unit * 0.78,
							fontFamily: theme.fontFamily,
							letterSpacing: theme.letterSpacing,
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
		</div>
	);
}
