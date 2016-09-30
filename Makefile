UUID = waller@thanel.me
INSTALL_PATH = ~/.local/share/gnome-shell/extensions
INSTALL_NAME = $(UUID)

SRC = extension.js \
	stylesheet.css \
	metadata.json \
	prefs.js \
	Settings.ui \
	LICENSE \
	README.md \
	timer.js \
	utils.js \
	wall.js

all: extension

clean:
	rm -f ./schemas/gschemas.compiled

extension: ./schemas/gschemas.compiled

./schemas/gschemas.compiled: ./schemas/org.gnome.shell.extensions.waller.gschema.xml
	glib-compile-schemas ./schemas/

install: install-local

install-local: build
	rm -rf $(INSTALL_PATH)/$(INSTALL_NAME)
	mkdir -p $(INSTALL_PATH)/$(INSTALL_NAME)
	cp -r ./build/* $(INSTALL_PATH)/$(INSTALL_NAME)/
	rm -rf build
	echo done

build: all
	rm -rf ./build
	mkdir -p build
	cp $(SRC) build
	mkdir -p build/schemas
	cp schemas/*.xml build/schemas
	cp schemas/gschemas.compiled build/schemas
	mkdir -p build/wallpapers

uninstall:
	rm -rf $(INSTALL_PATH)/$(INSTALL_NAME)