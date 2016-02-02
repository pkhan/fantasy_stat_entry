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
  },

  render: function() {
    var frag = window.document.createDocumentFragment();
    var $ul = this.$('ul.players');
    this.subViews = this.model.players().map(function(player) {
      var subView = new Views.Player({
        model: player
      });
      subView.$el.appendTo(frag);
      return subView;
    });
    $ul.empty().append(frag);
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

var COMMA = 188;
var ENTER = 13;
var TAB = 9;
var UP = 38;
var DOWN = 40;

Views.AutocompleteInput = Views.Base.extend({
  events: {
    'keyup': 'handleChange',
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
    this.selected = [];
  },

  handleFocus: function() {
    this.autocompleteList.show();
  },

  handleBlur: function(evt) {
    this.autocompleteList.hide();
  },

  handleChange: function(evt) {
    if(this.checkForControlInput(evt)) {
      return
    }
    var input = this.$el.val();
    this.selectionList.filterAndSetMatches(input);
  },

  checkForControlInput: function(evt) {
    var code = evt.which;
    var val = false;
    if(code == COMMA) {
      val = true;
    } else if(code == TAB) {
      val = true;
    } else if(code == UP) {
      this.selectionList.moveHighlightUp();
      val = true;
    } else if(code == DOWN) {
      this.selectionList.moveHighlightDown();
      val = true;
    }
    if(val) {
      evt.preventDefault();
    }
    return val;
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
