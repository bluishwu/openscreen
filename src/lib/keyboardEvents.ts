import type { KeyboardModifier, KeyboardRecordingEvent } from "@/native/contracts";

export const KEYBOARD_OVERLAY_DURATION_MS = 1_400;
export const KEYBOARD_OVERLAY_FADE_MS = 220;

export type KeyboardOverlayStyle =
	| "glass"
	| "dark"
	| "light"
	| "minimal"
	| "neon"
	| "pastel"
	| "retro"
	| "terminal"
	| "outline"
	| "gradient";
export type KeyboardOverlayAnimation = "none" | "fade" | "scale" | "slide" | "bounce";
export type KeyboardOverlayPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

export const KEYBOARD_OVERLAY_STYLES: KeyboardOverlayStyle[] = [
	"glass",
	"dark",
	"light",
	"minimal",
	"neon",
	"pastel",
	"retro",
	"terminal",
	"outline",
	"gradient",
];

export const KEYBOARD_OVERLAY_ANIMATIONS: KeyboardOverlayAnimation[] = [
	"none",
	"fade",
	"scale",
	"slide",
	"bounce",
];

export const KEYBOARD_OVERLAY_POSITIONS: KeyboardOverlayPosition[] = [
	"top-left",
	"top-center",
	"top-right",
	"bottom-left",
	"bottom-center",
	"bottom-right",
];

const WINDOWS_VK_TO_CODE: Record<number, string> = {
	8: "Backspace",
	9: "Tab",
	13: "Enter",
	19: "Pause",
	20: "CapsLock",
	27: "Escape",
	32: "Space",
	33: "PageUp",
	34: "PageDown",
	35: "End",
	36: "Home",
	37: "ArrowLeft",
	38: "ArrowUp",
	39: "ArrowRight",
	40: "ArrowDown",
	44: "PrintScreen",
	45: "Insert",
	46: "Delete",
	91: "MetaLeft",
	92: "MetaRight",
	93: "ContextMenu",
	106: "NumpadMultiply",
	107: "NumpadAdd",
	109: "NumpadSubtract",
	110: "NumpadDecimal",
	111: "NumpadDivide",
	144: "NumLock",
	145: "ScrollLock",
	186: "Semicolon",
	187: "Equal",
	188: "Comma",
	189: "Minus",
	190: "Period",
	191: "Slash",
	192: "Backquote",
	219: "BracketLeft",
	220: "Backslash",
	221: "BracketRight",
	222: "Quote",
};

const MAC_KEYCODE_TO_CODE: Record<number, string> = {
	0: "KeyA",
	1: "KeyS",
	2: "KeyD",
	3: "KeyF",
	4: "KeyH",
	5: "KeyG",
	6: "KeyZ",
	7: "KeyX",
	8: "KeyC",
	9: "KeyV",
	11: "KeyB",
	12: "KeyQ",
	13: "KeyW",
	14: "KeyE",
	15: "KeyR",
	16: "KeyY",
	17: "KeyT",
	18: "Digit1",
	19: "Digit2",
	20: "Digit3",
	21: "Digit4",
	22: "Digit6",
	23: "Digit5",
	24: "Equal",
	25: "Digit9",
	26: "Digit7",
	27: "Minus",
	28: "Digit8",
	29: "Digit0",
	30: "BracketRight",
	31: "KeyO",
	32: "KeyU",
	33: "BracketLeft",
	34: "KeyI",
	35: "KeyP",
	36: "Enter",
	37: "KeyL",
	38: "KeyJ",
	39: "Quote",
	40: "KeyK",
	41: "Semicolon",
	42: "Backslash",
	43: "Comma",
	44: "Slash",
	45: "KeyN",
	46: "KeyM",
	47: "Period",
	48: "Tab",
	49: "Space",
	50: "Backquote",
	51: "Backspace",
	53: "Escape",
	65: "NumpadDecimal",
	67: "NumpadMultiply",
	69: "NumpadAdd",
	71: "NumLock",
	75: "NumpadDivide",
	76: "NumpadEnter",
	78: "NumpadSubtract",
	81: "NumpadEqual",
	82: "Numpad0",
	83: "Numpad1",
	84: "Numpad2",
	85: "Numpad3",
	86: "Numpad4",
	87: "Numpad5",
	88: "Numpad6",
	89: "Numpad7",
	91: "Numpad8",
	92: "Numpad9",
	96: "F5",
	97: "F6",
	98: "F7",
	99: "F3",
	100: "F8",
	101: "F9",
	103: "F11",
	105: "F13",
	106: "F16",
	107: "F14",
	109: "F10",
	111: "F12",
	113: "F15",
	114: "Insert",
	115: "Home",
	116: "PageUp",
	117: "Delete",
	118: "F4",
	119: "End",
	120: "F2",
	121: "PageDown",
	122: "F1",
	123: "ArrowLeft",
	124: "ArrowRight",
	125: "ArrowDown",
	126: "ArrowUp",
};

const FRIENDLY_CODE_LABELS: Record<string, string> = {
	Backspace: "⌫",
	Tab: "Tab",
	Enter: "Enter",
	NumpadEnter: "Enter",
	Escape: "Esc",
	Space: "Space",
	PageUp: "Page Up",
	PageDown: "Page Down",
	ArrowLeft: "←",
	ArrowUp: "↑",
	ArrowRight: "→",
	ArrowDown: "↓",
	Delete: "Del",
	Insert: "Ins",
	CapsLock: "Caps Lock",
	PrintScreen: "Print Screen",
	ContextMenu: "Menu",
	Semicolon: ";",
	Equal: "=",
	Comma: ",",
	Minus: "−",
	Period: ".",
	Slash: "/",
	Backquote: "`",
	BracketLeft: "[",
	Backslash: "\\",
	BracketRight: "]",
	Quote: "'",
	NumpadMultiply: "Num ×",
	NumpadAdd: "Num +",
	NumpadSubtract: "Num −",
	NumpadDecimal: "Num .",
	NumpadDivide: "Num ÷",
	NumpadEqual: "Num =",
};

export function keyboardCodeFromWindowsVirtualKey(virtualKey: number): string | null {
	if (virtualKey >= 0x30 && virtualKey <= 0x39) return `Digit${virtualKey - 0x30}`;
	if (virtualKey >= 0x41 && virtualKey <= 0x5a) return `Key${String.fromCharCode(virtualKey)}`;
	if (virtualKey >= 0x60 && virtualKey <= 0x69) return `Numpad${virtualKey - 0x60}`;
	if (virtualKey >= 0x70 && virtualKey <= 0x87) return `F${virtualKey - 0x6f}`;
	return WINDOWS_VK_TO_CODE[virtualKey] ?? null;
}

export function keyboardCodeFromMacKeyCode(keyCode: number): string | null {
	return MAC_KEYCODE_TO_CODE[keyCode] ?? null;
}

export function normalizeKeyboardModifiers(value: unknown): KeyboardModifier[] {
	if (!Array.isArray(value)) return [];
	const allowed = new Set<KeyboardModifier>(["control", "alt", "shift", "meta"]);
	return [...new Set(value.filter((item): item is KeyboardModifier => allowed.has(item)))];
}

export function normalizeKeyboardRecordingEvent(value: unknown): KeyboardRecordingEvent | null {
	if (!value || typeof value !== "object") return null;
	const candidate = value as Partial<KeyboardRecordingEvent>;
	if (
		typeof candidate.timeMs !== "number" ||
		!Number.isFinite(candidate.timeMs) ||
		typeof candidate.code !== "string" ||
		!candidate.code.trim()
	) {
		return null;
	}

	return {
		timeMs: Math.max(0, candidate.timeMs),
		code: candidate.code.trim(),
		modifiers: normalizeKeyboardModifiers(candidate.modifiers),
	};
}

export function keyboardEventLabels(
	event: KeyboardRecordingEvent,
	platform: "darwin" | "win32" | "linux" | string,
): string[] {
	const mac = platform === "darwin";
	const modifierLabels: Record<KeyboardModifier, string> = mac
		? { control: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" }
		: { control: "Ctrl", alt: "Alt", shift: "Shift", meta: "Win" };
	const order: KeyboardModifier[] = mac
		? ["control", "alt", "shift", "meta"]
		: ["control", "alt", "shift", "meta"];
	const labels = order
		.filter((modifier) => event.modifiers.includes(modifier))
		.map((modifier) => modifierLabels[modifier]);

	let keyLabel = FRIENDLY_CODE_LABELS[event.code];
	if (!keyLabel && event.code.startsWith("Key")) keyLabel = event.code.slice(3);
	if (!keyLabel && event.code.startsWith("Digit")) keyLabel = event.code.slice(5);
	if (!keyLabel && event.code.startsWith("Numpad")) keyLabel = `Num ${event.code.slice(6)}`;
	keyLabel ??= event.code;
	return [...labels, keyLabel];
}

export interface ActiveKeyboardOverlay {
	event: KeyboardRecordingEvent;
	opacity: number;
	ageMs: number;
}

export interface KeyboardOverlayMotion {
	opacity: number;
	scale: number;
	translateY: number;
}

const KEYBOARD_OVERLAY_ENTER_MS = 260;

export function getKeyboardOverlayMotion(
	active: ActiveKeyboardOverlay,
	animation: KeyboardOverlayAnimation,
): KeyboardOverlayMotion {
	const linear = Math.max(0, Math.min(1, active.ageMs / KEYBOARD_OVERLAY_ENTER_MS));
	const easeOut = 1 - (1 - linear) ** 3;
	const base = { opacity: active.opacity, scale: 1, translateY: 0 };

	switch (animation) {
		case "fade":
			return { ...base, opacity: active.opacity * easeOut };
		case "scale":
			return { ...base, opacity: active.opacity * easeOut, scale: 0.72 + easeOut * 0.28 };
		case "slide":
			return { ...base, opacity: active.opacity * easeOut, translateY: (1 - easeOut) * 0.9 };
		case "bounce": {
			const c1 = 1.70158;
			const c3 = c1 + 1;
			const bounce = 1 + c3 * (linear - 1) ** 3 + c1 * (linear - 1) ** 2;
			return { ...base, opacity: active.opacity * Math.min(1, linear * 2.5), scale: bounce };
		}
		default:
			return base;
	}
}

export function keyboardRecordingEventId(event: KeyboardRecordingEvent, index: number): string {
	return `${Math.round(event.timeMs)}:${event.code}:${event.modifiers.join(".")}:${index}`;
}

export function getActiveKeyboardOverlay(
	events: KeyboardRecordingEvent[],
	timeMs: number,
	showSingleKeys: boolean,
	disabledEventIds: readonly string[] = [],
): ActiveKeyboardOverlay | null {
	const disabled = new Set(disabledEventIds);
	for (let index = events.length - 1; index >= 0; index -= 1) {
		const event = events[index];
		if (event.timeMs > timeMs) continue;
		if (disabled.has(keyboardRecordingEventId(event, index))) continue;
		if (!showSingleKeys && event.modifiers.length === 0) continue;
		const age = timeMs - event.timeMs;
		if (age >= KEYBOARD_OVERLAY_DURATION_MS) return null;
		const fadeStart = KEYBOARD_OVERLAY_DURATION_MS - KEYBOARD_OVERLAY_FADE_MS;
		return {
			event,
			opacity: age <= fadeStart ? 1 : Math.max(0, 1 - (age - fadeStart) / KEYBOARD_OVERLAY_FADE_MS),
			ageMs: age,
		};
	}
	return null;
}
