define([
    'underscore',
    'backbone',
	'models/notebook',
    'text!template/notebook.html',
    'views/alert'
], function (
    _,
    Backbone,
	NotebookModel,
    NotebookTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var notebookModel = new NotebookModel();

  var loadNotebook = function () {
	  console.log("funcion loadNotebook");
	  console.log(window.navigator.onLine);
        /*
		if (!window.navigator.onLine) {
            new AlertView({
                model: {
                    message: window.lang.notOnLine
                }
            });
            return;
        }
		*/

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getNotebook = $.post(url, {
            action: 'getNotebook',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			user_id: campusModel.get('user_id')
        });

        $.when(getNotebook).done(function (response) {
			//console.log(response);
            if (!response.status) {
                return;
            }
			
			notebookModel.set({"c_id": courseId});
			notebookModel.set({"notebooks": response.notebooks});
			notebookModel.cid = courseId;
			
            if (response.notebooks.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNotebook
                    }
                });
                return;
            }
		});
    };

    var NotebookView = Backbone.View.extend({
        el: 'body',
        template: _.template(NotebookTemplate),
        initialize: function () {
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.id;
			console.log("initialize")
			console.log(courseId);
		
            loadNotebook();
            notebookModel.on('change', this.render, this);
        },
        render: function () {
			console.log(notebookModel);
            this.el.innerHTML = this.template(notebookModel.toJSON());
			return this;
        }
    });

    return NotebookView;
});
