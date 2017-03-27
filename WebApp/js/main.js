// create the graph object
var visual = new Graph();




// create exons
visual.addExon(1, "69", 1, true);
visual.addExon(1, "533");
visual.addExon(1, "330", 1, true);
visual.addExon(1, "588", 1, true);

visual.addExon(2, "809", 1, false);
visual.addExon(2, "837", 1, false);
visual.addExon(2, "859", 1, false);
visual.addExon(2, "986", 1, false);
visual.addExon(2, "841", 1, false);
visual.addExon(2, "541", 1, false);
visual.addExon(2, "697", 1, false);

visual.addExon(0, "274", 2, false, 260, 300);
visual.addExon(3, "143", 1, false);
visual.addExon(3, "142/139", 1, false);

visual.addExon(4, "140", 1, false);
visual.addExon(4, "132/135", 1, false);

visual.addExon(5, "121/127", 1, false);
visual.addExon(6, "155", 1, false);
visual.addExon(7, "114", 1, false);
visual.addExon(8, "132...135", 1, false);


visual.addExon(9, "66", 1, false);
visual.addExon(0, "132", 2, false, 810, 520);
visual.addExon(0, "72/69", 1, false, 950, 540);
visual.addExon(10, "66", 1, false);

visual.addExon(11, "152/2...88", 1, false);

visual.addExon(12, "77/80/89", 1, false);

visual.addExon(13, "134..140", 1, false);
visual.addExon(0, "184", 2, false, 1165, 520);
visual.addExon(14, "56", 1, false);

visual.addExon(15, "148/151", 1, false);

visual.addExon(16, "92/74", 1, false);
visual.addExon(0, "185", 2, false, 1450, 520);
visual.addExon(17, "111/105", 1, false);

visual.addExon(18, "168/171", 1, false);
visual.addExon(19, "141/138", 1, false);
visual.addExon(20, "82/76", 1, false);

visual.addExon(21, "150", 1, false);
visual.addExon(21, "150", 1, false);
visual.addExon(21, "150", 1, false);
visual.addExon(21, "150", 1, false);
visual.addExon(21, "150", 1, false);
visual.addExon(21, "150", 1, false);
visual.addExon(21, "150", 1, false);





visual.addGeneFamily([4, 11, 16, 17, 18, 19, 20, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 36], 'red', "APQ");
visual.addGeneFamily([0, 5, 12, 14, 16, 17, 18, 19, 20, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 37], 'pink', "ANPEP");
visual.addGeneFamily([6, 12, 14, 16, 17, 18, 19, 20, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 38], 'green', "TRHDE");
visual.addGeneFamily([7, 13, 15, 16, 17, 18, 19, 20, 23, 24, 25, 26, 28, 29, 30, 32, 33, 34, 35, 39], 'orange', "ENPEP");
visual.addGeneFamily([3, 8, 13, 15, 16, 17, 18, 19, 21, 24, 25, 27, 29, 31, 33, 34, 35, 40], 'lightblue', "LNPEP");
visual.addGeneFamily([2, 9, 13, 15, 16, 17, 18, 19, 21, 22, 24, 25, 27, 29, 31, 33, 34, 35, 41], 'lightgreen', "ERAP1");
visual.addGeneFamily([1, 10, 13, 15, 16, 17, 18, 19, 21, 22, 24, 25, 27, 29, 31, 33, 34, 35, 42], 'lightblue', "ERAP2");

visual.cleanGraph();

// visual.addLegend(0, "TRHDE", "green");
// visual.addLegend(1, "APQ", "red");
// visual.addLegend(2, "ANPEP", "purple");
// visual.addLegend(3, "ENPEP", "orange");
// visual.addLegend(4, "LNPEP", "lightblue");
// visual.addLegend(5, "ERAP1", "lightgreen");
// visual.addLegend(6, "ERAP2", "darkblue");

// d3.selectAll(".TRHDE").style("fill", "blue");


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
