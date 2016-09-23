const Lang = imports.lang;
const GLib = imports.gi.GLib;

const Timer = new Lang.Class({
    Name: 'Timer',

    _callback: null,
    _timeout: 180,
    _timerId: null,

    _init: function() {
    },

    setCallback: function(callback) {
        if (callback === undefined || callback === null || typeof callback !== 'function') {
            throw TypeError('"callback" needs to be a function.');
        }

        this._callback = callback;
    },

    start: function() {
        this.stop();
        this._timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, this._timeout, this._callback);
    },

    stop: function() {
        if (this._timerId !== null) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }
});