#!/usr/bin/env python3
"""Generates every page of the portfolio.

Run:  python3 build.py            (writes full HTML pages next to this file)
      python3 build.py artifact DIR   (also writes a content-only index.html into DIR for claude.ai artifacts)
Edit the DATA section below to change any text, then run the script again.
"""
import html, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
E = html.escape

# ------------------------------------------------------------------ DATA
SITE = "Varesh Nirbhavne"
EMAIL = "vareshworks@gmail.com"
PHONE = "+44 7518 537897"
PHONE_IN = "+91 8104060003"
LINKEDIN = "https://www.linkedin.com/in/varesh-nirbhavne-1619a02a3/"
LINKEDIN_TXT = "linkedin.com/in/varesh-nirbhavne-1619a02a3"
GITHUB = "https://github.com/iguesshecodes"
GITHUB_TXT = "github.com/iguesshecodes"
CITY = "Mumbai"

NAV = [
    ("projects.html", "Projects"),
    ("about.html", "About"),
    ("experience.html", "Experience"),
    ("certifications.html", "Certifications"),
    ("tools.html", "Tools"),
]

ALL_PROJECTS = [
    dict(
        slug="airline", theme="blue", title="The 2026 Airline Shock", short="Who handled it best",
        tools="Power BI, SQL, Python", year="2026", status="Completed", done=True,
        img="assets/airline-cover.webp", img_size=(2000, 1045), alt="Cover for the 2026 airline shock project, showing the Power BI dashboard", tall=False,
        cap="Project cover.",
        orig="assets/airline-work.webp", orig_size=(2075, 1375), orig_alt="The Power BI brand playbook table with the SQL and Python behind the report", orig_cap="From the project: the Power BI brand playbook, with the SQL and Python behind it.",
        lede="Ten airlines, UK and India, hit by the same shock. Some cut seats, some added them. Who actually handled it best?",
        q="A simulated Head of Network and Revenue at a mid-size airline has to choose when fuel costs and disruption hit: cut capacity, raise fares, or accept a lower load factor. I wrote the brief myself and say so in the repo, so no client was involved.",
        did=[
            "Pulled monthly traffic from UK CAA and India DGCA, January 2025 to September 2026, 211 brand-month rows, into a small star schema with a SQL layer.",
            "Compared the shock window, March to August 2026, against the same months of 2025, so seasonality cancels and only brands with data in both windows count.",
            "Cleaned and tagged every row in Python, and computed load factor as summed passenger-km over seat-km, never an average of monthly percentages.",
            "Built a three-page Power BI report, Overview, Brand playbook and Findings, on a star schema with 16 DAX measures.",
        ],
        found=[
            "Cutting seats protected load factor but cost passengers. Air India Group cut 9.0% of its seats and still lost 7.2% of passengers; Ryanair UK cut 7.6% and lost 5.2%.",
            "Adding seats only worked where demand was proven. Jet2 grew seats 5.7% and filled them for the best resilience score, +10.1; easyJet UK added 7.2% and load factor fell 3.6 points.",
            "Across the ten airlines, capacity and passenger change move together, about +0.78, while capacity and load factor move against each other, about -0.30. With ten airlines this is descriptive, not a statistical claim.",
        ],
        metrics=[("10", "airlines compared, UK and India"), ("+0.78", "seats to passengers correlation, n=10"), ("16", "DAX measures on a star schema")],
        note_h="A note on the data and honesty",
        note="Descriptive, not causal, and no forecast. UK CAA covers UK-registered carriers only, and the CAA and India DGCA define load factor slightly differently. There is no fare data, so no profit view. SpiceJet is excluded because it has no 2025 data, and the stakeholder is simulated, stated in the first line of the brief. Independent project using public data, not affiliated with any airline.",
        tags=["Power BI", "SQL", "Python", "DAX", "Star schema", "Data storytelling"],
    ),
    dict(
        slug="hm", theme="coral", title="H&M Customer Retention Analysis", short="Which customers are quietly leaving",
        tools="DuckDB SQL, Python, scikit-learn, Tableau", year="2026", status="Completed", done=True,
        img="assets/hm-cover.webp", img_size=(2000, 1045), alt="Cover for the H&M customer retention analysis, showing the Tableau dashboard and the headline result", tall=False,
        cap="Project cover.",
        orig="assets/hm-dash.webp", orig_size=(2400, 1327), orig_alt="The H&M customer retention Tableau dashboard, with funnel, status, segments, methods and trend panels", orig_cap="The Tableau Public dashboard built for this project.",
        lede="Which customers are quietly drifting away, how much revenue is at risk, and which of them are worth saving first.",
        q="Which H&M customers are quietly drifting away, how much revenue is at risk, and which ones are actually worth saving first? The context is a fashion retailer under pressure from faster, cheaper rivals. The data carries no competitor information, so I never claim to know why customers leave.",
        did=[
            "Worked a 10% customer sample of the public H&M dataset, 137,571 customers and 3.2 million purchases, with DuckDB SQL on a laptop, and checked the sample against the full 31.8 million rows.",
            "Built a retention funnel and sorted every customer into on track, slipping, drifting or gone quiet by comparing their silence against their own usual gap between visits.",
            "Trained a logistic regression churn model, then read its predictions against spend rather than accuracy alone.",
            "Shipped a Tableau Public dashboard and a script where a free local AI model writes a monthly summary, with a built-in number checker added after an early version mixed up customers and revenue.",
        ],
        found=[
            "About a fifth of yearly revenue sits with customers who have gone quiet or are drifting, and roughly 12.1% is likely gone for good.",
            "The model scored 0.77 AUC on a later period it never saw, but its riskiest customers were small spenders, so chasing accuracy alone would have protected almost none of the money.",
            "Ranking the same top 20% of customers by risk times spend catches 49.4% of the revenue that later goes quiet, against 11.0% for a plain churn model, about 4.5 times the money from the same sized list.",
        ],
        metrics=[("49.4%", "of lost revenue caught by risk times spend, vs 11.0% plain"), ("0.77", "model AUC on an unseen later period"), ("31.8M", "purchases analysed, from 1.37M customers")],
        note_h="A note on the data and honesty",
        note="Built on the public Kaggle H&M dataset, which ends in September 2020, so this is a 2018 to 2020 picture and cannot say how H&M is doing today. Prices are scrambled, so revenue is treated as an index, never pounds. Everything found shows links, not proof, so the recommendation is a randomised test before any spend. Independent project, free and open source, not affiliated with or endorsed by H&M.",
        tags=["Churn modelling", "SQL", "Python", "scikit-learn", "Tableau", "Customer analytics"],
    ),
    dict(
        slug="ocado", theme="teal", title="UK Online Grocery Growth Intelligence", short="Turning marketing data into decisions",
        tools="Lighthouse, Meta Ad Library, Tableau, Excel", year="2026", status="Completed", done=True,
        img="assets/ocado-cover.webp", img_size=(2000, 1045), alt="Cover for the UK online grocery growth intelligence project, showing the Tableau dashboard", tall=False,
        cap="Project cover.",
        orig="assets/ocado-dash.webp", orig_size=(2400, 1164), orig_alt="The Ocado and Tesco paid social Tableau dashboard, with format, angle and offer mix and a top ads table", orig_cap="The Tableau Public dashboard built for this project.",
        lede="How UK online grocers could grow through better website experiences, smarter paid social, and data-driven experiments.",
        q="How can UK online grocery retailers improve digital growth through website experience, paid advertising and experimentation? Tesco's site could not be reliably tested because of an access restriction, so the comparisons were chosen to protect research integrity rather than manufacture missing numbers.",
        did=[
            "Collected ten mobile Lighthouse observations across Ocado and Sainsbury's grocery pages, and manually analysed ten Ocado and Tesco Meta adverts verified in the Meta Ad Library.",
            "Compared website performance, Ocado versus Sainsbury's, and paid social creative strategy, Ocado versus Tesco, across two shopping missions: weekly groceries and dinner tonight.",
            "Built four Tableau Public dashboard components and scored ten proposed growth experiments with ICE.",
            "Turned the signals into a 90-day growth roadmap, kept to proposals rather than claimed results.",
        ],
        found=[
            "Ocado's audited pages averaged a mobile performance score of 33.8 against Sainsbury's 49.8, with Ocado's category page the slowest at an LCP of 31.5 seconds.",
            "The two brands lean different ways in paid social: Ocado's sample pushed value, discounts and delivery, while Tesco's leaned on premium quality, recipe inspiration and Clubcard loyalty.",
            "The strongest opportunity was improving Ocado's category-page experience, the highest-ranked experiment at an ICE score of 7.33 out of 10.",
        ],
        metrics=[("33.8 vs 49.8", "avg mobile performance, Ocado vs Sainsbury's"), ("10", "growth experiments scored with ICE"), ("4", "Tableau dashboard components")],
        note_h="A note on the data and honesty",
        note="An independent analysis using publicly available information. The Lighthouse set is ten manual observations across different page mixes, estimated ad reach is not clicks, conversions or revenue, and the ten experiments are proposals, none implemented. Not affiliated with or endorsed by Ocado, Sainsbury's, Tesco or Meta.",
        tags=["Marketing analytics", "Web performance", "Paid social", "Tableau", "Experimentation"],
    ),
    dict(
        slug="revolut", theme="blue", title="Revolut London Growth Study", short="How a fintech could win more of London",
        tools="SQL, Python, Excel", year="2026", status="Simulated dataset", done=True,
        img="assets/revolut.webp", alt="Findings board for the Revolut London growth study", tall=False,
        cap="Findings board built from figures re-run on the project's own simulated data.",
        lede="Where should a fast-growing fintech spend to win more of London? I read the answer straight out of the data.",
        q="Where could a fintech like Revolut spend to grow across London? The answer sat in a simulated dataset of 10,000 customers, 500 campaigns and 33 boroughs, with campaign spend and churn tangled together.",
        did=[
            "Loaded the customers, campaigns and boroughs into SQL and ranked channels by customer value and boroughs by estimated revenue.",
            "Segmented customers by value, behaviour and geography in Python, and scored boroughs on income, young professionals, fintech awareness, footfall and current penetration.",
            "Worked out return and cost per customer for every channel. Spend-weighted, a paying customer cost £15.06 on out-of-home up to £18.14 on Google Ads.",
            "Tested whether churn could be predicted from customer attributes at all, then turned the findings into four LinkedIn carousel slides.",
        ],
        found=[
            "59 of the 500 campaigns (11.8%) had negative ROI, with £1.9M of spend between them across 2021 to 2024. The file's ROI assumes about £120 of revenue per paying customer, so treat it as modelled.",
            "Newham (1.7% penetration), Haringey (3.0%) and Barnet (3.7%) sit far below the borough median of 10.5%, and Haringey scores highest on my opportunity index.",
            "A Random Forest scored a ROC-AUC of about 0.51 on a held-out 20%, which is chance. I read that as useful: customer attributes do not explain who leaves, so the cause is more likely the product, and exit surveys would tell a team more than another model.",
            "The raw file's CAC column is really cost per signup. Averaged that way TikTok looks cheapest (£18.12) and out-of-home dearest (£33.61), but per paying customer the order flips. A good reminder to check what a CAC is divided by.",
        ],
        metrics=[("£1.9M", "spend in 59 loss-making campaigns, 2021 to 2024"), ("11.8%", "of the 500 campaigns lost money"), ("0.51", "churn model ROC-AUC, no better than chance")],
        note_h="A note on the data",
        note="The dataset is simulated, not company data, so every figure is a modelled estimate. The headline numbers were re-run from the project's data and code on 24 Nov 2026. An earlier £79M geographic upside figure is dropped because it could not be reproduced from the saved code. Independent portfolio project, not affiliated with or endorsed by Revolut.",
        tags=["Marketing analytics", "ROI analysis", "Geo analysis", "Churn", "Data storytelling"],
    ),
    dict(
        slug="f1", theme="coral", title="F1 2026 Championship Forecast", short="Two models, one title race",
        tools="Python, SQL, Tableau", year="2026", status="Completed", done=True,
        img="assets/f1.webp", alt="Dashboard comparing two F1 championship forecasts", tall=False,
        cap="Rebuilt in 4K from the project's CSV outputs. The simulation panels re-run the project's own settings and match its results.",
        orig="assets/orig-f1.webp", orig_size=(1200, 1169), orig_alt="The original Tableau dashboard after the Barcelona GP update", orig_cap="The original Tableau dashboard after the Barcelona GP update.",
        lede="Forecasting the 2026 title race two ways, and letting the methods argue with each other.",
        q="A championship runs over a noisy season, and a season under new rules is harder still. A single prediction hides the range, and different modelling choices can tell very different stories. How wide is the uncertainty?",
        did=[
            "Used the Kaggle Ergast archive as the historical base and prepared it with SQL.",
            "Ran a Monte Carlo simulation in Python: 5,000 possible seasons.",
            "Built a second, weighted SQL model to compare against it.",
            "Compared both in a Tableau dashboard after the Barcelona GP update.",
        ],
        found=[
            "The methods disagree, and that is the point. Monte Carlo concentrates the title on one driver at about 76%, while the weighted model spreads it much wider, with the leader in the low 20s.",
            "Seeing where they diverge is more honest than trusting a single forecast.",
        ],
        metrics=[("5,000", "Monte Carlo season runs"), ("2", "models compared side by side"), ("Live", "Tableau dashboard")],
        note_h="How to read it",
        note="These are probabilities as of the Barcelona GP update, not predictions of who wins, and they move with every race. The simulation uses the current standings, an assumed average of points per race, 14 races left and an 18% chance of a DNF, and it covers seven drivers only. Independent project using public data, not affiliated with or endorsed by Formula 1.",
        tags=["Monte Carlo", "BigQuery SQL", "Python", "Tableau", "Forecasting"],
    ),
    dict(
        slug="netflix", theme="magenta", title="Netflix Content Library Analysis", short="What 8,807 titles say about a catalogue",
        tools="Python, Pandas, Seaborn", year="2026", status="Completed", done=True,
        img="assets/netflix.webp", alt="Netflix content library dashboard", tall=False,
        cap="Rebuilt in 4K from the project dataset, with every figure recomputed from the 8,807 rows.",
        orig="assets/orig-netflix.webp", orig_size=(1600, 1105), orig_alt="The original Netflix executive dashboard", orig_cap="The original executive dashboard from the project.",
        lede="An end to end look at Netflix's full catalogue: what it stocks, where it comes from and how fast it moves.",
        q="The catalogue runs to nearly 9,000 titles across 126 countries. What is it actually made of, who is it for, and how quickly does content travel from release to the platform?",
        did=[
            "Cleaned the full titles dataset in Python with Pandas, repairing broken ratings and dates.",
            "Split the multi-value genre and country fields so each could be counted properly.",
            "Built six Matplotlib and Seaborn dashboards: a month by year heatmap, genre and rating breakdowns, duration by audience, a country content mix and a release to addition age gap.",
        ],
        found=[
            "The library skews adult, with TV-MA and TV-14 leading, and international: International Movies is the most common genre tag, on 31% of titles.",
            "It leans to film over TV, 6,131 titles against 2,676.",
            "Content moves fast: the median film is added two years after its release year, and shows land in the same year. Additions ramped hard from 2015 and peaked in 2019 at 2,016 titles.",
        ],
        metrics=[("8,807", "titles in the catalogue"), ("2 yrs", "median gap, film release to Netflix"), ("31%", "of titles tagged International Movies")],
        note_h="A note on the data",
        note="Built on a public Netflix titles dataset. Independent portfolio project, not affiliated with or endorsed by Netflix.",
        tags=["Python", "Pandas", "Seaborn", "EDA", "Data cleaning"],
    ),
]

PROJECTS = [p for p in ALL_PROJECTS if not p.get("hidden")]

JOBS = [
    dict(when="Sep 2024 to Sep 2025", place="Mumbai", role="Lead Video Editor and Creative Lead", org="Pastel Moments",
         ctx="Ran marketing, content and production end to end for a wedding-films studio, leading a team of five.",
         pts=["Led a <b>team of 5</b> across social media marketing, content marketing, film editing, client handling and project delivery.",
              "Owned <b>campaign management</b> and creative direction: pre-production planning, scriptwriting, content ideation and scheduling.",
              "Delivered <b>25+ films</b> and was promoted from intern after my first 3 films, which I finished 15 days early.",
              "Saw <b>conversion rise by roughly 30 to 40 percent year on year</b> across the campaigns I led. No analytics tool was used, so I treat it as indicative, not proven.",
              "Grew the studio's Instagram from about <b>8K to 12K</b> with 40 to 50 reels, editing in Premiere Pro and DaVinci Resolve.",
              "Managed the full loop from brief to delivery to reporting, keeping quality steady across a heavy production calendar."],
         chips=["Film editing", "Premiere Pro", "DaVinci Resolve", "Content marketing", "Campaign management", "Client management", "Team lead", "Creative direction"]),
    dict(when="Jan 2022 to Sep 2024", place="Remote, part time", role="Freelance Marketing and Content Analyst", org="Freelance",
         ctx="Part time work alongside my studies, turning messy client data into plain decisions, one account at a time.",
         pts=["Analysed customer and campaign data for <b>10+ clients</b>, turning behaviour and engagement patterns into plain recommendations for non-technical owners.",
              "Ran <b>Meta Ads, HubSpot email and WhatsApp Business</b> campaigns, and used A/B tests and simple sheet-based reporting to see what worked.",
              "Held a strict bar on <b>data QA and accuracy</b>, owning delivery end to end from brief to insight to result."],
         chips=["Meta Ads", "HubSpot email", "WhatsApp Business", "A/B testing", "Google Sheets", "Excel"]),
    dict(when="2022", place="Own store", role="Founder", org="Vera, Shopify apparel store",
         ctx="Built and ran a real store, so the marketing numbers had my own money behind them.",
         pts=["Ran my own <b>Shopify apparel store end to end</b>, from sourcing and listings to ads and fulfilment.",
              "Served <b>100+ orders</b>, using order and customer data to guide spend.",
              "Learned demand, pricing and retention from the inside, not from a case study."],
         chips=["Shopify", "Paid social", "Order data", "Unit economics"]),
    dict(when="Independent", place="Clothing brand", role="Brand owner", org="Destyle Apparels",
         ctx="Ran my own clothing brand. It is where marketing stopped being theory for me.",
         pts=["Positioning, content, pricing, and customers who either bought or did not."],
         chips=["Brand", "Content", "Pricing"]),
]

ACHIEVEMENTS = [
    dict(when="Jul 2026", place="Birmingham", role="Winner, Masters Consultancy Challenge", org="University of Birmingham, with Turner & Townsend",
         ctx="First place in the University of Birmingham Masters Consultancy Challenge, run with Turner & Townsend, as part of the winning team, Team Dynamite.",
         pts=["Owned the <b>implementation timeline</b> for a fully costed research facility proposal, backed by a <b>£47.4M business case</b>.",
              "Worked as one of the team behind the proposal, to a fixed brief and a hard deadline, alongside Turner &amp; Townsend.",
              "Took <b>first place</b> against competing university teams on the strength of the numbers, not the slides."],
         chips=["Implementation planning", "Project management", "Costing", "Teamwork"]),
]

CERTS = [
    dict(type="Professional Certificate", title="Google Data Analytics", by="Google via Coursera, 5 Aug 2026", img="assets/cert-google.webp", alt="Google Data Analytics Professional Certificate",
         text="Nine courses covering the full analyst workflow, from asking the right question to cleaning, analysing and sharing data, with spreadsheets, SQL, Tableau and Python.",
         chips=["SQL", "Python", "Spreadsheets", "Tableau", "Data cleaning"]),
    dict(type="Winner, team challenge", title="Masters Consultancy Challenge 2026", by="University of Birmingham with Turner & Townsend, 3 Jul 2026", img="",  alt="",
         text="Part of Team Dynamite, the winning team in the most competitive year of the programme. The team proposed a fully costed, sustainable, future-ready research facility for the university.",
         chips=["Teamwork", "Project management", "Costing", "Pitching"]),
    dict(type="Recognition", title="L'Oreal Brandstorm 2026", by="L'Oreal, certificate of recognition", img="assets/cert-loreal.webp", alt="L'Oreal Brandstorm 2026 certificate of recognition",
         text="Took part in L'Oreal's global youth innovation competition.",
         chips=["Innovation", "Brand strategy"]),
    dict(type="Certificate", title="Google Ads Search", by="Google Skillshop", img="", alt="",
         text="Google's Skillshop certification on building and measuring Search campaigns.",
         chips=["Google Ads", "Search"]),
    dict(type="Certificate", title="HubSpot Digital Marketing", by="HubSpot", img="", alt="",
         text="HubSpot's digital marketing certification, which matches the email and campaign work I have done in HubSpot.",
         chips=["HubSpot", "Email marketing", "Digital marketing"]),
    dict(type="Winner, hackathon", title="Canva hackathon", by="Canva", img="", alt="",
         text="Won a Canva hackathon.",
         chips=["Design", "Teamwork"]),
    dict(type="Programme", title="QS Future 17", by="QS", img="", alt="",
         text="Selected for QS Future 17.",
         chips=["Leadership", "Networking"]),
]

SIMS = [
    dict(type="Job simulation", title="Strategy Consulting", by="BCG via Forage, 1 Jun 2026", img="assets/cert-bcg.webp", alt="BCG Strategy Consulting job simulation certificate",
         text="Market research, consumer survey design, financial modelling and data analysis, then summarising the findings for a client audience.",
         chips=["Market research", "Survey design", "Financial modelling", "Data analysis"]),
    dict(type="Job simulation", title="Data Analytics", by="Quantium via Forage, 23 May 2026", img="assets/cert-quantium.webp", alt="Quantium Data Analytics job simulation certificate",
         text="Data preparation and customer analytics, experimentation and uplift testing, then turning the analysis into a commercial recommendation.",
         chips=["Customer analytics", "Uplift testing", "Experimentation"]),
    dict(type="Job simulation", title="Data Science", by="Lloyds Banking Group via Forage, 24 May 2026", img="assets/cert-lloyds.webp", alt="Lloyds Banking Group Data Science job simulation certificate",
         text="Data gathering and exploratory analysis, then building a machine learning model and framing the result for a business audience.",
         chips=["Python", "EDA", "Machine learning"]),
    dict(type="Job simulation", title="Data Science", by="British Airways via Forage, 2026", img="assets/cert-ba.webp", alt="British Airways Data Science job simulation certificate of completion, 9 May 2026",
         text="Modelled lounge eligibility at Heathrow Terminal 3 and predicted customer buying behaviour. Completed 9 May 2026.",
         chips=["Python", "Modelling", "Customer behaviour"]),
]

MARQUEE = ["SQL", "Python", "Tableau", "Power BI", "Excel", "Campaign ROI", "Churn analysis", "A/B testing", "Paid social", "HubSpot email"]

ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231a3b9f'/%3E%3Cpath d='M14 20h9l9 24 9-24h9L36 52h-8z' fill='%23fff'/%3E%3C/svg%3E"


# ------------------------------------------------------------------ SHARED PIECES
def li(items):
    return "".join("<li>%s</li>" % E(x) for x in items)


def bar(active):
    links = "".join(
        '<a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if h == active else "", t) for h, t in NAV
    )
    cta_cur = ' aria-current="page"' if active == "contact.html" else ""
    return f'''<header class="bar" id="bar">
  <a class="bar__logo" href="index.html" data-label="Home" aria-label="Varesh Nirbhavne, home"><span>Varesh Nirbhavne</span><span aria-hidden="true">Marketing &amp; data</span></a>
  <nav class="bar__links" aria-label="Main">{links}</nav>
  <a class="bar__cta" href="contact.html"{cta_cur}>Contact</a>
  <button class="bar__menu" id="menuBtn" aria-expanded="false" aria-controls="menu"><span class="bar__menu-label">Menu</span><span class="bar__burger" aria-hidden="true"><i></i><i></i></span></button>
</header>
<div class="menu" id="menu" aria-label="Menu">
  <nav class="menu__links" aria-label="Mobile">
    <a href="index.html" data-label="Home"><span>Home</span></a>
    {"".join('<a href="%s"><span>%s</span></a>' % (h, t) for h, t in NAV)}
    <a href="contact.html"><span>Contact</span></a>
  </nav>
  <p class="menu__foot">{EMAIL}</p>
</div>'''


def footer():
    fl = "".join('<a href="%s">%s</a>' % (h, t) for h, t in [("index.html", "Home")] + NAV + [("contact.html", "Contact")])
    return f'''<footer class="footer">
  <div class="footer__top">
    <p class="footer__big">Let's make something work.</p>
    <nav class="footer__links" aria-label="Footer">{fl}</nav>
  </div>
  <p class="footer__name" aria-hidden="true">Varesh Nirbhavne</p>
  <div class="footer__base"><span>© 2026 Varesh Nirbhavne, {CITY}</span><span>Independent portfolio. Company names belong to their owners.</span></div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>'''


def nextlink(href, label, title):
    return f'<a class="next" href="{href}" data-label="{E(label)}" ><small>Next</small><strong>{E(title)}</strong></a>'


def pagehead(crumb, title, sub, meta=""):
    c = f'<a class="pagehead__crumb" href="{crumb[0]}" data-label="{E(crumb[1])}">&larr; {E(crumb[1])}</a>' if crumb else ""
    m = f'<div class="pagehead__meta" data-intro-fade>{meta}</div>' if meta else ""
    words = title.split(" ")
    title_html = (E(" ".join(words[:-1])) + " <em>" + E(words[-1]) + "</em>") if len(words) > 1 else (E(words[0]) + "<em>.</em>")
    return f'''<section class="pagehead blue">
  <div class="gridlines" aria-hidden="true"></div>
  <div data-intro-fade>{c}</div>
  <h1 class="pagehead__title" data-split data-intro>{title_html}</h1>
  <p class="pagehead__sub" data-intro-fade>{E(sub)}</p>
  {m}
</section>'''


def page(fname, title, label, desc, main, active, scripts=(), loader="", theme="coral"):
    head = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#1a3b9f">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:image" content="assets/og.jpg">
<link rel="icon" href="{ICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@1,300;1,400;1,500;1,600&display=swap">
<link rel="stylesheet" href="css/site.css">
<noscript><style>.curtain,.loader{{display:none!important}}</style></noscript>'''
    sc = "".join('<script src="%s"></script>' % s for s in
                 ["vendor/gsap.min.js", "vendor/ScrollTrigger.min.js", "js/site.js"] + list(scripts))
    body = f'''<a class="skip" href="#main">Skip to content</a>
<div class="grain" aria-hidden="true"></div>
<div class="curtain" id="curtain" data-label="{E(label)}"><i></i><i></i><i></i><i></i><i></i><span class="curtain__label" aria-hidden="true"></span></div>
{loader}
<div class="progress" aria-hidden="true"><span></span></div>
{bar(active)}
<main id="main">
{main}
</main>
{footer()}
{sc}'''
    return head, body


def write_page(fname, title, label, desc, main, active, scripts=(), loader="", theme="coral"):
    head, body = page(fname, title, label, desc, main, active, scripts, loader, theme)
    doc = f"<!doctype html>\n<html lang=\"en-GB\">\n<head>\n{head}\n</head>\n<body class=\"t-{theme}\">\n{body}\n</body>\n</html>\n"
    with open(os.path.join(ROOT, fname), "w", encoding="utf-8") as f:
        f.write(doc)
    return head, body


# ------------------------------------------------------------------ PAGES
def home():
    marq = "".join('<span>%s</span><span class="sep">/</span>' % E(m) for m in MARQUEE)
    cards = "".join(
        f'''<a class="scard scard--{i % 3}" style="--i:{i}" href="project-{p["slug"]}.html" data-label="{E(p["title"])}">
      <div class="scard__copy">
        <span class="scard__no">{i + 1:02d}<small>/ {len(PROJECTS):02d}</small></span>
        <div><h3 class="scard__title">{E(p["title"])}</h3><p class="scard__short">{E(p["short"])}</p></div>
        <div class="scard__foot"><span class="scard__tools">{E(p["tools"])}</span><span class="scard__go">View case study <span aria-hidden="true">&nearr;</span></span></div>
      </div>
      <div class="scard__img"><img src="{p["img"]}" alt="{E(p["alt"])}" width="3840" height="2160" loading="lazy"></div>
    </a>'''
        for i, p in enumerate(PROJECTS)
    )
    sticker = '<div class="sticker" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="cp" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"/></defs><circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" stroke-width=".5" opacity=".25"/><circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" stroke-width=".5" opacity=".25"/><text font-size="11.5" letter-spacing=".12em" fill="currentColor"><textPath href="#cp">OPEN TO WORK &#183; MARKETING &amp; DATA &#183; PORTFOLIO 2026 &#183; </textPath></text></svg></div>'
    loader = '''<div class="loader" id="loader" aria-hidden="true">
  <div class="loader__bar"><span></span></div>
  <span class="loader__name">Varesh Nirbhavne</span>
  <div class="loader__words"><span>Marketing</span><span>Data</span><span>Decisions</span></div>
</div>'''
    main = f'''<section class="hero" id="top">
  <div class="hero__orbs" aria-hidden="true"><div class="hero__orb hero__orb--a"></div><div class="hero__orb hero__orb--b"></div><div class="hero__orb hero__orb--c"></div></div>
  <div class="hero__floats" aria-hidden="true">
    <div class="hero__float hero__float--a">31.8M purchases</div>
    <div class="hero__float hero__float--b">SQL &middot; Python &middot; Tableau</div>
    <div class="hero__float hero__float--c">10+ clients</div>
    <div class="hero__float hero__float--d">25+ films</div>
    <div class="hero__float hero__float--e">163 respondents</div>
  </div>
  {sticker}
  <div class="hero__micro micro" data-intro-fade>
    <span>Marketing and data analytics</span>
    <span class="hero__status"><i class="pulse"></i>Available immediately &middot; NL, UAE, India, UK</span>
    <span>{CITY} &middot; Portfolio 2026</span>
  </div>
  <h1 class="hero__title" aria-label="Marketing and Data">
    <span class="hero__ln" data-ln aria-hidden="true">Marketing</span>
    <span class="hero__ln hero__ln--b" data-ln aria-hidden="true"><span class="amp">&amp;</span> Data</span>
  </h1>
  <div class="hero__bottom" data-intro-fade>
    <p class="hero__lede">A marketer who runs the campaigns, then reads the data to see what actually moved.</p>
    <div class="hero__actions">
      <a class="btn btn--light" href="projects.html" data-label="Projects">See my projects</a>
      <a class="btn btn--line" href="contact.html" data-label="Contact">Contact me</a>
    </div>
  </div>
</section>

<section class="marquee marquee--accent" aria-hidden="true"><div class="marquee__track">{marq}{marq}</div></section>

<section class="sec statement">
  <div class="wrap">
    <p class="statement__text" data-scrub>I turn campaign noise into <b>decisions that pay for themselves</b>. Strategy first, then the <b>SQL, Python and Tableau</b> to check I was right.</p>
  </div>
</section>

<section class="how" id="how">
  <div class="how__head wrap">
    <p class="micro">How I work</p>
    <h2 class="h2" data-split>Ask. Measure. <em>Decide.</em></h2>
  </div>
  <div class="how__list wrap">
    <article class="hcard" style="--i:0"><span class="hcard__no" aria-hidden="true">01</span><div><h3>Ask the sharper question</h3><p>Content, social and paid campaigns across 10+ clients taught me that a vague brief wastes budget. I start by pinning down the decision the work has to support.</p><ul class="chips"><li>Strategy</li><li>Paid social</li><li>HubSpot email</li><li>Content</li></ul></div></article>
    <article class="hcard" style="--i:1"><span class="hcard__no" aria-hidden="true">02</span><div><h3>Measure it properly</h3><p>SQL, Python and Tableau. Matched months, unseen test periods and honest error bars, so a number can survive a hard question in a room.</p><ul class="chips"><li>SQL</li><li>Python</li><li>Tableau</li><li>A/B testing</li></ul></div></article>
    <article class="hcard" style="--i:2"><span class="hcard__no" aria-hidden="true">03</span><div><h3>Decide, and say how sure</h3><p>Every project ends with a recommendation and a plain statement of what it cannot show. The airline study says plainly it is descriptive, not causal, and the H&amp;M test is marked recommended, not run. Both are on this site on purpose.</p><ul class="chips"><li>Storytelling</li><li>Honest limits</li><li>Recommendations</li></ul></div></article>
  </div>
</section>

<section class="creds" aria-label="Credentials">
  <div class="wrap">
    <p class="micro">Credentials</p>
    <ul>
      <li>Google Data Analytics</li><li>Masters Consultancy Challenge 2026 winner</li><li>Google Ads Search</li><li>HubSpot Digital Marketing</li><li>Canva hackathon winner</li><li>QS Future 17</li>
    </ul>
    <a class="btn btn--line-navy" href="certifications.html" data-label="Certifications">See certificates</a>
  </div>
</section>

<section class="stack" id="work" aria-label="Selected work">
  <div class="stack__head wrap">
    <h2 class="h2" data-split>Selected <em>work.</em></h2>
    <a class="btn btn--line light-line" href="projects.html" data-label="Projects">All projects</a>
  </div>
  <p class="wrap sec-note stack__note">Independent portfolio projects on public or simulated datasets, not company data. The Revolut study is labelled as simulated.</p>
  <div class="stack__list" id="stackList">{cards}</div>
</section>

<section class="sec cta cta--dark">
  <div class="wrap">
    <h2 class="h2" data-split>Got a role <em>in mind?</em></h2>
    <a class="btn btn--light" href="contact.html" data-label="Contact">Contact me</a>
  </div>
</section>'''
    return write_page("index.html", "Varesh Nirbhavne | Marketing and data analytics", "Home",
                      "Portfolio of Varesh Nirbhavne, a marketer and data analyst in Mumbai. Campaign work, SQL, Python and Tableau projects, and two small tools you can try.",
                      main, "index.html", loader=loader, theme="coral")


NUMWORD = {1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",10:"ten"}


def projects_page():
    rows = ""
    for n, p in enumerate(PROJECTS, 1):
        rows += f'''<a class="prow" href="project-{p["slug"]}.html" data-label="{E(p["title"])}" data-thumb="{p["img"]}">
      <span class="prow__no">{n:02d}</span>
      <span class="prow__title">{E(p["title"])}</span>
      <span class="prow__meta"><span>{E(p["tools"])}</span><span class="tag tag--soft">{E(p["status"])}</span></span>
      <span class="prow__arrow" aria-hidden="true">&nearr;</span>
      <span class="prow__thumb"><img src="{p["img"]}" alt="" loading="lazy"></span>
    </a>
    '''
    main = pagehead(None, "Projects", f"{NUMWORD[len(PROJECTS)].capitalize()} projects across marketing analytics, forecasting and customer modelling. Open any one for the full story.") + f'''
<section class="sec">
  <div class="wrap">
    <div class="prow__preview" id="prowPreview" aria-hidden="true"><img src="" alt=""></div>
    <div class="plist">{rows}</div>
    <p class="sec-note">The project pages show visuals from the real work. Revolut uses a simulated dataset and is labelled that way.</p>
  </div>
</section>
{nextlink("about.html", "About", "About me")}'''
    return write_page("projects.html", "Projects | Varesh Nirbhavne", "Projects",
                      "Marketing analytics, forecasting and customer modelling projects by Varesh Nirbhavne.", main, "projects.html", theme="violet")


def project_page(i, p):
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    dot = "tag--done" if p["done"] else "tag--wip"
    meta = f'<span class="tag {dot}">{E(p["status"])}</span><span class="tag">{E(p["year"])}</span><span class="tag">{E(p["tools"])}</span>'
    metrics = ""
    if p["metrics"]:
        metrics = '<ul class="pmetrics" data-stagger>' + "".join('<li><b>%s</b><span>%s</span></li>' % (E(a), E(b)) for a, b in p["metrics"]) + "</ul>"
    cls = "shot"
    w, h = p.get("img_size", (3840, 2160))
    second = ""
    if p.get("orig"):
        ow, oh = p["orig_size"]
        second = f'<figure class="shot shot--second" data-img-in><img src="{p["orig"]}" alt="{E(p["orig_alt"])}" width="{ow}" height="{oh}" loading="lazy"><figcaption>{E(p["orig_cap"])}</figcaption></figure>'
    chips = '<ul class="chips pchips">' + li(p["tags"]) + "</ul>"
    main = pagehead(("projects.html", "All projects"), p["title"], p["lede"], meta) + f'''
<section class="sec">
  <div class="wrap">
    <figure class="{cls}" data-img-in><img src="{p["img"]}" alt="{E(p["alt"])}" width="{w}" height="{h}"><figcaption>{E(p["cap"])}</figcaption></figure>
    {metrics}
    <div class="pcols" data-stagger>
      <div><h3>The question</h3><p>{E(p["q"])}</p></div>
      <div><h3>What I did</h3><ul>{li(p["did"])}</ul></div>
      <div><h3>What I found</h3><ul>{li(p["found"])}</ul></div>
    </div>
    <div class="pnote" data-reveal><h3>{E(p["note_h"])}</h3><p>{E(p["note"])}</p></div>
    {chips}
    {second}
  </div>
</section>
{nextlink("project-%s.html" % nxt["slug"], nxt["title"], nxt["title"])}'''
    return write_page("project-%s.html" % p["slug"], p["title"] + " | Varesh Nirbhavne", p["title"].split(" ")[0],
                      p["lede"], main, "projects.html", theme=p["theme"])


def about_page():
    main = pagehead(None, "About", "A marketer who got curious about the data.") + f'''
<section class="sec">
  <div class="wrap about">
    <div class="about__photo" data-reveal><img src="assets/photo-original.webp" alt="Varesh Nirbhavne smiling in a navy suit and glasses" width="1040" height="1300"></div>
    <div class="about__copy">
      <p class="about__pull" data-split>I'm a marketer who got curious about the data, and a bit obsessed with proving what actually worked.</p>
      <div data-stagger>
        <p>I'm <b>Varesh Nirbhavne</b>, based in {CITY}, with an MSc in Marketing from the University of Birmingham and a year of full time work at a wedding-films studio, plus part time freelance work, behind me.</p>
        <p>I started on the creative side, running social, content and paid ads for a wedding-films studio and for 10+ freelance clients. Then I got tired of guessing, so I taught myself <b>SQL, Python and Tableau</b> and started answering my own questions with data.</p>
        <p>Before marketing I studied Animation and Visual Effects, which is why I care how a chart looks as much as what it says.</p>
        <p>I like owning things end to end. I've led a team of five, built a Shopify store from nothing, and was part of the winning team in the University of Birmingham Masters Consultancy Challenge with Turner & Townsend. Small teams where I get to touch everything are where I'm happiest.</p>
        <p>When I'm not working you'll find me deep in an F1 race weekend or a new dataset I had no reason to download. Absolute rabbit holes, and I love it.</p>
      </div>
      <dl class="facts" data-reveal>
        <div><dt>Based in</dt><dd>{CITY}</dd></div>
        <div><dt>Studied</dt><dd>MSc Marketing, University of Birmingham</dd></div>
        <div><dt>Dissertation</dt><dd>Buy Now Pay Later and impulse buying, 163 respondents, SPSS (p &lt; 0.001)</dd></div>
        <div><dt>Open to</dt><dd>Marketing and data analyst roles in the Netherlands, UAE, India and the UK, in person, hybrid or remote. Available immediately.</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="sec dark">
  <div class="wrap">
    <h2 class="h2" data-split>What I <em>work with.</em></h2>
    <div class="skills" data-stagger>
      <div><h3>Marketing</h3><ul class="chips"><li>Paid social</li><li>Meta Ads</li><li>HubSpot email</li><li>WhatsApp Business</li><li>A/B testing</li></ul></div>
      <div><h3>Data</h3><ul class="chips chips--red"><li>SQL and BigQuery</li><li>Python and Pandas</li><li>scikit-learn</li><li>Tableau</li><li>Power BI</li><li>Excel</li><li>SPSS</li></ul></div>
      <div><h3>Creative</h3><ul class="chips"><li>Video editing</li><li>Premiere Pro</li><li>DaVinci Resolve</li><li>Visual storytelling</li></ul></div>
    </div>
  </div>
</section>
{nextlink("experience.html", "Work experience", "Work experience")}'''
    return write_page("about.html", "About | Varesh Nirbhavne", "About",
                      "Varesh Nirbhavne is a marketer who got curious about the data. MSc Marketing, University of Birmingham.", main, "about.html", theme="coral")


def experience_page():
    def render(items):
        html = ""
        for j in items:
            html += f'''<article class="job" data-reveal>
      <div><p class="job__when">{E(j["when"])}</p><p class="job__place">{E(j["place"])}</p></div>
      <div>
        <h3>{E(j["role"])}</h3>
        <p class="job__org">{E(j["org"])}</p>
        <p class="job__ctx">{E(j["ctx"])}</p>
        <ul class="job__pts">{"".join("<li>%s</li>" % x for x in j["pts"])}</ul>
        <ul class="chips">{li(j["chips"])}</ul>
      </div>
    </article>
    '''
        return html
    ach = render(ACHIEVEMENTS)
    jobs = render(JOBS)
    main = pagehead(None, "Experience and achievements", "A consultancy challenge win, film and campaign work, freelance analysis and a store of my own. Each one taught me to let the data decide.") + f'''
<section class="sec"><div class="wrap">
  <h2 class="exp-group__h">Competitions and achievements</h2>
  <div class="jobs">{ach}</div>
  <h2 class="exp-group__h">Work experience</h2>
  <div class="jobs">{jobs}</div>
</div></section>
{nextlink("certifications.html", "Certifications", "Education and certifications")}'''
    return write_page("experience.html", "Experience | Varesh Nirbhavne", "Experience",
                      "Experience and achievements of Varesh Nirbhavne: a consultancy challenge win, film and campaign work, freelance analysis and a Shopify store.", main, "experience.html", theme="blue")


def certs_page():
    def card(c):
        return f'''<article class="cert">{('<div class="cert__img"><img src="%s" alt="%s" loading="lazy"></div>' % (c["img"], E(c["alt"]))) if c["img"] else ""}<span class="cert__type">{E(c["type"])}</span><h3>{E(c["title"])}</h3><p class="cert__by">{E(c["by"])}</p><p>{E(c["text"])}</p><ul class="chips">{li(c["chips"])}</ul></article>'''
    certs = "".join(card(c) for c in CERTS)
    sims = "".join(card(c) for c in SIMS)
    main = pagehead(None, "Certifications", "Where I studied, the certificates behind the analytics, and the job simulations I have worked through.") + f'''
<section class="sec dark">
  <div class="wrap">
    <h2 class="h2" data-split>Education<em>.</em></h2>
    <div class="edu" data-reveal style="margin-top:clamp(28px,3vw,48px)">
      <div class="edu__row"><div><p class="job__when">2025 to 2026</p><p class="job__place">Birmingham</p></div><div><h3>MSc Marketing</h3><p>University of Birmingham. Strategy, analytics and consumer behaviour. Dissertation: a quantitative SPSS study of Buy Now Pay Later and impulse buying, with 163 respondents and a significant result (p &lt; 0.001).</p></div></div>
      <div class="edu__row"><div><p class="job__when">Completed Jul 2024</p><p class="job__place">Navi Mumbai</p></div><div><h3>BSc Animation and Visual Effects</h3><p>ITM University, GPA 8.88 / 10. Where the visual and storytelling eye comes from, now pointed at data.</p></div></div>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <h2 class="h2" data-split>Certifications<em>.</em></h2>
    <div class="certs" data-stagger>{certs}</div>
  </div>
</section>
<section class="sec dark">
  <div class="wrap">
    <h2 class="h2" data-split>Job simulations<em>.</em></h2>
    <p class="sec-note" style="margin-top:clamp(16px,2vw,28px)">Forage virtual experiences. These are practice on simulated company tasks, not employment, and none of the companies are affiliated with this site.</p>
    <div class="certs" data-stagger style="margin-top:clamp(28px,3vw,48px)">{sims}</div>
  </div>
</section>
{nextlink("tools.html", "Tools", "Try the tools")}'''
    return write_page("certifications.html", "Certifications | Varesh Nirbhavne", "Certifications",
                      "Education and certifications of Varesh Nirbhavne: MSc Marketing, Google Data Analytics, Google Ads Search, HubSpot, a Masters Consultancy Challenge win and Forage job simulations.", main, "certifications.html", theme="green")


def tools_page():
    main = pagehead(None, "Tools", "Two small calculators I built to think with. Move the sliders and see what changes.") + '''
<section class="sec">
  <div class="wrap">
    <div class="tabs" role="tablist" aria-label="Tools">
      <button class="tab is-active" role="tab" aria-selected="true" aria-controls="panelRoi" id="tabRoi">Campaign ROI</button>
      <button class="tab" role="tab" aria-selected="false" aria-controls="panelAb" id="tabAb" tabindex="-1">A/B test checker</button>
    </div>

    <div class="tool is-active" id="panelRoi" role="tabpanel" aria-labelledby="tabRoi">
      <div class="tool__inputs">
        <label class="field"><span>Ad spend</span><output id="oSpend">£10,000</output><input type="range" id="iSpend" min="500" max="100000" step="500" value="10000"></label>
        <label class="field"><span>Cost per click</span><output id="oCpc">£0.80</output><input type="range" id="iCpc" min="0.1" max="5" step="0.05" value="0.8"></label>
        <label class="field"><span>Click to sale rate</span><output id="oCr">2.5%</output><input type="range" id="iCr" min="0.2" max="12" step="0.1" value="2.5"></label>
        <label class="field"><span>Profit per sale</span><output id="oRpc">£40</output><input type="range" id="iRpc" min="5" max="300" step="1" value="40"></label>
      </div>
      <div class="tool__out">
        <p class="verdict" id="roiVerdict" aria-live="polite">You keep about £25 of profit for every £100 spent.</p>
        <div class="kpis">
          <div><span>Sales</span><b id="kSales">313</b></div>
          <div><span>Cost per sale</span><b id="kCpa">£32.00</b></div>
          <div><span>Return on spend</span><b id="kRoas">1.25x</b></div>
          <div><span>Break-even click cost</span><b id="kBe">£1.00</b></div>
        </div>
        <canvas id="roiChart" class="chart" role="img" aria-label="Profit as cost per click changes"></canvas>
        <p class="note">Profit per sale means margin after product costs, so the result is profit after ad spend. The chart assumes the same click to sale rate holds as costs change, which real campaigns rarely do.</p>
      </div>
    </div>

    <div class="tool" id="panelAb" role="tabpanel" aria-labelledby="tabAb" hidden>
      <div class="tool__inputs">
        <fieldset class="ab"><legend>Version A</legend>
          <label class="num"><span>Visitors</span><input type="number" id="aN" value="5000" min="1" inputmode="numeric"></label>
          <label class="num"><span>Conversions</span><input type="number" id="aC" value="200" min="0" inputmode="numeric"></label>
        </fieldset>
        <fieldset class="ab"><legend>Version B</legend>
          <label class="num"><span>Visitors</span><input type="number" id="bN" value="5000" min="1" inputmode="numeric"></label>
          <label class="num"><span>Conversions</span><input type="number" id="bC" value="245" min="0" inputmode="numeric"></label>
        </fieldset>
      </div>
      <div class="tool__out">
        <p class="verdict" id="abVerdict" aria-live="polite"></p>
        <div class="kpis">
          <div><span>Rate A</span><b id="kA">0</b></div>
          <div><span>Rate B</span><b id="kB">0</b></div>
          <div><span>Relative lift</span><b id="kLift">0</b></div>
          <div><span>p-value</span><b id="kP">0</b></div>
        </div>
        <div class="abbars" id="abBars" aria-hidden="true"></div>
        <p class="note">Two-sided two-proportion z-test. A small p-value says the gap is unlikely to be chance. It does not say the gap is big enough to matter, so read the likely difference as well.</p>
      </div>
    </div>
  </div>
</section>''' + "\n" + nextlink("contact.html", "Contact", "Get in touch")
    return write_page("tools.html", "Tools | Varesh Nirbhavne", "Tools",
                      "Two small tools by Varesh Nirbhavne: a campaign ROI calculator and an A/B test checker.", main, "tools.html", scripts=["js/tools.js"], theme="magenta")


def contact_page():
    main = pagehead(None, "Contact", "Available immediately for marketing and data analyst roles in the Netherlands, UAE, India and the UK. Email is the fastest way to reach me.") + f'''
<section class="sec">
  <div class="wrap">
    <div class="clist" data-stagger>
      <div class="crow crow--copy"><span class="crow__k">Email</span><span class="crow__v">{EMAIL}</span><button class="btn btn--line-navy" data-copy="{EMAIL}" data-done="Email copied">Copy</button></div>
      <div class="crow crow--copy"><span class="crow__k">Phone India</span><span class="crow__v">{PHONE_IN}</span><button class="btn btn--line-navy" data-copy="{PHONE_IN}" data-done="Number copied">Copy</button></div>
      <div class="crow crow--copy"><span class="crow__k">Phone UK</span><span class="crow__v">{PHONE}</span><button class="btn btn--line-navy" data-copy="{PHONE}" data-done="Number copied">Copy</button></div>
      <a class="crow" href="{LINKEDIN}" target="_blank" rel="noopener"><span class="crow__k">LinkedIn</span><span class="crow__v">{LINKEDIN_TXT}</span><span class="crow__go" aria-hidden="true">&nearr;</span></a>
      <a class="crow" href="{GITHUB}" target="_blank" rel="noopener"><span class="crow__k">GitHub</span><span class="crow__v">{GITHUB_TXT}</span><span class="crow__go" aria-hidden="true">&nearr;</span></a>
    </div>
    <div class="btnrow"><a class="btn btn--navy" href="mailto:{EMAIL}">Open in my mail app</a></div>
    <p class="sec-note">Based in {CITY}. Open to the Netherlands, UAE, India and the UK. If the button does nothing on your device, copy the address above instead.</p>
  </div>
</section>'''
    return write_page("contact.html", "Contact | Varesh Nirbhavne", "Contact",
                      "Contact Varesh Nirbhavne about marketing and data analyst roles.", main, "contact.html", theme="coral")


def build():
    out = {}
    out["index"] = home()
    projects_page()
    for i, p in enumerate(PROJECTS):
        project_page(i, p)
    about_page(); experience_page(); certs_page(); tools_page(); contact_page()
    return out


if __name__ == "__main__":
    out = build()
    if len(sys.argv) >= 3 and sys.argv[1] == "artifact":
        d = sys.argv[2]
        os.makedirs(d, exist_ok=True)
        head, body = out["index"]
        # content-only entry: title, links and body markup (the viewer adds the document skeleton)
        keep = [l for l in head.split("\n") if l.startswith(("<title", "<link rel=\"stylesheet\"", "<noscript"))]
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write("\n".join(keep) + "\n" + body + "\n")
        print("artifact index written to", d)
    print("built", len(PROJECTS) + 7, "pages")
