from django.db import models
from django.utils.text import slugify


class Project(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('under_construction', 'Under Construction'),
        ('upcoming', 'Upcoming'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    location = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='completed')
    description = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='projects/hero/', blank=True, null=True)
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-featured', '-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published', 'featured']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectGallery(models.Model):
    project = models.ForeignKey(
        Project, related_name='gallery_images', on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='projects/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Project Gallery Image'
        verbose_name_plural = 'Project Gallery Images'

    def __str__(self):
        return f"{self.project.title} – Gallery {self.order}"


class ProjectFeature(models.Model):
    project = models.ForeignKey(
        Project, related_name='features', on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='projects/features/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Project Feature'
        verbose_name_plural = 'Project Features'

    def __str__(self):
        return f"{self.project.title} – {self.title}"
