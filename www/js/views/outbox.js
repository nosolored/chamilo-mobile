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
        
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getMessages = $.post(url, {
            action: 'getOutMessages',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            last: campusModel.get('lastOutmessage'),
            list: listId
        });
        
        //console.log(getMessages);

        $.when(getMessages).done(function (response) {
            if (!response.status) {
                return;
            }
            
            console.log(response);
            
            //Add new messages
            response.messages.forEach(function (messageData) {
                outmessagesCollection.create({
                    messageId: parseInt(messageData.id),
                    sender: messageData.sender.completeName,
                    title: messageData.title,
                    content: messageData.content,
                    hasAttachment: messageData.hasAttachments,
                    sendDate: messageData.sendDate,
                    //url: messageData.platform.messagingTool
                    url: campusModel.get('url') + '/plugin/chamilo_app/inbox.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey') + '&type=1&user_id=' + campusModel.get('user_id') + '&message_id=' + parseInt(messageData.id)
                });
            });
            
            //Remove messages
            response.remove_messages.forEach(function (messageId) {
                console.log(messageId);
                outmessagesCollection.removeDB(messageId);
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
                lastOutmessage: parseInt(lastMessage.id),
                lastCheckOutDate: new Date()
            });
		});
    };
    
    var loadAllOutMessages = function () {
		console.log("loadAllOutMessages");
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getMessages = $.post(url, {
            action: 'getAllOutMessages',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey')
        });

        $.when(getMessages).done(function (response) {
            if (!response.status) {
                return;
            }
			console.log("loadAllOutMessages");
			console.log(response);
            response.messages.forEach(function (messageData) {
                outmessagesCollection.create({
                    messageId: parseInt(messageData.id),
                    sender: messageData.sender.completeName,
                    title: messageData.title,
                    content: messageData.content,
                    hasAttachment: messageData.hasAttachments,
                    sendDate: messageData.sendDate,
                    //url: messageData.platform.messagingTool
                    url: campusModel.get('url') + '/plugin/chamilo_app/inbox.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey') + '&type=1&user_id=' + campusModel.get('user_id') + '&message_id=' + parseInt(messageData.id)
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