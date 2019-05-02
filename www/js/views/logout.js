define([
    'underscore',
    'backbone',
    'text!template/logout.html'
], function (_, Backbone, LogoutTemplate) {
    var LogoutView = Backbone.View.extend({
        className: 'container',
        template: _.template(LogoutTemplate),
        initialize: function () {
            var success = function(status) {
                //alert('Message: ' + status);
            };
            var error = function(status) {
                //alert('Error: ' + status);
            };
            window.CacheClear(success, error);
        },
        render: function () {
            this.el.innerHTML = this.template();

            return this;
        }
    });

    return LogoutView;
});
