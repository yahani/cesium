/*global define*/
define([
        '../Core/TimeInterval',
        './CzmlBehavior',
        './DynamicProperty'
    ], function(
        TimeInterval,
        CzmlBehavior,
        DynamicProperty) {
    "use strict";

    var WhenSelected = function() {
        this.czml = undefined;
    };

    WhenSelected.processCzmlPacket = function(dynamicObject, packet, dynamicObjectCollection, sourceUri) {
        var whenSelectedData = packet.whenSelected;
        if (typeof whenSelectedData === 'undefined') {
            return false;
        }

        var whenSelectedUpdated = false;
        var whenSelected = dynamicObject.whenSelected;
        whenSelectedUpdated = typeof whenSelected === 'undefined';
        if (whenSelectedUpdated) {
            dynamicObject.whenSelected = whenSelected = new WhenSelected();
        }

        var interval = whenSelectedData.interval;
        if (typeof interval !== 'undefined') {
            interval = TimeInterval.fromIso8601(interval);
        }

        if (typeof whenSelectedData.czml !== 'undefined') {
            var czml = whenSelected.czml;
            if (typeof czml === 'undefined') {
                whenSelected.czml = czml = new DynamicProperty(CzmlBehavior);
                whenSelectedUpdated = true;
            }
            czml.processCzmlIntervals(whenSelectedData.czml, interval);
        }
        return whenSelectedUpdated;
    };

    WhenSelected.mergeProperties = function(targetObject, objectToMerge) {
        var whenSelectedToMerge = objectToMerge.whenSelected;
        if (typeof whenSelectedToMerge !== 'undefined') {

            var targetwhenSelected = targetObject.whenSelected;
            if (typeof targetwhenSelected === 'undefined') {
                targetObject.whenSelected = targetwhenSelected = new WhenSelected();
            }

            targetwhenSelected.czml = targetwhenSelected.czml || whenSelectedToMerge.czml;
        }
    };

    WhenSelected.undefineProperties = function(dynamicObject) {
        dynamicObject.whenSelected = undefined;
    };

    return WhenSelected;
});