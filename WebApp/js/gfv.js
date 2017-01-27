// global properties object
var p = {
    // get graph deimensions
    height: screen.height,
    width: screen.width,
    center: null,

    // space between exons
    padding: 150,
    yPadding: 100,

    // exon graphic properties
    exonStartSize: 20,
    exonGrowPerEdge: 3,
    hoverGrow: 20,
};
p.center = p.height / 2.5;


// graph class definiton
class Graph {
    constructor() {
        // setup blank visual with proper dimensions
        this.svg = d3.select("body").append("svg").attr("width", 500).attr("height", 500);
        console.log(this.svg);
        this.edgesLayer = this.svg.append('g');
        this.exonLayer = this.svg.append('g');


        // arry of all exons in the graph
        this.exons = [];

        // 2D array of exons at each x position
        this.exonsColumn = new Array(50);
        for (var i = 0; i < 20; i++) {
          this.exonsColumn[i] = new Array();
        }
    }

    addExon(collumn) {
        console.log("adding exon");
        console.log(this.svg);
        var exon = new Exon(collumn);


        var graphic = this.svg.append("ellipse");
        graphic.attr("cx", exon.x)
               .attr("cy", exon.y)
               .attr("rx", exon.radius)
               .attr("ry", exon.radius)
               .style("stroke-width", 2)
               .style("stroke", "black")
               .style("fill", "white");


        // make graphic grow
        graphic.on('mouseover', function(d){
            console.log("ENTER");
            d3.select(this).style("fill", "lightblue")
            d3.select(this).transition().attr("ry", exon.growRadius)
                                        .attr("rx", exon.growRadius)
                                        .duration(300);
        })
        // make graphic shrinjk
        graphic.on('mouseout', function(d){
            console.log("Exit");
            d3.select(this).style("fill", "white")
            d3.select(this).transition().attr("ry", exon.radius)
                                        .attr("rx", exon.radius)
                                        .duration(300);
        })
    }
}


// exon class definition
class Exon {
    constructor (column) {
        // Exon position
        this.column = column;
        this.x = column * p.yPadding;
        this.y = p.center;

        // Exon dimensions
        this.radius = p.exonStartSize;
        this.growRadius = this.radius + p.hoverGrow;

        // arrays of exons connected by incoming and outgoing edges
        this.inExons = [];
        this.outExons = [];

        // arrays of exons connected by incoming and outgoing edges
        this.inEdges = [];
        this.outEdges = [];

        // exon graphic
        this.exonGraphic = null;
    }
}


// main
var visual = new Graph();
visual.addExon(2);
// var exon = new Exon(1);
// console.log(p);
// console.log(exon);
