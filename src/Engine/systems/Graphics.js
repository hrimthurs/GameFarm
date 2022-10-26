import { TkObject, TkArray } from '@hrimthurs/tackle'
import { WebGLRenderer, sRGBEncoding, PCFSoftShadowMap } from 'three'

import SceneObjects from './SceneObjects.js'

export default class Graphics {

    #config = {
        renderer: {
            alpha: false
        },

        scene: {
            background: '#aaa'
        },

        camera: {
            fov: 75,
            near: 0.1,
            far: 100,
            upVector: { x: 0, y: 0, z: 1 },
            position: { x: 10, y: 10, z: 10 },
            lookAt: { x: 0, y: 0, z: 0 }
        }
    }

    static checkSupportWebGL() {
        let supportWebGL = false

        try {
            if (window.WebGLRenderingContext) {
                let canvas = document.createElement('canvas')
                supportWebGL = ['webgl2', 'wegl', 'experimental-webgl'].some(name => canvas.getContext(name))
                canvas.remove()
            }
        } catch {}

        return supportWebGL
    }

    constructor (elRender, config) {
        this.#config = TkObject.merge(this.#config, config)

        this.renderer = new WebGLRenderer()
        this.renderer.outputEncoding = sRGBEncoding
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = PCFSoftShadowMap
        
        elRender.appendChild(this.renderer.domElement)

        this.scene = SceneObjects.createScene(this.#config.scene)
        this.camera = SceneObjects.createCamera(this.#config.camera, this.scene)
    }

    resizeRenderer(size) {
        this.clientRect = this.renderer.domElement.getBoundingClientRect()
        this.clientRect.width = size.width
        this.clientRect.height = size.height

        this.camera.aspect = size.width / size.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(size.width, size.height)
        this.renderUpdate()
    }

    renderUpdate() {
        this.renderer.render(this.scene, this.camera)
    }

    createSceneObj(srcObjects) {
        TkArray.getArray(srcObjects).map(recObj => {
            switch (recObj.type) {
                case 'axes': SceneObjects.createAxes(recObj, this.scene); break
                case 'grid': SceneObjects.createGrid(recObj, this.scene); break
                case 'ambLight': SceneObjects.createAmbLight(recObj, this.scene); break
                case 'dirLight': SceneObjects.createDirLight(recObj, this.scene); break
            }
        })
    }

}