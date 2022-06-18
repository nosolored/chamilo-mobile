define([
    'underscore',
    'backbone',
    'models/link',
    'text!template/link.html',
    'views/alert'
], function (
    _,
    Backbone,
    LinkModel,
    LinkTemplate,
    AlertView
) {
    var campusModel = null;
    var courseId = 0;
    var sessionId = 0;
    var linkModel = new LinkModel();

  var loadLink = function () {
      var options = { dimBackground: true };
      SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

      var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getLink = $.post(url, {
            action: 'course_links',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getLink).done(function (response) {
            if (response.error) {
                SpinnerPlugin.activityStop();
                return;
            }
            
            linkModel.cid = parseInt(""+courseId+'000'+sessionId);
            linkModel.set({"c_id": courseId});
            linkModel.set({"s_id": sessionId});
            linkModel.set({"category": response.data});

            SpinnerPlugin.activityStop();

            if (response.links.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNotebook
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

    var LinkView = Backbone.View.extend({
        el: 'body',
        template: _.template(LinkTemplate),
        initialize: function (options) {
            this.options = options;
            $(this.el).unbind();

            linkModel.unbind();

            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;

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
                loadLink();
            }

            linkModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(linkModel.toJSON());
            return this;
        }
    });

    return LinkView;
});
