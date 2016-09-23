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
const WallpaperButton = Me.imports.assets.wallpaperButton;
const WallpaperUtils = Me.imports.assets.wallpaperUtils;

const wallpaperLocation = Me.dir.get_path() + '/wallpapers/'

let SHOW_PANEL_ICON = true;

let wallerIndicator;

function init() {
}

const WallerIndicator = new Lang.Class({
    Name: 'WallerIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0, 'WallerIndicator');

        this._setupPanelIcon();
        this._setupMenu();

        this._settings = Utils.getSettings();
        this._settingsChangedId = this._settings.connect('changed', Lang.bind(this, this._applySettings));
        this._applySettings();
    },

    _setupPanelIcon: function() {
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

    _setupMenu: function() {
        let currentWallpaper = WallpaperUtils.getWallpaper();

        let wallpaperButton = new WallpaperButton.PopupWallpaperButton('Next Desktop Wallpaper', currentWallpaper);

        WallpaperUtils.saveNewWallpaper(function(name, uri) {
            let nextWallpaper = new Gio.FileIcon({ file: Gio.File.new_for_uri(uri) });

            wallpaperButton.setPreview(nextWallpaper);
        })

        this.menu.addMenuItem(wallpaperButton);
        this.menu.addMenuItem(new WallpaperButton.PopupWallpaperButton('Next Lockscreen Wallpaper', currentWallpaper));

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let openWallpaperFolderMenuItem = new PopupMenu.PopupMenuItem('Open Wallpaper Folder');
        this.menu.addMenuItem(openWallpaperFolderMenuItem);
        openWallpaperFolderMenuItem.connect('activate', Lang.bind(this, this._openWallpapersFolder));

        let settingsMenuItem = new PopupMenu.PopupMenuItem('Settings');
        this.menu.addMenuItem(settingsMenuItem);
        settingsMenuItem.connect('activate', Lang.bind(this, this._openSettings));
    },

    _openSettings: function() {
        Util.spawn(["gnome-shell-extension-prefs", Me.uuid]);
    },

    _applySettings: function() {
        SHOW_PANEL_ICON = this._settings.get_boolean('show-panel-icon');
        this._updatePanelIconVisibility();
    },

    _updatePanelIconVisibility: function() {
        this.actor.visible = SHOW_PANEL_ICON;
    },

    _openWallpapersFolder: function() {
        Utils.launchForUri(GLib.filename_to_uri(wallpaperLocation, ''));
    },
});

function enable() {
    wallerIndicator = new WallerIndicator();
    Main.panel.addToStatusArea('WallerIndicator', wallerIndicator);
}

function disable() {
    wallerIndicator.destroy();
}
