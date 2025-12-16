import { PlayerType } from "App";
import CodeText from "elements/CodeText";
import List from "elements/List";
import PlayerDependentSetup from "elements/PlayerDependentSetup";
import { StyleMapType, useStyles } from "managers/StyleManager";
import { useEffect } from "react";
import React, { Linking, Text, View } from "react-native";
import { SetupScreenProps } from "screens/Setup";
export default function SetupBeefweb({
	setReady,
	player = "Foobar2000",
}: SetupScreenProps) {
	useEffect(() => setReady(true));
	const Styles = useStyles("Main", "Setup");

	return (
		<PlayerDependentSetup player={player} Styles={Styles}>
			<BeefwebFoobarInstructions Styles={Styles} player={"Foobar2000"} />
			<BeefwebDeaDBeefInstructions Styles={Styles} player={"DeaDBeeF"} />
		</PlayerDependentSetup>
	);
}
type PlayerProps = {
	Styles: Pick<StyleMapType, "Main" | "Setup">;
	player: PlayerType;
};
function BeefwebDeaDBeefInstructions({ Styles }: PlayerProps) {
	const centeredText = Styles.Main.centeredText;
	const hyperlink = Styles.Main.hyperlink;
	return (
		<View>
			<SharedBeefwebInstructions Styles={Styles} index={0} player={"DeaDBeeF"} />
			<Text style={centeredText}>
				1. Download the latest version of the{" "}
				<Text
					style={hyperlink}
					onPress={() =>
						Linking.openURL("https://github.com/hyperblast/beefweb/releases")
					}
				>
					BeefWeb (ddb_beefweb-0.10-x86_64.tar.gz)
				</Text>{" "}
				(Version 0.10 was used for testing)
			</Text>
			<View style={Styles.Main.spacer}></View>
			<Text style={centeredText}>
				2. Extract the tar.gz file inside of DeaDBeeF&apos;s plugin folder. DeaDBeeF
				will require a restart
			</Text>
			<View style={Styles.Main.spacer}></View>
			<SharedBeefwebInstructions Styles={Styles} index={1} player={"DeaDBeeF"} />
			<Text style={centeredText}>
				5. Open your DeaDBeeF application directory (such as %APPDATA%\DeaDBeeF),
				then navigate to profile → beefweb
			</Text>
			<SharedBeefwebInstructions Styles={Styles} index={2} player={"DeaDBeeF"} />
		</View>
	);
}
type SharedProps = {
	index: number;
	stepNumberOverride?: number;
} & PlayerProps;
function SharedBeefwebInstructions({
	Styles,
	index,
	player,
	stepNumberOverride,
}: SharedProps) {
	const centeredText = Styles.Main.centeredText;
	if (index === 0) {
		return (
			<>
				<Text style={Styles.Main.header2}>Beefweb Setup</Text>
				<Text style={Styles.Main.header3}>{player}</Text>
			</>
		);
	}
	if (index === 1) {
		return (
			<>
				<Text style={centeredText}>
					{stepNumberOverride ? stepNumberOverride : 3}. After restart go to the
					preferences, then tools, then Beefweb Remote Control. Set the following
					settings:
				</Text>
				<List
					type={"unordered"}
					items={[
						"Port: 8880 (This can not be changed at the moment)",
						"Allow remote connections: ☑",
						"Music Directories: Add all directories",
						"Require Authentication: ☐ (Authentication is supported, but must be configured manually)",
					]}
					textStyle={Styles.Main.primaryText}
				/>
				<View style={Styles.Main.spacer}></View>
				<Text style={centeredText}>
					{stepNumberOverride ? stepNumberOverride + 1 : 4}. Go to Tools → Beefweb
					Remote Control → Permissions and enabled the following:
				</Text>
				<List
					type={"unordered"}
					items={[
						"Changing Playlists: ☑",
						"Changing Output Device: ☐ (Not supported in v0.1.0, enabling will not break)",
						"Changing Default Web Interface: ☐ (Not supported in v0.1.0, enabling will not break)",
					]}
					textStyle={Styles.Main.primaryText}
				/>
				<View style={Styles.Main.spacer}></View>
			</>
		);
	}
	if (index === 2) {
		return (
			<>
				<Text style={centeredText}>6. Create a new file called config.json</Text>
				<Text style={centeredText}>
					Note: Do NOT put the config.json inside &apos;clientconfig&apos;, as this
					will not work. (as of Beefweb v0.10)
				</Text>
				<View style={Styles.Main.spacer}></View>
				<Text style={centeredText}>
					Open config.json in a text editor and add the following:
				</Text>
				<CodeText
					language="JSON"
					code={`{
    "responseHeaders": {
        "Access-Control-Allow-Origin": "*"
    }
}
`}
				/>

				{/* TODO: Add Warning Message about Cross origin */}
			</>
		);
	}
}
function BeefwebFoobarInstructions({ Styles }: PlayerProps) {
	const centeredText = Styles.Main.centeredText;
	const hyperlink = Styles.Main.hyperlink;
	return (
		<View>
			<SharedBeefwebInstructions Styles={Styles} index={0} player={"Foobar2000"} />
			<Text style={centeredText}>
				1. Download the latest version of the{" "}
				<Text
					style={hyperlink}
					onPress={() =>
						Linking.openURL("https://github.com/hyperblast/beefweb/releases")
					}
				>
					BeefWeb fb2k-component
				</Text>{" "}
				(Version 0.10 was used for testing)
			</Text>
			<View style={Styles.Main.spacer}></View>
			<Text style={centeredText}>
				2. Open Foobar2000, choose file, then preferences (or ctrl+p), press the
				install component button. Once pressed, choose the BeefWeb component and
				install it. Foobar2000 will require a restart
			</Text>
			<View style={Styles.Main.spacer}></View>
			<SharedBeefwebInstructions Styles={Styles} index={1} player={"Foobar2000"} />
			<Text style={centeredText}>
				5. Open your foobar2000 application directory (such as
				%APPDATA%\foobar2000-v2), then navigate to profile → beefweb
			</Text>
			<View style={Styles.Main.spacer}></View>
			<SharedBeefwebInstructions Styles={Styles} index={2} player={"Foobar2000"} />
		</View>
	);
}
