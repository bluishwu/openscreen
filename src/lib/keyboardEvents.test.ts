import { describe, expect, it } from "vitest";
import {
	getActiveKeyboardOverlay,
	getKeyboardOverlayMotion,
	keyboardCodeFromMacKeyCode,
	keyboardCodeFromWindowsVirtualKey,
	keyboardEventLabels,
	keyboardPressDurationMs,
	keyboardRecordingEventId,
	normalizeKeyboardRecordingEvent,
} from "./keyboardEvents";

describe("keyboard event normalization", () => {
	it("maps Windows and macOS native key codes to DOM-style codes", () => {
		expect(keyboardCodeFromWindowsVirtualKey(0x4b)).toBe("KeyK");
		expect(keyboardCodeFromWindowsVirtualKey(0x70)).toBe("F1");
		expect(keyboardCodeFromWindowsVirtualKey(0xa0)).toBe("ShiftLeft");
		expect(keyboardCodeFromMacKeyCode(40)).toBe("KeyK");
		expect(keyboardCodeFromMacKeyCode(56)).toBe("ShiftLeft");
		expect(keyboardCodeFromMacKeyCode(123)).toBe("ArrowLeft");
	});

	it("rejects malformed sidecar data and normalizes modifier arrays", () => {
		expect(normalizeKeyboardRecordingEvent({ timeMs: "10", code: "KeyA" })).toBeNull();
		expect(
			normalizeKeyboardRecordingEvent({
				timeMs: -12,
				code: " KeyA ",
				modifiers: ["control", "control", "invalid"],
			}),
		).toEqual({ timeMs: 0, code: "KeyA", modifiers: ["control"] });
		expect(
			normalizeKeyboardRecordingEvent({
				timeMs: 10,
				durationMs: 425,
				code: "Space",
				modifiers: [],
			}),
		).toMatchObject({ durationMs: 425 });
	});

	it("uses captured press duration with a legacy fallback", () => {
		expect(
			keyboardPressDurationMs({ timeMs: 0, durationMs: 640, code: "Space", modifiers: [] }),
		).toBe(640);
		expect(keyboardPressDurationMs({ timeMs: 0, code: "Space", modifiers: [] })).toBe(80);
	});
});

describe("keyboard overlay selection", () => {
	const events = [
		{ timeMs: 100, code: "KeyA", modifiers: [] as const },
		{ timeMs: 500, code: "KeyK", modifiers: ["meta"] as const },
	];

	it("shows shortcuts while hiding plain typing by default", () => {
		expect(getActiveKeyboardOverlay(events, 300, false)).toBeNull();
		expect(getActiveKeyboardOverlay(events, 700, false)?.event.code).toBe("KeyK");
	});

	it("shows single keys when explicitly enabled and fades near the end", () => {
		expect(getActiveKeyboardOverlay(events, 300, true)?.event.code).toBe("KeyA");
		const active = getActiveKeyboardOverlay(events, 1_850, true);
		expect(active?.event.code).toBe("KeyK");
		expect(active?.opacity).toBeGreaterThan(0);
		expect(active?.opacity).toBeLessThan(1);
	});

	it("uses platform-appropriate modifier labels", () => {
		const event = { timeMs: 0, code: "KeyK", modifiers: ["control", "meta"] as const };
		expect(keyboardEventLabels(event, "darwin")).toEqual(["⌃", "⌘", "K"]);
		expect(keyboardEventLabels(event, "win32")).toEqual(["Ctrl", "Win", "K"]);
	});

	it("shows standalone modifiers without duplicating their label", () => {
		expect(
			keyboardEventLabels({ timeMs: 0, code: "ShiftLeft", modifiers: ["shift"] }, "win32"),
		).toEqual(["Shift"]);
		expect(
			keyboardEventLabels({ timeMs: 0, code: "MetaLeft", modifiers: ["meta"] }, "darwin"),
		).toEqual(["⌘"]);
	});

	it("skips events disabled from the keyboard timeline", () => {
		const disabledId = keyboardRecordingEventId(events[1], 1);
		expect(getActiveKeyboardOverlay(events, 700, false, [disabledId])).toBeNull();
	});

	it("calculates distinct entrance motion presets", () => {
		const active = getActiveKeyboardOverlay(events, 550, false);
		expect(active).not.toBeNull();
		if (!active) return;

		expect(getKeyboardOverlayMotion(active, "none")).toMatchObject({ scale: 1, translateY: 0 });
		expect(getKeyboardOverlayMotion(active, "fade").opacity).toBeLessThan(active.opacity);
		expect(getKeyboardOverlayMotion(active, "scale").scale).toBeLessThan(1);
		expect(getKeyboardOverlayMotion(active, "slide").translateY).toBeGreaterThan(0);
		expect(getKeyboardOverlayMotion(active, "bounce").scale).toBeGreaterThan(0);
		expect(getKeyboardOverlayMotion(active, "drop").translateY).toBeLessThan(0);
		expect(getKeyboardOverlayMotion(active, "rotate").rotateDeg).toBeLessThan(0);
		expect(getKeyboardOverlayMotion(active, "pulse").scale).toBeGreaterThan(1);
		expect(getKeyboardOverlayMotion(active, "blur").blur).toBeGreaterThan(0);
	});
});
