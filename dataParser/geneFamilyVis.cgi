#!/usr/bin/python3

import os, string, sys, cgi
import binascii
#import binascii, mkdir
from Bio import SeqIO  # requires BioPython
from Bio.SeqRecord import SeqRecord
from Bio.Align.Applications import ClustalOmegaCommandline   # requires Clustal Omega (with the executable as clustalo)
import argparse #import argaparse library for addArgv, --afa

UTR_EXON = -2

form = cgi.FieldStorage()
path = ""


#this follow line print out the DEBUGGING for run cgi
import cgitb; cgitb.enable()
sys.stderr = sys.stdout
print("Content-Type: text/html")
print()
#-------------------------------------------------

CLUSTAL_INPUT_BASE_FILENAME = "clustalInput.fa"

#creating an object to hold all the information for each gene
class Gene(object):
    def __init__(self, name):
        #name of gene
        self.name = name

        #array that will hold exon lengths 
        self.ExonCount = []

        # length of AA (unaligned)
        self.AA_len = 0

        # string to store the translated (unaligned) gene
        self.AA = ''

        #string to store the CDS region and lengths
        self.CDS = ''
        self.CDS_len = []

        # string to store the translated (aligned) gene
        self.Aligned_str = ''

        #string to store the frame string
        self.Frame_str = ''

        #array to keep track of exon frames
        self.Frames = []

        #line color for this gene
        self.color = ''
		
# dictionary of 3 letter convert to 24 amino acid
dnaToProtD = {
    "TTT":'F', "TTC":'F', "TTA":'L', "TTG":'L',
    "CTT":'L', "CTC":'L', "CTA":'L', "CTG":'L',
    "ATT":'I', "ATC":'I', "ATA":'I', "ATG":'M',
    "GTT":'V', "GTC":'V', "GTA":'V', "GTG":'V',

    "TCT":'S', "TCC":'S', "TCA":'S', "TCG":'S',
    "CCT":'P', "CCC":'P', "CCA":'P', "CCG":'P',
    "ACT":'T', "ACC":'T', "ACA":'T', "ACG":'T',
    "GCT":'A', "GCC":'A', "GCA":'A', "GCG":'A',

    "TAT":'Y', "TAC":'Y', "TAA":'', "TAG":'',
    "CAT":'H', "CAC":'H', "CAA":'Q', "CAG":'Q',
    "AAT":'N', "AAC":'N', "AAA":'K', "AAG":'K',
    "GAT":'D', "GAC":'D', "GAA":'E', "GAG":'E',

    "TGT":'C', "TGC":'C', "TGA":'', "TGG":'W',
    "CGT":'R', "CGC":'R', "CGA":'R', "CGG":'R',
    "AGT":'S', "AGC":'S', "AGA":'R', "AGG":'R',
    "GGT":'G', "GGC":'G', "GGA":'G', "GGG":'G'
}

# convert DNA into protein
# initialize aminos as a list of amino acids from each slice 3 letter DNA strand
# initialize protein as a string from join aminos list
# return protein
# Note: Assumes that all chracters are nucleotides (AGCT) and not gaps

def dna_to_prot(strand):
    aminos = [ dnaToProtD[strand[i:i+3] ] for i in range(0, len(strand), 3) ]
    protein = "".join(aminos)
    return protein

# make a new directory with a random name (in the files directory)
# if files directory has not made, create one and set permission to 0o777
# initialize newDir as a random string, such as 424e069cb11ecc4f5712c3863c9cfba1
# initialize a global path to use late in Main()
# store a path of newDir into path string
# NOTE: This 0o777 is used for DEBUGGING purpose only, recommend use 0o755
# Because the server user permission is wwww-data, if using 0o755 is hard to remove test files
def mkDir():
    if not os.path.exists("files"):
        os.makedirs("files")
        #os.chmod(path, 0o755)
        os.chmod("files", 0o777) # DEBUGGING
        
    newDir = binascii.hexlify(os.urandom(16)).decode()
    global path
    path = "files/" + newDir
    if not os.path.exists(path):
        os.makedirs(path)
        #os.chmod(path, 0o755)
        os.chmod(path, 0o777) # DEBUGGING

# This function will make a json file and store in the files
# if newDir is not exist in files dirctory, create one and set permission to 0o777
# NOTE: This 0o777 is used for DEBUGGING purpose only, recommend use 0o755
# Because the server user permission is wwww-data, if using 0o755 is hard to remove test files
def mkJson(dictJson):
    newJson = path +  "/jsonFile.json"
    open(newJson, 'w').write(json.dumps(dictJson))
    #os.chmod(newPage, 0o755)
    os.chmod(newJson, 0o777)# DEBUGGING

# This function will make a html file to display result of code
# It is not completed yet, depend on the javascript
# NOTE: This 0o777 is used for DEBUGGING purpose only, recommend use 0o755
# Because the server user permission is wwww-data, if using 0o755 is hard to remove test files
def mkPage():
    printPage = ("""<!DOCTYPE html>
<html>
<head>
    <title>Result Upload File</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js"></script>
    <script type="text/javascript" src="../openJson.js"></script>
</head>
<body>
    <p id="myJson">Thank you for using this upload. Unforunately, the back end is not finish yet...</p>
</body>
</html>"""%("jsonFile.json"))
    newPage = path + "/result.html" 
    open(newPage, 'w').write(printPage)
    #os.chmod(newPage, 0o755)
    os.chmod(newPage, 0o777)# DEBUGGING

# add argument for dataPrcoess for checking if there is afa in command line
# afa can be string of aligned file
# or False if user did not provide aligned file
def dataProcess( afa ): 
    # get the files in the directory
    listing = os.listdir(path)

    # create a dictionary to hold the Gene objects
    gene_dic = {}

    # loop through every file in the directory
	# For each file, initalize a gene object as follow;
	#    gene.name:      the name of file
	#    gene.ExonCount: using SeqIo.parse to get exon and its length
	#    gene.CDS:       remove the UTR, by strip lowercase letter in exon
	#    gene.CDS_len:   append of each length of CDS after strip lowercase
	#    gene.Frames:    append of those follow:
	#        CDSExonCount: count of each ExonCount
	#        startFrame: if CDSExonCount is zero startFrame is '^'
	#                    else get the ORF from the previous exon
	#        stopFram:   if CDSLength % 3 == 0 --> '^'
	#                    if CDSLength % 3 == 1 --> '<'
	#                    if CDSLength % 3 == 2 --> '>'
	#        CDSlength:  if CDSExonCount == 0 --> len(CDS)
	#                    if CDSExonCount not 0 check prev-Frame is '<' --> -2
	#                    if CDSExonCount not 0 check prev-Frame is '>' --> -1
	#        exonLength: length of exon
	#    gene.CDS:       CDSExon with trim off 1-2 nucleotides if the coding region is not a multiple of 3
	#    gene.AA:        string of converted protein from called dna_to_prot(CDSExon)
	#    gene.AA_len:    length of AA string
	#  store each gene into gene_dic with its name
	
    for infile in listing:

        # if infile[-3] != ".fa":
        #     # not a fasta file extension (for command-line use)
        #     continue
        
        # open the file
        with open(os.path.join(path, infile), 'r') as genes:
            # initalize the counter to zero for each gene/file
            CDSExon = ''
            CDSExonCount = 0


            # get the name of the gene (from the filename) and create an empty object
            name = os.path.splitext(infile)[0]
            gene = Gene(name)


            #go through the file get the gene name and then
            #get the length of all exons and put into array
            for seq_record in SeqIO.parse(genes, "fasta"):
                startFrame = ''
                stopFrame = ''

                #add the exon length into ExonCount array
                gene.ExonCount.append(len(seq_record))

                #convert Bio.SeqRecord to fasta format to get the sequence
                #in string format to check letter casing
                exon = seq_record.format("fasta")
                #this removes the first line of the fasta file and all newlines
                exon = exon.split('\n', 1)[-1].replace('\n', '')

                exonLength = len(exon)
		# remove the UTR (lowercase letters)
                CDS = exon.strip(string.ascii_lowercase)
                CDSExon += CDS
                CDSlength = len(CDS)
                gene.CDS_len.append(CDSlength)
                if(CDSExonCount == 0):
                    startFrame = '^'
                else:
                    startFrame = gene.Frames[CDSExonCount-1][2]  # get the ORF from the previous exon
		    # adjust the coding length to account for the reading frame from the previous exon
                    if(startFrame == '<'):
                        CDSlength -= 2
                    elif(startFrame == '>'):
                        CDSlength -= 1
			
		# determine the reading frame
                if(CDSlength % 3 == 0):
                    stopFrame = '^'
                elif(CDSlength % 3 == 1):
                    stopFrame = '<'
                else:
                    stopFrame = '>'

                gene.Frames.append([CDSExonCount, startFrame, stopFrame, CDSlength, exonLength])
                CDSExonCount += 1

            # trim off 1-2 nucleotides if the coding region is not a multiple of 3
            if len(CDSExon) % 3 != 0:
                excessNucleotides = len(CDSExon) % 3
                CDSExon = CDSExon[:-excessNucleotides]
                
            gene.CDS = CDSExon
            gene.AA = dna_to_prot(CDSExon)
            gene.AA_len = len(gene.AA)

            #create a directory to store AA fasta files
            aa_path = path + '/AA/'
            if not os.path.exists(aa_path):
                os.makedirs(aa_path)
                os.chmod(aa_path, 0o777) # DEBUGGING

	    # FUTURE: open the file once, append to it in this loop, then close it once
            #create one giant fasta file with all AA sequences 
            #to pass to clustal omega
            with open(path + "/" + CLUSTAL_INPUT_BASE_FILENAME, "a") as ALL_AA:
                ALL_AA.write('>' + name + '\n')
                ALL_AA.write(gene.AA + '\n')
                ALL_AA.close()

            # #create AA fasta files
            # with open(os.path.join(path + '/AA/' + name + '_AA.txt'), 'w') as AA_file:
            #     AA_file.write('>' + name + '\n')
            #     AA_file.write(gene.AA + '\n')
            #     AA_file.close()

	    # FUTURE:
            #NEED TO ASK ABOUT THIS...IS IT 100 AA OR 100 NUCLEOTIDES
            #Check to make sure all AA sequences are at least 100 aa


        gene_dic[name] = gene

    # call clustal omega
    in_file = path + "/" + CLUSTAL_INPUT_BASE_FILENAME

    # if there is --afa on the command line, use the MSA from user
    # else use the aligned from the path in file folder
	# either option: store Aligned_str into each gene in the gene_dictionary
    out_file = ""
    if afa:
        out_file = "./" + afa
        
        # verify that the user-supplied alignment file matches exactly with the translated versions of the user-supplied input files
        # for each gene
        #     compare AA with Aligned_str (except for "-"s) (by making a temporary copy of Aligned_str that has all "-"s replaced with "")
        for name in gene_dic:
            gene = gene_dic[name]
            if gene.AA != gene.Aligned_str.replace("-",""):
                print( "Translated version of input files for", name, "does not match with the supplied alignment:")
                print( "Translated:", gene.AA)
                print( "Alignment: ", gene.Aligned_str.replace("-",""), "(any gaps were removed for this error message)")
                sys.exit(1)    
    else:
        out_file= path + "/aligned.fasta"
        clustalo = ClustalOmegaCommandline( infile=in_file, outfile=out_file, auto=True, cmd="clustalo" )
        clustalo()
    
        #
        # read in the aligned sequences and store them in their respective objects
        #
        with open(out_file, 'r') as clustal:
            for line in clustal:
                line = line.rstrip()
                if(line[0] is '>'): # and count is 0):
                    name = line[1:] # remove the > character at the beginning of the line
                else:
                    gene_dic[name].Aligned_str += line

    # loop through each gene in the gene_dictionary
    #   intialize frame_len to get integer of each gene.CDS_len divide 3
	#   while frame_len is zero
	#       go to next exon then append UTR_EXON into gene.Frames
	#       also break if exon is more than length of gene.CDS_len
	#       else frame_len is next exon of gene.CDS_len divide 3
	#
	#   for each char in gene.Aligned_str
	#       if start is False, then set it to be true then append count into gene.Frame
        #       else if frame_len is zero, go to next exon then append count into gene.Frames and get frame_len from gene.CSD_len divide 3
	#       while frame_len is zero
	#           append UTR_EXON into gene.Frame then go to next exon
	#           get frame_len from gene.CSD_len divide 3
	#       else set frame_len to be -1
	#       increment count
	# 
	#   while exon is less than length of gene.CSD_len minus 1
	#       go to next exon then append UTR_EXON into gene.Frames
	
    for name, gene in gene_dic.items():
        count = 0  # alignment index
        exon = 0   # index of the current        exon for this gene
        start = False  # first time?
        
        if exon >= len( gene.CDS_len):
            # no valid exons, go to the next gene
            continue
            
        frame_len = int(gene.CDS_len[exon]/3)

	# process all of the 5' exons that are entirely UTR (i.e., have at most 2 nucleotides)
        while frame_len == 0:  # only UTR
            gene.Frames[exon].append(UTR_EXON)
            exon += 1
            if exon < len( gene.CDS_len):
                frame_len = int(gene.CDS_len[exon]/3)
            else:
                break

	# record the alignment index for
        # 1) the first AA and
        # 2) the last AA for each exon    
        for char in gene.Aligned_str:
            if char is '-':
                pass
            else:
                if start is False:
                    start = True
                    # FUTURE: can this be pulled out of the for loop (i.e., can the frame_len == 0 for the first AA)?
                    gene.Frames[exon].append( count )  # record the index of the alignment
                elif frame_len is 0:  # done processing this exon
                    exon += 1
                    gene.Frames[exon].append( count )  # record the index of the alignment
                    frame_len = int(gene.CDS_len[exon]/3)
                    while frame_len == 0: # only UTR 
                        gene.Frames[exon].append(UTR_EXON)
                        exon += 1
                        frame_len = int(gene.CDS_len[exon]/3)
                else:
                    frame_len -= 1
            count += 1
            
	# process all of the 3' exons that are entirely UTR
        while exon < len(gene.CDS_len)-1:
            exon += 1
            gene.Frames[exon].append(UTR_EXON)

    # Make Final 2D array
    CombinedLists = []  # 1st index: genes; 2nd index items are: name, CDSExonCount, startFrame, stopFrame, CDSlength, exonLength, then AA alignment indicies
    geneIndex = 0
    # each gene is a row in CombinedLists
	# append each element in gene.Frame into CombinedLists
    for name, gene in gene_dic.items():
        CombinedLists.append([name])
        for col in gene.Frames:
            CombinedLists[geneIndex].append(col)
        geneIndex += 1

    # initialize preFinal to ...
	# for each list in CombinedLists as frameInfoList
	#   intialize name1 as first element in list which is name of gene
	#   append name into preFinal
	#   for each element in frameInfoList except first element name
	#       if alignmentIndex_firstExon is UTR_EXON, then append alignmentIndex_firstExon and exonSize
	#       else if count == 0
	#           for  in CombinedLists
		
    preFinal = []
    count = 0
    for frameInfoList in CombinedLists:
        name1 = frameInfoList[0]
        preFinal.append([name1])
        for col in frameInfoList[1:]:
            rowCount = count + 1
            rowOn = 0
            exonNum = col[0]  # coding exon
            startFrame = col[1]
            endFrame = col[2]
            # = col[3]
            exonSize = col[4] # coding length
            alignmentIndex_firstExon = col[5]
            
            if alignmentIndex_firstExon is UTR_EXON:  # if the first exon is only a UTR
                preFinal[count].append([alignmentIndex_firstExon, exonSize])
            elif count == 0:
                preFinal[count].append([alignmentIndex_firstExon, exonSize])
                for Nrow in CombinedLists[rowCount:]:
                    name2 = Nrow[0]
                    for Ncol in Nrow[1:]:
                        if startFrame == Ncol[1] and endFrame == Ncol[2]:  # start and end frames match
                            if (abs(exonSize - Ncol[4]) % 3) is 0: # lengths are the same ORF
                                if abs(alignmentIndex_firstExon - Ncol[5]) <= 10:
                                    # each of first alignment positions for each gene are within 10 of each other
                                    preFinal[count][exonNum+1].append([name2, Ncol[5], Ncol[4], Ncol[0]])
            else:
                found = False
                for row1 in preFinal:
                    if found is False:
                        lastName = row1[0]
                        colOn = 0
                        for col1 in row1[1:]:
                            if len(col1) > 2:
                                count3 = 0
                                while count3 < len(col1)-2 and found is False:
                                    if name1 == col1[count3+2][0] and exonNum == col1[count3+2][3]:
                                        found = True
                                        preFinal[count].append([-1, [rowOn, colOn, col1[0]]])
                                    count3 += 1
                            colOn += 1
                    rowOn += 1

                if found is False:
                    preFinal[count].append([alignmentIndex_firstExon, exonSize])
                    for Nrow in CombinedLists[rowCount:]:
                        name2 = Nrow[0]
                        for Ncol in Nrow[1:]:
                            if startFrame == Ncol[1] and endFrame == Ncol[2]:
                                if (abs( exonSize - Ncol[4]) % 3) is 0:
                                    if abs(alignmentIndex_firstExon - Ncol[5]) <= 10:
                                        preFinal[count][exonNum+1].append([name2, Ncol[5], Ncol[4], Ncol[0]])
            rowCount += 1
        count +=1



    ###DEBUGGING SECTION TO SEE THE 2D ARRAY OF EXON LENGTHS
    i = 1
    x = 100
    y = 20
    temp = '<svg width=300% height=300%>\n'

    #find out how many nonCDS exons there to find how far to shift SVG
    maxStart = 0
    for row in preFinal:
        startNum = 0
        for col in row[1:]:
            if col[0] == UTR_EXON:
                startNum += 1
        if startNum > maxStart:
            maxStart = startNum
    # print('max start is', maxStart)
    
    with open("createSVGtemp.html","w") as printSVG:
        printSVG.write("<html>\n")
        printSVG.write("<body>\n")
        printSVG.write("<p>dataParsing is completed, but still upgrade graph design</p>\n</body>\n</html>");


def main():
    # os.system("chmod -R 777 files")
    # os.system("echo 'DEBUGGING:' > /tmp/gfv.tmp; chmod 777 /tmp/gvf.tmp")

    
    message = "" #idk what it is for?

    # make a new unique directory in files directory
    # as well include initialize path a global which store path new directory	
    mkDir()

    # definies what arguments are setup in program
    # initialize useArgv as boolean to check if user use command-line or CGI form
    # initialize parser as Argument Parser to what are argument setup
    # set aligned file as an optional argument for user
    # set list of fasta file to run program
    # initialize args to hold all arugment user provide

    useArgv = False
    parser = argparse.ArgumentParser()
    parser.add_argument("-a", "--afa", metavar="", help="provide aligned file for cluster mega")
    parser.add_argument("files",nargs="*", help="fasta file(s)")
    args = parser.parse_args()

    # program require a list of fasta file to run a program
    # so check if user provide fasta file 
    # if not, print usage for user and terminate program



    # if called from a CGI form
    # initialize fileItems as list of filename through HTML Form
    # for each fileItem in fileItems list do:
    # copy all fileItem into a new directory by using path(global variable) in mkDir()
	
    if 'GATEWAY_INTERFACE' in os.environ:  # Called from a CGI form
        fileItems = form['filename[]']
        for fileItem in fileItems:
            if fileItem.file:
                fn = os.path.basename(fileItem.filename.replace("\\", "/"))  # change Windows filenames
                try:
		    # copy the file
                    open(path + '/' + fn, 'wb').write(fileItem.file.read())
                except:
		    # display error message
                    print("""Content-Type: text/html\n\n
                          <html>
                          <body>
                              <p>%s</p>
                          </body>
                          </html>
                          """ %(path+'/'+fn))
                    sys.exit()
					
	# if called from a command-line
    # set useArgv to be True
    # initialize list fieItems from args.files which user provide
    # for each fileItem in fileItems list do:
    # copy all fileItem into a new directory by using path(global variable) in mkDir()
	
    else:
        # get file(s) from the command-line
    	#
        # get input file(s) from either the CGI form or from the command-line
        #
        if not args.files:
            print("usage: dataParsing.py [-h]/[--help]")
            print("usage: dataParsing.py [UCSC Genome Browswer CDS fasta files]")
            print("usage: dataParsing.py [-a]/[--afa] [aligned file] [UCSC Genome Browswer CDS fasta files]")
            sys.exit(0)
        useArgv = True
        fileItems = args.files          #if using the argument line
        for fileItem in fileItems:
            op = open(fileItem,'r').read()
            fn = os.path.basename(fileItem)
            try:
                # Need to change 'wb' to 'w' due to this error message
                # 'str' does not support the buffer interface
                open(path + '/' + fn, 'w').write(op)
            except:
                sys.exit()
    
    # initialize afa as filename of aligned file
    # if user do NOT provide a file, afa will set as False value
    # pass afa into dataProcess()
	 
    afa = args.afa      #get the aligned provide, or set it as False if user dont provide the aligned
    dataProcess(afa)

    # initialize redirectStr to display output of createSVGtemp.html if called from a CGI form	
	
    redirectStr="""Content-Type: text/html\n\n
<html>
    <head>
        <meta http-equiv="refresh" content="0; url=createSVGtemp.html" />
    </head>
    <body>
        <p>Redirecting to <a href="createSVGtemp.html">createSVGtemp.html</a></p>
    </body>
</html>
"""
    
    # if called from CGI form use redirectStr
    # else print meassge of complete program
    if(not useArgv):
        print(redirectStr)
    else:
        print("Successfully completed")

if __name__ == "__main__":
    main() 
    sys.exit(0)
