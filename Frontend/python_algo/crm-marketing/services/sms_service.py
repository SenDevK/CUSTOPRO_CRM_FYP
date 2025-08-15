import os
import requests
import json

class SMSService:
    def __init__(self, provider, credentials):
        self.provider = provider
        self.credentials = credentials

    def send_sms(self, to_number, content, from_number=None):
        if self.provider == "twilio":
            return self._send_with_twilio(to_number, content, from_number)
        elif self.provider == "dialog":
            return self._send_with_dialog(to_number, content, from_number)
        else:
            raise ValueError(f"Unsupported SMS provider: {self.provider}")

    def _send_with_twilio(self, to_number, content, from_number):
        try:
            account_sid = self.credentials.get("accountSid")
            auth_token = self.credentials.get("authToken")

            if not account_sid or not auth_token:
                raise ValueError("Twilio account SID and auth token are required")

            from_number = from_number or self.credentials.get("from")
            if not from_number:
                raise ValueError("From number is required")

            # Import Twilio SDK
            try:
                from twilio.rest import Client
            except ImportError:
                print("Twilio SDK not installed. Please install it with: pip install twilio")
                return {
                    "success": False,
                    "provider": "twilio",
                    "error": "Twilio SDK not installed"
                }

            # Create Twilio client
            client = Client(account_sid, auth_token)

            # Send the message
            message = client.messages.create(
                body=content,
                from_=from_number,
                to=to_number
            )

            return {
                "success": True,
                "provider": "twilio",
                "message_sid": message.sid,
                "status": message.status
            }
        except Exception as e:
            print(f"Error sending SMS with Twilio: {e}")
            return {
                "success": False,
                "provider": "twilio",
                "error": str(e)
            }

    def _send_with_dialog(self, to_number, content, from_number):
        try:
            api_key = self.credentials.get("apiKey")
            if not api_key:
                raise ValueError("Dialog API key is required")

            sender_id = from_number or self.credentials.get("from") or "LankaCRM"

            # Dialog API endpoint (this is a placeholder - actual endpoint will be different)
            url = "https://api.dialog.lk/sms/send"

            # Dialog API request (this is a placeholder - actual request format will be different)
            payload = {
                "apikey": api_key,
                "sender": sender_id,
                "recipient": to_number,
                "message": content
            }

            # Make the request to Dialog API
            headers = {
                "Content-Type": "application/json"
            }

            response = requests.post(url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()

            return {
                "success": True,
                "provider": "dialog",
                "status": "sent"  # Placeholder - actual response will be different
            }
        except Exception as e:
            print(f"Error sending SMS with Dialog: {e}")
            return {
                "success": False,
                "provider": "dialog",
                "error": str(e)
            }
