define([
    'underscore',
    'backbone',
    'collections/announcements',
    'views/announcement-detalle',
    'text!template/announcements.html',
    'views/alert'
], function (
    _,
    Backbone,
    AnnouncementsCollection,
    AnnouncementDetalleView,
    AnnouncementsTemplate,
    AlertView
) {
    var campusModel = null;
    var courseId = 0;
    var announcementsCollection = null;

    var loadAnnouncements = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getAnnouncements = $.post(url, {
            action: 'course_announcements',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getAnnouncements).done(function (response) {
            if (response.error) {
                SpinnerPlugin.activityStop();
                return;
            }

            response.data.forEach(function (announcementData) {
                if(announcementsCollection.get(announcementData.id) == null){
                    announcementsCollection.create({
                        c_id: courseId,
                        s_id: sessionId,
                        a_id: parseInt(announcementData.id),
                        iid: parseInt(announcementData.id),
                        title: announcementData.title,
                        content: announcementData.content,
                        last_edit: announcementData.date,
                        teacher: announcementData.creatorName
                    });
                }else{
                    var announcement = announcementsCollection.get(announcementData.id);
                    announcement.set({"title": announcementData.title});
                    announcement.set({"content": announcementData.content});
                    announcement.set({"last_edit": announcementData.date});
                    announcement.set({"teacher": announcementData.creatorName});
                    announcementsCollection.set(announcement,{remove: false});
                }
            });
            
            SpinnerPlugin.activityStop();

            if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noAnnouncements
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

    var AnnouncementsView = Backbone.View.extend({
        el: 'body',
        template: _.template(AnnouncementsTemplate),
        initialize: function (options) {
            this.options = options;
            $(this.el).unbind();

            campusModel = this.model;
            announcementsCollection = this.collection;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            announcementsCollection.unbind();
            announcementsCollection.reset();

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
            } else {
                loadAnnouncements();
            }

            announcementsCollection.on('add', this.renderAnnouncement, this);
            announcementsCollection.on('change', this.renderAnnouncement2, this);
        },
        render: function () {
            this.el.innerHTML = this.template();
            this.$el.find('#announcements-list').html('');
            this.$el.find('#btn-back-url').prop('href','#course/'+courseId+'/'+sessionId);
            this.$el.find('#btn-logout-url').prop('href','#logout/'+courseId+'/'+sessionId);
            announcementsCollection.each(this.renderAnnouncement, this);

            return this;
        },
        renderAnnouncement: function (announcementModel) {
            var announcementDetalleView = new AnnouncementDetalleView({
                model: announcementModel
            });

            this.$el.find('#announcements-list').append(announcementDetalleView.render().el);
        },
        renderAnnouncement2: function (announcementModel) {
            var announcementDetalleView = new AnnouncementDetalleView({
                model: announcementModel
            });
            this.$el.find('#item_announcement_'+announcementModel.cid).replaceWith(announcementDetalleView.render().el);
            //this.$el.find('#courses-list').append(courseDetalleView.render().el);
        },
        events: {
            'click #announcements-update': 'announcementsUpdateOnClick'
        },
        announcementsUpdateOnClick: function (e) {
            e.preventDefault();

            loadAnnouncements();
            $(".navbar-toggle").trigger( "click" );
        }
    });

    return AnnouncementsView;
});
