/*global define*/
define([
        '../Scene/OverlayOrigin'
       ], function(
         OverlayOrigin) {
    "use strict";

    /**
     * Provides methods for working with a overlay origin defined in CZML.
     *
     * @exports CzmlOverlayOrigin
     *
     * @see OverlayOrigin
     * @see DynamicProperty
     * @see CzmlBoolean
     * @see CzmlCartesian2
     * @see CzmlCartesian3
     * @see CzmlCartographic
     * @see CzmlColor
     * @see CzmlLabelStyle
     * @see CzmlNumber
     * @see CzmlString
     * @see CzmlUnitCartesian3
     * @see CzmlUnitQuaternion
     * @see CzmlUnitSpherical
     * @see CzmlVerticalOrigin
     */
    var CzmlOverlayOrigin = {
        /**
         * Returns the packed enum representation contained within the provided CZML interval
         * or undefined if the interval does not contain enum data.
         *
         * @param {Object} czmlInterval The CZML interval to unwrap.
         */
        unwrapInterval : function(czmlInterval) {
            var result = czmlInterval.overlayOrigin;
            return typeof result === 'undefined' ? czmlInterval : result;
        },

        /**
         * Since enums can not be sampled, this method always returns false.
         */
        isSampled : function() {
            return false;
        },

        /**
         * Returns the OverlayOrigin contained within the unwrappedInterval.
         *
         * @param {Object} unwrappedInterval The result of CzmlOverlayOrigin.unwrapInterval.
         * @returns The OverlayOrigin value.
         */
        getValue : function(unwrappedInterval) {
            return OverlayOrigin[unwrappedInterval];
        }
    };

    return CzmlOverlayOrigin;
});