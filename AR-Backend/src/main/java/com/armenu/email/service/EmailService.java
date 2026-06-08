package com.armenu.email.service;

public interface EmailService {

    void sendWelcomeEmail(String toEmail, String userName, String restaurantName);

    void sendSubscriptionConfirmationEmail(String toEmail, String userName, String planName);
}
