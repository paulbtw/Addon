class Steam {
    static isAppPage() {
        return /^\/app\/\d+/.test(window.location.pathname);
    }

    static async initSteam() {
        if (!SyncedStorage.get("steam")) { return; }

        if (!this.isAppPage()) { return; }
        this.addDRMWarnings();
        this.removeAwards();


        let curAppip = GameId.getAppidfromStorepage();
        let isCached = CacheStorage.get(curAppip, 600, null) || await MYTEMSAPI.getPrices(curAppip);

        if (!isCached) {
            return;
        }

        this.showStorepageInfo(isCached.game);
        this.addAdditionalInfo(isCached.spy, isCached.hltb, isCached.sc);
    }


    static addAdditionalInfo(spyData, hltb, steamCharts) {
        let node = document.querySelector('.purchase_area_spacer');

        let steamSpyOption = false;
        let steamChartOption = false;
        let hltbOption = false;

        let element = '<div class="additional-info">'

        if (SyncedStorage.get("showSteamspy")) {
            steamSpyOption = true;
            element += `
                <div class="additional__cell steamspy" id="steamspy-data">
                    Game Owners
                </div>
                `
        }

        if (SyncedStorage.get("showHltb")) {
            hltbOption = true;
            element += `
            <div class="additional__cell hltb" id="hltb-data">
                How long to beat?
            </div>
            `
        }

        if (SyncedStorage.get("showSteamCharts")) {
            steamChartOption = true;
            element += `
            <div class="additional__cell steamchart" id="steamchart-data">
                Currently Active Players
            </div>
            `
        }

        element += '</div>'
        HTML.afterEnd(node, element)

        if (steamSpyOption) {
            this.showSteamSpyInfo(spyData);
        }

        if (hltbOption) {
            this.showHltbInfo(hltb);
        }

        if (steamChartOption) {
            this.showSteamcharts(steamCharts);
        }
    }

    static showSteamSpyInfo(spyData) {
        let contentString = '<div class="mytems__popup-hover info__steamspy">'
        if (!spyData || !spyData.owners) {
            contentString += '<span>No data found :(.</span>'
        } else {
            function getTimeConvert(time) {
                let day = Math.trunc(time / 1440);
                time -= day * 1440;

                let hour = Math.trunc(time / 60);
                time -= hour * 60;

                let minute = time;

                let timeString = "";
                if (day > 0) { timeString += day + 'd '; }
                timeString += hour + 'h ' + minute + 'm';
                return timeString;
            }

            contentString += `
                <span>Owners: ${spyData.owners.replace('..', '-')}</span>
                <span>Playtime (2 Weeks): ${getTimeConvert(spyData.average_2weeks)}</span>
                <span>Playtime (Forever): ${getTimeConvert(spyData.average_forever)}</span>`
        }
        contentString += '</div>'
        tippy('#steamspy-data', {
            content: contentString,
            arrow: true,
        })
    }

    static showHltbInfo(hltb) {
        let contentString = '<div class="mytems__popup-hover info__hltb">'
        if (!hltb) {
            contentString += '<span>No data found :(.</span>'
        } else {
            function getTimeConvert(time) {
                let day = Math.trunc(time / 24);
                time -= day * 24;

                let hour = Math.trunc(time / 1);
                time -= hour * 1;

                let minute = time * 60;

                let timeString = "";
                if (day > 0) { timeString += day + 'd '; }
                timeString += hour + 'h ' + minute + 'm';
                return timeString;
            }
            contentString += `
            <span>Main Story: ${getTimeConvert(hltb.gameplayMain)}</span>
            <span>Main + Extra: ${getTimeConvert(hltb.gameplayMain + hltb.gameplayMainExtra)}</span>
            <span>Completionist: ${getTimeConvert(hltb.gameplayCompletionist)}</span>`
        }
        contentString += '</div>'

        tippy('#hltb-data', {
            content: contentString,
            arrow: true,
        })
    }

    static showSteamcharts(steamChartdata) {
        let contentString = '<div class="mytems__popup-hover info__hltb">'
        if (!steamChartdata) {
            contentString += '<span>No data found :(.</span>'
        } else {

            function numberWithCommas(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            contentString += `                
            <span>Current: ${numberWithCommas(steamChartdata.curPlayers)}</span>
            <span>Peak (today): ${numberWithCommas(steamChartdata.todayPeak)}</span>
            <span>Peak (all): ${numberWithCommas(steamChartdata.allPeak)}</span>`
        }
        contentString += '</div>'

        tippy('#steamchart-data', {
            content: contentString,
            arrow: true
        })

    }

    static removeAwards() {
        if (!SyncedStorage.get("removeAwards")) {
            return;
        }
        if (document.querySelector(".steamawards2019_app_banner_ctn")) {
            document.querySelector(".steamawards2019_app_banner_ctn").remove();
        }
        return;
    }


    static showStorepageInfo(value) {
        if (!value) {
            return ErrorHandler.storepageGameNotFound()
        }
        let lowestPriceObj = Helper.findLowestPrice(value.offers)
        let node =
            `
        <div class="game_area_purchase_game_wrapper" id="mytems_compare">
            <div class="game_area_purchase_game">
                <h1>${Localization.str.buy} ${value.name}</h1>
                <div class="game_purchase_action">
                    <div class="game_purchase_action_bg">
                        <div class="game_purchase_price price" id="tooltiptest">${(lowestPriceObj) ? lowestPriceObj.price + ' €' : 'None'}</div>
                        <div class="btn_addtocart" id="mytems_popup">
                            <div class="btnv6_green_white_innerfade btn_medium"><span>${Localization.str.compare}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `

        node = node.replace("__gameOffers__", value.offers.length)

        let drmWarningNode = document.querySelector('#mytems_warning');
        if (drmWarningNode) {
            HTML.afterEnd(drmWarningNode, node);
        } else {
            HTML.afterBegin('#game_area_purchase', node);
        }

        document.querySelector('#mytems_popup').addEventListener("click", Steam.onClick)
    }

    static async onClick() {
        const appid = GameId.getAppidfromStorepage()
        let values = CacheStorage.get(appid, 3600, null)
        if (!values) {
            if (appid) {
                values = await MYTEMSAPI.getPrices(appid);
            }
        }

        return MYTEMS.showPopover(values);
    }

    static addDRMWarnings() {
        if (!SyncedStorage.get("showDRMWarning")) { return; }

        let text = "";
        for (let node of document.querySelectorAll(".game_area_sys_req, #game_area_legal, .game_details, .DRM_notice")) {
            text += node.textContent.toLowerCase();
        }

        // Games for Windows Live detection
        let gfwl =
            text.includes("games for windows live") ||
            text.includes("games for windows - live") ||
            text.includes("online play requires log-in to games for windows") ||
            text.includes("installation of the games for windows live software") ||
            text.includes("multiplayer play and other live features included at no charge") ||
            text.includes("www.gamesforwindows.com/live");

        // Ubisoft Uplay detection
        let uplay =
            text.includes("uplay") ||
            text.includes("ubisoft account");

        // Securom detection
        let securom = text.includes("securom");

        // Tages detection
        let tages =
            text.match(/\b(tages|solidshield)\b/) &&
            !text.match(/angebote des tages/);

        // Stardock account detection
        let stardock = text.includes("stardock account");

        // Rockstar social club detection
        let rockstar =
            text.includes("rockstar social club") ||
            text.includes("rockstar games social club");

        // Kalypso Launcher detection
        let kalypso = text.includes("requires a kalypso account");

        // Denuvo Antitamper detection
        let denuvo = text.includes("denuvo");

        // EA origin detection
        let origin = text.includes("origin client");

        // Microsoft Xbox Live account detection
        let xbox = text.includes("xbox live");

        let drmNames = [];
        if (gfwl) { drmNames.push("Windows Live Store"); }
        if (uplay) { drmNames.push("Uplay"); }
        if (securom) { drmNames.push("SecuROM"); }
        if (tages) { drmNames.push("Tages"); }
        if (stardock) { drmNames.push("Stardock Account Required"); }
        if (rockstar) { drmNames.push("Rockstar Games Social Club"); }
        if (kalypso) { drmNames.push("Kalypso Launcher"); }
        if (denuvo) { drmNames.push("Denuvo Anti-tamper"); }
        if (origin) { drmNames.push("Origin"); }
        if (xbox) { drmNames.push("Microsoft Xbox Live"); }

        let drmString;
        let regex = /\b(drm|account|steam)\b/i;

        if (drmNames.length > 0) {
            drmString = `(${drmNames.join(", ")})`;
        } else {
            for (let node of document.querySelectorAll("#category_block > .DRM_notice")) {
                let text = node.textContent;
                if (text.match(regex)) {
                    drmString = text;
                    break;
                }
            }
        }
        if (drmString) {
            let warnString;
            if (drmNames.length > 0) {
                warnString = Localization.str.drm_warning;
                warnString = warnString.replace("__drm__", drmString);
            } else {
                warnString = drmString;
            }
            warnString = warnString.replace(/[()]/g, "");
            let node = document.querySelector('#mytems_compare');
            if (node) {
                HTML.beforeBegin(node, `<div class="DRM_notice_warning" id="mytems_warning"><span>${warnString}</span></div>`)
            } else {
                HTML.afterBegin('#game_area_purchase', `<div class="DRM_notice_warning" id="mytems_warning"><span>${warnString}</span></div>`)
            }
        }
    }
}