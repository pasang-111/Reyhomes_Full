from django.contrib import admin
from .models import Project, ProjectGallery, ProjectFeature


class ProjectGalleryInline(admin.TabularInline):
    model = ProjectGallery
    extra = 1
    fields = ('image', 'alt_text', 'order')


class ProjectFeatureInline(admin.TabularInline):
    model = ProjectFeature
    extra = 1
    fields = ('title', 'description', 'image', 'order')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'location', 'category', 'status', 'featured', 'published', 'updated_at')
    list_filter = ('status', 'featured', 'published', 'category')
    search_fields = ('title', 'location', 'description')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('featured', 'published')
    inlines = [ProjectGalleryInline, ProjectFeatureInline]


@admin.register(ProjectGallery)
class ProjectGalleryAdmin(admin.ModelAdmin):
    list_display = ('project', 'alt_text', 'order')


@admin.register(ProjectFeature)
class ProjectFeatureAdmin(admin.ModelAdmin):
    list_display = ('project', 'title', 'order')
