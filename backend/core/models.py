import uuid

from django.db import models
from django.utils.text import slugify


class HeroSlide(models.Model):
    title = models.CharField(max_length=200, blank=True, default='Untitled slide')
    subtitle = models.TextField(blank=True)
    description = models.TextField(blank=True)
    button_text = models.CharField(max_length=100, blank=True, default='Explore')
    button_link = models.CharField(max_length=255, blank=True, default='/home-designs')
    image = models.ImageField(upload_to='hero/', blank=True, null=True)
    mobile_image = models.ImageField(upload_to='hero/mobile/', blank=True, null=True)
    video = models.FileField(
        upload_to='hero/videos/', blank=True, null=True,
        help_text='Compressed MP4 (H.264) recommended. Keep under 8-12 MB for fast loading.',
    )
    poster = models.ImageField(
        upload_to='hero/posters/', blank=True, null=True,
        help_text='Poster image shown instantly while video loads. Highly recommended.',
    )
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'

    def __str__(self):
        return f"{self.order}. {self.title}"


class Inclusion(models.Model):
    CATEGORY_CHOICES = [
        ('kitchen', 'Kitchen'),
        ('bathroom', 'Bathroom'),
        ('electrical', 'Electrical'),
        ('flooring', 'Flooring'),
        ('facade', 'Facade'),
        ('living', 'Living'),
        ('exterior', 'Exterior'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200, blank=True, default='Untitled inclusion')
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    TIER_CHOICES = [
        ('standard', 'Standard'),
        ('signature', 'Signature'),
        ('atelier', 'Atelier'),
    ]
    tier = models.CharField(
        max_length=20,
        choices=TIER_CHOICES,
        default='standard',
        help_text='Collection: Standard · Signature · Atelier',
    )
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='inclusions/', blank=True, null=True)
    pdf = models.FileField(
        upload_to='inclusions/pdfs/', blank=True, null=True,
        help_text='Optional inclusions PDF brochure (downloadable on the site).',
    )
    icon = models.CharField(max_length=100, blank=True, help_text='Lucide icon name or emoji')
    features = models.JSONField(default=list, blank=True, help_text='List of feature strings')
    order = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']
        verbose_name = 'Inclusion'
        verbose_name_plural = 'Inclusions'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published', 'featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = 'Untitled inclusion'
        if not self.slug:
            base = slugify(self.title) or f'inclusion-{uuid.uuid4().hex[:8]}'
            slug = base
            i = 2
            while Inclusion.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{i}'
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=150, blank=True, default='Anonymous')
    role = models.CharField(max_length=150, blank=True, help_text='e.g. Homeowner, Suburb NSW')
    suburb = models.CharField(max_length=150, blank=True)
    design = models.CharField(max_length=150, blank=True, help_text='Design or package name')
    review = models.TextField(blank=True, help_text='Optional if video only')
    rating = models.PositiveSmallIntegerField(default=5)
    photo = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    video = models.FileField(upload_to='testimonials/videos/', blank=True, null=True,
        help_text='Upload mp4 video testimonial')
    video_url = models.URLField(blank=True, help_text='Or YouTube/Vimeo URL')
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-featured', '-created_at']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'

    def __str__(self):
        return f"{self.name} — {self.rating}★"


class SiteSetting(models.Model):
    """Singleton site settings."""
    company_name = models.CharField(max_length=150, default='ReyHomes')
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='settings/', blank=True, null=True)
    footer_logo = models.ImageField(upload_to='settings/', blank=True, null=True)
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    youtube = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.company_name or 'Site Settings'

    def save(self, *args, **kwargs):
        # Enforce singleton
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj



class SearchEvent(models.Model):
    """Lightweight search analytics — query + optional result click."""

    class EventType(models.TextChoices):
        QUERY = "query", "Query"
        CLICK = "click", "Result click"

    event_type = models.CharField(max_length=16, choices=EventType.choices, default=EventType.QUERY)
    query = models.CharField(max_length=200)
    result_type = models.CharField(max_length=32, blank=True, help_text="designs|packages|projects|inclusions")
    result_id = models.CharField(max_length=64, blank=True)
    result_label = models.CharField(max_length=200, blank=True)
    result_count = models.PositiveIntegerField(default=0, help_text="Hits at time of query")
    path = models.CharField(max_length=200, blank=True)
    ip_hash = models.CharField(max_length=64, blank=True, db_index=True)
    user_agent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Search event"
        verbose_name_plural = "Search events"

    def __str__(self):
        return f"{self.event_type}: {self.query[:40]}"
