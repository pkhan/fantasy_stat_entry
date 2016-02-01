var app = window.StatTracker;

var Collections = app.Collections = {};

Collections.Base = Backbone.Collection.extend({
  isPreloaded: false,
  resourceName: null,

  initialize: function() {
    Backbone.Model.prototype.initialize.apply(this, arguments);
    this.setPreload();
  },

  setPreload: function() {
    var preloadData = window._preloads[this.resourceName];
    if(preloadData) {
      this.set(preloadData);
      this.isPreloaded = true;
    }
  }
});

Collections.Teams = Collections.Base.extend({
  resourceName: 'teams',
  model: app.Models.Team
});

Collections.Players = Collections.Base.extend({
  resourceName: 'players',
  model: app.Models.Player
});

Collections.Rules = Collections.Base.extend({
  resourceName: 'rules',
  model: app.Models.Rule
});

Collections.Stats = Collections.Base.extend({
  resourceName: 'stats',
  model: app.Models.Stat,
});

Collections.AutocompleteItems = Collections.Base.extend({
  model: app.Models.AutocompleteItem,

  filterAndSetMatches: function(input) {
    this.each(function(item) {
      var name = item.get('name');
      var eligible = false;
      if(name.indexOf(input) >= 0) {
        eligible = true;
      }
      item.set('eligible', eligible);
    });
  }
});

Collections.AutocompleteItems.buildFromCollection = function(collection, iterator) {
  return new Collections.AutocompleteItems(collection.map(iterator));
};
