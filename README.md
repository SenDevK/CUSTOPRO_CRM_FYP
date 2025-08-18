CUSTOPRO: An Intelligent CRM Solution 🚀
CUSTOPRO is a web-based prototype designed as an intelligent Customer Relationship Management (CRM) solution. It is specifically tailored to meet the needs and requirements of Sri Lankan SMEs. The system aims to consolidate fragmented customer data, automate customer segmentation, and provide intuitive, customizable dashboards.




✨ Core Features

Data Ingestion: The solution offers both manual data ingestion through file uploads and potential API integrations for website-collected data. An automated validation model processes and ingests customer and sales-related information to form customer profiles.




Customer Segmentation: The system successfully implements three complementary segmentation strategies. These include value-based (RFM), preference-based (K-means), and demographic models.


Targeted Marketing: CUSTOPRO is designed to enable SMEs to conduct targeted and personalized marketing efforts with ease. It integrates with third-party tools like Twilio and SendGrid for this purpose.



Consent Management: A simple command-based marketing opt-out feature is integrated into the system, allowing customers to easily remove their personal data.



🛠️ Tech Stack
The solution is built with a modern technology stack to ensure a user-centric and responsive application.

Frontend:

- React with TypeScript: Primary build tool for the user interface. [cite: 640]
- Tailwind CSS, shaden/ui, Lucide React: For component building, icons, and styling. [cite: 640]
- Recharts: Used for designing graphs and data visualizations. [cite: 640]
- Zod: For data fetching and schema validation. [cite: 640]
Backend:

- Python: Primary programming language for all backend services. [cite: 642]
- Flask: Python web framework used for creating RESTful APIs. [cite: 642]
Database:

- MongoDB: Utilized for its schema flexibility to manage evolving customer data models. [cite: 643, 644]
Libraries:

- Pandas: To facilitate efficient data manipulation and preprocessing. [cite: 646]
- NumPy: For mathematical computation and efficient array operations. [cite: 646]
- Scikit-learn: A comprehensive machine learning toolkit for customer segmentation. [cite: 646]
Third-Party Integrations:

- Twilio & SendGrid: Used to support automated mass SMS and Email sending activities. [cite: 633]
🔄 Simple Core Workflow
The CUSTOPRO system follows a clear and efficient workflow:

A business user manually uploads customer data via file uploads.

An automated validation model processes this data and either updates existing customer profiles or creates new ones.


Customer profiles are automatically utilized for marketing segmentation, providing the business with key insights.

Based on these segmentation insights, the user can initiate a targeted marketing campaign.

Customers have the ability to opt out of the system at any time, and the platform respects their consent preferences
