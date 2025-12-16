import AppContext from "AppContext";
import GitHub from "classes/GitHub";
import { NavBarItemProps } from "classes/NavBar";
import { PlayerResponse } from "classes/responses/Player";
import { APP_NAME, APP_VERSION } from "constants/constants";
import {
	GITHUB_REPO_NAME,
	GITHUB_REPO_OWNER,
} from "constants/constants.github";
import {
	RECOMMENDED_BEEFWEB_VERSION,
	SUPPORTED_BEEFWEB_VERSIONS,
} from "constants/constants.versions";
import {
	checkSupportedVersions,
	checkVersion,
	newUpdateAlert,
	SupportedStatus,
	VersionStatus,
} from "helpers/index";
import updateColors, { LottieLoading } from "managers/LottieManager";
import { LogoSVG } from "managers/SVGManager";
import { useStyles } from "managers/StyleManager";
import { getColor } from "managers/ThemeManager";
import { WebPlayerResponse } from "managers/TypeManager";
import React, { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
export default function Connection({}: NavBarItemProps<"Connection">) {
	const ctx = useContext(AppContext);
	const Styles = useStyles("Main", "Modal");
	const [infoName, setInfoName] = useState<string>("");
	const [infoTitle, setInfoTitle] = useState<string>("");
	const [infoVersion, setInfoVersion] = useState<string>("");
	const [infoPluginVersion, setInfoPluginVersion] = useState<string>("");
	const [status, setStatus] = useState<string>("");
	const [location, setLocation] = useState<string>("");
	const [showLocation, setShowLocation] = useState<boolean>(false);
	const [latestVersion, setLatestVersion] = useState<string>("");
	const [appVersionStatus, setAppVersionStatus] = useState<VersionStatus>();
	const [pluginVersionStatus, setPluginVersionStatus] =
		useState<SupportedStatus>();

	const hiddenLocation = "<Tap to show>";

	const onConnectSuccess = (response: PlayerResponse) => {
		setStatus("Connected!");
		setInfoName(response.info.name);
		setInfoTitle(response.info.title);
		setInfoVersion(response.info.version);
		setInfoPluginVersion(response.info.pluginVersion);
		setLocation(ctx.BeefWeb.location ?? "");
		setPluginVersionStatus(
			checkSupportedVersions(
				response.info.pluginVersion,
				SUPPORTED_BEEFWEB_VERSIONS,
				RECOMMENDED_BEEFWEB_VERSION,
			),
		);
	};

	useEffect(() => {
		const onUpdate = (response: WebPlayerResponse) =>
			response?.data && onConnectSuccess(response.data);

		ctx.BeefWeb.addEventListener("update", onUpdate);
		GitHub.getRepoReleaseVersion(GITHUB_REPO_OWNER, GITHUB_REPO_NAME).then(
			(val) => {
				if (val) {
					setLatestVersion(val);
					setAppVersionStatus(checkVersion(APP_VERSION, val));
				}
			},
		);

		return () => {
			ctx.BeefWeb.removeEventListener("update", onUpdate);
		};
	}, []);

	useEffect(() => {
		updateColors(LottieLoading, getColor(ctx.theme, "buttonPrimary"));
	}, [ctx]);

	const versionStatusText = (status: VersionStatus | undefined) => {
		if (!status) return "?";
		switch (status) {
			case VersionStatus.CURRENT:
				return "\u2713";
			case VersionStatus.OUTDATED:
				return "x";
			case VersionStatus.FUTURE:
				return "!";
		}
	};
	const versionSupportText = (status: SupportedStatus | undefined) => {
		if (!status) return;
		switch (status) {
			case SupportedStatus.UNSUPPORTED:
				return "x";
			case SupportedStatus.NOT_RECOMMENDED:
				return "!";
			case SupportedStatus.RECOMMENDED:
				return "\u2713";
			case SupportedStatus.FUTURE:
				return "?";
		}
	};
	const versionSupportColor = (status: SupportedStatus | undefined) => {
		if (!status) return;
		switch (status) {
			case SupportedStatus.UNSUPPORTED:
				return getColor(ctx.theme, "textError");
			case SupportedStatus.NOT_RECOMMENDED:
				return getColor(ctx.theme, "textWarning");
			case SupportedStatus.RECOMMENDED:
				return getColor(ctx.theme, "textSuccess");
			case SupportedStatus.FUTURE:
				return getColor(ctx.theme, "textWarning");
		}
	};
	const versionTextColor = (status: VersionStatus | undefined) => {
		switch (status) {
			case VersionStatus.CURRENT:
				return getColor(ctx.theme, "textSuccess");
			case VersionStatus.OUTDATED:
				return getColor(ctx.theme, "textError");
			case VersionStatus.FUTURE:
				return getColor(ctx.theme, "textWarning");
		}
	};

	const updateAlert = (
		latestVersion: string,
		status: VersionStatus | undefined,
	) => {
		if (!status)
			return ctx.alert({
				title: "Update Status Unknown",
				message: `Could not determine the update status for ${APP_NAME}.`,
			});
		switch (status) {
			case VersionStatus.OUTDATED:
				return ctx.alert(newUpdateAlert(latestVersion, ctx.Settings));
			case VersionStatus.CURRENT:
				return ctx.alert({
					title: "Up to Date",
					message: `You are running the latest version of ${APP_NAME}.`,
				});
			case VersionStatus.FUTURE:
				return ctx.alert({
					title: "Future Version",
					message: `You are running a future version of ${APP_NAME} (${APP_VERSION}) compared to the latest release (${latestVersion}). You should only see this if you built the app from source.`,
				});
		}
	};
	return (
		<View style={Styles.Main.container}>
			<View>
				<Text style={Styles.Main.header1}>{APP_NAME}</Text>
				<Text style={Styles.Main.header2}>
					<Text>{APP_VERSION} </Text>
					<TouchableOpacity
						onPress={() => updateAlert(latestVersion, appVersionStatus)}
					>
						<Text
							style={[
								Styles.Main.header3,
								{ color: versionTextColor(appVersionStatus) },
							]}
						>
							({versionStatusText(appVersionStatus)})
						</Text>
					</TouchableOpacity>
				</Text>
				<Text style={Styles.Main.header3}>
					<Text>Plugin Version: {infoPluginVersion}</Text>
					<TouchableOpacity>
						<Text
							style={[
								Styles.Main.header4,
								{ color: versionSupportColor(pluginVersionStatus), fontSize: 12 },
							]}
						>
							({versionSupportText(pluginVersionStatus)})
						</Text>
					</TouchableOpacity>
				</Text>
			</View>
			<View>
				<LogoSVG height={100} width={100} />
			</View>
			<View>
				<TouchableOpacity onPress={() => setShowLocation(!showLocation)}>
					<Text style={Styles.Main.statusItem}>
						Location: {showLocation ? location : hiddenLocation}
					</Text>
				</TouchableOpacity>

				<Text style={Styles.Main.statusItem}>Status: {status}</Text>
				<Text style={Styles.Main.statusItem}>Player: {infoName}</Text>
				<Text style={Styles.Main.statusItem}>Title: {infoTitle}</Text>
				<Text style={Styles.Main.statusItem}>Player Version: {infoVersion}</Text>
			</View>
		</View>
	);
}
