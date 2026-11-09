# Module 3: Check whether two nucleotide sequences are identical

def check_sequence(sequence):
    rsequence = input("Enter sequence to compare: ").upper().strip()

    if rsequence == sequence:
        print("Given sequences are identical.")
    else:
        print("Given sequences are not identical.")


sequence = input("Enter required sequence: ").upper().strip()
check_sequence(sequence)
