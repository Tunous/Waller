const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Soup = imports.gi.Soup;
const Json = imports.gi.Json;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const WALLPAPER_LOCATION = Me.dir.get_path() + '/wallpapers/'

function create() {
    return new WallpaperDownloader();
}

const WallpaperDownloader = new Lang.Class({
    Name: 'WallpaperDownloader',

    _init: function () {
    },

    downloadWallpaper: function (callback) {
        this._fetchUrl(function (imageUrl) {
            this._fetchFile(imageUrl, function (uri) {
                let wallpaper = new Gio.FileIcon({ file: Gio.File.new_for_uri(uri) });

                callback(wallpaper);
            });
        })
    },

    _fetchUrl: function (callback) {
        let session = new Soup.SessionAsync();
        let message = Soup.Message.new('GET', 'https://reddit.com/r/wallpapers/top.json?top=month')

        let parser = new Json.Parser();

        session.queue_message(message, function (session, message) {
            parser.load_from_data(message.response_body.data, -1);

            let data = parser.get_root().get_object().get_object_member('data');
            let children = data.get_array_member('children');
            let childrenData = children.get_object_element(0).get_object_member('data');
            let imageUrl = childrenData.get_string_member('url');

            if (callback) {
                callback(imageUrl)
            }
        });
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
                callback(name, outputFile.get_uri());
            }
        });
    }
});