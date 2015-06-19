var BaseSubscription = require('realizehit-subscription');

function Subscription(server, pattern) {

      console.log(pattern);
      BaseSubscription.call(this, pattern);

      this.pattern = pattern;
      this.server = server;
      this.clients = [];

}

Subscription.prototype = Object.create(BaseSubscription.prototype);

// Export it
module.exports = Subscription;

Subscription.prototype.subscribe = function() {

      if (this.status !== Subscription.STATUS.SUBSCRIBED) {
            this.status = Subscription.STATUS.SUBSCRIBED;
            this.server.redis.psubscribe(this.pattern);
      }

      return this;
};

Subscription.prototype.unsubscribe = function() {

      if (this.status !== Subscription.STATUS.UNSUBSCRIBED) {
            this.status = Subscription.STATUS.SUBSCRIBED; //Subscription.STATUS.UNSUBSCRIBED ??
            this.server.redis.punsubscribe(this.pattern);
      }

      return this;
};

Subscription.prototype.onMessage = function(filters, payload) {

};

Subscription.prototype.gracefulRemove = function() {
      delete this.server.subscriptions[this.pattern];
};

// if user doesnt have subscribed this channel, subscribe
Subscription.prototype.bindClient = function(client) {
      var i = this.clients.indexOf(client);

      if (i === -1) {
            this.clients.push(client);

            if (this.clients.length === 1) {
                  this.subscribe();
            }
      }

      return this;
};

// if the user doesnt have unsubscribed, unsubscribe
Subscription.prototype.unbindClient = function(client) {
      var i = this.clients.indexOf(client);

      if (i !== -1) {
            this.clients.splice(i, 1);

            if (this.clients.length === 0) {
                  this.unsubscribe();
                  this.gracefulRemove();
            }
      }
};
