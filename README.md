# AstroTune

![GitHub latest release](https://img.shields.io/github/v/release/pchapman-uat/AstroTune?include_prereleases&display_name=release)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/pchapman-uat/AstroTune)
![GitHub last commit](https://img.shields.io/github/last-commit/pchapman-uat/AstroTune)

[![Static Badge](https://img.shields.io/badge/Objective-ACS.1-purple)](https://pchapman-uat.github.io/Boards/ACS/#objective1)
[![Static Badge](https://img.shields.io/badge/Objective-ACS.3-purple)](https://pchapman-uat.github.io/Boards/ACS/#objective3)
[![Static Badge](https://img.shields.io/badge/Objective-ACS.4-purple)](https://pchapman-uat.github.io/Boards/ACS/#objective4)
[![Static Badge](https://img.shields.io/badge/Objective-ACS.5-purple)](https://pchapman-uat.github.io/Boards/ACS/#objective5)
[![Static Badge](https://img.shields.io/badge/Objective-ACS.6-purple)](https://pchapman-uat.github.io/Boards/ACS/#objective6)

<img src="src/assets/logo/full/icon.svg" width="150"/>

AstroTune (Previously known as Foobar Controller Mobile) is a mobile app that uses the [BeefWeb API](https://github.com/hyperblast/beefweb) to allow users to control Foobar2000 and DeaDBeeF remotely.

This project was created for Preston Chapman's Student Innovation Project (SIP) at the University of Advancing Technology (UAT). The SIP is UAT's equivalent of a master’s thesis; all students graduating with a bachelor's degree are required to innovate and create a product. For more information, view https://www.uat.edu/student-innovation-projects.

UAT does not own this project; however, it has been granted a non-exclusive, royalty-free license to use, copy, display, describe, mark-on, modify, retain, or make other use of the student’s work. For more information, view https://www.uat.edu/catalog.

Information in the README and LICENSE may not properly reflect the above at the moment.

## Setup

Please view the [Wiki - Setup](https://github.com/pchapman-uat/AstroTune/wiki/Setup) for a full guide on setting up the application.

## Evaluation Criteria

- [x] – Can the user control playback of Foobar2000? (i.e., Pause, Play, Skip, Seek, Volume)

- [x] – Is the application Open Sourced?

- [ ] – Does the application follow the licenses of all dependencies and third-party assets?
- [x] – Can the user view their music library?

- [x] – Can the user view their playlists?

- [x] – Can the user change the playing song from their Library?

- [x] – Is the app free to use?

- [x] – Does the app NOT have ads?

- [x] – Does the app work fully without an internet connection?

- [x] – Can the user use the app without crashing or bugs?

- [x] – Does the app have a good User Interface? (UI)

- [x] – Does the app have a good User Experience? (UX)

- [x] – Is the app customizable?

- [x] – Does the app follow the methodologies of Foobar2000? (Freeware and advanced)

- [ ] – Is the app secure and follow best practices for network traffic? [^1]

[^1]: Due to the API using HTTP only, the network traffic is not encrypted.

## Objectives

<details>
  
  ### ACS.1: Document the software development process to analyze a problem and to design, build, and test software solutions
  
  This project has full Git Management, with Releases, Versions, and Tags. This project also features a Wiki that provides explanations about the project and how to use the application. Multiple documents have been created documenting the process of creating this application, along with the use of services such as Trello.

### ACS.3 Implement data-driven solutions.

Although this project does not store any data locally, Foobar2000 uses SQLite to store its data. The Beefweb API provides a uniform way to retrieve data from Foobar2000, including now-playing information, libraries, album art, tags, and more. Understanding how the tags work in Foobar is crucial for this app to function, since all the requests use the tags like `%title%`

### ACS.4 Design and implement software solutions for multiple platforms, including mobile devices.

This project is created in React Native, which means it is supported on Android and iOS. This project can even be modified to work with React Native Web as well, which would allow a web-based interface. However, having this fully client-sided and supported on the web would require a rework, so that is currently not an option. This project is created to be a link between a Computer running any Foobar2000-supported operating system and the user's mobile device.

### ACS.5 Design, develop, and maintain object-oriented software solutions utilizing inheritance, encapsulation, polymorphism, and abstraction.

This project uses OOP in multiple places, ranging from the base classes for the API, custom elements, as well as types and interfaces. This project uses inheritance with classes like the [Themes](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/Themes.ts), as well as the [Settings](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/Settings.ts) and [Settings Groups](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/SettingGroups.ts). All classes use public/private methods, and some even with `get` methods. Multiple [Settings](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/Settings.ts) classes override methods as needed by their setting type. All [Settings](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/Settings.ts) are generic, which allows for subtypes of different values. The [Themes](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/Themes.ts) use an abstract base class, where each one overrides and fills in the missing values. This allows for each theme to be its own class type, so new values can be adjusted, rather than there being objects for each Theme. [Browser](https://github.com/pchapman-uat/AstroTune/blob/main/src/classes/responses/Browser.ts) also uses abstraction as there is a Browser Item, which could be a Folder, or File, there is also recursion and generic, so each folder could have children folders/files, it can also be searched recursively fully, or at a specific depth level.

### 5.6 Within software solutions, describe, implement, and analyze data structure techniques.

This application deals with a large amount of data, particularly when it comes to the browser. This will be able to recursively do API calls to be able to get the contents of a Folder, with each File/Folder inside of it. This is then displayed to the user, where they can navigate in and out of the folders, can then play the song.

</details>

## Resources

### Usage

- [Foobar2000](https://www.foobar2000.org/)
- [Latest APK](https://github.com/pchapman-uat/AstroTune/releases) (Downloaded from project GitHub)
- [BeefWeb fb2k-component](https://github.com/hyperblast/beefweb/releases) (Downloaded from [hyperblast's](https://github.com/hyperblast) GitHub)
- Android Phone
- Install from unknown sources must be enabled

### Development

- [Visual Studio Code](https://code.visualstudio.com/) (Recommended)
- [GitHub Desktop](https://github.com/apps/desktop) (Optional)
- [Git](https://git-scm.com/) (Recommended)
- Android Phone or Emulator (Physical Phone Recommended, S22 was used)
  - USB or Wireless debugging enabled
- Router (Optional)
- Windows 10/11 or Linux (Windows 11 was used)
  - Windows Only: [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Ubuntu was used)
- [SDK tools](https://developer.android.com/tools)
- [Android Studio](https://developer.android.com/studio) (Recommended, NOT USED)
- [Node.js](https://nodejs.org/en)
- [Node Package Manager \[NPM\]](https://www.npmjs.com/)

## References

Below is information regarding the assets and libraries used for this project.

### Assets

> [!NOTE]
> Assets are subject to change. All rights belong to their original owners. This application is not ready for release, so its license may prohibit the use of these icons.

- **Audio**
  - [Silence](./src/assets/audio/silence.mp3) - [anars GitHub](https://github.com/anars/blank-audio) _(No License)_
- **Controls**
  - [Next](./src/assets/controls/next.svg) - [SVG Repo](https://www.svgrepo.com/svg/512548/next-998) _(Public Domain)_
  - [Pause](./src/assets/controls/pause.svg) - [SVG Repo](https://www.svgrepo.com/svg/512622/pause-1006) _(Public Domain)_
  - [Play](./src/assets/controls/play.svg) - [SVG Repo](https://www.svgrepo.com/svg/512667/play-1000) _(Public Domain)_
  - [Previous](./src/assets/controls/previous.svg) - [SVG Repo](https://www.svgrepo.com/svg/512685/previous-999) _(Public Domain)_
  - [Stop](./src/assets/controls/stop.svg) - [SVG Repo](https://www.svgrepo.com/svg/522297/stop) _(CC Attribution License)_
  - [Volume State](./src/assets/controls/volume/) - [SVG Repo](https://www.svgrepo.com/collection/chunk-16px-thick-interface-icons/) _(Public Domain)_
- **Icons**
  - [GitHub Mark](./src/assets/icons/) - [GitHub](https://github.com/logos)
- **Navigation**
  - [Connection](./src/assets/navigation/connection.svg) – [SVG Repo](https://www.svgrepo.com/svg/513070/wifi-1029) _(Public Domain)_
  - [Library](./src/assets/navigation/library.svg) – [SVG Repo](https://www.svgrepo.com/svg/532810/folder) _(CC Attribution License)_
  - [Now Playing](./src/assets/navigation/nowPlaying.svg) – [SVG Repo](https://www.svgrepo.com/svg/532708/music) _(CC Attribution License)_
  - [Playback Queue](./src/assets/navigation/playbackQueue.svg) – [SVG Repo](https://www.svgrepo.com/svg/362993/queue-bold) _(MIT License)_
- **Lottie**
  - [Loading](./src/assets/lottie/loading.lottie.json) – [LottieFiles](https://lottiefiles.com/free-animation/music-play-Izr4xf80lB) _(Lottie Simple License)_
- **Miscellaneous**
  - [Menu](./src/assets/menu.svg) – [SVG Repo](https://www.svgrepo.com/svg/532195/menu) _(CC Attribution License)_
  - [Album](./src/assets/library/album.svg) - [SVG Repo](https://www.svgrepo.com/svg/324902/album-open) _(MIT License)_
  - [Stars](./src/assets/stars/) - [Google Fonts](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:star_half:FILL@1;wght@400;GRAD@0;opsz@24&icon.query=star&icon.size=24&icon.color=%23000000&icon.platform=web&icon.style=Rounded) _(Apache License Version 2.0)_
  - [Info](./src/assets/info.svg) - [SVG Repo](https://www.svgrepo.com/svg/524660/info-circle) _(CC Attribution License)_
  - [Placeholder](./src/assets/icon.png) - Expo Placeholder Icon
- [App Icon](./src/assets/logo/) – Created by a 3rd party, all rights where given to Preston Chapman.

### Packages

> [!NOTE]
> Due to this project being early in development the packages below will likely be inaccurate, please reference [`package.json`](./package.json) for exact modules.

- `@react-native-async-storage/async-storage`: `^2.1.2`,
  - Storage of settings
- `@react-native-community/slider`: `4.5.6`,
  - UI Element
- `@react-native-documents/picker`: `^11.0.3`,
  - Export/Import Settings
- `@react-native-picker/picker`: `2.11.0`,
  - UI Element
- `@react-navigation/native`: `^7.1.9`,
  - Navigation
- `@react-navigation/native-stack`: `^7.3.14`,
  - Navigation
- `axios`: `^1.12.0`,
  - Web Requests to the Beefweb API
- `expo`: `~53.0.9`,
  - Framework
- `expo-dev-client`: `^5.1.8`,
  - Dev Backend
- `expo-screen-orientation`: `^8.1.6`,
  - Horizontal and Vertical views
- `expo-secure-store`: `~14.2.3`,
  - Storage of encrypted settings (passwords)
- `lottie-react-native`: `7.2.2`,
  - Animated Icons
- `react`: `19.0.0`,
  - Framework
- `react-native`: `0.79.6`,
  - Framework
- `react-native-audio-pro`: `^9.9.1`,
  - Audio Controller in notification bar/lock screen
- `react-native-elements`: `^3.4.3`,
  - UI Elements
- `react-native-fs`: `^2.20.0`,
  - Export/Import Settings
- `react-native-gesture-handler`: `^2.27.1`,
  - Required for color picker
- `react-native-network-info`: `^5.2.1`,
  - Finding available servers
- `react-native-reanimated`: `^3.18.0`,
  - Required for color picker
- `react-native-restart`: `^0.0.27`,
  - Restart the application
- `react-native-safe-area-context`: `^5.4.0`,
  - UI Elements
- `react-native-screens`: `^4.11.1`,
  - Navigation
- `react-native-svg`: `^15.12.0`,
  - SVG Support
- `reanimated-color-picker`: `^4.1.0`
  - Color Picker

### VSCode Extensions

This is a list of all VSCode extensions that were used for this project.

- [ADB QR (Aakash P)](https://marketplace.visualstudio.com/items?itemName=AakashP.adb-qr) [AakashP.adb-qr]
- [Error Lense (Alexander)](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) [usernamehw.errorlens]
- [ESLint (Microsoft)](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) [dbaeumer.vscode-eslint]
- [Expo Tools (Expo)](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools) [expo.vscode-expo-tools]
- [GitLens (GitKraken)](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) [eamodio.gitlens]
- [Prettier (Prettier)](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) [esbenp.prettier-vscode]
- [React Native Tools (Microsoft)](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native) [msjsdiag.vscode-react-native]
- [Tasks (actboy168)](https://marketplace.visualstudio.com/items?itemName=actboy168.tasks) [actboy168.tasks]
- [Todo Tree (Gruntfuggly)](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) [Gruntfuggly.todo-tree]
- [Version Lens](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens) [pflannery.vscode-versionlens]
- [WSL (Microsoft)](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) [ms-vscode-remote.remote-wsl]
