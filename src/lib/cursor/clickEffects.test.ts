import { describe, expect, it } from "vitest";
import { CURSOR_CLICK_EFFECT_STYLES, getCursorClickEffectScale } from "./clickEffects";

describe("cursor click effects", () => {
	it("offers several cursor scaling animations plus off", () => {
		expect(CURSOR_CLICK_EFFECT_STYLES).toEqual([
			"none",
			"press",
			"bounce",
			"elastic",
			"pulse",
			"double",
		]);
	});

	it("keeps off and completed animations at the original size", () => {
		expect(getCursorClickEffectScale("none", 5, 0.5)).toBe(1);
		expect(getCursorClickEffectScale("bounce", 5, 0)).toBe(1);
	});

	it("produces distinct scaling curves", () => {
		expect(getCursorClickEffectScale("press", 5, 0.5)).toBeLessThan(1);
		expect(getCursorClickEffectScale("pulse", 5, 0.5)).toBeGreaterThan(1);
		expect(getCursorClickEffectScale("bounce", 5, 0.5)).not.toBe(
			getCursorClickEffectScale("elastic", 5, 0.5),
		);
	});
});
