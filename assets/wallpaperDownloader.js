const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;
const Json = imports.gi.Json;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Timer = Me.imports.assets.timer;
const WallpaperUtils = Me.imports.assets.wallpaperUtils;
const WALLPAPER_LOCATION = Me.dir.get_path() + '/wallpapers/'

let wallpaperDownloader = null;

function instance() {
    if (wallpaperDownloader == null) {
        wallpaperDownloader = new WallpaperDownloader();
    }
    return wallpaperDownloader;
}

const WallpaperDownloader = new Lang.Class({
    Name: 'WallpaperDownloader',

    _nextDesktopWallpaper: null,
    _nextLockscreenWallpaper: null,
    _wallpaperUrls: [],

    _desktopWallpaperCallback: null,
    _lockscreenWallpaperCallback: null,

    _init: function () {
        this.timer = new Timer.Timer();
        this.timer.setCallback(Lang.bind(this, this._onTick));
        this.timer.start();

        this._fetchWallpaperUrls(Lang.bind(this, function() {
            this._getNewWallpaper(false);
            this._getNewWallpaper(true);
        }));
    },

    _onTick: function() {
        WallpaperUtils.setWallpaper(this.getWallpaper(false));
        WallpaperUtils.setLockscreenWallpaper(this.getWallpaper(true));
        return true;
    },

    setDesktopWallpaperCallback: function(callback) {
        if (callback === undefined || callback === null || typeof callback !== 'function') {
            throw TypeError('"callback" needs to be a function.');
        }

        this._desktopWallpaperCallback = callback;
    },

    setLockscreenWallpaperCallback: function(callback) {
        if (callback === undefined || callback === null || typeof callback !== 'function') {
            throw TypeError('"callback" needs to be a function.');
        }

        this._lockscreenWallpaperCallback = callback;
    },

    _getNewWallpaper: function(forLockscreen) {
        this._fetchFile(this._wallpaperUrls.pop(), forLockscreen, Lang.bind(this, function (wallpaper) {
            if (forLockscreen) {
                this._nextLockscreenWallpaper = wallpaper;

                if (this._lockscreenWallpaperCallback !== null) {
                    this._lockscreenWallpaperCallback(wallpaper);
                }
            } else {
                this._nextDesktopWallpaper = wallpaper;

                if (this._desktopWallpaperCallback !== null) {
                    this._desktopWallpaperCallback(wallpaper);
                }
            }
        }));
    },

    getWallpaper: function (forLockscreen) {
        let wallpaper = forLockscreen
            ? this._nextLockscreenWallpaper
            : this._nextDesktopWallpaper;

        if (this._wallpaperUrls.length == 0) {
            this._fetchWallpaperUrls(Lang.bind(this, function () {
                this._getNewWallpaper(forLockscreen);
            }));
        } else {
            this._getNewWallpaper(forLockscreen);
        }

        return wallpaper;
    },

    _shuffleWallpaperUrls: function () {
        let j, x, i;
        for (i = this._wallpaperUrls.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = this._wallpaperUrls[i - 1];
            this._wallpaperUrls[i - 1] = this._wallpaperUrls[j];
            this._wallpaperUrls[j] = x;
        }
    },

    _fetchWallpaperUrls: function (callback) {
        let session = new Soup.SessionAsync();
        let message = Soup.Message.new('GET', 'https://reddit.com/r/wallpapers/top.json?top=month')

        let parser = new Json.Parser();

        let _this = this;

        session.queue_message(message, function (session, message) {
            parser.load_from_data(message.response_body.data, -1);

            let data = parser.get_root().get_object().get_object_member('data');
            let children = data.get_array_member('children');

            let imageUrls = [];

            children.foreach_element(function (array, index, element, data) {
                let url = element.get_object().get_object_member('data').get_string_member('url');
                if (String(url).indexOf('.jpg') > 0) { // TODO
                    imageUrls.push(url);
                }
            });

            _this._wallpaperUrls = imageUrls;
            _this._shuffleWallpaperUrls();

            if (callback) {
                callback()
            }
        });
    },

    _fetchFile: function (url, forLockscreen, callback) {
        let date = new Date();
        let name = forLockscreen ? 'lockscreen-' : 'desktop-';
        name = name + date.getTime() + url.substr(url.lastIndexOf('.'));

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
    },

    destory: function() {
        this.parent();

        this.timer.stop();
    }
});