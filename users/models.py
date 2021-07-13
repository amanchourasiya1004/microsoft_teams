from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class UserDetails(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name='details')
    dob=models.DateField(null=True)
    updated=models.IntegerField(default=0)
    background=models.CharField(max_length=20,default='rgb(52,28,62)')
    font=models.CharField(max_length=20,default='rgb(255,255,255)')

    class Meta:
        verbose_name_plural = 'UserDetails'