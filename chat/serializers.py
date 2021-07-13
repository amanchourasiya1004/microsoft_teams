from rest_framework import serializers
from .models import PersonalChats
from usergroups.models import GroupChats


class PersonalChatsSerializer(serializers.ModelSerializer):

    class Meta:
        model = PersonalChats
        fields = ('chat','time','sender','msgtype')

class GroupChatsSerializer(serializers.ModelSerializer):

    class Meta:
        model = GroupChats
        fields = ('chat','time','sender','msgtype')