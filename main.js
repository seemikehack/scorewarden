/////////////////////
// DATA STRUCTURES //
/////////////////////

var PlayerView = Backbone.View.extend({
  initialize: function(opts) {
    this.template = opts.template;
  },
  className: 'player panel panel-default',
  events: {
    'click .rankButton > button' : 'updateScore',
    'click .addPlayer' : 'addPlayer',
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
  addPlayer: function () {
    var newPlayerEl = new PlayerView({template: $('#playerTemplate').html()}).render().el;
    this.$el.before(newPlayerEl);
    $(newPlayerEl).find('.name').focus();
    if ($('.player').length > 8)
      this.$el.hide();
  },
  removePlayer: function () {
    this.remove();
    if ($('.player').length <= 8)
      $('#addPlayer').show();
  },
  render: function () {
    this.$el.html($(this.template));
    return this;
  }
});

var Scoreboard = Backbone.View.extend({
  el: '.scoreboard',
  init: function () {
    this.$el.prepend(new PlayerView({id: 'addPlayer', template: $('#addPlayerTemplate').html()}).render().el);
  },
  reset: function () {
    this.$el.empty();
    this.init();
  }
});

////////////////////
// INITIALIZATION //
////////////////////

var sb = new Scoreboard();
sb.init();
$('#confirmReset').click(function (e) {
  e.preventDefault();
  sb.reset();
})

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
