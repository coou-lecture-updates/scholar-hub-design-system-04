# Paid Events Management Plan

## Overview
This document outlines the plan for implementing paid events creation and management for moderators/admins, and how users will fund their wallets specifically for event participation.

## ✅ Completed Tasks
1. **Wallet UI Relocation**: Moved all wallet components from user dashboard to events page only
2. **Enhanced Event Creation**: Added wallet integration for event creation fees
3. **Basic Event Management**: Admin/moderator event creation system exists

## 🔧 Current Issues Identified

### 1. Event Management - Missing Paid Events UI
**Problem**: The admin event management page (`/admin/events`) doesn't have clear UI to create PAID events with ticket pricing.

**Current State**: 
- Basic event creation form exists
- No clear distinction between free events and paid events
- No ticket pricing interface in the main event management

**Required Fix**:
- Add ticket pricing fields to the main event creation form
- Add "Requires Tickets" toggle
- Add price field with proper validation
- Show wallet balance and creation fee warning for paid events

### 2. Event Creation Flow Issues
**Problem**: The EnhancedEventCreation component has wallet integration but it's not used in the main admin interface.

**Current State**:
- EnhancedEventCreation has 4-step wizard with ticket pricing
- Main EventManagement uses basic form
- Inconsistent interfaces for creating events

**Required Fix**:
- Integrate EnhancedEventCreation into admin event management
- Or enhance the basic form with ticket pricing capabilities
- Ensure consistent user experience

### 3. Moderator Access & Permissions
**Problem**: Need clear definition of who can create paid events and access requirements.

**Required Implementation**:
- Define which roles can create paid events (admin + moderator?)
- Implement wallet balance checks for moderators
- Add proper error handling for insufficient funds

## 📋 Implementation Plan

### Phase 1: Fix Admin Event Management Interface

#### 1.1 Update Event Management Form
- [ ] Add "Event Type" selector (Free Event / Paid Event)
- [ ] Add ticket pricing section that appears when "Paid Event" is selected
- [ ] Include wallet balance display for moderators creating paid events
- [ ] Add event creation fee warning (₦2,000 for paid events)
- [ ] Implement wallet balance validation before event creation

#### 1.2 Integrate Wallet Components
- [ ] Add WalletBalance component to admin event management page
- [ ] Add fund wallet option for moderators with insufficient balance
- [ ] Show real-time wallet updates after funding

### Phase 2: Enhance User Experience

#### 2.1 User Wallet Funding (Events Page Only)
**Current State**: ✅ Already implemented
- Wallet balance display on events page
- "Add Funds to Wallet" button integrated with payment gateways
- Direct link to full wallet management

#### 2.2 Event Purchase Flow
**Current State**: ✅ Already implemented
- EventPaymentDialog for ticket purchases
- Wallet integration for payments
- Payment gateway integration (Flutterwave, KoraPay)

### Phase 3: Backend & Database Enhancements

#### 3.1 Event Creation Logic
**Current State**: ✅ Mostly implemented
- Event creation fee deduction from wallet
- Proper transaction logging
- RLS policies for event access

#### 3.2 Required Database Updates
- [ ] Ensure all paid events have proper `requires_tickets` flag
- [ ] Add event analytics tracking for revenue
- [ ] Implement proper error handling for failed wallet deductions

### Phase 4: UI/UX Improvements

#### 4.1 Admin Dashboard Enhancements
- [ ] Add event revenue analytics
- [ ] Show moderator wallet balances in user management
- [ ] Add event creation fee settings in system settings

#### 4.2 Error Handling & User Feedback
- [ ] Improve error messages for insufficient wallet balance
- [ ] Add success notifications for event creation with fee deduction
- [ ] Implement retry mechanisms for failed transactions

## 🎯 Immediate Next Steps

### Step 1: Fix Admin Event Management UI
File: `src/pages/admin/EventManagement.tsx`
- Replace basic form with enhanced form that includes ticket pricing
- Add wallet balance display
- Add creation fee warnings

### Step 2: Role-Based Access Control
- Ensure moderators can create events with proper wallet checks
- Implement proper error handling for insufficient funds

### Step 3: User Wallet Funding Flow
File: `src/pages/Events.tsx` ✅ Already completed
- Users can only fund wallets from the events page
- Clean separation of wallet functionality

## 🔍 Technical Implementation Details

### Event Creation Fee System
```typescript
// Already implemented in database trigger
const PAID_EVENT_CREATION_FEE = 2000; // ₦2,000
// Automatically deducted when creating paid events
// Logged in wallet_transactions table
```

### Wallet Integration Points
1. **Events Page**: ✅ User wallet funding and balance display
2. **Admin Events**: ❌ Need to add wallet integration for moderators
3. **Event Purchase**: ✅ Wallet-based ticket purchases

### Database Schema Status
- ✅ Events table with pricing fields
- ✅ Wallet and wallet_transactions tables
- ✅ Event creation fee triggers
- ✅ RLS policies for secure access

## 📊 Success Metrics
- [ ] Moderators can create paid events with clear pricing UI
- [ ] Wallet balance validation prevents events creation with insufficient funds
- [ ] Users can fund wallets only from events page
- [ ] Event creation fees are properly deducted and logged
- [ ] Clean separation of wallet functionality from dashboard

## 🚨 Critical Issues to Address
1. **Missing Paid Event UI in Admin**: Primary blocker for moderator event creation
2. **Inconsistent Event Creation Interfaces**: Two different forms exist
3. **Wallet Access Control**: Ensure wallet features only on events page
4. **Error Handling**: Better feedback for wallet-related operations

---

*This plan ensures a complete paid events system where moderators can create revenue-generating events while users manage their wallets exclusively through the events page.*