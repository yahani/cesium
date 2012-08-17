/*global define*/
define(function() {
    "use strict";

    /**
     * Provides methods for working with a boolean defined in CZML.
     *
     * @exports CzmlBehavior
     *
     * @see DynamicProperty
     * @see CzmlCartesian2
     * @see CzmlCartesian3
     * @see CzmlCartographic
     * @see CzmlColor
     * @see CzmlHorizontalOrigin
     * @see CzmlLabelStyle
     * @see CzmlNumber
     * @see CzmlString
     * @see CzmlUnitCartesian3
     * @see CzmlUnitQuaternion
     * @see CzmlUnitSpherical
     * @see CzmlVerticalOrigin
     */
    var CzmlBehavior = {
        /**
         * Returns the packed boolean representation contained within the provided CZML interval
         * or undefined if the interval does not contain boolean data.
         *
         * @param {Object} czmlInterval The CZML interval to unwrap.
         */
        unwrapInterval : function(czmlInterval) {
            return czmlInterval.content;
        },

        /**
         * Since CZML booleans can not be sampled, this method always returns false.
         */
        isSampled : function() {
            return false;
        },

        /**
         * Returns the boolean value contained within the unwrappedInterval.  For booleans
         * this is the unwrappedInterval itself.
         *
         * @param {Object} unwrappedInterval The result of CzmlBehavior.unwrapInterval.
         * @returns The boolean value.
         */
        getValue : function(unwrappedInterval) {
            return unwrappedInterval;
        }
    };

    return CzmlBehavior;
});