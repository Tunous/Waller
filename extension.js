const Lang = imports.lang;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Util = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const wallpaperLocation = Me.dir.get_path() + '/wallpapers/'

let PANEL_ICON_VISIBLE = true;

function init() {
}

const WallerIndicator = new Lang.Class({
    Name: 'WallerIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0, 'WallerIndicator');

        this._setupPanelIcon();
        this._setupMenu();

        this.actor.visible = PANEL_ICON_VISIBLE;
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
        let openWallpaperFolderMenuItem = new PopupMenu.PopupMenuItem('Open Wallpaper Folder');
        this.menu.addMenuItem(openWallpaperFolderMenuItem);
        openWallpaperFolderMenuItem.connect('activate', Lang.bind(this, this._openWallpapers));

        let settingsMenuItem = new PopupMenu.PopupMenuItem('Settings');
        this.menu.addMenuItem(settingsMenuItem);
        settingsMenuItem.connect('activate', Lang.bind(this, this._openSettings));
    },

    _openSettings: function() {
        Util.spawn(["gnome-shell-extension-prefs", Me.uuid]);
    },

    _openWallpapers: function() {
        let now = new Date().getTime() / 1000;
        let uri = GLib.filename_to_uri(wallpaperLocation, '');
        Gio.AppInfo.launch_default_for_uri(uri, global.create_app_launch_context(now, -1));
    }
});

let wallerIndicator;

function enable() {
    wallerIndicator = new WallerIndicator();
    Main.panel.addToStatusArea('WallerIndicator', wallerIndicator);
}

function disable() {
    wallerIndicator.destroy();
}
