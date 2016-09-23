const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;
const Json = imports.gi.Json;

const Me = imports.misc.extensionUtils.getCurrentExtension();
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
    _wallpaperUrls: null,

    _init: function () {
    },

    initialize: function (desktop, lockscreen) {
        let _this = this;
        this._fetchWallpaperUrls(function () {
            _this._getNewWallpaper(false, desktop);
            _this._getNewWallpaper(true, lockscreen);
        })
    },

    _getNewWallpaper: function(forLockscreen, callback) {
        let _this = this;

        this._fetchFile(this._wallpaperUrls.pop(), forLockscreen, function (wallpaper) {
            if (forLockscreen) {
                _this._nextLockscreenWallpaper = wallpaper;
            } else {
                _this._nextDesktopWallpaper = wallpaper;
            }

            if (callback) {
                callback(wallpaper);
            }
        });
    },

    getWallpaper: function (forLockscreen, callback) {
        let wallpaper = forLockscreen
            ? this._nextLockscreenWallpaper
            : this._nextDesktopWallpaper;

        let _this = this;

        if (this._wallpaperUrls.length == 0) {
            this._fetchWallpaperUrls(function () {
                _this._getNewWallpaper(forLockscreen, callback);
            });
        } else {
            this._getNewWallpaper(forLockscreen, callback);
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

    // downloadWallpaper: function (callback) {
    //     let _this = this;
    //     _this._fetchUrl(function (imageUrl) {
    //         _this._fetchFile(imageUrl, function (uri) {
    //             let wallpaper = new Gio.FileIcon({ file: Gio.File.new_for_uri(uri) });

    //             callback(wallpaper);
    //         });
    //     })
    // },

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

    // _fetchUrl: function (callback) {
    //     let session = new Soup.SessionAsync();
    //     let message = Soup.Message.new('GET', 'https://reddit.com/r/wallpapers/top.json?top=month')

    //     let parser = new Json.Parser();

    //     session.queue_message(message, function (session, message) {
    //         parser.load_from_data(message.response_body.data, -1);

    //         let data = parser.get_root().get_object().get_object_member('data');
    //         let children = data.get_array_member('children');

    //         let imageLinks = [];

    //         children.foreach_element(function (array, index, element, data) {
    //             let url = element.get_object().get_object_member('data').get_string_member('url');
    //             if (String(url).indexOf('.jpg') > 0) { // TODO
    //                 imageLinks.push(url);
    //             }
    //         });

    //         let randomImageUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    //         if (callback) {
    //             callback(randomImageUrl)
    //         }
    //     });
    // },

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
    }
});