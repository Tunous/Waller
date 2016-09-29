UUID = waller@thanel.me
BASE_MODULES = extension.js stylesheet.css metadata.json LICENSE README.md
EXTRA_MODULES = assets/timer.js assets/utils.js assets/wall.js prefs.js prefs.xml
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
	# Copy extension to install directory
	mkdir -p $(INSTALL_BASE)/$(INSTALL_NAME)
	cp -r ./_build/* $(INSTALL_BASE)/$(INSTALL_NAME)/
	# Cleanup
	rm -rf _build
	echo done

_build: all
	rm -rf ./_build
	# Source code
	mkdir -p _build/assets
	cp $(BASE_MODULES) _build
	cp $(EXTRA_MODULES) _build/assets
	# Schemas
	mkdir -p _build/schemas
	cp schemas/*.xml _build/schemas
	cp schemas/gschemas.compiled _build/schemas
	# Wallpapers folder
	mkdir -p _build/wallpapers

uninstall:
	rm -rf $(INSTALL_BASE)/$(INSTALL_NAME)