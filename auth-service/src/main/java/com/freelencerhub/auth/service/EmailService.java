package com.freelencerhub.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Password Reset OTP - FreelencerHub");

            String htmlMsg = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" +
                    "<div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>" +
                    "<img src='cid:banner' style='width: 100%; height: auto; display: block;' />" +
                    "<div style='padding: 20px;'>" +
                    "<h2 style='color: #2c3e50;'>Password Reset OTP</h2>" +
                    "<p>Hello,</p>" +
                    "<p>We received a request to reset your password for your <strong>FreelencerHub</strong> account.</p>" +
                    "<div style='background-color: #f4f7f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>" +
                    "<span style='font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3498db;'>" + otp + "</span>" +
                    "</div>" +
                    "<p>This OTP is valid for <strong>10 minutes</strong>.</p>" +
                    "<p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>" +
                    "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />" +
                    "<p style='font-size: 12px; color: #777;'>Best regards,<br/>The FreelencerHub Team</p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlMsg, true);

            // Add the inline image
            helper.addInline("banner", new ClassPathResource("static/images/email_banner.png"));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
