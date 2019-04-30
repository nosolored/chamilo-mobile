define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/login.html',
    'models/campus',
    'views/alert'
], function ($, _, Backbone, LoginTemplate, CampusModel, AlertView) {
    var LoginView = Backbone.View.extend({
        tagName: 'section',
        className: 'container',
        template: _.template(LoginTemplate),
        events: {
            'submit #frm-login': 'frmLoginOnSubmit',
            'click #chk-password': 'chkPasswordOnCheck'
        },
        render: function () {
            this.el.innerHTML = this.template();

            return this;
        },
        frmLoginOnSubmit: function (e) {
            e.preventDefault();

            var options = { dimBackground: true };
            SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

            var self = this;

            var hostName = self.$('#txt-hostname').val().trim();
            var username = self.$('#txt-username').val().trim();
            var password = self.$('#txt-password').val().trim();

            if (!hostName) {
                SpinnerPlugin.activityStop();
                new AlertView({
                    model: {
                        message: window.lang.enterTheDomain
                    }
                });

                return;
            }

            if (!username) {
                SpinnerPlugin.activityStop();
                new AlertView({
                    model: {
                        message: window.lang.enterTheUsername
                    }
                });

                return;
            }

            if (!password) {
                SpinnerPlugin.activityStop();
                new AlertView({
                    model: {
                        message: window.lang.enterThePassword
                    }
                });

                return;
            }

            self.$('#btn-submit').prop('disabled', true);

            var checkingLogin = $.post(hostName + '/plugin/chamilo_app/rest.php', {
                action: 'loginNewMessages',
                username: username,
                password: password
            });

            $.when(checkingLogin).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.incorrectCredentials
                        }
                    });

                    self.$('#btn-submit').prop('disabled', false);
                    SpinnerPlugin.activityStop();

                    return;
                }
                
                self.$('body').prop('style', '');
                
                var campusModel = new CampusModel({
                    url: hostName,
                    username: username,
                    apiKey: response.userInfo.apiKey,
                    user_id: response.userInfo.user_id,
                    gcmSenderId: response.gcmSenderId
                });
                var savingCampus = campusModel.save();

                $.when(savingCampus).done(function () {
                    window.location.reload();
                });

                $.when(savingCampus).fail(function () {
                    new AlertView({
                        model: {
                            message: "Account don't saved."
                        }
                    });

                    SpinnerPlugin.activityStop();
                    self.$('#btn-submit').prop('disabled', false);
                });
            });

            $.when(checkingLogin).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });

                SpinnerPlugin.activityStop();
                self.$('#btn-submit').prop('disabled', false);
            });
        },
        chkPasswordOnCheck: function (e) {
            var inputType = e.target.checked ? 'text' : 'password';

            this.$('#txt-password').attr('type', inputType);
        }
    });

    return LoginView;
});
