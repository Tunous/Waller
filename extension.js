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

const Utils = Me.imports.utils;
const Thumb = Me.imports.thumb;

const wallpaperLocation = Me.dir.get_path() + '/wallpapers/'

let SHOW_PANEL_ICON = true;

let wallerIndicator;

function init() {
}

const PopupWallpaperButton = new Lang.Class({
    Name: 'PopupWallpaperButton',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(text, image) {
        this.parent();

        this.image = image;

        let box = new St.BoxLayout({ vertical: true });

        box.add_child(new St.Label({
            text: text,
            style_class: 'label-thumb'
        }));

        box.add_child(new Thumb.Thumbnail(image));

        this.actor.add_actor(box);

        this.connect('activate', Lang.bind(this, this._viewImage));
    },

    _viewImage: function() {
        this._getTopMenu().close();

        let uri = this.image.get_file().get_uri()
        Utils.launchForUri(uri);
    }
});

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
        let wallpaper = Utils.getCurrentWallpaper();
        this.menu.addMenuItem(new PopupWallpaperButton('Desktop', wallpaper));
        this.menu.addMenuItem(new PopupWallpaperButton('Lockscreen', wallpaper));

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
