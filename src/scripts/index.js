window.addEventListener("load", function () {
  const planets = {
    'mercury' : {
      orbit : 20,
      speed : 1.2
    },
    'venus' : {
      orbit : 49.950,
      speed : 1
    },
    'earth' : {
      orbit : 80.973,
      speed : 4.2
    },
    'mars' : {
      orbit : 152.71,
      speed : 3.1
    },
    'jupiter' : {
      orbit : 288.8,
      speed : 20
    },
    'saturn' : {
      orbit : 322.87,
      speed : 15
    },
    'uranus' : {
      orbit : 342.25,
      speed : 10
    },
    'neptune' : {
      orbit : 350.36,
      speed : 9
    }
  }

  // range input buttons
  const rangeButtons = {
    earthOrbit : document.getElementById('earthOrbit'),
    marsOrbit  : document.getElementById('marsOrbit'),
    earthSpeed : document.getElementById('earthSpeed'),
    marsSpeed  : document.getElementById('marsSpeed')
  };
  
  // input planet setter buttons   
  const planetSetters = document.getElementsByClassName('planet-setter');
  // canvas wrapper
  const canvasWrapper = document.querySelector(".canvas-wrapper");
  // canvas
  const canvas_orbit = this.document.getElementById("canvas-background");
  const canvas_bg = this.document.getElementById("canvas-orbit");
  canvas_orbit.width =  window.innerWidth;
  canvas_orbit.height =  window.innerHeight;
  // context
  const ctx_orbit = canvas_orbit.getContext("2d");
  const ctx_bg = canvas_bg.getContext("2d");

  // -- const values --
  const FPS = 120;
  const MsPerFrame = 1000 / FPS;
  const CENTER_X = canvas_orbit.width / 2 - 150;
  const CENTER_Y = canvas_orbit.height / 2;
  const tPI = 2 * Math.PI; 
  
  // -- variables --
  let pause = false;
  let drawingLines = document.getElementById("lines").checked;
  // planets colors
  let earthColor = '#669900';
  let marsColor = '#990033';
  // orbit 
  let orbitStyle =  "rgba(50, 50, 50, 0.2)";
  // lines
  let linesStyle = "rgba(100%, 100%, 100%, 25%)";
  let linesWidth = 1;
  // dots
  let dotsStyle = "#007EA7";
  let dotWidth = 2;
  let dotShadowColor = dotsStyle;
  let dotShadowBlur = 15;
  let last_dot_X, last_dot_Y;
  
  // -- helper functions --
  const $drawDot = (ctx, firstx, firsty) => {
    if(last_dot_X == undefined) {
      [last_dot_X, last_dot_Y] = [firstx, firsty];
      return;
    }
    ctx.save();
    ctx.shadowBlur = dotShadowBlur;
    ctx.shadowColor = dotShadowColor;
    ctx.strokeStyle = dotsStyle;
    ctx.lineWidth = dotWidth;
    ctx.beginPath();
    ctx.moveTo(last_dot_X, last_dot_Y);
    ctx.lineTo(firstx, firsty);
    ctx.stroke();
    [last_dot_X, last_dot_Y] = [firstx, firsty];
    ctx.restore();
  }

  const $drawCircle = (ctx, x, y, r, {
    color,
    fill,
    startAngle = 0,
    endAngle = tPI,
    aCW = true,
    lineWidth = 1.5,
  }) => {
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.moveTo(x, y);
    ctx.beginPath();
    fill && ctx.moveTo(x, y);
    ctx.arc(x, y, r, startAngle, endAngle, aCW);
    fill && ctx.closePath();
    fill ? ctx.fill() : ctx.stroke();
    ctx.restore();
  };

  const $drawLine = (ctx, fromX, fromY, toX, toY, {
    color,
    lineWidth,
  }) => {
    ctx.save();
    ctx.shadowBlur = 2;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.restore();
  };

  const $clearBackground = (alpha = 1) => {
    last_dot_X = last_dot_Y = undefined;
    ctx_bg.save(); 
    ctx_bg.fillStyle = `rgb(20, 20, 20)`;
    ctx_bg.fillRect(0, 0, canvas_orbit.width, canvas_orbit.height)
    ctx_bg.restore();
  }

  const $clearOrbitContext = () => {
    ctx_orbit.clearRect(0, 0, canvas_orbit.width, canvas_orbit.height)
  }
  
  // -- classes -- 
  class Planet {
    constructor(name, radius, color) {
      this.name = name;
      this.posX = 0;
      this.posY = 0;
      this.radius = radius;
      this.color = color;
      this.init();
    }
    init(){
      this.orbit = Math.sqrt(Math.pow(CENTER_X/2 - this.posX, 2), Math.pow(CENTER_Y/2 - this.posY, 2));
      this.angle = Math.atan2(CENTER_Y - this.posY, this.posX - CENTER_X);
      this.velocity = 0;
    }
    update(orbit, velocity){
      this.orbit = orbit;
      this.velocity = velocity / 100;
      this.posX = CENTER_X + this.orbit * Math.cos(this.angle);
      this.posY = CENTER_Y + this.orbit * Math.sin(this.angle);;
      this.angle += this.velocity;
    }
    draw(ctx){
      // draw its orbit
      $drawCircle(ctx, CENTER_X, CENTER_Y, this.orbit,{
        color : orbitStyle,
        fill:0
      });
      // draw solid planet
      $drawCircle(ctx, this.posX, this.posY, this.radius,{
        color: this.color,
        fill:1,
        lineWidth : 10
      });
    }
  }

  class PlanetsVisualizer {
    constructor() {
      this.earth = new Planet('Earth', 10, earthColor);
      this.mars = new Planet('Mars', 20, marsColor);
      
      // resize event listener 
      window.addEventListener('resize', this.resize);
      
      // clear background every time user changes 
      Object.entries(rangeButtons).forEach(entry => {
        const [key, value] = entry;
        value.addEventListener('mouseup', (e)=>{
            $clearBackground();
          })
      });

      document.getElementById("lines")
        .addEventListener('change', (e)=>{
          $clearBackground();
          drawingLines = true;
        });
      
      document.getElementById("dots")
        .addEventListener('change', (e)=>{
          $clearBackground();
          drawingLines = false;
          });

      document.getElementsByClassName("toggle-play")[0]
        .addEventListener('click', (e)=>{
          if(pause){
            e.target.innerHTML = 'PAUSE'
            pause = false;
            animate();
          }else{
            e.target.innerHTML = 'PLAY'
            pause = true;
          }
        });
    
        Array.prototype.forEach.call(planetSetters, function(element) {
          element.addEventListener('click', (e)=>{
            $clearBackground();
            console.log(planets[element.name].speed);
            rangeButtons.earthSpeed.value = planets[element.name].speed;
            rangeButtons.earthOrbit.value = planets[element.name].orbit;
          })
        });
    }

    update() {
      this.earth.update(rangeButtons.earthOrbit.valueAsNumber, rangeButtons.earthSpeed.valueAsNumber);
      this.mars.update(rangeButtons.marsOrbit.valueAsNumber, rangeButtons.marsSpeed.valueAsNumber);
    }

    draw() {
      // draw lines or dots 
      if(drawingLines){
        $drawLine(ctx_bg, this.earth.posX, this.earth.posY,this.mars.posX, this.mars.posY,
          {color: linesStyle, lineWidth: linesWidth}
          );
      }else{
        $drawDot(ctx_bg, this.earth.posX + this.mars.posX /2 - CENTER_X/2, this.earth.posY + this.mars.posY /2 - CENTER_Y/2);
      }
      // clear orbit canvas
      $clearOrbitContext();
      // draw planets
      this.earth.draw(ctx_orbit);
      this.mars.draw(ctx_orbit);
    }

    resize() {
      const width = canvasWrapper.clientWidth;
      const height = canvasWrapper.clientHeight;
      if (canvas_orbit.width !== width || canvas_orbit.height !== height) {
        canvas_orbit.width = width;
        canvas_orbit.height = height;
        canvas_bg.width = width;
        canvas_bg.height = height;
      }
    };
  }
  
  const planetsVisualizer = new PlanetsVisualizer();
  let startTime = 0;
  let endTime = 0;

  //animation loop
  function animate() {
    if(pause) return;

    // start time
    startTime = new Date();

    // do work
    planetsVisualizer.update();
    planetsVisualizer.draw();

    // end time
    endTime = new Date();
    
    const elapsedTime  = (endTime - startTime) / 1000;
    
    if (elapsedTime > MsPerFrame) {
      setTimeout(()=>{
        window.requestAnimationFrame(animate);
      }, MsPerFrame - elapsedTime); 
    }else{
      window.requestAnimationFrame(animate);
    }
  }

  // entry point 
  planetsVisualizer.resize();
  $clearBackground();
  animate();
});