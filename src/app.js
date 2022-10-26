import config from './app-cfg.js'

import Engine from './Engine/Engine.js'
import SceneObjects from './Engine/systems/SceneObjects.js'

import World from './modules/World.js'
import { Corn, Chicken, Cow } from './modules/Entities.js'

export default class Application {

    constructor () {
        const title = `${config.name} v${config.version}`
        console.log(title)

        this.engine = new Engine({
            config: config.engine,
            frame: () => this.world.update()
        })

        document.querySelector('div #milk_icon').addEventListener('click', () => {
            this.#sellProduct('div #milk_cnt', 'div #money_cnt', config.dwellers.Cow.options.sellPrice)
        })

        document.querySelector('div #egg_icon').addEventListener('click', () => {
            this.#sellProduct('div #egg_cnt', 'div #money_cnt', config.dwellers.Chicken.options.sellPrice)
        })
    }

    async run() {
        await this.engine.loadAssets(self.location.href + 'assets/', config.assets, false)
        this.#createWorld()
        this.engine.start()
    }

    #createWorld() {
        const dwellerClasses = { Corn, Chicken, Cow }

        this.world = new World(config.world)
        this.world.travelCells((cell, coord) => this.#createGround(cell, coord))

        for (const typeDweller in config.dwellers) {
            const recDweller = config.dwellers[typeDweller]

            this.#createDweller({
                dwellerClass: dwellerClasses[typeDweller],
                amount: recDweller.amount,
                modelProto: recDweller.model,
                options: recDweller.options
            })
        }
    }

    #createGround(cell, coord) {
        const rotateFactor = [0, 1/2, 1, 3/2]

        const model = SceneObjects.instance({
            protoObj: this.engine.graphics.scene.getObjectByName('protoEmpty'),
            position: this.#calcWorldCellPivot(coord),
            rotation: { z: Math.PI * rotateFactor[Math.floor(Math.random() * 4)] },
            selectable: false,
            shadow: { cast: false, receive: true }
        })

        this.engine.graphics.scene.add(model)
        cell.ground = { model }
    }

    #createDweller({ dwellerClass, amount, modelProto, options }) {
        for (let cnt = 0; cnt < amount; cnt++) {

            let coord = this.world.getRandomEmptyPlace()
            if (coord) {

                const model = SceneObjects.instance({
                    protoObj: this.engine.graphics.scene.getObjectByName(modelProto.nameProto),
                    position: this.#calcWorldCellPivot(coord),
                    rotation: { z: Math.PI * Math.random() },
                    shadow: { cast: true, receive: false },
                    userData: {
                        calcWorldCellPivot: coord => this.#calcWorldCellPivot(coord),
                        calcWorldCellInds: coord => this.#calcWorldCellInds(coord),
                        getCellsModels: cells => this.#getCellsModels(cells)
                    }
                })

                this.engine.graphics.scene.add(model)
                if (modelProto.animation) this.engine.runAnimation(model, modelProto.animation)

                const indicator = this.engine.createIndicator({
                    ...config.indicator,
                    position: { z: config.indicator.top },
                    parent: model
                })

                const dweller = new dwellerClass({
                    ...options,
                    indicator, model,

                    getPermittedCells: (...args) => this.world.getEmptyPlaces(...args),
                    moveDweller: (...args) => this.world.moveDweller(...args),
                    getDweller: (...args) => this.world.getDweller(...args)
                })

                this.world.setDweller(coord, dweller)
            }
        }
    }

    #calcWorldCellPivot(coord) {
        const sizeField = config.world.sizeField
        const halfSizeField = sizeField / 2

        return {
            x: (-config.world.size.x * halfSizeField) + halfSizeField + (coord.x * sizeField),
            y: (-config.world.size.y * halfSizeField) + halfSizeField + (coord.y * sizeField)
        }
    }

    #calcWorldCellInds(coord) {
        const sizeField = config.world.sizeField
        const halfSizeField = sizeField / 2

        return {
            x: Math.trunc((coord.x + (config.world.size.x * halfSizeField)) / sizeField),
            y: Math.trunc((coord.y + (config.world.size.y * halfSizeField)) / sizeField)
        }
    }

    #getCellsModels(cells) {
        return cells
            .map(coord => this.world.getCellModels(coord))
            .flat()
            .filter(rec => rec)
    }

    #sellProduct(selectorSrc, selectorDst, sellPrice) {
        const elSrc = document.querySelector(selectorSrc)

        let total = this.#getElementCntAttr(elSrc)
        if (total > 0) {
            const elDst = document.querySelector(selectorDst)
            this.#setElementCntAttr(elDst, this.#getElementCntAttr(elDst) + sellPrice)
            this.#setElementCntAttr(elSrc, total - 1)
        }
    }

    #getElementCntAttr(element) {
        return Number.parseInt(element.getAttribute('cnt')) || 0
    }

    #setElementCntAttr(element, val) {
        element.setAttribute('cnt', val.toString())
        element.innerHTML = 'x' + val
    }

}