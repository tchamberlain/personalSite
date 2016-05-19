// getting screen size
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

// Initially, no node is selected
var selectedNode = null;
var draggable = true;

// Getting dimensions for svg
var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
},

width = x*.8,
height = y*.9;

var n = 3,
    m = 1,
    padding = 6,
    radius = d3.scale.sqrt().range([0, 12]),
    color = d3.scale.category10().domain(d3.range(m)),
    x = d3.scale.ordinal().domain(d3.range(m)).rangePoints([0, width], 1);

var info = [{ title:'ABOUT', leftAlign:-6, detailText: "Software engineer with a strong background in JavaScript, AngularJS, Backbone.js, Node.js, Express, MongoDB, and Socket.IO. I enjoy using software to solve complex problems, designing data structures and algorithms, and engineering user-oriented products. My technical interests include robotics, machine learning, graphics, renewable energy, cybersecurity, and communication." },{ title:'PROJECTS', leftAlign: -22},{ title:'CONTACT', leftAlign:-21 }]

var nodes = info.map(function (d) {
    var i = Math.floor(Math.random() * m), //color
        v = (i + 1) / m * -Math.log(Math.random()); //value
    return {
        title: d.title,
        leftAlign: d.leftAlign,
        radius: radius(60),
        size: radius,
        color: 'black',
        detailText: d.detailText,
        cx: x(i),
        cy: height / 2,
        text: d,
        gravityAmt: .3
    };
});

var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .gravity(.2)
    .charge(0)
    .on("tick", tick)
    .start();

var svg = d3.select(".line")
    .append("div")
   .classed("svg-container", true) 
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 650 600")
   //class to make it responsive
   .classed("svg-content-responsive", true); 

var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", 'node')
    .call(force.drag)  


// adding a rectangle, but cutting the radius so it starts as a circle
node
  .append("rect")
  .attr("rx",80)
  .attr("ry",80)
  .attr("x",-56)
  .attr("y",-77)
  .attr("width",160)
  .attr("height",160)
  .attr("stroke","black")
  .attr("fill","black");


node.append("text")
    .attr("dy", ".35em")
    .attr("dx", function(d) { return d.leftAlign; })
    .style("fill", "white")
    .attr("font", 'bold')
    .attr("font-size", "20px")
    .attr("class", "customFont")
    .text(function(d) { return d.title; });

circle = svg.selectAll("circle")

function tick(e) {
  // we only want movement every tick if no node is selected
  //if(selectedNode === null){

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  node.each(gravity(.2* e.alpha))
      .each(collide(.5))
      .attr("dx", function (d) {
      return d.x;
  })
      .attr("dy", function (d) {
      return d.y;
  });

  //node.attr("transform", function(d) { return "translate(" + 1+ "," +1 + ")"; });

}

// Move nodes toward cluster focus.
function gravity(alpha) {
    return function (d) {
        d.y += (d.cy - d.y) * alpha;
        d.x += (d.cx - d.x) * alpha;
    };
}

// Resolve collisions between nodes.
function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
        var r = d.radius + radius.domain()[1] + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}

var handleClick = function(node) {

  selectedNode = node;
  currRect = node.selectAll('rect');

  //want a black label for white background
  node.selectAll('text')
    .style("fill", 
      function(d){
        return "black";
      });
  rectWidth = svg.attr("width") *.7;
  rectHeight = svg.attr("height") *.8;

  //transforming circle into rectangle
  currRect.transition().duration(100)
    .attr("width",rectWidth/2)
    .attr("height",rectHeight/2)
    .attr("rx",rectWidth/4)
    .attr("ry",rectHeight/4)
  currRect.transition().duration(100)
    .attr("width",rectWidth)
    .attr("height",rectHeight)
  currRect.transition().duration(300)
      .attr("rx",10)
      .attr("ry",10)
          .attr("width",rectWidth)
    .attr("height",rectHeight)
      .attr("stroke","black")
              .attr("fill","white")
              .attr("opacity",.3)


  node.attr("class", "selected");
  svg.selectAll(".selected").on('mousedown.drag', draggable ? null : dragCallback);
  this.value = 'switch drag to ' + draggable;
  draggable = !draggable;

  var xTranslate = (svg.attr("width") * .25) +   +'';
  var yTranslate = (svg.attr("height") * .25)  +'';
  var translatePhrase = "translate("+ xTranslate +','+yTranslate +')';

  node.transition().duration(200)
    .attr("transform", translatePhrase)
  
  setTimeout(function(){
     node
       .append("foreignObject")
       .attr("width", rectWidth*.8)
       .attr("height", rectHeight* .9)
       .attr('transform', 'translate(' + [rectWidth*.01, rectHeight*.2] + ')')
       .append("xhtml:body")
       .attr("class", "customFont")
       .style("color", "black")
       .html(function(d){return d.detailText;})
        }, 200);


  //grab other nodes, move them
  svg.selectAll(".node").transition().duration(500)
    .attr("transform", "translate(3000,3000)")

  force.stop();

  // add the x for closing the info block
  node
  .append("svg:image")
  .on("click", function(d) { handleClose(d); })
  .attr("class", "close")
  .attr('x',rectWidth*.8)
  .attr('y',-rectHeight*.12)
  .attr('width', 15)
  .attr('height', 15)
  .attr('opacity', .7)
  .attr("xlink:href","./assets/x.png")


}

var handleClose = function(closeImg){

  svg.selectAll(".selected").on('click',null);
  selectedNode = null;

  svg.selectAll(".selected").on('mousedown.drag', draggable ? null : dragCallback);
  this.value = 'switch drag to ' + draggable;
  draggable = !draggable;
 
  svg.selectAll(".selected")
  .transition().duration(50)
  .selectAll("rect")
      .attr("rx",100)
    .attr("ry",100)
    .attr("fill",
      function(d){
        d.radius = 150;
        d.fixed = false;
        return "white";
      })

  force.resume();

  svg.selectAll(".selected")
  .transition().duration(100)
  .selectAll("rect")
    .attr("rx",80)
    .attr("ry",80)
    .attr("x",-56)
    .attr("y",-77)
    .attr("width",160)
    .attr("height",160)
    .attr("stroke","black")
    .attr("fill",
      function(d){
        console.log(d.radius)
        console.log(svg.selectAll(".selected").selectAll("rect").attr("rx"))
        d.radius = 90;
        return "white";
      })

  svg.selectAll(".selected")
    .selectAll("image").remove()
  svg.selectAll(".selected")
    .selectAll("foreignObject").remove();
  



  svg.selectAll(".selected").transition().duration(500)
    .delay(function(d, i){
        return 100
    })
    .attr('class','node')
    .attr("x",100)
    .attr("y",177)


 setTimeout(function(){
  // click handler
     d3.selectAll(".node").on("click", function(){
        handleClick(d3.select(this));
    }); 
  }, 300);

 svg.selectAll(".node").on('mousedown.drag', draggable ? null : dragCallback);
 this.value = 'switch drag to ' + draggable;
 draggable = !draggable;



}

var dragCallback =  svg.selectAll(".node").property('__onmousedown.drag')['_'];

// click handler
 svg.selectAll(".node").on("click", function(){


    handleClick(d3.select(this));
});


// make sure we reset these when the screen size changes
  function resize() {
    width = window.innerWidth*.8, height = window.innerHeight*.9;
    svg.attr("width", width).attr("height", height);
    force.size([width, height]).resume();
    node = svg.selectAll(".node")
  }

  resize();
  d3.select(window).on("resize", resize);

