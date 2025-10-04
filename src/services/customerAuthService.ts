import { splitfinSupabase, splitfinCustomerSupabase } from './splitfinImageService';

// Interface for customer user from your database
export interface CustomerUser {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  linked_customer: string;
  primary_contact: boolean;
  contact_type: 'finance' | 'admin' | 'buyer' | 'manager' | 'warehouse' | 'custom';
  custom_contact_type: string | null;
  is_active: boolean;
  master_user: boolean;
  location_type: 'shipping' | 'billing' | 'custom';
  custom_location: any;
  notes: string | null;
  marketing: boolean;
  is_online: boolean;
  last_login: string | null;
  created_date: string;
  last_modified: string;
  // Joined customer data
  customer?: {
    id: string;
    display_name: string;
    trading_name: string;
    linked_company: string;
    logo_url: string | null;
  };
}

export interface CustomerSignupData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  contactType: 'finance' | 'admin' | 'buyer' | 'manager' | 'warehouse';
}

class CustomerAuthService {
  // Known DM Brands company ID
  private readonly DM_BRANDS_COMPANY_ID = '87dcc6db-2e24-46fb-9a12-7886f690a326';

  // Sign up new customer user
  async signUp(data: CustomerSignupData, password: string): Promise<{ success: boolean; error?: string; needsApproval?: boolean }> {
    try {
      console.log('🔐 Starting customer signup process...');

      // 1. Check if email already exists in customer_users table
      const { data: existingUser } = await splitfinCustomerSupabase
        .from('customer_users')
        .select('email')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }

      // 2. Check if email exists in customers table (existing customer)
      const { data: existingCustomer } = await splitfinCustomerSupabase
        .from('customers')
        .select('id, email, display_name, trading_name')
        .eq('email', data.email)
        .eq('linked_company', this.DM_BRANDS_COMPANY_ID)
        .single();

      const isExistingCustomer = !!existingCustomer;
      console.log(isExistingCustomer ? '🏢 Existing customer found - auto-approving' : '👤 New customer - pending approval');

      // 2. Create auth user in Supabase Auth
      const { data: authData, error: authError } = await splitfinCustomerSupabase.auth.signUp({
        email: data.email,
        password: password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
          data: {
            name: data.name,
            company: data.company
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      console.log('✅ Supabase auth user created:', authData.user.id);
      
      // Auto-confirm email for existing customers using service role
      if (isExistingCustomer && authData.user && !authData.user.email_confirmed_at) {
        try {
          console.log('📧 Auto-confirming email for existing customer...');
          
          // Use admin API to confirm email for existing customers
          const { error: confirmError } = await splitfinSupabase.auth.admin.updateUserById(
            authData.user.id,
            { email_confirm: true }
          );
          
          if (confirmError) {
            console.warn('⚠️ Failed to auto-confirm email:', confirmError);
          } else {
            console.log('✅ Email auto-confirmed for existing customer');
          }
        } catch (confirmErr) {
          console.warn('⚠️ Email confirmation error:', confirmErr);
        }
      }

      // 3. Find or create customer record
      let customerId: string;
      
      if (existingCustomer) {
        // Use the existing customer found by email
        customerId = existingCustomer.id;
        console.log('📋 Using existing customer from email match:', customerId);
      } else {
        // Create new customer record with correct field names
        // Note: created_by requires existing user in users table, using sample customer's created_by for now
        const { data: newCustomer, error: customerError } = await splitfinCustomerSupabase
          .from('customers')
          .insert([{
            display_name: data.company,
            trading_name: data.company,
            linked_company: this.DM_BRANDS_COMPANY_ID,
            email: data.email,
            is_active: false, // Pending approval
            segment: 'New',
            currency_code: 'GBP',
            payment_terms: 30,
            created_by: '5819bb86-5757-47be-8d9a-332709b82be5', // Use DM Brands Manager user ID
            // Required address fields with correct column names
            billing_address_1: 'TBD',
            billing_city_town: 'TBD',
            billing_county: 'TBD', 
            billing_postcode: 'TBD',
            shipping_address_1: 'TBD',
            shipping_city_town: 'TBD',
            shipping_county: 'TBD',
            shipping_postcode: 'TBD'
          }])
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          console.error('❌ Customer creation error:', customerError);
          return { success: false, error: 'Failed to create customer record' };
        }

        customerId = newCustomer.id;
        console.log('✅ New customer created:', customerId);
      }

      // 4. Create customer_user record
      console.log('👤 Creating customer_user record...');
      console.log('📋 Customer user data:', {
        auth_user_id: authData.user.id,
        name: data.name,
        email: data.email,
        linked_customer: customerId,
        is_active: isExistingCustomer
      });
      
      const { error: customerUserError } = await splitfinCustomerSupabase
        .from('customer_users')
        .insert([{
          auth_user_id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          linked_customer: customerId,
          primary_contact: true,
          contact_type: data.contactType,
          is_active: isExistingCustomer, // Auto-approve if existing customer, otherwise pending approval
          master_user: true,
          location_type: 'shipping',
          marketing: false
        }]);

      if (customerUserError) {
        console.error('❌ Customer user creation error:', customerUserError);
        return { success: false, error: 'Failed to create customer user record' };
      }

      console.log('✅ Customer user created successfully');
      
      if (isExistingCustomer) {
        console.log('🎉 Existing customer auto-approved - can access image bank immediately');
        return { success: true, needsApproval: false };
      } else {
        console.log('⏳ New customer pending approval');
        return { success: true, needsApproval: true };
      }

    } catch (error) {
      console.error('❌ Signup process failed:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }

  // Sign in existing customer user
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
    try {
      console.log('🔐 Starting customer signin process...');

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await splitfinCustomerSupabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ Auth signin error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Authentication failed' };
      }

      console.log('✅ Supabase auth successful:', authData.user.id);

      // 2. Get customer user details
      const { data: customerUser, error: customerUserError } = await splitfinCustomerSupabase
        .from('customer_users')
        .select(`
          *,
          customer:customers(
            id,
            display_name,
            trading_name,
            linked_company,
            logo_url
          )
        `)
        .eq('auth_user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (customerUserError || !customerUser) {
        console.error('❌ Customer user lookup error:', customerUserError);
        
        // Check if user exists but is not active
        const { data: inactiveUser } = await splitfinCustomerSupabase
          .from('customer_users')
          .select('is_active')
          .eq('auth_user_id', authData.user.id)
          .single();

        if (inactiveUser && !inactiveUser.is_active) {
          return { success: false, error: 'Account pending approval. Please contact administrator.' };
        }

        return { success: false, error: 'User not found or inactive' };
      }

      // 3. Update last login
      await splitfinCustomerSupabase
        .from('customer_users')
        .update({ 
          last_login: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', customerUser.id);

      console.log('✅ Customer signin successful:', customerUser.name);
      return { success: true, user: customerUser };

    } catch (error) {
      console.error('❌ Signin process failed:', error);
      return { success: false, error: 'Signin failed. Please try again.' };
    }
  }

  // Sign out customer user
  async signOut(): Promise<void> {
    try {
      // Get current user before signing out
      const { data: { user } } = await splitfinCustomerSupabase.auth.getUser();
      
      if (user) {
        // Update online status
        await splitfinCustomerSupabase
          .from('customer_users')
          .update({ is_online: false })
          .eq('auth_user_id', user.id);
      }

      // Sign out from Supabase Auth
      await splitfinCustomerSupabase.auth.signOut();
      console.log('✅ Customer signed out successfully');
    } catch (error) {
      console.error('❌ Signout error:', error);
    }
  }

  // Get current authenticated customer user
  async getCurrentUser(): Promise<CustomerUser | null> {
    try {
      const { data: { user } } = await splitfinCustomerSupabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data: customerUser, error } = await splitfinCustomerSupabase
        .from('customer_users')
        .select(`
          *,
          customer:customers(
            id,
            display_name,
            trading_name,
            linked_company,
            logo_url
          )
        `)
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Get current user error:', error);
        return null;
      }

      return customerUser;
    } catch (error) {
      console.error('❌ Get current user failed:', error);
      return null;
    }
  }

  // Admin: Get all customer users for DM Brands
  async getAllCustomerUsers(): Promise<CustomerUser[]> {
    try {
      const { data: customerUsers, error } = await splitfinSupabase
        .from('customer_users')
        .select(`
          *,
          customer:customers!inner(
            id,
            display_name,
            trading_name,
            linked_company,
            logo_url
          )
        `)
        .eq('customer.linked_company', this.DM_BRANDS_COMPANY_ID)
        .order('created_date', { ascending: false });

      if (error) {
        console.error('❌ Get customer users error:', error);
        return [];
      }

      return customerUsers || [];
    } catch (error) {
      console.error('❌ Get customer users failed:', error);
      return [];
    }
  }

  // Admin: Update customer user status
  async updateCustomerUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await splitfinSupabase
        .from('customer_users')
        .update({ 
          is_active: isActive,
          last_modified: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Update customer user status error:', error);
        return { success: false, error: error.message };
      }

      // Also update the linked customer status
      const { data: customerUser } = await splitfinSupabase
        .from('customer_users')
        .select('linked_customer')
        .eq('id', userId)
        .single();

      if (customerUser) {
        await splitfinSupabase
          .from('customers')
          .update({ is_active: isActive })
          .eq('id', customerUser.linked_customer);
      }

      console.log('✅ Customer user status updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Update customer user status failed:', error);
      return { success: false, error: 'Failed to update status' };
    }
  }

  // Admin: Delete customer user
  async deleteCustomerUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This will cascade delete due to foreign key constraints
      const { error } = await splitfinSupabase
        .from('customer_users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Delete customer user error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Customer user deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Delete customer user failed:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }
}

export const customerAuthService = new CustomerAuthService();
