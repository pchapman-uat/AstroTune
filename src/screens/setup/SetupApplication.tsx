import AppContext from "AppContext";
import { ChoiceArrayItems } from "classes/ArrayItems";
import { AppTheme } from "classes/Settings";
import Validator, { Valid } from "classes/Validated";
import EnumPicker from "elements/EnumPicker";
import { useLogger } from "helpers/index";
import LottieView from "lottie-react-native";
import { getEnumValuesAndKeys } from "managers/EnumManager";
import { LottieLoading } from "managers/LottieManager";
import { useStyles } from "managers/StyleManager";
import { getColor } from "managers/ThemeManager";
import React, { useContext, useEffect, useState } from "react";
import {
	Alert,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Button } from "react-native-elements";
import { SetupScreenProps } from "screens/Setup";
export default function SetupApplication({ setReady }: SetupScreenProps) {
	const Styles = useStyles("Main", "Setup", "Modal");
	const ctx = useContext(AppContext);
	const centeredText = Styles.Main.centeredText;

	const [modalVisible, setModalVisible] = useState(false);
	const [scannedIps, setScannedIps] = useState<string[]>([]);
	const [ipAddress, setIpAddress] = useState<string>();
	const logger = useLogger("Setup Application");

	const setIP = (ip: string) => {
		const validIp = Validator.validate(ip);

		if (validIp.isValid()) {
			logger.log(`Setting Beefweb Connection to ${validIp.get()}`);
			ctx.BeefWeb.setConnection(validIp, new Valid(8880));
			ctx.Settings.PROPS.IP_ADDRESS.set(
				new ChoiceArrayItems<string>(validIp.get()),
			);
		}

		setIpAddress(ip);
		setModalVisible(false);
	};
	const setTheme = (theme: AppTheme) => {
		const validTheme = Validator.validate(theme);
		if (validTheme.isValid()) {
			logger.log(`Setting App Theme to: ${themeKeys[theme]}`);
			ctx.Settings.PROPS.APP_THEME.set(theme);
			ctx.setTheme(theme);
		}
	};
	const startScan = async () => {
		setModalVisible(true);
		const result = await ctx.BeefWeb.findBeefwebServer();
		setScannedIps(result);
	};
	const findBeefwebServers = async () => {
		// TODO: Change Alert to native notification
		Alert.alert(
			"Find Music Player",
			"This will scan your local Wi-Fi network for a compatible music player. Do you want to continue?",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Scan", onPress: () => startScan() },
			],
			{ cancelable: true },
		);
	};

	useEffect(() => {
		if (ipAddress) setReady(true);
		else setReady(false);
	}, [ipAddress]);
	const modal = (ips: string[]) => (
		<Modal
			transparent
			visible={modalVisible}
			animationType="fade"
			onRequestClose={() => setModalVisible(false)}
		>
			<TouchableOpacity
				style={Styles.Modal.modalOverlay}
				onPress={() => setModalVisible(false)}
			>
				{ips.length <= 0 && (
					<LottieView
						source={LottieLoading}
						autoPlay
						loop
						style={{ width: 100, height: 100 }}
					/>
				)}
				<View style={Styles.Modal.menu}>
					{ips.map((item, index) => (
						<TouchableOpacity key={"ip-" + index} onPress={() => setIP(item)}>
							<Text style={Styles.Modal.menuItem}>{item}</Text>
						</TouchableOpacity>
					))}
				</View>
			</TouchableOpacity>
		</Modal>
	);
	const { values: themeValues, keys: themeKeys } =
		getEnumValuesAndKeys("AppTheme");
	return (
		<View style={Styles.Main.container}>
			<Text style={Styles.Main.header2}>Application Setup</Text>
			<View>
				<Text style={centeredText}>
					Please enter the IP Address of the Beefweb Server
				</Text>
				<View style={Styles.Setup.inputView}>
					<Text style={Styles.Setup.inputLabel}>IP Address</Text>
					<TextInput
						onChangeText={setIP}
						style={{ ...Styles.Main.textInput, width: 200 }}
					/>
				</View>
				<View>
					<Button
						buttonStyle={Styles.Main.button}
						title="Find Beefweb Servers"
						onPress={findBeefwebServers}
					/>
				</View>
			</View>
			<View style={Styles.Main.spacer}></View>
			<View>
				<Text style={centeredText}>Choose a Theme</Text>
				<View>
					<EnumPicker
						style={Styles.Main.picker}
						onValueChange={(item) => setTheme(item as AppTheme)}
						dropdownIconColor={getColor(ctx.theme, "textPrimary")}
						mode="dropdown"
						keys={themeKeys}
						values={themeValues}
					/>
				</View>
			</View>

			{modal(scannedIps)}
		</View>
	);
}
