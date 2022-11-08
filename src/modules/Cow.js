import Animals from './Animals.js'

export default class Cow extends Animals {

    #elProductsReady

    constructor ({ priceProduct, indicator, model, getPermittedCells, moveDweller, refillAdd }) {
        super({
            priceProduct,
            indicator,
            model,
            getPermittedCells,
            moveDweller,
            refillAdd
        })

        this.#elProductsReady = document.querySelector('div #milk_cnt')
    }

    actionProductReady() {
        super.actionProductReady(this.#elProductsReady)
    }

}