export type CursorClickEffectStyle = "none" | "press" | "bounce" | "elastic" | "pulse" | "double";

export const CURSOR_CLICK_EFFECT_STYLES: CursorClickEffectStyle[] = [
	"none",
	"press",
	"bounce",
	"elastic",
	"pulse",
	"double",
];

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

/**
 * Returns the cursor's scale during a click. `remainingProgress` starts at 1 on
 * mouse-down and reaches 0 when the animation completes.
 */
export function getCursorClickEffectScale(
	style: CursorClickEffectStyle,
	clickBounce: number,
	remainingProgress: number,
): number {
	if (style === "none" || remainingProgress <= 0 || clickBounce <= 0) return 1;
	const intensity = clamp(clickBounce, 0, 5) / 5;
	const elapsed = 1 - clamp(remainingProgress, 0, 1);
	let scale = 1;

	switch (style) {
		case "press":
			scale = 1 - Math.sin(elapsed * Math.PI) * intensity * 0.22;
			break;
		case "bounce":
			if (elapsed < 0.38) {
				scale = 1 - Math.sin((elapsed / 0.38) * Math.PI) * intensity * 0.24;
			} else {
				scale = 1 + Math.sin(((elapsed - 0.38) / 0.62) * Math.PI) * intensity * 0.16;
			}
			break;
		case "elastic":
			scale = 1 - Math.sin(elapsed * Math.PI * 3) * Math.exp(-elapsed * 2.8) * intensity * 0.28;
			break;
		case "pulse":
			scale = 1 + Math.sin(elapsed * Math.PI) * intensity * 0.2;
			break;
		case "double":
			scale = 1 - Math.abs(Math.sin(elapsed * Math.PI * 2)) * intensity * 0.18;
			break;
	}

	return Math.max(0.65, scale);
}
