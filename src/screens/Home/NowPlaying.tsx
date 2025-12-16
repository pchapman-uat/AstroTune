import Slider from "@react-native-community/slider";
import AppContext from "AppContext";
import { NavBarItemProps } from "classes/NavBar";
import ScrollingText from "elements/ScrollingText";
import {
	calcVolume,
	formatTime,
	roundTo,
	useLogger,
	VolumeType,
} from "helpers/index";
import { Icon } from "managers/ImageManager";
import { useStyles } from "managers/StyleManager";
import {
	EmptyStar,
	FullStar,
	HalfStar,
	Next,
	Pause,
	Play,
	PreviousSVG,
	StopSVG,
	VolumeSVGs,
} from "managers/SVGManager";
import { getColor } from "managers/ThemeManager";
import { WebPlayerResponse } from "managers/TypeManager";
import React, { useContext, useEffect, useState } from "react";
import {
	Image,
	ImageBackground,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SvgProps } from "react-native-svg";

export default function NowPlaying({
	navigateTo,
}: NavBarItemProps<"NowPlaying">) {
	const ctx = useContext(AppContext);
	const [dynamicBackground, setDynamicBackground] = useState(false);
	const Styles = useStyles("Main", "NowPlaying");
	const [album, setAlbum] = useState("");
	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [albumArt, setAlbumArt] = useState<string>();
	const [elapsed, setElapsed] = useState<number>();
	const [length, setLength] = useState<number>();
	const [isMuted, setIsMuted] = useState(false);
	const [volumeMax, setVolumeMax] = useState<number>();
	const [volumeMin, setVolumeMin] = useState<number>();
	// TODO: Add Volume Type Option
	const [volumeType, setVolumeType] = useState<VolumeType | string | null>();
	const [volumeValue, setVolumeValue] = useState<number>();
	const [rating, setRating] = useState<number>();
	const [playing, setPlaying] = useState(false);
	const logger = useLogger("Now Playing Screen");
	const onUpdate = async (
		response: WebPlayerResponse,
		firstTime: boolean = false,
	) => {
		if (response) {
			const data = response.data;
			const activeItem = data.activeItem;
			const columns = activeItem.columns;
			setAlbum(columns.album);
			setArtist(columns.artist);
			setTitle(columns.title);
			setElapsed(activeItem.position);
			setLength(columns.length);

			if (firstTime || !response.data.sameSong) {
				setAlbumArt(ctx.BeefWeb.albumArtURI);
			}
			setVolumeValue(data.volume.value);
			setIsMuted(data.volume.isMuted);
			setVolumeMax(data.volume.max);
			setVolumeMin(data.volume.min);
			setVolumeType(data.volume.type);
			setRating(activeItem.columns.rating);
			setPlaying(data.playbackState == "playing");
		}
	};

	const forceUpdate = async () => {
		onUpdate(await ctx.BeefWeb.getPlayer(), true);
	};

	const renderImage = (url?: string) => {
		if (!url || url.trim() === "") {
			return <Image source={Icon} style={Styles.NowPlaying.albumArt} />;
		}

		return <Image source={{ uri: url }} style={Styles.NowPlaying.albumArt} />;
	};

	const onToggle = () => {
		ctx.BeefWeb.toggle();
	};

	const onSkip = () => {
		ctx.BeefWeb.skip();
	};
	const onStop = () => {
		ctx.BeefWeb.stop();
	};
	const onRewind = () => {
		ctx.BeefWeb.previous();
	};
	const progressBar = (
		_elapsed?: string | number,
		_length?: string | number,
	) => {
		if (_elapsed == null || _length == null) return;
		const elapsed =
			typeof _elapsed == "string" ? Number.parseFloat(_elapsed) : _elapsed;
		const length =
			typeof _length == "string" ? Number.parseFloat(_length) : _length;
		const onSeekChange = (pos: number) => {
			logger.warn(`Seeking to ${pos}`);
			ctx.BeefWeb.setPosition(pos);
		};
		return (
			<Slider
				style={{ width: "100%", flexShrink: 1 }}
				value={elapsed}
				minimumTrackTintColor={getColor(ctx.theme, "buttonPrimary")}
				thumbTintColor={getColor(ctx.theme, "buttonPrimary")}
				minimumValue={0}
				maximumValue={length}
				onSlidingComplete={onSeekChange}
			/>
		);
	};

	const volumeBar = (
		max?: number,
		min?: number,
		value?: number,
		intensity: number = 0.45,
	) => {
		if (value == null || max == null || min == null) return;
		const { minGain, maxGain, percentage } = calcVolume({
			max,
			min,
			value,
			intensity,
		});
		const onVolumeChanged = (sliderValue: number) => {
			const adjusted = Math.pow(sliderValue, 1 / intensity);
			const gain = minGain + adjusted * (maxGain - minGain);
			const dB = 20 * Math.log10(gain);
			logger.log(`Volume Changed to ${sliderValue} (${dB}dB)`);
			ctx.BeefWeb.setVolume(dB);
		};
		return (
			<Slider
				style={{ width: "100%", flexShrink: 1 }}
				value={percentage}
				minimumTrackTintColor={getColor(ctx.theme, "buttonPrimary")}
				thumbTintColor={getColor(ctx.theme, "buttonPrimary")}
				maximumValue={1}
				minimumValue={0}
				onValueChange={onVolumeChanged}
			/>
		);
	};
	type VolumeIconProps = {
		max?: number;
		min?: number;
		value?: number;
		muted?: boolean;
		intensity?: number;
	};
	const VolumeIcon = ({
		max,
		min,
		value,
		muted,
		intensity = 0.45,
	}: VolumeIconProps) => {
		const props = {
			width: 30,
			height: 30,
			color: getColor(ctx.theme, "buttonPrimary"),
		};
		if (value == null || max == null || min == null) return;
		const { percentage } = calcVolume({ max, min, value, intensity });
		if (muted) return <VolumeSVGs.VolumeMute {...props} />;
		if (percentage > 0.5) return <VolumeSVGs.VolumeHigh {...props} />;
		else if (percentage > 0) return <VolumeSVGs.VolumeLow {...props} />;
		else <VolumeSVGs.VolumeNone {...props} />;
	};

	const ratingEle = (rating: number = 0) => {
		const stars = [];
		const size = Styles.NowPlaying.ratingStar.width;
		for (let i = 0; i < 5; i++) {
			const _rating = rating - i;
			if (_rating >= 1)
				stars.push(
					<FullStar
						width={size}
						height={size}
						key={i}
						color={getColor(ctx.theme, "buttonPrimary")}
					/>,
				);
			else if (_rating > 0)
				stars.push(
					<HalfStar
						width={size}
						height={size}
						key={i}
						color={getColor(ctx.theme, "buttonPrimary")}
					/>,
				);
			else
				stars.push(
					<EmptyStar
						width={size}
						height={size}
						key={i}
						color={getColor(ctx.theme, "buttonPrimary")}
					/>,
				);
		}
		return <View style={Styles.NowPlaying.ratingContainer}>{stars}</View>;
	};

	const toggleButton = (state: boolean) => {
		const size = Styles.NowPlaying.controlsButton.width;
		return (
			<TouchableOpacity onPress={() => onToggle()}>
				{state ? (
					<Pause
						width={size}
						height={size}
						color={getColor(ctx.theme, "buttonPrimary")}
					/>
				) : (
					<Play
						width={size}
						height={size}
						color={getColor(ctx.theme, "buttonPrimary")}
					/>
				)}
			</TouchableOpacity>
		);
	};
	const controlButton = (Element: React.FC<SvgProps>, onPress: () => void) => {
		const size = Styles.NowPlaying.controlsButton.width;
		return (
			<TouchableOpacity onPress={() => onPress()}>
				<Element
					width={size}
					height={size}
					color={getColor(ctx.theme, "buttonPrimary")}
				/>
			</TouchableOpacity>
		);
	};

	useEffect(() => {
		ctx.BeefWeb.addEventListener("update", onUpdate);
		ctx.Settings.PROPS.DYNAMIC_BACKGROUND.get().then(setDynamicBackground);
		forceUpdate();
		return () => {
			ctx.BeefWeb.removeEventListener("update", onUpdate);
		};
	}, []);

	const onMute = (isMuted: boolean) => {
		ctx.BeefWeb.setMuted(isMuted);
	};
	const content = () => (
		<View style={Styles.NowPlaying.nowPlayingContainer}>
			<View>
				<TouchableOpacity onPress={forceUpdate}>
					{renderImage(albumArt)}
				</TouchableOpacity>
			</View>
			<View style={Styles.NowPlaying.interfaceController}>
				<View>
					<ScrollingText textStyle={Styles.NowPlaying.npText}>{title}</ScrollingText>
					<TouchableOpacity
						onPress={() => navigateTo("Library", { page: "Artist", value: artist })}
					>
						<ScrollingText textStyle={Styles.NowPlaying.npText}>
							{artist}
						</ScrollingText>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => navigateTo("Library", { page: "Album", value: album })}
					>
						<ScrollingText textStyle={Styles.NowPlaying.npText}>
							{album}
						</ScrollingText>
					</TouchableOpacity>
				</View>
				{ratingEle(rating)}
				<View style={Styles.NowPlaying.controlsContainer}>
					<View style={Styles.NowPlaying.progressBarContainer}>
						<View style={Styles.NowPlaying.progressBarValues}>
							<Text style={Styles.NowPlaying.npText}>{formatTime(elapsed)}</Text>
							{progressBar(elapsed, length)}
							<Text style={Styles.NowPlaying.npText}>{formatTime(length)}</Text>
						</View>
					</View>

					<View style={Styles.NowPlaying.buttonContainer}>
						{controlButton(PreviousSVG, onRewind)}
						{controlButton(StopSVG, onStop)}
						{toggleButton(playing)}
						{controlButton(Next, onSkip)}
					</View>
					<View style={{ display: "flex", flexDirection: "row", width: "100%" }}>
						<TouchableOpacity onPress={() => onMute(!isMuted)}>
							<VolumeIcon
								max={volumeMax}
								min={volumeMin}
								value={volumeValue}
								muted={isMuted}
							/>
						</TouchableOpacity>
						{volumeBar(volumeMax, volumeMin, volumeValue)}
						<Text style={{ verticalAlign: "middle" }}>
							{roundTo(volumeValue ?? 0, 2)}
							{volumeType}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
	return (
		<View style={{ width: "100%", height: "100%" }}>
			{(dynamicBackground && (
				<ImageBackground
					source={albumArt ? { uri: albumArt } : Icon}
					blurRadius={100}
					style={Styles.Main.container}
				>
					{content()}
				</ImageBackground>
			)) ||
				content()}
		</View>
	);
}
