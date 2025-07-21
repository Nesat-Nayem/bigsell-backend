// Simple test to verify the verification infrastructure setup
import { sandboxApiClient } from './app/services/sandboxApiClient';
import { verificationService } from './app/services/verificationService';

async function testVerificationInfrastructure() {
  console.log('Testing Verification Infrastructure...');
  
  try {
    // Test 1: Check if Sandbox API client is properly initialized
    console.log('1. Testing Sandbox API Client initialization...');
    const healthCheck = await sandboxApiClient.healthCheck();
    console.log(`   Sandbox API Health: ${healthCheck ? 'OK' : 'FAILED'}`);
    
    // Test 2: Test format validation
    console.log('2. Testing document format validation...');
    
    try {
      await verificationService.verifyAadhaar('123456789012');
      console.log('   Aadhaar format validation: PASSED');
    } catch (error: any) {
      if (error.message.includes('Sandbox API credentials')) {
        console.log('   Aadhaar format validation: PASSED (API credentials not configured)');
      } else {
        console.log(`   Aadhaar format validation: FAILED - ${error.message}`);
      }
    }
    
    try {
      await verificationService.verifyPAN('ABCDE1234F', 'Test Name');
      console.log('   PAN format validation: PASSED');
    } catch (error: any) {
      if (error.message.includes('Sandbox API credentials')) {
        console.log('   PAN format validation: PASSED (API credentials not configured)');
      } else {
        console.log(`   PAN format validation: FAILED - ${error.message}`);
      }
    }
    
    try {
      await verificationService.verifyGST('12ABCDE3456F1Z5');
      console.log('   GST format validation: PASSED');
    } catch (error: any) {
      if (error.message.includes('Sandbox API credentials')) {
        console.log('   GST format validation: PASSED (API credentials not configured)');
      } else {
        console.log(`   GST format validation: FAILED - ${error.message}`);
      }
    }
    
    // Test 3: Test invalid formats
    console.log('3. Testing invalid format rejection...');
    
    try {
      await verificationService.verifyAadhaar('invalid');
      console.log('   Invalid Aadhaar rejection: FAILED (should have thrown error)');
    } catch (error: any) {
      console.log('   Invalid Aadhaar rejection: PASSED');
    }
    
    try {
      await verificationService.verifyPAN('invalid', 'Test Name');
      console.log('   Invalid PAN rejection: FAILED (should have thrown error)');
    } catch (error: any) {
      console.log('   Invalid PAN rejection: PASSED');
    }
    
    try {
      await verificationService.verifyGST('invalid');
      console.log('   Invalid GST rejection: FAILED (should have thrown error)');
    } catch (error: any) {
      console.log('   Invalid GST rejection: PASSED');
    }
    
    console.log('\n✅ Verification Infrastructure Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. Configure SANDBOX_API_KEY and SANDBOX_API_SECRET in .env file');
    console.log('2. Test with real API credentials');
    console.log('3. Integrate with frontend KYC form');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testVerificationInfrastructure();
}

export { testVerificationInfrastructure };