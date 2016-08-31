define([
    'jquery',
    'backbone',
    'collections/courses',
    //'collections/messages',
    'models/campus',
    'models/message',
    'models/post',
    'views/login',
    'views/inbox',
    'views/message',
    'views/replymessage',
    'views/newmessage',
//    'views/outbox',
    'views/logout',
    'views/alert',
    'views/home',
    'views/courses',
    'views/course',
    'views/description',
    'views/notebook',
    'views/newnotebook',
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
    'views/profile',
    'views/learnpath'
], function (
    $,
    Backbone,
    CoursesCollection,
    //MessagesCollection,
    CampusModel,
    MessageModel,
    PostModel,
    LoginView,
    InboxView,
    MessageView,
    ReplyMessageView,
    NewMessageView,
//    OutboxView,
    LogoutView,
    AlertView,
    HomeView,
    CoursesView,
    CourseView,
    DescriptionView,
    NotebookView,
    NewNotebookView,
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
    ProfileView,
    LearnpathView
) {
    var Router = Backbone.Router.extend({
        routes: {
            '': 'showIndex',
            'my-courses': 'showListCourses',
            'course/:course_id/:session_id': 'showCourse',
            'description/:course_id/:session_id': 'showDescription',
            'learnpath/:course_id/:session_id': 'showLearnpath',
            'notebook/:course_id/:session_id': 'showNotebook',
            'new_notebook/:course_id/:session_id': 'showNewNotebook',
            'documents/:course_id/:session_id/:path': 'showDocuments',
            'documents/:course_id/:session_id/:path/:back': 'showDocuments',
            'announcements/:course_id/:session_id': 'showAnnouncements',
            'announcement/:id': 'showAnnouncement',
            'agenda/:course_id/:session_id': 'showAgenda',
            'list-messages': 'showListMessages',
            'message/:id': 'showMessage',
            'reply_message/:id': 'showReplyMessage',
            'new-message': 'showNewMessage',
//            'outbox': 'showOutbox',
            'forum/:course_id/:session_id': 'showForum',
            'thread/:course_id/:session_id/:f_id': 'showThreads',
            'post/:course_id/:session_id/:f_id/:t_id': 'showPosts',
            'profile': 'showProfile',
            'new_thread/:course_id/:session_id/:f_id': 'showNewThread',
            'new_post/:course_id/:session_id/:f_id/:t_id': 'showNewPost',
            'reply_post/:course_id/:session_id/:f_id/:t_id/:post_id': 'showReplyPost',
            'reply_quote/:course_id/:session_id/:f_id/:t_id/:post_id': 'showQuotePost',
            'logout': 'showLogout'
        }
    });

    var campusModel = new CampusModel();
    var postModel = new PostModel();
    var coursesCollection = new CoursesCollection();
    var announcementsCollection = new AnnouncementsCollection();
    var postsCollection = new PostsCollection();
    //var messagesCollection = new MessagesCollection();

    var showIndex = function () {
        console.log("showIndex");
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
        console.log("showListCourses");
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
        console.log("showListMessages");
        var getCampusData = campusModel.getData();
            
        $.when(getCampusData).done(function () {
            var inboxView = new InboxView({
                model:campusModel
            });
            inboxView.render();
        });
    };
    
    var showCourse = function (courseId, sessionId) {
        console.log("showCourse");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
            //var courseModel = new CourseModel();
            //var courseModel = coursesCollection.get(courseId);
            
            var courseView = new CourseView({
                //model: courseModel,
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
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
    
    var showDescription = function (courseId, sessionId){
        console.log("showDescription");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId
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
    
    var showLearnpath = function (courseId, sessionId){
        console.log("showLearnpath");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
            //var courseModel = new CourseModel();
            console.log(campusModel);
            var learnpathView = new LearnpathView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            learnpathView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    };
    
    var showNotebook = function (courseId, sessionId){
        console.log("showNotebook");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
            //var courseModel = new CourseModel();
            console.log(campusModel);
            var notebookView = new NotebookView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            notebookView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    };
    
    var showNewNotebook = function (courseId, sessionId){
        console.log("showNewNotebook");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        
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
            var newNotebookView = new NewNotebookView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            newNotebookView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    };
    
    var showDocuments = function (courseId, sessionId, path){
        console.log("showDocuments");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
        console.log("showMessage");
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
            console.log(messageId);
            $.when(getMessageData).done(function () {
                var messageView = new MessageView({
                    model: messageModel,
                    id: messageId
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
    
    var showReplyMessage = function (messageId){
        console.log("showReplyMessage");
        messageId = parseInt(messageId);
        console.log(messageId);
        
        if (!messageId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedMessage
                }
            });
            return;
        }
        
        var getCampusData = campusModel.getData();
        //var messageModel = messagesCollection.get(messageId);

        $.when(getCampusData).done(function () {
            var messageModel = new MessageModel();
            var getMessageData = messageModel.getData(messageId);
            $.when(getMessageData).done(function () {
                var replyMessageView = new ReplyMessageView({
                    model: messageModel,
                    campus:campusModel,
                    id: messageId
                });
                replyMessageView.render();
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
    
    var showNewMessage = function() {
        console.log("showNewMessage");
        var getCampusData = campusModel.getData();
            
        $.when(getCampusData).done(function () {
            var newMessageView = new NewMessageView({
                model:campusModel
            });
            newMessageView.render();
        });
    };
/*
    var showOutbox = function() {
        console.log("showOutbox");
        var getCampusData = campusModel.getData();
            
        $.when(getCampusData).done(function () {
            var outboxView = new OutboxView({
                model:campusModel
            });
            outboxView.render();
        });
    };
*/    
    var showAnnouncements = function (courseId, sessionId){
        console.log("showAnnouncement");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
        console.log("showAnnouncement");
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
    
    var showAgenda = function (courseId, sessionId) {
        console.log("showAgenda");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId
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
        console.log("showProfile");
         var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var profileView = new ProfileView({
                model: campusModel
            });

            profileView.render();
        });
    };
    
    var showLogout = function () {
        console.log("showLogout");
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
    
    var showForum = function (courseId, sessionId){
        console.log("showForum");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        
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
                courseId: courseId,
                sessionId: sessionId
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
    
    var showThreads = function (courseId, sessionId, forumId){
        console.log("showThreads");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
    
    var showPosts = function (courseId, sessionId, forumId, threadId){
        console.log("showPosts");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
    
    var showNewThread = function (courseId, sessionId, forumId){
        console.log("showNewThread");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
    
    var showNewPost = function (courseId, sessionId, forumId, threadId){
        console.log("showNewPost");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
    
    var showReplyPost = function (courseId, sessionId, forumId, threadId, postId){
        console.log("showNewPost");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
    
    var showQuotePost = function (courseId, sessionId, forumId, threadId, postId){
        console.log("showQuotePost");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
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
                courseId: courseId,
                sessionId: sessionId,
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
            router.on('route:showLearnpath', showLearnpath);
            router.on('route:showNotebook', showNotebook);
            router.on('route:showNewNotebook', showNewNotebook);
            router.on('route:showAnnouncements', showAnnouncements);
            router.on('route:showAnnouncement', showAnnouncement);
            router.on('route:showAgenda', showAgenda);
            router.on('route:showDocuments', showDocuments);
            router.on('route:showListMessages', showListMessages);
            router.on('route:showMessage', showMessage);
            router.on('route:showReplyMessage', showReplyMessage);
            router.on('route:showNewMessage', showNewMessage);
            //router.on('route:showOutbox', showOutbox);
            router.on('route:showForum', showForum);
            router.on('route:showThreads', showThreads);
            router.on('route:showPosts', showPosts);
            router.on('route:showNewThread', showNewThread);
            router.on('route:showNewPost', showNewPost);
            router.on('route:showReplyPost', showReplyPost);
            router.on('route:showQuotePost', showQuotePost);
            router.on('route:showProfile', showProfile);
            router.on('route:showLogout', showLogout);

            Backbone.history.start();
        }
    };
});
