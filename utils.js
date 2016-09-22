const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk
const ExtensionUtils = imports.misc.extensionUtils;

const BACKGROUND_SETTING_SCHEMA = 'org.gnome.desktop.background';
const SETTING_BACKGROUND_MODE = 'picture-options';
const SETTING_WALLPAPER_URI = 'picture-uri';

function getSettings() {
    let extension = ExtensionUtils.getCurrentExtension();
    let schema = 'org.gnome.shell.extensions.waller';

    const GioSSS = Gio.SettingsSchemaSource;

    let schemaDir = extension.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null)) {
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
            GioSSS.get_default(),
            false);
    } else {
        schemaSource = GioSSS.get_default();
    }

    let schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj) {
        throw new Error('Schema ' + schema + ' could not be found for extension ' +
            extension.metadata.uuid + '. Please check your installation.');
    }

    return new Gio.Settings({ settings_schema: schemaObj });
}

function getScreenAspectRatio() {
    let backgroundSetting = new Gio.Settings({
        schema: BACKGROUND_SETTING_SCHEMA
    });
    let backgroundMode = backgroundSetting.get_string(SETTING_BACKGROUND_MODE);

    if (backgroundMode == 'spanned') {
        return Gdk.Screen.height() / Gdk.Screen.width();
    }

    let screen = Gdk.Screen.get_default();
    let monitor = screen.get_monitor_geometry(screen.get_primary_monitor());
    return monitor.height / monitor.width;
}

function getCurrentWallpaper() {
    let backgroundSetting = new Gio.Settings({
        schema: BACKGROUND_SETTING_SCHEMA
    });
    let pathFromUri = decodeURIComponent(backgroundSetting.get_string(SETTING_WALLPAPER_URI))
        .replace(/^file:\/\//g, '');

    return new Gio.FileIcon({ file: Gio.File.new_for_path(pathFromUri) });
}

function launchForUri(uri) {
    let now = new Date().getTime() / 1000;
    Gio.AppInfo.launch_default_for_uri(uri,
        global.create_app_launch_context(now, -1));
}

function getBackgroundSetting() {
    return new Gio.Settings({ schema: BACKGROUND_SETTING_SCHEMA });
}

function setWallpaper(wallpaper) {
    let backgroundSetting = getBackgroundSetting();
    backgroundSetting.set_string(SETTING_WALLPAPER_URI, wallpaper.get_file().get_uri());
}