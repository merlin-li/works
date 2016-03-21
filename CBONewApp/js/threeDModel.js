/**
 * This is a 3d model chart of jQuery plugin.
 */
(function($){ 
  var data = [0.6, 0.3, 0.1],
      points = new Array(3),
      edgePoints = new Array(3),
      paths = new Array(),
      dragImages = new Array(3),
      _this, $this,
      defaults = {
        images: [],
        data: [0.400, 0.300, 0.300]
      },
      paper, height, width, diameter, defaults, text1, text2, text3;

    function processDrag(i) {
      // Draggable Point
      var dragPoint = paper.image(defaults.images[i], points[i].x - 16.5,
      points[i].y - 16, 33, 32).attr({
          cursor: "move"
      });
      dragPoint.index = i;

      var dragger = function () {
        this.ox = this.attr("x");
        this.oy = this.attr("y");
        this.animate({
            "opacity": .5
        }, 500);
      },
      move = function (dx, dy) {
          var xDrag = this.ox + dx;
          var yDrag = this.oy + dy;

          var nearest = closestPolyLinePoint(xDrag, yDrag, width / 2, height / 2,
          width / 2 + Math.sin(Math.PI * 2 / 3 * i) * 3 * diameter / 2 * 0.45, height / 2 - Math.cos(Math.PI * 2 / 3 * i) * 3 * diameter / 2 * 0.45);
          if (!isInCircle(nearest.y)) {
            return;
          }
          
          //reCalculatePoints(i, nearest.y - points[i].y)
          points[i].x = nearest.x;
          points[i].y = nearest.y;
          reCalculatePercentage();
          
          var att = {
              x: nearest.x - 11,
              y: nearest.y - 10
          };
          
          this.attr(att);
          paper.safari();
          
          drawLines();
          drawDragImages();
          drawPercentageText();
      },
      up = function () {
          this.animate({
              "opacity": 1
          }, 500);
      };

      dragImages[i] = dragPoint;
      dragPoint.drag(move, dragger, up);

    }

    function initialController() {      
        paper = Raphael(_this, width, height);  
        var input = new Array();  
        
        // Calculate 3 points positions        
        calculatePoints(diameter);
        drawCircles(diameter);        
        drawLines();
        
        //draw lines between points and center
        // Line to center point
        for (var i = 0; i < data.length; i++) {
            var x_pos = width / 2 + Math.sin(Math.PI * 2 / 3 * i) * diameter / 2
            var y_pos = height / 2 - Math.cos(Math.PI * 2 / 3 * i) * diameter / 2;
            edgePoints[i] = {x: x_pos, y: y_pos};
            paper.path("M" + width / 2 + " " + height / 2 + "L" + x_pos + " " + y_pos).attr({
                stroke: "#ddd",
                "stroke-width": 2
            });
        }
        drawFullValueText(); 
       
        for (var i = 0; i < points.length; i++) {
            // For closure
            processDrag(i);
        }
        drawPercentageText('init');
    }

    function closestPolyLinePoint(px, py, x0, y0, x1, y1, etc, etc, etc) {
      function dotLineLength(x, y, x0, y0, x1, y1, o) {
          function lineLength(x, y, x0, y0) {
              return Math.sqrt((x -= x0) * x + (y -= y0) * y);
          }
          if (o && !(o = function (x, y, x0, y0, x1, y1) {
              if (!(x1 - x0)) return {
                  x: x0,
                  y: y
              };
              else if (!(y1 - y0)) return {
                  x: x,
                  y: y0
              };
              var left, tg = -1 / ((y1 - y0) / (x1 - x0));
              return {
                  x: left = (x1 * (x * tg - y + y0) + x0 * (x * -tg + y - y1)) / (tg * (x1 - x0) + y0 - y1),
                  y: tg * left - tg * x + y
              };
          }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))) {
              var l1 = lineLength(x, y, x0, y0),
                  l2 = lineLength(x, y, x1, y1);
              return l1 > l2 ? l2 : l1;
          } else {
              var a = y0 - y1,
                  b = x1 - x0,
                  c = x0 * y1 - y0 * x1;
              return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
          }
      };
      for (var args = [].slice.call(arguments, 0), lines = []; args.length > 4; lines[lines.length] = {
          y1: args.pop(),
          x1: args.pop(),
          y0: args.pop(),
          x0: args.pop()
      });
      if (!lines.length) return {
          x: px,
          y: py
      };
      for (var l, i = lines.length - 1, o = lines[i],
      lower = {
          i: i,
          l: dotLineLength(px, py, o.x0, o.y0, o.x1, o.y1, 1)
      };
      i--; lower.l > (l = dotLineLength(px, py, (o = lines[i]).x0, o.y0, o.x1, o.y1, 1)) && (lower = {
          i: i,
          l: l
      }));
      py < Math.min((o = lines[lower.i]).y0, o.y1) ? py = Math.min(o.y0, o.y1) : py > Math.max(o.y0, o.y1) && (py = Math.max(o.y0, o.y1));
      px < Math.min(o.x0, o.x1) ? px = Math.min(o.x0, o.x1) : px > Math.max(o.x0, o.x1) && (px = Math.max(o.x0, o.x1));
      Math.abs(o.x0 - o.x1) < Math.abs(o.y0 - o.y1) ? px = (py * (o.x0 - o.x1) - o.x0 * o.y1 + o.y0 * o.x1) / (o.y0 - o.y1) : py = (px * (o.y0 - o.y1) - o.y0 * o.x1 + o.x0 * o.y1) / (o.x0 - o.x1);
      return {
          x: px,
          y: py
      };
    };
    
    //draw lines between three points
    function drawLines() {
      var pathString, c,
          pathAttr = {
            stroke: "#FBB613",
            "stroke-width": 8
          };
      //draw lines between points
        for (var i = 0; i < points.length; i++) {
            // Line between each other
            if (i != 0) {
              pathString = "M" + points[i - 1].x + " " + points[i - 1].y + "L" + points[i].x + " " + points[i].y;
            } else {
              pathString = "M" + points[2].x + " " + points[2].y + "L" + points[i].x + " " + points[i].y;
            }
            
            if (paths[i]) {
              paths[i].attr({path: pathString});
            } else {
              c = paper.path(pathString).attr(pathAttr);
              paths[i] = c;
            }
        }
    }
    
    function drawDragImages() {
      for (var i = 0; i < dragImages.length; i++) {
        dragImages[i].attr({x: points[i].x - 15, y: points[i].y - 15});
      }
    }
    
    function drawCircles(diameter) {
        var dashed = {
            fill: "none",
            stroke: "#ddd",
            "stroke-width": 2,
            "stroke-dasharray": "- "
        };
      // Circle
        paper.circle(width / 2, height / 2, diameter / 2 * 1).attr(dashed);
        paper.circle(width / 2, height / 2, diameter / 2 * 0.8).attr(dashed);
        paper.circle(width / 2, height / 2, diameter / 2 * 0.6).attr(dashed);
        paper.circle(width / 2, height / 2, diameter / 2 * 0.4).attr(dashed);
        paper.circle(width / 2, height / 2, diameter / 2 * 0.2).attr(dashed);
    }
    
    function calculatePoints(diameter) {
      for (var i = 0; i < data.length; i++) {
            var x_pos = width / 2 + Math.sin(Math.PI * 2 / 3 * i) * data[i] * diameter / 2;
            var y_pos = height / 2 - Math.cos(Math.PI * 2 / 3 * i) * data[i] * diameter / 2;
            points[i] = {
                x: x_pos,
                y: y_pos
            };
        }
    }
    
    //calculate the percent data
    function reCalculatePercentage() {
      data[0] = 1 - (points[0].y - edgePoints[0].y) / (diameter / 2);
      data[1] = ((points[1].y - edgePoints[0].y - (diameter / 2 )) * 2) / (diameter / 2);
      data[2] = ((points[2].y - edgePoints[0].y - (diameter / 2 )) * 2) / (diameter / 2);
    }
    
    //calculate the points position when drags point
    function reCalculatePoints(i, y) {
      if (i === 0) {
        points[1].x += (y) * Math.sin(Math.PI / 3) * calculateTwoPointsPercentage(data[1], data[2]);
        points[1].y += y / 2 * calculateTwoPointsPercentage(data[1], data[2]);
        points[2].x -= (y) * Math.sin(Math.PI / 3) * calculateTwoPointsPercentage(data[2], data[1]);
        points[2].y += y / 2 * calculateTwoPointsPercentage(data[2], data[1]);
      } else if (i === 1) {
        points[0].y += 2 * y * calculateTwoPointsPercentage(data[0], data[2]);
        points[2].x += 2 * y * Math.sin(Math.PI / 3) * calculateTwoPointsPercentage(data[2], data[0]);
        points[2].y -= y * calculateTwoPointsPercentage(data[2], data[0]);
      } else if (i === 2){
        points[0].y += 2 * y * calculateTwoPointsPercentage(data[0], data[1]);
        points[1].x -= 2 * y * Math.sin(Math.PI / 3) * calculateTwoPointsPercentage(data[1], data[0]);
        points[1].y -= y * calculateTwoPointsPercentage(data[1], data[0]);
      }
      
    }
    
    //check whether the point is in circle
    function isInCircle(y) {
      if ((y >= edgePoints[0].y) && (y <= (edgePoints[0].y + diameter * 3 / 4))) {
        return true;
      } else {
        return false;
      }
    }
    //calculate the one point percentage in the two points
    function calculateTwoPointsPercentage(x, y) {
      //if both them equals 0, just return 0.5
      if ((x + y) === 0) {
        return 0.5;
      }
      //give a change to 0, else it always return 0
      if (x === 0) {
        return 0.1
      }
      
      return x / (x + y);
      
    }
    
    function drawFullValueText() {
      var attrFont = {
        font: "16px Helvetica",
        "stroke-width": 3,
        "font-weight": "bold"
      };
      paper.text( edgePoints[0].x, edgePoints[0].y - 18, "Shopping").attr(
        attrFont).attr({
            fill: "#333"
        });
        
      paper.text( edgePoints[1].x + 33, edgePoints[1].y / 2 + 3, "Culture").attr(
        attrFont).attr({
            fill: "#333"
        });
      
      paper.text( edgePoints[2].x - 33, edgePoints[2].y / 2 + 3, "Energy").attr(
        attrFont).attr({
            fill: "#333"
        });
    }
    
    function drawPercentageText(isInit) {
      removeOldPercentageText();
      var attrFont = {
        font: "16px Helvetica",
        "font-weight": "bold"
      };
      var percentage1 = new Number(data[0] * 100).toFixed(1);
      var percentage2 = new Number(data[1] * 100).toFixed(1);
      var percentage3 = new Number(data[2] * 100).toFixed(1);
      
      var y1 = isInit ? points[0].y / 2 + 5 : points[0].y;
      var y2 = isInit ? points[1].y / 2 + 5 : points[1].y;
      var y3 = isInit ? points[2].y / 2 + 5 : points[2].y;
      
      text1 = paper.text( points[0].x + 45, y1, percentage1 + '%').attr(attrFont);
      text2 = paper.text( points[1].x + 45, y2, percentage2 + '%').attr(attrFont);
      text3 = paper.text( points[2].x - 45, y3, percentage3 + '%').attr(attrFont);
    }
    
    function removeOldPercentageText() {
      text1 && text1.remove();
      text2 && text2.remove();
      text3 && text3.remove();
    }
    
    /**
     * Return the data
     */
    function getData() {
      return data;
    }
    
    $.fn.radarChart = function() {
      if (arguments[0] === 'getData') {
        return data;
      } else {
        //avoid duplicated chart
        if ($this) {
          return;
        }
        $this = this;
        _this = $this.get(0);
        
        $.extend(true, defaults, arguments[0]);
        data = defaults.data;
        height = $this.height();
        width = $this.width();
        diameter = (height > width ? width : height) - 60;
        initialController();
      }      
    };
}(jQuery));