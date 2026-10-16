from datetime import date
from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import ContactMessage, Education, Experience, Profile, Project, Skill


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for singleton profile.
    Complies with B-2, B-21, B-23.
    """

    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "headline",
            "bio",
            "email",
            "phone",
            "location",
            "avatar",
            "resume",
            "github_url",
            "linkedin_url",
            "x_url",
            "website_url",
            "years_of_experience",
            "is_available_for_hire",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_avatar(self, value):
        if value:
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError("Avatar image cannot exceed 2 MB.")
            ext = value.name.split(".")[-1].lower()
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError(
                    "Only .jpg, .jpeg, .png, and .webp formats are allowed for avatars."
                )
        return value

    def validate_resume(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Resume PDF cannot exceed 5 MB.")
            ext = value.name.split(".")[-1].lower()
            if ext != "pdf":
                raise serializers.ValidationError("Resume file must be a PDF document.")
        return value


class SkillSerializer(serializers.ModelSerializer):
    """
    Serializer for skills with proficiency validation.
    Complies with B-3, B-21.
    """

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "category",
            "proficiency",
            "icon",
            "display_order",
            "is_featured",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_proficiency(self, value):
        if not (1 <= value <= 100):
            raise serializers.ValidationError(
                "Proficiency must be between 1 and 100."
            )
        return value


class ExperienceSerializer(serializers.ModelSerializer):
    """
    Serializer for work experience with strict date constraints.
    Complies with B-4, B-21.
    """

    class Meta:
        model = Experience
        fields = [
            "id",
            "company",
            "role",
            "employment_type",
            "location",
            "start_date",
            "end_date",
            "is_current",
            "description",
            "company_url",
            "display_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        start_date = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None),
        )
        end_date = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None),
        )
        is_current = attrs.get(
            "is_current",
            getattr(self.instance, "is_current", False),
        )

        today = date.today()
        if start_date and start_date > today:
            raise serializers.ValidationError(
                {"start_date": "Start date cannot be in the future."}
            )

        if is_current:
            attrs["end_date"] = None
        else:
            if not end_date:
                raise serializers.ValidationError(
                    {"end_date": "End date is required when not currently employed."}
                )
            if start_date and end_date and end_date < start_date:
                raise serializers.ValidationError(
                    {"end_date": "End date must be after start date."}
                )

        return attrs


class EducationSerializer(serializers.ModelSerializer):
    """
    Serializer for academic credentials.
    Complies with B-5.
    """

    class Meta:
        model = Education
        fields = [
            "id",
            "institution",
            "degree",
            "field_of_study",
            "start_year",
            "end_year",
            "grade",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        start_year = attrs.get(
            "start_year",
            getattr(self.instance, "start_year", None),
        )
        end_year = attrs.get(
            "end_year",
            getattr(self.instance, "end_year", None),
        )
        if start_year and end_year and end_year < start_year:
            raise serializers.ValidationError(
                {"end_year": "End year cannot be before start year."}
            )
        return attrs


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for projects. Validates live/github URL and image limits.
    Complies with B-6, B-21.
    """

    tech_stack_detail = SkillSerializer(
        source="tech_stack",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "cover_image",
            "tech_stack",
            "tech_stack_detail",
            "category",
            "live_url",
            "github_url",
            "is_featured",
            "completed_date",
            "display_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def validate_cover_image(self, value):
        if value:
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Cover image cannot exceed 2 MB."
                )
            ext = value.name.split(".")[-1].lower()
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError(
                    "Only .jpg, .jpeg, .png, and .webp formats are allowed."
                )
        return value

    def validate(self, attrs):
        live_url = attrs.get(
            "live_url",
            getattr(self.instance, "live_url", ""),
        )
        github_url = attrs.get(
            "github_url",
            getattr(self.instance, "github_url", ""),
        )

        if not live_url and not github_url:
            raise serializers.ValidationError(
                "At least one of live_url or github_url must be provided."
            )
        return attrs


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for public contact inquiries.
    Complies with B-12, B-21.
    """

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_message(self, value):
        text = value.strip()
        if not (10 <= len(text) <= 2000):
            raise serializers.ValidationError(
                "Message must be between 10 and 2000 characters."
            )
        return text


class OwnerLoginSerializer(serializers.Serializer):
    """
    Strict owner authentication. Rejects non-superusers with 401.
    Does not reveal whether username exists (B-14).
    """

    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        request = self.context.get("request")
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            request=request,
            username=username,
            password=password,
        )

        if not user or not user.is_active or not user.is_superuser:
            raise serializers.ValidationError(
                "Invalid credentials.",
                code="authentication_failed",
            )

        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Owner password update.
    """

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "New password must be at least 8 characters long."
            )
        return value