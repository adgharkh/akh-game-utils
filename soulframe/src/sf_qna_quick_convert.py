import argparse
import csv
import requests
from datetime import datetime, timezone
from pathlib import Path
from io import StringIO

HEADER_START = "Type of Question"


def load_csv_source(input_source, delimiter=","):
    # If it's a URL, fetch it
    if input_source.startswith("http"):
        response = requests.get(input_source)
        response.raise_for_status()
        content = response.text
        return list(csv.reader(StringIO(content), delimiter=delimiter))

    # Otherwise treat as file
    input_path = Path(input_source)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file '{input_source}' not found.")

    with input_path.open(newline='', encoding='utf-8') as f:
        return list(csv.reader(f, delimiter=delimiter))


def csv_to_wikitable(rows, output_txt, addTimestamp=True):
    if not rows:
        print("Error: CSV data is empty.")
        return

    # Find header row
    header_index = None
    for i, row in enumerate(rows):
        if row and row[0].strip() == HEADER_START:
            header_index = i
            break

    if header_index is None:
        print(f"Error: Could not find header row starting with '{HEADER_START}'")
        return

    headers = rows[header_index]

    # Find cutoff column
    cutoff_index = len(headers)
    for i, col in enumerate(headers):
        if col.strip() == "":
            cutoff_index = i
            break

    headers = headers[:cutoff_index]

    # Process rows
    data_rows = []
    for row in rows[header_index + 1:]:
        if not any(cell.strip() for cell in row):
            continue

        trimmed = row[:cutoff_index]
        if len(trimmed) < cutoff_index:
            trimmed += [""] * (cutoff_index - len(trimmed))

        data_rows.append(trimmed)

    # Write output
    with open(output_txt, "w", encoding="utf-8") as f:
        if addTimestamp:
            dt = datetime.now(timezone.utc)
            f.write(f"Snapshot as of {dt.strftime('%Y-%m-%d %H:%M:%SZ')} (UTC)" + "\n\n")

        f.write('{| class="wikitable"\n')
        f.write("! " + " !! ".join(headers) + "\n")

        for row in data_rows:
            f.write("|-\n")
            f.write("| " + " || ".join(row) + "\n")

        f.write("|}\n")

    print(f"Wikitable written to '{output_txt}'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert a CSV Q&A sheet to MediaWiki wikitable format.")
    parser.add_argument("input", help="Path to a local CSV file, or a URL to fetch")
    parser.add_argument("output", help="Path for the output .txt file")
    parser.add_argument("--no-timestamp", dest="timestamp", action="store_false",
                        help="Omit the UTC snapshot timestamp from the output")
    parser.set_defaults(timestamp=True)
    args = parser.parse_args()

    rows = load_csv_source(args.input)
    csv_to_wikitable(rows, args.output, addTimestamp=args.timestamp)