import Entity from './Entity.js'

export default class Animals extends Entity {

    #refillAdd

    constructor ({ priceProduct, indicator, model, getPermittedCells, moveDweller, refillAdd }) {
        super({
            priceProduct,
            indicator,
            model,
            getPermittedCells,
            moveDweller,
            limProduct: Infinity,
            resource: 0
        })

        this.#refillAdd = refillAdd
    }

    refill() {
        this.resource += this.#refillAdd
    }

    actionProductReady(elPage) {
        super.actionProductReady()

        let total = Number.parseInt(elPage.getAttribute('cnt')) + 1
        elPage.setAttribute('cnt', total.toString())
        elPage.innerHTML = 'x' + total
    }

}