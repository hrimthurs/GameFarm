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
                position: { x: 10, y: 18, z: 10 }
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
            // { type: 'axes', size: 20, position: { z: 0.05 } },
            // { type: 'grid', size: 20, div: 12, rotation: { x: Math.PI / 2 } },
            { type: 'ambLight', intensity: 0.4 }
        ]
    },

    assets: {
        ground: 'assets/ground.glb',
        corn: 'assets/corn.glb',
        chicken: 'assets/chicken.glb',
        cow: 'assets/cow.glb',
        home: 'assets/home.glb',
        fence: 'assets/fence.glb'
    },

    indicator: {
        top: 4.3,
        radius: 0.55,
        width: 0.20,
        opacity: 0.5,
        color: 0x0136F3
    },

    world: {
        sizeWorld: { x: 9, y: 9 },
        sizeTile: 2
    },

    dwellers: {
        Corn: {
            amount: 3,
            options: {
                priceProduct: 10
            },
            asset: {
                name: 'corn'
            }
        },

        Chicken: {
            amount: 2,
            options: {
                priceProduct: 10,
                refillAdd: 30,
                sellPrice: 20
            },
            asset: {
                name: 'chicken',
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
            asset: {
                name: 'cow',
                animation: 'yak_idle_alt'
            }
        }
    }

}