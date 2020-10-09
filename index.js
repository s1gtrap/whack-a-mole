(() => {
  const WIDTH = 1024;
  const HEIGHT = 768;
  const CENTER = [(WIDTH - 30) / 2, (HEIGHT - 30) / 2, 30];
  const ROUNDS = 60;

  const elem = document.getElementById('whack-a-mole');
  const scoreElem = document.getElementById('whack-a-mole-score');

  const randMole = () => {
    const d = Math.floor(Math.random() * 3) * 20 + 10;
    return [
      Math.random() * (WIDTH - d),
      Math.random() * (HEIGHT - d),
      d,
    ];
  };

  const regression = (x, y) => {
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXx = x.map((a) => a * a).reduce((a, b) => a + b, 0);
    const sumXy = x.map((a, i) => a * y[i]).reduce((a, b) => a + b, 0);

    const a = (x.length * sumXy - sumX * sumY) / (x.length * sumXx - sumX * sumX);
    const b = (sumY / x.length) - (a * sumX) / x.length;

    return [a, b];
  };

  const createMole = ([x, y, d]) => {
    const mole = document.createElement('div');

    mole.style.width = d;
    mole.style.height = d;
    mole.style.left = x;
    mole.style.top = y;

    return mole;
  };

  const spawnMole = (mole, reset, { click, time } = {}) => {
    let timeout;
    if (time) {
      timeout = setTimeout(() => {
        elem.removeChild(mole);

        reset();
      }, time);
    }

    mole.addEventListener('click', () => {
      elem.removeChild(mole);

      clearTimeout(timeout);

      if (click) {
        click();
      }

      reset();
    });

    elem.appendChild(mole);
  };

  const startGame = () => {
    spawnMole(createMole(CENTER), () => {
      scoreElem.innerHTML = 'Calibrating..';
      let time = (new Date()).getTime();
      const times = [];

      const noteTime = () => {
        const newTime = (new Date()).getTime();
        times.push(newTime - time);
        time = newTime;
      };

      const indices = [
        0.4771212547, // 100
        1.041392685, // 300
        1.707570176, // 500
      ];

      const pythagoras = (a, b) => Math.sqrt(a * a + b * b);

      spawnMole(createMole([CENTER[0] + 100, CENTER[1], 50]), () => {
        noteTime();

        spawnMole(createMole(CENTER), () => {
          spawnMole(createMole([CENTER[0] + 300, CENTER[1], 30]), () => {
            noteTime();

            spawnMole(createMole(CENTER), () => {
              spawnMole(createMole([CENTER[0] + 500, CENTER[1], 10]), () => {
                noteTime();

                const [a, b] = regression(indices, times);

                console.log(`a = ${a}`);
                console.log(`b = ${b}`);

                let round = 0; let
                  clicks = 0;

                scoreElem.innerHTML = 'Score:';

                spawnMole(createMole(CENTER), () => {
                  const spawnRandom = () => {
                    const [x, y, w] = randMole();
                    const d = pythagoras(Math.abs(WIDTH / 2 - x), Math.abs(HEIGHT / 2 - y));
                    const mt = a + b * Math.log2(d / w + 1);

                    console.log(`MT = ${mt}`);

                    setTimeout(() => {
                      spawnMole(createMole([x, y, w]), () => {
                        round += 1;

                        scoreElem.innerHTML = `Score: ${clicks}/${round}`;

                        if (round === ROUNDS) {
                          scoreElem.innerHTML = `Game is over! Your score: ${clicks}/${round}`;

                          startGame();
                        } else {
                          spawnMole(createMole(CENTER), () => {
                            spawnRandom();
                          });
                        }
                      }, {
                        click: () => {
                          clicks += 1;
                        },
                        time: mt,
                      });
                    }, Math.random() * 4000 + 1000);
                  };

                  spawnRandom();
                });
              });
            });
          });
        });
      });
    });
  };

  startGame();
})();
