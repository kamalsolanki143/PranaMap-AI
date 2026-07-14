"""Notification delivery via email, SMS, and push (stubs)."""

from __future__ import annotations

import logging
from typing import Any, Literal

logger = logging.getLogger(__name__)

NotificationChannel = Literal["email", "sms", "push"]


class NotificationService:
    """Send advisories through configured notification channels.

    Currently provides stubs for email (SMTP), SMS (Twilio), and
    push notification (Firebase) integrations.

    Attributes:
        email_from: Sender email address.
        sms_from: Sender phone number.
    """

    def __init__(
        self,
        email_from: str = "advisory@pranamap.ai",
        sms_from: str = "+91-0000000000",
    ) -> None:
        self.email_from = email_from
        self.sms_from = sms_from

    def send_email(
        self,
        to: list[str],
        subject: str,
        body: str,
        html: bool = True,
    ) -> dict[str, Any]:
        """Send email notification.

        Args:
            to: List of recipient email addresses.
            subject: Email subject line.
            body: Email body content.
            html: Whether body is HTML formatted.

        Returns:
            Delivery status dict.
        """
        logger.info("Sending email to %d recipients: %s", len(to), subject)

        for recipient in to:
            logger.debug("  -> %s", recipient)

        return {
            "channel": "email",
            "recipients": len(to),
            "status": "sent",
            "message_id": "stub-email-001",
        }

    def send_sms(
        self,
        to: list[str],
        message: str,
    ) -> dict[str, Any]:
        """Send SMS notification via Twilio.

        Args:
            to: List of recipient phone numbers.
            message: SMS text (max 160 chars recommended).

        Returns:
            Delivery status dict.
        """
        logger.info("Sending SMS to %d recipients", len(to))

        truncated = message[:160] if len(message) > 160 else message

        return {
            "channel": "sms",
            "recipients": len(to),
            "status": "sent",
            "message_length": len(truncated),
            "message_id": "stub-sms-001",
        }

    def send_push(
        self,
        device_tokens: list[str],
        title: str,
        body: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Send push notification via Firebase Cloud Messaging.

        Args:
            device_tokens: List of FCM device tokens.
            title: Notification title.
            body: Notification body.
            data: Optional data payload.

        Returns:
            Delivery status dict.
        """
        logger.info("Sending push notification to %d devices", len(device_tokens))

        return {
            "channel": "push",
            "recipients": len(device_tokens),
            "status": "sent",
            "message_id": "stub-push-001",
        }

    def send_advisory(
        self,
        advisory: dict[str, Any],
        channels: list[NotificationChannel],
        recipients: dict[NotificationChannel, list[str]],
    ) -> dict[str, Any]:
        """Send an advisory through multiple channels.

        Args:
            advisory: Advisory dict with message_en, message_hi, etc.
            channels: List of channels to use.
            recipients: Channel-specific recipient lists.

        Returns:
            Combined delivery report.
        """
        results: dict[str, Any] = {}
        message_en = advisory.get("message_en", "")
        severity = advisory.get("severity", "moderate")
        region = advisory.get("region", "unknown")

        subject = f"[PranaMap] Air Quality Advisory - {region} ({severity.upper()})"

        for channel in channels:
            channel_recipients = recipients.get(channel, [])
            if not channel_recipients:
                results[channel] = {"status": "skipped", "reason": "no recipients"}
                continue

            if channel == "email":
                results[channel] = self.send_email(channel_recipients, subject, message_en)
            elif channel == "sms":
                results[channel] = self.send_sms(channel_recipients, message_en)
            elif channel == "push":
                results[channel] = self.send_push(channel_recipients, subject, message_en)

        return {
            "advisory_region": region,
            "severity": severity,
            "channels_used": channels,
            "delivery_results": results,
        }
