define({
    name: 'chamilo-messaging',
    version: 6,
    TABLE_ACCOUNT: 'account',
    TABLE_MESSAGE: 'message',
	TABLE_MESSAGE_OUT: 'message_out',
    conx: null,
    setUp: function () {
        var deferred = $.Deferred();
        var self = this;

        var dbRequest = window.indexedDB.open(self.name, self.version);
        dbRequest.onupgradeneeded = function (e) {
            var database = e.target.result;
			
			if (database.objectStoreNames.contains(self.TABLE_ACCOUNT)){
		        database.deleteObjectStore(self.TABLE_ACCOUNT);
    		}
			
            var accountStore = database.createObjectStore(self.TABLE_ACCOUNT, {
                autoIncrement: true
            });
            accountStore.createIndex('url', 'url');
            accountStore.createIndex('username', 'username');
            accountStore.createIndex('apiKey', 'apiKey', {
                unique: true
            });
			accountStore.createIndex('user_id', 'user_id', {
                unique: true
            });
			accountStore.createIndex('gcmSenderId', 'gcmSenderId', {
                unique: true
            });
            accountStore.createIndex('lastMessage', 'lastMessage');
            accountStore.createIndex('lastCheckDate', 'lastCheckDate');
			accountStore.createIndex('lastOutmessage', 'lastOutmessage');
            accountStore.createIndex('lastCheckOutDate', 'lastCheckOutDate');

			if (database.objectStoreNames.contains(self.TABLE_MESSAGE)){
		        database.deleteObjectStore(self.TABLE_MESSAGE);
    		}

            var messageStore = database.createObjectStore(self.TABLE_MESSAGE, {
                autoIncrement: true
            });
            messageStore.createIndex('messageId', 'messageId', {
                unique: true
            });
            messageStore.createIndex('title', 'title');
            messageStore.createIndex('sender', 'sender');
            messageStore.createIndex('hasAttachment', 'hasAttachment');
            messageStore.createIndex('sendDate', 'sendDate');
            messageStore.createIndex('content', 'content');
            messageStore.createIndex('url', 'url');
			messageStore.createIndex('read', 'read');
			
			if (database.objectStoreNames.contains(self.TABLE_MESSAGE_OUT)){
		        database.deleteObjectStore(self.TABLE_MESSAGE_OUT);
    		}

            var messageStore = database.createObjectStore(self.TABLE_MESSAGE_OUT, {
                autoIncrement: true
            });
            messageStore.createIndex('messageId', 'messageId', {
                unique: true
            });
            messageStore.createIndex('title', 'title');
            messageStore.createIndex('sender', 'sender');
            messageStore.createIndex('hasAttachment', 'hasAttachment');
            messageStore.createIndex('sendDate', 'sendDate');
            messageStore.createIndex('content', 'content');
            messageStore.createIndex('url', 'url');
        };

        dbRequest.onsuccess = function (e) {
            self.conx = e.target.result;

            deferred.resolve(e);
        };

        dbRequest.onerror = function () {
            deferred.reject();
        };

        return deferred.promise();
    }
});
