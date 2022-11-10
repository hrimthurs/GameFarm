import Animals from './Animals.js'

export default class Chicken extends Animals {

    #elProductsReady

    constructor ({ priceProduct, indicator, model, getPermittedTiles, moveDweller, refillAdd }) {
        super({
            priceProduct,
            indicator,
            model,
            getPermittedTiles,
            moveDweller,
            refillAdd
        })

        this.#elProductsReady = document.querySelector('div #egg_cnt')
    }

    actionProductReady() {
        super.actionProductReady(this.#elProductsReady)
    }

}