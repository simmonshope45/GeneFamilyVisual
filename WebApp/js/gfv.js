// global properties object
var p = {
    // get graph deimensions
    height: screen.height,
    width: screen.width * 4,
    center: null,

    // space between exons
    padding: 150,
    yPadding: 100,

    // exon graphic properties
    exonStartSize: 20,
    exonGrowPerEdge: 3,
    hoverGrow: 15,
    edgeMargin: 15,

    // number of columns
    numColumns: 30,
};
p.center = p.height / 2.5;


// graph class definiton
class Graph {
    constructor() {
        // setup blank visual with proper dimensions
        this.svg = d3.select("body").append("svg").attr("width", p.width).attr("height", p.height);
        this.textLayer = this.svg.append('g');
        this.edgesLayer = this.svg.append('g');
        this.exonLayer = this.svg.append('g');


        // arry of all exons in the graph
        this.exons = [];

        // 2D array of exons at each x position
        this.exonsInColumn = new Array(p.numColumns);
        for (var i = 0; i < p.numColumns; i++) {
          this.exonsInColumn[i] = new Array();
        }
    }

        // method to add a gene family to the graph
    addGeneFamily (exonNumbers, color = 'black') {
        // exons in the family
        var exonsInFamily = [];
        for (var i = 0; i < exonNumbers.length; i++) {
            exonsInFamily.push(this.exons[exonNumbers[i]]);
        }


        // create a new GeneFamily Object
        var family = new GeneFamily(exonsInFamily, color);

        for (var i = 0; i < family.exons.length-1; i++) {
            this.addEdge(family.exons[i], family.exons[i+1], color);
        }
    }

    // method to add an exon to the graph
    addExon(column, text = "", length = 1, fullyUTR = false) {
        // create and exon
        var exon = new Exon(this, column, text, length, fullyUTR);

        exon.render();
        // add exon to exon list
        this.exons.push(exon);

        // add exon to exons in column list
        this.exonsInColumn[column].push(exon);

    }


    // method to add an edge between two exons
    addEdge(exon1, exon2, color = "black") {
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
            .attr("stroke", color);

        // add the edge to the exons respective in and out edge lists
        exon1.outEdges.push(edge);
        exon2.inEdges.push(edge);

        // add exons to their respective in/out exon list
        exon1.outExons.push(exon2);
        exon2.inExons.push(exon1);

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

        if (exon2.inEdges.length > 1) {
            // do the same for the exon2's incoming edges
            topEdgeHeight = exon2.graphic.attr("cy") - (exon2.graphic.attr("ry"));
            edgePadding = (exon2.graphic.attr("ry") * 2 - (p.edgeMargin * 2) ) / (exon2.inEdges.length-1);

            // loop through all incoming edges and set position
            for (var i = 0; i < exon2.inEdges.length; i++) {
                exon2.inEdges[i].attr("y2", topEdgeHeight + i * edgePadding + p.edgeMargin);
            }
        }

        return edge;
    }

    // element positioning cleanup function
    cleanGraph() {
        // if the exon only has one outgoing edge and the exon it
        // is attached to only has one incoming edge,
        // vertically allign the exons
        for (var i = 0; i < this.exons.length; i++) {
            console.log("ALLIGN");
            if (this.exons[i].outExons.length == 1 && this.exons[i].outExons[0].inExons.length == 1) {
                // allign exon
                this.exons[i].graphic.attr("cy", this.exons[i].outExons[0].graphic.attr("cy"));
                // allign edge
                this.exons[i].outEdges[0].attr("y1", this.exons[i].graphic.attr("cy"));
                // allign text
                this.exons[i].text.attr("y", this.exons[i].graphic.attr("cy"));
            }

        }
    }
}







// exon class definition
class Exon {
    constructor (graph, column, text = "", length = 1, fullyUTR = false) {
        // Create a graphic for the exon
        this.graphic = graph.svg.append("ellipse");

        // pointer to graph
        this.graph = graph;

        // Exon position
        this.column = column;
        this.x = column * p.yPadding;
        this.y = p.center;

        // Exon dimensions
        this.radius = p.exonStartSize;
        this.growRadius = this.radius + p.hoverGrow;

        console.log("GROW RAD", this.growRadius);

        // arrays of exons connected by incoming and outgoing edges
        this.inExons = [];
        this.outExons = [];

        // arrays of exons connected by incoming and outgoing edges
        this.inEdges = [];
        this.outEdges = [];

        // exon properties
        this.text = text;
        this.length = length;
        this.fullyUTR = fullyUTR;
        this.fill = "white";
    }

    // method to render the exon. This is to be called again when the exon properties are updated.
    render() {
        // set styles if exon is fullyUTR
        if (this.fullyUTR == true) {
            this.graphic.style("stroke-dasharray", ("5, 5"));
            this.graphic.style("fill", "#d9d9d9");
            this.fill = "lightgrey";
        }

        // positioning and scaling settings
        this.graphic.attr("cx", this.x)
               .attr("cy", this.y)
               .attr("rx", this.radius)
               .attr("ry", this.radius)
               .style("stroke-width", 2)
               .style("stroke", "black")
               .style("fill", this.fill);


        // get exon data as local variable
        var exonData = this;
        // make graphic grow on hover
        this.graphic.on('mouseover', function(){
            d3.select(this).style("fill", "lightblue");
            d3.select(this).transition().attr("ry", exonData.growRadius).attr("rx", exonData.growRadius).duration(300);
        });
        // make graphic shrink on exit
        this.graphic.on('mouseout', function(){
            d3.select(this).style("fill", exonData.fill);
            d3.select(this).transition().attr("ry", exonData.radius).attr("rx", exonData.radius).duration(300);
        })

        // add text
        this.text = this.graph.svg.append("text")
           .attr("x", this.graphic.attr("cx"))
           .attr("y", this.graphic.attr("cy"))
           .attr("font-family","sans-serif")
           .attr("pointer-events","none")
           .attr("font-size",12)
           .style("text-anchor", "middle")
           .style("dominant-baseline", "middle")
           .text(this.graph.exons.length);

        // spread exons at a column out vertically
        for (var column = 1; column < p.numColumns; column++) {
            // if there are more than one exons in a column, adjust positions of exons
            if (this.graph.exonsInColumn[column].length > 1) {
                var totalHeight = p.yPadding * (this.graph.exonsInColumn[column].length-1);
                var topExonPos = p.center - (totalHeight * .5);

                // reposition all of the exons at proper positions
                for (var i = 0; i < this.graph.exonsInColumn[column].length; i++) {
                    this.graph.exonsInColumn[column][i].graphic.attr("cy", topExonPos + (p.yPadding * i));
                    this.graph.exonsInColumn[column][i].text.attr("y", topExonPos + (p.yPadding * i));
                }
            }
        }

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

// // create the graph object
// var visual = new Graph();
//
//
