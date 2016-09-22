const Lang = imports.lang;
const St = imports.gi.St;

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