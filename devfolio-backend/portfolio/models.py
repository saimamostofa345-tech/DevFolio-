import uuid
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


class Profile(models.Model):
    """
    Singleton Profile model representing the single owner (Saima Mostofa Moni).
    Complies with DevFolio requirement B-2.
    """

    full_name = models.CharField(
        max_length=150,
        default="Saima Mostofa Moni",
    )
    headline = models.CharField(
        max_length=200,
        default="Full-Stack Developer & UI/UX Designer",
    )
    bio = models.TextField(
        default=(
            "I build intuitive, high-performance web applications and design "
            "delightful user experiences. Passionate about Python, Django, "
            "React, Figma design systems, and building products that make a real impact."
        )
    )
    email = models.EmailField(
        blank=True,
        default="saimamostofa345@gmail.com",
    )
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=150, default="Dhaka, Bangladesh")
    avatar = models.ImageField(
        upload_to="profile/",
        blank=True,
        null=True,
    )
    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True,
    )
    github_url = models.URLField(
        blank=True,
        default="https://github.com/saimamostofa345-tech",
    )
    linkedin_url = models.URLField(
        blank=True,
        default="https://www.linkedin.com/in/saima-mostofa",
    )
    x_url = models.URLField(blank=True)
    website_url = models.URLField(
        blank=True,
        default="https://www.behance.net/saimakhan28",
    )
    years_of_experience = models.PositiveIntegerField(default=2)
    is_available_for_hire = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Enforce exactly one row (singleton)
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        profile, _ = cls.objects.get_or_create(pk=1)
        return profile

    def __str__(self):
        return self.full_name


class Skill(models.Model):
    """
    Skills categorized with proficiency level (1-100).
    Complies with DevFolio requirement B-3.
    """

    class Category(models.TextChoices):
        FRONTEND = "FRONTEND", "Frontend"
        BACKEND = "BACKEND", "Backend"
        DATABASE = "DATABASE", "Database"
        DEVOPS = "DEVOPS", "DevOps"
        TOOLS = "TOOLS", "Tools & Design"
        SOFT_SKILL = "SOFT_SKILL", "Soft Skill"

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.FRONTEND,
    )
    proficiency = models.PositiveIntegerField(
        help_text="Proficiency score from 1 to 100",
        default=85,
    )
    icon = models.CharField(
        max_length=100,
        blank=True,
        help_text="Icon identifier or name",
    )
    display_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "-proficiency", "name"]

    def clean(self):
        if not (1 <= self.proficiency <= 100):
            raise ValidationError(
                {"proficiency": "Proficiency must be between 1 and 100."}
            )

    def __str__(self):
        return f"{self.name} ({self.proficiency}%)"


class Experience(models.Model):
    """
    Work experience entries.
    Complies with DevFolio requirement B-4.
    """

    class EmploymentType(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Full Time"
        PART_TIME = "PART_TIME", "Part Time"
        INTERNSHIP = "INTERNSHIP", "Internship"
        FREELANCE = "FREELANCE", "Freelance"
        CONTRACT = "CONTRACT", "Contract"

    company = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    employment_type = models.CharField(
        max_length=30,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME,
    )
    location = models.CharField(max_length=150, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    company_url = models.URLField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date", "display_order"]

    def __str__(self):
        return f"{self.role} at {self.company}"


class Education(models.Model):
    """
    Academic credentials.
    Complies with DevFolio requirement B-5.
    """

    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=150, blank=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_year"]

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Project(models.Model):
    """
    Portfolio projects showcasing full-stack & UI/UX work.
    Complies with DevFolio requirement B-6.
    """

    class Category(models.TextChoices):
        WEB = "WEB", "Web Application"
        MOBILE = "MOBILE", "Mobile App"
        API = "API", "API / Backend"
        ML = "ML", "Machine Learning / AI"
        OTHER = "OTHER", "UI/UX & Product Design"

    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    summary = models.CharField(max_length=200)
    description = models.TextField()
    cover_image = models.ImageField(
        upload_to="projects/",
        blank=True,
        null=True,
    )
    tech_stack = models.ManyToManyField(
        Skill,
        blank=True,
        related_name="projects",
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.WEB,
    )
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    completed_date = models.DateField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "display_order", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or str(uuid.uuid4())[:8]
            candidate = base_slug
            number = 1
            while Project.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{number}"
                number += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    """
    Inbound contact inquiries from public visitors.
    Complies with DevFolio requirement B-12.
    """

    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} - {self.name}"