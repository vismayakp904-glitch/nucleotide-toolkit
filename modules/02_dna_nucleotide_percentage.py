# Module 2: Percentage of G, A, C and T in a DNA sequence

def percentage(dna_sequence):
    check_g = 0
    check_a = 0
    check_c = 0
    check_t = 0
    total = len(dna_sequence)

    if total == 0:
        print("DNA sequence cannot be empty.")
        return

    for nucleotide in dna_sequence:
        if nucleotide == "G":
            check_g += 1
        elif nucleotide == "A":
            check_a += 1
        elif nucleotide == "C":
            check_c += 1
        elif nucleotide == "T":
            check_t += 1
        else:
            print("Please enter a valid DNA sequence (A, T, G, C only).")
            return

    print("Percentage of G:", (check_g / total) * 100)
    print("Percentage of A:", (check_a / total) * 100)
    print("Percentage of C:", (check_c / total) * 100)
    print("Percentage of T:", (check_t / total) * 100)


dna = input("Enter DNA sequence: ").upper().strip()
percentage(dna)
