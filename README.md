# EduConnect System

A comprehensive Educational Management Platform with automated payment verification, webinar integration, and real-time chat functionality.

## 🚀 Features

### Core Functionality
- **User Management**: Multi-role authentication system (Students, Instructors, Admins)
- **Course Management**: Complete course lifecycle management with enrollment tracking
- **Payment Processing**: Automated payment verification with receipt upload and OCR processing
- **Webinar Integration**: Zoom API integration for seamless webinar creation and management
- **Real-time Chat**: WebSocket-based messaging system with reactions and notifications
- **Admin Dashboard**: Comprehensive administrative interface for system management

### Advanced Features
- **Receipt OCR**: Google Cloud Vision API integration for automatic receipt processing
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **File Management**: Secure file upload and storage for study materials and receipts
- **Calendar Integration**: Event scheduling and management
- **Multi-language Support**: Internationalization ready
- **Responsive Design**: Mobile-first responsive UI with Tailwind CSS

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 5.2.1 with Django REST Framework 3.16.0
- **Database**: PostgreSQL with psycopg2
- **Authentication**: JWT (djangorestframework_simplejwt)
- **File Processing**: Pillow, pytesseract for OCR
- **Cloud Services**: Google Cloud Vision API
- **API Integration**: Zoom API for webinar management

### Frontend
- **Framework**: Next.js 15.3.3 with React 19.0.0
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Lucide React icons
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API with custom hooks

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Environment**: Python-decouple for configuration management
- **CORS**: django-cors-headers for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+
- Google Cloud Vision API credentials (for OCR)
- Zoom API credentials (for webinar integration)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nkrisnaraj/educonnect-system.git
   cd educonnect-system/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://username:password@localhost:5432/educonnect
   GOOGLE_CLOUD_VISION_CREDENTIALS=path/to/credentials.json
   ZOOM_API_KEY=your-zoom-api-key
   ZOOM_API_SECRET=your-zoom-api-secret
   DEBUG=True
   ```

5. **Database Setup**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Run the server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
educonnect-system/
├── backend/
│   ├── accounts/          # User authentication & management
│   ├── students/          # Student profiles, payments & chat
│   ├── instructor/        # Instructor management & courses
│   ├── edu_admin/         # Admin functionality & webinars
│   ├── media/             # File uploads (receipts, images, etc.)
│   └── backend/           # Django project settings
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/token/refresh/` - Refresh JWT token
- `POST /api/accounts/password/reset/` - Password reset

### Students
- `GET /api/students/profile/` - Get student profile
- `POST /api/students/payments/` - Submit payment
- `GET /api/students/chat/rooms/` - Get chat rooms
- `POST /api/students/chat/messages/` - Send message

### Admin
- `GET /api/admin/users/` - Manage users
- `POST /api/admin/webinars/` - Create webinars
- `GET /api/admin/payments/` - View payments

## 🚀 Deployment

### Backend Deployment (Production)
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static file serving
4. Configure CORS settings
5. Set up SSL certificates

### Frontend Deployment
```bash
npm run build
npm start
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📖 Usage

### For Students
1. Register/Login to the platform
2. Upload payment receipts for course enrollment
3. Access study materials and resources
4. Participate in live webinars
5. Use real-time chat for communication

### For Instructors
1. Manage course content and materials
2. Schedule and conduct webinars
3. Monitor student progress
4. Communicate with students via chat

### For Administrators
1. Verify and approve payments
2. Manage user accounts and permissions
3. Create and schedule webinars
4. Monitor system analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for troubleshooting guides

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added chat system and real-time features
- **v1.2.0** - Enhanced payment processing with OCR
- **v1.3.0** - Zoom integration and webinar management

---

Built with ❤️ by the EduConnect Team
