// global properties object
var p = {
    // get graph deimensions
    height: window.innerHeight - 50,
    width: window.innerWidth,
    center: null,
    toppadding: 100,


    // space between exons
    padding: 150,
    yPadding: 90,

    // exon graphic properties
    exonStartSize: 18,
    exonGrowPerEdge: 3,
    hoverGrow: 10,
    edgeMargin: 15,

    // number of columns
    numColumns: 35,
    // xScale: window.innerWidth / 10,
    // yScale: .height / 6,
    legendY: 250,
    legendX: 100,
};

p.center = p.height / 2 + p.toppadding;

// graph class definiton
class Graph {
    constructor() {

        var margin = {top: -5, right: -5, bottom: -5, left: -5},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var zoom = d3.behavior.zoom()
                .scaleExtent([.5, 2])
                .on("zoom", zoomed);

        // setup blank visual with proper dimensions
        this.svg = d3.select("body").append("svg").attr("width", p.width).attr("height", p.height).attr("id", "graph")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
            .call(zoom);
        var rect = this.svg.append("rect")
            .attr("width", p.width)
            .attr("height", p.height)
            .style("fill", "none")
            .style("pointer-events", "all");
        this.container = this.svg.append("g");
        this.container.append("g")
            .attr("class", "x axis")
          .selectAll("line")
            .data(d3.range(0, p.width, 10))
          .enter().append("line")
            .attr("x1", function(d) { return d; })
            .attr("y1", 0)
            .attr("x2", function(d) { return d; })
            .attr("y2", p.height);
        this.container.append("g")
            .attr("class", "y axis")
          .selectAll("line")
            .data(d3.range(0, p.height, 10))
          .enter().append("line")
            .attr("x1", 0)
            .attr("y1", function(d) { return d; })
            .attr("x2", p.width)
            .attr("y2", function(d) { return d; });


        var container = this.container;
        function zoomed() {
          container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }


        this.edgesLayer = this.container.append('g');
        this.exonLayer = this.container.append('g');
        this.textLayer = this.container.append('g');
        this.staticBackLayer = this.svg.append('g');
        this.staticLayer = this.svg.append('g');
        this.staticTopLayer = this.svg.append('g');


        var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);


        // arry of all exons in the graph
        this.exons = [];

        // 2D array of exons at each x position
        this.exonsInColumn = new Array(p.numColumns);
        for (var i = 0; i < p.numColumns; i++) {
          this.exonsInColumn[i] = new Array();
        }

        this.geneFamilyList = [];
    }

    // function to add lables
    addLegend(index, label, color) {
        var xPos = p.width - p.legendX;
        var yStartPos = p.legendY;
        var thickness = 15;
        var spacing = 30;
        var textPadding = 20;
        var thickness = 15;

        var x = xPos;
        var y = p.height - yStartPos + index * spacing;

        var l = this.staticTopLayer.append("line");
        l.attr("x1", x)
         .attr("x2", x + thickness)
         .attr("y1", y)
         .attr("y2", y)
         .attr("stroke-width", 15)
         .attr("pointer-events", "none")
         .attr("stroke", color);

         var t = this.staticTopLayer.append("text");
             t.attr("x", x + textPadding)
              .attr("y", y + thickness / 2.75)
              .style("font-size", thickness)
            //   .style("text-decoration", "underline")
              .attr("pointer-events", "none")
              .text(label);

         var h = this.staticLayer.append("line");
            h.attr("x1", x)
             .attr("x2", x + thickness * 5)
             .attr("y1", y)
             .attr("y2", y)
             .attr("stroke-width", 25)
             .attr("stroke", "white")
             .attr("fill-opacity", 0.0);


        // d3.electAll(".TRHDE").style("fill", "blue");
        h.on("mouseover", function() {
            d3.selectAll("." + label).style("fill", color);
            t.style("font-size", thickness * 1.2);
            l.style("stroke-width", 15+2);

        });

        h.on("mouseout", function() {
            d3.selectAll("." + label).style("fill", "white");
            t.style("font-size", thickness);
            l.style("stroke-width", 15);
        });

        // d3.electAll(".TRHDE").style("fill", "blue");
        h.on("mouseup", function() {
            d3.selectAll("." + label).transition().style("fill", color).duration(400);
            t.style("font-size", thickness * 1.2);
            l.style("stroke-width", 15+2);
        });
        // d3.electAll(".TRHDE").style("fill", "blue");
        // t.on("mouseover", function() {
        //     d3.selectAll("." + label).style("fill", color);
        //     // d3.selectAll("." + label).style("fill", "lightblue");
        // });
        //
        // t.on("mouseout", function() {
        //     d3.selectAll("." + label).style("fill", "white");
        // });
    }

    // method to add a gene family to the graph
    addGeneFamily (exonNumbers, color = 'black', familyName = "family") {

        this.geneFamilyList.push(familyName);
        // exons in the family
        var exonsInFamily = [];
        for (var i = 0; i < exonNumbers.length; i++) {
            exonsInFamily.push(this.exons[exonNumbers[i]]);
        }
        // create a new GeneFamily Object
        var family = new GeneFamily(exonsInFamily, color);

        for (var i = 0; i < exonsInFamily.length-1; i++) {
            this.addEdge(family.exons[i], family.exons[i+1], color, familyName);
        }

        this.addLegend(this.geneFamilyList.length, familyName, color);
    }

    // method to add an exon to the graph
    addExon(column, text = "", length = 1, fullyUTR = false, manX = null, manY = null) {
        // create and exon
        var exon = new Exon(this, column, text, length, fullyUTR, manX, manY);

        // add exon to exon list
        this.exons.push(exon);

        // add exon to exons in column list
        for (var i = 0; i < length; i++) {
            this.exonsInColumn[column+i].push(exon);
        }


        // render the exon
        exon.render();

    }

    // method to add an edge between two exons
    addEdge(exon1, exon2, color = "black", familyName = "family") {

        exon1.graphic.classed(familyName, true);
        exon2.graphic.classed(familyName, true);

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
            .attr("stroke", color)
            // .style("stroke-dasharray", ("8, 2"));

        // add the edge to the exons respective in and out edge lists
        exon1.outEdges.push(edge);
        exon2.inEdges.push(edge);

        // add exons to their respective in/out exon list
        exon1.outExons.push(exon2);
        exon2.inExons.push(exon1);

        if (exon1.length == 1) {
            // increase the size of the exons if needed
            exon1.radius = p.exonStartSize + Math.max(exon1.inEdges.length, exon1.outEdges.length) * p.exonGrowPerEdge;
            exon1.growRadius = exon1.radius + p.hoverGrow;
            exon1.graphic.attr("rx", exon1.radius);
            exon1.graphic.attr("ry", exon1.radius);
        }

        if (exon2.length == 1) {
            // // same for exon 2
            exon2.radius = p.exonStartSize + Math.max(exon2.inEdges.length, exon2.outEdges.length) * p.exonGrowPerEdge;
            exon2.growRadius = exon2.radius + p.hoverGrow;
            exon2.graphic.attr("rx", exon2.radius);
            exon2.graphic.attr("ry", exon2.radius);
        }


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
    // also ads static elements
    cleanGraph() {
        // if the exon only has one outgoing edge and no incoming edges
        // and the exon it is attached to only has one incoming edge,
        // vertically allign the exons
        for (var i = 0; i < this.exons.length; i++) {
            if (this.exons[i].inExons == 0 && this.exons[i].outExons.length == 1 && this.exons[i].outExons[0].inExons.length == 1 && this.exons[i].column == 1) {
                console.log("ALLIGN");
                // allign exon
                this.exons[i].graphic.attr("cy", this.exons[i].outExons[0].graphic.attr("cy"));
                // allign edge
                this.exons[i].outEdges[0].attr("y1", this.exons[i].graphic.attr("cy"));
                // allign text
                this.exons[i].text.attr("y", this.exons[i].graphic.attr("cy"));
            }

        }


        // add title
        this.svg.append("text")
            .attr("y", p.toppadding)
            .attr("x", p.width / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("decoration", "underline")
            // .text("Gene Family Visualization")
            .text("ERAP and TRHDE Family MSA Render")
            .style("font-family", "'Helvetica'")



        var boxPadding = 10;
        // add box around legends
        this.staticBackLayer.append("rect")
            .attr("x", p.width - p.legendX - boxPadding)
            .attr("y", p.height - p.legendY)
            .attr("ry", 1)
            .attr("rx", 1)
            .attr("height", p.legendY)
            .attr("width", p.legendX + boxPadding)
            .attr("fill", "white")
            .attr("stroke", "black")


        // add title
        this.svg.append("text")
            .attr("y", p.height - 30)
            .attr("x", p.width / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Genetic dataset provided by Dr. Seipelt-Thiemann. Rendered autonomously using allignment and visualization algorithm.")
            .style("font-family", "'Roboto', sans-serif")
        this.svg.append("text")
            .attr("y", p.height - 15)
            .attr("x", p.width / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Pan around by clicking and dragging. Zoom by scrooling in and out. Hover over the name of a gene to the right to highlight its exons.")
            .style("font-family", "'Roboto', sans-serif")

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
