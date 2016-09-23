const Lang = imports.lang;
const GLib = imports.gi.GLib;

const Timer = new Lang.Class({
    Name: 'Timer',

    _callback: null,
    _interval: 360,
    _timerId: null,

    setCallback: function(callback) {
        if (callback === undefined || callback === null || typeof callback !== 'function') {
            throw TypeError('"callback" needs to be a function.');
        }

        this._callback = callback;
    },

    setInterval: function(interval) {
        this._interval = interval * 60;
        this.start();
    },

    start: function() {
        this.stop();
        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._interval, this._callback);
    },

    stop: function() {
        if (this._timerId !== null) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }
});