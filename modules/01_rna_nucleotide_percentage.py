# Module 1: Percentage of G, A, C and U in an RNA sequence

def percentage(rna_sequence):
    check_g = 0
    check_a = 0
    check_c = 0
    check_u = 0
    total = len(rna_sequence)

    if total == 0:
        print("RNA sequence cannot be empty.")
        return

    for nucleotide in rna_sequence:
        if nucleotide == "G":
            check_g += 1
        elif nucleotide == "A":
            check_a += 1
        elif nucleotide == "C":
            check_c += 1
        elif nucleotide == "U":
            check_u += 1
        else:
            print("Please enter a valid RNA sequence (A, U, G, C only).")
            return

    print("Percentage of G:", (check_g / total) * 100)
    print("Percentage of A:", (check_a / total) * 100)
    print("Percentage of C:", (check_c / total) * 100)
    print("Percentage of U:", (check_u / total) * 100)


rna = input("Enter RNA sequence: ").upper().strip()
percentage(rna)
