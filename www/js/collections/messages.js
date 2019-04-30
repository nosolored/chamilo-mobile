define([
    'underscore',
    'backbone',
    'database',
    'models/message'
], function (_, Backbone, DB, MessageModel) {
    var MessagesCollection = Backbone.Collection.extend({
        model: MessageModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var messageModel = new MessageModel(attributes); //Crea un objeto (modelo) con los datos de un mensaje
            var saveMessaModel = messageModel.save();		 //Guarda ese mensaje en la base de datos y asigna un cid (id modelo)

			//console.log(messageModel);

            $.when(saveMessaModel).done(function () {
                self.add(messageModel);						// Añade el objeto (modelo) a la coleccion

                deferred.resolve();
            });

            $.when(saveMessaModel).fail(function () {
                deferred.reject();
            });

            return deferred.promise();
        },
        fetch: function () {
            var self = this;
            var deferred = $.Deferred();
            var transaction = DB.conx.transaction([
                DB.TABLE_MESSAGE
            ], 'readonly');
            var store = transaction.objectStore(DB.TABLE_MESSAGE);
            var index = store.index('sendDate');
            var request = index.openCursor(null, 'prev');

            request.onsuccess = function (e) {
                var cursor = e.target.result;

                if (cursor) {
                    var message = new MessageModel(cursor.value);
                    message.cid = cursor.primaryKey;

                    self.add(message);

                    cursor.continue();
                } else {
                    deferred.resolve();
                }
            };

            request.onerror = function () {
                deferred.reject();
            };

            return deferred.promise();
        },
		removeDB: function (messageId){
			var self = this;	
			var deferred = $.Deferred();
            var transaction = DB.conx.transaction([
                DB.TABLE_MESSAGE
            ], 'readonly');
            var store = transaction.objectStore(DB.TABLE_MESSAGE);
            var index = store.index('messageId');
			
			var requestKey = index.getKey(parseInt(messageId));
			
			requestKey.onsuccess = function (e) {
                if (requestKey.result) {
                    var cid = requestKey.result;
					var message = self.get(cid);
					var removeMessaModel = message.removeDB();
					
					$.when(removeMessaModel).done(function () {
						self.remove(message);
						deferred.resolve();
					});
		
					$.when(removeMessaModel).fail(function () {
						deferred.reject();
					});
				} else {
					console.log("NULL");
				    deferred.reject();
                }
            };

            requestKey.onerror = function () {
                deferred.reject();
            };
			
			return deferred.promise();
		}
    });

    return MessagesCollection;
});
