import { getActiveKeyboardOverlay, keyboardEventLabels } from "@/lib/keyboardEvents";
import type { KeyboardRecordingEvent } from "@/native/contracts";

interface KeyboardOverlayRenderOptions {
	events: KeyboardRecordingEvent[];
	timeMs: number;
	showSingleKeys: boolean;
	size: number;
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

export function renderKeyboardOverlay(
	ctx: CanvasRenderingContext2D,
	options: KeyboardOverlayRenderOptions,
) {
	const active = getActiveKeyboardOverlay(options.events, options.timeMs, options.showSingleKeys);
	if (!active) return;

	const unit = Math.max(18, Math.min(options.width, options.height) * 0.028 * options.size);
	const labels = keyboardEventLabels(active.event, options.platform);
	const gap = unit * 0.3;
	const keyHeight = unit * 1.55;
	const horizontalPadding = unit * 0.42;
	ctx.save();
	ctx.globalAlpha = active.opacity;
	ctx.font = `600 ${unit * 0.78}px Inter, system-ui, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const keyWidths = labels.map((label) =>
		Math.max(unit * 1.55, ctx.measureText(label).width + horizontalPadding * 2),
	);
	const panelPaddingX = unit * 0.55;
	const panelPaddingY = unit * 0.45;
	const panelWidth =
		keyWidths.reduce((total, keyWidth) => total + keyWidth, 0) +
		gap * Math.max(0, labels.length - 1) +
		panelPaddingX * 2;
	const panelHeight = keyHeight + panelPaddingY * 2;
	const panelX = (options.width - panelWidth) / 2;
	const panelY = options.height - options.height * 0.055 - panelHeight;

	ctx.shadowColor = "rgba(0,0,0,0.34)";
	ctx.shadowBlur = unit;
	ctx.shadowOffsetY = unit * 0.28;
	roundedRect(ctx, panelX, panelY, panelWidth, panelHeight, unit * 0.65);
	ctx.fillStyle = "rgba(10, 11, 14, 0.86)";
	ctx.fill();
	ctx.shadowColor = "transparent";
	ctx.lineWidth = Math.max(1, unit * 0.035);
	ctx.strokeStyle = "rgba(255,255,255,0.16)";
	ctx.stroke();

	let keyX = panelX + panelPaddingX;
	for (let index = 0; index < labels.length; index += 1) {
		const keyWidth = keyWidths[index];
		const keyY = panelY + panelPaddingY;
		const gradient = ctx.createLinearGradient(0, keyY, 0, keyY + keyHeight);
		gradient.addColorStop(0, "rgba(255,255,255,0.20)");
		gradient.addColorStop(1, "rgba(255,255,255,0.08)");
		roundedRect(ctx, keyX, keyY, keyWidth, keyHeight, unit * 0.38);
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.strokeStyle = "rgba(255,255,255,0.22)";
		ctx.stroke();
		ctx.fillStyle = "#ffffff";
		ctx.fillText(labels[index], keyX + keyWidth / 2, keyY + keyHeight / 2 + unit * 0.03);
		keyX += keyWidth + gap;
	}
	ctx.restore();
}
