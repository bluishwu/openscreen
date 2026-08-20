import type { KeyboardOverlayPosition, KeyboardOverlayStyle } from "@/lib/keyboardEvents";
import { getActiveKeyboardOverlay, keyboardEventLabels } from "@/lib/keyboardEvents";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardOverlayRenderOptions {
	events: KeyboardRecordingEvent[];
	timeMs: number;
	showSingleKeys: boolean;
	size: number;
	style: KeyboardOverlayStyle;
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
	const gap = unit * 0.3;
	const keyHeight = unit * 1.55;
	const horizontalPadding = unit * 0.42;
	const minimal = options.style === "minimal";
	const alpha = Math.max(0.25, Math.min(1, options.backgroundOpacity));
	const light = options.style === "light";
	ctx.save();
	ctx.globalAlpha = active.opacity;
	ctx.font = `600 ${unit * 0.78}px Inter, system-ui, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const keyWidths = labels.map((label) =>
		Math.max(unit * 1.55, ctx.measureText(label).width + horizontalPadding * 2),
	);
	const panelPaddingX = minimal ? 0 : unit * 0.55;
	const panelPaddingY = minimal ? 0 : unit * 0.45;
	const panelWidth =
		keyWidths.reduce((total, keyWidth) => total + keyWidth, 0) +
		gap * Math.max(0, labels.length - 1) +
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

	if (!minimal) {
		ctx.shadowColor = light ? "rgba(15,23,42,0.2)" : "rgba(0,0,0,0.34)";
		ctx.shadowBlur = unit;
		ctx.shadowOffsetY = unit * 0.28;
		roundedRect(ctx, panel.x, panel.y, panelWidth, panelHeight, unit * 0.65);
		ctx.fillStyle = light
			? `rgba(246,247,250,${alpha})`
			: options.style === "dark"
				? `rgba(4,5,7,${alpha})`
				: `rgba(10,11,14,${alpha})`;
		ctx.fill();
		ctx.shadowColor = "transparent";
		ctx.lineWidth = Math.max(1, unit * 0.035);
		ctx.strokeStyle = light ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.16)";
		ctx.stroke();
	}

	let keyX = panel.x + panelPaddingX;
	for (let index = 0; index < labels.length; index += 1) {
		const keyWidth = keyWidths[index];
		const keyY = panel.y + panelPaddingY;
		roundedRect(ctx, keyX, keyY, keyWidth, keyHeight, unit * 0.38);
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
		} else if (minimal) {
			ctx.fillStyle = `rgba(9,10,13,${alpha})`;
		} else {
			const gradient = ctx.createLinearGradient(0, keyY, 0, keyY + keyHeight);
			gradient.addColorStop(0, "rgba(255,255,255,0.20)");
			gradient.addColorStop(1, "rgba(255,255,255,0.08)");
			ctx.fillStyle = gradient;
		}
		ctx.shadowColor = minimal ? "rgba(0,0,0,0.3)" : "transparent";
		ctx.shadowBlur = minimal ? unit * 0.7 : 0;
		ctx.fill();
		ctx.shadowColor = "transparent";
		ctx.lineWidth = Math.max(1, unit * 0.035);
		ctx.strokeStyle = light ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.22)";
		ctx.stroke();
		ctx.fillStyle = light ? "#15171c" : "#ffffff";
		ctx.fillText(labels[index], keyX + keyWidth / 2, keyY + keyHeight / 2 + unit * 0.03);
		keyX += keyWidth + gap;
	}
	ctx.restore();
}
