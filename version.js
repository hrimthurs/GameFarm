const fs = require('fs')
const path = require('path')

const config = {
    regExpV: /\b(v?)(\d+\.\d+\.\d+)\b/gi,
    version: require('./package.json').version,
    include: ['.js', '.html', '.md'],
    exclude: [__filename, 'node_modules']
}

function isPathCondition(srcPath, variants) {
    const parts = path.parse(srcPath)
    return [srcPath, parts.base, parts.name, parts.ext].some(check => variants.includes(check))
}

function getFiles(root = './', files = []) {
    if (!path.isAbsolute(root)) root = path.join(__dirname, root)

    fs.readdirSync(root).forEach(name => {
        const pathEntity = path.join(root, name)
        const isInclude = isPathCondition(pathEntity, config.include)
        const isExclude = isPathCondition(pathEntity, config.exclude)

        const isDirectory = fs.statSync(pathEntity).isDirectory()

        if (isDirectory && !isExclude) getFiles(pathEntity, files)
        else if (isInclude && !isExclude) files.push(pathEntity)
    })

    return files
}

console.log('Checking version definitions ...')

getFiles().forEach(fileName => {
    let indsReplace = []

    const newFileData = fs.readFileSync(fileName).toString()
        .replace(config.regExpV, (match, prefix, version, index) => {
            if (version !== config.version) indsReplace.push({ index, version })
            return prefix + config.version
        })

    if (indsReplace.length > 0) {
        const outInf = `In file "${fileName.replace(__dirname, '.')}" replace version definition \x1b[31m%s\x1b[0m at`
        indsReplace.forEach(rec => console.log(outInf, rec.version, rec.index))

        fs.writeFileSync(fileName, newFileData)
    }
})

console.log()