import axios, { AxiosResponse } from "axios";
import FromJSON from "interfaces/iFromJSON";
import {
	AudioPro,
	AudioProContentType,
	AudioProEvent,
	AudioProEventType,
} from "react-native-audio-pro";
import { NetworkInfo } from "react-native-network-info";
import {
	AsyncWebPlayerResponse,
	WebPlayerResponse,
} from "../managers/TypeManager";
import { ChoiceArrayItems } from "./ArrayItems";
import { LoggerBaseClass } from "./Logger";
import { AddPlaylistResponse } from "./responses/AddPlaylist";
import {
	BrowserEntriesResponse,
	BrowserRootsResponse,
} from "./responses/Browser";
import { Columns, PlayerResponse } from "./responses/Player";
import { PlaylistItemsResponse } from "./responses/PlaylistItems";
import { Playlist, PlaylistsResponse } from "./responses/Playlists";
import PlayQueueResponse from "./responses/PlayQueue";
import { SettingsDefaults } from "./Settings";
import { Valid } from "./Validated";
import { RequestStatus, WebRequest } from "./WebRequest";

type AudioProTrack = {
	id: string;
	url: string | number;
	title: string;
	artwork: string;
	album: string;
	artist: string;
};
export enum Status {
	Offline,
	Online,
	Error,
}

export enum State {
	Running,
	Stopped,
	Disconnected,
}
export class Connection {
	protected ip?: string;
	protected port?: number;
	public valid() {
		return !!this.ip && !!this.port;
	}
	public set(ip: string, port: number) {
		this.setIp(ip);
		this.setPort(port);
	}
	public setIp(ip: string) {
		this.ip = ip;
	}
	public setPort(port: number) {
		this.port = port;
	}
	public getApiUrl(): string | null {
		if (this.valid()) return `${this.getUrl()}/api`;
		return null;
	}
	public getUrl(): string | null {
		if (this.valid()) return `http://${this.location}`;
		return null;
	}
	public get location(): string | null {
		if (this.valid()) return `${this.ip}:${this.port}`;
		return null;
	}
	public getIp() {
		return this.ip;
	}
	public getPort() {
		return this.port;
	}
}

export type BeefWebEvents = {
	update: WebPlayerResponse;
	songChange: WebPlayerResponse;
};
export class Beefweb extends LoggerBaseClass<BeefWebEvents> {
	protected SOURCE: string = "BeefWeb";
	/**
	 * Status for the Beefweb server, defining if it is online/offline or similar
	 * @see {@link Status}
	 */
	public status = Status.Offline;
	/**
	 * The connection manager for Beefweb, this generates the URL and manages the IP and Port
	 * @see {@link Connection}
	 */
	private con = new Connection();
	/**
	 * The active state of Beefweb connection, if it is connected, disconnected, or having an error
	 * @see {@link State}
	 */
	public state = State.Disconnected;

	/**
	 * The duration in milliseconds that Axios will time out when fetching or posting
	 * @see {@link axios}
	 */
	private readonly TIMEOUT = 500;
	/**
	 * The frequency that which the client will update in milliseconds
	 * - NOTE: Currently only uses the default {@link SettingsDefaults.UPDATE_FREQUENCY} and does not use the actual setting
	 *
	 */
	private updateFrequency = SettingsDefaults.UPDATE_FREQUENCY;
	/**
	 * The most recent player response, updated ever {@link Beefweb.getPlayer}
	 */
	public lastPlayer?: PlayerResponse;

	private readonly MOBILE_PLAYLIST_TITLE = "Mobile Playlist";

	/**
	 * Authentication object to handle Username and Password
	 */
	private authentication = {
		enabled: false,
		username: "",
		password: "",
	};

	/**
	 * The interval in which updates the client from the server
	 */
	private mainInterval?: ReturnType<typeof setInterval>;

	constructor() {
		super();
		this.init();
	}

	private startInterval() {
		if (!this.mainInterval) {
			this.log("Starting main update interval", { internal: true });
			this.mainInterval = setInterval(() => this.onUpdate(), this.updateFrequency);
			this.state = State.Running;
		}
	}

	private stopInterval(
		interval?: ReturnType<typeof setInterval>,
		restart = false,
	) {
		if (interval) clearInterval(interval);
		this.mainInterval = undefined;
		this.state = State.Stopped;
		// this.onUpdate()
		if (restart) this.startInterval();
	}

	public setState = (t: boolean) => {
		try {
			if (t) this.startInterval();
			else this.stopInterval(this.mainInterval);
		} catch (e) {
			this.error(e);
		}
	};

	public get location() {
		return this.con.location;
	}
	public setUsername = (username: Valid<string>) => {
		this.authentication.username = username.get();
		this.onConnectionChange();
	};
	public setPassword = (password: Valid<string>) => {
		this.authentication.password = password.get();
		this.onConnectionChange();
	};
	public setAuthenticationEnabled = (enabled: boolean) => {
		this.authentication.enabled = enabled;
		this.onConnectionChange();
	};
	public setIp = (ip: Valid<ChoiceArrayItems<string>>) => {
		this.con.setIp(ip.get().getItem());
		this.onConnectionChange();
	};
	public setPort = (port: Valid<number>) => {
		this.con.setPort(port.get());
		this.onConnectionChange();
	};

	private onConnectionChange = () => {
		this.stopInterval(this.mainInterval, true);
	};
	public restart = () => {
		this.stopInterval(this.mainInterval, true);
	};

	private init() {
		AudioPro.configure({
			contentType: AudioProContentType.SPEECH,
			debug: true,
		});
		this.addEventListener("songChange", (e) =>
			this.updateNotificationPanel(e, this.albumArtURI),
		);
		AudioPro.addEventListener((event) => {
			switch (event.type) {
				case AudioProEventType.REMOTE_NEXT:
					this.onNotificationSkip(event);
				case AudioProEventType.REMOTE_PREV:
					this.onNotificationBack(event);
			}
		});
	}
	public async findBeefwebServer(port = 8880) {
		const base = await this.getLocalSubnetBase();
		const ips = [];

		for (let i = 1; i <= 254; i++) {
			ips.push(`${base}.${i}`);
		}

		const checkPromises = ips.map((ip) => this.checkServer(ip, port));

		const results = await Promise.all(checkPromises);
		const found = results.filter((ip) => ip !== null);
		return found;
	}
	private async getLocalSubnetBase() {
		const ipAddress = await NetworkInfo.getIPV4Address();
		if (!ipAddress) throw new Error("Unable to get local IP address.");
		const base = ipAddress.split(".").slice(0, 3).join(".");
		return base;
	}
	private async checkServer(ip: string, port = 8880, timeout = 500) {
		try {
			const response = await axios.get(`http://${ip}:${port}/api/player`, {
				timeout,
			});
			if (response?.data?.player?.info?.name) {
				return ip;
			}
		} catch {}
		return null;
	}
	private async onUpdate() {
		const player = await this.getPlayer();
		if (!player) return;
		this.dispatchEvent("update", player);
	}
	private async updateNotificationPanel(
		player: WebPlayerResponse,
		albumArtURI: string,
	) {
		if (!player) return;
		const activeItem = player.data.activeItem;
		const columns = activeItem.columns;
		const track = this.createTrackNotification({
			id: "track-" + activeItem.index,
			url: require("../assets/audio/silence.mp3"), // NOTE: Currently I do not know how to use a module for an mp3 file
			title: columns.title,
			artwork: albumArtURI,
			artist: columns.artist,
			album: columns.album,
		});
		if (track) {
			AudioPro.play(track, { autoPlay: false });
		} else this.warn("Invalid Track");
	}
	private createTrackNotification(track: AudioProTrack) {
		const validate = (value?: string | number) =>
			typeof value !== "undefined" && value !== null && value !== "";
		if (
			validate(track.album) &&
			validate(track.artist) &&
			validate(track.artwork) &&
			validate(track.id) &&
			validate(track.title) &&
			validate(track.url)
		)
			return track;
		return null;
	}

	private onNotificationSkip({}: AudioProEvent) {
		this.skip();
	}
	private onNotificationBack({}: AudioProEvent) {
		this.previous();
	}

	private fromRequestStatus(status: RequestStatus) {
		if (status == RequestStatus.OK) this.status = Status.Online;
		else this.status = Status.Offline;
	}
	private async createWebRequest<T>(
		response: AxiosResponse<T>,
		type: FromJSON<T>,
	): Promise<WebRequest<T>> {
		const _response = await WebRequest.create<T>(response, type);
		this.fromRequestStatus(_response.status);
		return _response;
	}
	public async getPlayer(): AsyncWebPlayerResponse {
		const response = await this._fetch<PlayerResponse>(
			this.combineUrl("player") + Columns.columnsQuery,
		);
		if (response) {
			const playerResponse = await this.createWebRequest<PlayerResponse>(
				response,
				PlayerResponse,
			);
			if (this.lastPlayer) {
				playerResponse.data.sameSong = playerResponse.data.compare(this.lastPlayer);
				if (!playerResponse.data.sameSong)
					this.dispatchEvent("songChange", playerResponse);
			}
			this.lastPlayer = playerResponse.data;

			return playerResponse;
		}
	}

	public async getPlaylists() {
		const response = await this._fetch<PlaylistsResponse>(
			this.combineUrl("playlists"),
		);
		if (response) {
			const playlistsResponse = await this.createWebRequest<PlaylistsResponse>(
				response,
				PlaylistsResponse,
			);
			return playlistsResponse;
		}
	}

	public async getPlaylistItems(playlistId: Valid<string>) {
		const playlistInfo = await this._fetch<Playlist>(
			this.combineUrl("playlists", playlistId.get()),
		);
		if (playlistInfo && playlistInfo.data.itemCount) {
			const response = await this._fetch<PlaylistItemsResponse>(
				this.combineUrl(
					"playlists",
					playlistId.get(),
					"items",
					`0:${playlistInfo.data.itemCount}`,
				) + Columns.columnsQuery,
			);
			if (response) {
				return await this.createWebRequest<PlaylistItemsResponse>(
					response,
					PlaylistItemsResponse,
				);
			}
		}
	}

	public async getPlaybackQueue() {
		const response = await this._fetch<PlayQueueResponse>(
			this.combineUrl("playqueue") + Columns.columnsQuery,
		);
		if (response) {
			return await this.createWebRequest<PlayQueueResponse>(
				response,
				PlayQueueResponse,
			);
		}
	}
	public async getBrowserRoots() {
		const response = await this._fetch<BrowserRootsResponse>(
			this.combineUrl("browser", "roots"),
		);
		if (response) {
			return await this.createWebRequest<BrowserRootsResponse>(
				response,
				BrowserRootsResponse,
			);
		}
	}
	public async getBrowserEntries(path: Valid<string>) {
		const url = this.combineUrl("browser", "entries") + "?path=" + path.get();
		this.error(url);
		const response = await this._fetch<BrowserEntriesResponse>(url);
		if (response) {
			return await this.createWebRequest<BrowserEntriesResponse>(
				response,
				BrowserEntriesResponse,
			);
		}
	}

	private async getAllSongs(): Promise<Columns[]> {
		const playlists = await this.getPlaylists();
		if (!playlists) return [];

		const totalItems: Columns[] = [];

		for (const playlist of playlists.data) {
			const response = await this.getPlaylistItems(new Valid(playlist.id));
			if (!response) continue;
			response.data.items.forEach((item, index) => {
				item.playlistId = playlist.id;
				item.songIndex = index;
			});
			totalItems.push(...response.data.items);
		}

		return totalItems;
	}

	public async getUniqueSongs() {
		return this.getUnique("path");
	}

	public async getUniqueArtists() {
		return this.getUnique("artist");
	}

	public async getUnique(key: keyof Columns) {
		const songs = await this.getAllSongs();
		return {
			songs: [...new Map(songs.map((item) => [item.path, item])).values()],
			unique: [...new Map(songs.map((item) => [item[key], item])).values()],
		};
	}

	public async getArtwork(playlistId: Valid<string>, index: Valid<number>) {
		const url = this.con.getApiUrl();
		return url
			? this.combineUrl(url, "artwork", playlistId.get(), index.get().toString())
			: null;
	}
	public async playSong(playlistId: Valid<string>, songId: Valid<number>) {
		await this._post(
			this.combineUrl("player", "play", playlistId.get(), songId.get().toString()),
		);
	}

	public async queueSong(playlistId: Valid<string>, songId: Valid<number>) {
		await this._post(this.combineUrl("playqueue", "add"), {
			plref: playlistId.get(),
			itemIndex: songId.get(),
		});
	}

	public async toggle() {
		if (this.lastPlayer?.playbackState == "stopped") {
			this.play();
		} else {
			await this._post(this.combineUrl("player", "pause", "toggle"));
		}
	}

	public async skip() {
		await this._post(this.combineUrl("player", "next"));
	}
	public async play() {
		await this._post(this.combineUrl("player", "play"));
	}
	public async stop() {
		await this._post(this.combineUrl("player", "stop"));
	}

	public async previous() {
		await this._post(this.combineUrl("player", "previous"));
	}
	public async removeFromQueue(
		plref: Valid<string> | Valid<number>,
		itemIndex: Valid<number>,
		queueIndex: Valid<number>,
	) {
		await this._post(this.combineUrl("playqueue", "remove"), {
			plref: plref.get(),
			itemIndex: itemIndex.get(),
			queueIndex: queueIndex.get(),
		});
	}

	public async setVolume(volume: number) {
		await this._post(this.combineUrl("player"), { volume });
	}

	public async setPosition(position: number) {
		await this._post(this.combineUrl("player"), { position });
	}

	private async addPlaylist(
		title: string,
		setCurrent: boolean,
		index: number,
		columns?: Columns[],
	) {
		const response = await this._post<AddPlaylistResponse>(
			this.combineUrl("playlists", "add"),
			{
				title,
				index,
				setCurrent,
			},
		);
		if (response && columns) {
			const result = await this.createWebRequest<AddPlaylistResponse>(
				response,
				AddPlaylistResponse,
			);
			this.addItemsToPlaylist(
				columns.map((item) => item.path),
				result.data.id,
				false,
				true,
			);
			return result;
		}
	}

	public async addItemsToPlaylist(
		items: string[],
		playlistId: string,
		replace = true,
		play = true,
	) {
		await this._post(this.combineUrl("playlists", playlistId, "items", "add"), {
			index: 0,
			async: true,
			replace,
			play,
			items,
		});
	}

	public async addToMobilePlaylist(
		items: string[],
		replace = true,
		play = true,
	) {
		const playlists = await this.getPlaylists();
		if (playlists) {
			let id: string | null = null;
			for (const item of playlists.data) {
				if (item.title == this.MOBILE_PLAYLIST_TITLE) {
					id = item.id;
					break;
				}
			}
			if (!id) {
				const result = await this.addPlaylist(
					this.MOBILE_PLAYLIST_TITLE,
					true,
					999,
				);
				if (result) {
					id = result.data.id;
				}
			}
			if (id) {
				this.addItemsToPlaylist(items, id, replace, play);
			}
		}
	}

	public async playPlaylist(playlistId: Valid<string>, index = 0) {
		await this._post(
			this.combineUrl("player", "play", playlistId.get(), index.toString()),
		);
	}
	public get albumArtURI() {
		const url = this.con.getApiUrl();
		return url
			? this.combineUrl(url, "artwork", "current") + `?d=${Date.now()}`
			: "";
	}

	public setConnection(
		ip: Valid<string>,
		port: Valid<number> = new Valid(8880),
	) {
		this.con.set(ip.get(), port.get());
		this.onConnectionChange();
	}
	private getAuth() {
		if (!this.authentication.enabled) return undefined;
		return {
			username: this.authentication.username,
			password: this.authentication.password,
		};
	}
	private async _fetch<T>(path: string): Promise<AxiosResponse<T> | null> {
		const url = this.con.getApiUrl();
		if (url) {
			const fullUrl = this.combineUrl(url, path);
			const auth = this.getAuth();
			try {
				const response = await axios.get(fullUrl, { timeout: this.TIMEOUT, auth });
				return response;
			} catch (error) {
				this.error(error);
				this.status = Status.Error;
				return null;
			}
		}
		this.status = Status.Error;
		return null;
	}

	private async _post<T>(
		path: string,
		body?: object,
	): Promise<AxiosResponse<T> | null> {
		const url = this.con.getApiUrl();
		if (url) {
			try {
				const auth = this.getAuth();
				return await axios.post(this.combineUrl(url, path), body, {
					timeout: this.TIMEOUT,
					auth,
				});
			} catch (error) {
				this.error(error);
				this.status = Status.Error;
				return null;
			}
		}
		this.status = Status.Error;
		return null;
	}

	private combineUrl(...paths: string[]) {
		return paths.join("/");
	}
}
export default Beefweb;
