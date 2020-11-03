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

var goToDownload = function (assetURL, fileName) {
    if (device.platform == "Android") {
        var permissions = cordova.plugins.permissions;
    
        permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE, function( status ) {
            if ( !status.hasPermission ) {
                permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, successPermission, errorPermission);
            } else {
                downloadFile();
            }
        });
    
        function errorPermission() {
            navigator.notification.alert(
                window.lang.NoPermission, 
                function() {
                    // Nothing
                }, 
                window.lang.NoticeTitleBar
            );
        }
    
        function successPermission( status ) {
            if (!status.hasPermission) errorPermission();
    
            downloadFile();
        }
    }
    
    if (device.platform == "iOS") {
        downloadFile();
    }

    function downloadFile() {
        var storageLocation = "";
        switch (device.platform) {

            case "Android":
                storageLocation = 'file:///storage/emulated/0/';
                break;
            case "iOS":
                storageLocation = cordova.file.documentsDirectory;
                break;

        }

        window.resolveLocalFileSystemURL(storageLocation, function(fileSystem) {
            fileSystem.getDirectory('Download', {
                create: true,
                exclusive: false
            }, function(dirEntry) {
                dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
                    //select method nativeURL: "file:///storage/emulated/0/Download/<file_name>"
                    var localPath = fileEntry.nativeURL;

                    // This plugin allows you to upload and download files.
                    fileTransfer = new FileTransfer();

                    if (device.platform == "Android") {
                        // Initialize the progress dialog and set various parameters.
                        cordova.plugin.pDialog.init({
                            progressStyle : 'HORIZONTAL',
                            title: window.lang.title_download,
                            message : window.lang.message_download
                        });
    
                        // Set the value of the progress bar when progressStyle is HORIZONTAL
                        var percGlobal = 0;
                        fileTransfer.onprogress = function(progressEvent) {
                            if (progressEvent.lengthComputable) {
                                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                                if (percGlobal < perc) {
                                    percGlobal = perc;
                                    cordova.plugin.pDialog.setProgress(perc); 
                                }
                            } else {
                                console.log(progressEvent);
                            }
                        };
                    }

                    // Downloads a file from server.
                    fileTransfer.download(assetURL, localPath, function(entry) {
                        // Success download
                        navigator.notification.alert(
                            window.lang.successDownload, 
                            function(r){
                                if (device.platform == "Android") {
                                    // Dismiss the progress dialog
                                    cordova.plugin.pDialog.dismiss();
                                }
                                // Opens a URL in a new InAppBrowser instance
                                window.resolveLocalFileSystemURL(localPath, successFile, failFile);

                                function successFile(fileEntry) {
                                    fileEntry.file(function (file) {
                                        if (device.platform == "Android") {
                                            /*
                                            var mimeType = file.type;
                                            if (mimeType == 'application/pdf' ||
                                                mimeType == 'application/zip' ||
                                                mimeType == 'application/octet-stream' ||
                                                mimeType == 'application/x-zip-compressed' ||
                                                mimeType == 'multipart/x-zip' ||
                                                mimeType == 'application/x-rar-compressed' ||
                                                mimeType == 'application/octet-stream'
                                            ) {
                                                // abrir con un visor de pdf
                                                cordova.plugins.fileOpener2.open(
                                                    localPath,
                                                    file.type,
                                                    {
                                                        error: function(e) {
                                                            console.log('Error status');
                                                            console.log(e);
                                                        },
                                                        success: function() {
                                                             console.log('file opened successfully');
                                                        }
                                                    }
                                                );
                                            } else {
                                                window.open(localPath, '_blank', 'location=no,enableViewportScale=yes');
                                            }
                                            */
                                            cordova.plugins.fileOpener2.open(
                                                localPath,
                                                file.type,
                                                {
                                                    error: function(e) {
                                                        console.log('Error status');
                                                        console.log(e);
                                                    },
                                                    success: function() {
                                                         console.log('file opened successfully');
                                                    }
                                                }
                                            );
                                        }
                                        
                                        if (device.platform == "iOS") {
                                            cordova.plugins.fileOpener2.open(
                                                localPath,
                                                file.type,
                                                {
                                                    error: function(e) {
                                                        console.log('Error status');
                                                        console.log(e);
                                                    },
                                                    success: function() {
                                                        // console.log('file opened successfully');
                                                    }
                                                }
                                            );
                                        }
                                    }, function (error) {
                                        console.log(error.code);
                                    });
                                }

                                function failFile(evt) {
                                    console.log(evt.target.error.code);
                                }
                            }, 
                            window.lang.NoticeTitleBar
                        );
                    }, function (error) {
                        // Error download
                        console.log(error);
                        navigator.notification.alert(
                            window.lang.NoDownloadAttachment, 
                            function(){
                                if (device.platform == "Android") {
                                    // Dismiss the progress dialog.
                                    cordova.plugin.pDialog.dismiss();
                                }
                            }, 
                            window.lang.NoticeTitleBar
                        );
                    });
                }, failLog);
            }, failLog2);
        },fail);

        function failLog(error) {
            console.log("failLog");
            console.log(error);
        }
        
        function failLog2(error) {
            console.log("failLog2");
            console.log(error);
        }

        function fail(e) {
            var msg = '';
            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            };
            console.log('Error: ' + msg);
        }
    }
}