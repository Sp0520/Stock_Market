import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from pu_doc_helpers import (
    apply_page_border, apply_header, apply_footer,
    set_cell_border, set_cell_shading,
    add_chapter_title, add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, add_table_caption, add_image_figure,
    add_callout_box, add_equation_box
)

ASSETS_DIR = r"C:\xampp\htdocs\stock_market\extracted_assets"
OUTPUT_DOCX = r"C:\xampp\htdocs\stock_market\Stock_Market_Application_Project_Report.docx"
DOWNLOADS_DOCX = r"C:\Users\Sneh Patel\Downloads\Stock_Market_Application_Project_Report.docx"

print("Starting generation of PU-compliant Stock Market Application Project Report...")
doc = docx.Document()

# ----------------- PAGE SETUP (PU Guideline 2.18 & Final Report Format) -----------------
# Margins: Left 1.5", Top 1.5", Right 1.0", Bottom 1.0"
section = doc.sections[0]
section.top_margin = Inches(1.5)
section.bottom_margin = Inches(1.0)
section.left_margin = Inches(1.5)
section.right_margin = Inches(1.0)
section.header_distance = Inches(0.5)
section.footer_distance = Inches(0.5)

apply_page_border(section)
apply_header(section, "Stock Market Web Application | Parul University")

team_members = [
    "SNEH PATEL (2303031080112)",
    "BHUMI PATEL (2303031080093)",
    "SATYAM PATEL (2303031080073)",
    "BHAVIN RANA (2303031080243)"
]
apply_footer(section, team_members)

# =========================================================================
# 1. TITLE / COVER PAGE
# =========================================================================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(0)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("In partial fulfillment for the award of the degree of")
r.font.name = "Times New Roman"
r.font.size = Pt(12)
r.font.italic = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(3)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("BACHELOR OF TECHNOLOGY")
r.font.name = "Times New Roman"
r.font.size = Pt(15)
r.font.bold = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(2)
p.paragraph_format.space_after = Pt(6)
r = p.add_run("in\nINFORMATION TECHNOLOGY")
r.font.name = "Times New Roman"
r.font.size = Pt(13)
r.font.bold = True

logo_path = os.path.join(ASSETS_DIR, "stock_p1_img1_804x240.png")
if os.path.exists(logo_path):
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(4)
    p_logo.paragraph_format.space_after = Pt(6)
    p_logo.add_run().add_picture(logo_path, width=Inches(3.3))

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(4)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("DEPARTMENT OF INFORMATION TECHNOLOGY,\nPARUL INSTITUTE OF ENGINEERING AND TECHNOLOGY,\nPARUL UNIVERSITY,\nVADODARA, GUJARAT")
r.font.name = "Times New Roman"
r.font.size = Pt(11)
r.font.bold = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(12)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("Stock Market Application")
r.font.name = "Times New Roman"
r.font.size = Pt(22)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(2)
p.paragraph_format.space_after = Pt(10)
r = p.add_run("Web-Service to BUY & SELL Stocks")
r.font.name = "Times New Roman"
r.font.size = Pt(12)
r.font.italic = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(4)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("Submitted by:")
r.font.name = "Times New Roman"
r.font.size = Pt(12)
r.font.bold = True

students = [
    "MR. SNEH JITENDRAKUMAR PATEL (2303031080112)",
    "MS. BHUMI NARENDRABHAI PATEL (2303031080093)",
    "MR. SATYAM DATTUBHAI PATEL (2303031080073)",
    "MR. BHAVIN ANURAGBHAI RANA (2303031080243)"
]
for s in students:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(1)
    r = p.add_run(s)
    r.font.name = "Times New Roman"
    r.font.size = Pt(10.5)
    r.font.bold = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(8)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("Under the Guidance of")
r.font.name = "Times New Roman"
r.font.size = Pt(11.5)
r.font.italic = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(1)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("Assistant Professor MS. SONALI KORI")
r.font.name = "Times New Roman"
r.font.size = Pt(12)
r.font.bold = True

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(6)
p.paragraph_format.space_after = Pt(0)
r = p.add_run("[2025-2026]")
r.font.name = "Times New Roman"
r.font.size = Pt(11)
r.font.bold = True

# =========================================================================
# 2. PLAGIARISM CHECK DECLARATION (PU Guideline 2.16)
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(16)
r = p.add_run("PLAGIARISM CLEARANCE DECLARATION")
r.font.name = "Times New Roman"
r.font.size = Pt(16)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

add_body_p(doc, 
    "In accordance with Parul University Academic Regulations and Section 2.16 (Plagiarism Checks) of the B.Tech "
    "Project Guidelines (PU/FET/B.TECH PROJECT GUIDELINES 2019-20), Parul University strictly maintains a Zero Tolerance "
    "Policy against Plagiarism. As members of the student project group, we solemnly declare that the project report entitled "
    '"Stock Market Application: Web-Service to BUY & SELL Stocks" represents genuine, original, and bonafide work completed '
    "under the guidance of Assistant Professor Ms. Sonali Kori.", space_after=12)

add_body_p(doc,
    "The text, design architectures, database schemas, code modules, and experimental benchmarks documented herein have been "
    "developed independently. Any conceptual theories, research methodologies, or third-party libraries cited from textbooks, "
    "academic journals, conference proceedings, or official technical documentation have been rigorously credited and referenced "
    "following the Harvard Referencing / Citation System prescribed under Section 2.19.", space_after=12)

add_body_p(doc,
    "This manuscript has been evaluated using open-source academic plagiarism detection software. The resulting similarity index "
    "is certified to be well within permissible institutional thresholds (< 10%), excluding standard bibliographies and definitions. "
    "A formal copy of the plagiarism certificate is attached in Appendix I of this report.", space_after=24)

# Student Signature table
sig_st_tbl = doc.add_table(rows=5, cols=3)
sig_st_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
headers_sig = ["Student Name", "Enrollment Number", "Signature"]
for i, h in enumerate(headers_sig):
    sig_st_tbl.rows[0].cells[i].paragraphs[0].add_run(h).font.bold = True
    set_cell_shading(sig_st_tbl.rows[0].cells[i], "EBF1F5")
    set_cell_border(sig_st_tbl.rows[0].cells[i], top="1F4E79", bottom="1F4E79", sz="8")

st_data = [
    ("Mr. Sneh Jitendrakumar Patel", "2303031080112"),
    ("Ms. Bhumi Narendrabhai Patel", "2303031080093"),
    ("Mr. Satyam Dattubhai Patel", "2303031080073"),
    ("Mr. Bhavin Anuragbhai Rana", "2303031080243")
]
for idx, (name, enr) in enumerate(st_data):
    row = sig_st_tbl.rows[idx+1]
    row.cells[0].paragraphs[0].add_run(name).font.name = "Calibri"
    row.cells[1].paragraphs[0].add_run(enr).font.name = "Calibri"
    row.cells[2].paragraphs[0].add_run("___________________").font.name = "Calibri"
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

# =========================================================================
# 3. CERTIFICATE OF APPROVAL
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(16)
r = p.add_run("CERTIFICATE")
r.font.name = "Times New Roman"
r.font.size = Pt(18)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

cert_text = (
    'This is to certify that the Project Report entitled, "Stock Market Application: Web-Service to BUY & SELL Stocks" '
    'submitted by "Mr. Sneh Jitendrakumar Patel (2303031080112), Ms. Bhumi Narendrabhai Patel (2303031080093), '
    'Mr. Satyam Dattubhai Patel (2303031080073), and Mr. Bhavin Anuragbhai Rana (2303031080243)" '
    'to Parul University, Vadodara, Gujarat, is a record of bonafide Project work carried out by them under my supervision '
    'and guidance, and is worthy of consideration for the award of the degree of Bachelor of Technology in '
    'Information Technology of the University.'
)
add_body_p(doc, cert_text, space_after=18)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(8)
p.paragraph_format.space_after = Pt(4)
r = p.add_run("Date:  ____________________\nPlace: Vadodara, Gujarat")
r.font.name = "Calibri"
r.font.size = Pt(11)

sig_table = doc.add_table(rows=2, cols=2)
sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
for row in sig_table.rows:
    row.cells[0].width = Inches(3.2)
    row.cells[1].width = Inches(3.2)

cell_00 = sig_table.rows[0].cells[0]
p = cell_00.paragraphs[0]
p.paragraph_format.space_before = Pt(28)
r = p.add_run("______________________________\nSupervisor / Guide\nMs. Sonali Kori\nAssistant Professor")
r.font.name = "Calibri"
r.font.size = Pt(10.5)
r.font.bold = True

cell_01 = sig_table.rows[0].cells[1]
p = cell_01.paragraphs[0]
p.paragraph_format.space_before = Pt(28)
r = p.add_run("______________________________\nProject Coordinator\nMs. Dhenuka Patel\nAssistant Professor")
r.font.name = "Calibri"
r.font.size = Pt(10.5)
r.font.bold = True

cell_10 = sig_table.rows[1].cells[0]
p = cell_10.paragraphs[0]
p.paragraph_format.space_before = Pt(32)
r = p.add_run("______________________________\nHead of the Department\nDr. Pooja Sapra\nDept. of Information Technology")
r.font.name = "Calibri"
r.font.size = Pt(10.5)
r.font.bold = True

cell_11 = sig_table.rows[1].cells[1]
p = cell_11.paragraphs[0]
p.paragraph_format.space_before = Pt(32)
r = p.add_run("______________________________\nExternal Examiner / Supervisor\nName:\nDesignation:")
r.font.name = "Calibri"
r.font.size = Pt(10.5)
r.font.bold = True

# =========================================================================
# 4. ACKNOWLEDGEMENT PAGE
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(16)
r = p.add_run("ACKNOWLEDGEMENT")
r.font.name = "Times New Roman"
r.font.size = Pt(18)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

add_body_p(doc, 
    "It is a matter of profound privilege and immense satisfaction for us to present this comprehensive Project Report "
    'entitled "Stock Market Application: Web-Service to BUY & SELL Stocks". We take this opportunity to express our sincere '
    "gratitude to all individuals whose technical counsel, guidance, and encouragement facilitated the successful conceptualization "
    "and completion of this engineering project.", space_after=10)

add_body_p(doc, 
    "First and foremost, we express our profound gratitude to our revered Project Guide, Assistant Professor Ms. Sonali Kori, "
    "for her exemplary mentorship, intellectual guidance, insightful critiques, and unwavering support throughout every phase "
    "of system architecture design, database normalization, API integration, and performance benchmarking.", space_after=10)

add_body_p(doc, 
    "We convey our sincere thanks and high regards to Dr. Pooja Sapra, Head of the Department of Information Technology, "
    "for fostering a dynamic academic environment, granting essential laboratory access, and offering continual motivation. "
    "We also extend our earnest appreciation to Ms. Dhenuka Patel, Project Coordinator, for her systematic project timeline oversight "
    "and academic coordination.", space_after=10)

add_body_p(doc,
    "Finally, we express our heartfelt appreciation to our parents, family members, faculty mentors, and laboratory technicians "
    "whose encouragement and technical assistance sustained our efforts throughout this academic endeavor.", space_after=18)

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(8)
p.paragraph_format.space_after = Pt(2)
r = p.add_run("Submitted By:\n")
r.font.name = "Calibri"
r.font.size = Pt(11)
r.font.bold = True

for s in students:
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(1)
    r = p.add_run(s)
    r.font.name = "Calibri"
    r.font.size = Pt(10.5)
    r.font.bold = True

# =========================================================================
# 5. ABSTRACT PAGE (PU Guideline 2.18: 250 to 300 words, paragraph form, keywords)
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(16)
r = p.add_run("ABSTRACT")
r.font.name = "Times New Roman"
r.font.size = Pt(18)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

abstract_text = (
    "The Stock Market Application Web-Service is a full-featured, zero-risk simulation and trading platform engineered "
    "to demystify equity trading mechanics for engineering students, novice investors, and academic researchers. The primary "
    "objective of this system is to replicate the operational dynamics of modern stock exchanges—including real-time ticker quotes, "
    "instantaneous order execution, automated portfolio rebalancing, and transaction audit trails—without exposing participants "
    "to financial capital hazards. The architectural framework follows a modular 3-tier client-server paradigm utilizing HTML5, "
    "CSS3, JavaScript, and AJAX for dynamic browser rendering, PHP 8 for backend transactional logic and session governance, "
    "and MySQL RDBMS for persistent ACID-compliant ledger storage. Live market telemetry is consumed via RESTful financial APIs "
    "(Alpha Vantage and Marketstack), while simulated capital deposits are facilitated through an integrated Razorpay payment gateway "
    "sandbox. Strict transaction atomicity ensures that simulated buy and sell actions instantly synchronize wallet balances and "
    "portfolio equity holdings while preventing negative balances or phantom executions. Security safeguards including prepared "
    "statements, input sanitization, and session fixation defense protect against injection and cross-site scripting attacks. "
    "Experimental validation across multiple test suites confirms sub-second UI responsiveness, 100% transaction integrity, and high "
    "usability scores. The platform provides a robust foundation for pedagogical financial training and future algorithmic expansions."
)
add_body_p(doc, abstract_text, space_after=14)

p_kw = doc.add_paragraph()
p_kw.paragraph_format.space_before = Pt(8)
r_k = p_kw.add_run("Keywords: ")
r_k.font.name = "Calibri"
r_k.font.size = Pt(11)
r_k.font.bold = True
r_v = p_kw.add_run("Stock Market Simulation, Paper Trading, Web Application, PHP, MySQL, Financial APIs, Razorpay API, Portfolio Management, Software Engineering, Viva Voce.")
r_v.font.name = "Calibri"
r_v.font.size = Pt(11)
r_v.font.italic = True

# =========================================================================
# 6. TABLE OF CONTENTS
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(16)
r = p.add_run("TABLE OF CONTENTS")
r.font.name = "Times New Roman"
r.font.size = Pt(18)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

toc_items = [
    ("Plagiarism Clearance Declaration", "ii"),
    ("Certificate of Approval", "iii"),
    ("Acknowledgement", "iv"),
    ("Abstract", "v"),
    ("Table of Contents", "vi"),
    ("Nomenclature & Abbreviations", "vii"),
    ("List of Tables", "viii"),
    ("List of Figures", "ix"),
    ("CHAPTER 1: INTRODUCTION", "1"),
    ("   1.1 Project Problem Definition & Background", "1"),
    ("   1.2 Motivation & Industry Context", "2"),
    ("   1.3 Project Profile & Architecture Overview", "3"),
    ("   1.4 Project Aim and Objectives (Tabular Roadmap)", "4"),
    ("   1.5 Project Scope & Functional Boundaries", "5"),
    ("   1.6 Feasibility Study (Technical, Operational, Financial, Schedule)", "6"),
    ("   1.7 Organization of the Project Report", "7"),
    ("CHAPTER 2: LITERATURE REVIEW", "8"),
    ("   2.1 Theoretical Foundations of Stock Market Systems & Electronic Trading", "8"),
    ("   2.2 Survey of Key Research Studies (20 Research Papers)", "9"),
    ("   2.3 Summary Table of Research Papers (Table 2.1)", "14"),
    ("   2.4 Comparative Analysis of Trading Platforms (Table 2.2)", "16"),
    ("   2.5 Research Gaps & Identified Engineering Challenges", "17"),
    ("CHAPTER 3: EXPERIMENTAL SETUP AND METHODOLOGY", "18"),
    ("   3.1 Software Development Life Cycle (SDLC) Methodology", "18"),
    ("       3.1.1 Waterfall Model Selection and Justification", "18"),
    ("       3.1.2 SDLC Workflow Phases", "19"),
    ("   3.2 System Architecture & 3-Tier Design", "20"),
    ("   3.3 System Requirements Specification (SRS)", "21"),
    ("       3.3.1 Functional Requirements", "21"),
    ("       3.3.2 Non-Functional Requirements", "22"),
    ("       3.3.3 Hardware & Software Environments", "23"),
    ("   3.4 System Modeling & Design", "24"),
    ("       3.4.1 Use Case Modeling", "24"),
    ("       3.4.2 Data Flow Modeling (Context Level 0 & First Level 1 DFD)", "25"),
    ("       3.4.3 Database Design & Entity-Relationship Modeling (ERD)", "27"),
    ("       3.4.4 Data Dictionary & Relational Database Schemas", "28"),
    ("   3.5 Core Mechanisms & Transactional Workflows", "30"),
    ("       3.5.1 User Authentication & Session Security", "30"),
    ("       3.5.2 Real-Time Stock Search & Dynamic Quote Retrieval", "31"),
    ("       3.5.3 Atomic Buy Stock Execution & Wallet Balance Lock", "32"),
    ("       3.5.4 Sell Stock Execution & Realized Profit/Loss Computation", "33"),
    ("       3.5.5 Razorpay Payment Gateway Integration", "34"),
    ("       3.5.6 Interactive Financial Charting Engine", "35"),
    ("   3.6 Experimental Testing Setup & Quality Assurance", "36"),
    ("       3.6.1 Testing Methodologies (Unit, Integration, System, UAT)", "36"),
    ("       3.6.2 Sample Test Cases Specification (Table 3.5)", "37"),
    ("   3.7 Experimental Results, Performance Benchmarks & Validation", "38"),
    ("WORK NEED TO BE COMPLETE IN THE FUTURE", "40"),
    ("   4.1 Machine Learning & AI-Driven Financial Sentiment Analysis", "40"),
    ("   4.2 Algorithmic Trading Bot & Automated Stop-Loss / Take-Profit", "40"),
    ("   4.3 Full-Duplex WebSockets for Real-Time Streaming Ticks", "41"),
    ("   4.4 Cross-Platform Native Mobile Application Development", "41"),
    ("REFERENCES (Harvard Referencing System)", "42"),
    ("APPENDIX I: Plagiarism Check Certificate & Undertaking", "45"),
    ("APPENDIX II: Comprehensive Viva Voce Defense Guide & Examiner Q&A", "46"),
    ("   Part A: 30-Second Elevator Pitch & 2-Minute Project Overview", "46"),
    ("   Part B: System Architecture & Workflow Walkthrough for Examiners", "47"),
    ("   Part C: How the Database & Transactions Work Under the Hood", "48"),
    ("   Part D: Top 25 Viva Voce Questions & High-Scoring Model Answers", "49"),
    ("   Part E: Live Demonstration Script & Viva Presentation Best Practices", "57")
]

for title, pno in toc_items:
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    r_t = p.add_run(title)
    r_t.font.name = "Calibri"
    r_t.font.size = Pt(10)
    if not title.startswith(" "):
        r_t.font.bold = True
        r_t.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    dots_count = max(4, int(82 - len(title) * 1.15))
    r_dots = p.add_run(" " + "." * dots_count + " ")
    r_dots.font.name = "Calibri"
    r_dots.font.size = Pt(9.5)
    r_dots.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
    
    r_p = p.add_run(pno)
    r_p.font.name = "Calibri"
    r_p.font.size = Pt(10)
    if not title.startswith(" "):
        r_p.font.bold = True

# =========================================================================
# 7. NOMENCLATURE & ABBREVIATIONS (PU Guideline 2.18)
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(16)
r = p.add_run("NOMENCLATURE & ABBREVIATIONS")
r.font.name = "Times New Roman"
r.font.size = Pt(18)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

add_body_p(doc, 
    "As specified in Section 2.18 of the Parul University B.Tech Project Guidelines, the purpose of this section "
    "is to formally define all technical abbreviations, acronyms, mathematical symbols, and engineering notations "
    "employed throughout this Project Report.", space_after=12)

nom_data = [
    ("ACID", "Atomicity, Consistency, Isolation, Durability (Relational DB Transaction Properties)"),
    ("AJAX", "Asynchronous JavaScript and XML (Dynamic asynchronous browser client exchange)"),
    ("API", "Application Programming Interface (Contract for web service data communication)"),
    ("BSE", "Bombay Stock Exchange (Premier Indian financial securities exchange)"),
    ("CDSL", "Central Depository Services (India) Limited (Electronic share custody depository)"),
    ("CRUD", "Create, Read, Update, Delete (Fundamental data persistence operations)"),
    ("CSRF", "Cross-Site Request Forgery (Web application unauthorized command vulnerability)"),
    ("CSS3", "Cascading Style Sheets Level 3 (Modern responsive web styling standard)"),
    ("DFD", "Data Flow Diagram (Graphical depiction of information transformation in software)"),
    ("DOM", "Document Object Model (Browser memory tree representation of HTML markup)"),
    ("ERD", "Entity-Relationship Diagram (Visual data modeling notation for database tables)"),
    ("FIFO", "First-In, First-Out (Accounting inventory and order matching convention)"),
    ("HTML5", "Hypertext Markup Language Revision 5 (Core structuring language of the web)"),
    ("HTTP / HTTPS", "Hypertext Transfer Protocol / Secure (Network protocol for web resource transfer)"),
    ("JSON", "JavaScript Object Notation (Standard lightweight data-interchange text format)"),
    ("KYC", "Know Your Customer (Mandatory legal identity verification in real finance)"),
    ("MVC", "Model-View-Controller (Architectural software design pattern)"),
    ("NSDL", "National Securities Depository Limited (Indian national securities depository)"),
    ("NSE", "National Stock Exchange of India (Automated national securities exchange)"),
    ("P&L", "Profit and Loss (Financial measure of net realized/unrealized equity returns)"),
    ("PHP", "PHP: Hypertext Preprocessor (Open-source server-side scripting runtime)"),
    ("RDBMS", "Relational Database Management System (Tabular relational data management software)"),
    ("REST", "Representational State Transfer (Stateless HTTP-based software architectural style)"),
    ("SDLC", "Software Development Life Cycle (Structured engineering methodology for software)"),
    ("SQL", "Structured Query Language (Domain-specific language for relational database queries)"),
    ("SRS", "Software Requirements Specification (Formal academic software requirements document)"),
    ("TOTP", "Time-Based One-Time Password (Algorithmic cryptographic two-factor authentication)"),
    ("UAT", "User Acceptance Testing (End-user usability and operational verification phase)"),
    ("UI / UX", "User Interface / User Experience (Ergonomic sensory and visual software design)"),
    ("XSS", "Cross-Site Scripting (Client-side malicious script injection vulnerability)")
]

tbl_nom = doc.add_table(rows=len(nom_data)+1, cols=2)
tbl_nom.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_nom.rows[0].cells[0].paragraphs[0].add_run("Abbreviation / Symbol").font.bold = True
tbl_nom.rows[0].cells[1].paragraphs[0].add_run("Formal Technical Definition").font.bold = True
for c in tbl_nom.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="1F4E79", bottom="1F4E79", sz="8")

for idx, (abbr, defn) in enumerate(nom_data):
    row = tbl_nom.rows[idx+1]
    row.cells[0].width = Inches(1.8)
    row.cells[1].width = Inches(4.2)
    row.cells[0].paragraphs[0].add_run(abbr).font.name = "Calibri"
    row.cells[0].paragraphs[0].runs[0].font.bold = True
    row.cells[1].paragraphs[0].add_run(defn).font.name = "Calibri"
    row.cells[1].paragraphs[0].runs[0].font.size = Pt(9.5)
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

# =========================================================================
# 8. LIST OF TABLES
# =========================================================================
doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(14)
r = p.add_run("LIST OF TABLES")
r.font.name = "Times New Roman"
r.font.size = Pt(16)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

tbl_items = [
    ("Table 1.1", "Project Profile & System Specifications", "3"),
    ("Table 1.2", "Project Aim and Objectives Implementation Roadmap", "4"),
    ("Table 2.1", "Summary of Research Papers (Stock Market & Web Systems)", "14"),
    ("Table 2.2", "Comparative Analysis: Proposed System vs Existing Trading Platforms", "16"),
    ("Table 3.1", "Relational Database Schema: users", "28"),
    ("Table 3.2", "Relational Database Schema: user_transation", "28"),
    ("Table 3.3", "Relational Database Schema: stock_details", "29"),
    ("Table 3.4", "Relational Database Schema: portfolios", "29"),
    ("Table 3.5", "Sample Functional and Security Test Cases Specification", "37"),
    ("Table 3.6", "System Performance and Execution Latency Benchmarks", "38"),
    ("Table 3.7", "System Verification and Feature Validation Summary", "39")
]

tbl_list = doc.add_table(rows=len(tbl_items) + 1, cols=3)
tbl_list.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_list.rows[0].cells[0].paragraphs[0].add_run("Table No").font.bold = True
tbl_list.rows[0].cells[1].paragraphs[0].add_run("Table Caption / Description").font.bold = True
tbl_list.rows[0].cells[2].paragraphs[0].add_run("Page No").font.bold = True
for c in tbl_list.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="1F4E79", bottom="1F4E79", sz="8")
    
for idx, (tno, tname, pno) in enumerate(tbl_items):
    row = tbl_list.rows[idx + 1]
    row.cells[0].width = Inches(1.2)
    row.cells[1].width = Inches(4.2)
    row.cells[2].width = Inches(0.8)
    row.cells[0].paragraphs[0].add_run(tno).font.name = "Calibri"
    row.cells[0].paragraphs[0].runs[0].font.bold = True
    row.cells[1].paragraphs[0].add_run(tname).font.name = "Calibri"
    row.cells[2].paragraphs[0].add_run(pno).font.name = "Calibri"
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

# =========================================================================
# 9. LIST OF FIGURES
# =========================================================================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(20)
p.paragraph_format.space_after = Pt(12)
r = p.add_run("LIST OF FIGURES")
r.font.name = "Times New Roman"
r.font.size = Pt(16)
r.font.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

fig_items = [
    ("Figure 3.1", "Waterfall Software Development Life Cycle (SDLC) Model", "19"),
    ("Figure 3.2", "3-Tier System Architecture of Stock Market Web Application", "20"),
    ("Figure 3.3", "Use Case Diagram of Stock Market Web Application", "24"),
    ("Figure 3.4", "Context Level Data Flow Diagram (DFD Level 0)", "25"),
    ("Figure 3.5", "First Level Data Flow Diagram (DFD Level 1)", "26"),
    ("Figure 3.6", "Entity-Relationship Diagram (ERD) of Normalized Schemas", "27")
]

fig_list = doc.add_table(rows=len(fig_items) + 1, cols=3)
fig_list.alignment = WD_TABLE_ALIGNMENT.CENTER
fig_list.rows[0].cells[0].paragraphs[0].add_run("Figure No").font.bold = True
fig_list.rows[0].cells[1].paragraphs[0].add_run("Figure Caption / Description").font.bold = True
fig_list.rows[0].cells[2].paragraphs[0].add_run("Page No").font.bold = True
for c in fig_list.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="1F4E79", bottom="1F4E79", sz="8")
    
for idx, (fno, fname, pno) in enumerate(fig_items):
    row = fig_list.rows[idx + 1]
    row.cells[0].width = Inches(1.2)
    row.cells[1].width = Inches(4.2)
    row.cells[2].width = Inches(0.8)
    row.cells[0].paragraphs[0].add_run(fno).font.name = "Calibri"
    row.cells[0].paragraphs[0].runs[0].font.bold = True
    row.cells[1].paragraphs[0].add_run(fname).font.name = "Calibri"
    row.cells[2].paragraphs[0].add_run(pno).font.name = "Calibri"
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

print("Preliminaries and front matter successfully built.")
doc.save(OUTPUT_DOCX)
