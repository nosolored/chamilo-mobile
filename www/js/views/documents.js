define([
    'underscore',
    'backbone',
	'models/documents',
    'text!template/documents.html',
    'views/alert'
], function (
    _,
    Backbone,
	DocumentsModel,
    DocumentsTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var path = "/";
	var path_back = new Array();
	var documentsModel = new DocumentsModel();

	var loadDocuments = function () {
	    var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getDocuments = $.post(url, {
            action: 'getDocuments',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			s_id: sessionId,
			path: path
        });

        $.when(getDocuments).done(function (response) {
			if (!response.status) {
			    SpinnerPlugin.activityStop();
                return;
            }

			documentsModel.set({"c_id": courseId});
			documentsModel.set({"s_id": sessionId});
			documentsModel.set({"path": path});
			documentsModel.set({"base": campusModel.get('url') + '/plugin/chamilo_app/download.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey')});
			if (path_back.length > 0) {
				var top = path_back.pop();
				documentsModel.set({"path_back": top});
				documentsModel.set({"path_back_id": path_back.length});
				path_back.push(top);
			} else {
				documentsModel.set({"path_back": "empty"});
			}
			documentsModel.set({"documents": response.documents});
			documentsModel.cid = parseInt(""+courseId+'000'+sessionId);

			SpinnerPlugin.activityStop();

            if (response.documents.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noDocuments
                    }
                });
                return;
            }
		})
		.fail(function() {
            SpinnerPlugin.activityStop();

            new AlertView({
                model: {
                    message: window.lang.noConnectionToServer
                }
            });

            return;
        });
    };

    var DocumentsView = Backbone.View.extend({
        el: 'body',
        template: _.template(DocumentsTemplate),
        initialize: function (options) {
			documentsModel.unbind();
			this.options = options;

			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;

			if (this.options.path_id == "root" || this.options.path_id == null) {
				path = '/';
			} else if (this.options.path_id == "back") {
				path = path_back.pop();
			} else {
				var docu = documentsModel.get("documents");
				path_back.push(path);
				path = docu[this.options.path_id]['path'];
			}

			// Call data remote function
            var networkState = navigator.connection.type;
            if (networkState == Connection.NONE) {
                window.setTimeout(function () {
                    new AlertView({
                        model: {
                            message: window.lang.notOnLine
                        }
                    });
                }, 1000);

                SpinnerPlugin.activityStop();
            } else {
                loadDocuments();
            }

            documentsModel.on('change', this.render, this);
		},
        render: function () {
            this.el.innerHTML = this.template(documentsModel.toJSON());
			return this;
        },
		events: {
            'click .link-file': 'documentDownloadOnClick'
        },
        documentDownloadOnClick: function (e) {
            e.preventDefault();

			var assetURL = $(e.target).prop("href");
			var fileName = $(e.target).prop("id");
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

            function downloadFile() {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                    fileSystem.root.getDirectory("Download", {create: true, exclusive: false}, function(dirEntry) {
                        dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
                            //select method nativeURL: "file:///storage/emulated/0/Download/<file_name>"
                            var localPath = fileEntry.nativeURL;

                            // This plugin allows you to upload and download files.
                            fileTransfer = new FileTransfer();

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

                            // Downloads a file from server.
                            fileTransfer.download(assetURL, localPath, function(entry) {
                                // Success download
                                navigator.notification.alert(
                                    window.lang.successDownload, 
                                    function(r) {
                                        // Dismiss the progress dialog
                                        cordova.plugin.pDialog.dismiss();
                                        // Opens a URL in a new InAppBrowser instance
                                        window.resolveLocalFileSystemURL(localPath, successFile, failFile);

                                        function successFile(fileEntry) {
                                            fileEntry.file(function (file) {
                                                var mimeType = file.type;
                                                if (mimeType == 'application/pdf') {
                                                    // abrir con un visor de pdf
                                                } else {
                                                    window.open(localPath, '_blank', 'location=no,enableViewportScale=yes');
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
                                    function() {
                                        // Dismiss the progress dialog.
                                        cordova.plugin.pDialog.dismiss();
                                    }, 
                                    window.lang.NoticeTitleBar
                                );
                            });
                        }, failLog);
                    }, failLog);
                },fail);

                function failLog(error) {
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
    });

    return DocumentsView;
});
