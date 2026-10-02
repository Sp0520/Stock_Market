import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from pu_doc_helpers import (
    set_cell_border, set_cell_shading,
    add_chapter_title, add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, add_table_caption, add_image_figure,
    add_callout_box, add_equation_box
)

ASSETS_DIR = r"C:\xampp\htdocs\stock_market\extracted_assets"
OUTPUT_DOCX = r"C:\xampp\htdocs\stock_market\Stock_Market_Application_Project_Report.docx"
DOWNLOADS_DOCX = r"C:\Users\Sneh Patel\Downloads\Stock_Market_Application_Project_Report.docx"

print("Opening existing docx to append Chapters 1, 2, 3, Future Work, References, and Appendices...")
doc = docx.Document(OUTPUT_DOCX)

# =========================================================================
# CHAPTER 1: INTRODUCTION
# =========================================================================
doc.add_page_break()
add_chapter_title(doc, "CHAPTER 1: INTRODUCTION")

add_heading_1(doc, "1.1 Project Problem Definition & Background")
add_body_p(doc,
    "The financial stock market stands as the pivotal engine of modern macroeconomic capital formation, enabling corporations "
    "to mobilize equity capital and granting retail and institutional investors avenues for wealth generation. However, despite "
    "unprecedented technological accessibility via mobile brokerages, a severe knowledge and competency barrier separates novice "
    "retail investors from profitable, disciplined market participation. Industry surveys and market regulator statistics reveal "
    "that over 85% of retail individual traders experience net financial capital depreciation during their initial twelve months of trading. "
    "This widespread value destruction stems primarily from emotional over-leveraging, inadequate grasp of trade execution mechanics, "
    "inability to compute risk-reward ratios, and panic reactions triggered by intraday equity volatility.")

add_body_p(doc,
    "Historically, equity trading was conducted through open-outcry floor systems where registered jobbers and brokers executed orders "
    "within physical trading pits. The advent of nationwide electronic screen-based trading systems—spearheaded in India by the National "
    "Stock Exchange (NSE) in 1994 and subsequently adopted by the Bombay Stock Exchange (BSE)—democratized liquidity by aggregating national "
    "order flow into centralized computerized matching engines. In contemporary financial markets, transactions occur within sub-millisecond "
    "intervals governed by automated matching algorithms operating across dematerialized electronic depositories (NSDL and CDSL).")

add_body_p(doc,
    "Despite these technological advancements, accessible pedagogical tools have failed to keep pace. Educational institutions and universities "
    "frequently rely on static theoretical textbooks that explain market terminology without granting students practical exposure. "
    "Conversely, commercial brokerage platforms require live bank account linking, mandatory regulatory Know Your Customer (KYC) documentation, "
    "and real monetary deposits. When novices attempt to learn directly on live commercial portals, unavoidable operational mistakes lead to "
    "direct financial loss. Traditional paper-and-pencil trading simulators suffer from opposite defects: they lack real-time quotes, fail to "
    "enforce transaction discipline, omit automated portfolio rebalancing, and lack dynamic feedback loops.")

add_callout_box(doc,
    "Core Problem Statement: Engineering a secure, high-integrity, real-time web simulation platform that reproduces the operational "
    "dynamics of equity markets—live quotes, atomic order execution, dynamic portfolio evaluation, and transaction auditing—allowing "
    "users to cultivate disciplined trading strategies with zero monetary risk.",
    "KEY PROBLEM SYNTHESIS (VIVA DEFENSE SUMMARY)")

add_heading_1(doc, "1.2 Motivation & Industry Context")
add_body_p(doc,
    "The motivation behind engineering the Stock Market Application arises from three intersecting dynamics in contemporary computing "
    "and capital markets:")

add_bullet_p(doc, "The Retail Investor Influx: Over the past five years, retail investor participation in equity markets has expanded exponentially, with tens of millions of new demat accounts opened annually. This influx has created an urgent societal need for risk-free simulation environments that teach sound risk management before capital is exposed.")
add_bullet_p(doc, "The Pedagogy-Practice Divide: Within undergraduate engineering and business curricula, students study financial engineering, database transactions, and client-server systems in isolation. A live stock trading web application unites real-time API telemetry, relational database integrity, asynchronous web interfaces, and financial computation into an integrated real-world platform.")
add_bullet_p(doc, "Technical Engineering Challenges: Developing a simulated brokerage web service requires solving quintessential computer science challenges: ensuring strict ACID transaction atomicity during concurrent buy/sell operations, managing non-blocking asynchronous quote polling via AJAX, securing user authentication sessions, and designing intuitive data visualization interfaces.")

add_heading_1(doc, "1.3 Project Profile & Architecture Overview")
add_body_p(doc,
    "The Stock Market Application is conceptualized, designed, and deployed as a modular, three-tier client-server web architecture. "
    "Table 1.1 outlines the formal technical and institutional profile of the project.")

add_table_caption(doc, "Table 1.1: Project Profile & System Specifications")
prof_data = [
    ("Project Title", "Stock Market Application (Web-Service to BUY & SELL Stocks)"),
    ("System Classification", "Financial Technology (FinTech) Simulation & Educational Portal"),
    ("Architectural Model", "3-Tier Client-Server Architecture (Presentation, Application, Database)"),
    ("Front-End Layer", "HTML5, CSS3, JavaScript (ES6+), Asynchronous AJAX, Bootstrap 5"),
    ("Back-End Scripting", "PHP 8.1+ (Procedural and Object-Oriented Modules)"),
    ("Database Management", "MySQL RDBMS (Engine: InnoDB, Foreign Key Constraints, ACID Transactions)"),
    ("Financial Telemetry APIs", "Alpha Vantage RESTful API & Marketstack Market Data API"),
    ("Payment Gateway Sandbox", "Razorpay Payment Gateway API (Virtual Fund Deposit Simulation)"),
    ("Data Visualization", "Chart.js HTML5 Canvas Interactive Technical Charting Engine"),
    ("Target Users", "Engineering Students, Novice Investors, Financial Researchers"),
    ("Project Guide", "Assistant Professor MS. SONALI KORI"),
    ("Academic Institution", "Department of Information Technology, PIET, Parul University, Vadodara")
]

tbl_prof = doc.add_table(rows=len(prof_data)+1, cols=2)
tbl_prof.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_prof.rows[0].cells[0].paragraphs[0].add_run("System Attribute").font.bold = True
tbl_prof.rows[0].cells[1].paragraphs[0].add_run("Technical Specification / Institutional Details").font.bold = True
for c in tbl_prof.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="1F4E79", bottom="1F4E79", sz="8")
for idx, (k, v) in enumerate(prof_data):
    row = tbl_prof.rows[idx+1]
    row.cells[0].width = Inches(1.8)
    row.cells[1].width = Inches(4.2)
    row.cells[0].paragraphs[0].add_run(k).font.name = "Calibri"
    row.cells[0].paragraphs[0].runs[0].font.bold = True
    row.cells[1].paragraphs[0].add_run(v).font.name = "Calibri"
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

add_heading_1(doc, "1.4 Project Aim and Objectives")
add_body_p(doc,
    "The paramount aim of the project is to engineer, validate, and document a robust, high-performance web-service "
    "that provides authentic, risk-free stock market simulation with real-time price feeds, atomic portfolio execution, "
    "and complete transaction auditing.", bold_prefix="Project Aim: ", space_after=8)

add_body_p(doc,
    "To achieve this overarching aim, twelve specific technical objectives were established. Table 1.2 details the implementation roadmap, "
    "differentiating currently validated deliverables from planned future enhancements.")

add_table_caption(doc, "Table 1.2: Project Aim and Objectives Implementation Roadmap")
stock_aims = [
    ("OBJ-01", "Construct a secure session-based authentication system featuring password hashing, input sanitization, and session fixation defense.", "Implemented & Validated"),
    ("OBJ-02", "Engineer a real-time stock search engine capable of resolving equity tickers with asynchronous quote retrieval via AJAX.", "Implemented & Validated"),
    ("OBJ-03", "Architect an atomic Buy Stock transaction engine that computes order costs, validates liquid wallet reserves, and locks balances.", "Implemented & Validated"),
    ("OBJ-04", "Develop a Sell Stock execution engine with holding quantity validation, weighted-average purchase cost tracking, and realized P&L calculation.", "Implemented & Validated"),
    ("OBJ-05", "Design a dynamic Portfolio Dashboard displaying aggregate invested capital, real-time portfolio valuation, and net ROI.", "Implemented & Validated"),
    ("OBJ-06", "Construct an immutable Transaction Ledger recording transaction identifiers, ticker symbols, buy/sell types, quantities, and execution timestamps.", "Implemented & Validated"),
    ("OBJ-07", "Integrate a simulated Razorpay Payment Gateway allowing authenticated users to top up virtual trading funds with real-world payment UX.", "Implemented & Validated"),
    ("OBJ-08", "Incorporate Chart.js dynamic data visualization to plot historical equity price movements, trading volumes, and visual trends.", "Implemented & Validated"),
    ("OBJ-09", "Implement full-duplex WebSockets streaming to deliver sub-second market ticker ticks without client HTTP polling overhead.", "Future Enhancement"),
    ("OBJ-10", "Construct an automated algorithmic limit order engine supporting Stop-Loss and Take-Profit automated execution triggers.", "Future Enhancement"),
    ("OBJ-11", "Deploy a cross-platform native mobile application leveraging React Native / Flutter communicating with backend REST endpoints.", "Future Enhancement"),
    ("OBJ-12", "Integrate an AI-driven Natural Language Processing (NLP) sentiment engine to classify market news feeds into predictive sentiment scores.", "Future Enhancement")
]

tbl_stk_aim = doc.add_table(rows=len(stock_aims)+1, cols=3)
tbl_stk_aim.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_stk_aim.rows[0].cells[0].paragraphs[0].add_run("ID").font.bold = True
tbl_stk_aim.rows[0].cells[1].paragraphs[0].add_run("Objective Specification & Deliverable").font.bold = True
tbl_stk_aim.rows[0].cells[2].paragraphs[0].add_run("Implementation Status").font.bold = True
for c in tbl_stk_aim.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="1F4E79", bottom="1F4E79", sz="8")
for idx, (num, obj, st) in enumerate(stock_aims):
    row = tbl_stk_aim.rows[idx+1]
    row.cells[0].width = Inches(0.8)
    row.cells[1].width = Inches(4.0)
    row.cells[2].width = Inches(1.2)
    row.cells[0].paragraphs[0].add_run(num).font.name = "Calibri"
    row.cells[0].paragraphs[0].runs[0].font.bold = True
    row.cells[1].paragraphs[0].add_run(obj).font.name = "Calibri"
    row.cells[2].paragraphs[0].add_run(st).font.name = "Calibri"
    if "Implemented" in st:
        row.cells[2].paragraphs[0].runs[0].font.color.rgb = RGBColor(0x00, 0x66, 0x00)
    else:
        row.cells[2].paragraphs[0].runs[0].font.color.rgb = RGBColor(0x88, 0x66, 0x00)
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

add_heading_1(doc, "1.5 Project Scope & Functional Boundaries")
add_body_p(doc,
    "Defining precise system boundaries is fundamental to software engineering success. The scope of the Stock Market Application encompasses:")

add_bullet_p(doc, "In-Scope User Capabilities: User registration, secure login/logout, password modification, virtual trading wallet administration, real-time equity lookup across major global tickers, live quote inspection, atomic Buy and Sell execution, portfolio tracking with unrealized and realized P&L, transaction ledger auditing, and virtual fund deposits via Razorpay sandbox.")
add_bullet_p(doc, "In-Scope Technical Boundaries: Full browser client compatibility (Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari), zero client-side installation requirements, responsive CSS grid/flexbox layouts adapting to desktop and mobile displays, relational MySQL database persistence with foreign key constraints, and RESTful API consumption.")
add_bullet_p(doc, "Out-of-Scope Exclusions (Current Release): The system does not route orders to live exchange matching engines (NSE/BSE), does not require real monetary transfers, does not support derivatives or options contracts in the current milestone, and does not provide financial investment advisory services.")

add_heading_1(doc, "1.6 Feasibility Study")
add_body_p(doc,
    "Prior to committing implementation resources, a thorough feasibility investigation evaluated the system across four classical engineering dimensions:")

add_bullet_p(doc, "Technical Feasibility: The chosen technology stack—HTML5, CSS3, JavaScript, PHP 8, and MySQL—represents mature, industry-standard, and exceptionally documented technologies. The development team possessed robust competencies in PHP web programming and SQL schema optimization. Third-party APIs (Alpha Vantage and Razorpay) provided standardized RESTful endpoints with comprehensive documentation. The project was assessed as highly technically feasible.")
add_bullet_p(doc, "Operational Feasibility: The user interface follows modern, human-centric design patterns characterized by intuitive navigation bars, clean tables, green/red profit-loss visual cues, and modal transaction confirmation dialogues. Users require zero training beyond basic web browsing literacy. Operationally, the application seamlessly fulfills its pedagogical mandate.")
add_bullet_p(doc, "Economic / Financial Feasibility: The software infrastructure leverages open-source solutions: Apache HTTP Server, PHP runtime, and MySQL Community Server, eliminating software licensing expenditures. Development utilized Visual Studio Code and Git version control. API integrations utilized free educational developer tiers. The project achieved 100% economic feasibility within academic budget limits.")
add_bullet_p(doc, "Schedule / Time Feasibility: Development milestones were structured according to the classic Waterfall lifecycle over a scheduled 16-week academic semester, encompassing requirement specification (Weeks 1-3), architectural modeling (Weeks 4-6), iterative coding (Weeks 7-11), test suite execution (Weeks 12-14), and documentation (Weeks 15-16). All deliverables were completed within designated university deadlines.")

add_heading_1(doc, "1.7 Organization of the Project Report")
add_body_p(doc,
    "In rigorous compliance with Parul University B.Tech Project Guidelines (PU/FET/B.TECH PROJECT GUIDELINES 2019-20), "
    "this report is structured into three comprehensive chapters followed by future enhancements, references, and appendices:")

add_bullet_p(doc, "Chapter 1 introduces the project problem definition, industrial context, technical profile, project aim and 12 detailed objectives, functional scope, feasibility study, and structural outline.")
add_bullet_p(doc, "Chapter 2 delivers a thorough Literature Review detailing the theoretical foundations of modern electronic equity exchanges, an academic survey of 20 relevant research studies, a comprehensive comparative matrix against commercial and simulated systems, and an evaluation of identified research gaps.")
add_bullet_p(doc, "Chapter 3 details the Experimental Setup and Methodology, encompassing SDLC Waterfall selection, 3-tier system architecture, formal SRS requirements, system modeling (Use Case, DFD Context & Level 1, ERD, and Data Dictionary), step-by-step transaction mechanisms (Auth, Search, Buy, Sell, Razorpay, Charts), testing methodologies and test case specifications, and empirical performance benchmarks.")
add_bullet_p(doc, "Work Need to be Complete in the Future provides clear, literature-grounded technical suggestions for the subsequent academic semester, focusing on machine learning sentiment analysis, automated limit orders, WebSockets streaming, and native mobile client development.")
add_bullet_p(doc, "References catalog all consulted literature, books, journals, conference proceedings, websites, and institutional guidelines strictly formatted in the Harvard Referencing / Citation System.")
add_bullet_p(doc, "Appendices provide the Plagiarism Check Certificate & Undertaking (Appendix I) and a comprehensive Viva Voce Defense Guide & Examiner Q&A Handbook (Appendix II) designed to facilitate outstanding viva voce presentation performance.")

print("Chapter 1 successfully appended.")
doc.save(OUTPUT_DOCX)
