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
	    console.log("funcion loadThreads");
	    
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
						last_poster: threadData.firstname+ ' '+threadData.lastname,
						last_post_date: threadData.last_post_date
					});
				}else{
					var thread = threadsCollection.get(cid);
					thread.set({"title": threadData.thread_title});
					thread.set({"replies": threadData.thread_replies});
					thread.set({"views": threadData.thread_views});
					thread.set({"last_post_date": threadData.last_post_date});
					thread.set({"last_poster": threadData.last_poster});
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
			courseId = this.id;
			forumId = this.options.forum_id;
			console.log("initialize")

		 	loadThreads();
			threadsCollection.on('add', this.render, this);
            threadsCollection.on('change', this.render, this);
			infoModel.on('change',this.render, this);
        },
        render: function () {
			forum_title = infoModel.get('forum_title');
			this.el.innerHTML = this.template({collection: threadsCollection.toJSON(), c_id: courseId, f_id: forumId, f_title: forum_title});
			return this;
        },
        events: {
            'click #thread-update': 'threadUpdateOnClick'
        },
        threadUpdateOnClick: function (e) {
            e.preventDefault();
			
            loadThreads();
			$(".navbar-toggle").trigger( "click" );
		}
    });
    return ThreadsView;
});
