export default class PageElements {

    static setDivResizeHandler(elDiv, handler) {
        const elResizer = this.createElement('iframe', elDiv, {
            style: 'top:0px; position:absolute; width:100%; height:100%; z-index:-100',
            attributes: { frameborder: 'no' }
        })

        let prevSize

        elResizer.contentWindow.addEventListener('resize', () => {
            let computedStyle = getComputedStyle(elResizer)

            let newSize = {
                width: parseInt(computedStyle.width, 10),
                height: parseInt(computedStyle.height, 10)
            }

            if (newSize !== prevSize) {
                handler(newSize)
                prevSize = newSize
            }
        })
    }

    static createElement(elType, parent, options = {}) {
        let element = document.createElement(elType)

        Object.entries(options).forEach(rec => {
            let [key, val] = rec

            switch (key) {
                case 'attributes':
                    Object.entries(val).forEach(rec => element.setAttribute(rec[0], rec[1]))
                    break

                case 'style':
                    let currCssText = element.style.cssText || ''
                    if (typeof val === 'string') element.style.cssText += `;${val}`
                    else Object.entries(val).forEach(rec => element.style.cssText = currCssText + `;${rec[0]}:${rec[1]}`)
                    break

                case 'class':
                    if (Array.isArray(val)) val.forEach(rec => element.classList.add(rec))
                    else element.classList.add(val)
                    break

                default:
                    if (key in element) element[key] = val
            }
        })

        parent.appendChild(element)
        return element
    }

}
