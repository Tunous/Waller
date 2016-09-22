const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
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

        this.connect('activate', Lang.bind(this, this._viewWallpaper));
    },

    setPreview: function(wallpaper) {
        this._thumbnail.set_gicon(wallpaper);
    },

    _viewWallpaper: function() {
        this._getTopMenu().close();

        WallpaperUtils.setWallpaper(this._thumbnail.get_gicon());

        // let uri = this.wallpaper.get_file().get_uri()
        // Utils.launchForUri(uri);
    }
});