var snakeGame = (function() {
  var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };
  var initLength = 3;
  var score = 0;

  var canvas, canvasWidth, canvasHeight, ctx;
  var x, y, w, h;
  var snake;
  var target;
  var interval;

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

  function initSnake() {
    x = 0;
    y = 0;

    // rect size
    w = 10;
    h = 10;

    snake = [{ x: x, y: y, w: w, h: h }];

    for (var i = 1; i < initLength; i++) {
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

  function initApp() {
    initCanvas();
    initSnake();
    drawTarget();
    setHiScore(getHiScore());
    go();

    window.addEventListener('keydown', keydownHandle);
  };

  function restart() {
    clearInterval(interval);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    window.removeEventListener('keydown', keydownHandle);
    updateScore(0);
    initApp();
  }

  function drawTarget() {
    var x = Math.random() * (canvasWidth - w);
    var y = Math.random() * (canvasHeight - h);

    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;

    target = { x: x, y: y };

    drawSegment(x, y, w, h);
  };

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
      snake.push({ x: x, y: y, w: w, h: h });
      updateScore(snake.length - initLength);
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

  function setHiScore(value) {
    var hs = document.querySelector('.hi-score');
    if (hs) {
      hs.innerText = value;
    }
  }

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
        restart();
      }
    }, 75);
  }

  function getHiScore() {
    return localStorage.snakeGameHiScore || 0;
  }

  function saveHiScore(value) {
    localStorage.snakeGameHiScore = localStorage.snakeGameHiScore || 0;
    if (localStorage.snakeGameHiScore && value > localStorage.snakeGameHiScore) {
      localStorage.snakeGameHiScore = value;
    }
  }

  function keydownHandle(e) {
    directions[e.keyCode] && go(directions[e.keyCode]);
  }

  return {
    start: initApp
  }
})();