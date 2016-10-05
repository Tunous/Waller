const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;
const Json = imports.gi.Json;
const GLib = imports.gi.GLib;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const Timer = Me.imports.timer;

const WALLPAPER_LOCATION = Me.path + '/wallpapers/'
const THUMBNAIL_WIDTH = 200;
const SETTING_WALLPAPER_URI = 'picture-uri';
const SETTING_BACKGROUND_MODE = 'picture-options';

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

        this._thumbnail = new St.Icon({
            gicon: wallpaper,
            icon_size: THUMBNAIL_WIDTH,
            style_class: 'wall-thumbnail',
            height: THUMBNAIL_WIDTH * getScreenAspectRatio()
        });

        box.add_child(this._thumbnail);

        this.actor.add_actor(box);
    },

    setPreview: function(wallpaper) {
        this._thumbnail.set_gicon(wallpaper);
    },

    _viewWallpaper: function() {
        let uri = this._thumbnail.get_gicon().get_file().get_uri();
        Utils.launchForUri(uri);
    }
});

const WallpaperDownloader = new Lang.Class({
    Name: 'WallpaperDownloader',

    _currentWallpaper: null,
    _nextWallpaper: null,
    _callback: null,
    _queue: [],
    _subreddits: ['wallpapers'],
    _settings: null,

    _init: function(tickCallback) {
        this.timer = new Timer.Timer();
        this.timer.setCallback(tickCallback);

        this._settings = Utils.getSettings();

        this._updateInterval();
        this._updateSubreddits();

        this._settings.connect('changed::interval', Lang.bind(this, this._updateInterval));
        this._settings.connect('changed::subreddits', Lang.bind(this, this._updateSubreddits));

        let latestFile = this._getLatestFile();
        if (latestFile != null) {
            this._nextWallpaper = new Gio.FileIcon({ file: latestFile });
        }
    },

    _updateSubreddits: function() {
        this._subreddits = this._settings.get_strv('subreddits');
        print('Waller: Updated subreddits');
    },

    _updateInterval: function() {
        this.timer.setInterval(this._settings.get_int('interval'));
        this.timer.start();
        print('Waller: Updated interval');
    },

    init: function() {
        this._fillQueue(Lang.bind(this, function() {
            if (this._nextWallpaper == null) {
                this._getNewWallpaper();
            } else if (this._callback != null) {
                this._callback(this._nextWallpaper);
            }
        }));
    },

    setCallback: function(callback) {
        if (callback === undefined || callback === null || typeof callback !== 'function') {
            throw TypeError('"callback" needs to be a function.');
        }

        this._callback = callback;
    },

    setSubreddits: function(subreddits) {
        this._subreddits = subreddits;
    },

    getWallpaper: function() {
        let wallpaper = this._nextWallpaper;
        this._currentWallpaper = wallpaper;

        print("Waller: Getting wallpaper");

        if (this._queue.length == 0) {
            this._fillQueue(Lang.bind(this, function() {
                this._getNewWallpaper();
            }));
        } else {
            this._getNewWallpaper();
        }

        return wallpaper;
    },

    doForEachWallpaper: function(callback) {
        let directory = Gio.file_new_for_path(WALLPAPER_LOCATION);
        let enumerator = directory.enumerate_children('', Gio.FileQueryInfoFlags.NONE, null);

        let fileInfo;

        do {
            fileInfo = enumerator.next_file(null);

            if (!fileInfo) {
                break;
            }

            let name = fileInfo.get_name();
            let file = Gio.file_new_for_path(WALLPAPER_LOCATION + name);

            callback(file);
        } while (fileInfo);

        enumerator.close(null);
    },

    _getLatestFile: function() {
        let latestFile;
        let latestTime;

        this.doForEachWallpaper(Lang.bind(this, function(file) {
            let fileInfo = file.query_info(Gio.FILE_ATTRIBUTE_TIME_MODIFIED, Gio.FileQueryInfoFlags.NONE, null);
            let time = fileInfo.get_modification_time().tv_sec;

            if (latestFile == null || time > latestTime) {
                latestTime = time;
                latestFile = file;
            }
        }));

        return latestFile;
    },

    deleteHistory: function() {
        let nextWallpaperName = this._nextWallpaper != null ? this._nextWallpaper.get_file().get_basename() : null;
        let currentWallpaperName = this._currentWallpaper != null ? this._currentWallpaper.get_file().get_basename() : null;

        this.doForEachWallpaper(Lang.bind(this, function(file) {
            let fileInfo = file.query_info(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, null);
            let name = fileInfo.get_name();

            if (name != currentWallpaperName && name != nextWallpaperName) {
                file.delete(null);
            }
        }));
    },

    destory: function() {
        this.parent();

        this.timer.stop();
    },

    _getNewWallpaper: function() {
        print("Waller: Getting new wallpaper");

        this._fetchFile(this._queue.pop(), Lang.bind(this, function(wallpaper) {
            this._nextWallpaper = wallpaper;

            if (this._callback !== null) {
                print("Waller: Callback about new wallpaper");
                this._callback(wallpaper);
            }
        }));
    },

    _shuffle: function(array) {
        let j, x, i;
        for (i = array.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = array[i - 1];
            array[i - 1] = array[j];
            array[j] = x;
        }
    },

    _fillQueue: function(callback) {
        let subreddit = this._subreddits[Math.floor(Math.random() * this._subreddits.length)];
        let downloadLink = 'https://reddit.com/r/' + subreddit + '/top.json?limit=100';

        let session = new Soup.SessionAsync();
        let message = Soup.Message.new('GET', downloadLink)

        let parser = new Json.Parser();

        session.queue_message(message, Lang.bind(this, function(session, message) {
            parser.load_from_data(message.response_body.data, -1);

            let rootData = parser.get_root().get_object().get_object_member('data');
            let children = rootData.get_array_member('children');

            children.foreach_element(Lang.bind(this, function(array, index, element, d) {
                let data = element.get_object().get_object_member('data');
                let imageUrl = data.get_string_member('url');

                if (/^http(s)?:\/\/imgur\.com\/\w+$/.test(imageUrl)) {
                    imageUrl = imageUrl.replace('://', '://i.') + '.jpg';
                }

                let lowerImageUrl = imageUrl.toLowerCase();

                if (lowerImageUrl.endsWith('.jpg') ||
                    lowerImageUrl.endsWith('.jpeg') ||
                    lowerImageUrl.endsWith('.png')) {
                    this._queue.push(imageUrl);
                }
            }));

            this._shuffle(this._queue);

            if (callback) {
                callback();
            }
        }));
    },

    _fetchFile: function(url, callback) {
        let date = new Date();
        let name = date.getTime() + url.substr(url.lastIndexOf('.'));

        let outputFile = Gio.file_new_for_path(WALLPAPER_LOCATION + String(name));
        let outputStream = outputFile.create(0, null);

        let inputFile = Gio.file_new_for_uri(url);

        inputFile.load_contents_async(null, function(file, result) {
            let contents = file.load_contents_finish(result)[1];
            outputStream.write(contents, null);

            if (callback) {
                let uri = outputFile.get_uri();
                let file = new Gio.FileIcon({ file: Gio.File.new_for_uri(uri) });
                callback(file);
            }
        });
    }
});

function setWallpaperByUri(uri) {
    _setWallpaperByUri(_getWallpaperSetting(), uri);
}

function setWallpaper(wallpaper) {
    _setWallpaper(_getWallpaperSetting(), wallpaper);
}

function setLockscreenWallpaper(wallpaper) {
    _setWallpaper(_getLockscreenWallpaperSetting(), wallpaper);
}

function getWallpaper() {
    return _getWallpaperFromSetting(_getWallpaperSetting());
}

function getLockscreenWallpaper() {
    return _getWallpaperFromSetting(_getWallpaperSetting());
}

function getScreenAspectRatio() {
    let setting = _getWallpaperSetting();
    let backgroundMode = setting.get_string(SETTING_BACKGROUND_MODE);

    if (backgroundMode == 'spanned') {
        return Gdk.Screen.height() / Gdk.Screen.width();
    }

    let screen = Gdk.Screen.get_default();
    let monitor = screen.get_monitor_geometry(screen.get_primary_monitor());
    return monitor.height / monitor.width;
}

function _getWallpaperSetting() {
    return new Gio.Settings({ schema: 'org.gnome.desktop.background' });
}

function _getLockscreenWallpaperSetting() {
    return new Gio.Settings({ schema: 'org.gnome.desktop.screensaver' });
}

function _getWallpaperFromSetting(setting) {
    let uri = setting.get_string(SETTING_WALLPAPER_URI);
    return new Gio.FileIcon({ file: Gio.File.new_for_uri(uri) });
}

function _setWallpaper(setting, wallpaper) {
    let uri = wallpaper.get_file().get_uri();
    _setWallpaperByUri(setting, uri);
}

function _setWallpaperByUri(setting, uri) {
    setting.set_string(SETTING_WALLPAPER_URI, uri);
}
