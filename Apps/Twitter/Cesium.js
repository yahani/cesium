/*global require*/
require({
    baseUrl : '../../Source'
}, ['Cesium', '../Apps/Twitter/Tweet'], function(Cesium, Tweet) {
    "use strict";
    //A real application should require only the subset of modules that
    //are actually used, instead of requiring the Cesium module, which
    //includes everything.

    var tweets = [];

    var canvas = document.getElementById('glCanvas');
    var ellipsoid = Cesium.Ellipsoid.WGS84; // Used in many Sandbox examples
    var scene = new Cesium.Scene(canvas);
    var primitives = scene.getPrimitives();

    // Bing Maps
    var bing = new Cesium.BingMapsTileProvider({
        server : 'dev.virtualearth.net',
        mapStyle : Cesium.BingMapsStyle.AERIAL,
        // Some versions of Safari support WebGL, but don't correctly implement
        // cross-origin image loading, so we need to load Bing imagery using a proxy.
        proxy : Cesium.FeatureDetection.supportsCrossOriginImagery() ? undefined : new Cesium.DefaultProxy('/proxy/')
    });

    var cb = new Cesium.CentralBody(ellipsoid);
    cb.dayTileProvider = bing;
    cb.nightImageSource = '../../Images/land_ocean_ice_lights_2048.jpg';
    cb.specularMapSource = '../../Images/earthspec1k.jpg';
    if (scene.getContext().getMaximumTextureSize() > 2048) {
        cb.cloudsMapSource = '../../Images/earthcloudmaptrans.jpg';
        cb.bumpMapSource = '../../Images/earthbump1k.jpg';
    }
    cb.showSkyAtmosphere = true;
    cb.showGroundAtmosphere = true;
    primitives.setCentralBody(cb);

    scene.getCamera().frustum.near = 10000.0;
    scene.getCamera().getControllers().addCentralBody();

    var transitioner = new Cesium.SceneTransitioner(scene, ellipsoid);

    ///////////////////////////////////////////////////////////////////////////
    // Add examples from the Sandbox here:
    var billboards = new Cesium.BillboardCollection(undefined);
    var image = new Image();
    image.onload = function() {
        var textureAtlas = scene.getContext().createTextureAtlas({image : image});
        billboards.setTextureAtlas(textureAtlas);
        primitives.add(billboards);
    };
    image.src = '../../Images/twitter-bird.png';
    var fileIndex = 0;
    $("#twitterSearch").submit( function() {
        var files = ['tweets.txt', 'NYtweets.txt', 'WorldTweets.txt'];
        $.ajax({
            url: files[(fileIndex++) % files.length],
            dataType: 'text',
            success: function(msg) {
                var json = JSON.parse(msg);
                tweets = [];
                for (var i = 0; i < json.length; i++) {
                    var t = json[i];
                    tweets.push(new Tweet(t.user_id, t.tweet_id, t.text, new Cesium.Cartographic.fromDegrees(t.longitude, t.latitude), t.time));
                }
                billboards.removeAll();
                for( i = 0; i < tweets.length; i++) {
                    billboards.add({
                        position : ellipsoid.cartographicToCartesian(tweets[i].position),
                        tweet : tweets[i],
                        imageIndex : 0
                    });
                }
            }
        });

        return false;
    });

    // If the mouse is over the billboard, change its scale and color
    var handler = new Cesium.EventHandler(scene.getCanvas());
    handler.setMouseAction(
        function (movement) {
            var pickedObject = scene.pick(movement.endPosition);
            var index = billboards._billboards.indexOf(pickedObject);
            if (index > -1) {
                document.getElementById('tweetAvatar').innerHTML = '<img src="' + tweets[index].getAvatar() + '"/>';
                document.getElementById('tweetName').innerHTML = tweets[index].getName();
                document.getElementById('tweetUsername').innerHTML = '(' + processTweetLinks('@' + tweets[index].getScreenName()) + ')';
                document.getElementById('tweetLocation').innerHTML = tweets[index].getLocation();
                document.getElementById('tweetText').innerHTML = processTweetLinks(tweets[index].text);
                document.getElementById('tweetTime').innerHTML = 'Posted at: <br/>' + '<a href="https://twitter.com/' + tweets[index].getScreenName() + '/status/' + tweets[index].tweetId + '">' + tweets[index].time + '</a>';
            }
        },
        Cesium.MouseEventType.MOVE
    );
    ///////////////////////////////////////////////////////////////////////////

    scene.setAnimation(function() {
        //scene.setSunPosition(scene.getCamera().position);
        scene.setSunPosition(Cesium.SunPosition.compute().position);

        // Add code here to update primitives based on changes to animation time, camera parameters, etc.
    });

    (function tick() {
        scene.render();
        Cesium.requestAnimationFrame(tick);
    }());

    ///////////////////////////////////////////////////////////////////////////
    // Example mouse & keyboard handlers

    var handler = new Cesium.EventHandler(canvas);

    handler.setMouseAction(function(movement) {
        /* ... */
        // Use movement.startPosition, movement.endPosition
    }, Cesium.MouseEventType.MOVE);

    function keydownHandler(e) {
        switch (e.keyCode) {
        case "3".charCodeAt(0): // "3" -> 3D globe
            cb.showSkyAtmosphere = true;
            cb.showGroundAtmosphere = true;
            transitioner.morphTo3D();
            break;
        case "2".charCodeAt(0): // "2" -> Columbus View
            cb.showSkyAtmosphere = false;
            cb.showGroundAtmosphere = false;
            transitioner.morphToColumbusView();
            break;
        case "1".charCodeAt(0): // "1" -> 2D map
            cb.showSkyAtmosphere = false;
            cb.showGroundAtmosphere = false;
            transitioner.morphTo2D();
            break;
        default:
            break;
        }
    }
    document.addEventListener('keydown', keydownHandler, false);

    canvas.oncontextmenu = function() {
        return false;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Example resize handler

    var onResize = function() {
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;

        if (canvas.width === width && canvas.height === height) {
            return;
        }

        canvas.width = width;
        canvas.height = height;

        scene.getContext().setViewport({
            x : 0,
            y : 0,
            width : width,
            height : height
        });

        scene.getCamera().frustum.aspectRatio = width / height;
    };
    window.addEventListener('resize', onResize, false);
    onResize();
});