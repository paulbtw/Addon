class MYTEMS {
    static async init() {
        console.log(window.location.host)
        console.log(window.location.pathname)

        await Localization;

        const allCached = CacheStorage.keys()
        if (allCached.length)
            for (let value of allCached) {
                const isExpired = CacheStorage.get(value, 600, null); // Clear all values older than 1 hour
                if (!isExpired) {
                    CacheStorage.remove(value)
                }
            }

        const pageHost = window.location.host
            /*
            Steam
            G2A
            MMOGA
            KINGUIN
            HRKGAME
            */
        switch (pageHost) {
            case 'store.steampowered.com':
                Steam.initSteam();
                break;
            case 'www.g2a.com':
                G2a.init();
                break;
            case 'www.mmoga.com':
            case 'www.mmoga.de':
            case 'www.mmoga.co.uk':
            case 'www.mmoga.fr':
            case 'www.mmoga.es':
            case 'www.mmoga.se':
                Mmoga.init();
                break;
            case 'www.kinguin.net':
                document.addEventListener("DOMContentLoaded", function(event) {
                    Kinguin.init();
                });
                break;
            case 'www.hrkgame.com':
                Hrkgame.init();
                break;
            default:
                return;
        }
    }

    static async showPopover(values) {
        if (!document.querySelector('.mytems_popover__wrapper')) {
            HTML.beforeEnd('body', `
            <div>
                <div class="mytems_popover__wrapper">
                    <div class="mytems_popover__header">
                        <a class="header__logo" href="#" target="_blank">MYTEMS24</a>
                        <div class="header__title"><a href=${values.game.url} target="_blank">${values.game.name}</a></div>
                        <div class="header__close">    
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" enable-background="new 0 0 30 30">
                            <line stroke="#E2B842" id="svg_1" stroke-miterlimit="10" stroke-linecap="round" stroke-width="4.5" y2="25" x2="25" y1="5" x1="5"/>
                            <line id="svg_2" stroke-miterlimit="10" stroke-linecap="round" stroke-width="4.5" stroke="#E2B842" y2="25" x2="5" y1="5" x1="25"/>   
                            </svg>
                      </div>
                    </div>
                    <div class="mytems_filter_wrapper"> 
                        <div class="filter__title">
                            <span>Platform:</span>
                        </div>
                        <div class="mytems_filter">
                            <select name="platform" id="platformFilter" class="filter__platform">
                                <option value="0">All</option>
                                <option selected="selected" value="1">PC</option>
                                <option value="2">Xbox</option>
                                <option value="3">PS</option>
                            </select>
                        </div>
                    </div>
                    <div class="mytems_table__box">
                        <div class="mytems_table">
                            <div class="table__table-head">
                                <div class="table__cell header_cell">Shop</div>
                                <div class="table__cell header_cell">Edition</div>
                                <div class="table__cell header_cell">Region</div>
                                <div class="table__cell header_cell">Platform</div>
                                <div class="table__cell header_cell">Price</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `)

            if (!values.game.offers) {
                return;
            }
            for (let offer of values.game.offers) {
                let disabled = ''
                if (offer.stock == "Out of Stock") {
                    disabled = 'disabled'
                }
                let name = offer.name
                if (!name.includes(offer.edition)) {
                    name += ' ' + offer.edition
                }
                let edition = 'Standard Edition'
                if (offer.edition != '') {
                    edition = offer.edition;
                }

                const feeJson = PaymentFeeCalc.calcFees(offer.price, offer.storeId)

                HTML.beforeEnd('.mytems_table', `
                <div class="table__table-row ${disabled}" data-tab=${offer.tabId} data-url=${offer.url}>
                    
                    <div class="table__cell">${offer.storeName}</div>
                    <div class="table__cell">${edition}</div>
                    <div class="table__cell">${offer.region}</div>
                    <div class="table__cell">${offer.platform}</div>
                    <div class="table__cell price__cell">
                        <div class="price__cell">
                            <div class="price__text">
                                ${offer.price.toFixed(2)} €
                            </div>
                            <div class="fee">
                                <div class="fee-row">
                                    <div class="fee__label">${PaymentIcons.paypal}</div>
                                    <div class="fee__value"> + ${parseFloat(feeJson.paypal).toFixed(2)} €</div>
                                </div>
                                <div class="fee-row">
                                    <div class="fee__label">${PaymentIcons.creditCard}</div>
                                    <div class="fee__value"> + ${parseFloat(feeJson.creditcard).toFixed(2)} €</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `)
            }



            MYTEMS.onChange();
            const offerRows = document.querySelectorAll('.table__table-row')
            for (var i = 0; i < offerRows.length; i++) {
                offerRows[i].addEventListener('click', MYTEMS.onClick)
            }
            document.querySelector('#platformFilter').addEventListener("change", MYTEMS.onChange)
            document.querySelector('.header__close').addEventListener("click", MYTEMS.onClose)
        }
    }

    static onClose() {
        var popover = document.querySelector('.mytems_popover__wrapper')
        if (popover) {
            popover.parentNode.removeChild(popover);
        }
        return;
    }

    static onClick() {
        var win = window.open(this.dataset.url, '_blank');
        win.focus();
    }

    static onChange() {
        var input, filter, table, i;
        input = document.querySelector("#platformFilter");
        table = document.querySelectorAll(".table__table-row");
        filter = input.value;

        for (i = 0; i < table.length; i++) {
            if (table[i]) {
                if (filter > 0) {
                    if (table[i].dataset.tab == filter) {
                        table[i].style.display = "table-row";
                    } else {
                        table[i].style.display = "none";
                    }
                } else {
                    table[i].style.display = "table-row";
                }
            }
        }
    }
}


MYTEMS.init();