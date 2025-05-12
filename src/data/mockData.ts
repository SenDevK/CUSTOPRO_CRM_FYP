
import { User, Customer, DashboardMetric, SegmentData, ChartData, CampaignData } from "../types";

export const currentUser: User = {
  id: "u1",
  name: "Asela Perera",
  email: "asela@lankasmart.lk",
  role: "admin",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg"
};

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: "m1",
    name: "Total Customers",
    value: 1856,
    change: 12.5,
    trend: "up"
  },
  {
    id: "m2",
    name: "Active This Month",
    value: 742,
    change: 8.3,
    trend: "up"
  },
  {
    id: "m3",
    name: "Avg. Purchase Value",
    value: 15400,
    change: 3.7,
    trend: "up"
  },
  {
    id: "m4",
    name: "Churn Rate",
    value: 4.2,
    change: -1.5,
    trend: "down"
  }
];

export const segmentData: SegmentData[] = [
  { name: "High Value", value: 25, color: "#8B5CF6" },
  { name: "Medium Value", value: 42, color: "#A78BFA" },
  { name: "Low Value", value: 23, color: "#C4B5FD" },
  { name: "At Risk", value: 10, color: "#F87171" }
];

export const customerData: Customer[] = [
  {
    id: "c1",
    firstName: "Nihal",
    lastName: "Rodrigo",
    email: "nihal@gmail.com",
    phone: "+94 71 234 5678",
    address: "123 Galle Road",
    city: "Colombo",
    segment: "high_value",
    lastPurchase: "2023-03-28",
    totalSpent: 235000,
    purchaseCount: 12,
    consentGiven: true,
    consentDate: "2023-01-15",
    createdAt: "2023-01-15",
    marketing_status: "active"
  },
  {
    id: "c2",
    firstName: "Kumari",
    lastName: "Silva",
    email: "kumari@gmail.com",
    phone: "+94 77 987 6543",
    address: "456 Kandy Road",
    city: "Kandy",
    segment: "medium_value",
    lastPurchase: "2023-04-02",
    totalSpent: 87500,
    purchaseCount: 7,
    consentGiven: true,
    consentDate: "2023-02-10",
    createdAt: "2023-02-10",
    marketing_status: "active"
  },
  {
    id: "c3",
    firstName: "Dinesh",
    lastName: "Fernando",
    email: "dinesh@outlook.com",
    phone: "+94 76 345 6789",
    address: "789 Beach Road",
    city: "Galle",
    segment: "low_value",
    lastPurchase: "2023-01-15",
    totalSpent: 12500,
    purchaseCount: 2,
    consentGiven: false,
    createdAt: "2023-03-05",
    marketing_status: "opted_out",
    opt_out_date: "2023-03-20",
    opt_out_reason: "Too many messages"
  },
  {
    id: "c4",
    firstName: "Priya",
    lastName: "Mendis",
    email: "priya@yahoo.com",
    phone: "+94 70 567 8901",
    address: "234 Hill Street",
    city: "Nuwara Eliya",
    segment: "high_value",
    lastPurchase: "2023-03-30",
    totalSpent: 345000,
    purchaseCount: 18,
    consentGiven: true,
    consentDate: "2022-11-20",
    createdAt: "2022-11-20",
    marketing_status: "active"
  },
  {
    id: "c5",
    firstName: "Malik",
    lastName: "Hassan",
    email: "malik@gmail.com",
    phone: "+94 75 432 1098",
    address: "567 Temple Road",
    city: "Jaffna",
    segment: "at_risk",
    lastPurchase: "2022-12-10",
    totalSpent: 45000,
    purchaseCount: 3,
    consentGiven: true,
    consentDate: "2022-09-15",
    createdAt: "2022-09-15",
    marketing_status: "deleted",
    opt_out_date: "2023-02-15",
    opt_out_reason: "Data deletion request"
  }
];

export const revenueData: ChartData = {
  label: "Revenue (Last 6 Months)",
  data: [235000, 257000, 310000, 292000, 328000, 356000]
};

export const customerGrowthData: ChartData = {
  label: "New Customers (Last 6 Months)",
  data: [45, 58, 62, 51, 67, 79]
};

export const segmentTrendData: ChartData[] = [
  {
    label: "High Value",
    data: [18, 20, 22, 23, 24, 25]
  },
  {
    label: "Medium Value",
    data: [35, 38, 40, 41, 42, 42]
  },
  {
    label: "Low Value",
    data: [30, 28, 26, 24, 23, 23]
  },
  {
    label: "At Risk",
    data: [17, 14, 12, 12, 11, 10]
  }
];

export const campaignData: CampaignData[] = [
  {
    id: "ca1",
    name: "April Promotion",
    type: "email",
    segment: "High Value",
    status: "active",
    reach: 450,
    response: 112,
    createdAt: "2023-04-01",
    scheduledFor: "2023-04-05"
  },
  {
    id: "ca2",
    name: "Reactivation Campaign",
    type: "sms",
    segment: "At Risk",
    status: "scheduled",
    reach: 180,
    response: 0,
    createdAt: "2023-04-02",
    scheduledFor: "2023-04-08"
  },
  {
    id: "ca3",
    name: "New Product Launch",
    type: "email",
    segment: "All Segments",
    status: "draft",
    reach: 0,
    response: 0,
    createdAt: "2023-04-03"
  },
  {
    id: "ca4",
    name: "March Newsletter",
    type: "email",
    segment: "All Segments",
    status: "completed",
    reach: 1750,
    response: 432,
    createdAt: "2023-03-01",
    scheduledFor: "2023-03-05"
  }
];

export const monthLabels = ["January", "February", "March", "April", "May", "June"];
