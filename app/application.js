var app = window.StatTracker;

app.teams = app.globalStore.teams = new app.Collections.Teams();
app.players = app.globalStore.players = new app.Collections.Players();
app.rules = app.globalStore.rules = new app.Collections.Rules();
app.stats = app.globalStore.stats = new app.Collections.Stats();

$(document).on('ready', function() {
  app.team1List = new app.Views.PlayerList({
    el: '#left-players',
    model: app.teams.get(0)
  });
  app.team2List = new app.Views.PlayerList({
    el: '#right-players',
    model: app.teams.get(1)
  });

  app.headerView = new app.Views.Header();

  app.statsView = new Views.StatsView({
    collection: app.stats
  });

});