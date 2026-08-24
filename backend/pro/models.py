from django.conf import settings
from django.db import models


class Contract(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent to client"),
        ("signed", "Signed"),
        ("active", "Active build"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contracts",
    )
    title = models.CharField(max_length=200)
    home_design = models.ForeignKey(
        "homes.HomeDesign",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="contracts",
    )
    land_package = models.ForeignKey(
        "land.HomeLandPackage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="contracts",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    contract_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    signed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class BuildProject(models.Model):
    STAGE_CHOICES = [
        ("planning", "Planning & Approvals"),
        ("foundation", "Foundation"),
        ("frame", "Frame"),
        ("lockup", "Lock-up"),
        ("fixing", "Fixing"),
        ("completion", "Completion"),
        ("handover", "Handover"),
    ]

    contract = models.OneToOneField(
        Contract,
        on_delete=models.CASCADE,
        related_name="build",
    )
    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="planning")
    site_address = models.CharField(max_length=300, blank=True)
    start_date = models.DateField(null=True, blank=True)
    estimated_completion = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Build project"
        verbose_name_plural = "Build projects"

    def __str__(self):
        return f"Build: {self.contract.title}"


class Milestone(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In progress"),
        ("completed", "Completed"),
    ]

    build = models.ForeignKey(
        BuildProject,
        on_delete=models.CASCADE,
        related_name="milestones",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    order = models.PositiveIntegerField(default=0)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class MessageThread(models.Model):
    build = models.ForeignKey(
        BuildProject,
        on_delete=models.CASCADE,
        related_name="threads",
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_threads",
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="agent_threads",
        limit_choices_to={"is_staff": True},
    )
    subject = models.CharField(max_length=200, default="Build enquiry")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.subject


class Message(models.Model):
    thread = models.ForeignKey(
        MessageThread,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    body = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.email}: {self.body[:40]}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ("milestone", "Milestone update"),
        ("message", "New message"),
        ("contract", "Contract update"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="system")
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ClientInclusion(models.Model):
    CATEGORY_CHOICES = [
        ("kitchen", "Kitchen"),
        ("bathroom", "Bathroom"),
        ("electrical", "Electrical"),
        ("flooring", "Flooring"),
        ("facade", "Facade"),
        ("living", "Living"),
        ("exterior", "Exterior"),
        ("other", "Other"),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="custom_inclusions",
    )
    build = models.ForeignKey(
        BuildProject,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="custom_inclusions",
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    selected = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "title"]

    def __str__(self):
        return self.title
