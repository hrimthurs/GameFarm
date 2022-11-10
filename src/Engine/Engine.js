import { TkObject } from '@hrimthurs/tackle'

import { Clock, AnimationMixer, AnimationClip, Raycaster, Vector2, SkinnedMesh, Matrix4, Vector3 } from 'three'
import { GLTFLoader } from './systems/GLTFLoader.js'
import { DRACOLoader } from './systems/DRACOLoader.js'
import { OrbitControls } from './systems/OrbitControls.js'

import Graphics from './systems/Graphics.js'
import SceneObjects from './systems/SceneObjects.js'

export default class Engine {

    #config = {
        renderContainId: null
    }

    #frame

    #animations = []
    #lookAtCamera = []

    #clock = new Clock()
    #raycaster = new Raycaster()

    #pointer = {
        leftButton: false,
        drag: false,
        pos: new Vector2()
    }

    #selectedMesh

    #dragging = {
        model: null,
        srcTile: null,
        dstTile: null,
        permittedTiles: null
    }

    #v3_A = new Vector3()
    #v3_B = new Vector3()
    #v3_C = new Vector3()

    constructor ({ config = {}, start = false, frame = () => {} }) {
        this.#config = TkObject.merge(this.#config, config)
        this.#frame = frame

        const elRender = document.getElementById(this.#config.renderContainId)
        if (elRender) {
            if (Graphics.checkSupportWebGL()) {

                this.graphics = new Graphics(elRender, this.#config.graphics)
                this.graphics.createSceneObj(this.#config.sceneObjects)

                this.navigator = new OrbitControls(this.graphics.camera, elRender)
                for (const key in this.#config.navigator) {
                    let val = this.#config.navigator[key]
                    this.navigator[key] = typeof val === 'object' ? SceneObjects.Vector3From(val) : val
                }

                this.#setResizeHandler(elRender, size => this.graphics.resizeRenderer(size))

                elRender.addEventListener('mousemove', event => this.#onMouseMove(event))
                elRender.addEventListener('mousedown', event => this.#onMouseDown(event))
                elRender.addEventListener('mouseup', event => this.#onMouseUp(event))

                if (start) this.start()

            } else console.error('This browser not support WebGL')
        } else console.error('Render DOM-container not defined')
    }

    ////////////////////////////////////////////   MAIN LOOP   ////////////////////////////////////////////

    start() {
        const mainLoop = () => {
            requestAnimationFrame(mainLoop)

            this.#frame()
            this.#lookAtCamera.forEach(obj => obj.lookAt(this.graphics.camera.position))

            if (!this.#pointer.drag && !this.#pointer.leftButton) {
                this.#raycaster.setFromCamera(this.#pointer.pos, this.graphics.camera)

                let selectObject = this.#raycaster
                    .intersectObjects(this.graphics.scene.children)
                    .find(intersect => intersect.object.userData.selectable)?.object

                if (selectObject !== this.#selectedMesh) {
                    this.#selectedMesh?.material.emissive.set(0)
                    selectObject?.['material'].emissive.set('#440')
                    this.#selectedMesh = selectObject
                }
            }

            document.body.style.cursor = this.#selectedMesh ? 'grab' : 'default'

            let delta = this.#clock.getDelta()
            this.#animations.forEach(rec => rec.mixer.update(delta))

            this.navigator.update()
            this.graphics.renderUpdate()
        }

        mainLoop()
    }

    //////////////////////////////////////////////   MOUSE   //////////////////////////////////////////////

    #onMouseMove(event) {
        event.preventDefault()

        const rect = this.graphics.clientRect
        if (rect) {
            this.#pointer.pos.x = 2 * (event.clientX - rect.left) / rect.width - 1
            this.#pointer.pos.y = -2 * (event.clientY - rect.top) / rect.height + 1
        }

        this.navigator.enabled = !this.#pointer.drag

        if (this.#pointer.drag) {
            let sceneCoord = this.#getSceneMousePos()
            let tileInds = this.#dragging.model.userData.calcTileInds(sceneCoord)

            let isPermitted = this.#dragging.permittedTiles.some(tile => this.#isEqualCoord(tile, tileInds))
            if (isPermitted) {
                this.#moveModel(this.#dragging.model, tileInds)
                this.#dragging.dstTile = tileInds
            }
        }
    }

    #onMouseDown(event) {
        event.preventDefault()

        this.#pointer.leftButton = true
        this.#pointer.drag = this.#selectedMesh != null

        if (this.#pointer.drag) {
            const dragModel = this.#dragging.model = this.#travelParents(this.#selectedMesh.parent, obj => !obj.userData.getPermittedTiles)

            this.#dragging.srcTile = dragModel.userData.calcTileInds({
                x: dragModel.position.x,
                y: dragModel.position.y
            })

            this.#dragging.permittedTiles = [
                this.#dragging.srcTile,
                ...dragModel.userData.getPermittedTiles()
            ]

            this.#selectTargetModels(dragModel, true, [this.#selectedMesh.uuid])

            let indAnim = dragModel.userData.indAnimation
            if (indAnim !== undefined) this.#animations[indAnim].action.stop()
        }
    }

    #onMouseUp(event) {
        event.preventDefault()

        if (this.#pointer.drag) {
            const dragInst = this.#dragging
            const dragModel = dragInst.model

            this.#selectTargetModels(dragModel, false)

            let indAnim = dragModel.userData.indAnimation
            if (indAnim !== undefined) this.#animations[indAnim].action.play()

            if (dragInst.dstTile && !this.#isEqualCoord(dragInst.srcTile, dragInst.dstTile)) {
                let isRestPos = dragModel.userData.moveDweller(dragInst.srcTile, dragInst.dstTile)
                if (isRestPos) this.#moveModel(dragModel, dragInst.srcTile)
            }

            this.#dragging = { model: null, srcTile: null, dstTile: null, permittedTiles: null }
        }

        this.#pointer.leftButton = false
        this.#pointer.drag = false
    }

    #getSceneMousePos() {
        this.graphics.camera.getWorldPosition(this.#v3_C)

        this.#v3_A.set(this.#pointer.pos.x, this.#pointer.pos.y, 0.5)
        this.#v3_A.unproject(this.graphics.camera).sub(this.#v3_C).normalize()

        let distance = -this.#v3_C.z / this.#v3_A.z
        this.#v3_B.copy(this.#v3_C).add(this.#v3_A.multiplyScalar(distance))

        return {
            x: this.#v3_B.x,
            y: this.#v3_B.y
        }
    }

    #moveModel(model, tileInds) {
        let pivot = model.userData.calcTilePivot(tileInds)
        model.position.setX(pivot.x)
        model.position.setY(pivot.y)
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    async loadAssets(baseUrl, assets, visible = true) {
        let dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

        let loader = new GLTFLoader()
        loader.setDRACOLoader(dracoLoader)

        for (const name in assets) {
            await new Promise(resolve => {
                loader.load(baseUrl + assets[name], gltf => {
                    let model = gltf.scene

                    model.name = name
                    model.visible = visible
                    model.userData.animClips = gltf.animations

                    SceneObjects.traverseMeshes(model, mesh => {
                        mesh.frustumCulled = false

                        if (mesh instanceof SkinnedMesh) {
                            let matrix = new Matrix4()
                                .makeTranslation(0, -50, 0)
                                .scale(new Vector3(200, 150, 100))

                            mesh.geometry.boundingBox.applyMatrix4(matrix)
                            mesh.geometry.boundingSphere.applyMatrix4(matrix)
                        }
                    })

                    this.graphics.scene.add(model)

                    resolve()
                })
            })
        }
    }

    runAnimation(sceneObj, animName) {
        let clip = sceneObj.userData.animClips.find(rec => rec.name === animName)
        if (clip) {
            let mixer = new AnimationMixer(sceneObj)
            let action = mixer.clipAction(AnimationClip.parse(clip)).play()

            mixer.timeScale = 0.75 + (Math.random() / 2)
            sceneObj.userData.indAnimation = this.#animations.length

            this.#animations.push({ mixer, action })
        }
    }

    createIndicator({ parent, position, radius, width, opacity, color }) {
        const base = {
            segments: 32,
            shininess: 0,
            innerRadius: radius - width,
            outerRadius: radius
        }

        let objBack = SceneObjects.createRing({
            ...base,
            color: '#000',
            name: 'back_indicator',
            position, opacity
        })

        let objFace = SceneObjects.createRing({
            ...base,
            color,
            name: 'face_indicator',
            position,
            depthWrite: false,
            length: 0
        })

        this.#lookAtCamera.push(objBack, objFace)

        let indicator = SceneObjects.createGroup({ name: 'indicator' }, [objBack, objFace], parent)
        indicator.userData.options = { ...base }
        indicator.visible = false

        return indicator
    }

    #selectTargetModels(baseModel, select, excludeUuid = []) {
        const setEmissive = select ? '#055' : 0
        let models = baseModel.userData.getTilesModels(this.#dragging.permittedTiles)

        models.forEach(model => SceneObjects.traverseMeshes(model, mesh => {
            if (!excludeUuid.includes(mesh.uuid)) mesh.material.emissive.set(setEmissive)
        }))
    }

    #travelParents(srcObj, cbAction) {
        return srcObj && (cbAction(srcObj) !== false)
            ? this.#travelParents(srcObj.parent, cbAction)
            : srcObj
    }

    #isEqualCoord(coordA, coordB) {
        return (coordA.x == coordB.x) && (coordA.y == coordB.y)
    }

    #setResizeHandler(elRender, handler) {
        const elResizer = document.createElement('iframe')
        elResizer.style.cssText = 'position:absolute; left:0px; top:0px; width:100%; height:100%; z-index:-100'
        elResizer.setAttribute('frameborder', 'no')
        elRender.appendChild(elResizer)

        let prevSize = {
            width: null,
            height: null
        }

        elResizer.contentWindow.addEventListener('resize', () => {
            let { width, height } = getComputedStyle(elResizer)

            let newSize = {
                width: parseInt(width, 10) + 1,
                height: parseInt(height, 10) + 1
            }

            if ((prevSize.width !== newSize.width) || (prevSize.height !== newSize.height)) {
                handler(newSize)
                prevSize = newSize
            }
        })

        elResizer.contentWindow.dispatchEvent(new Event('resize'))
    }

}