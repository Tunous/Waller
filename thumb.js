const Lang = imports.lang;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const THUMBNAIL_WIDTH = 200;

const Thumbnail = new Lang.Class({
    Name: 'Thumbnail',
    actor: {},
    
    _icon: {},
    _clickCallback: null,

    _init: function(gicon, clickCallback) {
        this._clickCallback = clickCallback;

        this._thumbnail = new St.Icon({
            gicon: gicon,
            icon_size: THUMBNAIL_WIDTH,
            height: THUMBNAIL_WIDTH * Utils.getScreenAspectRatio()
        });

        this.actor = new St.Button({
            child: this._thumbnail,
            x_expand: true
        });

        this.actor.connect('clicked', Lang.bind(this, this._onClick));
    },

    _onClick: function(object) {
        if (this._clickCallback != undefined && this._clickCallback != null) {
            this._clickCallback(this._thumbnail.get_gicon());
        }
    },

    set_style: function(style) {
        this.actor.set_style(style);
    },

    set_gicon: function(icon) {
        this._thumbnail.set_gicon(icon);
    },

    set_style_class: function(styleClass) {
        this._thumbnail.set_style_class(styleClass);
    },

    start_hover: function() {

    },

    stop_hover: function() {

    }
});