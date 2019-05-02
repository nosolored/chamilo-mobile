define([
    'underscore',
    'backbone',
    'collections/messages',
    'views/inbox-message',
    'text!template/inbox.html',
    'models/message',
    'views/alert'
], function (
    _,
    Backbone,
    MessagesCollection,
    InboxMessageView,
    InboxTemplate,
    MessageModel,
    AlertView
) {
    var campusModel = null;
    var messagesCollection = new MessagesCollection();

    var loadMessages = function () {
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
        
        var listId = '';
        messagesCollection.each(function(model){
            listId += listId ? '-' : '';
            listId += model.get('messageId');
        });
        
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getMessages = $.post(url, {
            action: 'getNewMessages',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            last: campusModel.get('lastMessage'),
            list: listId
        });

        $.when(getMessages).done(function (response) {
            if (!response.status) {
                return;
            }
            
            //Add new messages
            response.messages.forEach(function (messageData) {
                messagesCollection.create({
                    messageId: parseInt(messageData.id),
                    sender: messageData.sender.completeName,
                    title: messageData.title,
                    content: messageData.content,
                    hasAttachment: messageData.hasAttachments,
                    sendDate: messageData.sendDate,
                    //url: messageData.platform.messagingTool
                    url: campusModel.get('url') + '/plugin/chamilo_app/inbox.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey') + '&user_id=' + campusModel.get('user_id') + '&message_id=' + parseInt(messageData.id),
                    read: messageData.status
                });
            });
            
            //Remove messages
            response.remove_messages.forEach(function (messageId) {
                messagesCollection.removeDB(messageId);
            });
            

            if (response.messages.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNewMessages
                    }
                });
                return;
            }

            var lastMessage = _.first(response.messages);

            campusModel.save({
                lastMessage: parseInt(lastMessage.id),
                lastCheckDate: new Date()
            });
        });
    };
    
    var loadAllMessages = function () {
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getMessages = $.post(url, {
            action: 'getAllMessages',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey')
        });

        $.when(getMessages).done(function (response) {
            if (!response.status) {
                return;
            }

            response.messages.forEach(function (messageData) {
                messagesCollection.create({
                    messageId: parseInt(messageData.id),
                    sender: messageData.sender.completeName,
                    title: messageData.title,
                    content: messageData.content,
                    hasAttachment: messageData.hasAttachments,
                    sendDate: messageData.sendDate,
                    //url: messageData.platform.messagingTool
                    url: campusModel.get('url') + '/plugin/chamilo_app/inbox.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey') + '&user_id=' + campusModel.get('user_id') + '&message_id=' + parseInt(messageData.id),
                    read: messageData.status
                });
            });

            if (response.messages.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNewMessages
                    }
                });
                return;
            }

            var lastMessage = _.first(response.messages);

            campusModel.save({
                lastMessage: parseInt(lastMessage.id),
                lastCheckDate: new Date()
            });
        });
    };

    var InboxView = Backbone.View.extend({
        el: 'body',
        template: _.template(InboxTemplate),
        initialize: function () {
            $(this.el).unbind();
            messagesCollection.unbind();
            messagesCollection.reset();
            campusModel = this.model;

            var fetchMessages = messagesCollection.fetch(); //Obtener de la base de datos los mensajes guardados

            $.when(fetchMessages).done(function(){
                if(messagesCollection.length == 0){
                    loadAllMessages();
                }else{
                    loadMessages();
                }
            });
            
            messagesCollection.on('add', this.renderMessageAdd, this);
            messagesCollection.on('remove', this.renderMessageRemove, this);
            
            this.render();
        },
        render: function () {
            this.el.innerHTML = this.template();
            messagesCollection.each(this.renderMessage, this);

            return this;
        },
        renderMessage: function (messageModel) {
            var inboxMessageView = new InboxMessageView({
                model: messageModel
            });

            this.$el.find('#messages-list').append(inboxMessageView.render().el);
        },
        renderMessageAdd: function (messageModel) {
            var inboxMessageView = new InboxMessageView({
                model: messageModel
            });
            //this.$el.find('#message'+messageModel.cid).remove();
            this.$el.find('#messages-list').append(inboxMessageView.render().el);
        },
        renderMessageRemove: function (messageModel) {
            this.$el.find('#message'+messageModel.cid).remove();
        },
        events: {
            'click #messages-update': 'messagesUpdateOnClick'
        },
        messagesUpdateOnClick: function (e) {
            e.preventDefault();
            loadMessages();
            $(".navbar-toggle").trigger( "click" );
        }

    });

    return InboxView;
});
