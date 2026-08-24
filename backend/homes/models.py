import uuid

from django.db import models
from django.utils.text import slugify


class HomeDesign(models.Model):
    CATEGORY_CHOICES = [
        ('Single Storey', 'Single Storey'),
        ('Double Storey', 'Double Storey'),
        ('Duplex', 'Duplex'),
    ]

    title = models.CharField(max_length=200, blank=True, default='Untitled design')  # e.g. "The Malaga"
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Single Storey')
    status = models.CharField(max_length=50, blank=True, help_text='Popular, New Release, etc.')
    state = models.CharField(max_length=50, blank=True, default='NSW')
    suburb = models.CharField(max_length=100, blank=True)

    price = models.CharField(max_length=50, blank=True, help_text='Display price e.g. $435,000')
    price_value = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text='Numeric price for filtering/sorting'
    )

    bedrooms = models.PositiveSmallIntegerField(default=4)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=2)
    garage = models.PositiveSmallIntegerField(default=2)
    living = models.PositiveSmallIntegerField(default=1)
    study = models.PositiveSmallIntegerField(default=0)

    house_size = models.CharField(max_length=50, blank=True, help_text='Floor area in m², e.g. 190.04')
    land_size = models.CharField(max_length=50, blank=True, help_text='Land area in m²')
    frontage = models.CharField(max_length=50, blank=True, help_text='Width in metres, e.g. 12.5')
    depth = models.CharField(max_length=50, blank=True, help_text='Depth in metres')
    min_lot_width = models.CharField(max_length=50, blank=True, help_text='Minimum lot width in metres')

    description = models.TextField(blank=True)

    hero_image = models.ImageField(upload_to='designs/hero/', blank=True, null=True)
    floor_plan = models.ImageField(upload_to='designs/floorplans/', blank=True, null=True)

    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)

    related_slugs = models.JSONField(
        default=list, blank=True,
        help_text='DEPRECATED: legacy list of related design slugs. Use related_designs. '
                   'Kept read-only for one release cycle as a fallback.',
    )
    related_designs = models.ManyToManyField(
        'self', blank=True, symmetrical=False, related_name='related_by',
        help_text='Real FK relations replacing related_slugs.',
    )
    inclusion_list = models.JSONField(
        default=list, blank=True,
        help_text='DEPRECATED: legacy inclusion strings. Use inclusions (via DesignInclusion). '
                   'Kept read-only for one release cycle as a fallback.',
    )
    inclusions = models.ManyToManyField(
        'core.Inclusion', through='DesignInclusion', related_name='design_links',
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-featured', 'title']
        verbose_name = 'Home Design'
        verbose_name_plural = 'Home Designs'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published', 'featured']),
            models.Index(fields=['category']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = 'Untitled design'
        if not self.slug:
            base = slugify(self.title.replace('The ', '')) or f'design-{uuid.uuid4().hex[:8]}'
            slug = base
            i = 2
            while HomeDesign.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{i}'
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class HomeDesignGallery(models.Model):
    home_design = models.ForeignKey(
        HomeDesign, related_name='gallery_images', on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='designs/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Design Gallery Image'
        verbose_name_plural = 'Design Gallery Images'

    def __str__(self):
        return f"{self.home_design.title} – Gallery {self.order}"


class HomeDesignFeature(models.Model):
    home_design = models.ForeignKey(
        HomeDesign, related_name='features', on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='designs/features/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Design Feature'
        verbose_name_plural = 'Design Features'

    def __str__(self):
        return f"{self.home_design.title} – {self.title}"


class DesignInclusion(models.Model):
    """Through-model linking a HomeDesign to a real core.Inclusion record."""
    home_design = models.ForeignKey(
        HomeDesign, related_name='inclusion_links', on_delete=models.CASCADE
    )
    inclusion = models.ForeignKey(
        'core.Inclusion', related_name='inclusion_links', on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('home_design', 'inclusion')
        verbose_name = 'Design Inclusion'
        verbose_name_plural = 'Design Inclusions'

    def __str__(self):
        return f"{self.home_design.title} – {self.inclusion.title}"
