define([
    'underscore',
    'backbone',
    'collections/threads',
	'models/info_forum',
    'text!template/thread.html',
    'views/alert'
], function (
    _,
    Backbone,
    ThreadsCollection,
	InfoModel,
    ThreadsTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
    var threadsCollection = new ThreadsCollection();
	var infoModel = new InfoModel();
  
    var loadThreads = function () {
	    //console.log("funcion loadThreads");
	    
		var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getForums = $.post(url, {
            action: 'getThreadsList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id'),
			c_id: courseId,
			f_id: forumId
        });
		
        $.when(getForums).done(function (response) {
			
            if (!response.status) {
                return;
            }
			//console.log(response);
			forum_title = response.data.forum_title;
			infoModel.set("forum_title", forum_title);		
            response.data.threads.forEach(function (threadData) {
				var cid = parseInt("" + threadData.c_id + "00" + threadData.forum_id + "00" + threadData.thread_id);
				if(threadsCollection.get(cid) == null){ 
					threadsCollection.create({
						c_id: parseInt(threadData.c_id),
						forum_id: parseInt(threadData.forum_id),
						title: threadData.thread_title,
						thread_id: parseInt(threadData.thread_id),
						replies: parseInt(threadData.thread_replies),
						views: threadData.thread_views,
						thread_poster_name: threadData.thread_poster_name,
						last_post_date: threadData.last_post_date,
						last_poster: threadData.last_post_name,
						insert_date: threadData.insert_date,
						iconnotify: threadData.iconnotify,
						image: threadData.image
					});
				}else{
					var thread = threadsCollection.get(cid);
					thread.set({"title": threadData.thread_title});
					thread.set({"replies": threadData.thread_replies});
					thread.set({"views": threadData.thread_views});
					thread.set({"thread_poster_name": threadData.thread_poster_name})
					thread.set({"last_post_date": threadData.last_post_date});
					thread.set({"last_poster": threadData.last_poster});
					thread.set({"insert_date": threadData.insert_date});
					thread.set({"iconnotify": threadData.iconnotify});
					thread.set({"image": threadData.image});
					threadsCollection.set(thread,{remove: false});
				}
            });
			
            if (response.data.threads.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noThreads
                    }
                });
                return;
            }
		});
		
    };

    var ThreadsView = Backbone.View.extend({
        el: 'body',
        template: _.template(ThreadsTemplate),
		initialize: function (options) {
			threadsCollection.unbind();
			threadsCollection.reset();
			this.options = options;
			$(this.el).unbind();
			campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;
			forumId = this.options.forum_id;
			//console.log("initialize")

		 	loadThreads();
			threadsCollection.on('add', this.render, this);
            threadsCollection.on('change', this.render, this);
			infoModel.on('change',this.render, this);
        },
        render: function () {
			forum_title = infoModel.get('forum_title');
			this.el.innerHTML = this.template({collection: threadsCollection.toJSON(), c_id: courseId, s_id: sessionId, f_id: forumId, f_title: forum_title});
			return this;
        },
        events: {
            'click #thread-update': 'threadUpdateOnClick',
            'click .notify': 'notifyUpdateOnClick'
        },
        threadUpdateOnClick: function (e) {
            e.preventDefault();
			
            loadThreads();
			$(".navbar-toggle").trigger( "click" );
		},
		notifyUpdateOnClick: function (e) {
			e.preventDefault();
			var forum_id = $("#forum_id").val();
			var thread_id = e.currentTarget.id;
			
			var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingNotify = $.post(url, {
                action: 'setNotify',
				username: campusModel.get('username'),
				api_key: campusModel.get('apiKey'),
				user_id: campusModel.get('user_id'),
				f_id: forum_id,
                t_id: thread_id
            });

            $.when(checkingNotify).done(function (response) {
            	//console.log(response);
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });
                    return;
                }
                
                new AlertView({
                    model: {
                        message: response.message
                    }
                });
                //console.log(response.id);
                //console.log(self.$('#'+response.id).prop("src"));
                var src = self.$('#'+response.id).attr("src");
                if (src.indexOf("notification_mail_na") > 0) {
                	self.$('#'+response.id).attr("src", "img/icons/22/notification_mail.png");
                } else {
                	self.$('#'+response.id).attr("src", "img/icons/22/notification_mail_na.png");
                }
                
            });

            $.when(checkingNotify).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });
                //alert("No se ha podido configurar las notificaciones")
            });
			
		}
    });
    return ThreadsView;
});
