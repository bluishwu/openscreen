import { describe, expect, it } from "vitest";
import { getGifFrameDelayMs } from "./gifExporter";
import { GIF_FRAME_RATES, isValidGifFrameRate } from "./types";

describe("GIF frame rates", () => {
	it("offers and validates 60 FPS", () => {
		expect(GIF_FRAME_RATES.map(({ value }) => value)).toContain(60);
		expect(isValidGifFrameRate(60)).toBe(true);
	});

	it("uses a representable cadence averaging 60 FPS", () => {
		const delays = [0, 1, 2].map((index) => getGifFrameDelayMs(60, index));
		expect(delays).toEqual([20, 10, 20]);
		expect(delays.reduce((sum, delay) => sum + delay, 0)).toBe(50);
	});
});
