# SoulFrame Utils 

This subdirectory is for tools relating to the game SoulFrame. For more info, check https://www.soulframe.com. 

## CSV → MediaWiki Table Converter

Fetches a Google Sheets CSV export and converts it into MediaWiki table format. The script is intended specifically for https://docs.google.com/spreadsheets/d/1lBAslGeoyCi_k7xWu4ztt1YMzKyJd5FCVOAwPUsw2ms/edit?gid=0#gid=0 (TinyUrl redirect: https://tinyurl.com/soulframe-community-faq)

### IMPORTANT NOTE
Before updating https://wiki.avakot.org/Guide:Q%26A_Quick_Reference_(Community_FAQ), please check the "View history" on that page and ensure that all changes submitted via wiki are reflected in the Google Sheets link at 

### Command line usage generally

```bash
python sf_qna_quick_convert.py "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0" output.txt
```

### Running on GitHub Actions 
1. Go to https://github.com/adgharkh/akh-game-utils/actions/workflows/generate_wikitable.yaml
2. Run workflow
3. Click into the successful execution ("Generate Wikitable")
4. Scroll to the bottom to Artifacts and click the download button
5. Unzip
6. Check "View history" at https://wiki.avakot.org/Guide:Q%26A_Quick_Reference_(Community_FAQ) and ensure that any wiki contributions have also made it to Google Sheets
7. Copy and paste the contents of `output.txt` to https://wiki.avakot.org/Guide:Q%26A_Quick_Reference_(Community_FAQ), replacing the existing snapshot
