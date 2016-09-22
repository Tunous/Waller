const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function init() {

}

function buildPrefsWidget() {
    let buildable = new Gtk.Builder();
    buildable.add_from_file(Me.dir.get_path() + '/prefs.xml');
    let box = buildable.get_object('scrolled_window_built');

    box.show_all();
    return box;
}