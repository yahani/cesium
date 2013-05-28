/*global define*/
define([
        './DeveloperError',
        './Cartesian4',
        './Ellipsoid',
        './Matrix4',
        './ComponentDatatype',
        './PrimitiveType',
        './defaultValue',
        './BoundingSphere',
        './GeometryAttribute',
        './GeometryIndices',
        './PolygonPipeline',
        './EllipsoidTangentPlane',
        './WindingOrder',
        './GeometryFilters',
        './Queue',
        './Intersect'
    ], function(
        DeveloperError,
        Cartesian4,
        Ellipsoid,
        Matrix4,
        ComponentDatatype,
        PrimitiveType,
        defaultValue,
        BoundingSphere,
        GeometryAttribute,
        GeometryIndices,
        PolygonPipeline,
        EllipsoidTangentPlane,
        WindingOrder,
        GeometryFilters,
        Queue,
        Intersect) {
    "use strict";

    var ellipsoid;

    /**
     * Creates a PolygonGeometry. The polygon itself is either defined by an array of Cartesian points,
     * or a polygon hierarchy.
     *
     * @alias PolygonGeometry
     * @constructor
     *
     * @param {Array} [positions] an array of positions that defined the corner points of the polygon
     * @param {polygon hierarchy} [polygonHierarchy] a polygon hierarchy that can include holes
     * @param {Number} [height=0.0] the height of the polygon,
     * @param {Object} [pickData] the geometry pick data
     * @param {Ellipsoid} [ellipsoid=Ellipsoid.WGS84] the ellipsoid to be used as a reference
     *
     * @exception {DeveloperError} All dimensions components must be greater than or equal to zero.
     * @exception {DeveloperError} At least three positions required
     * @exception {DeveloperError} positions or polygonHierarchy must be supplied
     *
     * @example
     *
     *  // create a polygon from points
     *  var polygon = new Cesium.PolygonGeometry({
     *      positions : ellipsoid.cartographicArrayToCartesianArray([
     *                      Cesium.Cartographic.fromDegrees(-72.0, 40.0),
     *                      Cesium.Cartographic.fromDegrees(-70.0, 35.0),
     *                      Cesium.Cartographic.fromDegrees(-75.0, 30.0),
     *                      Cesium.Cartographic.fromDegrees(-70.0, 30.0),
     *                      Cesium.Cartographic.fromDegrees(-68.0, 40.0)
     *                  ]),
     *      pickData : 'polygon1'
     *  });
     *
     *  // create a nested polygon with holes
     *  polygon = new Cesium.PolygonGeometry({
     *      polygonHierarchy : {
     *          positions : ellipsoid.cartographicArrayToCartesianArray(
     *                          [
     *                          Cesium.Cartographic.fromDegrees(-109.0, 30.0),
     *                          Cesium.Cartographic.fromDegrees(-95.0, 30.0),
     *                          Cesium.Cartographic.fromDegrees(-95.0, 40.0),
     *                          Cesium.Cartographic.fromDegrees(-109.0, 40.0)
     *                          ]),
     *          holes : [{
     *              positions : ellipsoid.cartographicArrayToCartesianArray(
     *                              [
     *                              Cesium.Cartographic.fromDegrees(-107.0, 31.0),
     *                              Cesium.Cartographic.fromDegrees(-107.0, 39.0),
     *                              Cesium.Cartographic.fromDegrees(-97.0, 39.0),
     *                              Cesium.Cartographic.fromDegrees(-97.0, 31.0)
     *                              ]),
     *              holes : [{
     *                  positions : ellipsoid.cartographicArrayToCartesianArray(
     *                                  [
     *                                  Cesium.Cartographic.fromDegrees(-105.0, 33.0),
     *                                  Cesium.Cartographic.fromDegrees(-99.0, 33.0),
     *                                  Cesium.Cartographic.fromDegrees(-99.0, 37.0),
     *                                  Cesium.Cartographic.fromDegrees(-105.0, 37.0)
     *                                  ]),
     *                  holes : [{
     *                      positions : ellipsoid.cartographicArrayToCartesianArray(
     *                                      [
     *                                      Cesium.Cartographic.fromDegrees(-103.0, 34.0),
     *                                      Cesium.Cartographic.fromDegrees(-101.0, 34.0),
     *                                      Cesium.Cartographic.fromDegrees(-101.0, 36.0),
     *                                      Cesium.Cartographic.fromDegrees(-103.0, 36.0)
     *                                      ])
     *                  }]
     *              }]
     *          }]
     *      },
     *      pickData : 'polygon3'
     *  });
     */
    var PolygonGeometry = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84);

        var meshes = [];
        var mesh;
        var boundingSphere;
        var i;
        var positions;
        var polygonHierarchy;

        if (typeof options.positions !== 'undefined') {
            // create from positions
            positions = options.positions;

            boundingSphere = BoundingSphere.fromPoints(positions);
            mesh = createMeshFromPositions(positions, boundingSphere);
            if (typeof mesh !== 'undefined') {
                meshes.push(mesh);
            }
        } else if (typeof options.polygonHierarchy !== 'undefined') {
            // create from a polygon hierarchy
            polygonHierarchy = options.polygonHierarchy;

            // Algorithm adapted from http://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
            var polygons = [];
            var queue = new Queue();
            queue.enqueue(polygonHierarchy);

            while (queue.length !== 0) {
                var outerNode = queue.dequeue();
                var outerRing = outerNode.positions;

                if (outerRing.length < 3) {
                    throw new DeveloperError('At least three positions are required.');
                }

                var numChildren = outerNode.holes ? outerNode.holes.length : 0;
                if (numChildren === 0) {
                    // The outer polygon is a simple polygon with no nested inner polygon.
                    polygons.push(outerNode.positions);
                } else {
                    // The outer polygon contains inner polygons
                    var holes = [];
                    for (i = 0; i < numChildren; i++) {
                        var hole = outerNode.holes[i];
                        holes.push(hole.positions);

                        var numGrandchildren = 0;
                        if (hole.holes) {
                            numGrandchildren = hole.holes.length;
                        }

                        for ( var j = 0; j < numGrandchildren; j++) {
                            queue.enqueue(hole.holes[j]);
                        }
                    }
                    var combinedPolygon = PolygonPipeline.eliminateHoles(outerRing, holes);
                    polygons.push(combinedPolygon);
                }
            }

            polygonHierarchy = polygons;

            var outerPositions =  polygonHierarchy[0];
            // The bounding volume is just around the boundary points, so there could be cases for
            // contrived polygons on contrived ellipsoids - very oblate ones - where the bounding
            // volume doesn't cover the polygon.
            boundingSphere = BoundingSphere.fromPoints(outerPositions);

            for (i = 0; i < polygonHierarchy.length; i++) {
                mesh = createMeshFromPositions(polygonHierarchy[i], boundingSphere);
                if (typeof mesh !== 'undefined') {
                    meshes.push(mesh);
                }
            }
        } else {
            throw new DeveloperError('positions or hierarchy must be supplied.');
        }

        var attributes = {};
        var indexLists = [];

        mesh = GeometryFilters.combine(meshes);
        mesh = PolygonPipeline.scaleToGeodeticHeight(mesh, defaultValue(options.height, 0.0), ellipsoid);

        attributes.position = new GeometryAttribute({
            componentDatatype : ComponentDatatype.FLOAT,
            componentsPerAttribute : 3,
            values : mesh.attributes.position.values
        });

        indexLists.push(
            new GeometryIndices({
                primitiveType : PrimitiveType.TRIANGLES,
                values : mesh.indexLists[0].values
        }));

        /**
         * An object containing {@link GeometryAttribute} properties named after each of the
         * <code>true</code> values of the {@link VertexFormat} option.
         *
         * @type Object
         */
        this.attributes = attributes;

        /**
         * An array of {@link GeometryIndices} defining primitives.
         *
         * @type Array
         */
        this.indexLists = indexLists;

        /**
         * A tight-fitting bounding sphere that encloses the vertices of the geometry.
         *
         * @type BoundingSphere
         */
        this.boundingSphere = boundingSphere;

        /**
         * The 4x4 transformation matrix that transforms the geometry from model to world coordinates.
         * When this is the identity matrix, the geometry is drawn in world coordinates, i.e., Earth's WGS84 coordinates.
         * Local reference frames can be used by providing a different transformation matrix, like that returned
         * by {@link Transforms.eastNorthUpToFixedFrame}.
         *
         * @type Matrix4
         */
        this.modelMatrix = defaultValue(options.modelMatrix, Matrix4.IDENTITY.clone());

        /**
         * DOC_TBA
         */
        this.pickData = options.pickData;
    };

    function createMeshFromPositions(positions, boundingSphere, outerPositions) {
        var cleanedPositions = PolygonPipeline.cleanUp(positions);
        if (cleanedPositions.length < 3) {
            // Duplicate positions result in not enough positions to form a polygon.
            return undefined;
        }

        var tangentPlane = EllipsoidTangentPlane.fromPoints(cleanedPositions, ellipsoid);
        var positions2D = tangentPlane.projectPointsOntoPlane(cleanedPositions);

        var originalWindingOrder = PolygonPipeline.computeWindingOrder2D(positions2D);
        if (originalWindingOrder === WindingOrder.CLOCKWISE) {
            positions2D.reverse();
            cleanedPositions.reverse();
        }
        var indices = PolygonPipeline.earClip2D(positions2D);
        // Checking bounding sphere with plane for quick reject
        var minX = boundingSphere.center.x - boundingSphere.radius;
        if ((minX < 0) && (BoundingSphere.intersect(boundingSphere, Cartesian4.UNIT_Y) === Intersect.INTERSECTING)) {
            indices = PolygonPipeline.wrapLongitude(cleanedPositions, indices);
        }
        var mesh = PolygonPipeline.computeSubdivision(cleanedPositions, indices);

        return mesh;
    }

    return PolygonGeometry;
});
