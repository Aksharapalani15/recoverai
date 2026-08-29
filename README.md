RecoverAI — AI-Powered Revenue Recovery Platform
RecoverAI is an intelligent payment recovery platform that uses Machine Learning and Generative AI to identify failed transactions with high recovery potential, prioritize them, recommend recovery actions, and generate clear AI-powered explanations.

🚀 What RecoverAI Does
RecoverAI transforms failed payment data into actionable recovery opportunities.

It:

Predicts the probability that a failed payment can be recovered.

Assigns each transaction a recovery priority.

Recommends the most suitable recovery action.

Suggests the appropriate recovery channel.

Provides analytics to understand failure and recovery patterns.

Uses Gemini to generate human-readable explanations and customer-friendly recovery messages.

✨ Key Features
📊 Dashboard
A real-time overview of the recovery system with:

Total failed payments

Recovery rate

Recoverable amount

High-priority transactions

Recovery probability distribution

Priority distribution

Recovery performance by payment method

💳 Transactions
Explore individual failed transactions with:

Transaction amount

Payment method

Merchant category

Failure reason

Customer history

Attempt information

Recovery probability

Priority

Recommended action

Recommended channel

📈 Recovery Analytics
Understand system-wide recovery patterns through visual analytics such as:

Failure reason distribution

Recovery trends

Recovery by payment method

Recovery by merchant category

Priority-level distribution

🤖 AI Insights
RecoverAI combines ML predictions with Generative AI to explain why a transaction is recoverable and produce customer-friendly recovery communication.

⚙️ Settings
Configuration and system information for the RecoverAI application.

🧠 Machine Learning Pipeline
The ML model considers transaction and customer-related features including:

Payment method

Merchant category

Customer tenure

Previous successful payments

Previous failed payments

Failure reason

Attempt number

Hours since failure

Subscription status

Transaction hour

The model produces a recovery probability, which is then converted into a practical recovery priority and recommendation.

🤖 Generative AI Layer
The Generative AI layer takes the ML output and converts it into an understandable explanation.

For example, instead of showing only:

Recovery Probability: 90.8%

RecoverAI can explain:

Why the transaction has strong recovery potential.

Why the recommended action is appropriate.

What message could be shown to the customer.

Gemini API integration is used for live AI explanations when GEMINI_API_KEY is configured.

🏗️ Architecture
                    ┌──────────────────────┐
                    │      React UI        │
                    │  Dashboard / Pages   │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │  API + ML Inference  │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ Machine Learning│        │   Gemini AI     │
        │ Recovery Model  │        │ Explanation     │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 └────────────┬─────────────┘
                              ▼
                    Recovery Recommendations
🛠️ Tech Stack
Frontend
React

Vite

JavaScript

Data visualization libraries

Backend
Python

FastAPI

Uvicorn

Pandas

NumPy

Scikit-learn

Joblib

AI
Google Gemini API

Development
Git

GitHub

VS Code

📁 Project Structure
recoverai/
│
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── .env
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── data/
│   └── ...
│
└── README.md
⚙️ Local Setup
1. Clone the repository
git clone https://github.com/Aksharapalani15/recoverai.git
cd recoverai
2. Backend setup
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Start the backend:

python -m uvicorn app.main:app --reload --port 8000
Backend:

http://127.0.0.1:8000
3. Frontend setup
Open another terminal:

cd frontend
npm install
npm run dev
Frontend:

http://localhost:5173
🔐 Environment Variables
Create a .env file inside the backend directory.

GEMINI_API_KEY=your_api_key_here
Never commit a real API key to GitHub.

Make sure .env is included in .gitignore.

📌 Example Prediction
A transaction can be evaluated like:

Amount: ₹1,114.71
Payment Method: UPI
Failure Reason: Timeout
Recovery Probability: 88.3%
Priority: VERY HIGH
Recommended Action: Retry payment after short delay
Recommended Channel: Automatic retry
The system then generates an explanation and customer-friendly recovery message.

📊 Dataset
RecoverAI was developed using a transaction dataset containing failed payment records and customer/payment behaviour features.

The dataset includes features such as:

Transaction ID

Customer ID

Amount

Payment method

Merchant category

Customer tenure

Previous successes

Previous failures

Failure reason

Attempt number

Hours since failure

Subscription status

Transaction hour

🎯 Why RecoverAI?
Traditional payment systems often identify a failed payment but do not provide enough intelligence about what should happen next.

RecoverAI focuses on the next decision:

Which failed payments should we recover first, how likely are they to succeed, and what should we do?

This enables payment and support teams to prioritize recovery opportunities instead of treating every failed transaction equally.

🔮 Future Enhancements
Real payment gateway integration

Automated retry orchestration

Real-time transaction streaming

Advanced customer segmentation

Model explainability with feature importance

Recovery campaign automation

Continuous model retraining

Production cloud deployment

Recovery ROI monitoring

👩‍💻 Author
Akshara P

Developed as an AI-powered payment recovery solution for the Razorpay AI Buildathon.

🔗 Repository
https://github.com/Aksharapalani15/recoverai

⭐ If you find RecoverAI interesting, consider starring the repository!
