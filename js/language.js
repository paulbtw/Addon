class Localization {
    static loadLocalization(code) {
        return ExtensionResources.getJSON(`/localization/${code}/strings.json`);
    }

    static init() {

        function deepAssign(target, source) {
            // Object.assign() but deep-assigning objects recursively
            for (let [key, val] of Object.entries(source)) {
                if (target[key] === undefined) {
                    console.warn("The key %s does not exist.", key);
                    continue;
                }
                if (typeof val === "object") {
                    deepAssign(target[key], val);
                } else {
                    target[key] = val;
                }
            }
            return target;
        }

        let local = null;
        let codes = ["en", ];
        if (local !== null && local !== "en") {
            codes.push(local);
        }

        Localization._promise = Promise.all(codes.map(lc => Localization.loadLocalization(lc))).then(function([english, local]) {
            Localization.str = english;
            if (local) {
                deepAssign(Localization.str, local);
            }
            return Localization.str;
        });
        return Localization._promise;
    }

    static then(onDone, onCatch) {
        return Localization.init().then(onDone, onCatch);
    }

    static getString(key) {
        // Source: http://stackoverflow.com/a/24221895
        let path = key.split('.').reverse();
        let current = Localization.str;

        while (path.length) {
            if (typeof current !== 'object') {
                return undefined;
            } else {
                current = current[path.pop()];
            }
        }
        return current;
    }
}


Localization._promise = null;