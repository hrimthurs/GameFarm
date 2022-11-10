import config from './app-cfg.js'

import Engine from './Engine/Engine.js'
import SceneObjects from './Engine/systems/SceneObjects.js'

import World from './modules/World.js'
import Corn from './modules/Corn.js'
import Chicken from './modules/Chicken.js'
import Cow from './modules/Cow.js'

export default class Application {

    constructor () {
        const title = `${config.name} v${config.version}`
        console.log(title)

        this.engine = new Engine({
            config: config.engine,
            frame: () => this.world.update()
        })

        document.querySelector('img#milk_icon').addEventListener('click', () => {
            this.#sellProduct('div#milk_cnt', 'div#money_cnt', config.dwellers.Cow.options.sellPrice)
        })

        document.querySelector('img#egg_icon').addEventListener('click', () => {
            this.#sellProduct('div#egg_cnt', 'div#money_cnt', config.dwellers.Chicken.options.sellPrice)
        })
    }

    async run() {
        await this.engine.loadAssets(self.location.href, config.assets, false)
        this.#createWorld()

        const elBtnPlay = document.querySelector('div#button-play')
        elBtnPlay.classList.add('button-play-mode')
        elBtnPlay['innerText'] = 'PLAY'

        elBtnPlay.addEventListener('click', () => {
            const elRender = document.querySelector('div#wrapper_render')
            elRender['style'].display = 'flex'

            const elSplash = document.querySelector('div#splash-screen')
            elSplash['style'].display = 'none'

            this.engine.start()
        })
    }

    #createWorld() {
        const dwellerClasses = { Corn, Chicken, Cow }

        this.world = new World(config.world)
        this.world.travelTiles((tile, coord) => this.#createGround(tile, coord))

        for (const typeDweller in config.dwellers) {
            const recDweller = config.dwellers[typeDweller]

            this.#createDweller({
                dwellerClass: dwellerClasses[typeDweller],
                amount: recDweller.amount,
                asset: recDweller.asset,
                options: recDweller.options
            })
        }
    }

    #createGround(tile, coord) {
        const rotateFactor = [0, 1/2, 1, 3/2]

        let model = SceneObjects.instance({
            protoObj: this.engine.graphics.scene.getObjectByName('ground'),
            position: this.world.calcTilePivot(coord),
            rotation: { z: Math.PI * rotateFactor[Math.floor(Math.random() * 4)] },
            selectable: false,
            shadow: { cast: false, receive: true }
        })

        this.engine.graphics.scene.add(model)
        tile.ground = { model }
    }

    #createDweller({ dwellerClass, amount, asset, options }) {
        for (let cnt = 0; cnt < amount; cnt++) {

            let coord = this.world.getRandomEmptyTile()
            if (coord) {

                let model = SceneObjects.instance({
                    protoObj: this.engine.graphics.scene.getObjectByName(asset.name),
                    position: this.world.calcTilePivot(coord),
                    rotation: { z: Math.PI * Math.random() },
                    shadow: { cast: true, receive: false },
                    userData: {
                        calcTilePivot: coord => this.world.calcTilePivot(coord),
                        calcTileInds: coord => this.world.calcTileInds(coord),
                        getTilesModels: tiles => this.#getTilesModels(tiles)
                    }
                })

                this.engine.graphics.scene.add(model)
                if (asset.animation) this.engine.runAnimation(model, asset.animation)

                let indicator = this.engine.createIndicator({
                    ...config.indicator,
                    position: { z: config.indicator.top },
                    parent: model
                })

                let dweller = new dwellerClass({
                    ...options,
                    indicator, model,

                    getPermittedTiles: (...args) => this.world.getEmptyTiles(...args),
                    moveDweller: (...args) => this.world.moveDweller(...args),
                    getDweller: (...args) => this.world.getDweller(...args)
                })

                this.world.setDweller(coord, dweller)
            }
        }
    }

    #getTilesModels(tiles) {
        return tiles
            .map(coord => this.world.getTileModels(coord))
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