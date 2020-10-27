const Info = {
    'version': browser.runtime.getManifest().version,
    'db_version': 1,
};

class HTML {
    static adjacent(node, position, html) {
        if (typeof node == 'undefined' || node === null) {
            console.warn(`${node} is not an Element.`);
            return null;
        }
        if (typeof node == "string") {
            node = document.querySelector(node);
        }
        if (!(node instanceof Element)) {
            console.warn(`${node} is not an Element.`);
            return null;
        }

        node.insertAdjacentHTML(position, DOMPurify.sanitize(html));
        return node;
    }

    static beforeBegin(node, html) {
        HTML.adjacent(node, "beforebegin", html);
    }

    static afterBegin(node, html) {
        HTML.adjacent(node, "afterbegin", html);
    }

    static beforeEnd(node, html) {
        HTML.adjacent(node, "beforeend", html);
    }

    static afterEnd(node, html) {
        HTML.adjacent(node, "afterend", html);
    }
}

class GameId {
    static parseId(id) {
        if (!id) { return null; }

        let intId = parseInt(id);
        if (!intId) { return null; }

        return intId;
    }

    static getAppid(text) {
        if (!text) { return null; }

        if (text instanceof HTMLElement) {
            let appid = text.dataset.dsAppid;
            if (appid) return GameId.parseId(appid);
            text = text.href;
            if (!text) return null;
        }

        // app, market/listing
        let m = text.match(/(?:store\.steampowered|steamcommunity)\.com\/(app|market\/listings)\/(\d+)\/?/);
        return m && GameId.parseId(m[2]);
    }

    static getSubid(text) {
        if (!text) { return null; }

        if (text instanceof HTMLElement) {
            let subid = text.dataset.dsPackageid;
            if (subid) return GameId.parseId(subid);
            text = text.href;
            if (!text) return null;
        }

        let m = text.match(/(?:store\.steampowered|steamcommunity)\.com\/sub\/(\d+)\/?/);
        return m && GameId.parseId(m[2]);
    }

    static getBundleid(text) {
        if (!text) { return null; }

        if (text instanceof HTMLElement) {
            let bundleid = text.dataset.dsBundleid;
            if (bundleid) return GameId.parseId(bundleid);
            text = text.href;
            if (!text) return null;
        }

        let m = text.match(/(?:store\.steampowered|steamcommunity)\.com\/bundle\/(\d+)\/?/);
        return m && GameId.parseId(m[2]);
    }

    static trimStoreId(storeId) {
        return Number(storeId.slice(storeId.indexOf('/') + 1));
    }

    static getAppidImgSrc(text) {
        if (!text) { return null; }
        let m = text.match(/(steamcdn-a\.akamaihd\.net\/steam|steamcommunity\/public\/images)\/apps\/(\d+)\//);
        return m && GameId.parseId(m[2]);
    }

    static getAppidUriQuery(text) {
        if (!text) { return null; }
        let m = text.match(/appid=(\d+)/);
        return m && GameId.parseId(m[1]);
    }

    static getAppids(text) {
        let regex = /(?:store\.steampowered|steamcommunity)\.com\/app\/(\d+)\/?/g;
        let res = [];
        let m;
        while ((m = regex.exec(text)) != null) {
            let id = GameId.parseId(m[1]);
            if (id) {
                res.push(id);
            }
        }
        return res;
    }

    static getAppidFromId(text) {
        if (!text) { return null; }
        let m = text.match(/game_(\d+)/);
        return m && GameId.parseId(m[1]);
    }

    static getAppidFromGameCard(text) {
        if (!text) { return null; }
        let m = text.match(/\/gamecards\/(\d+)/);
        return m && GameId.parseId(m[1]);
    }

    static getAppidfromStorepage() {
        let appid = GameId.getAppid(window.location.host + window.location.pathname.replace(/\/+/g, "/"));
        return appid;
    }
}

class Timestamp {

    static now() {
        return Math.trunc(Date.now() / 1000);
    }
}

class CacheStorage {
    static isExpired(timestamp, ttl) {
        if (!timestamp) return true;
        if (typeof ttl != 'number' || ttl < 0) ttl = 0;
        return timestamp + ttl <= Timestamp.now();
    }

    static get(key, ttl, defaultValue) {
        if (!ttl) return defaultValue;
        let item = localStorage.getItem('cache_' + key);
        if (!item) return defaultValue;
        try {
            item = JSON.parse(item);
        } catch (err) {
            return defaultValue;
        }
        if (!item.timestamp || CacheStorage.isExpired(item.timestamp, ttl)) return defaultValue;
        return item.data;
    }

    static set(key, value) {
        localStorage.setItem('cache_' + key, JSON.stringify({ 'data': value, 'timestamp': Timestamp.now(), }));
    }

    static remove(key) {
        localStorage.removeItem('cache_' + key);
    }

    static keys() {
        return LocalStorage.keys()
            .filter(k => k.startsWith('cache_'))
            .map(k => k.substring(6)); // "cache_".length == 6
    }

    static clear() {
        let keys = CacheStorage.keys();
        for (let key of keys) {
            CacheStorage.remove(key);
        }
    }
}

class LocalStorage {
    static get(key, defaultValue) {
        let item = localStorage.getItem(key);
        if (!item) return defaultValue;
        try {
            return JSON.parse(item);
        } catch (err) {
            return defaultValue;
        }
    }

    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static keys() {
        let result = [];
        for (let i = localStorage.length - 1; i >= 0; --i) {
            result.push(localStorage.key(i));
        }
        return result;
    }

    static clear() {
        localStorage.clear();
    }
}


class SyncedStorage {
    /**
     * browser.storage.sync limits
     * QUOTA_BYTES = 102400 // 100KB
     * QUOTA_BYTES_PER_ITEM = 8192 // 8KB
     * MAX_ITEMS = 512
     * MAX_WRITE_OPERATIONS_PER_HOUR = 1800
     * MAX_WRITE_OPERATIONS_PER_MINUTE = 120
     */
    static has(key) {
        return Object.prototype.hasOwnProperty.call(this.cache, key);
    }
    static get(key) {
        if (typeof this.cache[key] == 'undefined') {
            if (typeof this.defaults[key] == 'undefined') {
                console.warn(`Unrecognized SyncedStorage key '${key}'`);
            }
            return this.defaults[key];
        }
        return this.cache[key];
    }

    static set(key, value) {
        this.cache[key] = value;
        return this.adapter.set({
            [key]: value,
        });
        // this will throw if MAX_WRITE_*, MAX_ITEMS, QUOTA_BYTES* are exceeded
    }

    static remove(key) {
        if (typeof this.cache[key]) {
            delete this.cache[key];
        }
        return this.adapter.remove(key);
        // can throw if MAX_WRITE* is exceeded
    }

    static keys(prefix = '') {
        return Object.keys(this.cache).filter(k => k.startsWith(prefix));
    }

    static clear() {
        this.cache = {};
        return this.adapter.clear();
        // can throw if MAX_WRITE* is exceeded
    }

    // load whole storage and make local copy
    static async init() {
        browser.storage.onChanged.addListener(changes => {
            for (let [key, { newValue: val, }] of Object.entries(changes)) {
                this.cache[key] = val;
            }
        });

        let storage = await this.adapter.get(null);
        Object.assign(this.cache, storage);

        return this.cache;
    }
    static then(onDone, onCatch) {
        return this.init().then(onDone, onCatch);
    }

    static async quota() {
        let maxBytes = this.adapter.QUOTA_BYTES;
        let bytes = await this.adapter.getBytesInUse();
        return bytes / maxBytes; // float 0.0 (0%) -> 1.0 (100%)
    }
}

SyncedStorage.adapter = browser.storage.sync || browser.storage.local;
SyncedStorage.cache = {};
SyncedStorage.defaults = {
    'version': Info.version,

    // General
    'language': "english",
    'allowOpenInNewTab': true,

    // Steam
    'showSteamspy': true,
    'showHltb': true,
    'showSteamCharts': true,
    'showDRMWarning': true,
    'removeAwards': true,

    // Stores
    'steam': true,
    'epicgames': true,
    'origin': true,
    'uplay': true,
    'gog': true,
    'twitch': true,

    'g2a': true,
    'mmoga': true,
    'kinguin': true,
    'hrkgame': true,
    'gameladen': true,
    'gamivo': true,
    'instantgaming': true,
    'eneba': true,

};

/**
 * DOMPurify setup
 * @see https://github.com/cure53/DOMPurify
 */
(async function() {
    let allowOpenInNewTab = SyncedStorage.defaults.allowOpenInNewTab;
    try {
        await SyncedStorage;
        allowOpenInNewTab = SyncedStorage.get("allowOpenInNewTab");
    } catch (e) {
        console.error(e);
    }

    let purifyConfig = {
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|chrome-extension|moz-extension|steam):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    };

    if (allowOpenInNewTab) {
        purifyConfig.ADD_ATTR = ["target"];

        DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
            if (data.attrName === "target") {
                if (data.attrValue === "_blank") {
                    node.setAttribute("rel", "noreferrer noopener");
                } else {
                    data.keepAttr = false;
                }
            }
        });
    }

    DOMPurify.setConfig(purifyConfig);
})();

class ErrorHandler {

    static storepageGameNotFound() {
        const node =
            `
        <div class="game_area_purchase_game_wrapper" id="mytems_compare">
            <div class="game_area_purchase_game">
                <h1>No Deals found.</h1>
                <div class="game_purchase_action">
                    <div class="game_purchase_action_bg">
                        <div class="game_purchase_price price">0.00€</div>
                        <div class="btn_addtocart" id="mytems_report">
                            <div class="btnv6_green_white_innerfade btn_medium red"><span>Report Game</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `

        let drmWarningNode = document.querySelector('#mytems_warning');
        if (drmWarningNode) {
            HTML.afterEnd(drmWarningNode, node);
        } else {
            HTML.afterBegin('#game_area_purchase', node);
        }

        document.querySelector('#mytems_report').addEventListener("click", ErrorHandler.onClickNotFound)
    }

    static onClickNotFound() {
        const data = window.location.host + window.location.pathname
        fetch(`${Config.ApiServer}/api/report`, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: data })
        })
    }

    static storePageServerError() {
        const node =
            `
        <div class="game_area_purchase_game_wrapper" id="mytems_compare">
            <div class="game_area_purchase_game">
                <h1>Server Error.</h1>
                <div class="game_purchase_action">
                    <div class="game_purchase_action_bg">
                        <div class="game_purchase_price price">0.00€</div>
                        <div class="btn_addtocart" id="mytems_report">
                            <div class="btnv6_green_white_innerfade btn_medium red"><span>Report Error</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
        let drmWarningNode = document.querySelector('#mytems_warning');
        if (drmWarningNode) {
            HTML.afterEnd(drmWarningNode, node);
        } else {
            HTML.afterBegin('#game_area_purchase', node);
        }

        document.querySelector('#mytems_report').addEventListener("click", ErrorHandler.onClickNotFound)
    }

    static onClickServerError() {
        const data = window.location.host + window.location.pathname
        console.log('test ' + data)
        fetch(`${Config.ApiServer}/api/report`, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: data })
        })
    }
}

class MYTEMSAPI {
    static async getPrices(appid) {
        if (!appid) {
            return null;
        }
        const response = await fetch(`${Config.ApiServer}/api/steam/${appid}?steamspy=${SyncedStorage.get("showSteamspy")}`, {
            method: 'GET'
        }).then(result => {
            return result.json()
        }).catch(err => {
            console.log(err);
            if (err.statusCode === 404) {
                return ErrorHandler.storepageGameNotFound()
            }
            return ErrorHandler.storePageServerError()
        })

        if (!response) {
            return null;
        }

        if (response.game) {
            CacheStorage.set(appid, { game: response.game, spy: response.spy, hltb: response.hltb, sc: response.sc })
        }
        return { game: response.game, spy: response.spy, hltb: response.hltb, sc: response.sc }
    }

    static async getPricesByPath(path) {
        if (!path) {
            return null;
        }
        const response = await fetch(`${Config.ApiServer}/api/retailer/${path}`, {
            method: 'GET'
        }).then(result => {
            return result.json()
        }).catch(err => {
            if (err.statusCode === 404) {
                return null //ErrorHandler.storepageGameNotFound()
            }
            return null //ErrorHandler.storePageServerError()
        })

        if (!response) {
            return null;
        }

        if (response.game) {
            response.game.offers.sort((a, b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0));
            CacheStorage.set(path, { game: response.game })
        }
        return { game: response.game }
    }

    static async getPricesByName(name) {
        if (!name) {
            return null;
        }
        const response = await fetch(`${Config.ApiServer}/api/name/${name}`, {
            method: 'GET'
        }).then(result => {
            return result.json()
        }).catch(err => {
            if (err.statusCode === 404) {
                return null //ErrorHandler.storepageGameNotFound()
            }
            return null //ErrorHandler.storePageServerError()
        })

        if (!response) {
            return null;
        }

        if (response.game) {
            response.game.gameOffers.sort((a, b) => (a.gamePrices.price > b.gamePrices.price) ? 1 : ((b.gamePrices.price > a.gamePrices.price) ? -1 : 0));
            CacheStorage.set(name, { game: response.game })
        }
        return { game: response.game }
    }
}

const PaymentIcons = {
    creditCard: '<svg class="payment-icons-svg" viewBox="0 0 100 60" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g id="Visa-dark"><path d="M3.999 0L96.001 0Q96.1975 0 96.393 0.0192563Q96.5885 0.0385126 96.7812 0.0768396Q96.9738 0.115167 97.1618 0.172196Q97.3498 0.229224 97.5313 0.304406Q97.7128 0.379587 97.8861 0.472197Q98.0594 0.564807 98.2227 0.673953Q98.3861 0.783099 98.5379 0.907731Q98.6898 1.03236 98.8287 1.17128Q98.9676 1.3102 99.0923 1.46206Q99.2169 1.61393 99.326 1.77727Q99.4352 1.94062 99.5278 2.11388Q99.6204 2.28715 99.6956 2.46865Q99.7708 2.65015 99.8278 2.83815Q99.8848 3.02615 99.9231 3.21883Q99.9615 3.41152 99.9807 3.60703Q100 3.80254 100 3.999L100 56.001Q100 56.1975 99.9807 56.393Q99.9615 56.5885 99.9231 56.7812Q99.8848 56.9739 99.8278 57.1618Q99.7708 57.3498 99.6956 57.5313Q99.6204 57.7129 99.5278 57.8861Q99.4352 58.0594 99.326 58.2227Q99.2169 58.3861 99.0923 58.5379Q98.9676 58.6898 98.8287 58.8287Q98.6898 58.9676 98.5379 59.0923Q98.3861 59.2169 98.2227 59.326Q98.0594 59.4352 97.8861 59.5278Q97.7128 59.6204 97.5313 59.6956Q97.3498 59.7708 97.1618 59.8278Q96.9738 59.8848 96.7812 59.9232Q96.5885 59.9615 96.393 59.9807Q96.1975 60 96.001 60L3.999 60Q3.80254 60 3.60703 59.9807Q3.41152 59.9615 3.21883 59.9232Q3.02615 59.8848 2.83815 59.8278Q2.65015 59.7708 2.46865 59.6956Q2.28715 59.6204 2.11388 59.5278Q1.94062 59.4352 1.77727 59.326Q1.61393 59.2169 1.46206 59.0923Q1.3102 58.9676 1.17128 58.8287Q1.03236 58.6898 0.907731 58.5379Q0.783099 58.3861 0.673953 58.2227Q0.564807 58.0594 0.472197 57.8861Q0.379587 57.7129 0.304406 57.5313Q0.229224 57.3498 0.172196 57.1619Q0.115167 56.9739 0.0768396 56.7812Q0.0385126 56.5885 0.0192563 56.393Q0 56.1975 0 56.001L0 3.999Q0 3.80254 0.0192563 3.60703Q0.0385126 3.41152 0.0768397 3.21883Q0.115167 3.02615 0.172196 2.83815Q0.229224 2.65015 0.304406 2.46865Q0.379587 2.28715 0.472197 2.11388Q0.564807 1.94062 0.673953 1.77727Q0.783099 1.61393 0.907731 1.46206Q1.03236 1.3102 1.17128 1.17128Q1.3102 1.03236 1.46206 0.907731Q1.61393 0.783099 1.77727 0.673953Q1.94062 0.564807 2.11388 0.472197Q2.28715 0.379587 2.46865 0.304406Q2.65015 0.229224 2.83815 0.172196Q3.02615 0.115167 3.21883 0.0768396Q3.41152 0.0385126 3.60703 0.0192563Q3.80254 0 3.999 0L3.999 0Z" id="Rectangle" fill="#26337A" stroke="none" /><path d="M0 19.0741L3.07474 0L7.98959 0L4.91514 19.0741L0 19.0741" transform="translate(41.48999 20.47268)" id="Fill-3" fill="#FFFFFE" stroke="none" /><path d="M14.7477 0.800282C13.7759 0.417465 12.2475 0 10.3436 0C5.48438 0 2.06388 2.58845 2.03549 6.29493C2.00457 9.03662 4.47633 10.5656 6.33978 11.4769C8.25496 12.411 8.89841 13.0087 8.89082 13.8439C8.87761 15.1214 7.36217 15.7068 5.94905 15.7068C3.9813 15.7068 2.93587 15.4186 1.31951 14.7065L0.687304 14.4028L0 18.6724C1.14607 19.2037 3.27067 19.6648 5.47566 19.689C10.6399 19.689 13.9954 17.1318 14.0348 13.1738C14.0525 10.9997 12.7428 9.35183 9.90646 7.99127C8.1889 7.10676 7.13475 6.52084 7.14684 5.62563C7.14796 4.83296 8.03738 3.98423 9.9624 3.98423C11.57 3.95831 12.7338 4.32958 13.6407 4.71718L14.082 4.93521L14.7477 0.800282" transform="translate(49.48521 20.14056)" id="Fill-4" fill="#FFFFFE" stroke="none" /><path d="M9.87497 0L13.6733 0L17.6509 19.0614L13.0891 19.0614C13.0891 19.0614 12.638 16.8693 12.4907 16.2037C11.7747 16.2037 6.75863 16.1938 6.19558 16.1938C6.00442 16.7099 5.16223 19.0614 5.16223 19.0614L0 19.0614L7.29892 1.58113C7.81503 0.337465 8.69686 0 9.87497 0ZM9.56772 6.96056C9.56772 6.96056 8.01714 11.1958 7.60982 12.2921L11.6901 12.2921C11.4958 11.3386 10.5527 6.78592 10.5527 6.78592L10.221 5.14085C10.0894 5.51996 9.90559 6.02289 9.76624 6.40419C9.64281 6.74193 9.55426 6.98425 9.56772 6.96056Z" transform="translate(63.16748 20.49211)" id="Fill-5" fill="#FFFFFE" fill-rule="evenodd" stroke="none" /><path d="M12.1342 0L7.32365 13.0039L6.80839 10.3606C5.91194 7.31493 3.1214 4.0138 0 2.35972L4.401 19.0414L9.60258 19.0383L17.3426 0L12.1342 0" transform="translate(25.23251 20.48873)" id="Fill-6" fill="#FFFFFE" stroke="none" /><path d="M7.991 0L0.0652166 0L0 0.395211C6.16718 1.97521 10.2477 5.78901 11.9414 10.3735L10.219 1.6093C9.92192 0.400563 9.05836 0.0422535 7.991 0" transform="translate(20.09951 20.47577)" id="Fill-7" fill="#EC982D" stroke="none" /></g></svg>',
    paypal: '<svg class="payment-icons-svg" viewBox="0 0 100 60" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g id="Paypal-dark" transform="matrix(1 0 0 -1 0 60)"><path d="M3.999 0L96.001 0Q96.1975 0 96.393 0.0192563Q96.5885 0.0385126 96.7812 0.0768396Q96.9738 0.115167 97.1618 0.172196Q97.3498 0.229224 97.5313 0.304406Q97.7128 0.379587 97.8861 0.472197Q98.0594 0.564807 98.2227 0.673953Q98.3861 0.783099 98.5379 0.907731Q98.6898 1.03236 98.8287 1.17128Q98.9676 1.3102 99.0923 1.46206Q99.2169 1.61393 99.326 1.77727Q99.4352 1.94062 99.5278 2.11388Q99.6204 2.28715 99.6956 2.46865Q99.7708 2.65015 99.8278 2.83815Q99.8848 3.02615 99.9231 3.21883Q99.9615 3.41152 99.9807 3.60703Q100 3.80254 100 3.999L100 56.001Q100 56.1975 99.9807 56.393Q99.9615 56.5885 99.9231 56.7812Q99.8848 56.9739 99.8278 57.1618Q99.7708 57.3498 99.6956 57.5313Q99.6204 57.7129 99.5278 57.8861Q99.4352 58.0594 99.326 58.2227Q99.2169 58.3861 99.0923 58.5379Q98.9676 58.6898 98.8287 58.8287Q98.6898 58.9676 98.5379 59.0923Q98.3861 59.2169 98.2227 59.326Q98.0594 59.4352 97.8861 59.5278Q97.7128 59.6204 97.5313 59.6956Q97.3498 59.7708 97.1618 59.8278Q96.9738 59.8848 96.7812 59.9232Q96.5885 59.9615 96.393 59.9807Q96.1975 60 96.001 60L3.999 60Q3.80254 60 3.60703 59.9807Q3.41152 59.9615 3.21883 59.9232Q3.02615 59.8848 2.83815 59.8278Q2.65015 59.7708 2.46865 59.6956Q2.28715 59.6204 2.11388 59.5278Q1.94062 59.4352 1.77727 59.326Q1.61393 59.2169 1.46206 59.0923Q1.3102 58.9676 1.17128 58.8287Q1.03236 58.6898 0.907731 58.5379Q0.783099 58.3861 0.673953 58.2227Q0.564807 58.0594 0.472197 57.8861Q0.379587 57.7129 0.304406 57.5313Q0.229224 57.3498 0.172196 57.1619Q0.115167 56.9739 0.0768396 56.7812Q0.0385126 56.5885 0.0192563 56.393Q0 56.1975 0 56.001L0 3.999Q0 3.80254 0.0192563 3.60703Q0.0385126 3.41152 0.0768397 3.21883Q0.115167 3.02615 0.172196 2.83815Q0.229224 2.65015 0.304406 2.46865Q0.379587 2.28715 0.472197 2.11388Q0.564807 1.94062 0.673953 1.77727Q0.783099 1.61393 0.907731 1.46206Q1.03236 1.3102 1.17128 1.17128Q1.3102 1.03236 1.46206 0.907731Q1.61393 0.783099 1.77727 0.673953Q1.94062 0.564807 2.11388 0.472197Q2.28715 0.379587 2.46865 0.304406Q2.65015 0.229224 2.83815 0.172196Q3.02615 0.115167 3.21883 0.0768396Q3.41152 0.0385126 3.60703 0.0192563Q3.80254 0 3.999 0L3.999 0Z" id="Rectangle" fill="#00457C" stroke="none" /><path d="M2.02188 13.3051L0.00511512 0.473303C-0.0341684 0.22493 0.157814 0 0.409355 0L2.43816 0C2.77397 0 3.06036 0.244572 3.11231 0.576581L5.1012 13.1777C5.14048 13.4261 4.9485 13.651 4.69633 13.651L2.42675 13.651C2.22463 13.651 2.05293 13.5047 2.02188 13.3051" transform="translate(76.40434 24.70155)" id="Shape" fill="#FFFFFF" stroke="none" /><path d="M10.9646 12.2894L8.59934 12.2894C8.37314 12.2894 8.16152 12.1773 8.0348 11.9897L4.77173 7.18445L3.38921 11.8022C3.3024 12.0911 3.03629 12.2894 2.73469 12.2894L0.409995 12.2894C0.129308 12.2894 -0.0683764 12.0132 0.0222291 11.7477L2.62635 4.10259L0.176829 0.646277C-0.0151536 0.375094 0.17873 0 0.511372 0L2.87409 0C3.09775 0 3.30747 0.109614 3.43546 0.293359L11.301 11.6463C11.4892 11.9181 11.2953 12.2894 10.9646 12.2894" transform="translate(42.17033 21.51743)" id="Shape" fill="#FFFFFF" stroke="none" /><path d="M7.84923 4.74317C7.62176 3.39866 6.55477 2.49577 5.19315 2.49577C4.51076 2.49577 3.96396 2.71563 3.61294 3.13128C3.26446 3.54312 3.13394 4.13047 3.24418 4.78372C3.45581 6.11682 4.54054 7.04822 5.88125 7.04822C6.5497 7.04822 7.09207 6.82646 7.45005 6.40701C7.81058 5.9844 7.9525 5.39388 7.84923 4.74317M11.1288 9.3235L8.77556 9.3235C8.57407 9.3235 8.40236 9.17714 8.37068 8.97755L8.2674 8.31987L8.10267 8.5581C7.59325 9.29752 6.4572 9.54526 5.32304 9.54526C2.72336 9.54526 0.502575 7.57475 0.0704562 4.8116C-0.154474 3.43287 0.164863 2.11561 0.946732 1.19625C1.66461 0.351651 2.68915 0 3.9101 0C6.00607 0 7.1681 1.34578 7.1681 1.34578L7.06292 0.691897C7.02364 0.443524 7.21562 0.218594 7.4678 0.218594L9.58657 0.218594C9.92301 0.218594 10.2088 0.462532 10.2614 0.794541L11.5336 8.8502C11.5729 9.09857 11.3803 9.3235 11.1288 9.3235" transform="translate(64.5239 24.48339)" id="Shape" fill="#FFFFFF" stroke="none" /><path d="M7.84923 4.74317C7.62176 3.39866 6.55477 2.49577 5.19315 2.49577C4.51076 2.49577 3.96396 2.71563 3.61294 3.13128C3.26509 3.54312 3.13394 4.13047 3.24418 4.78372C3.45581 6.11682 4.54054 7.04822 5.88125 7.04822C6.5497 7.04822 7.09207 6.82646 7.45005 6.40701C7.81058 5.9844 7.9525 5.39388 7.84923 4.74317M11.1288 9.3235L8.77556 9.3235C8.57407 9.3235 8.40236 9.17714 8.37068 8.97755L8.2674 8.31987L8.1033 8.5581C7.59325 9.29752 6.4572 9.54526 5.32304 9.54526C2.72336 9.54526 0.502575 7.57475 0.0704562 4.8116C-0.154474 3.43287 0.164863 2.11561 0.946732 1.19625C1.66461 0.351651 2.68915 0 3.9101 0C6.00607 0 7.1681 1.34578 7.1681 1.34578L7.06292 0.691897C7.02364 0.443524 7.21562 0.218594 7.4678 0.218594L9.58657 0.218594C9.92301 0.218594 10.2088 0.462532 10.2614 0.794541L11.5336 8.8502C11.5729 9.09857 11.3803 9.3235 11.1288 9.3235" transform="translate(29.473 24.48339)" id="Shape" fill="#FFFFFF" stroke="none" /><path d="M8.14821 9.04851C7.87956 7.28456 6.53252 7.28456 5.22919 7.28456L4.48787 7.28456L5.00806 10.578C5.03911 10.777 5.21081 10.9234 5.4123 10.9234L5.75255 10.9234C6.63959 10.9234 7.47722 10.9234 7.90934 10.4184C8.16785 10.1161 8.24578 9.66755 8.14821 9.04851M7.58113 13.651L2.66689 13.651C2.33045 13.651 2.04469 13.4065 1.9921 13.0744L0.00511512 0.473303C-0.0341684 0.22493 0.157814 0 0.409355 0L2.75623 0C3.09204 0 3.37779 0.244572 3.43038 0.575947L3.96705 3.97587C4.019 4.30788 4.30539 4.55245 4.6412 4.55245L6.19607 4.55245C9.43316 4.55245 11.3017 6.11872 11.7895 9.22402C12.0094 10.5812 11.7984 11.6482 11.1629 12.3952C10.464 13.2164 9.22534 13.651 7.58113 13.651" transform="translate(18.33221 24.70186)" id="Shape" fill="#FFFFFF" stroke="none" /><path d="M8.1482 9.04851C7.87955 7.28456 6.5325 7.28456 5.22918 7.28456L4.48786 7.28456L5.00805 10.578C5.03909 10.777 5.2108 10.9234 5.41229 10.9234L5.75253 10.9234C6.63958 10.9234 7.47721 10.9234 7.90933 10.4184C8.16784 10.1161 8.24577 9.66755 8.1482 9.04851M7.58112 13.651L2.66688 13.651C2.33043 13.651 2.04468 13.4065 1.99209 13.0744L0.00510179 0.473303C-0.0341817 0.22493 0.158434 0 0.409342 0L2.93109 0C3.16616 0 3.36638 0.171073 3.40313 0.402973L3.96703 3.97587C4.01899 4.30788 4.30538 4.55245 4.64119 4.55245L6.19606 4.55245C9.43315 4.55245 11.3016 6.11872 11.7895 9.22402C12.0094 10.5812 11.7984 11.6482 11.1629 12.3952C10.464 13.2164 9.22532 13.651 7.58112 13.651" transform="translate(53.38307 24.70186)" id="Shape" fill="#FFFFFF" stroke="none" /></g></svg>'
}

class Helper {
    static findLowestPrice(arr) {
        let lowestPrice = arr.find(elem => elem.tabId == 1)
        return lowestPrice;
    }
}