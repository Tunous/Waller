UUID = waller@thanel.me
BASE_MODULES = extension.js stylesheet.css metadata.json prefs.js Settings.ui LICENSE README.md
EXTRA_MODULES = assets/timer.js assets/utils.js assets/wall.js
INSTALL_BASE = ~/.local/share/gnome-shell/extensions
INSTALL_NAME = waller@thanel.me

all: extension

clean:
	rm -f ./schemas/gschemas.compiled

extension: ./schemas/gschemas.compiled

./schemas/gschemas.compiled: ./schemas/org.gnome.shell.extensions.waller.gschema.xml
	glib-compile-schemas ./schemas/

install: install-local

install-local: _build
	rm -rf $(INSTALL_BASE)/$(INSTALL_NAME)
	mkdir -p $(INSTALL_BASE)/$(INSTALL_NAME)
	cp -r ./_build/* $(INSTALL_BASE)/$(INSTALL_NAME)/
	rm -rf _build
	echo done

_build: all
	rm -rf ./_build
	mkdir -p _build/assets
	cp $(BASE_MODULES) _build
	cp $(EXTRA_MODULES) _build/assets
	mkdir -p _build/schemas
	cp schemas/*.xml _build/schemas
	cp schemas/gschemas.compiled _build/schemas
	mkdir -p _build/wallpapers

uninstall:
	rm -rf $(INSTALL_BASE)/$(INSTALL_NAME)