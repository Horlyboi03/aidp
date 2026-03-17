# AIDP - Agency for International Development Program

A modern, futuristic grant application website built with Next.js, featuring a coral theme, glassmorphism UI, and comprehensive admin dashboard. AIDP helps the poor, retired, disabled, separated, and many more through billions of dollars in grants issued daily.

## Program Overview

AIDP, in conjunction with the Private Grant Foundation, provides financial assistance to individuals in need. Our grants help with:

- **Medical Bills** - Healthcare expenses and treatments
- **Housing** - Buying a home or housing assistance  
- **Business** - Starting or expanding a business
- **Education** - School tuition and educational expenses
- **Retirement** - Financial security for retirement
- **Debt Relief** - Paying off existing debts
- **And Much More** - Various life improvement needs

### Grant Benefits
- **No Repayment Required** - Grants are not loans
- **Not Taxable** - Grant money is tax-free
- **No Credit Check** - Bad credit is not a disqualifier
- **No Interest** - Zero interest charges
- **Worldwide Program** - Available globally
- **Daily Awards** - Grants awarded every day

## Features

### Frontend
- **Modern Design**: Coral gradient theme with glassmorphism effects
- **Responsive**: Mobile-first design with smooth animations
- **Interactive**: Framer Motion animations and hover effects
- **Two-Page Flow**: Program introduction → Application form
- **Real-time Chat**: AI chatbot with admin messaging support
- **Status Tracking**: Live application status updates

### Backend
- **RESTful API**: Built with Next.js API routes
- **File Upload**: Secure document upload system
- **Status Management**: Application approval workflow
- **Real-time Updates**: WebSocket support for live chat

### Admin Dashboard
- **Secure Login**: JWT-based authentication
- **Application Management**: View, approve, reject applications
- **Messaging System**: Real-time chat with applicants
- **Analytics**: Dashboard with application statistics

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **File Upload**: React Dropzone
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aidp-grant-application
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Access
- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Username: `admin`
- Password: `aidp2024`

## Project Structure

```
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── HeroSection.tsx
│   │   ├── ProgramDetails.tsx
│   │   ├── AgentSection.tsx
│   │   ├── ApplicationForm.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ApplicationStatus.tsx
│   │   └── ChatWidget.tsx
│   ├── admin/              # Admin dashboard
│   │   ├── components/
│   │   └── page.tsx
│   ├── api/                # API routes
│   │   └── applications/
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Main page
├── public/                 # Static assets
└── README.md
```

## Key Features Explained

### 1. Landing Page (Program Introduction)
- **Hero Section**: Animated AIDP branding with key statistics
- **Program Details**: Four animated cards explaining objectives, eligibility, benefits, and impact
- **Agent Section**: Profile of Program Director Mary George with testimonial

### 2. Application Form
- **Personal Information**: Comprehensive form with validation
- **Grant Selection**: Dropdown for amounts from $100K to $450K
- **File Upload**: Drag-and-drop for ID documents (National ID, Driver's License, Passport)
- **Status Tracking**: Real-time application status updates

### 3. Chat System
- **AI Chatbot**: Automated responses for common questions
- **Admin Messaging**: Real-time communication with administrators
- **Smart Responses**: Context-aware bot responses about AIDP

### 4. Admin Dashboard
- **Overview**: Statistics dashboard with application metrics
- **Application Management**: View, approve, reject applications
- **Messaging Panel**: Real-time chat with applicants
- **Secure Access**: JWT-based authentication

## Customization

### Colors
The coral theme can be customized in `tailwind.config.js`:
```javascript
colors: {
  coral: {
    // Custom coral color palette
  }
}
```

### Animations
Framer Motion animations are configured in individual components and can be customized by modifying the `initial`, `animate`, and `transition` props.

### Chat Responses
Bot responses can be customized in `app/components/ChatWidget.tsx` by modifying the `botResponses` object.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Security Features

- Input validation on all forms
- File upload restrictions (type and size)
- JWT authentication for admin access
- CSRF protection
- Rate limiting (to be implemented)

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Email notifications
- Advanced file storage (Cloudinary)
- WebSocket implementation for real-time features
- Advanced analytics and reporting
- Multi-language support
- Payment integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, contact the development team or create an issue in the repository.# aidp
# Aidp-G
