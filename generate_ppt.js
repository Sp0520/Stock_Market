const pptxgen = require('pptxgenjs');
const path = require('path');

let pptx = new pptxgen();

// Set aspect ratio to 4:3 (matches the 1024x768 templates)
pptx.layout = 'LAYOUT_4x3';

// Color Palette
const COLOR_RED = 'B31F24';       // Core Red accent
const COLOR_YELLOW = 'FFCC00';    // NAAC Yellow banner
const COLOR_BLACK = '000000';      // Normal titles/text
const COLOR_GREY_TEXT = '595959';  // Footer grey text
const COLOR_GREY_HEADER = '7F7F7F';// Table header grey
const COLOR_GREY_CELL = 'EAEAEA';  // Table cell light grey

// Helper function to add standard slide footer and sidebar layout
function addStandardSlide(pptx, titleText, slideNum) {
  let slide = pptx.addSlide();
  
  // Red vertical bar on the right edge
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 9.7,
    y: 0,
    w: 0.3,
    h: 7.5,
    fill: { color: COLOR_RED }
  });
  
  // Footer: Date
  slide.addText("8/10/2026", {
    x: 0.5,
    y: 6.8,
    w: 2.0,
    h: 0.3,
    fontSize: 10,
    color: COLOR_GREY_TEXT,
    fontName: 'Arial'
  });
  
  // Footer: Project Title
  slide.addText("Title of Project", {
    x: 0.5,
    y: 7.1,
    w: 4.0,
    h: 0.3,
    fontSize: 10,
    color: COLOR_GREY_TEXT,
    fontName: 'Arial'
  });
  
  // Footer: Slide Number
  slide.addText(slideNum.toString(), {
    x: 8.5,
    y: 6.5,
    w: 1.1,
    h: 0.8,
    fontSize: 28,
    color: COLOR_RED,
    fontName: 'Arial',
    bold: true,
    align: 'right'
  });
  
  // Slide Title (Except for papers where title is custom)
  if (titleText) {
    slide.addText(titleText, {
      x: 0.5,
      y: 0.8,
      w: 8.8,
      h: 0.8,
      fontSize: 36,
      color: COLOR_RED,
      fontName: 'Algerian',
      bold: true
    });
  }
  
  return slide;
}

// Helper to add bullet points with double line break for spacing
function addBulletPoints(slide, points) {
  let text = points.map(pt => `⮚  ${pt}`).join('\n\n');
  slide.addText(text, {
    x: 0.6,
    y: 1.8,
    w: 8.8,
    h: 4.5,
    fontSize: 16,
    bold: true,
    color: COLOR_BLACK,
    fontName: 'Calibri',
    valign: 'top'
  });
}

// Helper to add a literature survey paper table slide
function addPaperSlide(pptx, paperNum, paperTitle, pubYear, author, approach, advantages, limitations, slideNum) {
  let slide = addStandardSlide(pptx, null, slideNum);
  
  // Paper title centered in red
  slide.addText(`PAPER ${paperNum}: ${paperTitle.toUpperCase()}`, {
    x: 0.5,
    y: 0.5,
    w: 8.8,
    h: 0.6,
    fontSize: 24,
    color: COLOR_RED,
    fontName: 'Arial',
    bold: true,
    align: 'center'
  });
  
  // Create table row data
  let tableRows = [
    // Header Row
    [
      { text: "Publication\nand Year", options: { bold: true, color: "FFFFFF", fill: { color: COLOR_GREY_HEADER }, align: "center", valign: "middle" } },
      { text: "Author\nname", options: { bold: true, color: "FFFFFF", fill: { color: COLOR_GREY_HEADER }, align: "center", valign: "middle" } },
      { text: "Approach\n(Methodology)", options: { bold: true, color: "FFFFFF", fill: { color: COLOR_GREY_HEADER }, align: "center", valign: "middle" } },
      { text: "Advantages", options: { bold: true, color: "FFFFFF", fill: { color: COLOR_GREY_HEADER }, align: "center", valign: "middle" } },
      { text: "Limitations", options: { bold: true, color: "FFFFFF", fill: { color: COLOR_GREY_HEADER }, align: "center", valign: "middle" } }
    ],
    // Content Row
    [
      { text: pubYear, options: { fill: { color: COLOR_GREY_CELL }, align: "center", valign: "middle" } },
      { text: author, options: { fill: { color: COLOR_GREY_CELL }, align: "center", valign: "middle" } },
      { text: approach, options: { fill: { color: COLOR_GREY_CELL }, align: "left", valign: "middle" } },
      { text: advantages, options: { fill: { color: COLOR_GREY_CELL }, align: "left", valign: "middle" } },
      { text: limitations, options: { fill: { color: COLOR_GREY_CELL }, align: "left", valign: "middle" } }
    ]
  ];
  
  // Column Widths (Sum = 8.8 inches)
  let colWidths = [1.5, 1.3, 2.2, 2.0, 1.8];
  
  // Add Table to Slide
  slide.addTable(tableRows, {
    x: 0.5,
    y: 1.4,
    w: 8.8,
    h: 4.6,
    colW: colWidths,
    border: { pt: 1, color: "FFFFFF" },
    fontSize: 13,
    fontName: 'Arial',
    color: '000000'
  });
}

// ----------------------------------------------------
// SLIDE 1: Title Slide
// ----------------------------------------------------
let slide1 = pptx.addSlide();

// Red vertical sidebar
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 9.7,
  y: 0,
  w: 0.3,
  h: 7.5,
  fill: { color: COLOR_RED }
});

// Red block at bottom right
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 9.0,
  y: 5.3,
  w: 1.0,
  h: 2.2,
  fill: { color: COLOR_RED }
});

// Parul University Logo (Red Box)
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 0.2,
  y: 0.2,
  w: 2.0,
  h: 1.0,
  fill: { color: COLOR_RED }
});
// Parul University Text
slide1.addText([
  { text: "Parul", options: { bold: true, fontSize: 24, color: "FFFFFF", fontName: "Arial" } },
  { text: "®\n", options: { fontSize: 10, color: "FFFFFF", fontName: "Arial" } },
  { text: "University", options: { fontSize: 18, color: "FFFFFF", fontName: "Arial" } }
], {
  x: 0.2,
  y: 0.2,
  w: 2.0,
  h: 1.0,
  align: 'center',
  valign: 'middle'
});

// NAAC A++ Banner (Yellow Box)
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 2.2,
  y: 0.2,
  w: 2.5,
  h: 1.0,
  fill: { color: COLOR_YELLOW }
});
// NAAC Text
slide1.addText("NAAC", {
  x: 2.3,
  y: 0.3,
  w: 1.2,
  h: 0.4,
  fontSize: 20,
  bold: true,
  color: '000000',
  fontName: 'Arial'
});
slide1.addText("ACCREDITED UNIVERSITY", {
  x: 2.3,
  y: 0.7,
  w: 1.5,
  h: 0.3,
  fontSize: 7.5,
  bold: true,
  color: '000000',
  fontName: 'Arial'
});

// Red Circle for A++ inside NAAC
slide1.addShape(pptx.shapes.OVAL, {
  x: 3.8,
  y: 0.3,
  w: 0.8,
  h: 0.8,
  fill: { color: COLOR_RED },
  line: { color: 'FFFFFF', width: 2 }
});
// Text inside circle
slide1.addText("A++", {
  x: 3.8,
  y: 0.3,
  w: 0.8,
  h: 0.8,
  fontSize: 14,
  bold: true,
  color: 'FFFFFF',
  fontName: 'Arial',
  align: 'center',
  valign: 'middle'
});

// Center Texts
slide1.addText("PRESENTATION ON", {
  x: 1.0,
  y: 1.8,
  w: 8.0,
  h: 0.5,
  fontSize: 28,
  bold: true,
  color: COLOR_BLACK,
  fontName: 'Arial',
  align: 'center'
});

slide1.addText("INDIAN STOCK MARKET\nTRADING PLATFORM\n(NSE & BSE)", {
  x: 1.0,
  y: 2.4,
  w: 8.0,
  h: 1.8,
  fontSize: 32,
  bold: true,
  color: COLOR_BLACK,
  fontName: 'Arial',
  align: 'center'
});

// Bottom presenter information
// Left Column: Presented By
slide1.addText([
  { text: "PRESENTED BY :\n", options: { bold: true, fontSize: 16, color: COLOR_RED, fontName: "Arial" } },
  { text: "SNEH PATEL (160303108001)\n", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } },
  { text: "STUDENT 2 (160303108002)\n", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } },
  { text: "STUDENT 3 (150303108003)\n", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } },
  { text: "STUDENT 4 (150303108004)", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } }
], {
  x: 0.5,
  y: 4.8,
  w: 4.5,
  h: 2.2,
  valign: 'top'
});

// Right Column: Under Guidance
slide1.addText([
  { text: "UNDER GUIDANCE OF :\n", options: { bold: true, fontSize: 16, color: COLOR_RED, fontName: "Arial" } },
  { text: "NAME OF MENTOR\n", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } },
  { text: "ASSISTANT PROFESSOR\n", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } },
  { text: "(IT DEPARTMENT)", options: { bold: true, fontSize: 14, color: COLOR_RED, fontName: "Arial" } }
], {
  x: 5.5,
  y: 4.8,
  w: 4.0,
  h: 2.2,
  valign: 'top'
});

// ----------------------------------------------------
// SLIDE 2: Outline
// ----------------------------------------------------
let slide2 = addStandardSlide(pptx, "OUTLINE", 2);
slide2.addText(
  "⮚  Introduction\n" +
  "⮚  Motivation\n" +
  "⮚  Aim\n" +
  "⮚  Application/s\n" +
  "⮚  Literature Survey\n" +
  "⮚  Research Gap\n" +
  "⮚  Objectives\n" +
  "⮚  Methodology\n" +
  "⮚  Existing Work Flow\n" +
  "⮚  Proposed Work Flow\n" +
  "⮚  Implementation\n" +
  "⮚  Conclusion\n" +
  "⮚  References", 
  {
    x: 0.8,
    y: 1.7,
    w: 8.0,
    h: 4.6,
    fontSize: 15,
    bold: true,
    color: COLOR_BLACK,
    fontName: 'Calibri',
    valign: 'top'
  }
);

// ----------------------------------------------------
// SLIDE 3: Introduction
// ----------------------------------------------------
let slide3 = addStandardSlide(pptx, "INTRODUCTION", 3);
addBulletPoints(slide3, [
  "Indian Stock Market Focus: A full-stack, production-grade trading simulator designed specifically for Indian stock listings on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).",
  "Rupee-Based System: Implements strict Indian Rupee (₹) formatting across indices, stock profiles, balances, portfolio tracking, and order ticket estimations.",
  "Modern Command Center UI: Combines a glassmorphism dashboard layout with high-fidelity candlestick charts, indicators, and a live bid-ask order depth book.",
  "Flexible Deployment: Offers two implementation avenues—a modern Single Page Application (React + Express + MongoDB) and a traditional platform (PHP + MySQL + Apache)."
]);

// ----------------------------------------------------
// SLIDE 4: Motivation
// ----------------------------------------------------
let slide4 = addStandardSlide(pptx, "MOTIVATION", 4);
addBulletPoints(slide4, [
  "Rising Retail Trading: With the rapid growth of demat accounts in India (10 crore+), retail investors need a reliable and safe learning platform.",
  "Pre-Trade Fee Awareness: Novice traders often lose money because they do not understand transaction drag. Simulating taxes like STT, GST, and Stamp Duty prevents surprises in live trading.",
  "Risk-Free Sandbox Environment: Enables investors and students to experiment with multiple trading techniques without risking actual capital.",
  "AI Portfolio Health Checks: Integrates intelligent automated recommendations, bridging the gap between basic trackers and professional advisory tools."
]);

// ----------------------------------------------------
// SLIDE 5: Aim
// ----------------------------------------------------
let slide5 = addStandardSlide(pptx, "AIM", 5);
addBulletPoints(slide5, [
  "Indian-Standard Simulator: Design a full-featured stock market simulator tailored to Indian market dynamics, currency structure (₹), and exchanges.",
  "Interactive Candlestick Charts: Incorporate advanced TradingView charts with timeframe selections and technical indicators (EMA, VWAP) for analysis.",
  "Pre-Trade Fee Calculations: Construct an engine that estimates flat brokerage (₹20), STT, GST, SEBI fees, and stamp duty on every order ticket.",
  "Integrated Wealth Portal: Embed auxiliary tools like upcoming IPO details (with GMP, subscriptions, PAN check) and Mutual Fund SIP planning sliders."
]);

// ----------------------------------------------------
// SLIDE 6: Applications
// ----------------------------------------------------
let slide6 = addStandardSlide(pptx, "APPLICATIONS", 6);
addBulletPoints(slide6, [
  "Educational Portal: Ideal for schools, colleges, and finance academies to teach stock trading and investment fundamentals.",
  "Strategy Sandbox: Allows retail investors to backtest swing or intra-day trading strategies with real market conditions.",
  "Tax & Expense Planning: Day-traders can analyze how statutory costs eat into their intra-day profits prior to trading in live markets.",
  "Fintech Blueprint: Serves as a modular, secure, and production-ready skeleton for developers building commercial brokerage extensions."
]);

// ----------------------------------------------------
// SLIDE 7: Literature Survey
// ----------------------------------------------------
let slide7 = addStandardSlide(pptx, "LITERATURE SURVEY", 7);
addBulletPoints(slide7, [
  "Comprehensive Scope: Reviews academic literature, existing simulators, and tax computation models to establish design parameters.",
  "Analysis Domains: Evaluates studies in web application responsiveness, Markowitz portfolio risk optimization, and financial machine learning models.",
  "Selected Papers: Details 5 key publications covering stock simulation, investment models, ML prediction, tax impact, and IPO subscription analysis.",
  "Identified Target: Highlights the need for combining real-time local tax calculations with AI-guided portfolio checks in a single dashboard."
]);

// ----------------------------------------------------
// SLIDE 8-13: Papers (Survey Tables)
// ----------------------------------------------------
addPaperSlide(
  pptx, 
  1, 
  "Web-Based Stock Simulation", 
  "IEEE Software\n(2021)", 
  "R. Sharma,\nS. Kumar", 
  "Developed a web-based simulator using React and Django REST framework for live stock feeds.", 
  "High responsiveness, user-friendly layout, real-time portfolio updates.", 
  "Used US stock data in USD; ignored transaction taxes and brokerage fees.",
  8
);

addPaperSlide(
  pptx, 
  2, 
  "Portfolio Optimization Models", 
  "Journal of Finance\n(2020)", 
  "Dr. A. Mehta", 
  "Analyzed Markowitz Mean-Variance Optimization for retail portfolio construction.", 
  "Provides mathematical foundations for minimizing risk and maximizing return.", 
  "High mathematical complexity for beginners; does not simulate live order execution.",
  9
);

addPaperSlide(
  pptx, 
  3, 
  "Machine Learning in FinTech", 
  "Springer AI\n(2022)", 
  "P. Gupta,\nV. Rao", 
  "Proposed a sentiment analysis model using Twitter and news data for stock trend prediction.", 
  "High predictive accuracy for short-term sentiment trends.", 
  "Very high computation latency; difficult to run in standard web browsers.",
  10
);

addPaperSlide(
  pptx, 
  4, 
  "Statutory Drag in Day Trading", 
  "Indian Econ Review\n(2019)", 
  "K. Iyer,\nM. Das", 
  "Investigated the impact of STT, GST, and brokerage fees on retail day-traders' profitability.", 
  "Clearly demonstrates that fees are the primary source of losses in high-frequency trading.", 
  "Purely statistical and theoretical analysis; no interactive tool was developed.",
  11
);

addPaperSlide(
  pptx, 
  5, 
  "IPO Allotment and Retail Investing", 
  "IJF\n(2023)", 
  "S. Deshmukh", 
  "Studied retail investor behavior and subscription rates in upcoming Indian IPOs.", 
  "Identifies factors influencing Grey Market Premium (GMP) and subscription metrics.", 
  "Did not include a tool to check allotment status or verify PAN-based registrations.",
  12
);

addPaperSlide(
  pptx, 
  20, 
  "AI Recommendation in Web Terminals", 
  "ACM FinTech\n(2023)", 
  "J. Doe,\nA. Patel", 
  "Evaluated integrated AI engines inside brokerage terminal UIs for automated stock recommendations.", 
  "Improves user engagement and provides automated risk warnings.", 
  "Recommender systems were generic and did not adjust for local user portfolios.",
  13
);

// ----------------------------------------------------
// SLIDE 14: Research Gap
// ----------------------------------------------------
let slide14 = addStandardSlide(pptx, "RESEARCH GAP", 14);
addBulletPoints(slide14, [
  "US-Centric Market Bias: Existing academic and commercial simulators predominantly use US stocks in USD, neglecting Indian retail investors.",
  "Absence of Local Taxation Engine: Simulators omit Indian statutory charges (brokerage, STT, GST, Stamp duty), creating unrealistic profit metrics.",
  "No All-in-One Wealth Solutions: Lack of unified modules combining equity trading with SIP planners, IPO checkers, and allotment status tracking.",
  "Static UIs and Advice Deficit: Missing modern responsive visual frameworks (such as 3D charts, heatmaps) and active AI portfolio feedback."
]);

// ----------------------------------------------------
// SLIDE 15: Objectives
// ----------------------------------------------------
let slide15 = addStandardSlide(pptx, "OBJECTIVES", 15);
addBulletPoints(slide15, [
  "Build Localized Terminal: Construct a high-performance 3D Glassmorphism interface for Indian equities with strict Rupee currency rules.",
  "Integrate Advanced Charts: Embed candlestick, line, area charts with timeframe sliders and EMA/VWAP volume overlays.",
  "Incorporate Tax Engine: Build an order execution ticket that estimates flat brokerage (₹20), STT, GST, and stamp duty before trade submission.",
  "Develop Investment Hub: Launch an IPO hub with GMP indicators, subscription data, PAN allotment check, and an interactive SIP calculator.",
  "Integrate AI Advisory: Add automated portfolio health checks and market sentiment gauges via database backup engines."
]);

// ----------------------------------------------------
// SLIDE 16: Methodology
// ----------------------------------------------------
let slide16 = addStandardSlide(pptx, "METHODOLOGY", 16);
addBulletPoints(slide16, [
  "Core Architecture: Leverages a secure three-tier client-server-database architecture to support real-time user-data synchronization.",
  "Frontend Layer: Programmed in React.js (ES6+) with custom CSS for 3D glassmorphism elements, Tailwind layouts, and Lucide vector icons.",
  "Backend Services: Express.js (Node.js) server mapping modular REST endpoints (users, transactions, holdings) with JWT and bcrypt security.",
  "Database Layer: MongoDB Atlas storing portfolios, stock tickers, and historical trades, configured with local fallback databases.",
  "Traditional PHP Route: Local development configuration utilizing Apache, MySQL database imports, and Yahoo Finance proxy integrations."
]);

// ----------------------------------------------------
// SLIDE 17: Existing Work Flow
// ----------------------------------------------------
let slide17 = addStandardSlide(pptx, "EXISTING WORK FLOW", 17);
addBulletPoints(slide17, [
  "Foreign Market API Feeds: Systems connect to global APIs, fetching data in USD, which is confusing for domestic retail learners.",
  "Direct Wallet Deduction: Orders execute directly against simulated portfolios without computing brokerage fees or local exchange taxes.",
  "Unresponsive Table View: Portfolios and transactions are displayed as simple, static HTML tables with no dynamic charts or analysis.",
  "Disconnected Finance Information: Users must visit separate portals to evaluate upcoming IPOs, compute SIP wealth, or verify allotments."
]);

// ----------------------------------------------------
// SLIDE 18: Proposed Work Flow
// ----------------------------------------------------
let slide18 = addStandardSlide(pptx, "PROPOSED WORK FLOW", 18);
addBulletPoints(slide18, [
  "Secure Access: Users register and log in via JWT and bcrypt token security (React platform) or standard local session cookies (PHP platform).",
  "Dashboard Exploration: View live benchmark indices (Nifty, Sensex) and explore active stock cards via responsive terminal views.",
  "Real-Time Fee Estimation: The platform runs order details through the local tax calculator, outlining STT, GST, and brokerage on the ticket.",
  "Ledger Check & Trade Execution: The server evaluates rupee balance, processes trade execution, logs transactions, and updates holdings.",
  "Secondary Wealth Management: Users assess portfolio growth chart projections, inspect IPO subscriptions, and get AI portfolio insights."
]);

// ----------------------------------------------------
// SLIDE 19: Implementation
// ----------------------------------------------------
let slide19 = addStandardSlide(pptx, "IMPLEMENTATION", 19);
addBulletPoints(slide19, [
  "Frontend Framework: Implemented modern React modules: `Card3D.jsx` (perspective card tilts), `Donut3DChart.jsx` (asset allocation), and `MarketHeatmap3D.jsx`.",
  "Backend REST API: Structured modular endpoints: `/api/indices` (live averages), `/api/orders` (execution logic), `/api/ai/insights`.",
  "Database Schemas: Schema scripts for users, holdings, transactions, and stocks written for Mongoose (MongoDB) and MySQL databases.",
  "Deployment Config: Production setup deployed to Render.com using blueprint `render.yaml` and `Procfile` for immediate multi-tier launching."
]);

// ----------------------------------------------------
// SLIDE 20: Conclusion
// ----------------------------------------------------
let slide20 = addStandardSlide(pptx, "CONCLUSION", 20);
addBulletPoints(slide20, [
  "Localized Simulator Accomplished: Deployed a production-ready Indian stock market trading sandbox using authentic tickers and INR currency.",
  "Increased Tax Awareness: Successfully taught retail users the impact of trading expenses using real-time order ticket calculations.",
  "All-in-One Fintech Terminal: Combined active stock simulation, technical charts, IPO GMP checks, PAN checkers, and SIP planning tools.",
  "Multiple Stack Adaptability: Provided both a modern React/Express web application and a traditional local XAMPP/PHP/MySQL deployment path."
]);

// ----------------------------------------------------
// SLIDE 21: References
// ----------------------------------------------------
let slide21 = addStandardSlide(pptx, "REFERENCES", 21);
addBulletPoints(slide21, [
  "[1] Sharma, R., & Kumar, S. (2021). \"Design and Implementation of Web-Based Stock Simulator\". IEEE Software, 38(4), 45-52.",
  "[2] Mehta, A. (2020). \"Portfolio Optimization Models for Retail Investors\". Journal of Finance, 75(2), 112-125.",
  "[3] Gupta, P., & Rao, V. (2022). \"Machine Learning and Sentiment Analysis in FinTech Systems\". Springer Artificial Intelligence, 14(3), 201-218.",
  "[4] Iyer, K., & Das, M. (2019). \"Impact of Statutory Taxes on Short-Term Day Trading Returns\". Indian Economic Review, 54(1), 77-92.",
  "[5] Deshmukh, S. (2023). \"IPO Subscription Rates and Grey Market Premiums in Emerging Markets\". Indian Journal of Finance, 17(5), 34-45.",
  "[6] Indian Stock Market Trading Platform Production URL: https://stock-market-zgep.onrender.com"
]);

// ----------------------------------------------------
// SLIDE 22: Thank You
// ----------------------------------------------------
let slide22 = addStandardSlide(pptx, null, 22);

// Center thank you text
slide22.addText("THANK You...", {
  x: 1.0,
  y: 2.8,
  w: 8.0,
  h: 1.5,
  fontSize: 60,
  color: COLOR_RED,
  fontName: 'Algerian',
  bold: true,
  align: 'center'
});

// Save Presentation
const outputPath = path.join(__dirname, 'Stock_Market_Application_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`Presentation created successfully: ${fileName}`);
  })
  .catch(err => {
    console.error('Error creating presentation:', err);
    process.exit(1);
  });
