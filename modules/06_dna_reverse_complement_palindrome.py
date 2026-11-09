# Module 6: Find reverse complement and identify reverse-complement palindromic DNA

def reverse_complement(dna_sequence):
    complement = ""

    for nucleotide in reversed(dna_sequence):
        if nucleotide == "G":
            complement += "C"
        elif nucleotide == "C":
            complement += "G"
        elif nucleotide == "A":
            complement += "T"
        elif nucleotide == "T":
            complement += "A"
        else:
            print("Invalid DNA sequence. Use only A, T, G and C.")
            return

    print("Reverse complement:", complement)

    if complement == dna_sequence:
        print("Palindrome DNA sequence")
    else:
        print("Not a palindrome DNA sequence")


seq = input("Enter DNA sequence: ").upper().strip()
reverse_complement(seq)
