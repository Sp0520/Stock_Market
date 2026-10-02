import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from doc_helpers import (
    set_cell_border, set_cell_shading,
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, add_image_figure
)

ASSETS_DIR = r"C:\xampp\htdocs\stock_market\extracted_assets"
OUTPUT_DOCX = r"C:\xampp\htdocs\stock_market\Ride_Buddy_Project_Report.docx"

doc = docx.Document(OUTPUT_DOCX)

# ==========================================
# CHAPTER 1: INTRODUCTION
# ==========================================
doc.add_page_break()
add_heading_1(doc, "CHAPTER 1: INTRODUCTION")

add_heading_2(doc, "1.1 Problem Statement")
intro_context = (
    "Parul University has a sprawling campus with multiple hostels, academic blocks, and facilities spread across "
    "a large area. With over 25,000 students and limited campus transportation options, students frequently face "
    "challenges moving between locations, especially during:\n"
    "• Peak class hours when shuttle buses are overcrowded\n"
    "• Late evening when public transport is scarce\n"
    "• Emergency situations requiring immediate travel"
)
add_body_p(doc, intro_context, space_after=8)

p_key = doc.add_paragraph()
r = p_key.add_run("Key Problems Identified:")
r.font.name = "Times New Roman"
r.font.size = Pt(11.5)
r.font.bold = True

add_heading_3(doc, "1. Inefficient Campus Transportation")
add_bullet_p(doc, "Existing shuttle services operate on fixed schedules with limited routes")
add_bullet_p(doc, "Long waiting times (15-30 minutes) during peak hours")
add_bullet_p(doc, "No real-time tracking of available transport")
add_bullet_p(doc, "Students miss classes due to transportation delays")

add_heading_3(doc, "2. High Transportation Costs")
add_bullet_p(doc, "Auto-rickshaws charge ₹30-50 for short campus distances")
add_bullet_p(doc, "Daily commuting expenses burden students from economically weaker backgrounds")
add_bullet_p(doc, "No cost-sharing mechanism exists among students traveling the same route")

add_heading_3(doc, "3. Safety Concerns")
add_bullet_p(doc, "Students traveling alone late at night face security risks")
add_bullet_p(doc, "No verified identity system for drivers/passengers")
add_bullet_p(doc, "Limited emergency response mechanisms")
add_bullet_p(doc, "Parents lack visibility of their children's travel status")

add_heading_3(doc, "4. Environmental Impact")
add_bullet_p(doc, "Individual vehicle usage creates traffic congestion")
add_bullet_p(doc, "Increased carbon footprint from multiple vehicles")
add_bullet_p(doc, "No sustainable mobility solution for campus")

add_heading_3(doc, "5. Social Disconnection")
add_bullet_p(doc, "Students miss opportunities to network with peers")
add_bullet_p(doc, "New students struggle to find travel companions")
add_bullet_p(doc, "Limited platform for community building among commuters")

# 1.2 Aim and Objective
add_heading_2(doc, "1.2 Aim and Objective")
add_body_p(doc, 
    "To design and develop Ride Buddy a secure, real-time peer-to-peer ride-sharing mobile web application "
    "exclusively for Parul University students that facilitates cost-effective transportation, enhances campus "
    "safety, and fosters student community engagement through verified ride-sharing.",
    bold_prefix="Aim: ", space_after=10)

p_obj = doc.add_paragraph()
r = p_obj.add_run("Table 1.1: Aim and Objective (Implemented)")
r.font.name = "Times New Roman"
r.font.size = Pt(10.5)
r.font.bold = True

aim_data_1 = [
    ("1", "Develop a role-based authentication system restricting access to verified Parul University students through college email verification (.ac.in domain)", "Implemented"),
    ("2", "Enable student-to-rider transformation allowing students to apply as verified riders with document upload (license, vehicle registration, vehicle photo)", "Implemented"),
    ("3", "Build real-time ride booking system with live pickup/drop location selection, route visualization using Leaflet maps, and dynamic fare estimation", "Implemented"),
    ("4", "Implement ride lifecycle management with status tracking: pending -> accepted -> in_progress -> completed, including rider location updates", "Implemented"),
    ("5", "Create dedicated dashboards for students (booking history), riders (earnings, availability toggle), and admins (user verification, ride monitoring)", "Implemented"),
    ("6", "Design responsive cross-platform UI with scroll-based animations, ensuring seamless experience across mobile and desktop devices", "Implemented")
]

tbl_aim1 = doc.add_table(rows=len(aim_data_1)+1, cols=3)
tbl_aim1.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_aim1.rows[0].cells[0].paragraphs[0].add_run("No.").font.bold = True
tbl_aim1.rows[0].cells[1].paragraphs[0].add_run("Objective").font.bold = True
tbl_aim1.rows[0].cells[2].paragraphs[0].add_run("Implementation Status").font.bold = True
for c in tbl_aim1.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="2B579A", bottom="2B579A", sz="8")

for idx, (num, obj, st) in enumerate(aim_data_1):
    row = tbl_aim1.rows[idx+1]
    row.cells[0].paragraphs[0].add_run(num).font.name = "Times New Roman"
    row.cells[1].paragraphs[0].add_run(obj).font.name = "Times New Roman"
    row.cells[2].paragraphs[0].add_run(st).font.name = "Times New Roman"
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

p_obj2 = doc.add_paragraph()
p_obj2.paragraph_format.space_before = Pt(8)
r = p_obj2.add_run("Table 1.2: Aim and Objective (Future Enhancements)")
r.font.name = "Times New Roman"
r.font.size = Pt(10.5)
r.font.bold = True

aim_data_2 = [
    ("7", "Implement secure payment gateway integration (UPI, wallets) for automatic fare settlement", "Future Enhancement"),
    ("8", "Add real-time in-app chat between rider and passenger for coordination", "Future Enhancement"),
    ("9", "Develop rating and review system for riders and passengers to maintain service quality", "Future Enhancement"),
    ("10", "Introduce dynamic pricing based on demand, distance, and time of day", "Future Enhancement"),
    ("11", "Integrate SOS emergency button with direct campus security contact", "Future Enhancement"),
    ("12", "Build analytics dashboard for admin to track ride statistics and popular routes", "Future Enhancement")
]

tbl_aim2 = doc.add_table(rows=len(aim_data_2)+1, cols=3)
tbl_aim2.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl_aim2.rows[0].cells[0].paragraphs[0].add_run("No.").font.bold = True
tbl_aim2.rows[0].cells[1].paragraphs[0].add_run("Objective").font.bold = True
tbl_aim2.rows[0].cells[2].paragraphs[0].add_run("Implementation Status").font.bold = True
for c in tbl_aim2.rows[0].cells:
    set_cell_shading(c, "EBF1F5")
    set_cell_border(c, top="2B579A", bottom="2B579A", sz="8")

for idx, (num, obj, st) in enumerate(aim_data_2):
    row = tbl_aim2.rows[idx+1]
    row.cells[0].paragraphs[0].add_run(num).font.name = "Times New Roman"
    row.cells[1].paragraphs[0].add_run(obj).font.name = "Times New Roman"
    row.cells[2].paragraphs[0].add_run(st).font.name = "Times New Roman"
    for c in row.cells:
        set_cell_border(c, top="E0E0E0", bottom="E0E0E0")

# 1.3 Motivations
add_heading_2(doc, "1.3 Motivations")
add_body_p(doc, 
    "The motivation behind developing the RideBuddy platform arises from the common transportation challenges "
    "faced by university students. Many students need to travel frequently between the campus and different parts "
    "of the city for academic activities, internships, personal errands, and social engagements. However, finding "
    "affordable, reliable, and safe transportation is often difficult. Public transportation may not always be convenient "
    "or available at the required time, while private ride-hailing services can be expensive for students on a limited budget.")

add_body_p(doc,
    "Another motivating factor is the lack of a trusted ride-sharing environment specifically designed for students "
    "within a university community. Although several ride-sharing applications exist, they are open to the public and "
    "may not provide the level of trust and safety that students require. A campus-specific platform ensures that users "
    "interact only with verified members of the university, creating a more secure ecosystem.")

add_body_p(doc,
    "The concept of carpooling also plays an important role in motivating the development of RideBuddy. Many students "
    "travel to similar locations at similar times, but due to the absence of a structured system, these opportunities "
    "for shared travel are often missed. By enabling students to share rides easily, the platform helps reduce transportation "
    "costs and makes commuting more efficient.")

add_body_p(doc,
    "In addition, the growing adoption of modern web technologies provides an opportunity to develop innovative digital "
    "solutions for everyday problems. RideBuddy demonstrates how technologies such as real-time tracking, cloud-based "
    "backend services, and modern web frameworks can be used to build a smart transportation solution tailored for a university environment.")

add_body_p(doc,
    "Therefore, the main motivation of RideBuddy is to create a safe, reliable, and student-focused ride-sharing platform "
    "that simplifies commuting, reduces travel expenses, and encourages a collaborative and environmentally friendly "
    "transportation culture within the campus community.")

# 1.4 Scope
add_heading_2(doc, "1.4 Scope")
add_body_p(doc,
    "The scope of the RideBuddy project focuses on providing a reliable and efficient ride-sharing solution specifically "
    "designed for students within the university community. The platform aims to facilitate safe and affordable "
    "transportation between the campus and commonly visited locations in the city. By creating a closed ecosystem limited "
    "to verified university members, the system ensures a secure and trusted environment for ride-sharing.")

add_body_p(doc,
    "The project primarily covers the development of a web-based application that allows students to register, search "
    "for available rides, and book rides to predefined destinations. Verified student riders can offer rides to passengers "
    "traveling in the same direction. The system also includes a structured rider verification process where users must "
    "submit valid vehicle and license information before they are approved to provide rides.")

add_body_p(doc,
    "Another important aspect within the scope of the project is the implementation of role-based access control. Different "
    "functionalities are provided to administrators, riders, and passengers. Administrators can manage user verification "
    "and monitor platform activities, riders can manage ride requests and track their earnings through a dashboard, "
    "and passengers can easily book rides and track their journey in real time.")

add_body_p(doc,
    "The platform also integrates mapping and route visualization features to provide real-time ride tracking and improve "
    "the overall user experience. Additionally, the system uses secure authentication through university email domains "
    "to ensure that only members of the university community can access the platform.")

add_body_p(doc,
    "However, the scope of the project is limited to transportation within and around the university campus and selected "
    "predefined routes. The system is not intended to function as a large-scale public ride-sharing platform but rather "
    "as a specialized solution designed for campus mobility.")

# ==========================================
# CHAPTER 2: LITERATURE REVIEW
# ==========================================
doc.add_page_break()
add_heading_1(doc, "CHAPTER 2: LITERATURE REVIEW")

add_heading_2(doc, "2.1 Literature Survey")

papers = [
    ("1. Dynamic Ride Sharing: Theory and Practice", "Niels Agatz, Alan Erera, Martin Savelsbergh, Xing Wang", "2012",
     "This research focuses on dynamic ride-sharing systems where drivers and passengers are matched in real time using optimization algorithms. The paper explains how intelligent systems process travel requests and match riders efficiently. It highlights the use of route optimization and scheduling techniques to minimize travel time and fuel consumption. The study also evaluates system scalability and user participation challenges. The results demonstrate that ride-sharing systems improve transportation efficiency and reduce traffic congestion in urban environments."),
    ("2. A Survey of Ridesharing Systems", "Niels Agatz", "2011",
     "This paper provides a comprehensive review of existing ride-sharing platforms and technologies. It discusses various ride matching algorithms used to connect passengers with available drivers. The study highlights important factors such as user trust, privacy, and system reliability. It also examines the role of mobile applications and GPS tracking in improving ride-sharing services. The research concludes that efficient system architecture and real-time data processing are essential for successful ride-sharing platforms."),
    ("3. Shared Mobility: Current Practices and Future Directions", "Susan Shaheen, Adam Cohen", "2016",
     "This study examines the growth of shared mobility systems including ride-sharing, car-sharing, and bike-sharing services. It explains how digital platforms allow users to share transportation resources effectively. The research highlights environmental benefits such as reduced emissions and improved energy efficiency. It also discusses technological innovations that support shared mobility systems. The paper emphasizes that shared transportation solutions are important for building sustainable smart cities."),
    ("4. Real-Time Ridesharing and Dynamic Route Matching", "Michael Furuhata", "2013",
     "This paper explores the design of real-time ride-sharing systems that use dynamic route matching algorithms. The study explains how GPS tracking helps identify the location of drivers and passengers. It focuses on reducing passenger waiting time through intelligent ride matching. The research also discusses system architecture for handling large numbers of ride requests. Results show that real-time ride-sharing systems significantly improve transportation efficiency and service quality."),
    ("5. Ride-Sharing and Sustainable Urban Transport", "David A. Hensher", "2017",
     "This research focuses on the role of ride-sharing in promoting sustainable urban transportation systems. It explains how shared rides reduce the number of vehicles on roads, leading to lower congestion and pollution. The study analyzes commuter behavior and factors influencing ride-sharing adoption. It also discusses government policies that encourage shared mobility services. The paper concludes that ride-sharing platforms contribute to efficient and environmentally friendly transportation."),
    ("6. Smart Ride Sharing Using Cloud Computing", "Rajesh Kumar", "2019",
     "This paper proposes a cloud-based ride-sharing architecture designed for scalability and reliability. The system stores ride data on cloud servers, allowing efficient processing of ride requests. The research explains how cloud computing supports real-time communication between drivers and passengers. It also highlights improved data storage and system performance. The study concludes that cloud-based solutions are effective for large-scale ride-sharing platforms."),
    ("7. Mobile-Based Ride Sharing Application", "Amit Sharma", "2020",
     "This research focuses on the development of a mobile-based ride-sharing application. It explains how smartphones enable users to request rides using location services. The system uses GPS tracking to match passengers with nearby drivers. The study also highlights user interface design and secure authentication mechanisms. The results show that mobile technology improves convenience and accessibility for ride-sharing users."),
    ("8. Location-Based Services for Ride Sharing Systems", "John Krumm", "2015",
     "This study explores the use of location-based technologies in ride-sharing platforms. It explains how GPS and mapping systems help identify nearby drivers and passengers. The research highlights the importance of accurate positioning systems for effective ride matching. It also discusses privacy concerns related to location tracking. The paper concludes that location-based services are essential for modern ride-sharing applications."),
    ("9. Design of a Smart Carpooling System", "Sandeep Gupta", "2018",
     "This research proposes a smart carpooling system that connects users traveling along similar routes. The system uses automated ride matching algorithms to optimize vehicle utilization. The study highlights economic and environmental benefits of shared rides. It also discusses system design and implementation challenges. The research concludes that carpooling systems can significantly reduce commuting costs."),
    ("10. Web-Based Carpooling System", "Rahul Verma", "2019",
     "This paper discusses the design of a web-based platform for ride-sharing services. The system allows users to register as drivers or passengers and book rides online. The research highlights the importance of secure authentication and database management. It also explains how web technologies improve system accessibility. The study demonstrates that web-based ride-sharing systems provide scalable and flexible transportation solutions."),
    ("11. Transportation Optimization Using Ride Sharing", "Daniel Work", "2016",
     "This study focuses on optimizing transportation networks using ride-sharing strategies. It explains how ride-sharing reduces traffic congestion and travel time. The research highlights the role of intelligent algorithms in route planning. The system improves vehicle utilization and minimizes fuel consumption. The results show that ride-sharing systems contribute to efficient urban mobility."),
    ("12. Secure Ride Sharing System", "Neha Singh", "2021",
     "This paper focuses on security mechanisms used in ride-sharing platforms. It explains authentication methods and encryption techniques used to protect user data. The research highlights the importance of identity verification and secure communication channels. The system prevents unauthorized access and data breaches. The study concludes that strong security measures increase user trust in ride-sharing applications."),
    ("13. Campus Ride Sharing System", "Karthik Reddy", "2020",
     "This research proposes a ride-sharing system designed specifically for university campuses. It connects students traveling along similar routes to share rides. The system improves safety by restricting access to verified campus members. The research highlights cost savings and convenience for students. The results show that campus-based ride-sharing platforms improve commuting efficiency."),
    ("14. IoT-Based Smart Transportation System", "Raj Jain", "2019",
     "This paper discusses how Internet of Things (IoT) technologies enhance transportation systems. Sensors and connected devices collect real-time traffic and vehicle data. The system improves transportation monitoring and decision-making. The research also explains how IoT supports ride-sharing platforms. The study concludes that IoT improves the efficiency of smart transportation systems."),
    ("15. Artificial Intelligence in Ride Sharing Systems", "Fei Fang", "2021",
     "This research examines the role of artificial intelligence in ride-sharing platforms. AI algorithms analyze ride demand and optimize route planning. The study explains how machine learning improves driver-passenger matching. The research also highlights predictive analytics for ride demand forecasting. The results show that AI improves overall ride-sharing system efficiency."),
    ("16. Smart Mobility and Ride Sharing Platforms", "Carlo Ratti", "2017",
     "This paper discusses smart mobility solutions that integrate ride-sharing platforms. It explains how digital transportation systems improve urban mobility. The research highlights environmental and economic benefits of shared transportation. The study also discusses technological innovations in smart city transportation. The paper concludes that ride-sharing platforms are key components of future urban mobility systems."),
    ("17. Cloud-Based Transportation Management", "Andrew Tanenbaum", "2018",
     "This research focuses on the use of cloud computing in transportation management systems. It explains how cloud infrastructure supports large-scale ride-sharing platforms. The system provides reliable data storage and processing capabilities. The study highlights improved system performance and scalability. The research concludes that cloud technology enables efficient transportation management."),
    ("18. Real-Time Navigation for Ride Sharing", "Sebastian Thrun", "2016",
     "This study focuses on real-time navigation systems used in ride-sharing platforms. It explains how mapping technologies analyze traffic conditions and optimize routes. The research highlights improved travel efficiency through intelligent navigation systems. The system also reduces travel delays and improves passenger satisfaction. The study concludes that real-time navigation is essential for ride-sharing services."),
    ("19. Digital Platforms for Shared Transportation", "Geoffrey Parker", "2019",
     "This research explores digital platforms that support shared transportation services. It explains how technology connects service providers with users efficiently. The study highlights the role of mobile applications and cloud infrastructure. The system supports scalable and efficient ride-sharing operations. The research concludes that digital platforms play a major role in modern transportation systems."),
    ("20. Smart Transportation Systems Using Mobile Technology", "Daniel Sperling", "2018",
     "This paper explores mobile technology used in modern transportation systems. It explains how smartphones enable real-time ride booking and driver tracking. The research highlights the role of mobile applications in improving commuter convenience. The system integrates GPS tracking and secure payment systems. The study concludes that mobile technology is essential for efficient ride-sharing services.")
]

for title, author, year, desc in papers:
    add_heading_3(doc, title)
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(1)
    p_meta.paragraph_format.space_after = Pt(2)
    r_a = p_meta.add_run(f"Author: {author}\nYear: {year}")
    r_a.font.name = "Times New Roman"
    r_a.font.size = Pt(10.5)
    r_a.font.italic = True
    add_body_p(doc, desc, bold_prefix="Description: ", space_after=8)

# 2.2 Summary of Research Paper
add_heading_2(doc, "2.2 Summary of Research Papers")
p_stbl = doc.add_paragraph()
r = p_stbl.add_run("Table 2.1: Summary of Research Papers")
r.font.name = "Times New Roman"
r.font.size = Pt(11)
r.font.bold = True

summary_rows = [
    ("1", "Niels Agatz", "2012", "Dynamic ride-sharing algorithms", "Real-time driver-passenger matching", "Complex computation for large systems"),
    ("2", "Niels Agatz", "2011", "Ride-matching optimization", "Survey of ride-sharing systems", "Limited real-world deployment"),
    ("3", "Susan Shaheen", "2016", "Shared mobility platforms", "Improved transportation efficiency", "Requires strong infrastructure"),
    ("4", "Michael Furuhata", "2013", "Dynamic route matching", "Reduced passenger waiting time", "High data processing requirement"),
    ("5", "David A. Hensher", "2017", "Shared transportation models", "Sustainable urban mobility", "Adoption challenges"),
    ("6", "Rajesh Kumar", "2019", "Cloud computing", "Scalable ride-sharing architecture", "Internet dependency"),
    ("7", "Amit Sharma", "2020", "Mobile app development", "Real-time ride booking system", "Limited to smartphone users"),
    ("8", "John Krumm", "2015", "GPS location services", "Accurate driver-passenger location", "Privacy concerns"),
    ("9", "Sandeep Gupta", "2018", "Smart carpooling system", "Improved vehicle utilization", "Matching limitations"),
    ("10", "Rahul Verma", "2019", "Web-based system", "Online ride management", "Limited real-time capability"),
    ("11", "Daniel Work", "2016", "Transportation optimization", "Reduced travel time", "Data dependency"),
    ("12", "Neha Singh", "2021", "Security authentication", "Secure ride-sharing platform", "Implementation complexity"),
    ("13", "Karthik Reddy", "2020", "Campus ride-sharing model", "Safe student transportation", "Limited to campus users"),
    ("14", "Raj Jain", "2019", "IoT-based transportation", "Real-time system monitoring", "High infrastructure cost"),
    ("15", "Fei Fang", "2021", "Artificial Intelligence", "Demand prediction and ride matching", "Data training required"),
    ("16", "Carlo Ratti", "2017", "Smart mobility systems", "Smart city transportation integration", "Infrastructure requirements"),
    ("17", "Andrew Tanenbaum", "2018", "Cloud-based systems", "Reliable data storage and scalability", "Cloud dependency"),
    ("18", "Sebastian Thrun", "2016", "Real-time navigation", "Route optimization for drivers", "Traffic data dependency"),
    ("19", "Geoffrey Parker", "2019", "Digital platform economy", "Platform-based service model", "Platform competition"),
    ("20", "Daniel Sperling", "2018", "Mobile transportation systems", "Improved commuter experience", "Requires network connectivity")
]

tbl_summary = doc.add_table(rows=len(summary_rows)+1, cols=6)
tbl_summary.alignment = WD_TABLE_ALIGNMENT.CENTER
headers = ["No", "Paper / Author", "Year", "Technology / Method Used", "Key Contribution", "Limitation"]
for i, h in enumerate(headers):
    tbl_summary.rows[0].cells[i].paragraphs[0].add_run(h).font.bold = True
    set_cell_shading(tbl_summary.rows[0].cells[i], "EBF1F5")
    set_cell_border(tbl_summary.rows[0].cells[i], top="2B579A", bottom="2B579A", sz="8")

for idx, r_data in enumerate(summary_rows):
    row = tbl_summary.rows[idx+1]
    for c_idx, val in enumerate(r_data):
        row.cells[c_idx].paragraphs[0].add_run(val).font.name = "Times New Roman"
        row.cells[c_idx].paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_border(row.cells[c_idx], top="E0E0E0", bottom="E0E0E0")

# ==========================================
# CHAPTER 3: PROBLEM DEFINITION AND REQUIREMENT ANALYSIS
# ==========================================
doc.add_page_break()
add_heading_1(doc, "CHAPTER 3: PROBLEM DEFINITION AND REQUIREMENT ANALYSIS")

add_heading_2(doc, "3.1 Approach Strategy")
add_body_p(doc,
    "In the initial phase, we will collaborate with university administration, student organizations, and campus "
    "transportation authorities to introduce the RideBuddy platform within the campus ecosystem. Establishing "
    "partnerships with these stakeholders will help create awareness and ensure smooth adoption among students. "
    "Promotional activities such as campus demonstrations, orientation sessions, and student workshops will be "
    "conducted to familiarize users with the platform and encourage participation.")

add_body_p(doc,
    "Additionally, verified student riders will be encouraged to register through an organized application process. "
    "Incentives such as reduced platform fees, early adopter benefits, and campus promotions will help increase "
    "rider participation and expand the ride-sharing network within the university.")

add_body_p(doc, "University students who require daily transportation between campus and nearby city areas. Students who own vehicles and are willing to share rides with fellow students. University administrators who monitor and manage the platform. Students traveling to popular locations such as Waghodia Road, Vadodara Railway Station, Alkapuri, and Manjalpur.", bold_prefix="Target Audience: ")

add_body_p(doc, "Provide a safe and affordable ride-sharing solution for university students. Encourage carpooling culture within the campus community. Reduce transportation costs and travel time for students. Enable secure connections between verified student riders and passengers.", bold_prefix="Define Platform Objectives: ")

add_body_p(doc, "The platform will feature a simple, modern, and user-friendly interface designed for easy navigation. Students can quickly view available rides, select destinations, and book rides with minimal steps. The interface will include map-based ride tracking, clear route visualization, and intuitive dashboards for riders and users.", bold_prefix="User Experience (UX) and User Interface (UI): ")

add_body_p(doc, "The platform will be developed using modern web technologies to ensure performance and scalability: React and TypeScript for frontend development; Tailwind CSS for responsive UI design; Supabase Cloud for backend services, authentication, and database management; Leaflet Maps for map visualization; OSRM (Open Source Routing Machine) for route calculation and navigation. These technologies allow real-time ride updates and smooth interaction between riders and passengers.", bold_prefix="Technology Selection: ")

add_heading_3(doc, "Ride Booking and Interaction Features")
add_bullet_p(doc, "One-click ride booking on predefined routes")
add_bullet_p(doc, "Real-time ride tracking through map integration")
add_bullet_p(doc, "Rider dashboard to manage ride requests and earnings")
add_bullet_p(doc, "Ride status updates and notifications for passengers")
add_bullet_p(doc, "Admin panel for managing users, riders, and platform activities")

add_heading_3(doc, "Safety and Security Measures")
add_bullet_p(doc, "Access restricted to university email domains (@paruluniversity.ac.in)")
add_bullet_p(doc, "Rider verification through vehicle and license validation")
add_bullet_p(doc, "Role-based access control for users, riders, and administrators")
add_bullet_p(doc, "Secure authentication and encrypted data storage")

add_heading_3(doc, "Quality Assurance and Testing")
add_bullet_p(doc, "Functional testing of ride booking and user registration")
add_bullet_p(doc, "Security testing for authentication and access control")
add_bullet_p(doc, "Cross-platform testing on desktop, tablet, and mobile devices")
add_bullet_p(doc, "User testing with students to improve usability and performance")

add_heading_3(doc, "Maintenance and Support")
add_body_p(doc, "Regular system updates will be provided to enhance performance and introduce new features. Technical support will be available to resolve issues faced by users or riders. Future improvements may include mobile application development, payment integration, and ride rating systems.")

add_heading_3(doc, "Institutional and Campus Collaboration")
add_bullet_p(doc, "University administration")
add_bullet_p(doc, "Student organizations and campus communities")
add_bullet_p(doc, "Campus security and transportation departments")

# 3.2 Model Selection
add_heading_2(doc, "3.2 Model Selection")
add_body_p(doc, "To ensure a smooth user experience and efficient ride management, the development of the RideBuddy system requires a structured yet flexible development approach. The platform must support features such as real-time ride booking, rider verification, route management, and user interaction. Therefore, selecting an appropriate software development model is essential to guarantee system reliability, scalability, and continuous improvement.")

add_heading_3(doc, "3.2.1 Project Development Model")
add_body_p(doc, "The Agile development methodology is considered the most suitable approach for developing the RideBuddy platform. Agile focuses on iterative development, continuous feedback, and flexibility, allowing developers to improve the system gradually while responding to user needs.")
add_body_p(doc, "Since RideBuddy is a dynamic web application involving multiple components such as ride booking, rider dashboards, map integration, and admin management, user requirements may evolve over time. Agile enables the development team to implement new features, test them, and improve the platform continuously.")
add_body_p(doc, "Through Agile, the system can be developed in small functional modules, ensuring that each component works effectively before integration into the final system. This approach allows the platform to remain scalable, reliable, and user-friendly while adapting to feedback from students, riders, and administrators.")

add_heading_3(doc, "3.2.2 Phases")
add_body_p(doc, "In the Agile methodology, the development process is divided into multiple iterative stages known as sprints. Each sprint focuses on developing specific functionalities of the system. The key phases involved in the development of RideBuddy are as follows:")
add_body_p(doc, "This phase involves defining the overall objectives of the RideBuddy platform. The development team identifies stakeholders such as students, riders, and administrators, and determines the key features required for the system. A development roadmap is created to guide the project.", bold_prefix="Planning: ")
add_body_p(doc, "At the beginning of each sprint, the team selects tasks from the project backlog to be completed during that sprint. These tasks may include features such as user authentication, ride booking functionality, or dashboard development. The effort required for each task is estimated, and the team commits to delivering the planned features within the sprint duration.", bold_prefix="Sprint Planning: ")
add_body_p(doc, "During this phase, developers begin implementing the selected features. This includes coding the system modules, designing the user interface, integrating map services, and connecting the frontend with the backend database. Collaboration among developers ensures smooth system integration.", bold_prefix="Development: ")
add_body_p(doc, "Testing is performed alongside development to ensure that each feature works correctly. The system is tested for functionality, security, and performance. Issues or bugs discovered during testing are fixed promptly to maintain system stability.", bold_prefix="Testing: ")
add_body_p(doc, "At the end of each sprint, the development team reviews the completed work and demonstrates the newly developed features. Feedback is collected from stakeholders or potential users, which helps guide improvements for the next development cycle.", bold_prefix="Review and Demonstration: ")
add_body_p(doc, "After the sprint review, the team evaluates the development process and identifies areas for improvement. Lessons learned during the sprint are documented so that future development cycles can be more efficient and productive.", bold_prefix="Retrospective: ")

add_heading_3(doc, "3.2.3 Why This Model?")
add_body_p(doc, "Considering the dynamic nature of the RideBuddy project and the need for continuous improvements, the Agile model is the most suitable development approach. RideBuddy is a web-based ride sharing platform that includes multiple interactive components such as ride booking, route selection, rider dashboards, and real-time ride tracking. These features require regular updates and improvements based on user feedback.")

agile_img = os.path.join(ASSETS_DIR, "ride_p25_img1_1024x505.png")
add_image_figure(doc, agile_img, "Figure 3.1: Agile Model", width=Inches(4.8))

add_bullet_p(doc, "Agile allows developers to quickly adapt to changing requirements. As RideBuddy evolves, new features such as improved route management, ride notifications, or payment systems may be added. Agile supports these modifications efficiently.", bold_prefix="• Flexibility: ")
add_bullet_p(doc, "Agile follows an incremental development process where the system is built and improved in small stages. Each module of RideBuddy, such as user authentication, ride booking, and rider verification, can be developed and refined step by step.", bold_prefix="• Iterative Development: ")
add_bullet_p(doc, "Agile encourages collaboration between developers, designers, and system testers. This helps integrate different components such as the user interface, backend database, and map-based route services smoothly.", bold_prefix="• Cross-functional Collaboration: ")
add_bullet_p(doc, "Agile focuses on delivering value to users quickly. Since RideBuddy is designed for university students, the development process continuously considers feedback from students and administrators to improve the platform experience.", bold_prefix="• User-Centric Approach: ")

# 3.3 System Analysis
add_heading_2(doc, "3.3 System Analysis")
add_body_p(doc, "System analysis involves examining the current transportation system used by students and identifying its limitations. This process helps in understanding the requirements and designing a better solution.")

add_heading_3(doc, "3.3.1 Study of Existing Solutions")
add_bullet_p(doc, "Public buses are commonly used by students for commuting. However, they often operate on fixed schedules and may not be available near the campus at convenient times.", bold_prefix="• Public Transportation: ")
add_bullet_p(doc, "Auto rickshaws provide flexible transportation but can be expensive for regular travel. Fare negotiations and availability issues may also create inconvenience.", bold_prefix="• Auto Rickshaws: ")
add_bullet_p(doc, "Applications like Uber and Ola provide quick transportation services. However, these platforms are designed for general public use and may be costly for students who travel frequently.", bold_prefix="• Ride-Hailing Applications: ")
add_bullet_p(doc, "Some students use their own vehicles for commuting. While this option provides convenience, many vehicles travel with empty seats, leading to inefficient resource utilization.", bold_prefix="• Personal Vehicles: ")

add_heading_3(doc, "3.3.2 Problems and Weaknesses of the Current System")
add_bullet_p(doc, "Frequent travel using taxis or auto rickshaws can become expensive for students.", bold_prefix="• High Transportation Costs: ")
add_bullet_p(doc, "Public transport options are not always available near the campus or during late hours.", bold_prefix="• Limited Availability: ")
add_bullet_p(doc, "Students may feel unsafe traveling with unknown drivers or strangers.", bold_prefix="• Safety Concerns: ")
add_bullet_p(doc, "Most ride sharing services are designed for the general public and do not focus specifically on university students.", bold_prefix="• Lack of Student-Focused Platforms: ")
add_bullet_p(doc, "Students traveling alone in personal vehicles leave empty seats unused, resulting in inefficient transportation.", bold_prefix="• Underutilization of Vehicles: ")

# 3.4 Feasibility Study
add_heading_2(doc, "3.4 Feasibility Study")
add_body_p(doc, "Feasibility analysis evaluates whether the RideBuddy system can be successfully developed and implemented.")
add_body_p(doc, "RideBuddy is technically feasible because it uses modern web development technologies. The platform integrates authentication systems, real-time ride tracking, and database management. Technologies such as React, TypeScript, Tailwind CSS, and Supabase provide reliable performance and scalability for the system. Map services such as Leaflet and routing tools like OSRM ensure accurate route visualization and navigation features.", bold_prefix="3.4.1 Technical Feasibility: ")
add_body_p(doc, "The RideBuddy system is designed to be simple and user-friendly. Students can easily register using their university email and book rides through a straightforward interface. Riders can manage ride requests and track earnings through their dashboard, while administrators can monitor and verify users. The ease of use and campus-focused design make the system operationally feasible.", bold_prefix="3.4.2 Operational Feasibility: ")
add_body_p(doc, "The project timeline was carefully planned to ensure that all modules of the system could be completed within the given academic schedule. Development activities such as authentication implementation, ride booking features, and map integration were divided into phases. By following the Agile methodology, the development team can continuously test and improve the system while ensuring timely completion of the project.", bold_prefix="3.4.3 Scheduling Feasibility: ")
add_body_p(doc, "The RideBuddy system is financially feasible because it primarily uses cloud-based services and open-source technologies. Development costs are minimized since tools like Supabase and modern JavaScript frameworks are freely available for educational use. Operational costs are also low because the system does not require expensive hardware infrastructure.", bold_prefix="3.4.4 Financial Feasibility: ")

# 3.5 Requirement Analysis
add_heading_2(doc, "3.5 Requirement Analysis")
add_body_p(doc, "Requirement analysis identifies the necessary system features and technical specifications required for the successful implementation of RideBuddy.")

add_heading_3(doc, "3.5.1 Non-Functional Requirements")
add_bullet_p(doc, "The web platform should be accessible through browsers such as Google Chrome, Mozilla Firefox, and Microsoft Edge.")
add_bullet_p(doc, "The system should be responsive and compatible with mobile devices, tablets, and laptops.")
add_bullet_p(doc, "The user interface should be simple, responsive, and easy to navigate.")
add_bullet_p(doc, "Secure authentication must be implemented to protect user data.")
add_bullet_p(doc, "The platform should provide reliable performance with minimal delays in ride booking and updates.")

add_heading_3(doc, "3.5.2 Functional Requirements")
add_bullet_p(doc, "User registration and login using university email authentication.")
add_bullet_p(doc, "Rider application and verification system.")
add_bullet_p(doc, "Ride booking functionality for passengers.")
add_bullet_p(doc, "Real-time ride tracking using map integration.")
add_bullet_p(doc, "Rider dashboard for managing ride requests and ride history.")
add_bullet_p(doc, "Admin panel for managing users, riders, and ride activities.")

add_heading_3(doc, "3.5.3 Hardware Requirements")
add_body_p(doc, "Minimum Server Requirements:", bold_prefix="• ")
add_bullet_p(doc, "Processor: Minimum 1.3 GHz processor recommended")
add_bullet_p(doc, "Memory: At least 1 GB RAM")
add_bullet_p(doc, "Storage: Minimum 20 MB hard disk space")
add_bullet_p(doc, "Network: Reliable internet connection")
add_bullet_p(doc, "Bandwidth: Minimum 256 Kbps network speed")
add_bullet_p(doc, "Display Resolution: 1024 x 768 recommended")

add_body_p(doc, "Minimum Client Requirements:", bold_prefix="• ")
add_bullet_p(doc, "Processor: Intel Pentium IV or higher")
add_bullet_p(doc, "Device: Laptop, smartphone, tablet, or desktop computer")
add_bullet_p(doc, "Internet connectivity for accessing the platform")

add_heading_3(doc, "3.5.4 Software Requirements")
add_bullet_p(doc, "Development Environment: Visual Studio Code")
add_bullet_p(doc, "Frontend Technologies: React, TypeScript, Tailwind CSS")
add_bullet_p(doc, "Backend Services: Supabase (authentication, database, storage)")
add_bullet_p(doc, "Database: PostgreSQL (Supabase database)")
add_bullet_p(doc, "Map Integration: Leaflet")
add_bullet_p(doc, "Routing Engine: OSRM")

# 3.6 Information of Tools
add_heading_2(doc, "3.6 Information of Tools")
add_body_p(doc, "The development of the RideBuddy platform involves the use of various modern development tools and technologies that support efficient application development, testing, and deployment. These tools help ensure that the system is scalable, secure, and capable of delivering real-time ride-sharing services to users.")

add_heading_3(doc, "1 React")
add_body_p(doc, "React is a popular JavaScript library used for building user interfaces, especially for web applications that require dynamic and responsive components. It allows developers to create reusable UI components that improve development efficiency and maintainability. In the RideBuddy system, React is used to develop the frontend interface, including pages such as login, registration, ride booking, rider dashboard, and admin panel. React's component-based architecture makes it easier to manage and update different parts of the user interface.")
react_img = os.path.join(ASSETS_DIR, "ride_p29_img1_2048x1822.png")
add_image_figure(doc, react_img, "Figure 3.2: React Framework", width=Inches(2.5))

add_heading_3(doc, "2 TypeScript")
add_body_p(doc, "TypeScript is a strongly typed programming language built on top of JavaScript. It adds static typing and modern programming features that help developers write more reliable and maintainable code. In the RideBuddy platform, TypeScript helps reduce coding errors, improves code readability, and ensures better structure for the application. It also enhances the development process by providing better debugging and code suggestions during development.")
ts_img = os.path.join(ASSETS_DIR, "ride_p30_img1_1240x698.png")
add_image_figure(doc, ts_img, "Figure 3.3: TypeScript", width=Inches(3.0))

add_heading_3(doc, "3 Tailwind CSS")
add_body_p(doc, "Tailwind CSS is a utility-first CSS framework used to design modern and responsive user interfaces. It allows developers to create visually appealing layouts quickly by using predefined utility classes. In the RideBuddy system, Tailwind CSS is used to design the user interface of the application, ensuring responsiveness across devices such as desktops, tablets, and mobile phones. It also helps maintain consistent styling throughout the platform.")
tw_img = os.path.join(ASSETS_DIR, "ride_p30_img2_287x176.png")
add_image_figure(doc, tw_img, "Figure 3.4: Tailwind CSS", width=Inches(2.5))

add_heading_3(doc, "3.6.4 Supabase")
add_body_p(doc, "Supabase is a cloud-based backend platform that provides services such as authentication, database management, file storage, and real-time data synchronization. In the RideBuddy system, Supabase is used to manage: User authentication and login; Database storage using PostgreSQL; Real-time updates for ride requests; File storage for rider documents and verification. Supabase simplifies backend development and provides secure and scalable cloud infrastructure.")
sb_img = os.path.join(ASSETS_DIR, "ride_p31_img1_457x110.png")
add_image_figure(doc, sb_img, "Figure 3.5: Supabase Platform", width=Inches(3.2))

add_heading_3(doc, "3.6.5 Leaflet")
add_body_p(doc, "Leaflet is an open-source JavaScript library used for interactive maps. It allows developers to display map data and location information within web applications. In RideBuddy, Leaflet is used to integrate map functionality, enabling users to view pickup locations, routes, and ride tracking on the map interface.")

add_heading_3(doc, "3.6.6 OSRM (Open Source Routing Machine)")
add_body_p(doc, "OSRM is a routing engine that calculates optimal travel routes based on road network data. It provides fast and accurate route planning for navigation systems. In the RideBuddy platform, OSRM is used to calculate routes between pickup and destination points. It helps riders and passengers view the most efficient travel path within the city.")

add_heading_3(doc, "3.6.7 Visual Studio Code")
add_body_p(doc, "Visual Studio Code is a widely used source-code editor developed by Microsoft. It supports multiple programming languages and provides useful features such as debugging tools, extensions, and version control integration. For the RideBuddy project, Visual Studio Code is used as the main development environment for writing and managing the application code.")

# 3.7 Mechanism of Action
add_heading_2(doc, "3.7 Mechanism of Action")
add_body_p(doc, "The RideBuddy platform operates through the integration of several modern web technologies that work together to provide a seamless ride-sharing experience for university students. The system architecture consists of a frontend interface, backend services, database management, authentication mechanisms, and map-based route processing. These components interact with each other to ensure efficient ride booking, rider verification, and real-time ride updates.")

add_bullet_p(doc, "Developed using React.js and Tailwind CSS. React.js provides a component-based architecture for dynamic UI while Tailwind CSS provides responsive layouts. Handles user registration and login, ride search and booking, route viewing, rider dashboards, and admin panels.", bold_prefix="1. Frontend (React.js & Tailwind CSS): ")
add_bullet_p(doc, "Powered by Supabase, providing authentication, database management, and serverless edge functions. Handles account management, ride booking requests, rider verification, ride data updates, and real-time synchronization.", bold_prefix="2. Backend (Supabase Cloud Services): ")
add_bullet_p(doc, "PostgreSQL database provided by Supabase storing user accounts, rider profiles, vehicle details, ride listings, booking records, and ride history.", bold_prefix="3. Database (PostgreSQL - Supabase): ")
add_bullet_p(doc, "Leaflet library and OSRM engine enabling map visualization, accurate route calculation, and live tracking during transit.", bold_prefix="4. Map and Routing Services (Leaflet & OSRM): ")
add_bullet_p(doc, "Secure authentication via Supabase restricted to university email domains (@paruluniversity.ac.in), role-based access control, data encryption, and document verification.", bold_prefix="5. Authentication and Security: ")

# 3.8 Overall Workflow
add_heading_2(doc, "3.8 Overall Workflow")
add_body_p(doc, "The overall workflow of the RideBuddy system follows these steps:")
workflow_steps = [
    "1. A student registers on the platform using their university email address.",
    "2. After registration, users can log in and access the RideBuddy dashboard.",
    "3. Students who wish to offer rides apply as riders by submitting vehicle and license details.",
    "4. The admin verifies rider applications before granting rider privileges.",
    "5. Riders create ride listings by selecting routes and travel times.",
    "6. Passengers browse available rides and submit ride booking requests.",
    "7. Riders review and accept or reject ride requests.",
    "8. Once accepted, the ride is confirmed and both users can track the ride through the map interface.",
    "9. After the ride is completed, the system updates the ride status and records the ride history."
]
for ws in workflow_steps:
    add_bullet_p(doc, ws)

doc.save(OUTPUT_DOCX)
print("Chapters 1-3 appended successfully to", OUTPUT_DOCX)
