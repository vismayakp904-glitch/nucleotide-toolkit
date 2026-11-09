# Module 4: Find restriction enzyme recognition sites and count cuts

def restriction_sites(sequence, target):
    count = 0
    index = sequence.find(target)

    while index != -1:
        print(f"Found {target} at index {index}")
        count += 1
        index = sequence.find(target, index + 1)

    print("Number of cuts:", count)


sequence = input("Enter DNA sequence: ").upper().strip()
target = input("Enter restriction enzyme recognition sequence: ").upper().strip()

if not sequence or not target:
    print("DNA sequence and target cannot be empty.")
elif any(base not in "ATGC" for base in sequence + target):
    print("Please enter valid DNA sequences (A, T, G, C only).")
else:
    restriction_sites(sequence, target)
