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
	  console.log("funcion loadDocuments");
	  	
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getDocuments = $.post(url, {
            action: 'getDocuments',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			path: path
        });

        $.when(getDocuments).done(function (response) {
			if (!response.status) {
                return;
            }
			console.log(response);
			documentsModel.set({"c_id": courseId});
			documentsModel.set({"path": path});
			documentsModel.set({"base": campusModel.get('url') + '/plugin/chamilo_app/download.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey')});
			if(path_back.length > 0){
				var top = path_back.pop();
				documentsModel.set({"path_back": top});
				documentsModel.set({"path_back_id": path_back.length});
				path_back.push(top);
			}else{
				documentsModel.set({"path_back": "empty"});
			}
			documentsModel.set({"documents": response.documents});
			documentsModel.cid = courseId;
			
            if (response.documents.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noDocuments
                    }
                });
                return;
            }
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
			courseId = this.id;
			if(this.options.path_id == "root" || this.options.path_id == null){
				path = '/';
			}else if(this.options.path_id == "back"){
				path = path_back.pop();	
			}else{
				var docu = documentsModel.get("documents");
				path_back.push(path);
				path = docu[this.options.path_id]['path'];
	
			}
			console.log("initialize")
		
            loadDocuments();
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

			function fail(e) {
			  	var msg = '';
				SpinnerPlugin.activityStop();
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
			
			var assetURL = $(e.target).prop("href");
			var fileName = $(e.target).prop("id");
			
			var uri = encodeURI(assetURL);
								
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			  fileTransfer = new FileTransfer();
			/* Box progress */
			cordova.plugin.pDialog.init({progressStyle : 'HORIZONTAL', title: 'Por favor espere...', message : 'Descargando del servidor...'});
			cordova.plugin.pDialog.setProgress(0);
			/* End box progress */
			  fileTransfer.download(assetURL, "/sdcard/Download/" + fileName, function(entry) {
				  cordova.plugin.pDialog.dismiss();
				  
				  navigator.notification.alert(
						'Fichero descargado con el nombre '+fileName, 
						function(){
							window.open("/sdcard/Download/" + fileName,'_system')	
						}, 
						'Respuesta de la aplicación'
					);
				}, function (error) {
					cordova.plugin.pDialog.dismiss();
					
					console.log('download error: ' + error.code);
					console.log("download error source " + error.source);
					console.log("download error target " + error.target);
					console.log(error);
					navigator.notification.alert(
						'No se ha podido descargar el archivo adjunto', 
						function(){

						}, 
						'Respuesta de la aplicación'
					);
			  	});
				
				fileTransfer.onprogress = function(progressEvent) {
					if (progressEvent.lengthComputable) {
						var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
						cordova.plugin.pDialog.setProgress(perc);
					} else {

					}
				};
			}, fail);
		}
    });

    return DocumentsView;
});
