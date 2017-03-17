// create the graph object
var visual = new Graph();




// create exons
visual.addExon(1, "69", 1, true);
visual.addExon(1, "533");
visual.addExon(1, "330", 1, true);
visual.addExon(1, "588", 1, true);
visual.addExon(2, "809");
visual.addExon(2, "837");
visual.addExon(2, "857");
visual.addExon(2, "906");
visual.addExon(2, "013");
visual.addExon(2, "3");
visual.addExon(2, "393");
visual.addExon(3, "", 2);
visual.addExon(3);
visual.addExon(3);
visual.addExon(4, "901");
visual.addExon(4);
visual.addExon(5);
visual.addExon(6, "307");
visual.addExon(7);
visual.addExon(8, "92/74");
visual.addExon(9);
visual.addExon(9, "352");
visual.addExon(10);
visual.addExon(10);
visual.addExon(10);
visual.addExon(10);

visual.addGeneFamily([0, 4, 11, 16, 17, 18, 19, 20, 22], 'red');
visual.addGeneFamily([1, 5, 12, 14], 'purple');
visual.addGeneFamily([6, 12, 15, 16, 17, 18, 19], 'orange');
visual.addGeneFamily([1, 7, 12, 15, 16, 17, 18, 19], 'lightblue');
visual.addGeneFamily([2, 8, 12, 15, 16, 17, 18, 19, 21, 23, 24], 'green');
visual.addGeneFamily([3, 9, 12, 15, 16, 17, 18, 19, 21, 23, 24], 'brown');

visual.cleanGraph();

visual.addLegend(0, "TRHDE", "orange");
visual.addLegend(1, "APQ", "red");
visual.addLegend(2, "ANPEP", "blue");
visual.addLegend(3, "ENPEP", "lightblue");



// // main
// var visual = new Graph();
// visual.addExon(2);
// visual.addExon(3);
// visual.addExon(4);
// visual.addExon(5);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(5);
// // visual.addExon(2);
// // visual.addExon(2);
//
// visual.addGeneFamily([0, 1, 5, 6], 'blue');
// visual.addGeneFamily([1, 6], 'blue');
// visual.addGeneFamily([0, 1, 5, 6], 'blue');
// visual.addGeneFamily([0, 1, 5, 6], 'blue');



// // create the graph object
// var visual = new Graph();
//
//
// // create exons
// visual.addExon(1);
// visual.addExon(1);
// visual.addExon(1);
// visual.addExon(1);
// visual.addExon(1);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(2);
// visual.addExon(3);
// visual.addExon(3);
// visual.addExon(3);
// visual.addExon(4);
// visual.addExon(4);
// visual.addExon(5);
// visual.addExon(6);
// visual.addExon(7);
// visual.addExon(8);
//
//
// visual.addGeneFamily([5, 12, 15, 17], "orange");
//
//
//
//
//
//

// var gfv = new GFV();
// console.log(gfv);
// gfv.render();



// // create exons
// addExon(1);
// addExon(1);
// addExon(1);
// addExon(1);
// addExon(2);
// addExon(2);
// addExon(2);
// addExon(2);
// addExon(2);
// addExon(2);
// addExon(2);
// addExon(3);
// addExon(3);
// addExon(3);
// addExon(4);
// addExon(4);
// addExon(5);
// addExon(6);
// addExon(7);
// addExon(8);
// addExon(8);
// addExon(8);
// addExon(8);
// addExon(8);
// addExon(8);
// addExon(8);
// addExon(8);
//
// addGeneFamily([0, 4, 11, 14, 16, 17, 18, 19, 20, 22, 24], 'blue');
// addGeneFamily([5, 11, 15, 16, 17, 18, 19, 20, 22, 24], 'red');
// addGeneFamily([6, 12, 15, 16, 17, 18, 19, 20, 22, 24], 'orange');
// addGeneFamily([1, 7, 12, 15, 16, 17, 18, 19, 21, 24], 'lightblue');
// addGeneFamily([2, 8, 12, 15, 16, 17, 18, 19, 21, 23, 24], 'green');
// addGeneFamily([3, 9, 12, 15, 16, 17, 18, 19, 21, 23, 24], 'brown');
