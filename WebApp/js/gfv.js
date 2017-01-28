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
        this.svg = d3.select("body").append("svg").attr("width", p.width).attr("height", p.height);
        this.edgesLayer = this.svg.append('g');
        this.exonLayer = this.svg.append('g');


        // arry of all exons in the graph
        this.exons = [];

        // 2D array of exons at each x position
        this.exonsInColumn = new Array(50);
        for (var i = 0; i < 20; i++) {
          this.exonsInColumn[i] = new Array();
        }
    }

    addExon(column) {
        // create and exon
        var exon = new Exon(column);

        // create a graphic for the exon
        var graphic = this.svg.append("ellipse");
        graphic.attr("cx", exon.x)
               .attr("cy", exon.y)
               .attr("rx", exon.radius)
               .attr("ry", exon.radius)
               .style("stroke-width", 2)
               .style("stroke", "black")
               .style("fill", "white");


        // make graphic grow on hover
        graphic.on('mouseover', function(d){
            d3.select(this).style("fill", "lightblue")
            d3.select(this).transition().attr("ry", exon.growRadius)
                                        .attr("rx", exon.growRadius)
                                        .duration(300);
        })
        // make graphic shrink on exit
        graphic.on('mouseout', function(d){
            d3.select(this).style("fill", "white")
            d3.select(this).transition().attr("ry", exon.radius)
                                        .attr("rx", exon.radius)
                                        .duration(300);
        })

        // add the graphic to the exon
        exon.graphic = graphic;

        // add exon to exon list
        this.exons.push(exon);

        // add exon to exons in column list
        this.exonsInColumn[column].push(exon);


        // if there are more than one exons in a column, adjust positions of exons
        if (this.exonsInColumn[column].length > 1) {
            var totalHeight = p.yPadding * (this.exonsInColumn[column].length-1);
            var topExonPos = p.center - (totalHeight * .5);

            // reposition all of the exons at proper positions
            for (var i = 0; i < this.exonsInColumn[column].length; i++) {
                this.exonsInColumn[column][i].graphic.attr("cy", topExonPos + (p.yPadding * i));
                console.log(this.exonsInColumn[column][i].graphic.attr("cy"));
            }
        }

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
        this.graphic = null;
    }
}


// main
var visual = new Graph();
visual.addExon(2);
visual.addExon(2);
visual.addExon(2);
visual.addExon(2);
// var exon = new Exon(1);
