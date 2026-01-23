// Mock data for KYC

export const mockKYC = [
  {
    id: "kyc-001",
    userId: "investor-003",
    userName: "Rohit Malhotra",
    email: "rohit.malhotra@example.com",
    mobile: "+91 98765 43302",
    role: "investor",
    submittedDate: "2024-12-01",
    status: "pending",
    documents: {
      aadhaarFront: "/mock-docs/aadhaar-front.jpg",
      aadhaarBack: "/mock-docs/aadhaar-back.jpg",
      panCard: "/mock-docs/pan.jpg",
      cancelledCheque: "/mock-docs/cheque.jpg",
      nomineeDocuments: "/mock-docs/nominee.jpg",
    },
    extractedData: {
      aadhaar: {
        name: "Rohit Malhotra",
        aadhaarNumber: "1234 5678 9012",
        dob: "1990-05-15",
        address: "123 Main Street, Mumbai, Maharashtra 400001",
      },
      pan: {
        name: "Rohit Malhotra",
        panNumber: "ABCDE1234F",
      },
      bank: {
        accountNumber: "12345678901234",
        ifscCode: "HDFC0001234",
        bankName: "HDFC Bank",
      },
      nominee: {
        name: "Priya Malhotra",
        aadhaarNumber: "9876 5432 1098",
        dob: "1992-08-20",
        relation: "Spouse",
      },
    },
  },
  {
    id: "kyc-002",
    userId: "partner-004",
    userName: "Neha Gupta",
    email: "neha.gupta@example.com",
    mobile: "+91 98765 43223",
    role: "partner",
    submittedDate: "2024-11-15",
    status: "verified",
    documents: {
      aadhaarFront: "/mock-docs/aadhaar-front-2.jpg",
      aadhaarBack: "/mock-docs/aadhaar-back-2.jpg",
      panCard: "/mock-docs/pan-2.jpg",
      cancelledCheque: "/mock-docs/cheque-2.jpg",
    },
    extractedData: {
      aadhaar: {
        name: "Neha Gupta",
        aadhaarNumber: "2345 6789 0123",
        dob: "1988-03-10",
        address: "456 Park Avenue, Delhi, Delhi 110001",
      },
      pan: {
        name: "Neha Gupta",
        panNumber: "FGHIJ5678K",
      },
      bank: {
        accountNumber: "23456789012345",
        ifscCode: "ICIC0002345",
        bankName: "ICICI Bank",
      },
    },
    verifiedDate: "2024-11-20",
    verifiedBy: "admin-001",
  },
  {
    id: "kyc-003",
    userId: "investor-004",
    userName: "Suresh Iyer",
    email: "suresh.iyer@example.com",
    mobile: "+91 98765 43303",
    role: "investor",
    submittedDate: "2024-10-20",
    status: "rejected",
    documents: {
      aadhaarFront: "/mock-docs/aadhaar-front-3.jpg",
      aadhaarBack: "/mock-docs/aadhaar-back-3.jpg",
      panCard: "/mock-docs/pan-3.jpg",
      cancelledCheque: "/mock-docs/cheque-3.jpg",
    },
    extractedData: {
      aadhaar: {
        name: "Suresh Iyer",
        aadhaarNumber: "3456 7890 1234",
        dob: "1985-07-25",
        address: "789 Oak Street, Bangalore, Karnataka 560001",
      },
      pan: {
        name: "Suresh Iyer",
        panNumber: "KLMNO9012P",
      },
      bank: {
        accountNumber: "34567890123456",
        ifscCode: "SBIN0003456",
        bankName: "State Bank of India",
      },
    },
    rejectedDate: "2024-10-25",
    rejectedBy: "admin-001",
    rejectionReason: "PAN card image is unclear and cannot be verified",
  },
]
