define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/newmessage.html',
    'views/alert'
], function ($, _, Backbone, NewMessageTemplate, AlertView) {
    var campusModel = null;

    var NewMessageView = Backbone.View.extend({
        el: 'body',
        template: _.template(NewMessageTemplate),

        initialize: function (options) {
            $(this.el).unbind();
            campusModel = this.model;
        },
        events: {
            'keyup #search-user': 'frmSearchUser',
            'submit #frm-new-message': 'frmNewMessageOnSubmit'
        },
        render: function () {
            this.el.innerHTML = this.template();
            return this;
        },
        frmSearchUser: function (e) {
            var self = this;
            var user_search = self.$('#search-user').val().trim(); 
            if (user_search.length > 2) {

                var options = { dimBackground: true };
                SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

                var url = campusModel.get('url') + '/main/webservices/api/v2.php';
                var getUsers = $.post(url, {
                    action: 'message_users',
                    username: campusModel.get('username'),
                    api_key: campusModel.get('apiKey'),
                    q: user_search
                });

                $.when(getUsers).done(function (response) {
                    if (response.error) {
                        return;
                    }
                    var texto = '';
                    for (var i in response.data){
                        var userData = response.data[i];
                        texto += '<label><input type="checkbox" name="remite[]" value="'+userData.id+'" /> '+userData.name+'</label><br/>';
                    }
                    if(texto == ''){
                        texto = '<div class="alert alert-warning"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+window.lang.NoMatches+'</div>';
                    }
                    $("#box-select-user").html(texto);
                    SpinnerPlugin.activityStop();
                });
            } else {
                var texto = '';
                $("#box-select-user").html(texto);
            }
        },
        frmNewMessageOnSubmit: function (e) {
            e.preventDefault();
            var self = this;
            var list_user = []
            $("input[name='remite[]']:checked").each(function () {
                list_user.push(parseInt($(this).val()));
            });

            var title = self.$('#txt-title').val().trim(); 
            var text = self.$('#txt-text').html();

            if (list_user.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.enterSender
                    }
                });

                return;
            }

            if (!title) {
                new AlertView({
                    model: {
                        message: window.lang.enterTitle
                    }
                });

                return;
            }

            if (!text) {
                new AlertView({
                    model: {
                        message: window.lang.enterText
                    }
                });

                return;
            }

            self.$('#btn-submit').prop('disabled', true);

            var url = campusModel.get('url') + '/main/webservices/api/v2.php';
            var checkingForm = $.post(url, {
                action: 'save_user_message',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                receivers: list_user,
                subject: title,
                text: text
            });

            $.when(checkingForm).done(function (response) {
                if (response.error) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    self.$('#btn-submit').prop('disabled', false);

                    return;
                }

                 window.location.href = '#list-messages';
                
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });

                self.$('#btn-submit').prop('disabled', false);
            });
        }
        
    });

    return NewMessageView;
});
