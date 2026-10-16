from django.contrib import admin
from .models import ContactMessage, Education, Experience, Profile, Project, Skill


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "headline", "email", "years_of_experience", "is_available_for_hire")
    search_fields = ("full_name", "headline", "bio", "email")

    def has_add_permission(self, request):
        # Singleton: allow adding only if no instance exists yet
        if Profile.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "proficiency", "display_order", "is_featured")
    list_filter = ("category", "is_featured")
    search_fields = ("name",)
    list_editable = ("display_order", "is_featured")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("role", "company", "employment_type", "start_date", "end_date", "is_current", "display_order")
    list_filter = ("employment_type", "is_current", "start_date")
    search_fields = ("role", "company", "description")
    list_editable = ("display_order",)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("degree", "institution", "field_of_study", "start_year", "end_year")
    list_filter = ("start_year", "end_year")
    search_fields = ("degree", "institution", "field_of_study")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_featured", "completed_date", "display_order")
    list_filter = ("category", "is_featured", "completed_date")
    search_fields = ("title", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tech_stack",)
    list_editable = ("is_featured", "display_order")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("subject", "name", "email", "message")
    readonly_fields = ("created_at",)
    list_editable = ("is_read",)