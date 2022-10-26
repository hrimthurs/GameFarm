import { Scene, Color, PerspectiveCamera, Group, Vector3, AxesHelper, GridHelper, CameraHelper, AmbientLight, DirectionalLight, DirectionalLightHelper, Mesh, RingGeometry, MeshPhongMaterial, SkinnedMesh } from 'three'
import { clone as totalClone } from './SkeletonUtils.js'

export default class SceneObjects {

    // MAIN

    static createScene(options) {
        const scene = new Scene()
        scene.background = new Color(options.background)

        return scene
    }

    static createCamera(options, parent = null) {
        const camera = new PerspectiveCamera(options.fov, 1, options.near, options.far)
        this.setBaseParams(camera, options)

        camera.up.copy(this.Vector3From(options.upVector))
        camera.lookAt(this.Vector3From(options.lookAt))

        if (parent) {
            parent.add(camera)

            if (options.helper === true) {
                const helper = new CameraHelper(camera)
                parent.add(helper)
            }
        }

        return camera
    }

    static createGroup(options, objects, parent = null) {
        const group = new Group()
        this.setBaseParams(group, options)

        objects.forEach(obj => group.add(obj))

        if (parent) parent.add(group)
        return group
    }

    // HELPERS

    static createAxes(options, parent = null) {
        const axes = new AxesHelper(options.size)
        this.setBaseParams(axes, options)

        if (parent) parent.add(axes)
        return axes
    }

    static createGrid(options, parent = null) {
        const grid = new GridHelper(options.size, options.div, options.colorCentre, options.colorGrid)
        this.setBaseParams(grid, options)

        if (parent) parent.add(grid)
        return grid
    }

    // LIGHTS

    static createAmbLight(options, parent = null) {
        const ambLight = new AmbientLight(options.color, options.intensity)
        this.setBaseParams(ambLight, options)

        if (parent) parent.add(ambLight)
        return ambLight
    }

    static createDirLight(options, parent = null) {
        const dirLight = new DirectionalLight(options.color, options.intensity)
        this.setBaseParams(dirLight, options)

        dirLight.castShadow = options.castShadow === true

        if (parent) {
            parent.add(dirLight)

            if (options.helper === true) {
                const helper = new DirectionalLightHelper(dirLight)
                parent.add(helper)
            }
        }

        return dirLight
    }

    // PRIMITIVES

    static createRing(options, parent = null) {
        const material = new MeshPhongMaterial({
            color: options.color ?? '#a00',
            shininess: options.shininess ?? 30,
            opacity: options.opacity ?? 1,
            transparent: options.opacity < 1,
            depthWrite: options.depthWrite ?? true,
        })

        const ring = new Mesh(new RingGeometry(options.innerRadius, options.outerRadius, options.segments, options.phi, options.start, options.length), material)
        this.setBaseParams(ring, options)

        if (parent) parent.add(ring)
        return ring
    }

    // ROUTINES

    static instance({ protoObj, position, rotation = {}, scale = 1, selectable = true, shadow = { cast: false, receive: false }, userData = {} }) {
        const obj = totalClone(protoObj)

        obj.position.copy(this.Vector3From(position))
        obj.rotation.setFromVector3(this.Vector3From(rotation))
        obj.scale.copy(this.Vector3From(scale))

        obj.name = protoObj.name + '_instance'
        obj.visible = true
        obj.userData = { ...obj.userData, ...userData }

        this.traverseMeshes(obj, mesh => {
            mesh.castShadow = shadow.cast
            mesh.receiveShadow = shadow.receive

            mesh.material = mesh.material.clone()
            mesh.userData.selectable = selectable
        })

        return obj
    }

    static setBaseParams(obj, options) {
        obj.name = options.name || ''
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