require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery/jquery.min',
        underscore: 'libs/underscore.js/underscore',
        backbone: 'libs/backbone.js/backbone-min',
        text: 'libs/require-text/text',
        i18n: 'libs/require-i18n/i18n',
        template: '../templates'
    }
});

document.addEventListener('deviceready', function () {
    require([
        'app',
        'i18n!nls/app'
    ], function (App, appLang) {
        window.lang = appLang;

        App.initialize();
	});
});

document.addEventListener("backbutton", onBackKeyDown, false);
		
function onBackKeyDown(e) {
    console.log(window.navigator.onLine);
    e.preventDefault();
    var url_back = $("#btn-back-url").prop("href");

    if (url_back != "") {
        var res = url_back.split("#");
        if ( res[res.length-1] == "exit") {
            navigator.app.exitApp();      
        } else if (res[res.length-1] == "javascript:history.back();") {
            console.log("navigator.app.backHistory();");
            navigator.app.backHistory();
        } else {
            var url = '#'+res[res.length-1];
            console.log(url);
            window.location.href = url;
        }
    } else {
        var url = '#'; 
        window.location.href = url;
    }
}

var isEqual = function (value, other) {

    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    var compare = function (item1, item2) {

        // Get the object type
        var itemType = Object.prototype.toString.call(item1);

        // If an object or array, compare recursively
        if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
            if (!isEqual(item1, item2)) return false;
        }

        // Otherwise, do a simple comparison
        else {

            // If the two items are not the same type, return false
            if (itemType !== Object.prototype.toString.call(item2)) return false;

            // Else if it's a function, convert to a string and compare
            // Otherwise, just compare
            if (itemType === '[object Function]') {
                if (item1.toString() !== item2.toString()) return false;
            } else {
                if (item1 !== item2) return false;
            }

        }
    };

    // Compare properties
    if (type === '[object Array]') {
        for (var i = 0; i < valueLen; i++) {
            if (compare(value[i], other[i]) === false) return false;
        }
    } else {
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                if (compare(value[key], other[key]) === false) return false;
            }
        }
    }

    // If nothing failed, return true
    return true;
};

var strip = function (html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}