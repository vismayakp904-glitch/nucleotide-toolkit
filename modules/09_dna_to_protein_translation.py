# Module 9: Translate a DNA coding sequence into a protein sequence

genetic_code = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
    "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
    "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
    "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
    "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
    "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
    "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
    "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
    "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
    "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
    "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G"
}

dna = input("Enter DNA sequence: ").upper().replace(" ", "").replace("\n", "")

if not dna:
    print("Error: DNA sequence cannot be empty.")
elif any(base not in "ATGC" for base in dna):
    print("Error: DNA sequence must contain only A, T, G and C.")
else:
    start = dna.find("ATG")

    if start == -1:
        print("No start codon (ATG) found.")
    else:
        protein = ""
        stop_found = False

        for i in range(start, len(dna) - 2, 3):
            codon = dna[i:i + 3]
            amino_acid = genetic_code[codon]

            if amino_acid == "*":
                stop_found = True
                break

            protein += amino_acid

        print("Start position (0-based):", start)
        print("Protein sequence:", protein)

        if stop_found:
            print("Stop codon found.")
        else:
            print("Warning: No in-frame stop codon found.")

        if (len(dna) - start) % 3 != 0 and not stop_found:
            print("Warning: Incomplete codon at the end of the sequence.")
