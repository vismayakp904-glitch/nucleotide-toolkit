restriction_enzymes = {
    "EcoRI": "GAATTC",
    "BamHI": "GGATCC",
    "HindIII": "AAGCTT",
    "HaeIII": "GGCC"
}

dna = input("Enter DNA sequence: ").upper().replace(" ", "").replace("\n", "")

if not dna:
    print("Error: DNA sequence cannot be empty.")
elif any(base not in "ATGC" for base in dna):
    print("Error: DNA sequence must contain only A, T, G and C.")
else:
    print("\nAvailable restriction enzymes:")
    for enzyme in restriction_enzymes:
        print(enzyme)

    enzyme_name = input("Enter enzyme name: ").strip()

    if enzyme_name not in restriction_enzymes:
        print("Error: Invalid restriction enzyme.")
    else:
        recognition_site = restriction_enzymes[enzyme_name]

        print("\nSelected enzyme:", enzyme_name)
        print("Recognition site:", recognition_site)

        cut_positions = []
        start = 0

        while True:
            position = dna.find(recognition_site, start)

            if position == -1:
                break

            if enzyme_name == "HaeIII":
                cut_position = position + 2
            else:
                cut_position = position + 1

            cut_positions.append(cut_position)
            start = position + 1

        if not cut_positions:
            print("No restriction site found.")
            print("DNA remains uncut.")
        else:
            fragments = []
            previous_position = 0

            for cut in cut_positions:
                fragments.append(dna[previous_position:cut])
                previous_position = cut

            fragments.append(dna[previous_position:])

            print("\nRestriction sites found:", len(cut_positions))
            print("Cut positions (1-based):",
                  [position + 1 for position in cut_positions])

            print("\nDNA fragments:")
            for i, fragment in enumerate(fragments, 1):
                print("Fragment", i, ":", fragment)
                print("Fragment size:", len(fragment), "bp")

            print("\nTotal number of fragments:", len(fragments))
            print("Total DNA length:", sum(len(f) for f in fragments), "bp")
