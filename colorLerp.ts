
import { copyFileSync } from "fs"
import { Coordinate } from "./scripts/coordinate.js"
import { Grid, Row, Cell } from "./scripts/grid.js"
import { getCellReference, GridRenderer } from "./scripts/renderer.js"

/**
 * Interpolates between two values.
 * @param a: first value.
 * @param b: second value.
 * @param t: interpolation ratio.
 * @example
 * lerp(1, 3, 0.5)
 * //will return the vallue halfway between 1 and 3.
 * //returns 2
 * @example
 * lerp(1,2, 0.75)
 * //returns 1.75
 
*/
function lerp(a: number, b: number, t: number) {
    return (1 - t) * a + b * t
}

/**
 * @param c: a number between a and b.
 * @returns the interpolation value needed to produce c from a and b.
*/
function inverseLerp(a: number, b: number, c: number) {
    return (c - a) / (b - a)
}

function remap(iMin, iMax, oMin, oMax, v) {
    let t = inverseLerp( iMin, iMax, v )
    return lerp( oMin, oMax, t )
}

//array of three numbers where each number is between 0 and 255.
type RGBColor = [number, number, number]

class ColorMap {
    colorMap: Grid
    start: Cell
    end: Cell
    color1: RGBColor
    color2: RGBColor
    constructor(w,h, [r1,g1,b1]: RGBColor, [r2,g2,b2]: RGBColor) {
        this.colorMap = new Grid(w,h,);
        this.color1 = [r1,g1,b1]
        this.color2 = [r2,g2,b2]
        this.generateColors()
    }
    generateColors() {
        this.colorMap.forEachCell((cell, grid, returnvar)=>{
            let [x,y] = cell.XYCoordinate
            let distance = Math.sqrt(Math.abs(x**2)+Math.abs(y**2))
            let [r2,g2,b2] = this.color2
            let [r1,g1,b1] = this.color1
            let a = 0.03
            let v =  a*distance
            let red = lerp(r1,r2,v) 
            let green = lerp(g1,g2,v)
            let blue = lerp(b1,b2,v) 
            cell.data = {color: [red,green,blue]}
        })
    }
}

let color1 = <RGBColor>[0,0,0]
let color2 = <RGBColor>[255,255,255]
let c = new ColorMap(100,100,color1,color2)

let anchor = document.getElementById("grid-anchor")
let r = new GridRenderer(anchor)
r.resolveData_DocumentDeltas(c.colorMap)
c.colorMap.forEachCell((cell, grid, returnvar)=>{
    let DOMCell = getCellReference(cell.XYCoordinate, r.identifier)
    DOMCell.style.backgroundColor = arrayToCSSRGBString(cell.data.color)
})

function arrayToCSSRGBString([r,g,b]) {
    r = Math.abs(r)
    g = Math.abs(g)
    b = Math.abs(b)
    return `rgb(${r},${g},${b})`
}