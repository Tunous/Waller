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
const WallpaperDownloader = Me.imports.assets.wallpaperDownloader;

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
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(text, wallpaper) {
        this.parent();

        let box = new St.BoxLayout({ vertical: true });

        box.add_child(new St.Label({
            text: text,
            style_class: 'label-thumb'
        }));

        this._thumbnail = new Thumbnail(wallpaper);

        box.add_child(this._thumbnail);

        this.actor.add_actor(box);
    },

    setPreview: function(wallpaper) {
        this._thumbnail.set_gicon(wallpaper);
    },

    getImage: function() {
        return this._thumbnail.get_gicon();
    },

    _viewWallpaper: function() {
        let uri = this._thumbnail.get_gicon().get_file().get_uri();
        Utils.launchForUri(uri);
    }
});