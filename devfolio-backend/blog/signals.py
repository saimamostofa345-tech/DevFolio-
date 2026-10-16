import logging
from django.core.mail import send_mail
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Comment, Post

logger = logging.getLogger("devfolio.blog")


@receiver(post_save, sender=Comment)
def notify_on_new_comment(sender, instance, created, **kwargs):
    """
    Signal B-20: Sends a notification email via console email backend
    when a new comment is submitted and awaiting moderation.
    """
    if created and not instance.is_approved:
        subject = f"[DevFolio] New comment awaiting approval on '{instance.post.title}'"
        message = (
            f"A new comment was submitted by {instance.name} ({instance.email}):\n\n"
            f'"{instance.content}"\n\n'
            f"Please log in to your DevFolio dashboard to approve or delete this comment."
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email="no-reply@devfolio.local",
                recipient_list=["saimamostofa345@gmail.com"],
                fail_silently=True,
            )
            print(f"[Signal] Sent comment approval notification for post: {instance.post.title}")
        except Exception as e:
            logger.warning(f"Failed to send comment notification email: {e}")


@receiver(post_delete, sender=Post)
def cleanup_post_cover_image(sender, instance, **kwargs):
    """
    Signal B-20: Cleans up post cover image file from disk upon post deletion.
    """
    if instance.cover_image:
        try:
            instance.cover_image.delete(save=False)
            print(f"[Signal] Deleted cover image for deleted post '{instance.title}'")
        except Exception as e:
            logger.warning(f"Failed to delete cover image: {e}")
