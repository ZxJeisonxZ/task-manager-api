from django.db import models
from django.core.exceptions import ValidationError

class Task(models.Model):
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    status = models.CharField(
        max_length=20,
        choices=[
            ('pendiente', 'Pendiente'),
            ('completada', 'Completada'),
        ],
        default='pendiente',
        verbose_name="Estado"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def clean(self):
        """Validación: título no debe estar vacío"""
        if not self.title or self.title.strip() == '':
            raise ValidationError({'title': 'El título no puede estar vacío'})
    
    def save(self, *args, **kwargs):
        """Asegurar validaciones antes de guardar"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
