/*global define*/
define([
        'require',
        '../Core/DeveloperError',
        '../Core/destroyObject',
        '../Core/Color',
        '../Core/Matrix4',
        '../Core/Transforms',
        '../Scene/HorizontalOrigin',
        '../Scene/OverlayOrigin',
        '../Scene/PolylineCollection',
        '../Scene/VerticalOrigin',
        './DynamicObjectCollection'
       ], function(
         require,
         DeveloperError,
         destroyObject,
         Color,
         Matrix4,
         Transforms,
         HorizontalOrigin,
         OverlayOrigin,
         PolylineCollection,
         VerticalOrigin,
         DynamicObjectCollection) {
    "use strict";

    var processCzml = function(arg1, arg2)
    {
        var func = require('./processCzml');
        processCzml = func;
        processCzml(arg1, arg2);
    };

    /**
     * A DynamicObject visualizer which maps the DynamicOverlay instance
     * in DynamicObject.polyline to a Polyline primitive.
     * @alias DynamicOverlayVisualizer
     * @constructor
     *
     * @param {Scene} scene The scene the primitives will be rendered in.
     * @param {DynamicObjectCollection} [dynamicObjectCollection] The dynamicObjectCollection to visualize.
     *
     * @exception {DeveloperError} scene is required.
     *
     * @see DynamicOverlay
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
     * @see DynamicPyramidVisualizer
     *
     */
    var DynamicOverlayVisualizer = function(scene, dynamicObjectCollection) {
        this._scene = scene;
        this._dynamicObjectCollection = undefined;
        this.setDynamicObjectCollection(dynamicObjectCollection);
    };

    /**
     * Returns the scene being used by this visualizer.
     *
     * @returns {Scene} The scene being used by this visualizer.
     */
    DynamicOverlayVisualizer.prototype.getScene = function() {
        return this._scene;
    };

    /**
     * Gets the DynamicObjectCollection being visualized.
     *
     * @returns {DynamicObjectCollection} The DynamicObjectCollection being visualized.
     */
    DynamicOverlayVisualizer.prototype.getDynamicObjectCollection = function() {
        return this._dynamicObjectCollection;
    };

    /**
     * Sets the DynamicObjectCollection to visualize.
     *
     * @param dynamicObjectCollection The DynamicObjectCollection to visualizer.
     */
    DynamicOverlayVisualizer.prototype.setDynamicObjectCollection = function(dynamicObjectCollection) {
        var oldCollection = this._dynamicObjectCollection;
        if (oldCollection !== dynamicObjectCollection) {
            if (typeof oldCollection !== 'undefined') {
                oldCollection.objectsRemoved.removeEventListener(DynamicOverlayVisualizer.prototype._onObjectsRemoved);
                this.removeAllPrimitives();
            }
            this._dynamicObjectCollection = dynamicObjectCollection;
            if (typeof dynamicObjectCollection !== 'undefined') {
                dynamicObjectCollection.objectsRemoved.addEventListener(DynamicOverlayVisualizer.prototype._onObjectsRemoved, this);
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
    DynamicOverlayVisualizer.prototype.update = function(time) {
        if (typeof time === 'undefined') {
            throw new DeveloperError('time is requied.');
        }
        if (typeof this._dynamicObjectCollection !== 'undefined') {
            var dynamicObjects = this._dynamicObjectCollection.getObjects();
            for ( var i = 0, len = dynamicObjects.length; i < len; i++) {
                this._updateObject(time, dynamicObjects[i]);
            }
        }
    };

    /**
     * Removes all primitives from the scene.
     */
    DynamicOverlayVisualizer.prototype.removeAllPrimitives = function() {
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @memberof DynamicOverlayVisualizer
     *
     * @return {Boolean} True if this object was destroyed; otherwise, false.
     *
     * @see DynamicOverlayVisualizer#destroy
     */
    DynamicOverlayVisualizer.prototype.isDestroyed = function() {
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
     * @memberof DynamicOverlayVisualizer
     *
     * @return {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see DynamicOverlayVisualizer#isDestroyed
     *
     * @example
     * visualizer = visualizer && visualizer.destroy();
     */
    DynamicOverlayVisualizer.prototype.destroy = function() {
        this.removeAllPrimitives();
        return destroyObject(this);
    };

    var urlTemplatePlaceHolderPattern = /`[^`]*`/;

    DynamicOverlayVisualizer.prototype._updateObject = function(time, dynamicObject) {
        var overlayDiv = dynamicObject._overlayDiv;
        var dynamicOverlay = dynamicObject.overlay;
        if (typeof dynamicOverlay === 'undefined') {
            if (typeof overlayDiv !== 'undefined') {
                overlayDiv.parentNode.removeChild(overlayDiv);
                dynamicObject._overlayDiv = undefined;
                dynamicObject._overlayContent = undefined;
            }
            return;
        }

        var contentProperty = dynamicOverlay.content;
        if (typeof contentProperty === 'undefined') {
            return;
        }

        var showProperty = dynamicOverlay.show;
        var show = dynamicObject.isAvailable(time) && (typeof showProperty === 'undefined' || showProperty.getValue(time));

        if (!show) {
            //don't bother creating or updating anything else
            if (typeof overlayDiv !== 'undefined') {
                overlayDiv.style.display = 'none';
                dynamicObject._overlayDiv = undefined;
            }
            return;
        }

        if (typeof overlayDiv === 'undefined') {
            overlayDiv = document.createElement('div');
            dynamicObject._overlayDiv = overlayDiv;
            //overlayDiv.id = dynamicObject.id;
            overlayDiv.style.position='absolute';
            overlayDiv.style.left='0px';
            overlayDiv.style.top='0px';
            var canvasContainer = this._scene.getCanvas().parentElement;
            canvasContainer.appendChild(overlayDiv);
        }

        var content = contentProperty.getValue(time);
        if (dynamicObject._overlayContent !== content) {
            overlayDiv.innerHTML = content;
            dynamicObject._overlayContent = content;

            var goButtonProperty = dynamicOverlay.goButton;
            var goTemplateProperty = dynamicOverlay.goTemplate;
            if (typeof goButtonProperty !== 'undefined' && typeof goTemplateProperty !== 'undefined') {
                var goButton = document.getElementById(goButtonProperty.getValue(time));
                var goTemplate = goTemplateProperty.getValue(time);
                var that = this;
                goButton.onclick = function() {
                    var nextPlaceholder = urlTemplatePlaceHolderPattern.exec(goTemplate);
                    while (nextPlaceholder !== null) {
                        nextPlaceholder = nextPlaceholder[0];
                        var placeholderName = nextPlaceholder.substring(1, nextPlaceholder.length - 1);
                        var substitute = placeholderName;
                        switch (placeholderName) {
                        case 'selectedObjectID':
                            substitute = that.widget.selectedObject.dynamicObject.id;
                            break;
                        case 'timelineStart':
                            substitute = that.widget.timelineControl._startJulian.getTotalDays();
                            break;
                        case 'timelineStop':
                            substitute = that.widget.timelineControl._endJulian.getTotalDays();
                            break;
                        default:
                            substitute = document.getElementById(placeholderName).value;
                            break;
                        }
                        goTemplate = goTemplate.replace(nextPlaceholder, substitute);
                        nextPlaceholder = urlTemplatePlaceHolderPattern.exec(goTemplate);
                    }

                    var request = new XMLHttpRequest();
                    request.open('GET', goTemplate, true);
                    request.onload = function(e) {
                        var collections = that._dynamicObjectCollection.getCollections();
                        var newGuy = new DynamicObjectCollection();
                        collections.push(newGuy);
                        that._dynamicObjectCollection.setCollections(collections);
                        processCzml(JSON.parse(request.response), newGuy);
                        if (that.widget.selectedObject.dynamicObject === dynamicObject) {
                            that.widget.setSelectedObject(undefined);
                        }
                    };
                    request.send();
                };
            }
        }

        var origin;
        var property = dynamicOverlay.origin;
        if (typeof property !== 'undefined') {
            origin = property.getValue(time);
        }

        if (typeof origin === 'undefined') {
            origin = OverlayOrigin.TOP_LEFT;
        }

        var left = 0;
        var top = 0;

        if (origin === OverlayOrigin.OBJECT) {
            property = dynamicObject.position;
            if (typeof property !== 'undefined') {
                var position = property.getValueCartesian(time);
                var camera = this._scene.getCamera();
                var projection = camera.frustum.getProjectionMatrix();
                var view = camera.getViewMatrix();
                var viewProjection = Matrix4.multiply(projection, view);
                var context = this._scene.getContext();
                var viewport = context.getViewport();
                var viewportTransform = Matrix4.computeViewportTransformation(viewport, 0.0, 1.0);
                var windowCoordinates = Transforms.pointToWindowCoordinates(viewProjection, viewportTransform, position);
                left = windowCoordinates.x;
                top = viewport.height - windowCoordinates.y;
            }
        }

        property = dynamicOverlay.horizontalOrigin;
        if (typeof property !== 'undefined') {
            var horizontalOrigin = property.getValue(time);
            if (typeof horizontalOrigin !== 'undefined') {
                switch (horizontalOrigin) {
                case HorizontalOrigin.LEFT:
                    break;
                case HorizontalOrigin.RIGHT:
                    left -= overlayDiv.clientWidth;
                    break;
                case HorizontalOrigin.CENTER:
                    left -= overlayDiv.clientWidth / 2;
                    break;
                }
            }
        }

        property = dynamicOverlay.verticalOrigin;
        if (typeof property !== 'undefined') {
            var verticalOrigin = property.getValue(time);
            if (typeof verticalOrigin !== 'undefined') {
                switch (verticalOrigin) {
                case VerticalOrigin.TOP:
                    break;
                case VerticalOrigin.BOTTOM:
                    top -= overlayDiv.clientHeight;
                    break;
                case VerticalOrigin.CENTER:
                    top -= overlayDiv.clientHeight / 2;
                    break;
                }
            }
        }

        property = dynamicOverlay.offset;
        if (typeof property !== 'undefined') {
            var offset = property.getValue(time);
            if (typeof offset !== 'undefined') {
                left += offset.x;
                top += offset.y;
            }
        }

        overlayDiv.style.left = left + 'px';
        overlayDiv.style.top = top + 'px';
    };

    DynamicOverlayVisualizer.prototype._onObjectsRemoved = function(dynamicObjectCollection, dynamicObjects) {
        for ( var i = dynamicObjects.length - 1; i > -1; i--) {
            var dynamicObject = dynamicObjects[i];
            var div = dynamicObject._overlayDiv;
            if (typeof div !== 'undefined') {
                div.parentNode.removeChild(div);
                dynamicObject._overlayDiv = undefined;
            }
        }
    };

    return DynamicOverlayVisualizer;
});