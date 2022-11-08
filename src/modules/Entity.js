import { Color, RingGeometry } from 'three'

export default class Entity {

    resource
    indicator
    model

    #priceProduct
    #limProduct

    #getPermittedCells
    #moveDweller

    #tmrPrev
    #faceIndicator

    products = {
        ready: 0,
        progress: 0
    }

    constructor ({ priceProduct, limProduct, indicator, model, getPermittedCells, moveDweller, resource }) {
        this.#priceProduct = priceProduct
        this.#limProduct = limProduct

        this.#getPermittedCells = getPermittedCells
        this.#moveDweller = moveDweller

        this.indicator = indicator
        this.model = model
        this.resource = resource

        this.model.userData.getPermittedCells = () => this.getPermittedCells()
        this.model.userData.moveDweller = (srcCell, dstCell) => this.moveDweller(srcCell, dstCell)

        this.#faceIndicator = this.indicator.getObjectByName('face_indicator')
        this.indicator.userData.options.color = this.#faceIndicator.material.color
    }

    update() {
        const products = this.products
        if (products.ready < this.#limProduct) {

            if (this.resource > 0) {
                const now = Date.now()

                if (this.#tmrPrev) {
                    const delta = (now - this.#tmrPrev) / 1000

                    this.resource -= delta
                    if (this.resource < 0) this.resource = 0

                    products.progress += (delta / this.#priceProduct)
                    if (products.progress >= 1) this.actionProductReady()
                    else this.actionProductMake()
                }

                this.#tmrPrev = now
            } else {
                if (products.progress > 0.95) this.actionProductReady()
                else if (products.progress > 0.05) this.actionProductPause()
                else this.indicator.visible = false

                this.#tmrPrev = null
            }

        } else this.#tmrPrev = null
    }

    getPermittedCells(permitClassNames = []) {
        return this.#getPermittedCells(permitClassNames)
    }

    moveDweller(srcCell, dstCell) {
        this.#moveDweller(srcCell, dstCell)
    }

    actionProductPause() {
        this.#faceIndicator.material.color = new Color('#333')
        this.#faceIndicator.material.needsUpdate = true
    }

    actionProductMake() {
        const options = this.indicator.userData.options
        const length = 2 * Math.PI * this.products.progress

        this.#faceIndicator.geometry = new RingGeometry(options.innerRadius, options.outerRadius, options.segments, null, null, length)
        this.#faceIndicator.material.color = options.color
        this.#faceIndicator.needsUpdate = true

        this.indicator.visible = true
    }

    actionProductReady() {
        this.products.ready++
        this.products.progress = 0
        this.indicator.visible = false
    }

}
