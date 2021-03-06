/*global defineSuite*/
defineSuite([
             'Core/loadImageViaBlob',
             'ThirdParty/when'
            ], function(
             loadImageViaBlob,
             when) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2Nk+M/wHwAEBgIA5agATwAAAABJRU5ErkJggg==';

    it('can load an image', function() {
        var loadedImage;
        when(loadImageViaBlob('./Data/Images/Green.png'), function(image) {
            loadedImage = image;
        });

        waitsFor(function() {
            return typeof loadedImage !== 'undefined';
        }, 'The image should load.', 5000);

        runs(function() {
            expect(loadedImage.width).toEqual(1);
            expect(loadedImage.height).toEqual(1);
        });
    });

    it('can load an image from a data URI', function() {
        var loadedImage;
        when(loadImageViaBlob(dataUri), function(image) {
            loadedImage = image;
        });

        waitsFor(function() {
            return typeof loadedImage !== 'undefined';
        }, 'The image should load.');

        runs(function() {
            expect(loadedImage.width).toEqual(1);
            expect(loadedImage.height).toEqual(1);
        });
    });

    it('throws with if url is missing', function() {
        expect(function() {
            loadImageViaBlob();
        }).toThrow();
    });

    it('resolves the promise when the image loads', function() {
        var fakeImage = {};
        spyOn(window, 'Image').andReturn(fakeImage);

        var success = false;
        var failure = false;
        var loadedImage;

        when(loadImageViaBlob(dataUri), function(image) {
            success = true;
            loadedImage = image;
        }, function() {
            failure = true;
        });

        // neither callback has fired yet
        expect(success).toEqual(false);
        expect(failure).toEqual(false);

        fakeImage.onload();
        expect(success).toEqual(true);
        expect(failure).toEqual(false);
        expect(loadedImage).toBe(fakeImage);
    });

    it('rejects the promise when the image errors', function() {
        var fakeImage = {};
        spyOn(window, 'Image').andReturn(fakeImage);

        var success = false;
        var failure = false;
        var loadedImage;

        when(loadImageViaBlob(dataUri), function(image) {
            success = true;
            loadedImage = image;
        }, function() {
            failure = true;
        });

        // neither callback has fired yet
        expect(success).toEqual(false);
        expect(failure).toEqual(false);

        fakeImage.onerror();
        expect(success).toEqual(false);
        expect(failure).toEqual(true);
        expect(loadedImage).toBeUndefined();
    });
});
