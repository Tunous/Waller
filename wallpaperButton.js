const Lang = imports.lang;
const St = imports.gi.St;

const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const THUMBNAIL_WIDTH = 200;

const Thumbnail = new Lang.Class({
    Name: 'Thumbnail',
    Extends: St.Icon,

    _init: function(image) {
        this.parent({
            gicon: image,
            icon_size: THUMBNAIL_WIDTH,
            style_class: 'wall-thumbnail',
            height: THUMBNAIL_WIDTH * Utils.getScreenAspectRatio()
        });
    }
});

const PopupWallpaperButton = new Lang.Class({
    Name: 'PopupWallpaperButton',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(text, wallpaper) {
        this.parent();

        this.wallpaper = wallpaper;

        let box = new St.BoxLayout({ vertical: true });

        box.add_child(new St.Label({
            text: text,
            style_class: 'label-thumb'
        }));

        box.add_child(new Thumbnail(wallpaper));

        this.actor.add_actor(box);

        this.connect('activate', Lang.bind(this, this._viewWallpaper));
    },

    _viewWallpaper: function() {
        this._getTopMenu().close();

        Utils.setWallpaper(this.wallpaper);

        // let uri = this.wallpaper.get_file().get_uri()
        // Utils.launchForUri(uri);
    }
});