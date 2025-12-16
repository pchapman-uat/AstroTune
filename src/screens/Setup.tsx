import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PlayerType, RootStackParamList } from "App";
import { useStyles } from "managers/StyleManager";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, Text, View } from "react-native";
import { Button } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import SetupApplication from "./setup/SetupApplication";
import SetupBeefweb from "./setup/SetupBeefweb";
import SetupIntro from "./setup/SetupIntro";
import SetupPlayer from "./setup/SetupPlayer";
export interface SetupScreenProps {
	setReady: (ready: boolean) => void;
	setOnReady: (onReady: () => void) => void;
	player?: PlayerType;
}

type SetupScreen = React.ComponentType<SetupScreenProps>;

class SetupStep {
	public name: string;
	public screen: SetupScreen;
	constructor(name: string, screen: SetupScreen) {
		this.name = name;
		this.screen = screen;
	}
}
const items: SetupStep[] = [
	new SetupStep("Intro", SetupIntro),
	new SetupStep("Player", SetupPlayer),
	new SetupStep("Beefweb", SetupBeefweb),
	new SetupStep("Application", SetupApplication),
];
type SetupNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	"Setup"
>;

type SetupRouteProp = RouteProp<RootStackParamList, "Setup">;
type SetupProps = {
	navigation: SetupNavigationProp;
	route: SetupRouteProp;
};
export default function Setup({ navigation, route }: SetupProps) {
	const [currentScreen, setCurrentScreen] = useState<number>(0);
	const [prevScreen, setPrevScreen] = useState<number | null>(null);

	const screenTranslateX = useRef(new Animated.Value(0)).current;

	const screenWidth = Dimensions.get("window").width;
	const Styles = useStyles("Main", "Setup");

	const [ready, setReady] = useState(false);

	const [onReady, setOnReady] = useState<() => void>();

	const resetStates = () => {
		setOnReady(undefined);
		setReady(false);
	};
	useEffect(() => {
		if (prevScreen === null) {
			setPrevScreen(currentScreen);
			return;
		}
		const direction = currentScreen > prevScreen ? 1 : -1;

		screenTranslateX.setValue(direction * screenWidth);

		Animated.timing(screenTranslateX, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start();

		setPrevScreen(currentScreen);
		resetStates();
	}, [currentScreen]);

	const onNavigation = (direction: "back" | "next", current: number) => {
		if (onReady) onReady();
		resetStates();
		const newCurrent = direction == "back" ? current - 1 : current + 1;
		if (newCurrent >= items.length) navigation.navigate("Home");
		else if (newCurrent < 0) navigation.goBack();
		else setCurrentScreen(newCurrent);
	};

	const getNext = (currentScreen: number) => {
		return currentScreen >= items.length - 1 ? "Finish" : "Next";
	};
	const screenItem = items[currentScreen];
	return (
		<SafeAreaView style={Styles.Main.container}>
			<View style={Styles.Setup.header}>
				<Text style={Styles.Setup.headerText}>
					{screenItem.name} - {currentScreen + 1}/{items.length}
				</Text>
			</View>
			<ScrollView>
				<screenItem.screen
					setReady={setReady}
					setOnReady={setOnReady}
					player={route.params?.player}
				/>
			</ScrollView>
			<View style={Styles.Setup.buttonContainer}>
				<Button
					buttonStyle={Styles.Main.button}
					title={"Back"}
					onPress={() => onNavigation("back", currentScreen)}
				/>
				<Button
					buttonStyle={Styles.Main.button}
					title={getNext(currentScreen)}
					onPress={() => onNavigation("next", currentScreen)}
					disabled={!ready}
				/>
			</View>
		</SafeAreaView>
	);
}
