class ExtensionResources {
  static getURL(pathname) {
    return browser.runtime.getURL(pathname);
  }

  static get(pathname) {
    return fetch(ExtensionResources.getURL(pathname));
  }

  static getJSON(pathname) {
    return ExtensionResources.get(pathname).then((r) => r.json());
  }
  static getText(pathname) {
    return ExtensionResources.get(pathname).then((r) => r.text());
  }
}

class PaymentFeeCalc {
  static calcFees(price, storeId) {
    if (!price || !storeId) return { paypal: 0.0, creditcard: 0.0 };
    const paymentFees = this.getPaymentFeeByStoreId(storeId);

    let paypalFee = 0.0;
    let cardFee = 0.0;

    for (let limit in paymentFees["paypal"]) {
      if (price < limit) {
        const percFee = paymentFees["paypal"][limit].a;
        const flatFee = paymentFees["paypal"][limit].b;
        paypalFee = (price * percFee - price + flatFee).toFixed(2);
      }
    }

    for (let limit in paymentFees["card"]) {
      if (price < limit) {
        const percFee = paymentFees["card"][limit].a;
        const flatFee = paymentFees["card"][limit].b;
        cardFee = (price * percFee - price + flatFee).toFixed(2);
      }
    }
    return { paypal: paypalFee, creditcard: cardFee };
  }

  static getPaymentFeeByStoreId(storeId) {
    // New backend is returning the fees in gameOffer.store.fee in this json format
    // TODO:
    // redo this to use backend values insteaf of these static one's

    const infinity = 9999999999;
    let fees = {};
    fees["paypal"] = {};
    fees["card"] = {};

    switch (storeId) {
      case 1:
        // MMOGA
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;
      case 2:
        // Gamivo
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.035;
        fees["paypal"][infinity]["b"] = 0.35;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.035;
        fees["card"][infinity]["b"] = 0.35;
        break;

      case 3:
        // Gameladen
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 4:
        // Gamekey4all
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.029;
        fees["paypal"][infinity]["b"] = 0.35;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.029;
        fees["card"][infinity]["b"] = 0.29;
        break;

      case 5:
        // 2Game
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 6:
        // Buygames
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 7:
        // CDKeys
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 8:
        // CDKeysdeals
        break;

      case 9:
        // CJS CDkeys
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 10:
        // Daxter
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.073;
        fees["card"][infinity]["b"] = 0.3;
        break;

      case 11:
        // DLGamer
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 12:
        // Dreamgame
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 13:
        // Eneba
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.03;
        fees["paypal"][infinity]["b"] = 0.35;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.03;
        fees["card"][infinity]["b"] = 0.35;
        break;

      case 14:
        // G2A
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 15:
        // Gamesplanet
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 16:
        // HRKgame
        fees["paypal"][10] = {};
        fees["paypal"][10]["a"] = 1.085;
        fees["paypal"][10]["b"] = 0.44;
        fees["paypal"][20] = {};
        fees["paypal"][20]["a"] = 1.1;
        fees["paypal"][20]["b"] = 0.3;
        fees["paypal"][30] = {};
        fees["paypal"][30]["a"] = 1.09;
        fees["paypal"][30]["b"] = 0.3;
        fees["paypal"][35] = {};
        fees["paypal"][35]["a"] = 1.08;
        fees["paypal"][35]["b"] = 0.3;
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.07;
        fees["paypal"][infinity]["b"] = 0.3;
        fees["card"][10] = {};
        fees["card"][10]["a"] = 1.085;
        fees["card"][10]["b"] = 0.44;
        fees["card"][20] = {};
        fees["card"][20]["a"] = 1.1;
        fees["card"][20]["b"] = 0.3;
        fees["card"][30] = {};
        fees["card"][30]["a"] = 1.09;
        fees["card"][30]["b"] = 0.3;
        fees["card"][35] = {};
        fees["card"][35]["a"] = 1.08;
        fees["card"][35]["b"] = 0.3;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.07;
        fees["card"][infinity]["b"] = 0.3;
        break;

      case 17:
        // IGVault
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.025;
        fees["card"][infinity]["b"] = 0;
        break;

      case 18:
        // Instantgaming
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.03;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 19:
        // Kinguin
        fees["paypal"][10] = {};
        fees["paypal"][10]["a"] = 1.04;
        fees["paypal"][10]["b"] = 0.35;
        fees["paypal"][20] = {};
        fees["paypal"][20]["a"] = 1.04;
        fees["paypal"][20]["b"] = 0.28;
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.04;
        fees["paypal"][infinity]["b"] = 0.26;
        fees["card"][10] = {};
        fees["card"][10]["a"] = 1.04;
        fees["card"][10]["b"] = 0.33;
        fees["card"][20] = {};
        fees["card"][20]["a"] = 1.04;
        fees["card"][20]["b"] = 0.14;
        fees["card"][30] = {};
        fees["card"][30]["a"] = 1.03;
        fees["card"][30]["b"] = 0.2;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.03;
        fees["card"][infinity]["b"] = 0;
        break;

      case 20:
        // Lizengo
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 21:
        // Voidu
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 22:
        // Epicgames
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 23:
        // psn_de
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 24:
        // psn_es
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 25:
        // psn_fr
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 26:
        // psn_it
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 27:
        // psn_uk
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 28:
        // psn_us
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 29:
        // gamerall
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.039;
        fees["paypal"][infinity]["b"] = 0.29;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.039;
        fees["card"][infinity]["b"] = 0.29;
        break;

      case 30:
        // wingamestore
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 31:
        // gamersgate
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 32:
        // electronicfirst
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.036;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.036;
        fees["card"][infinity]["b"] = 0;
        break;

      case 33:
        // gamesbillet
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 34:
        // gamersoutlet
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 35:
        // reloook - deleted
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 36:
        // gamesload
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 37:
        // gamesrepublic
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 38:
        // gamesrocket
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 39:
        // gamingdragons
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.0527;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.0527;
        fees["card"][infinity]["b"] = 0;
        break;

      case 40:
        // gvgmall
        fees["paypal"][10] = {};
        fees["paypal"][10]["a"] = 1.029;
        fees["paypal"][10]["b"] = 0.35;
        fees["paypal"][20] = {};
        fees["paypal"][20]["a"] = 1.029;
        fees["paypal"][20]["b"] = 0.35;
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.029;
        fees["paypal"][infinity]["b"] = 0.35;
        fees["card"][10] = {};
        fees["card"][10]["a"] = 1.029;
        fees["card"][10]["b"] = 0.35;
        fees["card"][20] = {};
        fees["card"][20]["a"] = 1.029;
        fees["card"][20]["b"] = 0.35;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.029;
        fees["card"][infinity]["b"] = 0.35;
        break;

      case 41:
        // humblestore
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 42:
        // gog
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 43:
        // livecards
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.04;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.04;
        fees["card"][infinity]["b"] = 0;
        break;

      case 44:
        // microsoftstore
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 45:
        // gamesplanetfr
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 46:
        // gamesplanet uk
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 47:
        // mcgame
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 48:
        // gamesdeal
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.03;
        fees["paypal"][infinity]["b"] = 0.35;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.05;
        fees["card"][infinity]["b"] = 0.26;
        break;

      case 49:
        // allyouplay
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 50:
        // indiegala
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 51:
        // scdkey
        fees["paypal"][10] = {};
        fees["paypal"][10]["a"] = 1.03;
        fees["paypal"][10]["b"] = 0.15;
        fees["paypal"][20] = {};
        fees["paypal"][20]["a"] = 1.03;
        fees["paypal"][20]["b"] = 0.33;
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1.03;
        fees["paypal"][infinity]["b"] = 0.32;
        fees["card"][10] = {};
        fees["card"][10]["a"] = 1.123;
        fees["card"][10]["b"] = 0;
        fees["card"][20] = {};
        fees["card"][20]["a"] = 1.046600458365164;
        fees["card"][20]["b"] = 0.31;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1.061883408071749;
        fees["card"][infinity]["b"] = 0;
        break;

      case 100:
        // steam
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 101:
        // nintendo
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 102:
        // origin
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;

      case 103:
        // uplay
        fees["paypal"][infinity] = {};
        fees["paypal"][infinity]["a"] = 1;
        fees["paypal"][infinity]["b"] = 0;
        fees["card"][infinity] = {};
        fees["card"][infinity]["a"] = 1;
        fees["card"][infinity]["b"] = 0;
        break;
    }

    return fees;
  }
}
