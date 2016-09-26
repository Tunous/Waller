const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.assets.utils;
const Wall = Me.imports.assets.wall;

const wallpaperLocation = Me.dir.get_path() + '/wallpapers/'

let SHOW_PANEL_ICON = true;
let DOWNLOAD_INTERVAL = 60;
let UPDATE_LOCKSCREEN_WALLPAPER = true;
let UPDATE_WALLPAPER_ON_LAUNCH = true;

let wallerIndicator;

function init() {
}

const WallerIndicator = new Lang.Class({
    Name: 'WallerIndicator',
    Extends: PanelMenu.Button,

    _hasInitializedWallpaper: false,

    _init: function () {
        this.parent(0, 'WallerIndicator');

        this.wallpaperDownloader = new Wall.WallpaperDownloader(Lang.bind(this, this._updateWallpaper));
        this.wallpaperDownloader.setCallback(Lang.bind(this, function (wallpaper) {
            this.wallpaperButton.setPreview(wallpaper);

            if (!this._hasInitializedWallpaper && UPDATE_WALLPAPER_ON_LAUNCH) {
                this._updateWallpaper();
            }

            this._hasInitializedWallpaper = true;
        }));

        this._setupPanelIcon();
        this._setupMenu();

        this._settings = Utils.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._applySettings));
        this._applySettings();

        this.wallpaperDownloader.init();
    },

    _setupPanelIcon: function () {
        let box = new St.BoxLayout({
            vertical: false,
            style_class: 'panel-status-menu-box'
        });

        let icon = new St.Icon({
            icon_name: 'system-run-symbolic',
            style_class: 'system-status-icon'
        });

        box.add_child(icon);
        this.actor.add_child(box);
    },

    _setupMenu: function () {
        this.wallpaperButton = new Wall.PopupWallpaperButton('Next Wallpaper', Wall.getWallpaper());
        this.wallpaperButton.connect('activate', Lang.bind(this, this._updateWallpaper));
        this.menu.addMenuItem(this.wallpaperButton);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let openWallpaperFolderMenuItem = new PopupMenu.PopupMenuItem('Open Wallpaper Folder');
        openWallpaperFolderMenuItem.connect('activate', Lang.bind(this, this._openWallpapersFolder));
        this.menu.addMenuItem(openWallpaperFolderMenuItem);

        let deleteHistoryMenuItem = new PopupMenu.PopupMenuItem('Delete History');
        deleteHistoryMenuItem.connect('activate', Lang.bind(this.wallpaperDownloader, this.wallpaperDownloader.deleteHistory));
        this.menu.addMenuItem(deleteHistoryMenuItem);

        let settingsMenuItem = new PopupMenu.PopupMenuItem('Settings');
        settingsMenuItem.connect('activate', Lang.bind(this, this._openSettings));
        this.menu.addMenuItem(settingsMenuItem);
    },

    _openSettings: function () {
        Util.spawn(["gnome-shell-extension-prefs", Me.uuid]);
    },

    _applySettings: function () {
        SHOW_PANEL_ICON = this._settings.get_boolean('show-panel-icon');
        DOWNLOAD_INTERVAL = this._settings.get_int('interval');
        UPDATE_LOCKSCREEN_WALLPAPER = this._settings.get_boolean('update-lockscreen-wallpaper');
        UPDATE_WALLPAPER_ON_LAUNCH = this._settings.get_boolean('update-on-launch');

        this.actor.visible = SHOW_PANEL_ICON;
        this.wallpaperDownloader.timer.setInterval(DOWNLOAD_INTERVAL);
    },

    _openWallpapersFolder: function () {
        Utils.launchForUri(GLib.filename_to_uri(wallpaperLocation, ''));
    },

    _updateWallpaper: function() {
        let wallpaper = this.wallpaperDownloader.getWallpaper();

        Wall.setWallpaper(wallpaper);

        if (UPDATE_LOCKSCREEN_WALLPAPER) {
            Wall.setLockscreenWallpaper(wallpaper);
        }

        return true;
    },

    destory: function() {
        this.parent();

        this.wallpaperDownloader.destory();
    }
});

function enable() {
    wallerIndicator = new WallerIndicator();
    Main.panel.addToStatusArea('WallerIndicator', wallerIndicator);
}

function disable() {
    wallerIndicator.destroy();
}
