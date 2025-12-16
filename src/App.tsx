import {
	createNavigationContainerRef,
	NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppContext, { AppContextType } from "AppContext";
import { ChoiceArrayItems } from "classes/ArrayItems";
import Settings, { AppTheme, SettingsDefaults } from "classes/Settings";
import Validator, {
	Invalid,
	SupportedValidatorTypes,
	Valid,
} from "classes/Validated";
import AlertModal, { AlertProps } from "elements/AlertModal";
import { useOrientation } from "hooks/useOrientation";
import { useStyles } from "managers/StyleManager";
import { initCustomTheme } from "managers/ThemeManager";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, View } from "react-native";
import { Button } from "react-native-elements";
import AboutScreen from "screens/AboutScreen";
import LoadingScreen from "screens/LoadingScreen";
import LogScreen from "screens/LogScreen";
import SettingsScreen from "screens/SettingsScreen";
import Setup from "screens/Setup";
import WelcomeScreen from "screens/WelcomeScreen";
import Home from "./screens/Home";
export type PlayerType = "Foobar2000" | "DeaDBeeF";
export type RootStackParamList = {
	Loading: undefined;
	Welcome: undefined;
	Home: undefined;
	Settings: undefined;
	About: undefined;
	Setup: { player: PlayerType } | undefined;
	Log: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
function validate<T extends SupportedValidatorTypes>(
	item: T,
	onValid: (item: Valid<T>) => void,
	onInvalid?: (item: Invalid<T>) => void,
) {
	const validItem = Validator.validate(item);
	if (validItem.isValid()) onValid(validItem);
	else onInvalid && onInvalid(validItem as Invalid<T>);
}
export default function App() {
	const [theme, setTheme] = useState<AppTheme>(SettingsDefaults.APP_THEME);
	const orientation = useOrientation();
	const { BeefWeb } = useContext(AppContext);

	useEffect(() => {
		let mounted = true;

		(async () => {
			const [
				theme,
				customTheme,
				autoUpdatesProp,
				authEnabled,
				username,
				password,
				ip,
				port,
				autoUpdates,
				firstTime,
			] = await Promise.all([
				Settings.PROPS.APP_THEME.get(),
				Settings.get("CUSTOM_THEME"),
				Settings.PROPS.AUTOMATIC_UPDATES.get(),
				Settings.get("AUTHENTICATION"),
				Settings.get("USERNAME"),
				Settings.get("PASSWORD"),
				Settings.get("IP_ADDRESS"),
				Settings.get("PORT"),
				Settings.get("AUTOMATIC_UPDATES"),
				Settings.get("FIRST_TIME"),
			]);

			if (!mounted) return;

			setTheme(theme);
			initCustomTheme(customTheme);

			BeefWeb.setState(autoUpdatesProp);
			BeefWeb.setAuthenticationEnabled(authEnabled);

			validate(username, BeefWeb.setUsername);
			validate(password, BeefWeb.setPassword);
			validate(ChoiceArrayItems.init(ip), BeefWeb.setIp);
			validate(port, BeefWeb.setPort);

			BeefWeb.setState(autoUpdates);
			onReady(firstTime);
		})();

		return () => {
			mounted = false;
			BeefWeb.setState(false);
		};
	}, []);

	const [modalVisible, setModalVisible] = useState(false);
	const [modalContent, setModalContent] = useState<React.JSX.Element | null>(
		null,
	);
	const [alertModalVisible, setAlertModalVisible] = useState(false);
	const [alertModalProps, setAlertModalProps] = useState<AlertProps>();
	const alert = (props: AlertProps) => {
		setAlertModalProps(props);
		setAlertModalVisible(true);
	};

	const setModal = (content: React.JSX.Element) => {
		setModalContent(content);
		setModalVisible(true);
	};
	const contextValue = useMemo<AppContextType>(
		() => ({
			BeefWeb: BeefWeb,
			Settings: Settings,
			theme,
			setTheme,
			orientation,
			setModal,
			alert,
		}),
		[theme, orientation, setModal, alert],
	);
	const Styles = useStyles("Main", "Modal");

	const onReady = (firstTime: boolean) => {
		if (firstTime === null) return;
		const onAction = () => {
			if (firstTime) return "Welcome";
			else return "Home";
		};
		navigationRef.reset({
			index: 0,
			routes: [{ name: onAction() }],
		});
	};

	return (
		<AppContext.Provider value={contextValue}>
			<NavigationContainer ref={navigationRef}>
				<Stack.Navigator screenOptions={{ headerShown: false }}>
					<Stack.Screen name="Loading" component={LoadingScreen} />
					<Stack.Screen name="Welcome" component={WelcomeScreen} />
					<Stack.Screen name="Home" component={Home} />
					<Stack.Screen name="Settings" component={SettingsScreen} />
					<Stack.Screen name="About" component={AboutScreen} />
					<Stack.Screen name="Setup" component={Setup} />
					<Stack.Screen name="Log" component={LogScreen} />
				</Stack.Navigator>
				<Modal
					transparent
					visible={modalVisible}
					animationType="fade"
					onRequestClose={() => setModalVisible(false)}
				>
					<View style={Styles.Modal.modalOverlay}>
						<View style={Styles.Modal.menu}>
							{modalContent}
							<View>
								<Button title={"Close"} onPress={() => setModalVisible(false)} />
							</View>
						</View>
					</View>
				</Modal>
				<AlertModal
					transparent
					visible={alertModalVisible}
					animationType="fade"
					onRequestClose={() => setAlertModalVisible(false)}
					Styles={Styles}
					alertData={alertModalProps}
				/>
			</NavigationContainer>
		</AppContext.Provider>
	);
}
