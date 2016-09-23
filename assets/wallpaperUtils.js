const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Soup = imports.gi.Soup;
const Json = imports.gi.Json;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const WALLPAPER_LOCATION = Me.dir.get_path() + '/wallpapers/'

const SETTING_WALLPAPER_URI = 'picture-uri';
const SETTING_BACKGROUND_MODE = 'picture-options';

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

function saveNewWallpaper(callback) {
    downloadWallpaper(function(imageUrl) {
        fetchFile(imageUrl, callback);
    });
}

function downloadWallpaper(callback) {
    let session = new Soup.SessionAsync();
    let message = Soup.Message.new('GET', 'https://reddit.com/r/wallpapers/top.json?top=month')

    let parser = new Json.Parser();

    session.queue_message(message, function(session, message) {
        parser.load_from_data(message.response_body.data, -1);

        let data = parser.get_root().get_object().get_object_member('data');
        let children = data.get_array_member('children');
        let childrenData = children.get_object_element(0).get_object_member('data');
        let imageUrl = childrenData.get_string_member('url');

        if (callback) {
            callback(imageUrl)
        }
    });
}

function fetchFile(uri, callback) {
    let inputBuffer;

    let date = new Date();

    let name = date.getTime() + uri.substr(uri.lastIndexOf('.'));

    let outputFile = Gio.file_new_for_path(WALLPAPER_LOCATION + String(name));

    let outputStream = outputFile.create(0, null);

    let inputFile = Gio.file_new_for_uri(uri);

    inputFile.load_contents_async(null, function(file, result) {
        let contents = file.load_contents_finish(result)[1];
        outputStream.write(contents, null);

        if (callback) {
            callback(name, outputFile.get_uri());
        }
    });
}