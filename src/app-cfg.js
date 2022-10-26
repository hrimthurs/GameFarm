export default {

    name: 'Game Farm',
    version: require('../package.json').version,

    engine: {
        renderContainId: 'render_contain',

        graphics: {
            scene: {
                background: 0xbfe3dd
            },

            camera: {
                fov: 40,
                near: 0.1,
                far: 100,
                position: { x: 15, y: 8, z: 17 },
            }
        },

        navigator: {
            target: { z: 1 },

            minDistance: 18,
            maxDistance: 30,
            maxPolarAngle: 1.3,

            enablePan: false,
            enableDamping: true
        },

        sceneObjects: [
            // { type: 'axes', size: 10, position: { z: 0.05 } },
            // { type: 'grid', size: 20, div: 12, rotation: { x: Math.PI / 2 } },
            { type: 'ambLight' },
            { type: 'dirLight', castShadow: true, helper: false, position: { x: 5, y: -5, z: 12 } }
        ]
    },

    assets: {
        protoEmpty: 'empty.glb',
        protoCorn: 'corn.glb',
        protoChicken: 'chicken.glb',
        protoCow: 'cow.glb'
    },

    indicator: {
        top: 4.3,
        radius: 0.55,
        width: 0.20,
        opacity: 0.5,
        color: 0x0136F3
    },

    world: {
        size: { x: 8, y: 8 },
        sizeField: 2
    },

    dwellers: {
        Corn: {
            amount: 3,
            options: {
                priceProduct: 10,
            },
            model: {
                nameProto: 'protoCorn'
            }
        },

        Chicken: {
            amount: 2,
            options: {
                priceProduct: 10,
                refillAdd: 30,
                sellPrice: 20,
            },
            model: {
                nameProto: 'protoChicken',
                animation: 'courier_idle_rare_Armature_0'
            }
        },

        Cow: {
            amount: 1,
            options: {
                priceProduct: 20,
                refillAdd: 20,
                sellPrice: 50
            },
            model: {
                nameProto: 'protoCow',
                animation: 'yak_idle_alt'
            }
        }
    }

}