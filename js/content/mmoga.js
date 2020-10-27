class Mmoga {
    static isStorePage() {
        if (document.querySelector('.produktdetail')) {
            return true
        }
        return false;
    }

    static isCheckoutPage() {
        if (window.location.pathname == '/checkout_payment.php') {
            return true;
        }
        return false;
    }

    static async init() {
        if (!SyncedStorage.get("mmoga")) { return; }
        if (!this.isStorePage()) {
            console.log('no store page')
            return;
        }
        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/^\/(.*?)\//, "");
        let isCached = CacheStorage.get(curUrl, 600, null) || await MYTEMSAPI.getPricesByPath(curUrl);

        if (!isCached) {
            return;
        }
        console.log(isCached)
        this.showStorpageInfo(isCached.game);
    }

    static async showStorpageInfo(value) {
        if (!value) {
            return;
        }

        let node = `
        <div class="commKF mmoga_btn" id="mytems_popup">
            ${Localization.str.compare}
        </div>
        `
        node = node.replace('__gameOffers__', value.offers.length)
        HTML.afterBegin('.proPay', node)

        document.querySelector('#mytems_popup').addEventListener("click", Mmoga.onClick)
    }

    static async onClick() {
        let curUrl = window.location.pathname;
        curUrl = curUrl.replace(/^\/(.*?)\//, "");
        let values = CacheStorage.get(curUrl, 3600, null) || await MYTEMSAPI.getPricesByPath(curUrl);
        if (!values) {
            return;
        }

        return MYTEMS.showPopover(values);
    }
}