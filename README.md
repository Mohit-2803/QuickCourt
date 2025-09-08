This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
quick_court
├─ components.json
├─ eslint.config.mjs
├─ next-auth.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250902070202_init
│  │  │  └─ migration.sql
│  │  ├─ 20250902115331_otp
│  │  │  └─ migration.sql
│  │  ├─ 20250902162119_forgot_password_scehma_added
│  │  │  └─ migration.sql
│  │  ├─ 20250903084638_courts_image_field_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905064435_court_status_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905084115_featured_courts_schema_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905100255_court_specific_rating_model_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905174029_booked_for_date_added
│  │  │  └─ migration.sql
│  │  ├─ 20250907120015_stripe_checkout_url_added_to_booking_modal
│  │  │  └─ migration.sql
│  │  ├─ 20250907130613_stripe_checkout_session_id_added_to_booking
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ public
│  ├─ about.jpg
│  ├─ avatar-default.svg
│  ├─ badminton.jpg
│  ├─ basket.jpg
│  ├─ coming_soon.jpg
│  ├─ file.svg
│  ├─ football.jpg
│  ├─ footballl.jpg
│  ├─ forgot.jpeg
│  ├─ globe.svg
│  ├─ home_1.jpg
│  ├─ home_2.jpg
│  ├─ home_3.jpg
│  ├─ login.jpg
│  ├─ login_img.jpg
│  ├─ next.svg
│  ├─ otp-image.jpg
│  ├─ otp.jpg
│  ├─ sport.jpg
│  ├─ squash.jpg
│  ├─ tennis.jpg
│  ├─ tt.jpg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ (auth)
│  │  │  ├─ forgot-password
│  │  │  │  └─ page.tsx
│  │  │  ├─ login
│  │  │  │  └─ page.tsx
│  │  │  ├─ reset-password
│  │  │  │  └─ page.tsx
│  │  │  ├─ signup
│  │  │  │  └─ page.tsx
│  │  │  └─ verify
│  │  │     └─ page.tsx
│  │  ├─ about
│  │  │  └─ page.tsx
│  │  ├─ actions
│  │  │  ├─ manager
│  │  │  │  └─ venue-actions.ts
│  │  │  └─ player
│  │  │     ├─ cancel-booking.ts
│  │  │     ├─ featured-action.ts
│  │  │     ├─ get-court-details.ts
│  │  │     ├─ profile-update.ts
│  │  │     ├─ recomputeVenueAndCourtRatings-action.ts
│  │  │     ├─ review-actions.ts
│  │  │     └─ search-court-action.ts
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ (otp)
│  │  │  │  │  ├─ resend-otp
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ verify-otp
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ forgot-password
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ reset-password
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ signup
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ bookings
│  │  │  │  └─ route.ts
│  │  │  ├─ review
│  │  │  │  └─ add
│  │  │  │     └─ route.ts
│  │  │  ├─ stripe-webhook
│  │  │  │  └─ route.ts
│  │  │  └─ upload
│  │  │     └─ route.ts
│  │  ├─ booking
│  │  │  ├─ cancel
│  │  │  │  └─ page.tsx
│  │  │  └─ success
│  │  │     └─ page.tsx
│  │  ├─ contact
│  │  │  └─ page.tsx
│  │  ├─ context
│  │  │  └─ AuthProvider.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ manager
│  │  │  ├─ bookings
│  │  │  │  └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ my-venues
│  │  │  │  ├─ add
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ venues
│  │  │     └─ [slug]
│  │  │        ├─ courts
│  │  │        │  └─ new
│  │  │        │     └─ page.tsx
│  │  │        └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ player
│  │  │  ├─ bookings
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  └─ settings
│  │  │     └─ page.tsx
│  │  └─ venues
│  │     ├─ featured
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ venue-booking
│  │        ├─ courts
│  │        │  └─ [id]
│  │        │     ├─ booking
│  │        │     │  └─ page.tsx
│  │        │     └─ page.tsx
│  │        └─ page.tsx
│  ├─ components
│  │  ├─ auth
│  │  │  ├─ login-form.tsx
│  │  │  └─ signup-form.tsx
│  │  ├─ coming-soon
│  │  │  └─ coming-soon.tsx
│  │  ├─ layout
│  │  │  ├─ Footer.tsx
│  │  │  └─ Navbar.tsx
│  │  ├─ manager
│  │  │  ├─ bookings
│  │  │  │  └─ bookings-table.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ booking-calendar.tsx
│  │  │  │  ├─ booking-trends.tsx
│  │  │  │  ├─ earnings-chart.tsx
│  │  │  │  ├─ header.tsx
│  │  │  │  ├─ recent-bookings.tsx
│  │  │  │  └─ stats-grid.tsx
│  │  │  └─ venue
│  │  │     ├─ add-court-form.tsx
│  │  │     ├─ add-venue-button.tsx
│  │  │     ├─ court-card.tsx
│  │  │     ├─ courts-by-sport.tsx
│  │  │     ├─ edit-court
│  │  │     │  └─ edit-court-dialog.tsx
│  │  │     ├─ edit-venue
│  │  │     │  └─ make-changes-dialog.tsx
│  │  │     ├─ venue-form.tsx
│  │  │     └─ venues-grid.tsx
│  │  ├─ player
│  │  │  ├─ bookings
│  │  │  │  └─ BookingList.tsx
│  │  │  ├─ profile
│  │  │  │  ├─ edit-profile-modal.tsx
│  │  │  │  └─ UserProfile.tsx
│  │  │  └─ venues
│  │  │     ├─ featured-courts.tsx
│  │  │     ├─ sports-grid.tsx
│  │  │     ├─ venue-booking
│  │  │     │  ├─ booking
│  │  │     │  │  └─ BookingForm.tsx
│  │  │     │  ├─ details
│  │  │     │  │  ├─ amenities-row.tsx
│  │  │     │  │  ├─ court-header.tsx
│  │  │     │  │  ├─ court-main.tsx
│  │  │     │  │  ├─ maps
│  │  │     │  │  │  └─ LeafletMap.tsx
│  │  │     │  │  ├─ more-from-venue.tsx
│  │  │     │  │  ├─ review
│  │  │     │  │  │  └─ LeaveReview.tsx
│  │  │     │  │  ├─ reviews-section.tsx
│  │  │     │  │  └─ venue-description.tsx
│  │  │     │  ├─ filters-sidebar.tsx
│  │  │     │  └─ results-grid.tsx
│  │  │     └─ venues-hero.tsx
│  │  └─ ui
│  │     ├─ alert.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ input-otp.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ radio-group.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ slider.tsx
│  │     ├─ sonner.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     └─ textarea.tsx
│  ├─ generated
│  ├─ hooks
│  │  └─ use-auth.ts
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ cloudinary.ts
│  │  ├─ mailer.ts
│  │  ├─ prisma.ts
│  │  ├─ utils.ts
│  │  └─ validation.ts
│  ├─ middleware.ts
│  └─ utils
│     └─ session-id.ts
└─ tsconfig.json

```
```
quick_court
├─ components.json
├─ eslint.config.mjs
├─ next-auth.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250902070202_init
│  │  │  └─ migration.sql
│  │  ├─ 20250902115331_otp
│  │  │  └─ migration.sql
│  │  ├─ 20250902162119_forgot_password_scehma_added
│  │  │  └─ migration.sql
│  │  ├─ 20250903084638_courts_image_field_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905064435_court_status_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905084115_featured_courts_schema_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905100255_court_specific_rating_model_added
│  │  │  └─ migration.sql
│  │  ├─ 20250905174029_booked_for_date_added
│  │  │  └─ migration.sql
│  │  ├─ 20250907120015_stripe_checkout_url_added_to_booking_modal
│  │  │  └─ migration.sql
│  │  ├─ 20250907130613_stripe_checkout_session_id_added_to_booking
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ public
│  ├─ about.jpg
│  ├─ avatar-default.svg
│  ├─ badminton.jpg
│  ├─ basket.jpg
│  ├─ coming_soon.jpg
│  ├─ file.svg
│  ├─ football.jpg
│  ├─ footballl.jpg
│  ├─ forgot.jpeg
│  ├─ globe.svg
│  ├─ home_1.jpg
│  ├─ home_2.jpg
│  ├─ home_3.jpg
│  ├─ login.jpg
│  ├─ login_img.jpg
│  ├─ next.svg
│  ├─ otp-image.jpg
│  ├─ otp.jpg
│  ├─ sport.jpg
│  ├─ squash.jpg
│  ├─ tennis.jpg
│  ├─ tt.jpg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ (auth)
│  │  │  ├─ forgot-password
│  │  │  │  └─ page.tsx
│  │  │  ├─ login
│  │  │  │  └─ page.tsx
│  │  │  ├─ reset-password
│  │  │  │  └─ page.tsx
│  │  │  ├─ signup
│  │  │  │  └─ page.tsx
│  │  │  └─ verify
│  │  │     └─ page.tsx
│  │  ├─ about
│  │  │  └─ page.tsx
│  │  ├─ actions
│  │  │  ├─ manager
│  │  │  │  └─ venue-actions.ts
│  │  │  └─ player
│  │  │     ├─ cancel-booking.ts
│  │  │     ├─ featured-action.ts
│  │  │     ├─ get-court-details.ts
│  │  │     ├─ profile-update.ts
│  │  │     ├─ recomputeVenueAndCourtRatings-action.ts
│  │  │     ├─ review-actions.ts
│  │  │     └─ search-court-action.ts
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ (otp)
│  │  │  │  │  ├─ resend-otp
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ verify-otp
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ forgot-password
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ reset-password
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ signup
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ bookings
│  │  │  │  └─ route.ts
│  │  │  ├─ review
│  │  │  │  └─ add
│  │  │  │     └─ route.ts
│  │  │  ├─ stripe-webhook
│  │  │  │  └─ route.ts
│  │  │  └─ upload
│  │  │     └─ route.ts
│  │  ├─ booking
│  │  │  ├─ cancel
│  │  │  │  └─ page.tsx
│  │  │  └─ success
│  │  │     └─ page.tsx
│  │  ├─ contact
│  │  │  └─ page.tsx
│  │  ├─ context
│  │  │  └─ AuthProvider.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ manager
│  │  │  ├─ bookings
│  │  │  │  └─ page.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ my-venues
│  │  │  │  ├─ add
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ venues
│  │  │     └─ [slug]
│  │  │        ├─ courts
│  │  │        │  └─ new
│  │  │        │     └─ page.tsx
│  │  │        └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ player
│  │  │  ├─ bookings
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  └─ settings
│  │  │     └─ page.tsx
│  │  └─ venues
│  │     ├─ featured
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ venue-booking
│  │        ├─ courts
│  │        │  └─ [id]
│  │        │     ├─ booking
│  │        │     │  └─ page.tsx
│  │        │     └─ page.tsx
│  │        └─ page.tsx
│  ├─ components
│  │  ├─ auth
│  │  │  ├─ login-form.tsx
│  │  │  └─ signup-form.tsx
│  │  ├─ coming-soon
│  │  │  └─ coming-soon.tsx
│  │  ├─ layout
│  │  │  ├─ Footer.tsx
│  │  │  └─ Navbar.tsx
│  │  ├─ manager
│  │  │  ├─ bookings
│  │  │  │  └─ bookings-table.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ booking-calendar.tsx
│  │  │  │  ├─ booking-trends.tsx
│  │  │  │  ├─ earnings-chart.tsx
│  │  │  │  ├─ header.tsx
│  │  │  │  ├─ recent-bookings.tsx
│  │  │  │  └─ stats-grid.tsx
│  │  │  └─ venue
│  │  │     ├─ add-court-form.tsx
│  │  │     ├─ add-venue-button.tsx
│  │  │     ├─ court-card.tsx
│  │  │     ├─ courts-by-sport.tsx
│  │  │     ├─ edit-court
│  │  │     │  └─ edit-court-dialog.tsx
│  │  │     ├─ edit-venue
│  │  │     │  └─ make-changes-dialog.tsx
│  │  │     ├─ venue-form.tsx
│  │  │     └─ venues-grid.tsx
│  │  ├─ player
│  │  │  ├─ bookings
│  │  │  │  └─ BookingList.tsx
│  │  │  ├─ profile
│  │  │  │  ├─ edit-profile-modal.tsx
│  │  │  │  └─ UserProfile.tsx
│  │  │  └─ venues
│  │  │     ├─ featured-courts.tsx
│  │  │     ├─ sports-grid.tsx
│  │  │     ├─ venue-booking
│  │  │     │  ├─ booking
│  │  │     │  │  └─ BookingForm.tsx
│  │  │     │  ├─ details
│  │  │     │  │  ├─ amenities-row.tsx
│  │  │     │  │  ├─ court-header.tsx
│  │  │     │  │  ├─ court-main.tsx
│  │  │     │  │  ├─ maps
│  │  │     │  │  │  └─ LeafletMap.tsx
│  │  │     │  │  ├─ more-from-venue.tsx
│  │  │     │  │  ├─ review
│  │  │     │  │  │  └─ LeaveReview.tsx
│  │  │     │  │  ├─ reviews-section.tsx
│  │  │     │  │  └─ venue-description.tsx
│  │  │     │  ├─ filters-sidebar.tsx
│  │  │     │  └─ results-grid.tsx
│  │  │     └─ venues-hero.tsx
│  │  └─ ui
│  │     ├─ alert.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ input-otp.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ radio-group.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ slider.tsx
│  │     ├─ sonner.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     └─ textarea.tsx
│  ├─ generated
│  ├─ hooks
│  │  └─ use-auth.ts
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ cloudinary.ts
│  │  ├─ mailer.ts
│  │  ├─ prisma.ts
│  │  ├─ utils.ts
│  │  └─ validation.ts
│  ├─ middleware.ts
│  └─ utils
│     └─ session-id.ts
└─ tsconfig.json

```