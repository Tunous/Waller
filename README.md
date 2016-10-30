# Waller

Waller (**Wall**paper Download**er**) is a Gnome Shell extension that automatically downloads images from chosen Reddit subreddits and sets them as desktop or lockscreen wallpapers.

![Preview](https://github.com/Tunous/Waller/blob/master/art/preview.png)

# Features

- Custom intervals
- Option to change lockscreen wallpaper
- Option to change wallpaper on login
- Preview of next wallpaper
- Quick way to immeadietly switch to next wallpaper

# Installation from source

The extension can be installed directry from the source by cloning or downloading the [zip file][zip] of the repository.

```sh
git clone https://github.com/Tunous/Waller.git
```

And then running the provided Makefile to install the extension in your home directory.

```sh
make
make install
```

Once downloaded and installed it should also be then activated by restarting Gnome Shell `Alt+F2 r ENTER` and enabling it using Gnome Tweak tool.

# Settings

- **Show panel icon**

Specify if an icon in the main panel should be visible.

- **Interval**

Time in minutes specifying how often new wallpapers should be downloaded.
Setting it to 0 will disable automatic changing. It's useful in combination with the update on launch setting.

- **Update lockscreen wallpaper**

Specify whether the lockscreen wallpaper should also be updated.

- **Update wallpaper on launch**

Specify whether the wallpaper should be updated when loggin in to the Gnome Shell.

- **Subreddits**

List of subreddits from which wallpapers should be downloaded.

# License

Waller is distributed under the terms of the GNU General Public License, version 3 or later.

See the [LICENSE] file for details. 

[zip]: https://github.com/Tunous/Waller/archive/master.zip
[LICENSE]: https://github.com/Tunous/Waller/blob/master/LICENSE