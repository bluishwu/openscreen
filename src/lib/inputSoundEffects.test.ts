import { describe, expect, it } from "vitest";
import {
	buildInputSoundTimeline,
	CLICK_SOUND_STYLES,
	KEYBOARD_SOUND_STYLES,
	mapSourceTimeToOutputTime,
	sampleInputSound,
} from "./inputSoundEffects";

describe("input sound effects", () => {
	it("provides multiple distinct click and keyboard sounds", () => {
		expect(CLICK_SOUND_STYLES.length).toBeGreaterThanOrEqual(12);
		expect(KEYBOARD_SOUND_STYLES.length).toBeGreaterThanOrEqual(6);
		expect(sampleInputSound("click", "pop", 0.01)).not.toBe(0);
		expect(sampleInputSound("keyboard", "thock", 0.01)).not.toBe(0);
	});

	it("provides distinct natural mouse switch profiles", () => {
		const profiles = [
			"mouse-classic",
			"mouse-crisp",
			"mouse-gaming",
			"mouse-silent",
			"mouse-deep",
			"mouse-light",
		] as const;
		const signatures = profiles.map((style) =>
			[0.003, 0.008, 0.015, 0.025].map((time) => sampleInputSound("click", style, time)),
		);
		expect(new Set(signatures.map((samples) => samples.join(","))).size).toBe(profiles.length);
		expect(Math.abs(sampleInputSound("click", "mouse-silent", 0.003))).toBeLessThan(
			Math.abs(sampleInputSound("click", "mouse-crisp", 0.003)),
		);
	});

	it("maps source events through trims and speed regions", () => {
		expect(
			mapSourceTimeToOutputTime(
				2_000,
				[{ startMs: 500, endMs: 1_000 }],
				[{ startMs: 1_000, endMs: 2_000, speed: 2 }],
			),
		).toBe(1_000);
		expect(mapSourceTimeToOutputTime(750, [{ startMs: 500, endMs: 1_000 }])).toBeNull();
	});

	it("builds sorted click and keyboard sound events", () => {
		const timeline = buildInputSoundTimeline({
			clickTimestamps: [500],
			keyboardEvents: [{ timeMs: 100, code: "KeyK", modifiers: ["control"] }],
			clickStyle: "pop",
			keyboardStyle: "mechanical",
			volume: 0.5,
		});
		expect(timeline.map(({ kind }) => kind)).toEqual(["keyboard", "click"]);
	});
});
