const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;
const Json = imports.gi.Json;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Timer = Me.imports.assets.timer;
const WallpaperUtils = Me.imports.assets.wallpaperUtils;
const WALLPAPER_LOCATION = Me.dir.get_path() + '/wallpapers/'

function create(tickCallback) {
    return new WallpaperDownloader(tickCallback);
}

const WallpaperDownloader = new Lang.Class({
    Name: 'WallpaperDownloader',

    _nextWallpaper: null,
    _callback: null,
    _queue: [],

    _init: function (tickCallback) {
        this.timer = new Timer.Timer();
        this.timer.setCallback(tickCallback);
        this.timer.start();

        this._fillQueue(Lang.bind(this, function () {
            this._getNewWallpaper();
        }));
    },

    setCallback: function (callback) {
        if (callback === undefined || callback === null || typeof callback !== 'function') {
            throw TypeError('"callback" needs to be a function.');
        }

        this._callback = callback;
    },

    getWallpaper: function () {
        let wallpaper = this._nextWallpaper;
        
        if (this._queue.length == 0) {
            this._fillQueue(Lang.bind(this, function () {
                this._getNewWallpaper();
            }));
        } else {
            this._getNewWallpaper();
        }

        return wallpaper;
    },

    destory: function () {
        this.parent();

        this.timer.stop();
    },

    _getNewWallpaper: function () {
        this._fetchFile(this._queue.pop(), Lang.bind(this, function (wallpaper) {
            this._nextWallpaper = wallpaper;

            if (this._callback !== null) {
                this._callback(wallpaper);
            }
        }));
    },

    _shuffle: function (array) {
        let j, x, i;
        for (i = array.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = array[i - 1];
            array[i - 1] = array[j];
            array[j] = x;
        }
    },

    _fillQueue: function (callback) {
        let session = new Soup.SessionAsync();
        let message = Soup.Message.new('GET', 'https://reddit.com/r/wallpapers/top.json?limit=100')

        let parser = new Json.Parser();

        session.queue_message(message, Lang.bind(this, function (session, message) {
            parser.load_from_data(message.response_body.data, -1);

            let rootData = parser.get_root().get_object().get_object_member('data');
            let children = rootData.get_array_member('children');

            let imageUrls = [];

            children.foreach_element(Lang.bind(this, function (array, index, element, d) {
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

    _fetchFile: function (url, callback) {
        let date = new Date();
        let name = date.getTime() + url.substr(url.lastIndexOf('.'));

        let outputFile = Gio.file_new_for_path(WALLPAPER_LOCATION + String(name));
        let outputStream = outputFile.create(0, null);

        let inputFile = Gio.file_new_for_uri(url);

        inputFile.load_contents_async(null, function (file, result) {
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