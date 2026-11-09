# Nucleotide Toolkit

A small web app for DNA and RNA sequence analysis, built for a B.Tech Python course project.
It bundles ten Python modules behind one simple interface.

The ten original scripts in `modules/` are used **unchanged**. The Flask backend runs each
script, sends it the values typed in the form, and shows what it prints.

## Modules

1. RNA nucleotide percentage
2. DNA nucleotide percentage
3. Compare two sequences
4. Restriction site search
5. Sequence length
6. Reverse complement and palindrome check
7. Complementary strand
8. Mutation detection
9. DNA to protein translation
10. Restriction enzyme digestion

## Visual features

- Animated double helix banner at the top of every page.
- Base-coloured tiles (A green, T red, G amber, C blue, U purple) with index markers.
- Base-paired double-strand view for the complement and reverse-complement tools,
  with hydrogen bonds drawn (A-T has 2, G-C has 3).
- Highlighted recognition sites, mismatch markers, composition bars with GC content,
  and codon chips for translation, and a fragment map with a simulated gel for enzyme digestion.

The visuals are drawn in the browser from what each script prints, so the Python modules stay untouched.

## Run it

Requires Python 3.9 or newer.

```bash
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Project structure

```
app.py              Flask backend (runs the modules, serves the API)
modules/            The original Python scripts (unchanged)
templates/          HTML page
static/             CSS and JavaScript
requirements.txt    Dependencies
```

## How it works

Each module reads with `input()` and prints its result. When you click **Run**, the browser
sends your values to `/api/run/<id>`. The backend starts the script as a separate process,
feeds it your values as typed input, captures what it prints, and returns that text to the page.
