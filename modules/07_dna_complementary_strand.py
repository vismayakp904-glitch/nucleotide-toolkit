# Module 7: Find the complementary strand of a DNA sequence

def complement(dna_sequence):
    complementary_strand = ""

    for nucleotide in dna_sequence:
        if nucleotide == "G":
            complementary_strand += "C"
        elif nucleotide == "C":
            complementary_strand += "G"
        elif nucleotide == "A":
            complementary_strand += "T"
        elif nucleotide == "T":
            complementary_strand += "A"
        else:
            print("Invalid DNA sequence. Use only A, T, G and C.")
            return

    print("Complementary strand:", complementary_strand)


seq = input("Enter DNA sequence: ").upper().strip()
complement(seq)
