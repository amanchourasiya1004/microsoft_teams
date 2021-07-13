from django.db import models
from django.contrib.auth.models import User

class Friends(models.Model):
    owner = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'firstfriend')
    friend = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'secondfriend')
    creator=models.CharField(max_length=50,default="-")

    class Meta:
        verbose_name_plural = 'Friends'

class PersonalChats(models.Model):
    friend = models.ForeignKey(Friends, on_delete = models.CASCADE, related_name='txtmsgs')
    chat = models.TextField(default='-')
    time = models.DateTimeField(auto_now_add=True)
    sender = models.CharField(max_length = 20, default='-')
    msgtype = models.IntegerField(default=1)

    class Meta:
        verbose_name_plural = 'PersonalChats'