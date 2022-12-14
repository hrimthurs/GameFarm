const ENVIRON_OBJECT = 0

export default class World {

    #tiles
    #sizeTile
    #sizeWorld

    constructor ({ sizeWorld, sizeTile }) {
        this.#sizeWorld = sizeWorld
        this.#sizeTile = sizeTile

        this.#tiles = new Array(sizeWorld.x).fill(0).map(v => new Array(sizeWorld.y).fill(0).map(v => ({
            dweller: null,
            ground: null
        })))
    }

    getRandomEmptyTile() {
        let coord

        let emptyTiles = this.getEmptyTiles()
        if (emptyTiles.length > 0) {
            let indTile = Math.floor(Math.random() * emptyTiles.length)
            coord = emptyTiles[indTile]
        }

        return coord
    }

    setEnviron({ coord, size = { x: 1, y: 1} }) {
        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                this.#tiles[coord.x + x][coord.y + y].dweller = ENVIRON_OBJECT
            }
        }
    }

    setDweller(coord, dweller = null) {
        this.#tiles[coord.x][coord.y].dweller = dweller
    }

    getDweller(coord) {
        return this.#tiles[coord.x][coord.y].dweller
    }

    moveDweller(srcCoord, dstCoord) {
        this.setDweller(dstCoord, this.getDweller(srcCoord))
        this.setDweller(srcCoord)
    }

    getTileModels(coord) {
        const tile = this.#tiles[coord.x][coord.y]
        return [tile.dweller?.model, tile.ground?.model]
    }

    update() {
        this.travelTiles(tile => {
            if (tile.dweller !== ENVIRON_OBJECT) tile.dweller?.update()
        })
    }

    travelTiles(cbAction) {
        this.#tiles.forEach((row, x) => {
            row.forEach((tile, y) => cbAction(tile, { x, y }))
        })
    }

    getEmptyTiles(permitClassNames = []) {
        let res = []

        this.travelTiles((tile, coord) => {
            const dweller = tile.dweller
            let isEmptyTile = (dweller !== ENVIRON_OBJECT) && (!dweller || permitClassNames.includes(dweller.constructor.name))
            if (isEmptyTile) res.push(coord)
        })

        return res
    }

    calcTilePivot(coord) {
        const halfSizeTile = this.#sizeTile / 2

        return {
            x: (-this.#sizeWorld.x * halfSizeTile) + halfSizeTile + (coord.x * this.#sizeTile),
            y: (-this.#sizeWorld.y * halfSizeTile) + halfSizeTile + (coord.y * this.#sizeTile)
        }
    }

    calcTileInds(coord) {
        const halfSizeTile = this.#sizeTile / 2

        return {
            x: Math.trunc((coord.x + (this.#sizeWorld.x * halfSizeTile)) / this.#sizeTile),
            y: Math.trunc((coord.y + (this.#sizeWorld.y * halfSizeTile)) / this.#sizeTile)
        }
    }

}