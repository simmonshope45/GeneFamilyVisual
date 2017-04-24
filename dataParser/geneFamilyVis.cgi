#!/usr/bin/python3.4

import json
import cgitb; cgitb.enable()
import os, string, sys, cgi
import binascii
sys.path.insert(0, '/nfshome/agd2q/local/lib/python3.4/site-packages/biopython-1.65-py3.4-linux-x86_64.egg/')
sys.path.insert(0, '/nfshome/hcarroll/public_html/apps/clustalOmega/bin/')
from Bio import SeqIO
from Bio.SeqRecord import SeqRecord
from Bio.Align.Applications import ClustalOmegaCommandline
import itertools
import colorsys
import argparse #import argaparse library for addArgv, --afa
sys.stderr = sys.stdout

UTR_EXON = -2

form = cgi.FieldStorage()
path = ""

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

def dna_to_prot(strand):
    aminos = [ dnaToProtD[strand[i:i+3] ] for i in range(0, len(strand), 3) ]
    protein = "".join(aminos)
    return protein

# make a new directory with a random name (in the files directory)
# if files directory has not made, create one and set permission to 0o777
# initialize newDir as a random string, such as 424e069cb11ecc4f5712c3863c9cfba1
# initialize a global path to use late in Main()
# store a path of newDir into path string
# if newDir is not exist in files dirctory, create one and set permission to 0o777

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
	
# add argument for dataPrcoess for checking if there is afa in command line
# afa can be string of aligned file
# or False if user do not provide aligned file

def dataProcess(afa): 
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
                    startFrame = 0
                else:
                    startFrame = gene.Frames[CDSExonCount-1][2]  # get the ORF from the previous exon
		    # adjust the coding length to account for the reading frame from the previous exon
                    if(startFrame == '1'):
                        CDSlength -= 2
                    elif(startFrame == '2'):
                        CDSlength -= 1
			
		# determine the reading frame
                stopFrame = CDSlength % 3
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
            with open(path + "/ALL.txt", "a") as ALL_AA:
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
    in_file = path + "/ALL.txt"

    # if there is --afa on the command line, use the MSA from user
    # else use the aligned from the path in file folder
	# either option: store Aligned_str into each gene in the gene_dictionary
    out_file = ""
    if afa:
        out_file = "./" + afa
    else:
        out_file= path + "/aligned.fasta"
        clustalo = ClustalOmegaCommandline(infile=in_file, outfile=out_file, auto=True, cmd="/nfshome/hcarroll/public_html/apps/clustalOmega/bin/clustalo")
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

    if afa:
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
    jsonOutput = {}
    geneIndex = 0

    # each gene is a row in CombinedLists
	# append each element in gene.Frame into CombinedLists
    for name, gene in gene_dic.items():
        jsonOutput[name] = []
        colIn = 0
        for col in gene.Frames:
            jsonOutput[name] += [{}] 

            jsonOutput[name][colIn]['start'] = [col[-2]]
            jsonOutput[name][colIn]['end'] = [col[-1]]
            jsonOutput[name][colIn]['visualExons'] = [col]
            jsonOutput[name][colIn]['visualExonCol'] = [geneIndex]
            jsonOutput[name][colIn]['UTR'] = [col[0]]
            

            colIn += 1
        geneIndex += 1

    with open('result.json', 'w') as f:
        json.dump(jsonOutput, f)

def main():
    # os.system("chmod -R 777 files")
    # os.system("echo 'DEBUGGING:' > /tmp/hcarroll.tmp; chmod 777 /tmp/hcarroll.tmp")

    
    message = ""

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

    if not args.files:
        print("usage: dataParsing.py [-h]/[--help]")
        print("usage: dataParsing.py [list of fasta file]")
        print("usage: dataParsing.py [-a]/[--afa] [aligned file] [list of fasta file]")
        sys.exit(0)

	#
    # get input file(s) from either the CGI form or from the command-line
    #

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
		# display error message
                print("""Content-Type: text/html\n\n
                      <html>
                      <body>
                         <p>%s</p>
                      </body>
                      </html>
                      """ %(path+'/'+fn))
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
        os.system("echo 'DEBUGGING: redirectStr: " + redirectStr + "' > /tmp/hcarroll.tmp; chmod 777 /tmp/hcarroll.tmp")
        print(redirectStr)
    else:
        print("Successfully completed")

if __name__ == "__main__":
    main() 
    sys.exit(0)
