const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;

const SETTING_WALLPAPER_URI = 'picture-uri';
const SETTING_BACKGROUND_MODE = 'picture-options';

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
    setting.set_string(SETTING_WALLPAPER_URI, uri);
}