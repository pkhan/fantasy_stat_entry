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

  moveHighlightUp: function() {
    var eligible = this.eligible();
    var currentHighlight = this.currentHighlight();
    var currentIndex = _.indexOf(eligible, currentHighlight);
    if(currentIndex <= 0) {
      return;
    }
    var newIndex = currentIndex - 1;
    var newHighlight = eligible[newIndex];
    currentHighlight.set('highlighted', false);
    newHighlight.set('highlighted', true);
  },

  moveHighlightDown: function() {
    var eligible = this.eligible();
    var currentHighlight = this.currentHighlight();
    var currentIndex = _.indexOf(eligible, currentHighlight);
    if(currentIndex >= eligible.length - 1 ) {
      return;
    }
    var newIndex = currentIndex + 1;
    var newHighlight = eligible[newIndex];
    currentHighlight.set('highlighted', false);
    newHighlight.set('highlighted', true);
  },

  currentHighlight: function() {
    return this.findWhere({ highlighted: true });
  },

  eligible: function() {
    return this.filter({ eligible: true });
  },

  filterAndSetMatches: function(input) {
    input = input.toLowerCase();
    var inputs = input.split(" ");
    var first = true;
    this.each(function(item) {
      var name = item.get('name').toLowerCase();
      var eligible = false;
      var highlighted = false;
      var indices = inputs.map(function(input) {
        return name.indexOf(input);
      });
      if(_.every(indices, function(index) { return index >= 0})) {
        if(!item.get('selected')) {
          eligible = true;
          if(first) {
            first = false;
            highlighted = true;
          }
        }
      }
      item.set({
        eligible: eligible,
        highlighted: highlighted
      });
    });
  }
});

Collections.AutocompleteItems.buildFromCollection = function(collection, iterator) {
  return new Collections.AutocompleteItems(collection.map(iterator));
};
