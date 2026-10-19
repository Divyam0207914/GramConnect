import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext(null);

// Translation object
const translations = {
  en: {
    // Navbar
    home: 'Home',
    howItWorks: 'How It Works',
    features: 'Features',
    login: 'Login',
    getStarted: 'Get Started',
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    logout: 'Logout',
    
    // Landing Page
    heroTitle: 'Empowering Rural India',
    heroSubtitle: 'Report, Track, and Resolve Civic Issues in Your Village',
    heroDescription: 'GramConnect bridges the gap between rural citizens and government officials, ensuring transparency and accountability in governance.',
    fileComplaint: 'File a Complaint',
    learnMore: 'Learn More',
    
    // Features
    featuresTitle: 'Features',
    featuresSubtitle: 'Everything you need for effective civic engagement',
    
    // How It Works
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Simple steps to make your voice heard',
    
    // Dashboard
    myComplaints: 'My Complaints',
    newComplaint: 'New Complaint',
    status: 'Status',
    priority: 'Priority',
    department: 'Department',
    description: 'Description',
    createdOn: 'Created On',
    
    // Complaint Form
    complaintTitle: 'File a Complaint',
    complaintDescription: 'Describe your issue',
    complaintCategory: 'Category',
    complaintLocation: 'Location',
    submitComplaint: 'Submit Complaint',
    cancel: 'Cancel',
    
    // Status
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
    
    // Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    
    // Footer
    footerAbout: 'About GramConnect',
    footerDescription: 'Bridging the gap between rural citizens and government for transparent governance.',
    footerQuickLinks: 'Quick Links',
    footerContact: 'Contact Us',
    footerRights: 'All rights reserved.',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    actions: 'Actions',
    details: 'Details',
    close: 'Close',
    submit: 'Submit',
    register: 'Register',
    awaitingResponse: 'awaiting response',
    noPendingRequests: 'No pending requests',
    noPendingValidationRequests: 'No pending validation requests',
    
    // Landing Page Extended
    forCitizens: 'For Citizens',
    forOfficials: 'For Officials/Admins',
    citizensDesc: 'Voice your concerns and track resolutions in your community',
    officialsDesc: 'Review, validate, and resolve citizen complaints efficiently',
    adminRegister: 'Admin Register',
    adminLogin: 'Admin Login',
    empoweringTitle: 'Empowering Rural India Through',
    transparentGovernance: 'Transparent Governance',
    platformDesc: 'A unified platform for citizens to voice concerns, file complaints, and track resolutions, ensuring accountability and efficiency in local governance.',
    
    // How It Works Extended
    fileComplaintStep: 'File a Complaint',
    fileComplaintDesc: 'Citizens submit complaints about local issues with descriptions, images, and location details.',
    officialReview: 'Official Review',
    officialReviewDesc: 'Government officials review, validate, and prioritize complaints through a dedicated dashboard.',
    trackResolution: 'Track Resolution',
    trackResolutionDesc: 'Monitor complaint status in real-time from submission to resolution with transparent updates.',
    
    // Features Extended
    keyFeatures: 'Key Features',
    keyFeaturesDesc: 'Built on transparency, security, and citizen empowerment',
    communityValidation: 'Community Validation',
    communityValidationDesc: 'Citizens can validate complaints to ensure authenticity and prevent false reporting.',
    dataIntegrity: 'Data Integrity',
    dataIntegrityDesc: 'Advanced hash-based system ensures data cannot be tampered with or altered.',
    easyFiling: 'Easy Filing',
    easyFilingDesc: 'Simple interface to submit complaints with images, location, and detailed descriptions.',
    realTimeTracking: 'Real-time Tracking',
    realTimeTrackingDesc: 'Monitor complaint status from submission to resolution with transparent updates.',
    
    // CTA
    readyToMakeVoice: 'Ready to Make Your Voice Heard?',
    joinThousands: 'Join thousands of citizens working together to improve local governance and build better communities.',
    getStartedNow: 'Get Started Now',
    
    // Auth Pages
    welcomeBack: 'Welcome Back',
    signInDesc: 'Sign in to access your citizen dashboard',
    emailAddress: 'Email Address',
    enterEmail: 'Enter your email',
    password: 'Password',
    enterPassword: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    areYouOfficial: 'Are you an official?',
    loginHere: 'Login here',
    empoweringRural: 'Empowering Rural India',
    
    // Signup
    createAccount: 'Create Account',
    signUpDesc: 'Join thousands of citizens for transparent governance',
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    phoneNumber: 'Phone Number',
    enterPhone: 'Enter your phone number',
    createPassword: 'Create a password',
    locationDetails: 'Location Details',
    state: 'State',
    selectState: 'Select State',
    district: 'District',
    selectDistrict: 'Select District',
    block: 'Block',
    selectBlock: 'Select Block',
    pincode: 'Pincode (Optional)',
    enterPincode: 'Enter pincode',
    creatingAccount: 'Creating account...',
    registerHere: 'Register here',
    signUp: 'Sign Up',
    
    // Admin Auth
    adminLoginTitle: 'Admin Login',
    adminRegisterTitle: 'Admin Register',
    officialAccess: 'Official Access',
    secureLogin: 'Secure login for government officials',
    officialEmail: 'Official Email Address',
    officialEmailPlaceholder: 'your.email@gov.in',
    authenticating: 'Authenticating...',
    citizenUser: 'Citizen user?',
    governmentPortal: 'Government Portal',
    officialRegistration: 'Official Registration',
    createOfficialAccount: 'Create an official account to manage complaints',
    officialEmailLabel: 'Official Email',
    securePassword: 'Create a secure password',
    selectDepartment: 'Select Department',
    waterSupply: 'Water Supply',
    electricity: 'Electricity',
    publicWorks: 'Public Works',
    health: 'Health',
    education: 'Education',
    general: 'General',
    designation: 'Designation',
    selectDesignation: 'Select Designation',
    blockLevel: 'Block',
    districtLevel: 'District',
    stateLevel: 'State',
    jurisdictionLocation: 'Jurisdiction Location',
    stateOfficials: 'State officials see entire state',
    districtOfficials: 'District officials see all blocks in the district',
    blockOfficials: 'Block officials see only their block',
    createOfficialBtn: 'Create Official Account',
    alreadyHaveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    
    // Dashboards
    fileNewComplaint: 'File New Complaint',
    reportIssue: 'Report an issue in your area',
    createNow: 'Create Now',
    departmentGuide: 'Department Guide',
    viewGuide: 'View Guide',
    knowWhichDept: 'Know which department to contact',
    backToDashboard: 'Back to Dashboard',
    validationRequests: 'Validation Requests',
    reviewNow: 'Review Now',
    pendingRequests: 'Pending Request',
    officialsNeedFeedback: 'Officials need your feedback',
    overview: 'Overview',
    totalComplaints: 'Total Complaints',
    active: 'Active',
    showingComplaints: 'Showing complaints for',
    complaintTriage: 'Complaint Triage',
    backToOverview: 'Back to Overview',
    sendValidationRequests: 'Send Validation Requests',
    systemIntegrity: 'System Integrity',
    accessDenied: 'Access Denied',
    ownerCannotSend: 'Owner designation cannot send validation requests.',
    returnToDashboard: 'Return to Dashboard',
    onlyOwnerAccess: 'Only officials with \'Owner\' designation can access System Integrity.',
    showingAllComplaints: 'Showing all complaints across the system',
    showingLevelComplaints: 'level complaints for',
    manageComplaints: 'Manage Complaints',
    reviewAndProcess: 'Review and process citizen complaints',
    viewComplaints: 'View Complaints',
    requestValidation: 'Request Validation',
    getCitizenFeedback: 'Get citizen feedback on complaints',
    sendRequest: 'Send Request',
    checkIntegrity: 'Check Integrity',
    verifySystemSecurity: 'Verify system security and data',
    verifyNow: 'Verify Now',
    aiPredictions: 'AI Predictions',
    smartComplaintAnalysis: 'Smart complaint categorization',
    viewPredictions: 'View Predictions',
    
    // Dashboard Headers
    myDashboard: 'My Dashboard',
    welcomeUser: 'Welcome',
    citizenAccess: 'Citizen Access',
    systemOwnerDashboard: '👑 System Owner Dashboard',
    officialDashboard: "Official's Dashboard",
    name: 'Name',
    hierarchyLevel: 'Hierarchy Level',
    role: 'Role',
    governmentOfficial: 'Government Official',
    systemAccess: 'System Access',
    allAccess: '★ All Access ★',
    fullSystemAccess: '(Full System Access)',
    
    // Quick Insights
    quickInsights: 'Quick Insights',
    completionRate: 'Completion Rate',
    pendingReview: 'Pending Review',
    activeCases: 'Active Cases',
    
    // Department Guide
    departmentGuideTitle: 'Department Guide',
    departmentGuideDesc: 'Select the right category when filing your complaint. Each category is handled by a specific government department.',
    waterSupplyDept: 'Water Supply Department',
    electricityDept: 'Electricity Department',
    publicWorksDept: 'Public Works Department (PWD)',
    healthDept: 'Health Department',
    educationDept: 'Education Department',
    generalAdmin: 'General Administration',
    commonIssues: 'Common Issues:',
    filingTips: 'Filing Tips',
    filingTip1: '• Choose the most relevant category for faster resolution',
    filingTip2: '• Include photos and location details for better understanding',
    filingTip3: '• Provide accurate contact information for updates',
    filingTip4: '• If unsure, select "Other" and describe the issue clearly',
    
    // Water issues
    waterShortage: 'Water shortage or no supply',
    contaminatedWater: 'Contaminated water supply',
    brokenPipes: 'Broken water pipes or leakage',
    waterQuality: 'Water quality issues',
    irregularSupply: 'Irregular water supply timing',
    
    // Electricity issues
    powerOutages: 'Power outages or load shedding',
    damagedPoles: 'Damaged electric poles or wires',
    faultyLights: 'Faulty street lights',
    highBills: 'High electricity bills',
    voltageIssues: 'Voltage fluctuation issues',
    
    // Road issues
    potholes: 'Potholes and damaged roads',
    brokenFootpaths: 'Broken footpaths or sidewalks',
    constructionDelays: 'Road construction delays',
    poorDrainage: 'Poor drainage causing waterlogging',
    missingRoadSigns: 'Missing road signs or markings',
    
    // Healthcare issues
    lackMedical: 'Lack of medical facilities',
    medicineShortage: 'Medicine shortage at clinics',
    unhygienicHospital: 'Unhygienic hospital conditions',
    inadequateAmbulance: 'Inadequate ambulance services',
    nonFunctionalHealth: 'Non-functional health centers',
    
    // Education issues
    teacherShortage: 'Shortage of teachers',
    poorInfrastructure: 'Poor school infrastructure',
    lackMaterials: 'Lack of educational materials',
    nonFunctionalToilets: 'Non-functional toilets in schools',
    noElectricity: 'No electricity in classrooms',
    
    // Other issues
    garbageIssues: 'Garbage collection issues',
    strayAnimals: 'Stray animal problems',
    publicSafety: 'Public safety concerns',
    illegalEncroachments: 'Illegal encroachments',
    otherCivic: 'Any other civic issues',
  },
  hi: {
    // Navbar
    home: 'होम',
    howItWorks: 'यह कैसे काम करता है',
    features: 'विशेषताएं',
    login: 'लॉगिन',
    getStarted: 'शुरू करें',
    welcome: 'स्वागत है',
    dashboard: 'डैशबोर्ड',
    logout: 'लॉगआउट',
    
    // Landing Page
    heroTitle: 'ग्रामीण भारत को सशक्त बनाना',
    heroSubtitle: 'अपने गांव में नागरिक मुद्दों की रिपोर्ट करें, ट्रैक करें और समाधान करें',
    heroDescription: 'ग्रामकनेक्ट ग्रामीण नागरिकों और सरकारी अधिकारियों के बीच की खाई को पाटता है, शासन में पारदर्शिता और जवाबदेही सुनिश्चित करता है।',
    fileComplaint: 'शिकायत दर्ज करें',
    learnMore: 'और जानें',
    
    // Features
    featuresTitle: 'विशेषताएं',
    featuresSubtitle: 'प्रभावी नागरिक भागीदारी के लिए आपको जो कुछ भी चाहिए',
    
    // How It Works
    howItWorksTitle: 'यह कैसे काम करता है',
    howItWorksSubtitle: 'अपनी आवाज़ सुनाने के सरल कदम',
    
    // Dashboard
    myComplaints: 'मेरी शिकायतें',
    newComplaint: 'नई शिकायत',
    status: 'स्थिति',
    priority: 'प्राथमिकता',
    department: 'विभाग',
    description: 'विवरण',
    createdOn: 'बनाया गया',
    
    // Complaint Form
    complaintTitle: 'शिकायत दर्ज करें',
    complaintDescription: 'अपनी समस्या का वर्णन करें',
    complaintCategory: 'श्रेणी',
    complaintLocation: 'स्थान',
    submitComplaint: 'शिकायत जमा करें',
    cancel: 'रद्द करें',
    
    // Status
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'हल हो गया',
    rejected: 'अस्वीकृत',
    
    // Priority
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    urgent: 'तत्काल',
    
    // Footer
    footerAbout: 'ग्रामकनेक्ट के बारे में',
    footerDescription: 'पारदर्शी शासन के लिए ग्रामीण नागरिकों और सरकार के बीच की खाई को पाटना।',
    footerQuickLinks: 'त्वरित लिंक',
    footerContact: 'संपर्क करें',
    footerRights: 'सर्वाधिकार सुरक्षित।',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    save: 'सहेजें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    actions: 'क्रियाएं',
    details: 'विवरण',
    close: 'बंद करें',
    submit: 'जमा करें',
    register: 'पंजीकरण करें',
    awaitingResponse: 'प्रतिक्रिया की प्रतीक्षा',
    noPendingRequests: 'कोई लंबित अनुरोध नहीं',
    noPendingValidationRequests: 'कोई लंबित सत्यापन अनुरोध नहीं',
    
    // Landing Page Extended
    forCitizens: 'नागरिकों के लिए',
    forOfficials: 'अधिकारियों/प्रशासकों के लिए',
    citizensDesc: 'अपनी चिंताओं को व्यक्त करें और अपने समुदाय में समाधान ट्रैक करें',
    officialsDesc: 'नागरिक शिकायतों की समीक्षा, सत्यापन और समाधान कुशलता से करें',
    adminRegister: 'प्रशासक पंजीकरण',
    adminLogin: 'प्रशासक लॉगिन',
    empoweringTitle: 'ग्रामीण भारत को सशक्त बनाना',
    transparentGovernance: 'पारदर्शी शासन के माध्यम से',
    platformDesc: 'नागरिकों के लिए चिंताओं को व्यक्त करने, शिकायत दर्ज करने और समाधान ट्रैक करने के लिए एक एकीकृत मंच, स्थानीय शासन में जवाबदेही और दक्षता सुनिश्चित करना।',
    
    // How It Works Extended
    fileComplaintStep: 'शिकायत दर्ज करें',
    fileComplaintDesc: 'नागरिक विवरण, छवियों और स्थान विवरण के साथ स्थानीय मुद्दों के बारे में शिकायत दर्ज करते हैं।',
    officialReview: 'अधिकारी समीक्षा',
    officialReviewDesc: 'सरकारी अधिकारी एक समर्पित डैशबोर्ड के माध्यम से शिकायतों की समीक्षा, सत्यापन और प्राथमिकता देते हैं।',
    trackResolution: 'समाधान ट्रैक करें',
    trackResolutionDesc: 'पारदर्शी अपडेट के साथ सबमिशन से समाधान तक वास्तविक समय में शिकायत स्थिति की निगरानी करें।',
    
    // Features Extended
    keyFeatures: 'मुख्य विशेषताएं',
    keyFeaturesDesc: 'पारदर्शिता, सुरक्षा और नागरिक सशक्तिकरण पर निर्मित',
    communityValidation: 'सामुदायिक सत्यापन',
    communityValidationDesc: 'नागरिक प्रामाणिकता सुनिश्चित करने और झूठी रिपोर्टिंग को रोकने के लिए शिकायतों को मान्य कर सकते हैं।',
    dataIntegrity: 'डेटा अखंडता',
    dataIntegrityDesc: 'उन्नत हैश-आधारित प्रणाली सुनिश्चित करती है कि डेटा के साथ छेड़छाड़ या परिवर्तन नहीं किया जा सकता।',
    easyFiling: 'आसान फाइलिंग',
    easyFilingDesc: 'छवियों, स्थान और विस्तृत विवरण के साथ शिकायत दर्ज करने के लिए सरल इंटरफ़ेस।',
    realTimeTracking: 'वास्तविक समय ट्रैकिंग',
    realTimeTrackingDesc: 'पारदर्शी अपडेट के साथ सबमिशन से समाधान तक शिकायत स्थिति की निगरानी करें।',
    
    // CTA
    readyToMakeVoice: 'अपनी आवाज़ सुनाने के लिए तैयार हैं?',
    joinThousands: 'स्थानीय शासन में सुधार और बेहतर समुदाय बनाने के लिए एक साथ काम करने वाले हजारों नागरिकों में शामिल हों।',
    getStartedNow: 'अभी शुरू करें',
    
    // Auth Pages
    welcomeBack: 'वापसी पर स्वागत है',
    signInDesc: 'अपने नागरिक डैशबोर्ड तक पहुँचने के लिए साइन इन करें',
    emailAddress: 'ईमेल पता',
    enterEmail: 'अपना ईमेल दर्ज करें',
    password: 'पासवर्ड',
    enterPassword: 'अपना पासवर्ड दर्ज करें',
    signIn: 'साइन इन करें',
    signingIn: 'साइन इन हो रहा है...',
    areYouOfficial: 'क्या आप एक अधिकारी हैं?',
    loginHere: 'यहाँ लॉगिन करें',
    empoweringRural: 'ग्रामीण भारत को सशक्त बनाना',
    
    // Signup
    createAccount: 'खाता बनाएं',
    signUpDesc: 'पारदर्शी शासन के लिए हजारों नागरिकों में शामिल हों',
    fullName: 'पूरा नाम',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    phoneNumber: 'फोन नंबर',
    enterPhone: 'अपना फोन नंबर दर्ज करें',
    createPassword: 'एक पासवर्ड बनाएं',
    locationDetails: 'स्थान विवरण',
    state: 'राज्य',
    selectState: 'राज्य चुनें',
    district: 'जिला',
    selectDistrict: 'जिला चुनें',
    block: 'ब्लॉक',
    selectBlock: 'ब्लॉक चुनें',
    pincode: 'पिनकोड (वैकल्पिक)',
    enterPincode: 'पिनकोड दर्ज करें',
    creatingAccount: 'खाता बनाया जा रहा है...',
    registerHere: 'यहाँ पंजीकरण करें',
    signUp: 'साइन अप करें',
    
    // Admin Auth
    adminLoginTitle: 'प्रशासक लॉगिन',
    adminRegisterTitle: 'प्रशासक पंजीकरण',
    officialAccess: 'अधिकारी पहुंच',
    secureLogin: 'सरकारी अधिकारियों के लिए सुरक्षित लॉगिन',
    officialEmail: 'अधिकारी ईमेल पता',
    officialEmailPlaceholder: 'your.email@gov.in',
    authenticating: 'प्रमाणीकरण हो रहा है...',
    citizenUser: 'नागरिक उपयोगकर्ता?',
    governmentPortal: 'सरकारी पोर्टल',
    officialRegistration: 'अधिकारी पंजीकरण',
    createOfficialAccount: 'शिकायतों को प्रबंधित करने के लिए एक अधिकारी खाता बनाएं',
    officialEmailLabel: 'अधिकारी ईमेल',
    securePassword: 'एक सुरक्षित पासवर्ड बनाएं',
    selectDepartment: 'विभाग चुनें',
    waterSupply: 'जल आपूर्ति',
    electricity: 'बिजली',
    publicWorks: 'लोक निर्माण',
    health: 'स्वास्थ्य',
    education: 'शिक्षा',
    general: 'सामान्य',
    designation: 'पदनाम',
    selectDesignation: 'पदनाम चुनें',
    blockLevel: 'ब्लॉक',
    districtLevel: 'जिला',
    stateLevel: 'राज्य',
    jurisdictionLocation: 'अधिकार क्षेत्र स्थान',
    stateOfficials: 'राज्य अधिकारी पूरे राज्य को देखते हैं',
    districtOfficials: 'जिला अधिकारी जिले के सभी ब्लॉकों को देखते हैं',
    blockOfficials: 'ब्लॉक अधिकारी केवल अपने ब्लॉक को देखते हैं',
    createOfficialBtn: 'अधिकारी खाता बनाएं',
    alreadyHaveAccount: 'पहले से ही खाता है?',
    signInLink: 'साइन इन करें',
    
    // Dashboards
    fileNewComplaint: 'नई शिकायत दर्ज करें',
    reportIssue: 'अपने क्षेत्र में समस्या की रिपोर्ट करें',
    createNow: 'अभी बनाएं',
    departmentGuide: 'विभाग मार्गदर्शिका',
    viewGuide: 'मार्गदर्शिका देखें',
    knowWhichDept: 'जानें किस विभाग से संपर्क करें',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    validationRequests: 'सत्यापन अनुरोध',
    reviewNow: 'अभी समीक्षा करें',
    pendingRequests: 'लंबित अनुरोध',
    officialsNeedFeedback: 'अधिकारियों को आपकी प्रतिक्रिया की आवश्यकता है',
    overview: 'अवलोकन',
    totalComplaints: 'कुल शिकायतें',
    active: 'सक्रिय',
    showingComplaints: 'शिकायतें दिखा रहे हैं',
    complaintTriage: 'शिकायत ट्राइएज',
    backToOverview: 'अवलोकन पर वापस जाएं',
    sendValidationRequests: 'सत्यापन अनुरोध भेजें',
    systemIntegrity: 'प्रणाली अखंडता',
    accessDenied: 'पहुंच अस्वीकृत',
    ownerCannotSend: 'मालिक पदनाम सत्यापन अनुरोध नहीं भेज सकते।',
    returnToDashboard: 'डैशबोर्ड पर वापस जाएं',
    onlyOwnerAccess: 'केवल \'Owner\' पदनाम वाले अधिकारी ही प्रणाली अखंडता तक पहुंच सकते हैं।',
    showingAllComplaints: 'पूरे सिस्टम में सभी शिकायतें दिखा रहे हैं',
    showingLevelComplaints: 'स्तर की शिकायतें',
    manageComplaints: 'शिकायतें प्रबंधित करें',
    reviewAndProcess: 'नागरिक शिकायतों की समीक्षा और प्रक्रिया करें',
    viewComplaints: 'शिकायतें देखें',
    requestValidation: 'सत्यापन अनुरोध करें',
    getCitizenFeedback: 'शिकायतों पर नागरिक प्रतिक्रिया प्राप्त करें',
    sendRequest: 'अनुरोध भेजें',
    checkIntegrity: 'अखंडता जांचें',
    verifySystemSecurity: 'प्रणाली सुरक्षा और डेटा का सत्यापन करें',
    verifyNow: 'अभी सत्यापित करें',
    aiPredictions: 'AI पूर्वानुमान',
    smartComplaintAnalysis: 'स्मार्ट शिकायत वर्गीकरण',
    viewPredictions: 'पूर्वानुमान देखें',
    
    // Dashboard Headers
    myDashboard: 'मेरा डैशबोर्ड',
    welcomeUser: 'स्वागत',
    citizenAccess: 'नागरिक पहुंच',
    systemOwnerDashboard: '👑 सिस्टम मालिक डैशबोर्ड',
    officialDashboard: 'अधिकारी डैशबोर्ड',
    name: 'नाम',
    hierarchyLevel: 'पदानुक्रम स्तर',
    role: 'भूमिका',
    governmentOfficial: 'सरकारी अधिकारी',
    systemAccess: 'सिस्टम पहुंच',
    allAccess: '★ पूर्ण पहुंच ★',
    fullSystemAccess: '(पूर्ण सिस्टम पहुंच)',
    
    // Quick Insights
    quickInsights: 'त्वरित अंतर्दृष्टि',
    completionRate: 'पूर्णता दर',
    pendingReview: 'समीक्षा लंबित',
    activeCases: 'सक्रिय मामले',
    
    // Department Guide
    departmentGuideTitle: 'विभाग मार्गदर्शिका',
    departmentGuideDesc: 'शिकायत दर्ज करते समय सही श्रेणी चुनें। प्रत्येक श्रेणी को एक विशिष्ट सरकारी विभाग द्वारा संचालित किया जाता है।',
    waterSupplyDept: 'जल आपूर्ति विभाग',
    electricityDept: 'विद्युत विभाग',
    publicWorksDept: 'लोक निर्माण विभाग (PWD)',
    healthDept: 'स्वास्थ्य विभाग',
    educationDept: 'शिक्षा विभाग',
    generalAdmin: 'सामान्य प्रशासन',
    commonIssues: 'सामान्य मुद्दे:',
    filingTips: 'फाइलिंग युक्तियाँ',
    filingTip1: '• तेज़ समाधान के लिए सबसे प्रासंगिक श्रेणी चुनें',
    filingTip2: '• बेहतर समझ के लिए फोटो और स्थान विवरण शामिल करें',
    filingTip3: '• अपडेट के लिए सटीक संपर्क जानकारी प्रदान करें',
    filingTip4: '• यदि अनिश्चित हैं, तो "अन्य" चुनें और मुद्दे का स्पष्ट वर्णन करें',
    
    // Water issues
    waterShortage: 'पानी की कमी या कोई आपूर्ति नहीं',
    contaminatedWater: 'दूषित जल आपूर्ति',
    brokenPipes: 'टूटे पानी के पाइप या रिसाव',
    waterQuality: 'जल गुणवत्ता मुद्दे',
    irregularSupply: 'अनियमित जल आपूर्ति समय',
    
    // Electricity issues
    powerOutages: 'बिजली की कटौती या लोड शेडिंग',
    damagedPoles: 'क्षतिग्रस्त बिजली के खंभे या तार',
    faultyLights: 'खराब स्ट्रीट लाइट्स',
    highBills: 'उच्च बिजली बिल',
    voltageIssues: 'वोल्टेज उतार-चढ़ाव मुद्दे',
    
    // Road issues
    potholes: 'गड्ढे और क्षतिग्रस्त सड़कें',
    brokenFootpaths: 'टूटे फुटपाथ या फुटवे',
    constructionDelays: 'सड़क निर्माण में देरी',
    poorDrainage: 'खराब नाली निकासी जलमग्नता का कारण बनती है',
    missingRoadSigns: 'गायब सड़क संकेत या चिह्न',
    
    // Healthcare issues
    lackMedical: 'चिकित्सा सुविधाओं की कमी',
    medicineShortage: 'क्लिनिकों में दवाओं की कमी',
    unhygienicHospital: 'अस्वच्छ अस्पताल परिस्थितियाँ',
    inadequateAmbulance: 'अपर्याप्त एम्बुलेंस सेवाएं',
    nonFunctionalHealth: 'गैर-कार्यात्मक स्वास्थ्य केंद्र',
    
    // Education issues
    teacherShortage: 'शिक्षकों की कमी',
    poorInfrastructure: 'खराब स्कूल बुनियादी ढांचा',
    lackMaterials: 'शैक्षिक सामग्री की कमी',
    nonFunctionalToilets: 'स्कूलों में गैर-कार्यात्मक शौचालय',
    noElectricity: 'कक्षाओं में बिजली नहीं',
    
    // Other issues
    garbageIssues: 'कचरा संग्रह समस्याएं',
    strayAnimals: 'आवारा जानवर समस्याएं',
    publicSafety: 'सार्वजनिक सुरक्षा चिंताएं',
    illegalEncroachments: 'अवैध अतिक्रमण',
    otherCivic: 'कोई भी अन्य नागरिक मुद्दे',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
