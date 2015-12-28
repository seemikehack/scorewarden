//////////////////////
// HELPER FUNCTIONS //
//////////////////////

// Source:
// http://stackoverflow.com/a/2117523 and
// http://stackoverflow.com/a/8809472
function generateUUID() {
   var d = new Date().getTime();
   var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c == 'x' ? r : (r&0x7|0x8)).toString(16);
   });
   return uuid;
};

/////////////////////
// DATA STRUCTURES //
/////////////////////

var PlayerView = Backbone.View.extend({
  initialize: function(opts) {
    this.template = opts.template;
    this.playerId = generateUUID();
    // TODO set playerId as $el id
  },

  className: 'player panel panel-default',

  events: {
    'click .rankButton > button' : 'updateScore',
    'click .removePlayer' : 'removePlayer'
  },

  updateScore: function (e) {
    var btn = $(e.target).closest('button');
    if ($('.player.selected').length && !btn.closest('.player.selected').length)
      $('.player.selected').removeClass('selected');
    var value = btn.closest('.rankGroup').data('rankvalue');
    value = btn.hasClass('down') ? -value : +value;
    var scoreBox = this.$el.find('.score');
    var score = +scoreBox.text() + value;
    scoreBox.text(isNaN(score) ? 0 : score);
  },

  removePlayer: function () {
    this.remove();
    if ($('.player').length <= 8)
      $('#addPlayer').show();
  },

  serialize: function (_sortOrder) {
    return {
      playerName: this.$el.find('.name').text(),
      score: +this.$el.find('.score').text(),
      sortOrder: _sortOrder
    };
  },

  render: function () {
    this.$el.html($(this.template));
    return this;
  }
});

var Scoreboard = Backbone.View.extend({
  el: '.scoreboard',
  init: function (gameData) {
    var addPlayerEl = new PlayerView({id: 'addPlayer', template: $('#addPlayerTemplate').html()}).render().el;
    this.$el.prepend(addPlayerEl);
    this.$addPlayer = $(addPlayerEl);
    this.players = [];
    // FIXME eventually game data will include more than just player data
    gameData.forEach(function (player) {
      // TODO perfect use case for a Backbone Model
      // FIXME what about sorting?
      this.addPlayer(player.playerName, player.score);
    }.bind(this));
  },

  events: {
    'click .addPlayer': 'addPlayer'
  },

  addPlayer: function (name, score) {
    var playerView = new PlayerView({template: $('#playerTemplate').html()});
    this.players.push(playerView);
    var newPlayerEl = playerView.render().el;
    this.$addPlayer.before(newPlayerEl);
    // TODO perfect use case for a Backbone Model
    if (name)
      playerView.$el.find('.name').text(name);
    else
      playerView.$el.find('.name').focus();
    if (score) {
      playerView.$el.find('.score').text(score);
    }
    if ($('.player').length > 8)
      this.$addPlayer.hide();
  },

  clearScores: function () {
    // FIXME kinda hacky, refactor to use stored player views
    $('.score').text('0');
  },

  reset: function () {
    this.$el.empty();
    this.init();
    // TODO clear players
  },

  serialize: function () {
    // TODO extend to support history
    return JSON.stringify(this.players.map(function (v, i) { return v.serialize(i); }));
  }
});

////////////////////
// INITIALIZATION //
////////////////////

var sb = new Scoreboard();
sb.init(JSON.parse(window.localStorage.getItem('scorewardenData')));
$('#confirmClear').click(function () {
  sb.clearScores();
});
$('#confirmReset').click(function () {
  sb.reset();
});

var selectedPlayer;
function selectPlayer() {
  $(selectedPlayer).removeClass('selected');
  selectedPlayer = $($('.player').get(this));
  if (!selectedPlayer.is('#addPlayer'))
    selectedPlayer.addClass('selected');
}
function updateScore() {
  selectedPlayer.find('#'+this).click();
}

// adjusting player numbers to zero-based indexes
Mousetrap.bind('1', selectPlayer.bind('0'));
Mousetrap.bind('2', selectPlayer.bind('1'));
Mousetrap.bind('3', selectPlayer.bind('2'));
Mousetrap.bind('4', selectPlayer.bind('3'));
Mousetrap.bind('5', selectPlayer.bind('4'));
Mousetrap.bind('6', selectPlayer.bind('5'));
Mousetrap.bind('7', selectPlayer.bind('6'));
Mousetrap.bind('8', selectPlayer.bind('7'));

// TODO allow the user to configure this?
Mousetrap.bind('q', updateScore.bind('1up'));
Mousetrap.bind('a', updateScore.bind('1dn'));
Mousetrap.bind('w', updateScore.bind('5up'));
Mousetrap.bind('s', updateScore.bind('5dn'));
Mousetrap.bind('e', updateScore.bind('20up'));
Mousetrap.bind('d', updateScore.bind('20dn'));

window.addEventListener('beforeunload', function () {
  // HACK have to attempt to read the item before writing for the first time
  // prolly a bug, see http://stackoverflow.com/a/13293187
  window.localStorage.getItem('scorewardenData');
  window.localStorage.setItem('scorewardenData', sb.serialize());
});
