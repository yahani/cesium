/*global define*/
define([
        '../Core/defaultValue',
        '../Core/DeveloperError',
        '../Core/destroyObject',
        '../Core/Matrix3',
        '../Core/Matrix4',
        '../Scene/EllipsoidPrimitive',
        '../Scene/Material'
    ], function(
        defaultValue,
        DeveloperError,
        destroyObject,
        Matrix3,
        Matrix4,
        EllipsoidPrimitive,
        Material) {
    "use strict";

    var matrix3Scratch = new Matrix3();

    /**
     * A DynamicObject visualizer which maps the DynamicEllipsoid instance
     * in DynamicObject.ellipsoid to a Ellipsoid primitive.
     * @alias DynamicEllipsoidVisualizer
     * @constructor
     *
     * @param {Scene} scene The scene the primitives will be rendered in.
     * @param {DynamicObjectCollection} [dynamicObjectCollection] The dynamicObjectCollection to visualize.
     *
     * @exception {DeveloperError} scene is required.
     *
     * @see DynamicEllipsoid
     * @see Scene
     * @see DynamicObject
     * @see DynamicObjectCollection
     * @see CompositeDynamicObjectCollection
     * @see VisualizerCollection
     * @see DynamicBillboardVisualizer
     * @see DynamicConeVisualizer
     * @see DynamicConeVisualizerUsingCustomSensorr
     * @see DynamicLabelVisualizer
     * @see DynamicPointVisualizer
     * @see DynamicPolygonVisualizer
     * @see DynamicPolylineVisualizer
     */
    var DynamicEllipsoidVisualizer = function(scene, dynamicObjectCollection) {
        if (typeof scene === 'undefined') {
            throw new DeveloperError('scene is required.');
        }
        this._scene = scene;
        this._unusedIndexes = [];
        this._primitives = scene.getPrimitives();
        this._ellipsoidCollection = [];
        this._dynamicObjectCollection = undefined;
        this.setDynamicObjectCollection(dynamicObjectCollection);
    };

    /**
     * Returns the scene being used by this visualizer.
     *
     * @returns {Scene} The scene being used by this visualizer.
     */
    DynamicEllipsoidVisualizer.prototype.getScene = function() {
        return this._scene;
    };

    /**
     * Gets the DynamicObjectCollection being visualized.
     *
     * @returns {DynamicObjectCollection} The DynamicObjectCollection being visualized.
     */
    DynamicEllipsoidVisualizer.prototype.getDynamicObjectCollection = function() {
        return this._dynamicObjectCollection;
    };

    /**
     * Sets the DynamicObjectCollection to visualize.
     *
     * @param dynamicObjectCollection The DynamicObjectCollection to visualizer.
     */
    DynamicEllipsoidVisualizer.prototype.setDynamicObjectCollection = function(dynamicObjectCollection) {
        var oldCollection = this._dynamicObjectCollection;
        if (oldCollection !== dynamicObjectCollection) {
            if (typeof oldCollection !== 'undefined') {
                oldCollection.objectsRemoved.removeEventListener(DynamicEllipsoidVisualizer.prototype._onObjectsRemoved, this);
                this.removeAllPrimitives();
            }
            this._dynamicObjectCollection = dynamicObjectCollection;
            if (typeof dynamicObjectCollection !== 'undefined') {
                dynamicObjectCollection.objectsRemoved.addEventListener(DynamicEllipsoidVisualizer.prototype._onObjectsRemoved, this);
            }
        }
    };

    /**
     * Updates all of the primitives created by this visualizer to match their
     * DynamicObject counterpart at the given time.
     *
     * @param {JulianDate} time The time to update to.
     *
     * @exception {DeveloperError} time is required.
     */
    DynamicEllipsoidVisualizer.prototype.update = function(time) {
        if (typeof time === 'undefined') {
            throw new DeveloperError('time is requied.');
        }
        if (typeof this._dynamicObjectCollection !== 'undefined') {
            var dynamicObjects = this._dynamicObjectCollection.getObjects();
            for ( var i = 0, len = dynamicObjects.length; i < len; i++) {
                updateObject(this, time, dynamicObjects[i]);
            }
        }
    };

    /**
     * Removes all primitives from the scene.
     */
    DynamicEllipsoidVisualizer.prototype.removeAllPrimitives = function() {
        var i, len;
        for (i = 0, len = this._ellipsoidCollection.length; i < len; i++) {
            this._primitives.remove(this._ellipsoidCollection[i]);
        }

        if (typeof this._dynamicObjectCollection !== 'undefined') {
            var dynamicObjects = this._dynamicObjectCollection.getObjects();
            for (i = dynamicObjects.length - 1; i > -1; i--) {
                dynamicObjects[i]._ellipsoidVisualizerIndex = undefined;
            }
        }

        this._unusedIndexes = [];
        this._ellipsoidCollection = [];
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @memberof DynamicEllipsoidVisualizer
     *
     * @return {Boolean} True if this object was destroyed; otherwise, false.
     *
     * @see DynamicEllipsoidVisualizer#destroy
     */
    DynamicEllipsoidVisualizer.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @memberof DynamicEllipsoidVisualizer
     *
     * @return {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see DynamicEllipsoidVisualizer#isDestroyed
     *
     * @example
     * visualizer = visualizer && visualizer.destroy();
     */
    DynamicEllipsoidVisualizer.prototype.destroy = function() {
        this.removeAllPrimitives();
        return destroyObject(this);
    };

    var position;
    var orientation;
    function updateObject(dynamicEllipsoidVisualizer, time, dynamicObject) {
        var context = dynamicEllipsoidVisualizer._scene.getContext();
        var dynamicEllipsoid = dynamicObject.ellipsoid;
        if (typeof dynamicEllipsoid === 'undefined') {
            return;
        }

        var radiiProperty = dynamicEllipsoid.radii;
        if (typeof radiiProperty === 'undefined') {
            return;
        }

        var positionProperty = dynamicObject.position;
        if (typeof positionProperty === 'undefined') {
            return;
        }

        var orientationProperty = dynamicObject.orientation;
        if (typeof orientationProperty === 'undefined') {
            return;
        }

        var ellipsoid;
        var showProperty = dynamicEllipsoid.show;
        var ellipsoidVisualizerIndex = dynamicObject._ellipsoidVisualizerIndex;
        var show = dynamicObject.isAvailable(time) && (typeof showProperty === 'undefined' || showProperty.getValue(time));

        if (!show) {
            //don't bother creating or updating anything else
            if (typeof ellipsoidVisualizerIndex !== 'undefined') {
                ellipsoid = dynamicEllipsoidVisualizer._ellipsoidCollection[ellipsoidVisualizerIndex];
                ellipsoid.show = false;
                dynamicObject._ellipsoidVisualizerIndex = undefined;
                dynamicEllipsoidVisualizer._unusedIndexes.push(ellipsoidVisualizerIndex);
            }
            return;
        }

        if (typeof ellipsoidVisualizerIndex === 'undefined') {
            var unusedIndexes = dynamicEllipsoidVisualizer._unusedIndexes;
            var length = unusedIndexes.length;
            if (length > 0) {
                ellipsoidVisualizerIndex = unusedIndexes.pop();
                ellipsoid = dynamicEllipsoidVisualizer._ellipsoidCollection[ellipsoidVisualizerIndex];
            } else {
                ellipsoidVisualizerIndex = dynamicEllipsoidVisualizer._ellipsoidCollection.length;
                ellipsoid = new EllipsoidPrimitive();

                dynamicEllipsoidVisualizer._ellipsoidCollection.push(ellipsoid);
                dynamicEllipsoidVisualizer._primitives.add(ellipsoid);
            }
            dynamicObject._ellipsoidVisualizerIndex = ellipsoidVisualizerIndex;
            ellipsoid.dynamicObject = dynamicObject;

            ellipsoid.material = Material.fromType(context, Material.ColorType);
        } else {
            ellipsoid = dynamicEllipsoidVisualizer._ellipsoidCollection[ellipsoidVisualizerIndex];
        }

        ellipsoid.show = true;

        ellipsoid.radii = radiiProperty.getValue(time, ellipsoid.radii);

        position = defaultValue(positionProperty.getValueCartesian(time, position), ellipsoid._visualizerPosition);
        orientation = defaultValue(orientationProperty.getValue(time, orientation), ellipsoid._visualizerOrientation);

        if (typeof position !== 'undefined' &&
            typeof orientation !== 'undefined' &&
            (!position.equals(ellipsoid._visualizerPosition) ||
             !orientation.equals(ellipsoid._visualizerOrientation))) {
            Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation, matrix3Scratch), position, ellipsoid.modelMatrix);
            ellipsoid._visualizerPosition = position.clone(ellipsoid._visualizerPosition);
            ellipsoid._visualizerOrientation = orientation.clone(ellipsoid._visualizerOrientation);
        }

        var material = dynamicEllipsoid.material;
        if (typeof material !== 'undefined') {
            ellipsoid.material = material.getValue(time, context, ellipsoid.material);
        }
    }

    DynamicEllipsoidVisualizer.prototype._onObjectsRemoved = function(dynamicObjectCollection, dynamicObjects) {
        var thisEllipsoidCollection = this._ellipsoidCollection;
        var thisUnusedIndexes = this._unusedIndexes;
        for ( var i = dynamicObjects.length - 1; i > -1; i--) {
            var dynamicObject = dynamicObjects[i];
            var ellipsoidVisualizerIndex = dynamicObject._ellipsoidVisualizerIndex;
            if (typeof ellipsoidVisualizerIndex !== 'undefined') {
                var ellipsoid = thisEllipsoidCollection[ellipsoidVisualizerIndex];
                ellipsoid.show = false;
                thisUnusedIndexes.push(ellipsoidVisualizerIndex);
                dynamicObject._ellipsoidVisualizerIndex = undefined;
            }
        }
    };

    return DynamicEllipsoidVisualizer;
});