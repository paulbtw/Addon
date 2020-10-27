class Hrkgame {
    static isStorePage() {
        if (document.querySelector('.product_container')) {
            return true
        }
        return false;
    }
    static async init() {
        if (!SyncedStorage.get("hrkgame")) { return; }
        if (!this.isStorePage()) {
            console.log('no store page')
            return;
        }

        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/^\/(.*?)\/games\/product\//, "");

        let isCached = CacheStorage.get(curUrl, 600, null) || await MYTEMSAPI.getPricesByPath(curUrl);
        if (!isCached) {
            return;
        }
        this.showStorpageInfo(isCached.game);
    }

    static showStorpageInfo(value) {
        if (!value) {
            return;
        }
        let lowestPriceObj = Helper.findLowestPrice(value.offers)
        let node = `
        <div class="bw_button_block" id="mytems_popup">
            <div class="ui labeled icon green fluid button">
                <i class="cart arrow down icon"></i>
                <span>${Localization.str.compare}</span>
            </div>
        </div>
        `
        node = node.replace('__gameOffers__', value.offers.length)
        HTML.beforeEnd('.bw_button_wrapper', node)

        document.querySelector('#mytems_popup').addEventListener("click", Hrkgame.onClick)
    }

    static async onClick() {
        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/^\/(.*?)\/games\/product\//, "");
        let values = CacheStorage.get(curUrl, 3600, null) || await MYTEMSAPI.getPricesByPath(curUrl);
        if (!values) {
            return;
        }

        return MYTEMS.showPopover(values);
    }
}