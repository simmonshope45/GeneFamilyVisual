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
    edgeMargin: 15,
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

    // method to add an exon to the graph
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


    // method to add an edge between two exons
    addEdge(exon1, exon2) {
        // get positions of exons
        var x1 = exon1.graphic.attr("cx");
        var y1 = exon1.graphic.attr("cy");
        var x2 = exon2.graphic.attr("cx");
        var y2 = exon2.graphic.attr("cy");

        // create the line (edge graphic)
        var edge = this.edgesLayer.append("line");
        edge.attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke-width", 2)
            .attr("stroke", "black");

        // add the edge to the exons respective in and out edge lists
        exon1.outEdges.push(edge);
        exon2.inEdges.push(edge);

        // increase the size of the exons if needed
        exon1.radius = p.exonStartSize + Math.max(exon1.inEdges.length, exon1.outEdges.length) * p.exonGrowPerEdge;
        exon1.growRadius = exon1.radius + p.hoverGrow;
        exon1.graphic.attr("rx", exon1.radius);
        exon1.graphic.attr("ry", exon1.radius);

        // same for exon 2
        exon2.radius = p.exonStartSize + Math.max(exon2.inEdges.length, exon2.outEdges.length) * p.exonGrowPerEdge;
        exon2.growRadius = exon2.radius + p.hoverGrow;
        exon2.graphic.attr("rx", exon2.radius);
        exon2.graphic.attr("ry", exon2.radius);

        // if exon1 has more than one outgoing edge, determine where the edges should be positioned
        if (exon1.outEdges.length > 1) {
            // get the coordinates for the top of the exon
            var topEdgeHeight = exon1.graphic.attr("cy") - (exon1.graphic.attr("ry"));
            // calculae the proper space between each edge
            var edgePadding = (exon1.graphic.attr("ry") * 2 - (p.edgeMargin * 2) ) / (exon1.outEdges.length-1);

            // loop through all outgoing edges and set position
            for (var i = 0; i < exon1.outEdges.length; i++) {
                exon1.outEdges[i].attr("y1", topEdgeHeight + i * edgePadding + p.edgeMargin);
            }
        }

        // if exon2 has more than one incoming edge, determine where the edges should be positioned
        if (exon2.inEdges.length > 1) {
            // get the coordinates for the top of the exon
            topEdgeHeight = exon2.graphic.attr("cy") - (exon2.graphic.attr("ry"));
            // calculae the proper space between each edge
            edgePadding = (exon2.graphic.attr("ry") * 2 - (p.edgeMargin * 2) ) / (exon2.inEdges.length-1);

            // loop through all incoming edges and set position
            for (var i = 0; i < exon2.inEdges.length; i++) {
                exon2.inEdges[i].attr("y1", topEdgeHeight + i * edgePadding + p.edgeMargin);
            }
        }

        if (exon2.inEdges.length > 1) {
            // do the same for the exon2's incoming edges
            topEdgeHeight = exon2.graphic.attr("cy") - (exon2.graphic.attr("ry"));
            edgePadding = (exon2.graphic.attr("ry") * 2 - (p.edgeMargin * 2) ) / (exon2.inEdges.length-1);

            // loop through all incoming edges and set position
            for (var i = 0; i < exon2.inEdges.length; i++) {
                exon2.inEdges[i].attr("y2", topEdgeHeight + i * edgePadding + p.edgeMargin);
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


// Gene family class definition
class GeneFamily {
    constructor(exons, color) {
        this.exons = exons;
        this.color = color;
        this.edges = [];
    }
}

// Edge family class definition
class Edge {
    constructor(exon1, exon2) {

    }
}



// main
var visual = new Graph();
visual.addExon(2);
visual.addExon(3);
// visual.addExon(2);
// visual.addExon(2);

visual.addEdge(visual.exons[0], visual.exons[1]);
visual.addEdge(visual.exons[0], visual.exons[1]);
visual.addEdge(visual.exons[0], visual.exons[1]);
visual.addEdge(visual.exons[0], visual.exons[1]);
visual.addEdge(visual.exons[0], visual.exons[1]);
// visual.addEdge(visual.exons[0], visual.exons[1]);
// var exon = new Exon(1);
