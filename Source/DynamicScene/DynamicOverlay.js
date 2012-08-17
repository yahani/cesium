/*global define*/
define([
        '../Core/TimeInterval',
        './CzmlCartesian2',
        './CzmlString',
        './CzmlHorizontalOrigin',
        './CzmlVerticalOrigin',
        './CzmlOverlayOrigin',
        './DynamicProperty'
       ], function(
        TimeInterval,
        CzmlCartesian2,
        CzmlString,
        CzmlHorizontalOrigin,
        CzmlVerticalOrigin,
        CzmlOverlayOrigin,
        DynamicProperty) {
    "use strict";

    /**
     * Represents a time-dynamic label, typically used in conjunction with DynamicOverlayVisualizer and
     * DynamicObjectCollection to visualize CZML.
     *
     * @alias DynamicOverlay
     * @constructor
     *
     * @see DynamicObject
     * @see DynamicProperty
     * @see DynamicObjectCollection
     * @see DynamicOverlayVisualizer
     * @see VisualizerCollection
     * @see Label
     * @see LabelCollection
     * @see CzmlDefaults
     */
    var DynamicOverlay = function() {
        this.content = undefined;
        this.origin = undefined;
        this.offset = undefined;
        this.horizontalOrigin = undefined;
        this.verticalOrigin = undefined;
    };

    /**
     * Processes a single CZML packet and merges its data into the provided DynamicObject's label.
     * If the DynamicObject does not have a label, one is created.  This method is not
     * normally called directly, but is part of the array of CZML processing functions that is
     * passed into the DynamicObjectCollection constructor.
     *
     * @param {DynamicObject} dynamicObject The DynamicObject which will contain the label data.
     * @param {Object} packet The CZML packet to process.
     * @returns {Boolean} true if any new properties were created while processing the packet, false otherwise.
     *
     * @see DynamicObject
     * @see DynamicProperty
     * @see DynamicObjectCollection
     * @see CzmlDefaults#updaters
     */
    DynamicOverlay.processCzmlPacket = function(dynamicObject, packet) {
        var overlayData = packet.overlay;
        if (typeof overlayData === 'undefined') {
            return false;
        }

        var overlayUpdated = false;
        var overlay = dynamicObject.overlay;
        overlayUpdated = typeof overlay === 'undefined';
        if (overlayUpdated) {
            dynamicObject.overlay = overlay = new DynamicOverlay();
        }

        var interval = overlayData.interval;
        if (typeof interval !== 'undefined') {
            interval = TimeInterval.fromIso8601(interval);
        }

        if (typeof overlayData.content !== 'undefined') {
            var content = overlay.content;
            if (typeof content === 'undefined') {
                overlay.content = content = new DynamicProperty(CzmlString);
                overlayUpdated = true;
            }
            content.processCzmlIntervals(overlayData.content, interval);
        }

        if (typeof overlayData.origin !== 'undefined') {
            var origin = overlay.origin;
            if (typeof origin === 'undefined') {
                overlay.origin = origin = new DynamicProperty(CzmlOverlayOrigin);
                overlayUpdated = true;
            }
            origin.processCzmlIntervals(overlayData.origin, interval);
        }

        if (typeof overlayData.offset !== 'undefined') {
            var offset = overlay.offset;
            if (typeof offset === 'undefined') {
                overlay.offset = offset = new DynamicProperty(CzmlCartesian2);
                overlayUpdated = true;
            }
            offset.processCzmlIntervals(overlayData.offset, interval);
        }

        if (typeof overlayData.horizontalOrigin !== 'undefined') {
            var horizontalOrigin = overlay.horizontalOrigin;
            if (typeof horizontalOrigin === 'undefined') {
                overlay.horizontalOrigin = horizontalOrigin = new DynamicProperty(CzmlHorizontalOrigin);
                overlayUpdated = true;
            }
            horizontalOrigin.processCzmlIntervals(overlayData.horizontalOrigin, interval);
        }

        if (typeof overlayData.verticalOrigin !== 'undefined') {
            var verticalOrigin = overlay.verticalOrigin;
            if (typeof verticalOrigin === 'undefined') {
                overlay.verticalOrigin = verticalOrigin = new DynamicProperty(CzmlVerticalOrigin);
                overlayUpdated = true;
            }
            verticalOrigin.processCzmlIntervals(overlayData.verticalOrigin, interval);
        }

        return overlayUpdated;
    };

    /**
     * Given two DynamicObjects, takes the label properties from the second
     * and assigns them to the first, assuming such a property did not already exist.
     * This method is not normally called directly, but is part of the array of CZML processing
     * functions that is passed into the CompositeDynamicObjectCollection constructor.
     *
     * @param {DynamicObject} targetObject The DynamicObject which will have properties merged onto it.
     * @param {DynamicObject} objectToMerge The DynamicObject containing properties to be merged.
     *
     * @see CzmlDefaults
     */
    DynamicOverlay.mergeProperties = function(targetObject, objectToMerge) {
        var overlayToMerge = objectToMerge.overlay;
        if (typeof overlayToMerge !== 'undefined') {

            var targetOverlay = targetObject.overlay;
            if (typeof targetOverlay === 'undefined') {
                targetObject.overlay = targetOverlay = new DynamicOverlay();
            }

            targetOverlay.content = targetOverlay.content || overlayToMerge.content;
            targetOverlay.origin = targetOverlay.origin || overlayToMerge.origin;
            targetOverlay.offset = targetOverlay.offset || overlayToMerge.offset;
        }
    };

    /**
     * Given a DynamicObject, undefines the label associated with it.
     * This method is not normally called directly, but is part of the array of CZML processing
     * functions that is passed into the CompositeDynamicObjectCollection constructor.
     *
     * @param {DynamicObject} dynamicObject The DynamicObject to remove the label from.
     *
     * @see CzmlDefaults
     */
    DynamicOverlay.undefineProperties = function(dynamicObject) {
        dynamicObject.overlay = undefined;
    };

    return DynamicOverlay;
});