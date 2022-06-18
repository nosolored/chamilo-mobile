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

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getForums = $.post(url, {
            action: 'course_forum',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
            course: courseId,
            session: sessionId,
            forum: forumId
        });

        $.when(getForums).done(function (response) {

            if (response.error) {
                return;
            }

            //console.log(response);

            forum_title = response.data.title;
            infoModel.set("forum_title", forum_title);
            response.data.threads.forEach(function (threadData) {
                var cid = parseInt("" + courseId + "00" + response.data.id + "00" + threadData.id);
                if(threadsCollection.get(cid) == null){
                    threadsCollection.create({
                        c_id: parseInt(courseId),
                        forum_id: parseInt(response.data.id),
                        title: threadData.title,
                        thread_id: parseInt(threadData.id),
                        replies: parseInt(threadData.numberOfReplies),
                        views: threadData.numberOfViews,
                        thread_poster_name: threadData.author,
                        last_post_date: threadData.lastPostDate,
                        last_poster: threadData.lastPosterName,
                        insert_date: threadData.insertDate,
                        iconnotify: threadData.notifyIcon,
                        image: threadData.authorAvatar
                    });
                }else{
                    var thread = threadsCollection.get(cid);
                    thread.set({"title": threadData.title});
                    thread.set({"replies": threadData.numberOfReplies});
                    thread.set({"views": threadData.numberOfViews});
                    thread.set({"thread_poster_name": threadData.author})
                    thread.set({"last_post_date": threadData.lastPostDate});
                    thread.set({"last_poster": threadData.lastPosterName});
                    thread.set({"insert_date": threadData.insertDate});
                    thread.set({"iconnotify": threadData.notifyIcon});
                    thread.set({"image": threadData.authorAvatar});
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

            var url = campusModel.get('url') + '/main/webservices/api/v2.php';
            var checkingNotify = $.post(url, {
                action: 'set_thread_notify',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                course: courseId,
                session: sessionId,
                thread: thread_id.substring(6)
            });

            $.when(checkingNotify).done(function (response) {
                if (response.error) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });
                    return;
                }

                new AlertView({
                    model: {
                        message: response.data.message
                    }
                });

                var src = self.$('#'+thread_id).attr("src");
                if (src.indexOf("notification_mail_na") > 0) {
                    self.$('#'+thread_id).attr("src", "img/icons/22/notification_mail.png");
                } else {
                    self.$('#'+thread_id).attr("src", "img/icons/22/notification_mail_na.png");
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
