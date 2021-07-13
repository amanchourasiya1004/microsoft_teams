from django.db import models
from django.contrib.auth.models import User

class Groups(models.Model):
    groupname = models.TextField(default='-')
    identity = models.CharField(max_length=50, default='-')
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creator')
    timeCreation = models.DateTimeField(auto_now_add=True)
    num = models.IntegerField(default=0)
    description = models.CharField(max_length = 50, default='-')
    background=models.CharField(max_length=20,default='rgb(52,28,62)')
    font=models.CharField(max_length=20,default='rgb(255,255,255)')

    class Meta:
        verbose_name_plural = 'Groups'

class GroupUsers(models.Model):
    group = models.ForeignKey(Groups, on_delete=models.CASCADE, related_name = 'groupusers')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = 'groupenrolled')

    class Meta:
        verbose_name_plural = 'UserGroups'

class GroupChats(models.Model):
    sender = models.CharField(max_length = 20, default='-')
    group = models.ForeignKey(Groups, on_delete=models.CASCADE, related_name='chats')
    chat = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    msgtype = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'GroupChats'