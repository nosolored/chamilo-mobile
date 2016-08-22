define([
    'underscore',
    'backbone',
    'collections/posts',
	'models/info_forum',
    'text!template/post.html',
    'views/alert'
], function (
    _,
    Backbone,
    PostsCollection,
	InfoModel,
    PostsTemplate,
    AlertView
) {
    var campusModel = null;
	var base = '';
	var courseId = 0;
    var postsCollection = new PostsCollection();
	var infoModel = new InfoModel();
  
    var loadPosts = function () {
	    console.log("funcion loadPosts");
	    //console.log(postsCollection);
		
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getPosts = $.post(url, {
            action: 'getPostsList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id'),
			c_id: courseId,
			f_id: forumId,
			t_id: threadId
        });
		
        $.when(getPosts).done(function (response) {
			console.log(response);
            if (!response.status) {
                return;
            }
			thread_title = response.data.thread_title;
			infoModel.set("thread_title", thread_title);		
            
			//response.data.posts.forEach(function (postData) {
			
			for (var i in response.data.posts){
				var postData = response.data.posts[i];
				console.log(postData);
				var cid = parseInt("" + postData.c_id + "0" + postData.forum_id + "0" + postData.thread_id + "0" + postData.post_id);
				if(postsCollection.get(cid) == null){ 
					postsCollection.create({
						c_id: parseInt(postData.c_id),
						forum_id: parseInt(postData.forum_id),
						thread_id: parseInt(postData.thread_id),
						post_id: parseInt(postData.post_id),
						title: postData.post_title,
						text: postData.post_text,						
						poster: postData.firstname+ ' '+postData.lastname,
						date: postData.date,
						path: postData.path,
						filename: postData.filename
					});
				}else{
					var post = postsCollection.get(cid);
					post.set({"title": postData.post_title});
					post.set({"text": postData.post_text});
					post.set({"date": postData.date});
					post.set({"poster": postData.firstname+ ' ' +postData.lastname});
					post.set({"path": postData.path});
					post.set({"filename": postData.filename});
					postsCollection.set(post,{remove: false});
				}
			};
			
            if (response.data.posts.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noPosts
                    }
                });
                return;
            }
		});
	};

    var PostsView = Backbone.View.extend({
        el: 'body',
        template: _.template(PostsTemplate),
		initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
            
			campusModel = this.model;
			courseId = this.id;
			forumId = this.options.forum_id;
			threadId = this.options.thread_id;
			postsCollection = this.collection;
			
			postsCollection.unbind();
			postsCollection.reset();
			
			console.log("initialize")
			base = campusModel.get('url') + '/plugin/chamilo_app/forum-download.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey') + '&user_id=' + campusModel.get('user_id');

		 	loadPosts();
			postsCollection.on('add', this.render, this);
            postsCollection.on('change', this.render, this);
			infoModel.on('change',this.render, this);
        },
        render: function () {
			thread_title = infoModel.get('thread_title');
            this.el.innerHTML = this.template({collection: postsCollection.toJSON(), c_id: courseId, f_id: forumId, t_id: threadId, t_title: thread_title, base: base});
			return this;
        },
        events: {
            'click #post-update': 'postUpdateOnClick',
			'click .link-file-post': 'filePostOnClick'
        },
        postUpdateOnClick: function (e) {
            e.preventDefault();
			
            loadPosts();
			$(".navbar-toggle").trigger( "click" );
		},
		filePostOnClick: function (e) {
            e.preventDefault();
			//console.log(e.target);            // The element that was clicked.
  			
			/*
			console.log($(e.target).prop("href"));
			//console.log($(e.target).id());
			cordova.InAppBrowser.open($(e.target).prop("href"), '_blank', 'location=no');
			*/
			
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
			
			var assetURL = $(e.target).prop("href");
			var fileName = $(e.target).prop("id");
			
			var uri = encodeURI(assetURL);
								
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			  fileTransfer = new FileTransfer();
			  fileTransfer.download(assetURL, "/sdcard/Download/" + fileName, function(entry) {
				  navigator.notification.alert(
						'Fichero descargado con el nombre '+fileName, 
						function(){
							//$.mobile.loading("hide");
							console.log(fileName);
							window.open("/sdcard/Download/" + fileName,'_system')	
						}, 
						'Respuesta de la aplicación'
					);
				}, function (error) {
				console.log('download error: ' + error.code);
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log(error);
				navigator.notification.alert(
					'No se ha podido descargar el archivo adjunto', 
					function(){
						//$.mobile.loading("hide");	
					}, 
					'Respuesta de la aplicación'
				);
			  });
			}, fail);
		}
    });
    return PostsView;
});

        