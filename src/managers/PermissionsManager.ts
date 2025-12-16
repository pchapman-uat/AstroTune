import { useLogger } from "helpers/index";
import { PermissionsAndroid } from "react-native";

export async function requestConfigPermissions(): Promise<boolean> {
	const logger = useLogger("Permissions - Config");
	try {
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
			{
				title: "File Write Permission",
				message:
					"This app needs access to your storage to save/export configuration files.",
				buttonNeutral: "Ask Me Later",
				buttonNegative: "Cancel",
				buttonPositive: "OK",
			},
		);

		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			logger.log("Write storage permission granted");
			return true;
		} else {
			logger.log("Write storage permission denied");
		}
		return false;
	} catch (err) {
		if (err instanceof Error) {
			logger.error(err.message);
		} else {
			logger.error("An unknown error occurred");
		}
		return false;
	}
}
