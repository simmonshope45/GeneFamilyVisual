// create the graph object
var visual = new Graph();

// parse the seralized gfv to a graph data object
var graph_data = JSON.parse(gfv_json_string);
console.log(graph_data);

// if the input does not include colors
if(!graph_data.family_list[0].color) {
  // get the number of families supplied
  var family_count = graph_data.family_list.length;
  console.log(family_count)
  // create a unique color for each family
  var colors = create_random_colors(family_count);
  // add colors to each family
  for (var i = 0; i < family_count; i++) {
      graph_data.family_list[i].color = colors[i];
  }
}

// add all exons in graph_data to the graph
var exon;
for (var i = 0; i < graph_data.exon_list.length; i++) {
  exon = graph_data.exon_list[i];
  visual.addExon(exon.column, exon.text, exon.length, exon.fullyUTR, exon.manual_x_adjustment, exon.manual_y_adjustment)
}

// add all gene families in graph_data to the graph
var family;
for (var i = 0; i < graph_data.family_list.length; i++) {
  family = graph_data.family_list[i]
  visual.addGeneFamily(family.exons_in_family, family.color, family.family_name);
}

visual.cleanGraph();
