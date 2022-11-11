import { Scene, PerspectiveCamera, Group, Vector3, Matrix4, AxesHelper, GridHelper, CameraHelper, AmbientLight, DirectionalLight, DirectionalLightHelper, Mesh, RingGeometry, MeshPhongMaterial, SkinnedMesh } from 'three'
import { clone as totalClone } from './SkeletonUtils.js'

export default class SceneObjects {

    // MAIN

    static createScene() {
        return new Scene()
    }

    static createCamera(options, parent = null) {
        let camera = new PerspectiveCamera(options.fov, 1, options.near, options.far)
        this.setBaseParams(camera, options)

        camera.up.copy(this.Vector3From(options.upVector))
        camera.lookAt(this.Vector3From(options.lookAt))

        if (parent) {
            parent.add(camera)

            if (options.helper === true) {
                let helper = new CameraHelper(camera)
                parent.add(helper)
            }
        }

        return camera
    }

    static createGroup(options, objects, parent = null) {
        let group = new Group()
        this.setBaseParams(group, options)

        objects.forEach(obj => group.add(obj))

        if (parent) parent.add(group)
        return group
    }

    // HELPERS

    static createAxes(options, parent = null) {
        let axes = new AxesHelper(options.size)
        this.setBaseParams(axes, options)

        if (parent) parent.add(axes)
        return axes
    }

    static createGrid(options, parent = null) {
        let grid = new GridHelper(options.size, options.div, options.colorCentre, options.colorGrid)
        this.setBaseParams(grid, options)

        if (parent) parent.add(grid)
        return grid
    }

    // LIGHTS

    static createAmbLight(options, parent = null) {
        let ambLight = new AmbientLight(options.color, options.intensity)
        this.setBaseParams(ambLight, options)

        if (parent) parent.add(ambLight)
        return ambLight
    }

    static createDirLight(options, parent = null) {
        let dirLight = new DirectionalLight(options.color, options.intensity)
        this.setBaseParams(dirLight, options)

        if (options.shadow) {
            dirLight.castShadow = true
            dirLight.shadow.normalBias = options.shadow.normalBias ?? 0

            const setShadowCamera = options.shadow.camera
            if (setShadowCamera) {
                dirLight.shadow.camera.near = setShadowCamera.near ?? 0.5
                dirLight.shadow.camera.far = setShadowCamera.far ?? 500
                dirLight.shadow.camera.top = setShadowCamera.top ?? 5
                dirLight.shadow.camera.right = setShadowCamera.right ?? 5
                dirLight.shadow.camera.bottom = setShadowCamera.bottom ?? -5
                dirLight.shadow.camera.left = setShadowCamera.left ?? -5
            }
        }

        parent = parent ?? options.parent
        if (parent) {
            parent.add(dirLight)

            if (options.helper === true) {
                let helper = new DirectionalLightHelper(dirLight)
                parent.add(helper)
            }
        }

        return dirLight
    }

    // PRIMITIVES

    static createRing(options, parent = null) {
        let material = new MeshPhongMaterial({
            color: options.color ?? '#a00',
            shininess: options.shininess ?? 30,
            opacity: options.opacity ?? 1,
            transparent: options.opacity < 1,
            depthWrite: options.depthWrite ?? true,
        })

        let ring = new Mesh(new RingGeometry(options.innerRadius, options.outerRadius, options.segments, options.phi, options.start, options.length), material)
        this.setBaseParams(ring, options)

        if (parent) parent.add(ring)
        return ring
    }

    // ROUTINES

    static instance({ sceneObj, position = {}, rotation = {}, scale = 1, selectable = true, shadow = { cast: false, receive: false }, parent = null, userData = {} }) {
        let obj = totalClone(sceneObj)
        obj.visible = true
        obj.userData = { ...obj.userData, ...userData }

        this.setBaseParams(obj, {
            name: sceneObj.name + '_instance',
            position, rotation, scale
        })

        this.traverseMeshes(obj, mesh => {
            mesh.frustumCulled = false
            mesh.castShadow = shadow.cast
            mesh.receiveShadow = shadow.receive

            mesh.material = mesh.material.clone()
            mesh.userData.selectable = selectable

            if (mesh instanceof SkinnedMesh) {
                let matrix = new Matrix4()
                    .makeTranslation(0, -50, 0)
                    .scale(new Vector3(200, 150, 100))

                mesh.geometry.boundingBox.applyMatrix4(matrix)
                mesh.geometry.boundingSphere.applyMatrix4(matrix)
            }
        })

        if (parent) parent.add(obj)
        return obj
    }

    static setBaseParams(obj, options) {
        obj.name = options.name ?? ''
        obj.position.copy(this.Vector3From(options.position))
        obj.rotation.setFromVector3(this.Vector3From(options.rotation))
        obj.scale.copy(this.Vector3From(options.scale, [1, 1, 1]))
    }

    static Vector3From(src, vectorDefault = [0, 0, 0]) {
        let vComponents = typeof src === 'object'
            ? Array.isArray(src)
                ? src.length === 3 ? src : null
                : [src.x || 0, src.y || 0, src.z || 0]
            : typeof src === 'number'
                ? new Array(3).fill(src)
                : null

        return new Vector3().fromArray(vComponents || vectorDefault)
    }

    static traverseMeshes(parent, cbAction) {
        parent.traverse(obj => {
            if ((obj instanceof SkinnedMesh) || (obj instanceof Mesh)) cbAction(obj)
        })
    }

}