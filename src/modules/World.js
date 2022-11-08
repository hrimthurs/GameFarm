export default class World {

    #cells

    constructor ({ size }) {
        this.#cells = new Array(size.x).fill(0).map(v => new Array(size.y).fill(0).map(v => ({
            dweller: null,
            ground: null
        })))
    }

    getRandomEmptyPlace() {
        let coord

        let emptyPlaces = this.getEmptyPlaces()
        if (emptyPlaces.length > 0) {
            let indPlace = Math.floor(Math.random() * emptyPlaces.length)
            coord = emptyPlaces[indPlace]
        }

        return coord
    }

    setDweller(coord, dweller = null) {
        this.#cells[coord.x][coord.y].dweller = dweller
    }

    getDweller(coord) {
        return this.#cells[coord.x][coord.y].dweller
    }

    moveDweller(srcCoord, dstCoord) {
        this.setDweller(dstCoord, this.getDweller(srcCoord))
        this.setDweller(srcCoord)
    }

    getCellModels(coord) {
        const cell = this.#cells[coord.x][coord.y]
        return [cell.dweller?.model, cell.ground?.model]
    }

    update() {
        this.travelCells(cell => cell.dweller?.update())
    }

    travelCells(cbAction) {
        this.#cells.forEach((row, x) => {
            row.forEach((cell, y) => cbAction(cell, { x, y }))
        })
    }

    getEmptyPlaces(permitClassNames = []) {
        let res = []

        this.travelCells((cell, coord) => {
            const dweller = cell.dweller
            if (!dweller || permitClassNames.includes(dweller.constructor.name)) res.push(coord)
        })

        return res
    }

}