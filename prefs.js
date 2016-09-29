const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.assets.utils;

let SUBREDDITS_COL = 0;
let ready = false;
let settings;
let subredditInput;
let subredditStore;

function init() {
    settings = Utils.getSettings();
}

function buildPrefsWidget() {
    let buildable = new Gtk.Builder();
    buildable.add_from_file(Me.path + '/Settings.ui');
    let box = buildable.get_object('window');

    settings.bind('show-panel-icon', buildable.get_object('showPanelIcon'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('interval', buildable.get_object('interval'), 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('update-lockscreen-wallpaper', buildable.get_object('updateLockscreenWallpaper'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('update-on-launch', buildable.get_object('updateOnLaunch'), 'active', Gio.SettingsBindFlags.DEFAULT);

    // Initialize data
    subredditStore = buildable.get_object('subredditStore');
    let loadedSubreddits = settings.get_strv('subreddits');
    let addIterator;

    for (let i = 0; i < loadedSubreddits.length; i++) {
        addIterator = subredditStore.append();
        subredditStore.set_value(addIterator, SUBREDDITS_COL, loadedSubreddits[i])
    }

    // Add subreddit button behavior
    subredditInput = buildable.get_object('addSubredditInput');
    let addSubredditButton = buildable.get_object('addSubredditButton');

    subredditInput.connect('activate', addSubreddit);
    addSubredditButton.connect('clicked', addSubreddit);

    // Remove selected item button behavior
    let removeSubredditButton = buildable.get_object('removeSubredditButton');
    let selection = buildable.get_object('subredditSelection');

    removeSubredditButton.connect('clicked', function () {
        let [isSuccess, model, iter] = selection.get_selected();
        if (isSuccess) {
            model.remove(iter);
        }
    });

    // Save setting
    box.connect('screen_changed', function (widget) {
        if (!ready) {
            ready = true;
            return;
        }

        let [success, iterator] = subredditStore.get_iter_first();
        let subreddits = [];

        if (success) {
            do {
                let subreddit = subredditStore.get_value(iterator, SUBREDDITS_COL);
                subreddits.push(subreddit);
            } while (subredditStore.iter_next(iterator));
        }

        settings.set_strv('subreddits', subreddits);
    });

    box.show_all();
    return box;
}

function addSubreddit() {
    let iterator = subredditStore.append();
    subredditStore.set_value(iterator, SUBREDDITS_COL, subredditInput.get_text());
    subredditInput.delete_text(0, -1);
}