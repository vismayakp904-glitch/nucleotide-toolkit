# Module 8: Detect differences (substitutions) between two DNA sequences

def check_mutation(sequence1, sequence2):
    len1 = len(sequence1)
    len2 = len(sequence2)

    if len1 != len2:
        print("Both sequences must be of the same length.")
        return

    found_mutation = False

    for i in range(len1):
        if sequence1[i] != sequence2[i]:
            found_mutation = True
            print("Mutation at index:", i, sequence1[i], "->", sequence2[i])

    if not found_mutation:
        print("No mutations detected.")


s1 = input("Enter reference DNA sequence: ").upper().strip()
s2 = input("Enter DNA sequence to check: ").upper().strip()

if any(base not in "ATGC" for base in s1 + s2):
    print("Please enter valid DNA sequences (A, T, G, C only).")
else:
    check_mutation(s1, s2)
