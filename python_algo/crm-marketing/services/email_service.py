import os
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import json

class EmailService:
    def __init__(self, provider, credentials):
        self.provider = provider
        self.credentials = credentials

    def send_email(self, to_email, subject, content, from_email=None):
        if self.provider == "sendgrid":
            return self._send_with_sendgrid(to_email, subject, content, from_email)
        elif self.provider == "mailchimp":
            return self._send_with_mailchimp(to_email, subject, content, from_email)
        elif self.provider == "smtp":
            return self._send_with_smtp(to_email, subject, content, from_email)
        else:
            raise ValueError(f"Unsupported email provider: {self.provider}")

    def _send_with_sendgrid(self, to_email, subject, content, from_email):
        try:
            api_key = self.credentials.get("apiKey")
            if not api_key:
                raise ValueError("SendGrid API key is required")

            from_email = from_email or self.credentials.get("from") or "noreply@lankasmartcrm.com"

            # Import SendGrid SDK
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
            except ImportError:
                print("SendGrid SDK not installed. Please install it with: pip install sendgrid")
                return {
                    "success": False,
                    "provider": "sendgrid",
                    "error": "SendGrid SDK not installed"
                }

            # Create a SendGrid message
            message = Mail(
                from_email=from_email,
                to_emails=to_email,
                subject=subject,
                html_content=content
            )

            # Send the email using the SendGrid SDK
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)

            return {
                "success": True,
                "provider": "sendgrid",
                "status_code": response.status_code
            }
        except Exception as e:
            print(f"Error sending email with SendGrid: {e}")
            return {
                "success": False,
                "provider": "sendgrid",
                "error": str(e)
            }

    def _send_with_mailchimp(self, to_email, subject, content, from_email):
        try:
            api_key = self.credentials.get("apiKey")
            if not api_key:
                raise ValueError("Mailchimp API key is required")

            from_email = from_email or self.credentials.get("from") or "noreply@lankasmartcrm.com"

            # This is a simplified implementation - actual Mailchimp integration would be more complex
            # Mailchimp uses a different API structure for transactional emails (Mandrill)

            return {
                "success": True,
                "provider": "mailchimp",
                "message": "Mailchimp integration is a placeholder"
            }
        except Exception as e:
            print(f"Error sending email with Mailchimp: {e}")
            return {
                "success": False,
                "provider": "mailchimp",
                "error": str(e)
            }

    def _send_with_smtp(self, to_email, subject, content, from_email):
        try:
            smtp_server = self.credentials.get("server")
            smtp_port = self.credentials.get("port", 587)
            smtp_username = self.credentials.get("username")
            smtp_password = self.credentials.get("password")

            if not all([smtp_server, smtp_username, smtp_password]):
                raise ValueError("SMTP server, username, and password are required")

            from_email = from_email or self.credentials.get("from") or smtp_username

            # Create a multipart message
            msg = MIMEMultipart()
            msg["From"] = from_email
            msg["To"] = to_email
            msg["Subject"] = subject

            # Add HTML content
            msg.attach(MIMEText(content, "html"))

            # Connect to the SMTP server
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()  # Secure the connection
            server.login(smtp_username, smtp_password)

            # Send the email
            server.send_message(msg)
            server.quit()

            return {
                "success": True,
                "provider": "smtp"
            }
        except Exception as e:
            print(f"Error sending email with SMTP: {e}")
            return {
                "success": False,
                "provider": "smtp",
                "error": str(e)
            }
