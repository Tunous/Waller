const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Atk = imports.gi.Atk;
const Clutter = imports.gi.Clutter;
const BoxPointer = imports.ui.boxpointer;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.assets.utils;
const WallpaperUtils = Me.imports.assets.wallpaperUtils;

const THUMBNAIL_WIDTH = 200;

const Thumbnail = new Lang.Class({
    Name: 'Thumbnail',
    Extends: St.Icon,

    _init: function(image) {
        this.parent({
            gicon: image,
            icon_size: THUMBNAIL_WIDTH,
            style_class: 'wall-thumbnail',
            height: THUMBNAIL_WIDTH * WallpaperUtils.getScreenAspectRatio()
        });
    }
});

const PopupWallpaperButton = new Lang.Class({
    Name: 'PopupWallpaperButton',
    Extends: PopupMenu.PopupSubMenuMenuItem,

    _init: function(text, wallpaper) {
        this.parent('', false);

        let box = new St.BoxLayout({ vertical: true });

        this.actor.remove_all_children();
        this.actor.add(this._ornamentLabel);

        box.add_child(new St.Label({
            text: text,
            style_class: 'label-thumb'
        }));

        this._thumbnail = new Thumbnail(wallpaper);

        box.add_child(this._thumbnail);

        this.actor.add_actor(box);

        let setAsDesktopWallpaperItem = new PopupMenu.PopupMenuItem('Set as Desktop wallpaper');
        let setAsLockscreenWallpaperItem = new PopupMenu.PopupMenuItem('Set as Lockscreen wallpaper');
        let viewWallpaperItem = new PopupMenu.PopupMenuItem('View');

        this.menu.addMenuItem(setAsDesktopWallpaperItem);
        this.menu.addMenuItem(setAsLockscreenWallpaperItem);
        this.menu.addMenuItem(viewWallpaperItem);

        setAsDesktopWallpaperItem.connect('activate', Lang.bind(this, this._setAsDesktopWallpaper));
        setAsLockscreenWallpaperItem.connect('activate', Lang.bind(this, this._setAsLockscreenWallpaper));
        viewWallpaperItem.connect('activate', Lang.bind(this, this._viewWallpaper));
    },

    setPreview: function(wallpaper) {
        this._thumbnail.set_gicon(wallpaper);
    },

    _setAsDesktopWallpaper: function() {
        this._getTopMenu().close();
        WallpaperUtils.setWallpaper(this._thumbnail.get_gicon());
    },

    _setAsLockscreenWallpaper: function() {
        this._getTopMenu().close();
        WallpaperUtils.setLockscreenWallpaper(this._thumbnail.get_gicon());
    },

    _viewWallpaper: function() {
        let uri = this._thumbnail.get_gicon().get_file().get_uri();
        Utils.launchForUri(uri);
    }
});