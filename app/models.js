var app = window.StatTracker;

var Models = app.Models = {};

Models.Base = Backbone.Model.extend({
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

Models.Team = Models.Base.extend({
  resourceName: 'team',
  defaults: {
    name: '',
    id: null
  },

  initialize: function() {
    Models.Base.prototype.initialize.apply(this, arguments);
  },

  players: function() {
    if(app.globalStore.players) {
      return app.globalStore.players.filter({
        team_id: this.id
      });
    } else {
      return [];
    }
  },

  score: function() {
    var score = 0;
    this.players().forEach(function(player) {
      score += player.get('score');
    });
    return score;
  }
});

Models.Player = Models.Base.extend({
  resourceName: 'player',
  defaults: {
    name: '',
    team_id: null,
    id: null,
    score: 0,
  },

  team: function() {
    if(app.globalStore.teams) {
      return app.globalStore.teams.get(this.get('team_id'));
    } else {
      return [];
    }
  },

  stats: function() {
    if(app.globalStore.stats) {
      return app.globalStore.stats.filter({
        player_id: this.id
      });
    } else {
      return [];
    }
  },

  updateScore: function() {
    var score = 0;
    this.stats().forEach(function(stat) {
      score += stat.rule.get('points');
    });
    this.set('score', score);
  }
});

Models.Rule = Models.Base.extend({
  resourceName: 'rule',
  defaults: {
    name: '',
    points: 0
  }
});

Models.Stat = Models.Base.extend({
  resourceName: 'stat',
  defaults: function() {
    return {
      rule_id: null,
      player_id: null,
      created_at: moment()
    }
  },

  rule: function() {
    if(app.globalStore.stats) {
      return app.globalStore.stats.get(this.get('rule_id'));
    } else {
      return [];
    }
  }

});

Models.AutocompleteItem = Models.Base.extend({
  defaults: {
    id: null,
    name: '',
    eligible: true,
    selected: false,
    highlighted: false
  }
});
