# Meeting Notes

## Sep 14, 2017 - Google Hangout Notes

### Development:
1. Backend code (pre-JSON) - Ethan
   A. Complete development
   B. Create test data sets
   C. Test
   D. Refine (return to 1.C.)
2. Visualization (post-JSON)
   A. Complete development
      i. Save as image option
   B. Create test cases
   C. Test
   D. Refine (return to 2.C.)

### Deployment:
1. Web server set-up
   A. CSU, or
   B. Independent site
2. Web documentation - Leewood

### Writing: 
1. Outline paper - Dr. Carroll
   A. Coordinate with Dr. Seipelt-Thiemann - Dr. Carroll
2. Share outline with co-authors
3. Revise outline
4. Write draft (return to 2.)

### Manuscript submission - Dr. Carroll


### To-dos before next meeting:
Dr. Carroll
+ Outline paper (with Dr. Seipelt-Thiemann)
+ Send out Doodle poll for bi-weekly meeting
+ Keep waiting for response about CSU server to handle python CGI script

Ethan:
+ Test cases


## Apr 17, 2017

Next meeting at 3:00 PM

### Status reports
Ethan: Emailed: Close to fully exporting valid JSON records
Leewood: Worked on a JSON demo
Micah: 


### To-dos
Ethan: Visual exon columns
Leewood: Have a python CGI script make a new HTML page and redirect to it
Micah: Make a ordered list of feature improvements


## Apr 17, 2017

### Status reports
Ethan: Emailed
Leewood: Emailed: Looked into sockets and files for transfering JSON string
Micah: Worked on visualization


### To-dos
Ethan: Code to produce JSON records by April 24
Leewood: Look into websockets and make a simple example
Micah: Review what is uploaded to github; email Dr. Carroll (so that he can email Dr. Seipelt-Thiemann); 


## Apr 10, 2017

### Status reports
Ethan: 
Leewood: Emailed
Micah: 


### To-dos
Ethan: Code to produce JSON records by April 24
Leewood: 
Micah: 



## Apr 3, 2017

### Status reports
Leewood: Emailed
Ethan: Orange juice
Micah: Algorithm for color selection


### To-dos
Ethan: 
Micah: Find module for color selection (e.g., given 20 colors, return 20 complimentary hex values), example(s) for visual exons spanning multiple columns (default to placing them at the top or bottom?)
Leewood: Researching JSON format

## Mar 27, 2017

### Status reports

### To-dos
Ethan: Scholars' Week presentations; code to delimit visual exons
Micah: Fine-tuning for presentations; Counter example(s) for visual exons spanning multiple columns
Leewood: Researching JSON format

## Mar 20, 2017

json record format:
---------------------------------
A dictionary, with
key0: "geneFamilyInfo", which is a dictionary, with gene names as keys, and a list of exon properties (dictionaries) as the values
The exon properties dictionary with the following keys:
+ start MSA alignment position
+ end MSA alignment position
+ visual exon index
key1: "visualExons", which is a list with each element having the following data:
+ (ending) reading frame [0-2]
+ Visual exon columns (list of 2 elements, start and end [so most visual exons have the same start and end values])
+ UTR type [0-2] (0: Not a UTR, 1: partial UTR, 2: full UTR)



## Mar 13, 2017
json record format:
---------------------------------
dictionary, with gene names as keys, and a list of exon properties (dictionaries) as the values
The exon properties dictionary with the following keys:
+ Length  (number of nucleotides)
+ (ending) reading frame [0-2]
+ Visual exon columns (list of 2 elements, start and end [so most visual exons have the same start and end values])
+ UTR type [0-2] (0: Not a UTR, 1: partial UTR, 2: full UTR)
+ start MSA alignment position
+ end MSA alignment position
An additional key "exonSet", with a list of all unique exon properties (just reading frame and visual exon columns)

The set of unique visual exons is governed by the reading frame and visual exon columns list

### Status reports (emailed before 8 AM the morning of our meeting):



## Feb 27, 2017
### Status reports (emailed before 8 AM the morning of our meeting):
Dr. C:   
Arol:    Emailed
Micah:   Title, find & review JSON specs (from previous meeting notes)
Ethan:   Flowchart (phase I)
Leewood: 

### To-Dos:
Arol:    
Micah:	 Test Cases for visual exons spanning multiple columns
Ethan:   Update json example;  Refine the flowchart; contact Dr. C; work on implemmenting the flowchart
Leewood: 



## Feb 13, 2017
### Status reports (emailed before 8 AM the morning of our meeting):
Dr. C:   
Arol:    CGI scripts
Micah:   (submitted via email)
Ethan:   Milestones (done), started flowchart
Leewood: 

### To-Dos:
Arol:    
Micah:   Title, visual exons spanning multiple columns, find & review JSON specs (from previous meeting notes)
Ethan:   Flowchart
Leewood: Comment CGI script


## Feb 6, 2017
### Status reports (emailed before 8 AM the morning of our meeting):
Dr. C:   
Arol:    Background
         Look at github
Micah:   Milestones (in github)
Ethan:   Milestones
         + Flowchart of algorithm to determine which exons map to which visual exons
Leewood:

## 01/27/2017

New Meeting time (that doesn't conflict with clubs?)
+ Mondays, 2:30 PM

### Status reports (due 8 AM the morning of our meeting):
1. Tasks accomplished
2. Stumbling blocks encountered
3. Plans for the next week

### To-Dos:
Dr. C:   
Arol:    
* Background
* Look at github
Micah:   Milestones
         Add all relevant files from Leewood's github repo
Ethan:   Milestones
         + Flowchart of algorithm to determine which exons map to which visual exons
