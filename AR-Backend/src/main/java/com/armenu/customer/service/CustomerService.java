package com.armenu.customer.service;

import com.armenu.customer.dto.CustomerAuthResponse;
import com.armenu.customer.dto.SendOtpRequest;
import com.armenu.customer.dto.VerifyOtpRequest;

public interface CustomerService {

    /** Generate and send (log in dev) a 6-digit OTP for the given phone */
    void sendOtp(SendOtpRequest request);

    /** Verify OTP, create customer if first visit, return access token */
    CustomerAuthResponse verifyOtp(VerifyOtpRequest request);
}
