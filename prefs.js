const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

let settings;

function init() {
    settings = Utils.getSettings();
}

function buildPrefsWidget() {
    let buildable = new Gtk.Builder();
    buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
    let box = buildable.get_object('scrolled_window_built');

    settings.bind('show-panel-icon', buildable.get_object('field_show_panel_icon'), 'active', Gio.SettingsBindFlags.DEFAULT);

    box.show_all();
    return box;
}