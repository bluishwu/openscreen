import type {
	KeyboardCombinationStyle,
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

interface KeyboardOverlayRenderOptions {
	events: KeyboardRecordingEvent[];
	timeMs: number;
	showSingleKeys: boolean;
	size: number;
	style: KeyboardOverlayStyle;
	combinationStyle: KeyboardCombinationStyle;
	animation: KeyboardOverlayAnimation;
	position: KeyboardOverlayPosition;
	backgroundOpacity: number;
	offset: number;
	disabledEventIds: string[];
	platform: string;
	width: number;
	height: number;
}

function roundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
}

function getPanelPosition(
	position: KeyboardOverlayPosition,
	offset: number,
	canvasWidth: number,
	canvasHeight: number,
	panelWidth: number,
	panelHeight: number,
) {
	const margin = Math.min(canvasWidth, canvasHeight) * offset;
	const [vertical, horizontal] = position.split("-");
	const x =
		horizontal === "left"
			? margin
			: horizontal === "right"
				? canvasWidth - margin - panelWidth
				: (canvasWidth - panelWidth) / 2;
	const y = vertical === "top" ? margin : canvasHeight - margin - panelHeight;
	return { x, y };
}

export function renderKeyboardOverlay(
	ctx: CanvasRenderingContext2D,
	options: KeyboardOverlayRenderOptions,
) {
	const active = getActiveKeyboardOverlay(
		options.events,
		options.timeMs,
		options.showSingleKeys,
		options.disabledEventIds,
	);
	if (!active) return;

	const unit = Math.max(18, Math.min(options.width, options.height) * 0.028 * options.size);
	const labels = keyboardEventLabels(active.event, options.platform);
	const motion = getKeyboardOverlayMotion(active, options.animation);
	const gap = unit * 0.3;
	const keyHeight = unit * 1.55;
	const horizontalPadding = unit * 0.42;
	const minimal = options.style === "minimal";
	const panelHidden = minimal || options.style === "outline";
	const alpha = Math.max(0.25, Math.min(1, options.backgroundOpacity));
	const light = options.style === "light";
	const panelRadius =
		options.style === "pastel"
			? 1
			: options.style === "gradient"
				? 0.85
				: options.style === "neon"
					? 0.35
					: options.style === "retro"
						? 0.22
						: options.style === "terminal"
							? 0.08
							: 0.65;
	const keyRadius =
		options.style === "pastel"
			? 0.75
			: options.style === "gradient"
				? 0.5
				: options.style === "neon"
					? 0.2
					: options.style === "retro"
						? 0.14
						: options.style === "terminal"
							? 0.04
							: 0.38;
	ctx.save();
	ctx.globalAlpha = motion.opacity;
	const fontFamily =
		options.style === "terminal"
			? "Consolas, monospace"
			: options.style === "retro"
				? "Georgia, serif"
				: "Inter, system-ui, sans-serif";
	ctx.font = `600 ${unit * 0.78}px ${fontFamily}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const keyWidths = labels.map((label) =>
		Math.max(unit * 1.55, ctx.measureText(label).width + horizontalPadding * 2),
	);
	const separatorWidth = options.combinationStyle === "plus" ? ctx.measureText("+").width : 0;
	const panelPaddingX = panelHidden ? 0 : unit * 0.55;
	const panelPaddingY = panelHidden ? 0 : unit * 0.45;
	const panelWidth =
		keyWidths.reduce((total, keyWidth) => total + keyWidth, 0) +
		(options.combinationStyle === "plus" ? separatorWidth + gap * 2 : gap) *
			Math.max(0, labels.length - 1) +
		panelPaddingX * 2;
	const panelHeight = keyHeight + panelPaddingY * 2;
	const panel = getPanelPosition(
		options.position,
		options.offset,
		options.width,
		options.height,
		panelWidth,
		panelHeight,
	);
	const centerX = panel.x + panelWidth / 2;
	const centerY = panel.y + panelHeight / 2;
	ctx.translate(centerX, centerY + motion.translateY * unit);
	ctx.rotate((motion.rotateDeg * Math.PI) / 180);
	ctx.scale(motion.scale, motion.scale);
	ctx.translate(-centerX, -centerY);
	ctx.filter = motion.blur > 0 ? `blur(${motion.blur * unit}px)` : "none";

	if (!panelHidden) {
		ctx.shadowColor = light ? "rgba(15,23,42,0.2)" : "rgba(0,0,0,0.34)";
		if (options.style === "neon") ctx.shadowColor = "rgba(34,211,238,0.5)";
		if (options.style === "pastel") ctx.shadowColor = "rgba(190,90,160,0.28)";
		if (options.style === "gradient") ctx.shadowColor = "rgba(76,29,149,0.42)";
		ctx.shadowBlur = unit;
		ctx.shadowOffsetY = unit * 0.28;
		roundedRect(ctx, panel.x, panel.y, panelWidth, panelHeight, unit * panelRadius);
		if (options.style === "gradient") {
			const gradient = ctx.createLinearGradient(
				panel.x,
				panel.y,
				panel.x + panelWidth,
				panel.y + panelHeight,
			);
			gradient.addColorStop(0, `rgba(124,58,237,${alpha})`);
			gradient.addColorStop(1, `rgba(37,99,235,${alpha})`);
			ctx.fillStyle = gradient;
		} else {
			ctx.fillStyle =
				options.style === "light"
					? `rgba(246,247,250,${alpha})`
					: options.style === "dark"
						? `rgba(4,5,7,${alpha})`
						: options.style === "neon"
							? `rgba(2,8,23,${alpha})`
							: options.style === "pastel"
								? `rgba(255,245,250,${alpha})`
								: options.style === "retro"
									? `rgba(58,45,35,${alpha})`
									: options.style === "terminal"
										? `rgba(0,8,2,${alpha})`
										: `rgba(10,11,14,${alpha})`;
		}
		ctx.fill();
		ctx.shadowColor = "transparent";
		ctx.lineWidth = Math.max(1, unit * 0.035);
		ctx.strokeStyle = light
			? "rgba(15,23,42,0.12)"
			: options.style === "neon"
				? "rgba(34,211,238,0.65)"
				: options.style === "pastel"
					? "rgba(244,114,182,0.28)"
					: options.style === "retro"
						? "#f8e2a7"
						: options.style === "terminal"
							? "rgba(74,222,128,0.45)"
							: "rgba(255,255,255,0.16)";
		ctx.stroke();
	}

	let keyX = panel.x + panelPaddingX;
	for (let index = 0; index < labels.length; index += 1) {
		const keyWidth = keyWidths[index];
		const keyY = panel.y + panelPaddingY;
		roundedRect(ctx, keyX, keyY, keyWidth, keyHeight, unit * keyRadius);
		if (light) {
			const gradient = ctx.createLinearGradient(0, keyY, 0, keyY + keyHeight);
			gradient.addColorStop(0, "#ffffff");
			gradient.addColorStop(1, "#e7e9ee");
			ctx.fillStyle = gradient;
		} else if (options.style === "dark") {
			const gradient = ctx.createLinearGradient(0, keyY, 0, keyY + keyHeight);
			gradient.addColorStop(0, "#34363c");
			gradient.addColorStop(1, "#18191d");
			ctx.fillStyle = gradient;
		} else if (options.style === "pastel") {
			const gradient = ctx.createLinearGradient(keyX, keyY, keyX + keyWidth, keyY + keyHeight);
			gradient.addColorStop(0, "#fbcfe8");
			gradient.addColorStop(0.55, "#c4b5fd");
			gradient.addColorStop(1, "#bae6fd");
			ctx.fillStyle = gradient;
		} else if (options.style === "retro") {
			ctx.fillStyle = "#f4c95d";
		} else if (options.style === "terminal") {
			ctx.fillStyle = "rgba(0,18,5,0.96)";
		} else if (options.style === "neon") {
			ctx.fillStyle = "rgba(4,12,28,0.92)";
		} else if (options.style === "outline") {
			ctx.fillStyle = "transparent";
		} else if (options.style === "gradient") {
			ctx.fillStyle = "rgba(255,255,255,0.16)";
		} else if (minimal) {
			ctx.fillStyle = `rgba(9,10,13,${alpha})`;
		} else {
			const gradient = ctx.createLinearGradient(0, keyY, 0, keyY + keyHeight);
			gradient.addColorStop(0, "rgba(255,255,255,0.20)");
			gradient.addColorStop(1, "rgba(255,255,255,0.08)");
			ctx.fillStyle = gradient;
		}
		ctx.shadowColor =
			options.style === "neon"
				? "rgba(34,211,238,0.5)"
				: options.style === "retro"
					? "rgba(165,104,50,0.8)"
					: minimal || options.style === "outline"
						? "rgba(0,0,0,0.3)"
						: "transparent";
		ctx.shadowBlur =
			minimal || options.style === "outline" || options.style === "neon" ? unit * 0.7 : 0;
		ctx.shadowOffsetY = options.style === "retro" ? unit * 0.18 : 0;
		ctx.fill();
		ctx.shadowColor = "transparent";
		ctx.lineWidth = Math.max(1, unit * 0.035);
		ctx.strokeStyle = light
			? "rgba(15,23,42,0.16)"
			: options.style === "neon"
				? "#22d3ee"
				: options.style === "pastel"
					? "rgba(255,255,255,0.82)"
					: options.style === "retro"
						? "#fff0bd"
						: options.style === "terminal"
							? "#22c55e"
							: options.style === "outline"
								? `rgba(255,255,255,${alpha})`
								: "rgba(255,255,255,0.22)";
		ctx.stroke();
		ctx.fillStyle = light
			? "#15171c"
			: options.style === "neon"
				? "#67e8f9"
				: options.style === "pastel"
					? "#4c1d5f"
					: options.style === "retro"
						? "#3d2d20"
						: options.style === "terminal"
							? "#4ade80"
							: "#ffffff";
		ctx.fillText(labels[index], keyX + keyWidth / 2, keyY + keyHeight / 2 + unit * 0.03);
		keyX += keyWidth;
		if (index < labels.length - 1) {
			if (options.combinationStyle === "plus") {
				keyX += gap;
				ctx.fillText("+", keyX + separatorWidth / 2, keyY + keyHeight / 2 + unit * 0.03);
				keyX += separatorWidth + gap;
			} else {
				keyX += gap;
			}
		}
	}
	ctx.restore();
}
