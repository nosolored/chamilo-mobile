define([
    'jquery',
    'backbone',
	'collections/courses',
	'models/campus',
    'models/message',
	'models/post',
    'views/login',
    'views/inbox',
    'views/message',
    'views/logout',
    'views/alert',
	'views/home',
	'views/courses',
	'views/course',
	'views/description',
	'views/documents',
	'collections/announcements',
	'views/announcements',
	'views/announcement',
	'views/agenda',
	'views/forum',
	'views/thread',
	'views/post',
	'views/newthread',
	'views/newpost',
	'collections/posts',
	'views/profile'
], function (
    $,
    Backbone,
	CoursesCollection,
	CampusModel,
    MessageModel,
	PostModel,
    LoginView,
    InboxView,
    MessageView,
    LogoutView,
    AlertView,
	HomeView,
	CoursesView,
	CourseView,
	DescriptionView,
	DocumentView,
	AnnouncementsCollection,
	AnnouncementsView,
	AnnouncementView,
	AgendaView,
	ForumView,
	ThreadView,
	PostView,
	NewThreadView,
	NewPostView,
	PostsCollection,
	ProfileView
) {
    var Router = Backbone.Router.extend({
        routes: {
            '': 'showIndex',
			'my-courses': 'showListCourses',
			'course/:id': 'showCourse',
			'description/:id': 'showDescription',
			'documents/:id/:path': 'showDocuments',
			'documents/:id/:path/:back': 'showDocuments',
			'announcements/:id': 'showAnnouncements',
			'announcement/:id': 'showAnnouncement',
			'agenda/:id': 'showAgenda',
			'list-messages': 'showListMessages',
            'message/:id': 'showMessage',
			'forum/:id': 'showForum',
			'thread/:id/:f_id': 'showThreads',
			'post/:id/:f_id/:t_id': 'showPosts',
			'profile': 'showProfile',
			'new_thread/:id/:f_id': 'showNewThread',
			'new_post/:id/:f_id/:t_id': 'showNewPost',
			'reply_post/:id/:f_id/:t_id/:post_id': 'showReplyPost',
			'reply_quote/:id/:f_id/:t_id/:post_id': 'showQuotePost',
            'logout': 'showLogout'
        }
	});

    var campusModel = new CampusModel();
	var postModel = new PostModel();
	var coursesCollection = new CoursesCollection();
	var announcementsCollection = new AnnouncementsCollection();
	var postsCollection = new PostsCollection();

    var showIndex = function () {
        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var homeView = new HomeView();
			homeView.render()
        });

        $.when(getCampusData).fail(function () {
            var loginView = new LoginView();

            document.body.innerHTML = '';
            document.body.appendChild(loginView.render().el);
        });
    };
	
	var showListCourses = function() {
        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
			var coursesView = new CoursesView({
				model: campusModel,
				collection: coursesCollection
			});

			coursesView.render();
		});
	};
	
	var showListMessages = function() {
        var getCampusData = campusModel.getData();
			
		$.when(getCampusData).done(function () {
			var inboxView = new InboxView({
				model:campusModel
			});
			inboxView.render();
		});
	};
	
	var showCourse = function (courseId) {
		courseId = parseInt(courseId);
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
			var courseModel = coursesCollection.get(courseId);
            
            var courseView = new CourseView({
                model: courseModel
            });
            courseView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showDescription = function (courseId){
		courseId = parseInt(courseId);
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {

            var descriptionView = new DescriptionView({
                model: campusModel,
				id: courseId
            });
            descriptionView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showDocuments = function (courseId, path){
		courseId = parseInt(courseId);
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var documentView = new DocumentView({
                model: campusModel,
				id: courseId,
				path_id: path
            });
            documentView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
    var showMessage = function (messageId) {
        messageId = parseInt(messageId);

        if (!messageId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedMessage
                }
            });

            return;
        }

        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var messageModel = new MessageModel();
            var getMessageData = messageModel.getData(messageId);

            $.when(getMessageData).done(function () {
                var messageView = new MessageView({
                    model: messageModel
                });

                messageView.render();
            });

            $.when(getMessageData).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.messageDoesNotExists
                    }
                });
            });
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    };
	
	var showAnnouncements = function (courseId){
		courseId = parseInt(courseId);
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var announcementsView = new AnnouncementsView({
                model: campusModel,
				id: courseId,
				collection: announcementsCollection
            });
            announcementsView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};	
	
	var showAnnouncement = function (cid) {
		cid = parseInt(cid);
		if (!cid) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedAnnouncement
                }
            });

            return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
			//var courseModel = new CourseModel();
			var announcementModel = announcementsCollection.get(cid);
            
            var announcementView = new AnnouncementView({
                model: announcementModel
            });
            announcementView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showAgenda = function (courseId) {
		courseId = parseInt(courseId);
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
    
            var agendaView = new AgendaView({
                model: campusModel,
				id: courseId
            });
            agendaView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showProfile = function() {
		 var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
			var profileView = new ProfileView({
				model: campusModel
			});

			profileView.render();
		});
	};
	
    var showLogout = function () {
        var logoutView = new LogoutView();

        document.body.innerHTML = '';
        document.body.appendChild(logoutView.render().el);

        var messageModel = new MessageModel();

        var deleteCampus = campusModel.delete();
        var deleteMessages = messageModel.delete();

        $.when.apply($, [
            deleteCampus,
            deleteMessages
        ]).then(function () {
            Backbone.history.navigate('', true);
        });
    };
	
	var showForum = function (courseId){
		courseId = parseInt(courseId);
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var forumView = new ForumView({
                model: campusModel,
				id: courseId,
            });
            forumView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showThreads = function (courseId, forumId){
		courseId = parseInt(courseId);
		forumId = parseInt(forumId);
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
			return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var threadView = new ThreadView({
                model: campusModel,
				id: courseId,
				forum_id: forumId
            });
            threadView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showPosts = function (courseId, forumId, threadId){
		courseId = parseInt(courseId);
		forumId = parseInt(forumId);
		threadId = parseInt(threadId)
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
			return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var postView = new PostView({
                model: campusModel,
				id: courseId,
				forum_id: forumId,
				thread_id: threadId,
				collection: postsCollection
            });
            postView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showNewThread = function (courseId, forumId){
		courseId = parseInt(courseId);
		forumId = parseInt(forumId);
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
			return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var newThreadView = new NewThreadView({
                model: campusModel,
				id: courseId,
				forum_id: forumId
            });
            newThreadView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showNewPost = function (courseId, forumId, threadId){
		courseId = parseInt(courseId);
		forumId = parseInt(forumId);
		threadId = parseInt(threadId);
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
			return;
        }
		
		var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var newPostView = new NewPostView({
                model: campusModel,
				id: courseId,
				forum_id: forumId,
				thread_id: threadId,
				title: '',
				text: '',
				poster: ''
            });
            newPostView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showReplyPost = function (courseId, forumId, threadId, postId){
		courseId = parseInt(courseId);
		forumId = parseInt(forumId);
		threadId = parseInt(threadId);
		postId = parseInt(postId);
		
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
			return;
        }
		
		var getCampusData = campusModel.getData();
		var postModel = postsCollection.get(courseId+'0'+forumId+'0'+threadId+'0'+postId);

        $.when(getCampusData).done(function () {
            var newPostView = new NewPostView({
                model: campusModel,
				id: courseId,
				forum_id: forumId,
				thread_id: threadId,
				title: 'Re: '+postModel.get('title'),
				text: '',
				poster: ''
            });
            newPostView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
	var showQuotePost = function (courseId, forumId, threadId, postId){
		courseId = parseInt(courseId);
		forumId = parseInt(forumId);
		threadId = parseInt(threadId);
		postId = parseInt(postId);
			
		if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
			return;
        }
		
		var getCampusData = campusModel.getData();
		var postModel = postsCollection.get(courseId+'0'+forumId+'0'+threadId+'0'+postId);

        $.when(getCampusData).done(function () {
            var newPostView = new NewPostView({
                model: campusModel,
				id: courseId,
				forum_id: forumId,
				thread_id: threadId,
				title: 'Re: '+postModel.get('title'),
				text: postModel.get('text'),
				poster: postModel.get('poster')
            });
            newPostView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
	};
	
    return {
        initialize: function () {
            var router = new Router;
            router.on('route:showIndex', showIndex);
			router.on('route:showListCourses', showListCourses);
			router.on('route:showCourse', showCourse);
			router.on('route:showDescription', showDescription);
			router.on('route:showAnnouncements', showAnnouncements);
			router.on('route:showAnnouncement', showAnnouncement);
			router.on('route:showAgenda', showAgenda);
			router.on('route:showDocuments', showDocuments);
			router.on('route:showListMessages', showListMessages);
            router.on('route:showMessage', showMessage);
			router.on('route:showForum', showForum);
			router.on('route:showThreads', showThreads);
			router.on('route:showPosts', showPosts);
			router.on('route:showNewThread', showNewThread);
			router.on('route:showNewPost', showNewPost);
			router.on('route:showReplyPost', showReplyPost);
			router.on('route:showQuotePost', showQuotePost);
			router.on('route:showProfile', showProfile);
			router.on('route:showRanking', showRanking);
            router.on('route:showLogout', showLogout);
			router.on('route:showDetailsRanking', showDetailsRanking);

            Backbone.history.start();
		}
    };
});
