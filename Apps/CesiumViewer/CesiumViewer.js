/*global define*/
define([
    'dojo/dom',
    'dojo/on',
    'dojo/ready',
    'dojo/io-query',
    'Widgets/Dojo/CesiumViewerWidget',
    'Core/Matrix3',
    'Core/Matrix4',
    'Core/Cartesian3',
    'Core/Quaternion',
    'Scene/Model',
    'Scene/RectangularPyramidSensorVolume'
], function(
    dom,
    on,
    ready,
    ioQuery,
    CesiumViewerWidget,
    Matrix3,
    Matrix4,
    Cartesian3,
    Quaternion,
    Model,
    RectangularPyramidSensorVolume
) {
    "use strict";
    /*global console*/

    ready(function() {
        var endUserOptions = {};
        if (window.location.search) {
            endUserOptions = ioQuery.queryToObject(window.location.search.substring(1));
        }

        var widget = new CesiumViewerWidget({
            endUserOptions : endUserOptions,
            enableDragDrop : true
        });
        widget.placeAt(dom.byId('cesiumContainer'));

        widget.startup();

//        var model = new Model('../../../Apps/CesiumViewer/Gallery/Models/_RQ-1_Predator/model0.json');
//        //var model = new Model('../../../Apps/CesiumViewer/Gallery/Models/duck/duck.json');                     // OK
//
//        var position = {
//            x : 1536104.718843187,
//            y : -4463497.632960353,
//            z : 4274941.639393189
//        };
//
//        var orientation = new Quaternion(
//                -0.525425180643139, -0.742614525249509, -0.234795236519538, 0.342524806900618
//                //0.742614525249509, -0.525425180643139, 0.342524806900618, 0.234795236519538
//                //-0.234795236519538, 0.342524806900618, 0.525425180643139, 0.742614525249509
//        ).conjugate();
//
//        //Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation), position, model.modelMatrix);
//        model.scale = 1.0;
//        model.modelMatrix = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation), position);
//
//        var scene = widget.scene;
//        scene.getPrimitives().add(model);

//        var rotate = new Matrix4(
//                1.0, 0.0, 0.0, 0.0,
//                0.0, Math.cos(-Math.PI / 2.0), -Math.sin(-Math.PI / 2.0), 0.0,
//                0.0, Math.sin(-Math.PI / 2.0), Math.cos(-Math.PI / 2.0), 0.0,
//                0.0, 0.0, 0.0, 1.0);
//        model.modelMatrix = Matrix4.multiply(model.modelMatrix,  rotate);
//         rotate = new Matrix4(
//                Math.cos(-Math.PI / 2.0), 0.0, Math.sin(-Math.PI / 2.0), 0.0,
//                0.0, 1.0, 0.0, 0.0,
//                -Math.sin(-Math.PI / 2.0), 0.0, Math.cos(-Math.PI / 2.0), 0.0,
//                0.0, 0.0, 0.0, 1.0);
//      model.modelMatrix = Matrix4.multiply(model.modelMatrix,  rotate);
//      rotate = new Matrix4(
//              1.0, 0.0, 0.0, 0.0,
//              0.0, Math.cos(-Math.PI / 2.0), -Math.sin(-Math.PI / 2.0), 0.0,
//              0.0, Math.sin(-Math.PI / 2.0), Math.cos(-Math.PI / 2.0), 0.0,
//              0.0, 0.0, 0.0, 1.0);
//      model.modelMatrix = Matrix4.multiply(model.modelMatrix,  rotate);

//      var rotation = new Matrix4(0, 1,  0, 0,
//                                 1, 0,  0, 0,
//                                 0, 0, -1, 0,
//                                 0, 0,  0, 1);

      //Matrix4.multiply(Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation), position), rotation, model.modelMatrix);

        //scene.getPrimitives().add(f);
//        var scene = widget.scene;
////        scene.getContext().setValidateShaderProgram(true);
////        scene.getContext().setValidateFramebuffer(true);
////        scene.getContext().setLogShaderCompilation(true);
////        scene.getContext().setThrowOnWebGLError(true);
//
//        var primitives = scene.getPrimitives();
//
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_Internet Man 2/Internet Man.json'); // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_A320-200/models/untitled.json');    // OK.  Needs nodes combined.
//
//        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_FA-18_Hornet/model0.json');         // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_M1A2_Abrams/model0.json');          // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_M1043_HMMWV/model0.json');          // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_C-130-Hercules/model0.json');       // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_Ford_Contour_Sedan/model0.json');   // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/_RQ-1_Predator/model0.json');        // OK
//
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/duck/duck.json');                     // OK
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/rambler/Rambler.json');               // Can't invert matrix
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/SuperMurdoch/SuperMurdoch.json');     // OK. scale = 9000.0.
////        var m = new Model('../../../Apps/CesiumViewer/Gallery/Models/wine/wine.json');                     // OK.
//
//        m.scale = 900000.0;
////        m.modelMatrix = Matrix4.fromTranslation(new Cartesian3(8000000.0, 0.0, 0.0));
//        primitives.add(m);
//        scene.getPrimitives().setCentralBody(undefined);
    });
});
