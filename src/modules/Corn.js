import Entity from './Entity.js'
import Chicken from './Chicken.js'
import Cow from './Cow.js'

export default class Corn extends Entity {

    #foodFor = [Chicken, Cow].map(v => v.name)
    #getDweller

    constructor ({ priceProduct, indicator, model, getPermittedCells, moveDweller, getDweller }) {
        super({
            priceProduct,
            indicator,
            model,
            getPermittedCells,
            moveDweller,
            limProduct: 1,
            resource: Infinity
        })

        this.#getDweller = getDweller
    }

    getPermittedCells() {
        return super.getPermittedCells(this.#foodFor)
    }

    moveDweller(srcCell, dstCell) {
        const dstDweller = this.#getDweller(dstCell)

        if (this.#foodFor.includes(dstDweller?.constructor.name)) {

            this.products.ready--
            dstDweller.refill()
            return true

        } else super.moveDweller(srcCell, dstCell)
    }

    actionProductMake() {
        super.actionProductMake()

        const setScale = 0.3 + (this.products.progress * 0.7)

        this.#traverseBufGeomMeshes(this.model, mesh => {
            mesh.scale.set(setScale, setScale, setScale)
            mesh.userData.selectable = false
        })
    }

    actionProductReady() {
        super.actionProductReady()
        this.#traverseBufGeomMeshes(this.model, mesh => mesh.userData.selectable = true)
    }

    #traverseBufGeomMeshes(parent, cbAction) {
        parent.traverse(obj => {
            if ((obj.type === 'Mesh') && (obj.geometry.type === 'BufferGeometry')) cbAction(obj)
        })
    }

}