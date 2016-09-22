const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;

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

function launchForUri(uri) {
    let now = new Date().getTime() / 1000;
    Gio.AppInfo.launch_default_for_uri(uri,
        global.create_app_launch_context(now, -1));
}