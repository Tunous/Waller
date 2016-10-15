const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

let SUBREDDITS_COL = 0;

const Settings = new Lang.Class({
    Name: 'Waller.Settings',

    _ready: false,

    _init: function() {
        this._settings = Utils.getSettings();

        this._builder = new Gtk.Builder();
        this._builder.add_from_file(Me.path + '/Settings.ui');

        this.widget = this._builder.get_object('window');

        this._subredditStore = this._builder.get_object('subredditStore');
        this._subredditInput = this._builder.get_object('subredditInput');
        this._selection = this._builder.get_object('subredditSelection');

        this._bindSettings();

        this._builder.connect_signals_full(Lang.bind(this, this._connector));
    },

    _connector: function(builder, object, signal, handler) {
        object.connect(signal, Lang.bind(this, this._SignalHandler[handler]));
    },

    _bindSettings: function() {
        let loadedSubreddits = this._settings.get_strv('subreddits');
        let addIterator;

        for (let i = 0; i < loadedSubreddits.length; i++) {
            addIterator = this._subredditStore.append();
            this._subredditStore.set_value(addIterator, SUBREDDITS_COL, loadedSubreddits[i])
        }

        this._settings.bind('show-panel-icon',
            this._builder.get_object('showPanelIcon'),
            'active',
            Gio.SettingsBindFlags.DEFAULT);

        this._settings.bind('interval',
            this._builder.get_object('interval'),
            'value',
            Gio.SettingsBindFlags.DEFAULT);

        this._settings.bind('update-lockscreen-wallpaper',
            this._builder.get_object('updateLockscreenWallpaper'),
            'active',
            Gio.SettingsBindFlags.DEFAULT);

        this._settings.bind('update-on-launch',
            this._builder.get_object('updateOnLaunch'),
            'active',
            Gio.SettingsBindFlags.DEFAULT);
    },

    _addSubredditFromInput: function() {
        let subredditName = this._subredditInput.get_text();

        this._subredditInput.delete_text(0, -1);

        if (!subredditName || /^\s*$/.test(subredditName)) {
            return;
        }

        let iterator = this._subredditStore.append();
        this._subredditStore.set_value(iterator, SUBREDDITS_COL, subredditName);
    },

    _removeSelectedSubreddit: function() {
        let [isSuccess, model, iter] = this._selection.get_selected();
        if (isSuccess) {
            model.remove(iter);
        }
    },

    _saveSubreddits: function() {
        if (!this._ready) {
            this._ready = true;
            return;
        }

        let [success, iterator] = this._subredditStore.get_iter_first();
        let subreddits = [];

        if (success) {
            do {
                let subreddit = this._subredditStore.get_value(iterator, SUBREDDITS_COL);
                subreddits.push(subreddit);
            } while (this._subredditStore.iter_next(iterator));
        }

        this._settings.set_strv('subreddits', subreddits);
    },

    _SignalHandler: {
        addSubredditButton_clicked_cb: function(button) {
            this._addSubredditFromInput();
        },

        removeSubredditButton_clicked_cb: function(button) {
            this._removeSelectedSubreddit();
        },

        subredditInput_activate_cb: function(input) {
            this._addSubredditFromInput();
        },

        window_screen_changed_cb: function(window) {
            this._saveSubreddits();
        }
    }
});

function init() {
}

function buildPrefsWidget() {
    let settings = new Settings();
    let widget = settings.widget;
    widget.show_all();
    return widget;
}