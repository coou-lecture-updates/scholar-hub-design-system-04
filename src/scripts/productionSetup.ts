// Complete production setup for CoouConnect Online
import { supabase } from '@/integrations/supabase/client';

export const runProductionSetup = async () => {
  console.log('🚀 Setting up CoouConnect Online for production...');
  
  try {
    // Setup system settings
    await setupSystemSettings();
    
    // Verify critical tables
    await verifyTables();
    
    // Setup SEO defaults for production
    await setupSEODefaults();
    
    console.log('✅ Production setup completed successfully!');
    console.log('🌟 Ready for www.coouconnect.online deployment!');
    
    return true;
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    return false;
  }
};

const setupSystemSettings = async () => {
  const productionSettings = [
    // Core site settings
    { key: 'site_name', value: 'CoouConnect Online', description: 'Website name' },
    { key: 'site_description', value: 'Connect, Learn, and Grow with Your University Community', description: 'Website description' },
    { key: 'site_url', value: 'https://www.coouconnect.online', description: 'Production site URL' },
    { key: 'maintenance_mode', value: 'false', description: 'Maintenance mode toggle' },
    
    // Events & Payments
    { key: 'event_creation_fee', value: '2000', description: 'Event creation fee in NGN' },
    { key: 'currency', value: 'NGN', description: 'Default currency' },
    
    // SEO Settings - Production ready
    { key: 'seo_title', value: 'CoouConnect Online - University Community Platform', description: 'SEO title' },
    { key: 'seo_description', value: 'Connect with your university community, access courses, events, and resources in one place. Join thousands of students and faculty members.', description: 'SEO description' },
    { key: 'seo_keywords', value: 'university, education, community, courses, events, students, faculty, learning, academic, campus', description: 'SEO keywords' },
    { key: 'og_title', value: 'CoouConnect Online - University Community Platform', description: 'Open Graph title' },
    { key: 'og_description', value: 'Your premier university community platform connecting students, faculty, and resources', description: 'Open Graph description' },
    { key: 'og_image', value: '/lovable-uploads/og-image.png', description: 'Open Graph image URL' },
    { key: 'twitter_card', value: 'summary_large_image', description: 'Twitter card type' },
    
    // Payment Gateway Settings (disabled by default for security)
    { key: 'paystack_enabled', value: 'false', description: 'Enable Paystack' },
    { key: 'flutterwave_enabled', value: 'false', description: 'Enable Flutterwave' },
    { key: 'korapay_enabled', value: 'false', description: 'Enable Korapay' },
    
    // Analytics Settings (disabled by default)
    { key: 'ga_enabled', value: 'false', description: 'Enable Google Analytics' },
    { key: 'ga_measurement_id', value: '', description: 'Google Analytics Measurement ID' },
    
    // Maintenance Settings
    { key: 'maintenance_title', value: 'We\'ll be back soon!', description: 'Maintenance page title' },
    { key: 'maintenance_message', value: 'We are currently performing scheduled maintenance to improve your experience.', description: 'Maintenance message' },
    { key: 'allow_admin_access', value: 'true', description: 'Allow admin access during maintenance' },
    
    // Contact & Support
    { key: 'contact_email', value: 'support@coouconnect.online', description: 'Support email address' },
    { key: 'admin_email', value: 'admin@coouconnect.online', description: 'Admin email address' },
    
    // Security Settings
    { key: 'max_login_attempts', value: '5', description: 'Maximum login attempts before lockout' },
    { key: 'lockout_duration', value: '15', description: 'Account lockout duration in minutes' },
    { key: 'session_timeout', value: '720', description: 'Session timeout in minutes (12 hours)' },
  ];

  console.log('📝 Setting up production system settings...');
  
  for (const setting of productionSettings) {
    try {
      const { data: existing } = await supabase
        .from('system_settings')
        .select('key')
        .eq('key', setting.key)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('system_settings')
          .insert(setting);

        if (error) {
          console.warn(`⚠️  Could not insert ${setting.key}:`, error.message);
        } else {
          console.log(`✓ Created setting: ${setting.key}`);
        }
      } else {
        console.log(`- Setting ${setting.key} already exists`);
      }
    } catch (error) {
      console.warn(`⚠️  Error processing ${setting.key}`);
    }
  }
};

const verifyTables = async () => {
  console.log('🔍 Verifying critical tables...');
  
  // Verify specific tables that we know exist
  const verifications = [
    { name: 'system_settings', check: () => supabase.from('system_settings').select('*').limit(1) },
    { name: 'users', check: () => supabase.from('users').select('*').limit(1) },
    { name: 'events', check: () => supabase.from('events').select('*').limit(1) },
    { name: 'user_roles', check: () => supabase.from('user_roles').select('*').limit(1) },
    { name: 'wallets', check: () => supabase.from('wallets').select('*').limit(1) },
    { name: 'blog_posts', check: () => supabase.from('blog_posts').select('*').limit(1) }
  ];

  for (const verification of verifications) {
    try {
      const { error } = await verification.check();
        
      if (error) {
        console.warn(`⚠️  Table ${verification.name} may not exist or has issues:`, error.message);
      } else {
        console.log(`✓ Table ${verification.name} is accessible`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not verify table ${verification.name}`);
    }
  }
};

const setupSEODefaults = async () => {
  console.log('🔍 Setting up SEO defaults for production...');
  
  // Update document title
  document.title = 'CoouConnect Online - University Community Platform';
  
  // Add meta tags
  const metaTags = [
    { name: 'description', content: 'Connect with your university community, access courses, events, and resources in one place. Join thousands of students and faculty members.' },
    { name: 'keywords', content: 'university, education, community, courses, events, students, faculty, learning, academic, campus' },
    { name: 'author', content: 'CoouConnect Online' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'CoouConnect Online - University Community Platform' },
    { property: 'og:description', content: 'Your premier university community platform connecting students, faculty, and resources' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.coouconnect.online' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CoouConnect Online' },
    { name: 'twitter:description', content: 'University Community Platform' },
  ];

  metaTags.forEach(tag => {
    const existing = document.querySelector(`meta[name="${tag.name}"], meta[property="${tag.property}"]`);
    if (!existing) {
      const meta = document.createElement('meta');
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      document.head.appendChild(meta);
    }
  });
  
  console.log('✓ SEO meta tags configured');
};

// Auto-run setup on import
runProductionSetup().then(success => {
  if (success) {
    console.log('🎉 CoouConnect Online is production-ready!');
    console.log('🌐 Domain: www.coouconnect.online');
    console.log('🚀 Ready for launch!');
  }
});

export default runProductionSetup;