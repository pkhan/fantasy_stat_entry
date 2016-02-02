var app = window.StatTracker;

var Views = app.Views = {};

Views.Base = Backbone.View.extend({
  initialize: function() {
    this.render();
  }

});

Views.ItemBase = Views.Base.extend({
  initialize: function() {
    Views.Base.prototype.initialize.apply(this, arguments);
    this.setupListeners();
  },

  setupListeners: function() {
    this.listenTo(this.model, 'change', function() {
      this.update ? this.updateView() : this.render();
    });
  }
});

Views.PlayerList = Views.Base.extend({
  initialize: function() {
    this.subViews = [];
    Views.Base.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', function() {
      this.update();
    });
  },

  render: function() {
    var frag = window.document.createDocumentFragment();
    this.$('.team-name').text(this.model.get('name'));
    var $ul = this.$('ul.players');
    this.subViews = this.model.players().map(function(player) {
      var subView = new Views.Player({
        model: player
      });
      subView.$el.appendTo(frag);
      return subView;
    });
    $ul.empty().append(frag);
  },

  update: function() {
    this.$('.score').text(this.model.get('score'));
  }

});

Views.Player = Views.ItemBase.extend({
  tagName: 'li',
  className: 'player',

  render: function() {
    var content = "<span class='player-name'>";
    content += this.model.get('name');
    content += " </span>";
    content += "<span class='player-score'>";
    content += this.model.get('score');
    content += "</span>";
    this.$el.html(content);
  }
});

Views.StatsView = Views.Base.extend({
  el: '#stat-list',

  initialize: function(options) {
    Views.Base.prototype.initialize.apply(this, arguments);
    this.collection = options.collection;
    this.listenTo(this.collection, 'add', function(stat) {
      this.addStat(stat);
    });
    this.subViews = [];
  },

  addStat: function(stat) {
    console.log("addstat");
    var subView = new Views.StatItemView({
      model: stat
    });
    this.$('ul').append(subView.render().el);
    this.subViews.push(subView);
  }
});

Views.StatItemView = Views.ItemBase.extend({
  tagName: 'li',
  render: function() {
    var timestamp = this.model.get('created_at').format('h:mm');
    var who = this.model.player().get('name');
    var what = this.model.rule().get('name');
    var points = this.model.rule().get('points');
    var together = timestamp + " - " + who + " : " + what + " + " + points;
    this.$el.text(together);
    return this;
  }
});

Views.Header = Views.Base.extend({
  el: '#header',
  events: {
    'submit form': 'handleSubmit'
  },

  initialize: function() {
    this.nameInput = new app.Views.AutocompleteInput({
      allowMultiple: true,
      el: '#who-input',
      selectionList: app.globalStore.players
    });

    this.ruleInput = new app.Views.AutocompleteInput({
      allowMultiple: false,
      el: '#what-input',
      selectionList: app.globalStore.rules
    });
  },

  handleSubmit: function(evt) {
    console.log("two");
    evt.preventDefault();
    var selectedPlayers = this.nameInput.selectionList.selected();
    var selectedRules = this.ruleInput.selectionList.selected();
    if(selectedPlayers.length == 0 || selectedRules.length ==0) {
      return;
    }
    var selectedRule = selectedRules[0];
    selectedPlayers.forEach(function(player) {
      app.globalStore.stats.add({
        player_id: player.id,
        rule_id: selectedRule.id
      });
      app.globalStore.players.get(player.id).updateScore();
    });

    this.nameInput.reset();
    this.ruleInput.reset();
    this.nameInput.$el.blur();
    this.ruleInput.$el.blur();

  }
});

var COMMA = 188;
var ENTER = 13;
var TAB = 9;
var UP = 38;
var DOWN = 40;

Views.AutocompleteInput = Views.Base.extend({
  events: {
    'keyup': 'handleChange',
    'keydown': 'handlePotentialControl',
    'focus': 'handleFocus',
    'blur': 'handleBlur'
  },

  initialize: function(options) {
    this.allowMultiple = options.allowMultiple;
    this.selectionList = app.Collections.AutocompleteItems.buildFromCollection(
      options.selectionList,
      function(player) {
        return {
          name: player.get('name'),
          id: player.get('id')
        };
      }
    );
    this.autocompleteList = new Views.AutocompleteList({
      $inputEl: this.$el,
      selectionList: this.selectionList
    });
    this.autocompleteList.render();
  },

  reset: function() {
    this.$el.val('');
    this.selectionList.resetToBlank();
  },

  handleFocus: function() {
    this.selectionList.resetToBlank();
    this.autocompleteList.show();
  },

  handleBlur: function(evt) {
    this.autocompleteList.hide();
  },

  handleChange: function(evt) {
    var controlCodes = [ENTER,TAB,UP,DOWN,COMMA];
    if(controlCodes.indexOf(evt.which) >= 0) {
      return;
    }
    var input = this.$el.val();
    this.selectionList.filterAndSetMatches(input);
  },

  handlePotentialControl: function(evt) {
    var code = evt.which;
    var val = false;
    if(code == ENTER) {
      console.log("one");
      this.selectionList.setHighlightToSelection();
      val = true;
    }
    if(code == COMMA) {
      this.selectionList.setHighlightToSelection();
      val = true;
      evt.preventDefault();
      this.$el.val('');
    } else if(code == TAB) {
      val = true;
      this.selectionList.setHighlightToSelection();
    } else if(code == UP) {
      this.selectionList.moveHighlightUp();
      val = true;
      evt.preventDefault();
    } else if(code == DOWN) {
      this.selectionList.moveHighlightDown();
      val = true;
      evt.preventDefault();
    }

  }


});

Views.AutocompleteList = Views.Base.extend({
  tagName: 'div',
  className: 'autocomplete-list',

  initialize: function(options) {
    this.$inputEl = options.$inputEl;
    this.selectionList = options.selectionList;
    this.selected = [];
  },

  render: function() {
    var $ul = $('<ul></ul>');
    this.subViews = this.selectionList.map(function(item) {
      subView = new Views.AutocompleteItemView({
        model: item
      });
      $ul.append(subView.render().el);
    });
    this.$el.append($ul);
    $('#main-content').append(this.el);
    return this;
  },

  updatePosition: function() {
    var offset = this.$inputEl.offset();
    var width = this.$inputEl.outerWidth();
    var height = this.$inputEl.outerHeight();
    this.$el.css({
      top: offset.top + height,
      left: offset.left,
      width: width
    });
  },

  show: function() {
    this.updatePosition();
    this.$el.show();
  },

  hide: function() {
    this.$el.hide();
  }

});

Views.AutocompleteItemView = Views.ItemBase.extend({
  tagName: 'li',

  render: function() {
    this.$el.text(this.model.get('name'));
    this.updateView();
    return this;
  },

  updateView: function() {
    if(this.model.get('selected')) {
      this.$el.addClass('selected');
    } else {
      this.$el.removeClass('selected');
    }

    if(this.model.get('highlighted')) {
      this.$el.addClass('highlighted');
    } else {
      this.$el.removeClass('highlighted');
    }

    if(this.model.get('eligible')) {
      this.$el.show();
    } else {
      this.$el.hide();
    }
  }
});
