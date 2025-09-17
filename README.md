# Start-x : E-Business Strategy & Payment Simulation Platform

## Overview

Start-x is a comprehensive business strategy simulation platform designed to help entrepreneurs and business analysts test different e-commerce strategies before implementing them in real-world scenarios. The platform combines customer behavior modeling, transaction simulation, and payment gateway integration to provide realistic business insights.

## Features

### Core Functionality
- **User Authentication System** with real-time password validation and forgot password functionality
- **Multi-Store Management** allowing users to create and manage virtual stores
- **Product Catalog Management** with pricing, cost analysis, and margin calculations
- **Strategy Library** for creating and testing various business strategies
- **Customer Simulation Engine** with persona-based behavior modeling
- **Transaction Simulation System** with realistic payment processing
- **Payment Gateway Configuration** supporting multiple payment methods
- **Advanced Analytics Dashboard** with comprehensive business intelligence

### Customer Simulation Engine
The platform generates virtual customers with four distinct personas:
- **Price-Sensitive Customers**: Highly responsive to discounts and price changes
- **Loyalty-Driven Customers**: Focus on brand relationships and loyalty programs
- **Mobile-First Customers**: Prefer mobile shopping experiences and digital payments
- **Impulse Buyers**: Make spontaneous purchases influenced by promotions

### Business Strategy Types
- **Percentage Discount Campaigns**: Configurable discount rates with customer segment targeting
- **CRM Loyalty Points Programs**: Points-based reward systems with redemption mechanics
- **Mobile Push Notifications**: Targeted mobile marketing campaigns
- **Dynamic Pricing Strategies**: Real-time price adjustments based on demand

### Payment Gateway Integration
- **Credit/Debit Card Processing**: Traditional card payments with configurable success rates
- **UPI Payments**: Unified Payments Interface for instant transfers
- **Digital Wallets**: E-wallet integration with various providers
- **Cryptocurrency Support**: Bitcoin and altcoin payment processing

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **JWT Authentication** for secure user sessions
- **bcryptjs** for password hashing and security
- **CORS** enabled for cross-origin requests
- **dotenv** for environment variable management

### Frontend
- **React.js** with functional components and hooks
- **React Router** for client-side navigation
- **Axios** for HTTP client requests
- **CSS3** with modern styling and responsive design
- **Real-time form validation** with visual feedback

### Development Tools
- **nodemon** for backend development server
- **Vite** for frontend build tooling and hot reload
- **ESLint** for code quality and consistency

## Project Structure

```
Start-x/
├── backend/
│   ├── controllers/
│   │   ├── authController.js          # User authentication logic
│   │   ├── storeController.js         # Store management operations
│   │   ├── productController.js       # Product CRUD operations
│   │   ├── strategyController.js      # Business strategy management
│   │   ├── customerController.js      # Customer simulation engine
│   │   └── transactionController.js   # Transaction processing simulation
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT token validation
│   ├── models/
│   │   ├── User.js                    # User schema and validation
│   │   ├── Store.js                   # Store data model
│   │   ├── Product.js                 # Product catalog schema
│   │   ├── Strategy.js                # Business strategy definitions
│   │   ├── Customer.js                # Customer persona modeling
│   │   └── Transaction.js             # Transaction records schema
│   ├── routes/
│   │   ├── authRoutes.js              # Authentication endpoints
│   │   ├── storeRoutes.js             # Store management API
│   │   ├── productRoutes.js           # Product management API
│   │   ├── strategyRoutes.js          # Strategy configuration API
│   │   ├── customerRoutes.js          # Customer simulation API
│   │   └── transactionRoutes.js       # Transaction processing API
│   ├── db.js                          # Database connection configuration
│   ├── server.js                      # Express server setup and middleware
│   ├── package.json                   # Backend dependencies
│   └── .env                           # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html                 # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── StrategyForm.jsx       # Strategy creation form component
│   │   ├── pages/
│   │   │   ├── Login.jsx              # User login interface
│   │   │   ├── Register.jsx           # User registration with validation
│   │   │   ├── Dashboard.jsx          # Main application dashboard
│   │   │   ├── Login.css              # Login page styling
│   │   │   ├── Register.css           # Registration page styling
│   │   │   └── Dashboard.css          # Dashboard styling and layout
│   │   ├── services/
│   │   │   └── api.js                 # Axios configuration and interceptors
│   │   ├── App.jsx                    # Main application component
│   │   ├── App.css                    # Global application styles
│   │   └── main.jsx                   # React application entry point
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite build configuration
└── README.md                          # Project documentation
```

## Installation and Setup

### Prerequisites
- Node.js (version 14.0 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager
- Git for version control

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Start-x-main
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install backend dependencies**
   ```bash
   npm install
   ```

4. **Create environment variables file**
   ```bash
   touch .env
   ```

5. **Configure environment variables**
   Add the following to your `.env` file:
   ```
   MONGO_URL=mongodb+srv://swetasingh84478_db_user:o1HlCopFO06cyvpS@cluster0.tyh5qmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=Ecom_project_start-X_by_sweta_swarnima_swati_shreya
   PORT=8000
   ```

6. **Start the backend server**
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:8000`

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend application will run on `http://localhost:5173`

### Database Setup

1. **Install MongoDB locally** or create a MongoDB Atlas account
2. **Create a new database** named `Start-x`
3. **Update the MONGO_URL** in your `.env` file with your connection string
4. **The application will automatically create collections** when you start using features

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
- **Request Body**: `{ name, email, password }`
- **Response**: `{ success, message, token, data: { user } }`

#### POST /api/auth/login
Authenticate user login
- **Request Body**: `{ email, password }`
- **Response**: `{ success, message, token, data: { user } }`

#### POST /api/auth/forgot-password
Initiate password reset process
- **Request Body**: `{ email }`
- **Response**: `{ success, message }`

### Store Management Endpoints

#### POST /api/stores
Create a new store
- **Request Body**: `{ name, description }`
- **Response**: `{ success, message, data: { store } }`

#### GET /api/stores/my-store
Retrieve user's store information
- **Response**: `{ success, data: { store } }`

#### DELETE /api/stores
Delete user's store and all associated data
- **Response**: `{ success, message }`

### Product Management Endpoints

#### POST /api/products
Add a new product to store
- **Request Body**: `{ name, price, cost, category }`
- **Response**: `{ success, message, data: { product } }`

#### GET /api/products
Retrieve all products for user's store
- **Response**: `{ success, data: [products] }`

#### DELETE /api/products/:id
Delete a specific product
- **Response**: `{ success, message }`

### Strategy Management Endpoints

#### POST /api/strategies
Create a new business strategy
- **Request Body**: `{ name, type, details, isActive }`
- **Response**: `{ success, message, data: { strategy } }`

#### GET /api/strategies
Retrieve all strategies for user's store
- **Response**: `{ success, data: [strategies] }`

#### PUT /api/strategies/:id
Update an existing strategy
- **Request Body**: `{ name, type, details, isActive }`
- **Response**: `{ success, message, data: { strategy } }`

#### DELETE /api/strategies/:id
Delete a specific strategy
- **Response**: `{ success, message }`

### Customer Simulation Endpoints

#### POST /api/customers/generate
Generate virtual customers with personas
- **Request Body**: `{ count }`
- **Response**: `{ success, message, data: [customers] }`

#### GET /api/customers
Retrieve all generated customers
- **Response**: `{ success, count, data: [customers] }`

#### GET /api/customers/analytics
Get customer analytics and insights
- **Response**: `{ success, data: { analytics } }`

### Transaction Simulation Endpoints

#### POST /api/transactions/simulate
Run transaction simulation for specified days
- **Request Body**: `{ days }`
- **Response**: `{ success, message, data: { transactions, results } }`

#### GET /api/transactions/analytics
Retrieve transaction analytics and performance metrics
- **Response**: `{ success, data: { analytics } }`

## Usage Guide

### Getting Started

1. **Register an Account**
   - Navigate to the registration page
   - Fill in your name, email, and password
   - Password validation provides real-time feedback
   - Click "Register" to create your account

2. **Create Your Store**
   - After login, you'll be prompted to create a store
   - Enter your store name and description
   - Click "Create Store" to proceed

3. **Add Products**
   - Navigate to the "Products" tab
   - Click "Add Product" to open the form
   - Enter product details including name, price, cost, and category
   - The system automatically calculates profit margins

4. **Create Business Strategies**
   - Go to the "Strategies" tab
   - Click "Add New Strategy" to create strategies
   - Choose from percentage discounts, loyalty programs, or mobile campaigns
   - Configure strategy parameters and activate them

5. **Generate Customers**
   - Switch to the "Customers" tab
   - Click "Generate Customers" to create virtual customers
   - The system creates customers with different personas and behaviors
   - View customer analytics and persona distribution

6. **Run Simulations**
   - Navigate to the "Simulation" tab
   - Ensure you have products, strategies, and customers
   - Click "Run 7-Day Simulation" to start the simulation
   - View results including revenue, transactions, and success rates

7. **Configure Payment Gateways**
   - Go to the "Payments" tab
   - View available payment methods and their configurations
   - Adjust success rates and processing fees
   - Enable or disable specific payment gateways

### Advanced Features

#### Customer Persona Analysis
The platform analyzes customer behavior based on four key characteristics:
- **Price Consciousness**: How sensitive customers are to pricing changes
- **Loyalty Tendency**: Likelihood to return and make repeat purchases
- **Mobile Preference**: Preference for mobile shopping experiences
- **Impulsiveness**: Tendency to make spontaneous purchasing decisions

#### Strategy Impact Modeling
Each strategy affects different customer personas differently:
- **Price-sensitive customers** respond strongly to percentage discounts
- **Loyalty-driven customers** are motivated by points and rewards programs
- **Mobile-first customers** engage well with push notifications
- **Impulse buyers** are influenced by time-limited offers and urgency

#### Transaction Simulation Logic
The simulation engine considers multiple factors:
- Customer visit frequency based on persona characteristics
- Product affordability relative to customer spending power
- Strategy effectiveness on different customer segments
- Payment method preferences by customer type
- Realistic success and failure rates for transactions

## Development Guidelines

### Code Structure
- Follow MVC (Model-View-Controller) architecture
- Use async/await for asynchronous operations
- Implement proper error handling and validation
- Maintain consistent naming conventions
- Add comments for complex business logic

### Security Considerations
- All API endpoints require JWT authentication
- Passwords are hashed using bcrypt with salt rounds
- Input validation on both frontend and backend
- CORS configuration for secure cross-origin requests
- Environment variables for sensitive configuration

### Testing Recommendations
- Test all API endpoints with different user scenarios
- Validate customer simulation logic with various persona combinations
- Verify strategy impact calculations across different customer segments
- Test payment gateway configurations with different success rates
- Ensure responsive design works across different screen sizes

## Troubleshooting

### Common Issues

#### Backend Server Won't Start
- Verify MongoDB is running and accessible
- Check that all environment variables are properly set
- Ensure no other process is using port 8000
- Verify all npm dependencies are installed

#### Frontend Build Errors
- Clear node_modules and reinstall dependencies
- Check for syntax errors in React components
- Verify API base URL matches backend server address
- Ensure all imports are correctly specified

#### Authentication Issues
- Check JWT_SECRET is set in environment variables
- Verify token is being stored in localStorage
- Ensure API interceptors are properly configured
- Check for expired tokens and implement refresh logic

#### Simulation Not Generating Transactions
- Verify customers have been generated with isActive: true
- Ensure products exist in the store
- Check that at least one strategy is active
- Review customer visit frequency and purchase probability logic

### Performance Optimization
- Implement pagination for large customer lists
- Add database indexing for frequently queried fields
- Use React.memo for expensive component renders
- Implement lazy loading for dashboard tabs
- Consider caching for analytics calculations

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch from main
3. Implement changes with appropriate tests
4. Ensure code follows project conventions
5. Submit a pull request with detailed description

### Code Standards
- Use ESLint configuration for JavaScript code quality
- Follow React best practices for component development
- Implement proper error boundaries and loading states
- Add JSDoc comments for complex functions
- Maintain consistent CSS naming conventions

## Future Enhancements

### Planned Features
- **Multi-currency Support**: Handle different currencies and exchange rates
- **Advanced Analytics**: Machine learning insights and predictive modeling
- **A/B Testing Framework**: Compare different strategy combinations
- **Export Functionality**: Generate reports in PDF and Excel formats
- **Real-time Collaboration**: Multiple users working on the same store
- **Integration APIs**: Connect with real e-commerce platforms
- **Mobile Application**: Native mobile app for iOS and Android

### Technical Improvements
- **Database Optimization**: Implement proper indexing and query optimization
- **Caching Layer**: Redis integration for improved performance
- **Microservices Architecture**: Split into smaller, focused services
- **Docker Containerization**: Containerized deployment setup
- **CI/CD Pipeline**: Automated testing and deployment workflows
- **Monitoring and Logging**: Comprehensive application monitoring

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For questions, issues, or contributions, please contact the development team or create an issue in the project repository.

---

**Start-x** - Empowering businesses with data-driven strategy simulation and testing capabilities.