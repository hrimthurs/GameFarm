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
    }

    async run(waitPressPlay = true) {
        let assets = await this.engine.loadAssets(self.location.href, config.assets)
        this.#createWorld(assets)

        if (waitPressPlay) {
            const elBtnPlay = document.querySelector('div#button-play')
            elBtnPlay.classList.add('button-play-mode')
            elBtnPlay['innerText'] = 'PLAY'
            elBtnPlay.addEventListener('click', () => this.#startGame())
        } else this.#startGame()
    }

    #startGame() {
        document.querySelector('img#milk_icon').addEventListener('click', () => {
            this.#sellProduct('div#milk_cnt', 'div#money_cnt', config.dwellers.Cow.options.sellPrice)
        })

        document.querySelector('img#egg_icon').addEventListener('click', () => {
            this.#sellProduct('div#egg_cnt', 'div#money_cnt', config.dwellers.Chicken.options.sellPrice)
        })

        const elRender = document.querySelector('div#wrapper_render')
        elRender['style'].display = 'flex'

        const elSplash = document.querySelector('div#splash-screen')
        elSplash['style'].display = 'none'

        this.engine.start()
    }

    #createWorld(assets) {
        const halfSizeTile = config.world.sizeTile / 2
        const halfSizeX = (config.world.sizeWorld.x + 2) * halfSizeTile
        const halfSizeY = (config.world.sizeWorld.y + 2) * halfSizeTile

        SceneObjects.createDirLight({
            type: 'dirLight',
            position: {
                x: halfSizeX + 7,
                y: -halfSizeX - 7,
                z: 50
            },
            shadow: {
                normalBias: 0.07,
                camera: {
                    top: halfSizeY,
                    right: halfSizeX,
                    bottom: -halfSizeY,
                    left: -halfSizeX
                }
            },
            parent: this.engine.graphics.scene
        })

        this.world = new World(config.world)

        this.world.travelTiles((tile, coord) => this.#createGround({
            tile, coord,
            sceneObj: assets.ground
        }))

        this.#createHome({
            coord: { x: 0, y: 0 },
            size: { x: 3, y: 3 },
            sceneObj: assets.home
        })

        this.#createFence({
            sceneObj: assets.fence
        })

        const dwellerClasses = { Corn, Chicken, Cow }

        for (const typeDweller in config.dwellers) {
            const recDweller = config.dwellers[typeDweller]

            this.#createDweller({
                dwellerClass: dwellerClasses[typeDweller],
                amount: recDweller.amount,
                sceneObj: assets[recDweller.asset.name],
                animation: recDweller.asset.animation,
                options: recDweller.options
            })
        }
    }

    #createGround({ tile, coord, sceneObj }) {
        const rotateFactor = [0, 0.5, 1, 1.5]

        let model = SceneObjects.instance({
            sceneObj,
            position: this.world.calcTilePivot(coord),
            rotation: { z: Math.PI * rotateFactor[Math.floor(Math.random() * 4)] },
            selectable: false,
            shadow: { cast: false, receive: true },
            parent: this.engine.graphics.scene
        })

        tile.ground = { model }
    }

    #createHome({ coord, size, sceneObj }) {
        SceneObjects.instance({
            sceneObj,
            position: this.world.calcTilePivot(coord),
            selectable: false,
            shadow: { cast: true, receive: true },
            parent: this.engine.graphics.scene
        })

        this.world.setEnviron({ coord, size })
    }

    #createFence({ sceneObj }) {
        const sizeX = config.world.sizeWorld.x - 1
        const sizeY = config.world.sizeWorld.y - 1

        const rotZ90 = { z: Math.PI * 0.5 }
        const rotZ180 = { z: Math.PI }
        const rotZ270 = { z: Math.PI * 1.5 }

        const hideMid = ['mid_board_1', 'mid_board_2']
        const hideRight = ['right_board_1', 'right_board_2']
        const hideLeft = ['left_board_1', 'left_board_2']

        const base = {
            sceneObj,
            selectable: false,
            shadow: { cast: true, receive: true },
            parent: this.engine.graphics.scene
        }

        for (let y = 1; y < sizeY; y++) {
            SceneObjects.instance({
                ...base,
                position: this.world.calcTilePivot({ x: 0, y }),
                hide: y === 2 ? [...hideMid, ...hideLeft] : hideMid
            })
            this.world.setEnviron({ coord: { x: 0, y } })

            SceneObjects.instance({
                ...base,
                position: this.world.calcTilePivot({ x: sizeX, y }),
                rotation: rotZ180,
                hide: hideMid
            })
            this.world.setEnviron({ coord: { x: sizeX, y } })
        }

        for (let x = 1; x < sizeX; x++) {
            SceneObjects.instance({
                ...base,
                position: this.world.calcTilePivot({ x, y: 0 }),
                rotation: rotZ90,
                hide: x === 2 ? [...hideMid, ...hideRight] : hideMid
            })
            this.world.setEnviron({ coord: { x, y: 0 } })

            SceneObjects.instance({
                ...base,
                position: this.world.calcTilePivot({ x, y: sizeY }),
                rotation: rotZ270,
                hide: ['mid_board_1', 'mid_board_2']
            })
            this.world.setEnviron({ coord: { x, y: sizeY } })
        }

        SceneObjects.instance({
            ...base,
            position: this.world.calcTilePivot({ x: 0, y: sizeY }),
            hide: hideRight
        })
        this.world.setEnviron({ coord: { x: 0, y: sizeY } })

        SceneObjects.instance({
            ...base,
            position: this.world.calcTilePivot({ x: sizeX, y: sizeY }),
            rotation: rotZ270,
            hide: hideRight
        })
        this.world.setEnviron({ coord: { x: sizeX, y: sizeY } })

        SceneObjects.instance({
            ...base,
            position: this.world.calcTilePivot({ x: sizeX, y: 0 }),
            rotation: rotZ180,
            hide: hideRight
        })
        this.world.setEnviron({ coord: { x: sizeX, y: 0 } })
    }

    #createDweller({ dwellerClass, amount, sceneObj, animation = null, options }) {
        for (let cnt = 0; cnt < amount; cnt++) {

            let coord = this.world.getRandomEmptyTile()
            if (coord) {

                let model = SceneObjects.instance({
                    sceneObj,
                    position: this.world.calcTilePivot(coord),
                    rotation: { z: Math.PI * Math.random() },
                    shadow: { cast: true, receive: false },
                    parent: this.engine.graphics.scene,
                    userData: {
                        calcTilePivot: coord => this.world.calcTilePivot(coord),
                        calcTileInds: coord => this.world.calcTileInds(coord),
                        getTilesModels: tiles => this.#getTilesModels(tiles)
                    }
                })

                if (animation) this.engine.runAnimation(model, animation)

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