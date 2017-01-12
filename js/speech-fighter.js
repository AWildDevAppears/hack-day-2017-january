var TITLE = $('#title');
var WINSTATE = $('#winstate');
var LOSESTATE = $('#losestate');
var READYSTATE = $('#readystate');
var WRAPPER = $('#wrapper');

var PLAYER = $('#player');
var PLAYER_SELECT = $('#character-picker');

var BACKGROUND_MUSIC = $('#background-music');
var SFX = $('#sfx');

var POPUP_NODE = ['#zone-one', '#zone-two', '#zone-three', '#zone-four'];

var OPPONENT_HEALTH_BAR = $('#opponent-health .bar .inner-bar');
var PLAYER_HEALTH_BAR = $('#player-health .bar .inner-bar');

var FULL_HEALTH = 100;

var LEVELS = ['level-one', 'level-two', 'level-three'];


var background = Math.floor(Math.random() * 3);
WRAPPER.addClass(LEVELS[background]);

var BASIC_AI = {
  run: function () {
    switch (Math.floor(Math.random() * 5) + 1) {
      case 1:
        SSF.player.takeDMG(10, 'punch');
        break;
      case 2:
        SSF.player.takeDMG(20, 'kick');
        break;
      case 3:
        SSF.player.takeDMG(15, 'hook');
        break;
      case 4:
        SSF.player.takeDMG(5, 'jab');
        break;
      default:
        SSF.opponent.block();
    }
  }
};

var Game = function () {
  this.player = null;
  this.opponent = null;
  this.looping = false;
};

Game.prototype.start = function () {
  this.opponent = new Opponent();
  this.player = new Player();
  this.looping = true;

  this.opponent.setAI(BASIC_AI);

  READYSTATE.addClass('hidden');
  this.mainLoop();
};

Game.prototype.setCommands = function (commands) {
    if (annyang) {
      annyang.addCommands(commands);
      annyang.start({ autoRestart: true, continuous: false });

      console.log('Annyang ready', Object.keys(commands));
    } else {
      console.error('Cannot set up annyang');
    }
};

Game.prototype.mainLoop = function () {
  var _this = this;

  var loop = setInterval(function () {
    if (_this.opponent.ai) {
      _this.opponent.ai.run();
    }

    if (!_this.looping) {
      clearInterval(loop);
    }
  }, 5000);
};

Game.prototype.displayWin = function () {
  this.looping = false;

  WINSTATE.removeClass('hidden');
};

Game.prototype.displayLose = function () {
  this.looping = false;

  LOSESTATE.removeClass('hidden');
};

Game.prototype.showComicText = function (attackType) {
  var textLocationIndex = Math.floor(Math.random() * 3);
  var textLocation = POPUP_NODE[textLocationIndex];

  console.log('setting ' + attackType, textLocation);

  $(textLocation).addClass(attackType);

  setTimeout(function () {
    console.log('removing');
    $(textLocation).removeClass(attackType);
  }, 3000);
};

/////////////////////

var Opponent = function () {
  this.health = FULL_HEALTH;
  this.ai = null;
  this.face = "";
};

Opponent.prototype.takeDMG = function (dmg, type) {
  SSF.showComicText(type);
  this.health -= dmg;
  OPPONENT_HEALTH_BAR.width(this.health + "%");

  if (this.health <= 0) {
    this.die();
  }
};

Opponent.prototype.setAI = function (ai) {
  this.ai = ai;
};

Opponent.prototype.die = function () {
  SSF.displayWin();
};

Opponent.prototype.heal = function (amount) {
  if (this.health < 100) {
    this.health += amount;
  }
};

///////////////////////////

var Player = function () {
  this.health = FULL_HEALTH;
};

Player.prototype.takeDMG = function (dmg) {
  this.health -= dmg;
  PLAYER_HEALTH_BAR.width(this.health + "%");

  if (this.health <= 0) {
    this.die();
  }
};

Player.prototype.die = function () {
  SSF.displayLose();
};

Player.prototype.heal = function (amount) {
  if (this.health < 100) {
    this.health += amount;
  }
};

var SSF = new Game();

annyang.addCommands(
  {
    'A': function () {
      PLAYER.removeClass('player-harley player-bob');
      PLAYER.addClass('player-hulk');
      PLAYER_SELECT.addClass('hidden');
    },
    'B': function () {
      PLAYER.removeClass('player-harley player-hulk');
      PLAYER.addClass('player-bob');
      PLAYER_SELECT.addClass('hidden');
    },
    'C': function () {
      PLAYER.removeClass('player-bob player-hulk');
      PLAYER.addClass('player-harley');
      PLAYER_SELECT.addClass('hidden');
    },
    'ready': function () {
      PLAYER_SELECT.addClass('hidden');
      annyang.abort();
      annyang.addCommands(controls, true);
      annyang.start({ continuous: false, autoRestart: true });
      SSF.start();
    }
});

  var controls = {
    'punch': function () {
      SSF.opponent.takeDMG(10, 'punch');
    },
    'kick': function () {
      SSF.opponent.takeDMG(20, 'kick');
    },
    'block': function () {
      SSF.player.heal(20);
      SSF.showComicText('block');
    },
    'jab': function () {
      SSF.opponent.takeDMG(5, 'jab');
    },
    'jump': function () {
      SSF.player.heal(10);
      SSF.showComicText('jump');
    },
    'infinity strike': function () {
      SSF.opponent.takeDMG(50, 'kick');
    }
  };

annyang.start({ continuous: false, autoRestart: true });

