/*global define*/
define(['../Core/Enumeration'], function(Enumeration) {
    "use strict";

    /**
     * The horizontal location of an origin relative to an object, e.g., a {@link Billboard}.
     * For example, the horizontal origin is used to display a billboard to the left or right (in
     * screen space) of the actual position.
     *
     * @exports OverlayOrigin
     *
     * @see Billboard#setOverlayOrigin
     */
    var OverlayOrigin = {
        /**
         * The origin is at the horizontal center of the object.
         *
         * @constant
         * @type {Enumeration}
         */
        TOP_LEFT : new Enumeration(0, 'TOP_LEFT'),
        LOWER_RIGHT : new Enumeration(1, 'LOWER_RIGHT'),
        OBJECT : new Enumeration(2, 'OBJECT')
    };

    return OverlayOrigin;
});