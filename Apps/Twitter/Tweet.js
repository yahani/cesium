/*global define*/
define([
], function() {
    "use strict";

    /**
     * TODO: Create a Tweet Collection (nest? har har!)
     * this way a single ajax call can get all the look up info all the tweets instead of issuing multiple single calls.
     */

    /**
     * DOC_TBA
     * TODO: consolidate parameters via python script
     *
     * @alias Tweet
     * @constructor
     */
    var Tweet = function(userId, tweetId, text, position, time) {
        this.userId = userId;
        this.tweetId = tweetId;
        this.text = text;
        this.position = position;
        this.time = time;

        this.lookup = undefined;
        var that = this;
        $.ajax({
            url: 'http://api.twitter.com/1/users/lookup.json?user_id='+ this.userId,
            dataType: 'jsonp',
            type: 'GET',
            success: function(msg) {
                that.lookup = msg[0];
            }
        });
    };

    Tweet.prototype._getProperty = function(property) {
        if (typeof property !== 'undefined') {
            if (this.lookup.hasOwnProperty(property)) {
                return this.lookup[property];
            }
        }
        return undefined;
    };

    /**
     * @returns The username of the tweet's author.
     */
    Tweet.prototype.getScreenName = function() {
        return this._getProperty('screen_name');
    };

    /**
     * @returns {String} The URL of the author's avatar icon.
     */
    Tweet.prototype.getAvatar = function() {
        return this._getProperty('profile_image_url');
    };

    /**
     * @returns {String} The author's user-defined location (e.g., Philadelphia).
     */
    Tweet.prototype.getLocation = function() {
        return this._getProperty('location');
    };

    /**
     * @returns {String} The name of the tweet's author.
     */
    Tweet.prototype.getName = function() {
        return this._getProperty('name');
    };

    /**
     * Converts Twitter sensitive formatting foudn in plaintext (#hashtags, @mentions, etc.) into hyperlinks.
     * @param {String} text The text (link, hashtag, @username), to be transformed into hyperlinks.
     * @returns {String} The new text containing hyperlinks.
     */
    Tweet.textToHyperlink = function(text) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
        text = text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
        exp = /(^|\s)#(\w+)/g;
        text = text.replace(exp, "$1<a href='http://search.twitter.com/search?q=%23$2' target='_blank'>#$2</a>");
        exp = /(^|\s)@(\w+)/g;
        text = text.replace(exp, "$1<a href='http://www.twitter.com/$2' target='_blank'>@$2</a>");
        return text;
    };

    return Tweet;
});
