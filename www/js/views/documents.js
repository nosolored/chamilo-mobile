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
            console.log(e);
            if (e.target.localName == "img") {
                var assetURL = $(e.target).parent().prop("href");
                var fileName = $(e.target).parent().prop("id");
                var document_id = $(e.target).parent().attr("data-id");
            } else {
                var assetURL = $(e.target).prop("href");
                var fileName = $(e.target).prop("id");
                var document_id = $(e.target).attr("data-id");
            }

            if (fileName.indexOf(".html") != -1) {
                var options = { dimBackground: true };
                SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);
                
                var assetURL = campusModel.get('url') + 
                    '/plugin/chamilo_app/tool_access.php?' +
                    'tool=document_html' +
                    '&username=' + campusModel.get('username') +
                    '&api_key=' + campusModel.get('apiKey') +
                    '&user_id=' + campusModel.get('user_id') +
                    '&course_id=' + courseId +
                    '&session_id=' + sessionId +
                    '&document_id=' + document_id;

                var messageBack = window.lang.BackToApp;
                var options = "location=yes,hardwareback=no,zoom=yes,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#3b6b78,closebuttoncolor=#FFFFFF,closebuttoncaption=< "+messageBack;
                var inAppBrowserRef = cordova.InAppBrowser.open(assetURL, '_blank', options);

                inAppBrowserRef.addEventListener('loadstop', function(event) { SpinnerPlugin.activityStop(); });
                inAppBrowserRef.addEventListener('exit', loadStopCallBack);

                function loadStopCallBack() {
                    if (inAppBrowserRef != undefined) {
                        var networkState = navigator.connection.type;
                        if (networkState == Connection.NONE) {
                            window.setTimeout(function () {
                                new AlertView({
                                    model: {
                                        message: window.lang.notOnLine
                                    }
                                });
                            }, 1000);
                        } else {
                            loadInfoCourse();
                        }
                    }
                }
            } else {
                goToDownload(assetURL, fileName);
            }
        }
    });

    return DocumentsView;
});
