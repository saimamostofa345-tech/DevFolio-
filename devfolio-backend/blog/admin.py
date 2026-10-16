from django.contrib import admin
from .models import Category, Comment, Post, PostLike, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "status",
        "published_at",
        "views_count",
        "reading_time",
        "is_featured",
    )
    list_filter = ("status", "category", "is_featured", "created_at", "published_at")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    readonly_fields = ("published_at", "views_count", "reading_time", "created_at", "updated_at")
    list_editable = ("status", "is_featured")


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ("post", "visitor_id", "ip_address", "created_at")
    search_fields = ("post__title", "visitor_id", "ip_address")
    readonly_fields = ("created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("name", "post", "email", "is_approved", "parent", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("name", "email", "content", "post__title")
    list_editable = ("is_approved",)
    actions = ["approve_comments", "unapprove_comments"]

    @admin.action(description="Approve selected comments")
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description="Unapprove selected comments")
    def unapprove_comments(self, request, queryset):
        queryset.update(is_approved=False)