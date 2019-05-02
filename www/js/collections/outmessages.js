define([
    'underscore',
    'backbone',
    'database',
    'models/outmessage'
], function (_, Backbone, DB, OutmessageModel) {
    var OutmessagesCollection = Backbone.Collection.extend({
        model: OutmessageModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var outmessageModel = new OutmessageModel(attributes); 
            var saveMessaModel = outmessageModel.save();		 
			console.log(outmessageModel);

            $.when(saveMessaModel).done(function () {
                self.add(outmessageModel);						// AÃ±ade el objeto (modelo) a la coleccion
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
                DB.TABLE_MESSAGE_OUT
            ], 'readonly');
            var store = transaction.objectStore(DB.TABLE_MESSAGE_OUT);
            var index = store.index('sendDate');
            var request = index.openCursor(null, 'prev');

            request.onsuccess = function (e) {
                var cursor = e.target.result;

                if (cursor) {
                    var message = new OutmessageModel(cursor.value);
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
                DB.TABLE_MESSAGE_OUT
            ], 'readonly');
            var store = transaction.objectStore(DB.TABLE_MESSAGE_OUT);
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

    return OutmessagesCollection;
});
