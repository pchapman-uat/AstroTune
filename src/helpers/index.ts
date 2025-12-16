import Logger, { LoggerProps } from "classes/Logger";
import { BrowserDirectory, BrowserItem } from "classes/responses/Browser";
import { SettingsClass } from "classes/Settings";
import { Valid } from "classes/Validated";
import { APP_NAME, RELEASES_URL } from "constants/constants";
import { Linking } from "react-native";

export function formatTime(seconds: number = 0): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function printTree(
	item: BrowserItem,
	prefix: string = "",
	isLast: boolean = true,
): void {
	const connector = isLast ? "└── " : "├── ";
	// eslint-disable-next-line no-console
	console.log(prefix + connector + item.name);

	if (item instanceof BrowserDirectory && item.children.length > 0) {
		const newPrefix = prefix + (isLast ? "    " : "│   ");
		const lastIndex = item.children.length - 1;

		item.children.forEach((child, index) => {
			const isChildLast = index === lastIndex;
			printTree(child, newPrefix, isChildLast);
		});
	}
}
export function isPrimitive(val: unknown): val is string | number | boolean {
	return (
		typeof val === "string" || typeof val === "number" || typeof val === "boolean"
	);
}
export function keyToIndex<
	T extends Record<string, unknown>,
	K extends keyof T & string,
>(obj: T, key: K): number {
	const keys = Object.keys(obj) as K[];
	return keys.indexOf(key);
}

export function indexToKey<
	T extends Record<string, unknown>,
	K extends keyof T & string,
>(obj: T, index: number): K {
	const keys = Object.keys(obj) as K[];
	return keys[index];
}
export function useLogger(source: string) {
	return {
		log: (msg: string, props?: LoggerProps | undefined) =>
			Logger.log(source, msg, props),
		warn: (msg: string, props?: LoggerProps | undefined) =>
			Logger.warn(source, msg, props),
		error: (msg: string, props?: LoggerProps | undefined) =>
			Logger.error(source, msg, props),
	};
}

export function parseVersion(version: string): number[] {
	const prereleaseTypes: Record<string, number> = {
		alpha: 0,
		rc: 1,
	};
	const versionWithoutV = version.replace(/^v/, "");

	const [mainVersion, prereleasePart] = versionWithoutV.split("-");

	const versionParts = mainVersion.split(".").map((num) => parseInt(num, 10));

	let prereleaseIndex = -1;
	let prereleaseNumber = 0;

	if (prereleasePart) {
		const prereleaseTokens = prereleasePart.split(".");
		const prereleaseType = prereleaseTokens[0];

		if (prereleaseTypes[prereleaseType] !== undefined) {
			prereleaseIndex = prereleaseTypes[prereleaseType];
			prereleaseNumber = parseInt(prereleaseTokens[1] || "0", 10);
		} else {
			throw new Error(`Unknown pre-release type: ${prereleaseType}`);
		}
	}

	while (versionParts.length < 3) {
		versionParts.push(0);
	}

	return [...versionParts, prereleaseIndex, prereleaseNumber];
}

export function checkVersion(
	currentVersion: string,
	latestVersion: string,
): VersionStatus {
	const current = parseVersion(currentVersion);
	const latest = parseVersion(latestVersion);

	for (let i = 0; i < Math.min(current.length, latest.length); i++) {
		if (current[i] < latest[i]) {
			return VersionStatus.OUTDATED;
		} else if (current[i] > latest[i]) {
			return VersionStatus.FUTURE;
		}
	}
	return VersionStatus.CURRENT;
}
function arraysEqual(a: number[], b: number[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
export function checkSupportedVersions(
	currentVersion: string,
	supportedVersions: string[],
	recommendedVersion: string,
): SupportedStatus {
	const isSupported = supportedVersions.some((item) => {
		return arraysEqual(parseVersion(item), parseVersion(currentVersion));
	});

	if (!isSupported) {
		return SupportedStatus.UNSUPPORTED;
	}
	if (
		arraysEqual(parseVersion(currentVersion), parseVersion(recommendedVersion))
	)
		return SupportedStatus.RECOMMENDED;
	if (checkVersion(currentVersion, recommendedVersion) === VersionStatus.FUTURE)
		return SupportedStatus.FUTURE;
	return SupportedStatus.NOT_RECOMMENDED;
}
export enum SupportedStatus {
	UNSUPPORTED = "UNSUPPORTED",
	NOT_RECOMMENDED = "NOT RECOMMENDED",
	RECOMMENDED = "RECOMMENDED",
	FUTURE = "FUTURE",
}
export enum VersionStatus {
	OUTDATED = "OUTDATED",
	CURRENT = "CURRENT",
	FUTURE = "FUTURE",
}

export const newUpdateAlert = (
	latestVersion: string,
	settings: SettingsClass,
) => ({
	title: "Update Available",
	message: `A new version (${latestVersion}) of ${APP_NAME} is available. Please visit the GitHub releases page to download the latest version.`,
	options: [
		{
			optionText: "Go to GitHub",
			onPress: () => {
				Linking.openURL(RELEASES_URL);
			},
		},
		{
			optionText: "Disable Update Notifications",
			onPress: () => {
				settings.set("DISABLE_UPDATE_NOTIFICATIONS", new Valid(true));
			},
		},
	],
});

export type VolumeType = "db";
export type VolumeProps = {
	max: number;
	min: number;
	value: number;
	intensity: number;
};
export function calcVolume({ max, min, value, intensity }: VolumeProps) {
	value = Math.max(min, Math.min(value, max));
	const minGain = Math.pow(10, min / 20);
	const maxGain = Math.pow(10, max / 20);
	const valueGain = Math.pow(10, value / 20);

	const normalized = (valueGain - minGain) / (maxGain - minGain);
	const percentage = Math.pow(normalized, intensity);

	return {
		minGain,
		maxGain,
		valueGain,
		normalized,
		percentage,
	};
}

export function roundTo(num: number, decimalPlaces: number = 0): number {
	if (decimalPlaces <= 0) return Math.round(num);
	const factor = Math.pow(10, decimalPlaces);
	return Math.round(num * factor) / factor;
}
