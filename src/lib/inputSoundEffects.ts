import { keyboardRecordingEventId } from "@/lib/keyboardEvents";
import type { KeyboardRecordingEvent } from "@/native/contracts";

export type ClickSoundStyle = "none" | "soft" | "pop" | "mechanical" | "digital" | "bubble";
export type KeyboardSoundStyle =
	| "none"
	| "soft"
	| "mechanical"
	| "typewriter"
	| "digital"
	| "thock";
export type InputSoundKind = "click" | "keyboard";

export const CLICK_SOUND_STYLES: ClickSoundStyle[] = [
	"none",
	"soft",
	"pop",
	"mechanical",
	"digital",
	"bubble",
];

export const KEYBOARD_SOUND_STYLES: KeyboardSoundStyle[] = [
	"none",
	"soft",
	"mechanical",
	"typewriter",
	"digital",
	"thock",
];

export interface InputSoundTimelineEvent {
	timeMs: number;
	kind: InputSoundKind;
	style: ClickSoundStyle | KeyboardSoundStyle;
}

export interface InputSoundEffectsConfig {
	clickTimestamps: number[];
	keyboardEvents: KeyboardRecordingEvent[];
	clickStyle: ClickSoundStyle;
	keyboardStyle: KeyboardSoundStyle;
	volume: number;
	disabledKeyboardEventIds?: readonly string[];
}

interface TimelineRegion {
	startMs: number;
	endMs: number;
}

interface TimelineSpeedRegion extends TimelineRegion {
	speed: number;
}

function envelope(elapsedSec: number, durationSec: number, attackSec = 0.002): number {
	if (elapsedSec < 0 || elapsedSec >= durationSec) return 0;
	const attack = Math.min(1, elapsedSec / attackSec);
	const decay = 1 - elapsedSec / durationSec;
	return attack * decay * decay;
}

function noise(elapsedSec: number): number {
	return Math.sin(elapsedSec * 91_337.17) * Math.sin(elapsedSec * 17_123.41);
}

export function getInputSoundDuration(
	kind: InputSoundKind,
	style: ClickSoundStyle | KeyboardSoundStyle,
): number {
	if (style === "none") return 0;
	if (style === "bubble") return 0.13;
	if (style === "typewriter") return 0.11;
	if (style === "mechanical") return kind === "keyboard" ? 0.085 : 0.075;
	if (style === "thock") return 0.1;
	return style === "soft" ? 0.07 : 0.055;
}

export function sampleInputSound(
	kind: InputSoundKind,
	style: ClickSoundStyle | KeyboardSoundStyle,
	elapsedSec: number,
): number {
	const duration = getInputSoundDuration(kind, style);
	const env = envelope(elapsedSec, duration);
	if (env === 0) return 0;

	switch (style) {
		case "soft":
			return Math.sin(elapsedSec * Math.PI * 2 * (kind === "click" ? 520 : 360)) * env * 0.42;
		case "pop": {
			const frequency = 900 - elapsedSec * 8_000;
			return Math.sin(elapsedSec * Math.PI * 2 * Math.max(240, frequency)) * env * 0.72;
		}
		case "mechanical":
			return (
				noise(elapsedSec) * env * 0.48 +
				Math.sin(elapsedSec * Math.PI * 2 * (kind === "click" ? 180 : 230)) * env * 0.38
			);
		case "typewriter":
			return (
				noise(elapsedSec) * env * 0.52 + Math.sin(elapsedSec * Math.PI * 2 * 1_650) * env * 0.22
			);
		case "digital":
			return (Math.sin(elapsedSec * Math.PI * 2 * 1_150) >= 0 ? 1 : -1) * env * 0.34;
		case "bubble": {
			const frequency = 380 + elapsedSec * 4_600;
			return Math.sin(elapsedSec * Math.PI * 2 * frequency) * env * 0.62;
		}
		case "thock":
			return Math.sin(elapsedSec * Math.PI * 2 * 145) * env * 0.68 + noise(elapsedSec) * env * 0.12;
		default:
			return 0;
	}
}

export function playInputSound(
	context: AudioContext,
	kind: InputSoundKind,
	style: ClickSoundStyle | KeyboardSoundStyle,
	volume: number,
	destination: AudioNode = context.destination,
): void {
	const duration = getInputSoundDuration(kind, style);
	if (duration <= 0 || volume <= 0) return;
	const frameCount = Math.ceil(context.sampleRate * duration);
	const buffer = context.createBuffer(1, frameCount, context.sampleRate);
	const channel = buffer.getChannelData(0);
	for (let frame = 0; frame < frameCount; frame += 1) {
		channel[frame] = sampleInputSound(kind, style, frame / context.sampleRate) * volume;
	}
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(destination);
	source.start();
	source.addEventListener("ended", () => source.disconnect(), { once: true });
}

export function mapSourceTimeToOutputTime(
	sourceTimeMs: number,
	trimRegions: TimelineRegion[] = [],
	speedRegions: TimelineSpeedRegion[] = [],
): number | null {
	if (trimRegions.some((region) => sourceTimeMs >= region.startMs && sourceTimeMs < region.endMs)) {
		return null;
	}
	const boundaries = new Set<number>([0, Math.max(0, sourceTimeMs)]);
	for (const region of [...trimRegions, ...speedRegions]) {
		if (region.startMs > 0 && region.startMs < sourceTimeMs) boundaries.add(region.startMs);
		if (region.endMs > 0 && region.endMs < sourceTimeMs) boundaries.add(region.endMs);
	}
	const points = [...boundaries].sort((a, b) => a - b);
	let outputTimeMs = 0;
	for (let index = 0; index < points.length - 1; index += 1) {
		const start = points[index];
		const end = points[index + 1];
		const midpoint = (start + end) / 2;
		if (trimRegions.some((region) => midpoint >= region.startMs && midpoint < region.endMs))
			continue;
		const speed =
			speedRegions.find((region) => midpoint >= region.startMs && midpoint < region.endMs)?.speed ??
			1;
		outputTimeMs += (end - start) / Math.max(0.01, speed);
	}
	return outputTimeMs;
}

export function buildInputSoundTimeline(
	options: InputSoundEffectsConfig & {
		trimRegions?: TimelineRegion[];
		speedRegions?: TimelineSpeedRegion[];
	},
): InputSoundTimelineEvent[] {
	const events: InputSoundTimelineEvent[] = [];
	if (options.clickStyle !== "none") {
		for (const timeMs of options.clickTimestamps) {
			const mapped = mapSourceTimeToOutputTime(timeMs, options.trimRegions, options.speedRegions);
			if (mapped !== null)
				events.push({ timeMs: mapped, kind: "click", style: options.clickStyle });
		}
	}
	if (options.keyboardStyle !== "none") {
		const disabled = new Set(options.disabledKeyboardEventIds ?? []);
		options.keyboardEvents.forEach((event, index) => {
			if (disabled.has(keyboardRecordingEventId(event, index))) return;
			const mapped = mapSourceTimeToOutputTime(
				event.timeMs,
				options.trimRegions,
				options.speedRegions,
			);
			if (mapped !== null) {
				events.push({ timeMs: mapped, kind: "keyboard", style: options.keyboardStyle });
			}
		});
	}
	return events.sort((a, b) => a.timeMs - b.timeMs);
}

export function mixInputSoundsIntoPlanar(
	planes: Float32Array[],
	sampleRate: number,
	frameStartMs: number,
	events: InputSoundTimelineEvent[],
	volume: number,
): void {
	if (volume <= 0 || planes.length === 0) return;
	for (let frame = 0; frame < planes[0].length; frame += 1) {
		const timeMs = frameStartMs + (frame / sampleRate) * 1000;
		let mixed = 0;
		for (const event of events) {
			const elapsedSec = (timeMs - event.timeMs) / 1000;
			if (elapsedSec < 0) break;
			mixed += sampleInputSound(event.kind, event.style, elapsedSec) * volume;
		}
		if (mixed === 0) continue;
		for (const plane of planes) {
			plane[frame] = Math.max(-1, Math.min(1, plane[frame] + mixed));
		}
	}
}
