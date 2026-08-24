import uuid

from django.db import models
from django.utils.text import slugify


class Estate(models.Model):
    name = models.CharField(max_length=150, blank=True, default='Untitled estate')
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    suburb = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True, default='NSW')
    description = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='estates/', blank=True, null=True)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Estate'
        verbose_name_plural = 'Estates'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published']),
        ]

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = 'Untitled estate'
        if not self.slug:
            base = slugify(self.name) or f'estate-{uuid.uuid4().hex[:8]}'
            slug = base
            i = 2
            while Estate.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{i}'
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class HomeLandPackage(models.Model):
    CATEGORY_CHOICES = [
        ('House & Land', 'House & Land'),
        ('Display Home', 'Display Home'),
        ('Land Only', 'Land Only'),
    ]

    title = models.CharField(max_length=200, blank=True, default='Untitled package')
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    estate = models.ForeignKey(
        Estate, related_name='packages', on_delete=models.SET_NULL,
        null=True, blank=True
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='House & Land')
    state = models.CharField(max_length=50, blank=True, default='NSW')
    suburb = models.CharField(max_length=100, blank=True)

    price = models.CharField(max_length=50, blank=True)
    price_value = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    bedrooms = models.PositiveSmallIntegerField(default=4)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=2)
    garage = models.PositiveSmallIntegerField(default=2)

    land_size = models.CharField(max_length=50, blank=True)
    house_size = models.CharField(max_length=50, blank=True)
    frontage = models.CharField(max_length=50, blank=True)
    depth = models.CharField(max_length=50, blank=True)

    description = models.TextField(blank=True)

    hero_image = models.ImageField(upload_to='packages/hero/', blank=True, null=True)
    floor_plan = models.ImageField(upload_to='packages/floorplans/', blank=True, null=True)

    badge = models.CharField(max_length=50, blank=True, help_text='Popular, New Release, etc.')
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=True)

    inclusion_list = models.JSONField(
        default=list, blank=True,
        help_text='DEPRECATED: legacy inclusion strings. Use inclusions (via PackageInclusion). '
                   'Kept read-only for one release cycle as a fallback.',
    )
    inclusions = models.ManyToManyField(
        'core.Inclusion', through='PackageInclusion', related_name='package_links',
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-featured', 'title']
        verbose_name = 'Home & Land Package'
        verbose_name_plural = 'Home & Land Packages'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published', 'featured']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = 'Untitled package'
        if not self.slug:
            base = slugify(self.title) or f'package-{uuid.uuid4().hex[:8]}'
            slug = base
            i = 2
            while HomeLandPackage.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{i}'
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PackageGallery(models.Model):
    package = models.ForeignKey(
        HomeLandPackage, related_name='gallery_images', on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='packages/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Package Gallery Image'
        verbose_name_plural = 'Package Gallery Images'

    def __str__(self):
        return f"{self.package.title} – Gallery {self.order}"


class PackageFeature(models.Model):
    package = models.ForeignKey(
        HomeLandPackage, related_name='features', on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='packages/features/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Package Feature'
        verbose_name_plural = 'Package Features'

    def __str__(self):
        return f"{self.package.title} – {self.title}"


class PackageInclusion(models.Model):
    """Through-model linking a HomeLandPackage to a real core.Inclusion record."""
    package = models.ForeignKey(
        HomeLandPackage, related_name='inclusion_links', on_delete=models.CASCADE
    )
    inclusion = models.ForeignKey(
        'core.Inclusion', related_name='package_inclusion_links', on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('package', 'inclusion')
        verbose_name = 'Package Inclusion'
        verbose_name_plural = 'Package Inclusions'

    def __str__(self):
        return f"{self.package.title} – {self.inclusion.title}"
