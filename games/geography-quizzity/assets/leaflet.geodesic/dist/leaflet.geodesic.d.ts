/*! leaflet.geodesic 2.7.2 - (c) Henry Thasler - https://github.com/henrythasler/Leaflet.Geodesic#readme */
import * as L from 'leaflet';

interface GeodesicOptions extends L.PolylineOptions {
    wrap?: boolean;
    steps?: number;
    radius?: number;
}
interface WGS84Vector extends L.LatLngLiteral {
    bearing: number;
}
interface GeoDistance {
    distance: number;
    initialBearing: number;
    finalBearing: number;
}
declare class GeodesicCore {
    readonly options: GeodesicOptions;
    readonly ellipsoid: {
        a: number;
        b: number;
        f: number;
    };
    constructor(options?: GeodesicOptions);
    toRadians(degree: number): number;
    toDegrees(radians: number): number;
    /**
     * implements scientific modulus
     * source: http://www.codeavenger.com/2017/05/19/JavaScript-Modulo-operation-and-the-Caesar-Cipher.html
     * @param n
     * @param p
     * @return
     */
    mod(n: number, p: number): number;
    /**
     * source: https://github.com/chrisveness/geodesy/blob/master/dms.js
     * @param degrees arbitrary value
     * @return degrees between 0..360
     */
    wrap360(degrees: number): number;
    /**
     * general wrap function with arbitrary max value
     * @param degrees arbitrary value
     * @param max
     * @return degrees between `-max`..`+max`
     */
    wrap(degrees: number, max?: number): number;
    /**
     * Vincenty direct calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start starting point
     * @param bearing initial bearing (in degrees)
     * @param distance distance from starting point to calculate along given bearing in meters.
     * @param maxInterations How many iterations can be made to reach the allowed deviation (`ε`), before an error will be thrown.
     * @return Final point (destination point) and bearing (in degrees)
     */
    direct(start: L.LatLng, bearing: number, distance: number, maxInterations?: number): WGS84Vector;
    /**
     * Vincenty inverse calculation.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-ellipsoidal-vincenty.js
     *
     * @param start Latitude/longitude of starting point.
     * @param dest Latitude/longitude of destination point.
     * @return Object including distance, initialBearing, finalBearing.
     */
    inverse(start: L.LatLng, dest: L.LatLng, maxInterations?: number, mitigateConvergenceError?: boolean): GeoDistance;
    /**
     * Returns the point of intersection of two paths defined by position and bearing.
     * This calculation uses a spherical model of the earth. This will lead to small errors compared to an ellipsiod model.
     * based on the work of Chris Veness (https://github.com/chrisveness/geodesy)
     * source: https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js
     *
     * @param firstPos 1st path: position and bearing
     * @param firstBearing
     * @param secondPos 2nd path: position and bearing
     * @param secondBearing
     */
    intersection(firstPos: L.LatLng, firstBearing: number, secondPos: L.LatLng, secondBearing: number): L.LatLng | null;
    midpoint(start: L.LatLng, dest: L.LatLng): L.LatLng;
}

/** detailled information of the current geometry */
interface Statistics {
    /** Stores the distance for each individual geodesic line */
    distanceArray: number[];
    /** overall distance of all lines */
    totalDistance: number;
    /** number of positions that the geodesic lines are created from */
    points: number;
    /** number vertices that were created during geometry calculation */
    vertices: number;
}
declare class GeodesicGeometry {
    readonly geodesic: GeodesicCore;
    steps: number;
    constructor(options?: GeodesicOptions);
    /**
     * A geodesic line between `start` and `dest` is created with this recursive function.
     * It calculates the geodesic midpoint between `start` and `dest` and uses this midpoint to call itself again (twice!).
     * The results are then merged into one continuous linestring.
     *
     * The number of resulting vertices (incl. `start` and `dest`) depends on the initial value for `iterations`
     * and can be calculated with: vertices == 1 + 2 ** (initialIterations + 1)
     *
     * As this is an exponential function, be extra careful to limit the initial value for `iterations` (8 results in 513 vertices).
     *
     * @param start start position
     * @param dest destination
     * @param iterations
     * @return resulting linestring
     */
    recursiveMidpoint(start: L.LatLng, dest: L.LatLng, iterations: number): L.LatLng[];
    /**
     * This is the wrapper-function to generate a geodesic line. It's just for future backwards-compatibility
     * if there is another algorithm used to create the actual line.
     *
     * The `steps`-property is used to define the number of resulting vertices of the linestring: vertices == 1 + 2 ** (steps + 1)
     * The value for `steps` is currently limited to 8 (513 vertices) for performance reasons until another algorithm is found.
     *
     * @param start start position
     * @param dest destination
     * @return resulting linestring
     */
    line(start: L.LatLng, dest: L.LatLng): L.LatLng[];
    multiLineString(latlngs: L.LatLng[][]): L.LatLng[][];
    lineString(latlngs: L.LatLng[]): L.LatLng[];
    /**
     *
     * Is much (10x) faster than the previous implementation:
     *
     * ```
     * Benchmark (no split):  splitLine x 459,044 ops/sec ±0.53% (95 runs sampled)
     * Benchmark (split):     splitLine x 42,999 ops/sec ±0.51% (97 runs sampled)
     * ```
     *
     * @param startPosition
     * @param destPosition
     */
    splitLine(startPosition: L.LatLng, destPosition: L.LatLng): L.LatLng[][];
    /**
     * Linestrings of a given multilinestring that cross the antimeridian will be split in two separate linestrings.
     * This function is used to wrap lines around when they cross the antimeridian
     * It iterates over all linestrings and reconstructs the step-by-step if no split is needed.
     * In case the line was split, the linestring ends at the antimeridian and a new linestring is created for the
     * remaining points of the original linestring.
     *
     * @param multilinestring
     * @return another multilinestring where segments crossing the antimeridian are split
     */
    splitMultiLineString(multilinestring: L.LatLng[][]): L.LatLng[][];
    /**
     * Linestrings of a given multilinestring will be wrapped (+- 360°) to show a continuous line w/o any weird discontinuities
     * when `wrap` is set to `false` in the geodesic class
     * @param multilinestring
     * @returns another multilinestring where the points of each linestring are wrapped accordingly
     */
    wrapMultiLineString(multilinestring: L.LatLng[][]): L.LatLng[][];
    /**
     * Creates a circular (constant radius), closed (1st pos == last pos) geodesic linestring.
     * The number of vertices is calculated with: `vertices == steps + 1` (where 1st == last)
     *
     * @param center
     * @param radius
     * @return resulting linestring
     */
    circle(center: L.LatLng, radius: number): L.LatLng[];
    /**
     * Handles splitting of circles at the antimeridian.
     * @param linestring a linestring that resembles the geodesic circle
     * @return a multilinestring that consist of one or two linestrings
     */
    splitCircle(linestring: L.LatLng[]): L.LatLng[][];
    /**
     * Calculates the distance between two positions on the earths surface
     * @param start 1st position
     * @param dest 2nd position
     * @return the distance in **meters**
     */
    distance(start: L.LatLng, dest: L.LatLng): number;
    multilineDistance(multilinestring: L.LatLng[][]): number[];
    updateStatistics(points: L.LatLng[][], vertices: L.LatLng[][]): Statistics;
}

/**
 * Draw geodesic lines based on L.Polyline
 */
declare class GeodesicLine extends L.Polyline {
    /** these should be good for most use-cases */
    defaultOptions: GeodesicOptions;
    /** does the actual geometry calculations */
    readonly geom: GeodesicGeometry;
    /** use this if you need some detailled info about the current geometry */
    statistics: Statistics;
    /** stores all positions that are used to create the geodesic line */
    points: L.LatLng[][];
    constructor(latlngs?: L.LatLngExpression[] | L.LatLngExpression[][], options?: GeodesicOptions);
    /** calculates the geodesics and update the polyline-object accordingly */
    private updateGeometry;
    /**
     * overwrites the original function with additional functionality to create a geodesic line
     * @param latlngs an array (or 2d-array) of positions
     */
    setLatLngs(latlngs: L.LatLngExpression[] | L.LatLngExpression[][]): this;
    /**
     * add a given point to the geodesic line object
     * @param latlng point to add. The point will always be added to the last linestring of a multiline
     * @param latlngs define a linestring to add the new point to. Read from points-property before (e.g. `line.addLatLng(Beijing, line.points[0]);`)
     */
    addLatLng(latlng: L.LatLngExpression, latlngs?: L.LatLng[]): this;
    /**
     * Creates geodesic lines from a given GeoJSON-Object.
     * @param input GeoJSON-Object
     */
    fromGeoJson(input: GeoJSON.GeoJSON): this;
    /**
     * Calculates the distance between two geo-positions
     * @param start 1st position
     * @param dest 2nd position
     * @return the distance in meters
     */
    distance(start: L.LatLngExpression, dest: L.LatLngExpression): number;
}

/**
 * Can be used to create a geodesic circle based on L.Polyline
 */
declare class GeodesicCircleClass extends L.Polyline {
    defaultOptions: GeodesicOptions;
    readonly geom: GeodesicGeometry;
    center: L.LatLng;
    radius: number;
    statistics: Statistics;
    constructor(center?: L.LatLngExpression, options?: GeodesicOptions);
    /**
     * Updates the geometry and re-calculates some statistics
     */
    private update;
    /**
     * Calculate the distance between the current center and an arbitrary position.
     * @param latlng geo-position to calculate distance to
     * @return distance in meters
     */
    distanceTo(latlng: L.LatLngExpression): number;
    /**
     * Set a new center for the geodesic circle and update the geometry. Radius may also be set.
     * @param center the new center
     * @param radius the new radius
     */
    setLatLng(center: L.LatLngExpression, radius?: number): void;
    /**
     * Set a new radius for the geodesic circle and update the geometry. Center may also be set.
     * @param radius the new radius
     * @param center the new center
     */
    setRadius(radius: number, center?: L.LatLngExpression): void;
}

declare module "leaflet" {
    type Geodesic = GeodesicLine;
    let Geodesic: typeof GeodesicLine;
    let geodesic: (...args: ConstructorParameters<typeof GeodesicLine>) => GeodesicLine;
    type GeodesicCircle = GeodesicCircleClass;
    let GeodesicCircle: typeof GeodesicCircleClass;
    let geodesiccircle: (...args: ConstructorParameters<typeof GeodesicCircleClass>) => GeodesicCircleClass;
}

export { GeodesicCircleClass, GeodesicLine };
