package com.armenu.email.service.impl;

import com.armenu.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendWelcomeEmail(String toEmail, String userName, String restaurantName) {
        String subject = "Welcome to AR Smart Menu!";
        String body = buildWelcomeHtml(userName, restaurantName);
        sendHtmlEmail(toEmail, subject, body);
    }

    @Override
    @Async
    public void sendSubscriptionConfirmationEmail(String toEmail, String userName, String planName) {
        String subject = "Your AR Smart Menu subscription is active";
        String body = buildSubscriptionHtml(userName, planName);
        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            // Email failure must never crash the main flow
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildWelcomeHtml(String userName, String restaurantName) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Inter, sans-serif; background:#0F0F0F; color:#FFFFFF; padding:40px;">
                  <div style="max-width:600px; margin:auto; background:#1A1A1A; border-radius:12px; padding:40px;">
                    <h1 style="color:#2563EB;">Welcome to AR Smart Menu!</h1>
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your restaurant <strong>%s</strong> is now set up on AR Smart Menu.</p>
                    <p>You're currently on a <strong>14-day free trial</strong>. Start by:</p>
                    <ul>
                      <li>Adding menu categories</li>
                      <li>Uploading food items with 3D models (.glb)</li>
                      <li>Generating QR codes for your tables</li>
                    </ul>
                    <a href="http://localhost:5173" style="background:#2563EB; color:#FFF; padding:12px 24px;
                       border-radius:8px; text-decoration:none; display:inline-block; margin-top:20px;">
                      Go to Dashboard
                    </a>
                    <p style="color:#9CA3AF; margin-top:30px; font-size:12px;">
                      AR Smart Menu — The future of restaurant menus.
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(userName, restaurantName);
    }

    private String buildSubscriptionHtml(String userName, String planName) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Inter, sans-serif; background:#0F0F0F; color:#FFFFFF; padding:40px;">
                  <div style="max-width:600px; margin:auto; background:#1A1A1A; border-radius:12px; padding:40px;">
                    <h1 style="color:#10B981;">Subscription Activated!</h1>
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your <strong>%s</strong> plan is now active.</p>
                    <p>You now have access to all features included in your plan.</p>
                    <a href="http://localhost:5173/billing" style="background:#10B981; color:#FFF; padding:12px 24px;
                       border-radius:8px; text-decoration:none; display:inline-block; margin-top:20px;">
                      View Subscription
                    </a>
                    <p style="color:#9CA3AF; margin-top:30px; font-size:12px;">
                      AR Smart Menu — Thank you for your business.
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(userName, planName);
    }
}
