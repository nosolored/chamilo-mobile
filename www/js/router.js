define([
    'jquery',
    'backbone',
    'collections/courses',
    'models/campus',
    'models/message',
    'models/outmessage',
    'models/post',
    'views/login',
    'views/inbox',
    'views/outbox',
    'views/message',
    'views/outmessage',
    'views/replymessage',
    'views/newmessage',
    'views/logout',
    'views/alert',
    'views/home',
    'views/courses',
    'views/inscription',
    'views/catalog',
    'views/course',
    'collections/descriptions',
    'views/description',
    'views/link',
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
    'views/ranking',
    'views/details-ranking',
    'views/profile',
    'views/learnpath',
    'collections/works-main',
    'collections/works',
    'views/works-main',
    'views/worklist',
    'views/work-upload',
    'views/work-view',
    'views/work-new',
    'views/work-edit',
    'views/work-add-user',
    'views/work-missing',
    'views/work-students-list',
    'views/work-edit-item',
    'collections/messages'
], function (
    $,
    Backbone,
    CoursesCollection,
    CampusModel,
    MessageModel,
    OutmessageModel,
    PostModel,
    LoginView,
    InboxView,
    OutboxView,
    MessageView,
    OutmessageView,
    ReplyMessageView,
    NewMessageView,
    LogoutView,
    AlertView,
    HomeView,
    CoursesView,
    InscriptionView,
    CatalogView,
    CourseView,
    DescriptionsCollection,
    DescriptionView,
    LinkView,
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
    RankingView,
    DetailsRankingView,
    ProfileView,
    LearnpathView,
    WorksMainCollection,
    WorksCollection,
    WorksMainView,
    WorkListView,
    WorkUploadView,
    WorkViewView,
    WorksFormNewView,
    WorksFormEditView,
    WorksAddUserView,
    WorkMissingView,
    WorksStudentsListView,
    WorkEditItemView,
    MessagesCollection
) {
    var Router = Backbone.Router.extend({
        routes: {
            '': 'showIndex',
            'my-courses': 'showListCourses',
            'inscription': 'showInscription',
            'course/:course_id/:session_id': 'showCourse',
            'description/:course_id/:session_id': 'showDescription',
            'learnpath/:course_id/:session_id': 'showLearnpath',
            'link/:course_id/:session_id': 'showLink',
            'notebook/:course_id/:session_id': 'showNotebook',
            'new_notebook/:course_id/:session_id': 'showNewNotebook',
            'documents/:course_id/:session_id/:path': 'showDocuments',
            'documents/:course_id/:session_id/:path/:back': 'showDocuments',
            'announcements/:course_id/:session_id': 'showAnnouncements',
            'announcement/:id': 'showAnnouncement',
            'agenda/:course_id/:session_id': 'showAgenda',
            'works_main/:course_id/:session_id': 'showWorksMain',
            'work_list/:course_id/:session_id/:work_id': 'showWorkList',
            'work-upload/:course_id/:session_id/:work_id': 'showWorkUpload',
            'work-view/:course_id/:session_id/:work_id': 'showWorkView',
            'work-edit-item/:course_id/:session_id/:work_id': 'showWorkEditItem',
            'work-new/:course_id/:session_id': 'showWorkNewView',
            'work-edit/:course_id/:session_id/:work_id': 'showWorkEditView',
            'work-add-user/:course_id/:session_id/:work_id': 'showWorkAddUserView',
            'work-missing/:course_id/:session_id/:work_id': 'showWorkMissingView',
            'work-view-user/:course_id/:session_id': 'showWorkStudensListView',
            'list-messages': 'showListMessages',
            'message/:id': 'showMessage',
            'outmessage/:id': 'showOutMessage',
            'reply_message/:id': 'showReplyMessage',
            'new-message': 'showNewMessage',
            'outbox': 'showOutbox',
            'forum/:course_id/:session_id': 'showForum',
            'thread/:course_id/:session_id/:f_id': 'showThreads',
            'post/:course_id/:session_id/:f_id/:t_id': 'showPosts',
            'profile': 'showProfile',
            'new_thread/:course_id/:session_id/:f_id': 'showNewThread',
            'new_post/:course_id/:session_id/:f_id/:t_id': 'showNewPost',
            'reply_post/:course_id/:session_id/:f_id/:t_id/:post_id/:iid': 'showReplyPost',
            'reply_quote/:course_id/:session_id/:f_id/:t_id/:post_id/:iid': 'showQuotePost',
            'ranking/:course_id/:session_id': 'showRanking',
            'details-ranking/:course_id/:session_id/:u_id': 'showDetailsRanking',
            'course-catalog': 'showCourseCatalog',
            'logout/:course_id/:session_id': 'showLogout'
        }
    });

    var campusModel = new CampusModel();
    var messagesCollection = new MessagesCollection();
    var postModel = new PostModel();
    var descriptionsCollections = new DescriptionsCollection();
    var announcementsCollection = new AnnouncementsCollection();
    var postsCollection = new PostsCollection();
    Router.coursesCollection = new CoursesCollection();
    Router.worksMainCollection = new WorksMainCollection();
    Router.worksCollection = new WorksCollection();

    var showIndex = function () {
        console.log("showIndex");
        window.sessionStorage.clear();

        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            $('.fondo-portada').css("background", '' );
            /* Codigo de push */
            var gcmSenderId = campusModel.get('gcmSenderId');
            if (gcmSenderId) {
                pushNotification = window.PushNotification.init({
                    android: {
                        senderID: gcmSenderId
                    },
                    ios: {
                        alert: 'true',
                        badge: 'true',
                        sound: 'true'
                    },
                    windows: {}
                });
                pushNotification.on('error', function (e) {
                    console.log('Error');
                    console.log(e);
                });
                pushNotification.on('registration', function (data) {
                    var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
                    $.post(url, {
                      action: 'gcm_id',
                      registration_id: data.registrationId,
                      username: campusModel.get('username'),
                      api_key: campusModel.get('apiKey')
                    });
                });
                pushNotification.on('notification', function (data) {
                    console.log('Notification');
                    console.log(data);
                });
            }
            /* Fin código de push */
            var homeView = new HomeView({
                model: campusModel
            });
            homeView.render()
            navigator.splashscreen.hide();
        });

        $.when(getCampusData).fail(function () {
            var physicalScreenHeight = window.screen.height * window.devicePixelRatio;
            $('.fondo-portada').css("background", 'linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.9)), url(img/custom/login/fondo_bg.jpg) repeat center top' );
            var loginView = new LoginView();

            document.body.innerHTML = '';
            document.body.appendChild(loginView.render().el);
            navigator.splashscreen.hide();
        });
    };

    var showListCourses = function() {
        console.log("showListCourses");
        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var coursesView = new CoursesView({
                model: campusModel,
                collection: Router.coursesCollection //coursesCollection
            });

            coursesView.render();
        });
    };

    var showInscription = function() {
        console.log("showInscription");
        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var inscriptionView = new InscriptionView({
                model: campusModel
            });

            inscriptionView.render();
        });
    }

    var showCourseCatalog = function() {
        console.log("showCourseCatalog");
        var getCampusData = campusModel.getData();

        $.when(getCampusData).done(function () {
            var catalogView = new CatalogView({
                model: campusModel
            });

            catalogView.render();
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

            /*
            cordova.plugins.firebase.messaging.onMessage(function(payload) {
                inboxView.reloadView();
            });
            */
        });
    };

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
                sessionId: sessionId,
                collection: Router.coursesCollection
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
    
    var showLink = function (courseId, sessionId){
        console.log("showLink");
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
            var linkView = new LinkView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            linkView.render();
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
                    campus:campusModel,
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
    
    var showOutMessage = function (messageId) {
        console.log("showOutMessage");
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
            var outmessageModel = new OutmessageModel();
            var getMessageData = outmessageModel.getData(messageId);
            console.log(messageId);
            $.when(getMessageData).done(function () {
                var outmessageView = new OutmessageView({
                    model: outmessageModel,
                    campus:campusModel,
                    id: messageId
                });

                outmessageView.render();
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
    
    var showWorksMain = function(courseId, sessionId) {
        console.log("showWorksMain");
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
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

        $.when(getCampusData).done(function () {
            var woksMainView = new WorksMainView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                statusUser: courseInfo.get('status_user'),
                collection: Router.worksMainCollection
            });
            woksMainView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        }); 
    }
    
    var showWorkNewView = function(courseId, sessionId) {
        console.log("showWorkNewView");
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
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

        $.when(getCampusData).done(function () {
            if (courseInfo.get('status_user') == "5") {
                var woksMainView = new WorksMainView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    statusUser: courseInfo.get('status_user'),
                    collection: Router.worksMainCollection
                });
                woksMainView.render();
            } else {
                var woksFormNewView = new WorksFormNewView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId
                });
                woksFormNewView.render();
            }
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        }); 
    }

    var showWorkEditView = function(courseId, sessionId, workId) {
        console.log("showWorkEditView");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
        var getCampusData = campusModel.getData();
        var workMain = Router.worksMainCollection.findWhere({c_id: courseId, id: workId});
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

        $.when(getCampusData).done(function () {
            if (courseInfo.get('status_user') == "5") {
                var woksMainView = new WorksMainView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    statusUser: courseInfo.get('status_user'),
                    collection: Router.worksMainCollection
                });
                woksMainView.render();
            } else {
                var woksFormEditView = new WorksFormEditView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    workId: workId,
                    workParent: workMain,
                });
                woksFormEditView.render();
            }
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        }); 
    }

    var showWorkAddUserView = function(courseId, sessionId, workId) {
        console.log("showWorkAddUserView");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
        var getCampusData = campusModel.getData();
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

        $.when(getCampusData).done(function () {
            if (courseInfo.get('status_user') == "5") {
                var woksMainView = new WorksMainView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    statusUser: courseInfo.get('status_user'),
                    collection: Router.worksMainCollection
                });
                woksMainView.render();
            } else {
                var worksAddUserView = new WorksAddUserView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    workId: workId,
                });
                worksAddUserView.render();
            }
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        }); 
    }
    
    var showWorkMissingView = function(courseId, sessionId, workId) {
        console.log("showWorkMissingView");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });

            return;
        }
        var getCampusData = campusModel.getData();
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

        $.when(getCampusData).done(function () {
            if (courseInfo.get('status_user') == "5") {
                var woksMainView = new WorksMainView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    statusUser: courseInfo.get('status_user'),
                    collection: Router.worksMainCollection
                });
                woksMainView.render();
            } else {
                var workMissingView = new WorkMissingView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    workId: workId,
                });
                workMissingView.render();
            }
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        }); 
    }
    
    var showWorkStudensListView = function(courseId, sessionId) {
        console.log("showWorkStudensListView");
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
            var woksStudentsListView = new WorksStudentsListView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            woksStudentsListView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        }); 
    }
    
    var showWorkList = function(courseId, sessionId, workId) {
        console.log("showWorkList");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
            return;
        }
        
        var getCampusData = campusModel.getData();
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});
        var workMain = Router.worksMainCollection.findWhere({c_id: courseId, id: workId});

        $.when(getCampusData).done(function () {
            var workListView = new WorkListView({
                collection: Router.worksCollection,
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                workId: workId,
                workParent: workMain,
                statusUser: courseInfo.get('status_user'),
            });
            workListView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    }
    
    var showWorkUpload = function(courseId, sessionId, workId) {
        console.log("showWorkUpload");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
            return;
        }
        
        var getCampusData = campusModel.getData();
        var workMain = Router.worksMainCollection.findWhere({c_id: courseId, id: workId});

        $.when(getCampusData).done(function () {
            var workUploadView = new WorkUploadView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                workId: workId,
                workParent: workMain
            });
            workUploadView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    }

    var showWorkView = function(courseId, sessionId, workId) {
        console.log("showWorkView");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
            return;
        }
        
        var getCampusData = campusModel.getData();
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});
        var work = Router.worksCollection.findWhere({c_id: courseId, id: workId});

        $.when(getCampusData).done(function () {
            var workViewView = new WorkViewView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                workId: workId,
                workModel: work,
                statusUser: courseInfo.get('status_user'),
            });
            workViewView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    }
    
    var showWorkEditItem = function(courseId, sessionId, workId) {
        console.log("showWorkEditItem");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        workId = parseInt(workId);
        
        if (!courseId) {
            new AlertView({
                model: {
                    message: window.lang.unspecifiedCourse
                }
            });
            return;
        }
        
        var getCampusData = campusModel.getData();
        var courseInfo = Router.coursesCollection.findWhere({c_id: courseId, s_id: sessionId});
        var work = Router.worksCollection.findWhere({c_id: courseId, id: workId});

        $.when(getCampusData).done(function () {
            if (courseInfo.get('status_user') == "5") {
                var woksMainView = new WorksMainView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    statusUser: courseInfo.get('status_user'),
                    collection: Router.worksMainCollection
                });
                woksMainView.render();
            } else {
                var workEditItemView = new WorkEditItemView({
                    model: campusModel,
                    courseId: courseId,
                    sessionId: sessionId,
                    workId: workId,
                    workModel: work,
                    statusUser: courseInfo.get('status_user'),
                });
                workEditItemView.render();
            }
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    }
    
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
    
    var showLogout = function (courseId, sessionId) {
        console.log("showLogout");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        
        var getCampusData = campusModel.getData();
        
        $.when(getCampusData).done(function () {
            var logoutView = new LogoutView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            //logoutView.render();
            
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
        });
        
        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
        
        //var logoutView = new LogoutView({model: campusModel});
        /*
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
        */
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
                poster: '',
                post_id: null
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
    
    var showReplyPost = function (courseId, sessionId, forumId, threadId, postId, iid){
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
        var postModel = postsCollection.get(iid);

        $.when(getCampusData).done(function () {
            var newPostView = new NewPostView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                forum_id: forumId,
                thread_id: threadId,
                title: 'Re: '+postModel.get('title'),
                text: '',
                poster: '',
                post_id: postId
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
    
    var showQuotePost = function (courseId, sessionId, forumId, threadId, postId, iid){
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
        var postModel = postsCollection.get(iid);

        $.when(getCampusData).done(function () {
            var newPostView = new NewPostView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                forum_id: forumId,
                thread_id: threadId,
                title: 'Re: '+postModel.get('title'),
                text: postModel.get('text'),
                poster: postModel.get('poster'),
                post_id: postId
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
    
    var showRanking = function (courseId, sessionId){
        console.log("showRanking");
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
            var rankingView = new RankingView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId
            });
            rankingView.render();
        });

        $.when(getCampusData).fail(function () {
            new AlertView({
                model: {
                    message: window.lang.youHaveNotLogged
                }
            });
        });
    };
    
    var showDetailsRanking = function (courseId, sessionId, userId){
        console.log("showDetailsRanking");
        courseId = parseInt(courseId);
        sessionId = parseInt(sessionId);
        userId = parseInt(userId);
            
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
            var detailsRankingView = new DetailsRankingView({
                model: campusModel,
                courseId: courseId,
                sessionId: sessionId,
                user_id: userId
            });
            detailsRankingView.render();
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
            router.on('route:showInscription', showInscription);
            router.on('route:showDescription', showDescription);
            router.on('route:showLearnpath', showLearnpath);
            router.on('route:showLink', showLink);
            router.on('route:showNotebook', showNotebook);
            router.on('route:showNewNotebook', showNewNotebook);
            router.on('route:showAnnouncements', showAnnouncements);
            router.on('route:showAnnouncement', showAnnouncement);
            router.on('route:showAgenda', showAgenda);
            router.on('route:showWorksMain', showWorksMain);
            router.on('route:showWorkList', showWorkList);
            router.on('route:showWorkUpload', showWorkUpload);
            router.on('route:showWorkView', showWorkView);
            router.on('route:showWorkEditItem', showWorkEditItem);
            router.on('route:showWorkNewView', showWorkNewView);
            router.on('route:showWorkEditView', showWorkEditView);
            router.on('route:showWorkAddUserView', showWorkAddUserView);
            router.on('route:showWorkMissingView', showWorkMissingView);
            router.on('route:showWorkStudensListView', showWorkStudensListView);
            router.on('route:showDocuments', showDocuments);
            router.on('route:showListMessages', showListMessages);
            router.on('route:showMessage', showMessage);
            router.on('route:showOutMessage', showOutMessage);
            router.on('route:showReplyMessage', showReplyMessage);
            router.on('route:showNewMessage', showNewMessage);
            router.on('route:showOutbox', showOutbox);
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
            router.on('route:showCourseCatalog', showCourseCatalog);

            Backbone.history.start();
        }
    };
});
