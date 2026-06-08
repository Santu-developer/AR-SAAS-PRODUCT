package com.armenu.subscription.controller;

import com.armenu.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Receives Razorpay webhook events.
 *
 * Configure in Razorpay Dashboard → Webhooks → Add New Webhook:
 *   URL: https://your-domain.com/api/v1/webhooks/razorpay
 *   Events: payment.captured, subscription.activated, subscription.charged,
 *           subscription.cancelled, subscription.expired
 *
 * Razorpay signs every request with HMAC-SHA256 using your webhook secret.
 * The signature arrives in the X-Razorpay-Signature header.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class RazorpayWebhookController {

    private final SubscriptionService subscriptionService;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        // --- Signature verification ---
        if (!isValidSignature(payload, signature)) {
            log.warn("Invalid Razorpay webhook signature");
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // --- Parse event type ---
        String eventType;
        try {
            org.json.JSONObject body = new org.json.JSONObject(payload);
            eventType = body.optString("event", "");
        } catch (Exception e) {
            log.error("Webhook JSON parse error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Parse error");
        }

        log.info("Razorpay webhook event received: {}", eventType);

        try {
            org.json.JSONObject body = new org.json.JSONObject(payload);
            org.json.JSONObject payloadObj = body.optJSONObject("payload");

            switch (eventType) {

                case "payment.captured" -> {
                    // payload.payment.entity contains payment details
                    if (payloadObj != null) {
                        org.json.JSONObject payment = payloadObj
                                .optJSONObject("payment")
                                .optJSONObject("entity");
                        if (payment != null) {
                            String orderId       = payment.optString("order_id");
                            String paymentId     = payment.optString("id");
                            String subscriptionId = payment.optString("subscription_id", null);
                            subscriptionService.handlePaymentCaptured(orderId, paymentId, subscriptionId);
                        }
                    }
                }

                case "subscription.activated", "subscription.charged" -> {
                    if (payloadObj != null) {
                        org.json.JSONObject sub = payloadObj
                                .optJSONObject("subscription")
                                .optJSONObject("entity");
                        if (sub != null) {
                            subscriptionService.handleSubscriptionUpdated(
                                    sub.optString("id"),
                                    sub.optString("status"));
                        }
                    }
                }

                case "subscription.cancelled", "subscription.expired" -> {
                    if (payloadObj != null) {
                        org.json.JSONObject sub = payloadObj
                                .optJSONObject("subscription")
                                .optJSONObject("entity");
                        if (sub != null) {
                            subscriptionService.handleSubscriptionCancelled(sub.optString("id"));
                        }
                    }
                }

                default -> log.debug("Unhandled Razorpay event: {}", eventType);
            }

        } catch (Exception e) {
            log.error("Error processing Razorpay webhook event {}: {}", eventType, e.getMessage());
            // Return 200 so Razorpay does not keep retrying for processing errors
        }

        return ResponseEntity.ok("received");
    }

    /**
     * Razorpay signature = HMAC-SHA256(webhookSecret, rawPayload) in hex.
     */
    private boolean isValidSignature(String payload, String receivedSignature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            // Convert bytes to hex string using JDK — no extra dependency needed
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString().equals(receivedSignature);
        } catch (Exception e) {
            log.error("Signature computation error: {}", e.getMessage());
            return false;
        }
    }
}
