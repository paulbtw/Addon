class G2a {
    static isStorePage() {
        if (document.querySelector('.product-page-wrapper')) {
            return true
        }
        return false;
    }
    static async init() {
        if (!SyncedStorage.get("g2a")) { return; }
        if (!this.isStorePage()) {
            console.log('no store page')
            return;
        }

        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/[\/(.*?)\/^\/]/, "");

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
        <div class="product-page-v2-price payments__price product-page-v2-price--large">
            <span class="product-page-v2-price__label">Price</span>
            <div class="product-page-v2-price__flex">
                <div class="product-page-v2-price__prices-wrapper">
                    <div class="product-page-v2-price__price">${lowestPriceObj.price} 
                        <sup class="product-page-v2-price__price-currency">EUR</sup>
                    </div>
                    <span class="product-page-v2-price__price-currency"></span>
                    <span class="product-page-v2-price__discount"></span>
                </div>
            </div>
        </div>
        <div class="btn payments__buy-now buy-now btn-success  btn-block spacer" id="mytems_popup">
            <div class="btn-label">
                <span>${Localization.str.compare}</span>
            </div>
        </div>
        `
        node = node.replace('__gameOffers__', value.offers.length)
        HTML.afterBegin('.product-info__payments', node)

        document.querySelector('#mytems_popup').addEventListener("click", G2a.onClick)
    }

    static async onClick() {
        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/[\/(.*?)\/^\/]/, "");
        let values = CacheStorage.get(curUrl, 3600, null) || await MYTEMSAPI.getPricesByPath(curUrl);
        if (!values) {
            return;
        }

        return MYTEMS.showPopover(values);
    }
}