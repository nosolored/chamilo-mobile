define([
    'underscore',
    'backbone',
    'collections/outmessages',
    'views/outbox-message',
    'text!template/outbox.html',
    'models/outmessage',
    'views/alert'
], function (
    _,
    Backbone,
    OutmessagesCollection,
    OutboxMessageView,
    OutboxTemplate,
    OutmessageModel,
    AlertView
) {
    var campusModel = null;
    var outmessagesCollection = new OutmessagesCollection();

    var loadOutmessages = function () {
        console.log("loadOutmessages");

        var listId = '';
        outmessagesCollection.each(function(model){
            listId += listId ? '-' : '';
            listId += model.get('messageId');
        });

        console.log("listado de id de mensajes");
        console.log(listId);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getMessages = $.post(url, {
            action: 'user_messages_sent',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            last: campusModel.get('lastOutmessage')
        });

        //console.log(getMessages);

        $.when(getMessages).done(function (response) {
            if (response.error) {
                return;
            }

            console.log(response);

            //Add new messages
            response.data.forEach(function (messageData) {
                outmessagesCollection.create({
                    messageId: parseInt(messageData.id),
                    sender: messageData.receiver.completeName,
                    title: messageData.title,
                    content: messageData.content,
                    hasAttachment: messageData.hasAttachments,
                    sendDate: messageData.sendDate,
                    url: messageData.url
                });
            });

            //Remove messages

            listId.forEach(function (item, index) {
                var getRemoveMessage = $.post(url, {
                    action: 'delete_user_message',
                    username: campusModel.get('username'),
                    api_key: campusModel.get('apiKey'),
                    message_id: item,
                    msg_type: 'sent'
                });

                $.when(getRemoveMessage).done(function (subresponse) {
                    if (!subresponse.error) {
                        console.log('delete sent message: ' + item);
                        outmessagesCollection.removeDB(item);
                    }
                });
            });
            
            if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNewMessages
                    }
                });
                return;
            }

            var lastMessage = _.first(response.data);

            campusModel.save({
                lastOutmessage: parseInt(lastMessage.id),
                lastCheckOutDate: new Date()
            });
        });
    };
    
    var loadAllOutMessages = function () {
        console.log("loadAllOutMessages");

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getMessages = $.post(url, {
            action: 'user_messages_sent',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey')
        });

        $.when(getMessages).done(function (response) {
            if (response.error) {
                return;
            }

            console.log("loadAllOutMessages");
            console.log(response);

            response.data.forEach(function (messageData) {
                outmessagesCollection.create({
                    messageId: parseInt(messageData.id),
                    sender: messageData.receiver.completeName,
                    title: messageData.title,
                    content: messageData.content,
                    hasAttachment: messageData.hasAttachments,
                    sendDate: messageData.sendDate,
                    url: messageData.url
                });
            });

            if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNewMessages
                    }
                });
                return;
            }

            var lastMessage = _.first(response.data);

            campusModel.save({
                lastOutmessage: parseInt(lastMessage.id),
                lastCheckOutDate: new Date()
            });
        });
    };

    var OutboxView = Backbone.View.extend({
        el: 'body',
        template: _.template(OutboxTemplate),
        initialize: function () {
            console.log("initialize outbox");
            $(this.el).unbind();
            outmessagesCollection.unbind();
            outmessagesCollection.reset();
            campusModel = this.model;

            var fetchMessages = outmessagesCollection.fetch(); //Obtener de la base de datos los mensajes guardados

            $.when(fetchMessages).done(function(){
                if(outmessagesCollection.length == 0){
                    loadAllOutMessages();
                }else{
                    loadOutmessages();
                }
            });

            outmessagesCollection.on('add', this.renderMessageAdd, this);
            outmessagesCollection.on('remove', this.renderMessageRemove, this);
            
            this.render();
        },
        render: function () {
            this.el.innerHTML = this.template();
            //console.log(outmessagesCollection);
            outmessagesCollection.each(this.renderMessage, this);

            return this;
        },
        renderMessage: function (messageModel) {
            var outboxMessageView = new OutboxMessageView({
                model: messageModel
            });

            this.$el.find('#outmessages-list').append(outboxMessageView.render().el);
        },
        renderMessageAdd: function (messageModel) {
            var outboxMessageView = new OutboxMessageView({
                model: messageModel
            });
            //this.$el.find('#message'+messageModel.cid).remove();
            this.$el.find('#outmessages-list').append(outboxMessageView.render().el);
        },
        renderMessageRemove: function (messageModel) {
            this.$el.find('#message'+messageModel.cid).remove();
        }
    });

    return OutboxView;
});