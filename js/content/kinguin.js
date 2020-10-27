class Kinguin {
    static isStorePage() {
        return window.location.pathname.includes('/category')
    }

    static isCheckoutPage() {
        if (window.location.pathname.includes('checkout/cart')) {
            console.log('checkout')
            return true;
        }
        return false;
    }

    static async init() {
        if (!SyncedStorage.get("kinguin")) { return; }
        if (this.isCheckoutPage()) {
            //
        }
        if (!this.isStorePage()) {
            console.log('no store page')
            return;
        }

        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/^\/(.*?)\/(.*?)\//, "");

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
            <div class="kinguin_button" id="mytems_popup">
                Lowest: ${lowestPriceObj.price}€</br></br>
               ${Localization.str.compare}
            </div>
        `
        node = node.replace('__gameOffers__', value.offers.length)
        HTML.beforeEnd('#main-offer-wrapper', node)

        document.querySelector('#mytems_popup').addEventListener("click", Kinguin.onClick)
    }

    static async onClick() {
        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/^\/(.*?)\/(.*?)\//, "");

        let values = CacheStorage.get(curUrl, 3600, null) || await MYTEMSAPI.getPricesByPath(curUrl);
        if (!values) {
            return;
        }

        return MYTEMS.showPopover(values);
    }
}