"""Flask backend for the Nucleotide Toolkit.

The original module scripts in /modules are NOT modified. Each one is run
as a separate Python process: the form values are sent to it as typed input
and whatever the script prints is sent back to the browser.
"""
import re
import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
MODULE_DIR = Path(__file__).parent / "modules"
TIMEOUT_SECONDS = 5
MAX_INPUT_LENGTH = 100_000

# file       : script in /modules
# hide       : optional regexes for script text that is not shown in the result box
# prompts    : the text each script passes to input(); removed from the output
# fields     : one form field per input() call, in the same order
MODULES = [
    {"id": 1, "file": "01_rna_nucleotide_percentage.py", "title": "RNA nucleotide percentage",
     "description": "Calculates the percentage of G, A, C and U in an RNA sequence.",
     "prompts": ["Enter RNA sequence: "],
     "fields": [{"label": "RNA sequence", "placeholder": "e.g. AUGGCCUAA", "example": "AUGGCCUAAGCU"}]},
    {"id": 2, "file": "02_dna_nucleotide_percentage.py", "title": "DNA nucleotide percentage",
     "description": "Calculates the percentage of G, A, C and T in a DNA sequence.",
     "prompts": ["Enter DNA sequence: "],
     "fields": [{"label": "DNA sequence", "placeholder": "e.g. ATGGCCTAA", "example": "ATGGCCTAAGCT"}]},
    {"id": 3, "file": "03_compare_nucleotide_sequences.py", "title": "Compare two sequences",
     "description": "Checks whether two nucleotide sequences are exactly identical.",
     "prompts": ["Enter required sequence: ", "Enter sequence to compare: "],
     "fields": [{"label": "Required sequence", "placeholder": "e.g. ATGC", "example": "ATGCGT"},
                {"label": "Sequence to compare", "placeholder": "e.g. ATGC", "example": "ATGCGT"}]},
    {"id": 4, "file": "04_restriction_site_search.py", "title": "Restriction site search",
     "description": "Finds every position of an enzyme recognition sequence in DNA and counts the cuts.",
     "prompts": ["Enter DNA sequence: ", "Enter restriction enzyme recognition sequence: "],
     "fields": [{"label": "DNA sequence", "placeholder": "e.g. GAATTCAAGAATTC", "example": "GAATTCAAGGAATTCTTGAATTC"},
                {"label": "Recognition sequence", "placeholder": "e.g. GAATTC (EcoRI)", "example": "GAATTC"}]},
    {"id": 5, "file": "05_sequence_length.py", "title": "Sequence length",
     "description": "Counts the number of bases in a DNA or RNA sequence.",
     "prompts": ["Enter sequence: "],
     "fields": [{"label": "DNA or RNA sequence", "placeholder": "e.g. ATGGCC", "example": "ATGGCCTAAGCT"}]},
    {"id": 6, "file": "06_dna_reverse_complement_palindrome.py", "title": "Reverse complement and palindrome",
     "description": "Gives the reverse complement of a DNA strand and tells you if it is a palindrome.",
     "prompts": ["Enter DNA sequence: "],
     "fields": [{"label": "DNA sequence", "placeholder": "e.g. GAATTC", "example": "GAATTC"}]},
    {"id": 7, "file": "07_dna_complementary_strand.py", "title": "Complementary strand",
     "description": "Gives the complementary strand of a DNA sequence.",
     "prompts": ["Enter DNA sequence: "],
     "fields": [{"label": "DNA sequence", "placeholder": "e.g. ATGC", "example": "ATGCGTAC"}]},
    {"id": 8, "file": "08_dna_mutation_detection.py", "title": "Mutation detection",
     "description": "Compares two DNA sequences of equal length and lists each substitution.",
     "prompts": ["Enter reference DNA sequence: ", "Enter DNA sequence to check: "],
     "fields": [{"label": "Reference DNA sequence", "placeholder": "e.g. ATGCGT", "example": "ATGCGTAC"},
                {"label": "DNA sequence to check", "placeholder": "e.g. ATGAGT", "example": "ATGAGTAA"}]},
    {"id": 9, "file": "09_dna_to_protein_translation.py", "title": "DNA to protein translation",
     "description": "Finds the first ATG start codon and translates the DNA into amino acids until a stop codon.",
     "prompts": ["Enter DNA sequence: "],
     "fields": [{"label": "DNA coding sequence", "placeholder": "e.g. ATGGCCTAA", "example": "CCATGGCCAAATGGTAA"}]},
    {"id": 10, "file": "10_restriction_enzyme_digestion_simulator.py", "title": "Restriction enzyme digestion",
     "description": "Simulates cutting DNA with a restriction enzyme and reports the size of each fragment.",
     "prompts": ["Enter DNA sequence: ", "Enter enzyme name: "],
     "hide": [r"\nAvailable restriction enzymes:\n(?:\w+\n)+"],
     "fields": [{"label": "DNA sequence", "placeholder": "e.g. ATGGAATTCCGATGAATTCGGCTAA", "example": "ATGGAATTCCGATGAATTCGGCTAA"},
                {"label": "Restriction enzyme", "type": "select", "options": ["EcoRI", "BamHI", "HindIII", "HaeIII"], "example": "EcoRI"}]},
]
BY_ID = {m["id"]: m for m in MODULES}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/modules")
def list_modules():
    public = [{k: m[k] for k in ("id", "title", "description", "fields")} for m in MODULES]
    return jsonify(public)


@app.route("/api/run/<int:module_id>", methods=["POST"])
def run_module(module_id):
    module = BY_ID.get(module_id)
    if module is None:
        return jsonify(ok=False, output="Module not found."), 404

    values = (request.get_json(silent=True) or {}).get("inputs", [])
    if len(values) != len(module["fields"]):
        return jsonify(ok=False, output="Please fill in every field."), 400
    values = [str(v).replace("\n", " ").replace("\r", " ") for v in values]
    if any(not v.strip() for v in values):
        return jsonify(ok=False, output="Please fill in every field."), 400
    if any(len(v) > MAX_INPUT_LENGTH for v in values):
        return jsonify(ok=False, output="Input is too long."), 400

    try:
        result = subprocess.run(
            [sys.executable, str(MODULE_DIR / module["file"])],
            input="\n".join(values) + "\n",
            capture_output=True, text=True, timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return jsonify(ok=False, output="The module took too long to respond."), 504

    output = result.stdout
    for pattern in module.get("hide", []):
        output = re.sub(pattern, "\n", output)
    for prompt in module["prompts"]:
        output = output.replace(prompt, "", 1)
    output = output.strip()
    if result.returncode != 0:
        return jsonify(ok=False, output=output or "The module hit an error.")
    return jsonify(ok=True, output=output or "(The module printed no output.)")


if __name__ == "__main__":
    app.run(debug=True)
