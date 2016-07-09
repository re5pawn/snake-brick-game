
// TODO:
// - sometimes no target
// - play/pause using space
// - edge if touch itself

var snakeGame = (function() {
  var initSnakeLength = 3;
  var score = 0;

  var hiScore, needHiScoreCheck;
  function initApp(mode) {
    hiScore = getHiScore();
    needHiScoreCheck = !!Number(hiScore);

    initCanvas();
    initSounds();
    initSnake();
    drawTarget();
    setHiScore(hiScore);

    if (mode !== 'restart') {
      startSound.play();
    }

    go();

    window.addEventListener('keydown', keydownHandle);
  };

  var canvas, canvasWidth, canvasHeight, ctx;
  function initCanvas() {
    canvas = document.getElementById('game');
    if (!canvas) {
      alert('Error: try a next time');
    }

    canvas.width = 280;
    canvas.height = 400;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    ctx = canvas.getContext('2d');
  }

  var startSound, successSound, edgeSound, hiScoreSound;
  function initSounds() {
    var base = 'sounds/';

    startSound = new Audio(base + 'start.wav');
    successSound = new Audio(base + 'success.wav');
    edgeSound = new Audio(base + 'edge.wav');
    hiScoreSound = new Audio(base + 'hi-score.wav');
  }

  var snake, x, y, w, h;
  function initSnake() {
    x = 0;
    y = 0;

    // rect size
    w = 10;
    h = 10;

    snake = [{ x: x, y: y, w: w, h: h }];

    for (var i = 1; i < initSnakeLength; i++) {
      snake.push({ x: x += 10, y: y, w: w, h: h });
    }

    drawSnake();
  }

  function drawSnake() {
    snake.forEach(function(s) {
      drawSegment(s.x, s.y, s.w, s.h);
    });
  }

  function drawSegment(x, y, w, h, mainColor) {
    mainColor = mainColor || '#000';

    // outer part
    ctx.fillStyle = mainColor;
    ctx.fillRect(x, y, w - 1, h - 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 1, y + 1, w - 3, h - 3);

    // inner part
    ctx.fillStyle = mainColor;
    ctx.fillRect(x + 2, y + 2, w - 5, h - 5);
  }

  function redrawSnake() {
    snake.forEach(function(s) {
      ctx.clearRect(s.x, s.y, s.w, s.h);
    });

    snake.shift();
    snake.push({ x: x, y: y, w: w, h: h });

    drawSnake();
  }

  var target;
  function drawTarget() {
    var x = Math.random() * (canvasWidth - w);
    var y = Math.random() * (canvasHeight - h);

    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;

    target = { x: x, y: y };

    drawSegment(x, y, w, h);
  };

  function restart() {
    clearInterval(interval);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    window.removeEventListener('keydown', keydownHandle);
    updateScore(0);
    hiScoreSound = new Audio('sounds/hi-score.wav');
    initApp('restart');
  }

  function isEdge() {
    var head = snake.length - 1;

    return snake[head].x >= canvasWidth ||
      snake[head].x < 0 ||
      snake[head].y >= canvasHeight ||
      snake[head].y < 0;
  }

  function checkAchievement() {
    var head = snake.length - 1;

    if (snake[head].x === target.x && snake[head].y === target.y) {
      successSound.play();
      snake.push({ x: x, y: y, w: w, h: h });
      updateScore(snake.length - initSnakeLength);
      checkHiScore();
      drawTarget();
    }
  }

  function updateScore(nextValue) {
    score = nextValue;
    var s = document.querySelector('.current-score');
    if (s) {
      s.innerText = score;
    }
  }

  function getHiScore() {
    return localStorage.snakeGameHiScore || 0;
  }

  function setHiScore(value) {
    var hs = document.querySelector('.hi-score');
    if (hs) {
      hs.innerText = value;
    }
  }

  function checkHiScore() {
    if (!needHiScoreCheck || Number(score) <= Number(hiScore)) {
      return;
    }

    hiScoreSound && hiScoreSound.play();
    hiScoreSound = null;
    saveHiScore(score);
    setHiScore(score);
  }

  function saveHiScore(value) {
    localStorage.snakeGameHiScore = localStorage.snakeGameHiScore || 0;
    if (localStorage.snakeGameHiScore && value > localStorage.snakeGameHiScore) {
      localStorage.snakeGameHiScore = value;
    }
  }

  var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };
  var interval;
  function go(direction) {
    direction = direction || 'right';
    if (interval) {
      clearInterval(interval);
    }

    interval = setInterval(function() {
      switch (direction) {
        case 'right':
          x += 10;
          break;
        case 'down':
          y += 10;
          break;
        case 'left':
          x -= 10;
          break;
        case 'up':
          y -= 10;
          break;
      }

      redrawSnake();
      checkAchievement();

      if (isEdge()) {
        saveHiScore(score);
        edgeSound.play();
        restart();
      }
    }, 75);
  }

  function keydownHandle(e) {
    directions[e.keyCode] && go(directions[e.keyCode]);
  }

  return {
    start: initApp
  }
})();