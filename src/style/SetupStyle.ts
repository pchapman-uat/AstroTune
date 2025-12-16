import { StyleProps } from "classes/Settings";
import { getColor } from "managers/ThemeManager";
import { StyleSheet } from "react-native";

export default ({ theme }: StyleProps) =>
	StyleSheet.create({
		header: {},
		headerText: {
			color: getColor(theme, "textPrimary"),
			textAlign: "center",
		},
		container: {
			padding: 10,
		},
		inputView: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
		},
		inputLabel: {
			color: getColor(theme, "textPrimary"),
			verticalAlign: "middle",
		},
		buttonContainer: {
			display: "flex",
			flexDirection: "row",
			padding: 5,
			justifyContent: "space-around",
			width: "100%",
		},
	});
