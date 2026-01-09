# CCD Jewelry

A premium accessory e-commerce website built with Next.js 16, featuring real-time order notifications via Telegram, a beautiful glassmorphism UI, and a complete admin dashboard.

## Features

### Customer Features

- 🛍️ Browse products by category (Watches, Jewelry, Bags, Sunglasses)
- 🔍 Product search and filtering
- 🛒 Shopping cart with persistent storage
- 💳 Simple checkout process
- 🌓 Light/Dark mode support
- 📱 Fully responsive design
- ✨ Glassmorphism UI effects
- ⭐ Product ratings and reviews display

### Admin Features

- 📊 Dashboard with key metrics (revenue, orders, products)
- 📦 Order management with status updates
- 👥 Customer insights
- 🔐 Secure admin authentication
- 📱 Real-time order notifications via Telegram

### Technical Features

- ⚡ Built with Next.js 16 App Router
- 🗄️ Supabase database with Row Level Security
- 🎨 Tailwind CSS v4 with custom design system
- 🔒 Secure admin authentication with bcrypt
- 📲 Telegram Bot integration for order notifications
- 🎭 Framer Motion for smooth animations
- 📦 TypeScript for type safety

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Authentication**: Custom admin auth with bcrypt
- **Notifications**: Telegram Bot API
- **Type Safety**: TypeScript
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) A Telegram bot for order notifications

### Installation

1. Clone or download the project

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase (Already configured in v0)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Telegram (Optional - for order notifications)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Database Setup

The database will be automatically set up when you run the SQL scripts from the `scripts` folder:

1. **001_create_tables.sql** - Creates all necessary tables with RLS policies
2. **002_seed_data.sql** - Seeds the database with sample products and categories
3. **003_create_admin_user.sql** - Creates the default admin user

These scripts run automatically in v0, or you can run them manually in your Supabase SQL editor.

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

**Default Admin Credentials:**

- Email: `admin@gmail.com`
- Password: `admin123`

Access the admin dashboard at `/admin`

⚠️ **Important**: Change the default admin credentials in production!

## Setting Up Telegram Notifications (Optional)

To receive order notifications via Telegram:

1. Create a Telegram bot:

   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` and follow the instructions
   - Save the bot token

2. Get your chat ID:

   - Message your bot
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your `chat_id` in the response

3. Add to environment variables:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes (cart, checkout, orders)
│   ├── cart/               # Shopping cart page
│   ├── categories/         # Category pages
│   ├── checkout/           # Checkout flow
│   ├── products/           # Product detail pages
│   ├── shop/               # Shop page
│   └── page.tsx            # Homepage
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── admin-*.tsx         # Admin-specific components
│   ├── cart-*.tsx          # Cart-related components
│   ├── product-*.tsx       # Product-related components
│   ├── site-header.tsx     # Main navigation
│   └── site-footer.tsx     # Footer
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
└── scripts/                # Database setup scripts
```

## Database Schema

### Main Tables

- **categories** - Product categories
- **products** - Product catalog
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Individual items in orders
- **admin_users** - Admin authentication

All tables have Row Level Security (RLS) enabled for data protection.

## Customization

### Colors

Edit the color scheme in `app/globals.css`:

- Light mode colors in `:root`
- Dark mode colors in `.dark`

### Products

Add products via:

1. SQL scripts in the `scripts` folder
2. Direct database insertion via Supabase dashboard
3. (Future) Admin product management interface

### Email Notifications

Currently using Telegram for notifications. To add email:

1. Set up a service like Resend or SendGrid
2. Add email sending logic in `app/api/checkout/route.ts`

## Security Considerations

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Admin passwords hashed with bcrypt
- ✅ HTTP-only cookies for admin sessions
- ✅ Environment variables for sensitive data
- ✅ Input validation on all forms
- ⚠️ Change default admin credentials
- ⚠️ Use HTTPS in production
- ⚠️ Set up proper CORS policies

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project on Vercel
3. Add environment variables in Vercel settings
4. Deploy

The Supabase integration is already configured in v0.

## Future Enhancements

- [ ] Product management in admin dashboard
- [ ] Category management interface
- [ ] Email order confirmations
- [ ] Order tracking for customers
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multiple payment gateway integration
- [ ] Inventory management
- [ ] Sales analytics and reports
- [ ] Customer accounts with order history

## License

This project is created with v0 by Vercel.

## Support

For issues and questions:

- Check the documentation
- Review the code comments
- Open an issue on GitHub
