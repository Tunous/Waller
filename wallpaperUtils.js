const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;

const SETTING_WALLPAPER_URI = 'picture-uri';
const SETTING_BACKGROUND_MODE = 'picture-options';

function _getBackgroundSetting() {
    return new Gio.Settings({ schema: 'org.gnome.desktop.background' });
}

function setWallpaper(wallpaper) {
    let backgroundSetting = _getBackgroundSetting();
    let uri = wallpaper.get_file().get_uri();

    backgroundSetting.set_string(SETTING_WALLPAPER_URI, uri);
}

function getCurrentWallpaper() {
    let backgroundSetting = _getBackgroundSetting();
    let uri = backgroundSetting.get_string(SETTING_WALLPAPER_URI);

    return new Gio.FileIcon({ file: Gio.File.new_for_uri(uri) });
}

function getScreenAspectRatio() {
    let backgroundSetting = _getBackgroundSetting();
    let backgroundMode = backgroundSetting.get_string(SETTING_BACKGROUND_MODE);

    if (backgroundMode == 'spanned') {
        return Gdk.Screen.height() / Gdk.Screen.width();
    }

    let screen = Gdk.Screen.get_default();
    let monitor = screen.get_monitor_geometry(screen.get_primary_monitor());
    return monitor.height / monitor.width;
}