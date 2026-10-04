# Varesh Nirbhavne portfolio (red and white, multi-page)

Pages: index, projects, six project pages, about, experience, certifications, tools, contact. Plain HTML, CSS and JS, no build step needed to view it.

## View it
    python3 -m http.server 8000     # then open http://localhost:8000

## Put it online (free)
Netlify Drop (app.netlify.com/drop): drag this whole folder onto the page. GitHub Pages and Vercel work too.
Use a real host for sharing. The claude.ai preview is private and its page links may not behave like a normal site.

## Edit the text
All copy lives in the DATA section at the top of build.py (projects, jobs, certifications, contact details).
Change it, then run:  python3 build.py   (rewrites every .html page).
Colours and fonts are the tokens at the top of css/site.css.

## Please confirm before sharing
- Location (London) and LinkedIn URL, phone number and email in build.py
- Pastel Moments title, dates, team size and the 25 to 30 percent inquiries figure
- Vera and Destyle Apparels: are they the same venture? Destyle has no dates
- Starbucks is marked In progress. F1 is marked Live dashboard.
- Lloyds, Quantium and Starbucks images are illustrative artwork and are labelled. Revolut, F1 and Netflix use your real visuals.
- Revolut figures (GBP 1.9M, GBP 79M) are modelled from a dataset, and the page says so.
